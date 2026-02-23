"""
LLM Provider Abstraction Layer
-------------------------------
Wraps OpenAI-compatible chat-completion APIs (Groq, OpenAI, Mistral, etc.)
with retry logic, timeout handling, and structured error reporting.
"""

from __future__ import annotations

import os
import asyncio
import logging
from dataclasses import dataclass
from typing import List, Dict, Optional

import httpx

logger = logging.getLogger("samaan.llm")

# ---------------------------------------------------------------------------
# Configuration (read once at import time, overridable via env)
# ---------------------------------------------------------------------------
LLM_API_KEY: str = os.getenv("LLM_API_KEY", "")
LLM_BASE_URL: str = os.getenv("LLM_BASE_URL", "https://api.groq.com/openai/v1")
LLM_MODEL: str = os.getenv("LLM_MODEL", "mixtral-8x7b-32768")
LLM_TIMEOUT: float = float(os.getenv("LLM_TIMEOUT", "30"))
LLM_MAX_RETRIES: int = int(os.getenv("LLM_MAX_RETRIES", "3"))


# ---------------------------------------------------------------------------
# Error types
# ---------------------------------------------------------------------------
class LLMError(Exception):
    """Base error for LLM operations."""

    def __init__(self, message: str, status_code: int = 500):
        super().__init__(message)
        self.status_code = status_code


class LLMConfigError(LLMError):
    """Raised when the LLM is not configured (missing API key)."""

    def __init__(self) -> None:
        super().__init__(
            "LLM service is not configured. Set LLM_API_KEY in your environment.",
            status_code=503,
        )


class LLMRateLimitError(LLMError):
    """Raised when the provider reports rate-limiting."""

    def __init__(self) -> None:
        super().__init__(
            "LLM rate limit exceeded. Please try again in a few seconds.",
            status_code=429,
        )


class LLMTimeoutError(LLMError):
    """Raised when the request times out."""

    def __init__(self) -> None:
        super().__init__(
            "LLM request timed out. Please try again.",
            status_code=504,
        )


# ---------------------------------------------------------------------------
# Provider
# ---------------------------------------------------------------------------
@dataclass
class LLMResponse:
    """Structured response from the LLM provider."""
    content: str
    model: str
    usage: Optional[Dict] = None


async def chat_completion(
    messages: List[Dict[str, str]],
    *,
    temperature: float = 0.3,
    max_tokens: int = 1024,
    api_key: Optional[str] = None,
    base_url: Optional[str] = None,
    model: Optional[str] = None,
) -> LLMResponse:
    """
    Call an OpenAI-compatible chat/completions endpoint.

    Retries up to ``LLM_MAX_RETRIES`` times with exponential back-off on
    transient errors (429, 500, 502, 503, 504).
    """
    key = api_key or LLM_API_KEY
    url = base_url or LLM_BASE_URL
    mdl = model or LLM_MODEL

    if not key:
        raise LLMConfigError()

    headers = {
        "Authorization": f"Bearer {key}",
        "Content-Type": "application/json",
    }
    payload = {
        "model": mdl,
        "messages": messages,
        "temperature": temperature,
        "max_tokens": max_tokens,
    }

    last_error: Optional[Exception] = None

    for attempt in range(1, LLM_MAX_RETRIES + 1):
        try:
            async with httpx.AsyncClient(timeout=LLM_TIMEOUT) as client:
                resp = await client.post(
                    f"{url}/chat/completions",
                    headers=headers,
                    json=payload,
                )

                if resp.status_code == 429:
                    raise LLMRateLimitError()

                resp.raise_for_status()
                data = resp.json()

                content = data["choices"][0]["message"]["content"].strip()
                usage = data.get("usage")

                logger.info(
                    "LLM call succeeded | model=%s attempt=%d tokens=%s",
                    mdl, attempt, usage,
                )

                return LLMResponse(content=content, model=mdl, usage=usage)

        except (httpx.TimeoutException, httpx.ConnectError) as exc:
            last_error = exc
            logger.warning(
                "LLM timeout/connect error (attempt %d/%d): %s",
                attempt, LLM_MAX_RETRIES, exc,
            )
        except LLMRateLimitError:
            last_error = LLMRateLimitError()
            logger.warning(
                "LLM rate limited (attempt %d/%d)", attempt, LLM_MAX_RETRIES,
            )
        except httpx.HTTPStatusError as exc:
            status = exc.response.status_code
            if status in (500, 502, 503, 504):
                last_error = exc
                logger.warning(
                    "LLM server error %d (attempt %d/%d)",
                    status, attempt, LLM_MAX_RETRIES,
                )
            else:
                body = exc.response.text[:300]
                logger.error("LLM non-retryable error %d: %s", status, body)
                raise LLMError(
                    f"LLM provider error ({status})",
                    status_code=status,
                ) from exc

        # exponential back-off: 1s, 2s, 4s …
        if attempt < LLM_MAX_RETRIES:
            await asyncio.sleep(2 ** (attempt - 1))

    # All retries exhausted
    if isinstance(last_error, LLMRateLimitError):
        raise last_error
    raise LLMTimeoutError() from last_error
