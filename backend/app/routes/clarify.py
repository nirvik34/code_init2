"""
POST /api/clarify — Government policy text simplification endpoint.

Features:
- Input validation (1–5 000 chars)
- LRU cache for repeated queries
- Structured error responses
- Language toggle (EN / HI)
- Mode toggle (prose / bullets)
"""

from __future__ import annotations

import hashlib
import logging
import time
from collections import OrderedDict
from typing import Dict, Tuple

from fastapi import APIRouter, HTTPException, Request
from fastapi.responses import JSONResponse

from app.schemas.clarify import ClarifyRequest, ClarifyResponse, ErrorResponse
from app.services.llm_provider import (
    LLMError,
    LLMConfigError,
    LLMRateLimitError,
    LLMTimeoutError,
    chat_completion,
)
from app.services.prompt_templates import build_messages

logger = logging.getLogger("samaan.clarify")

router = APIRouter()

# ---------------------------------------------------------------------------
# Simple in-memory LRU cache (no external dependency)
# ---------------------------------------------------------------------------
_CACHE_MAX = 128
_cache: OrderedDict[str, Tuple[str, float]] = OrderedDict()
_CACHE_TTL = 3600  # 1 hour


def _cache_key(text: str, language: str, mode: str) -> str:
    """Deterministic cache key from request parameters."""
    raw = f"{language}:{mode}:{text.strip().lower()}"
    return hashlib.sha256(raw.encode()).hexdigest()


def _cache_get(key: str) -> str | None:
    """Return cached value if it exists and is not expired."""
    if key in _cache:
        value, ts = _cache[key]
        if time.time() - ts < _CACHE_TTL:
            _cache.move_to_end(key)
            return value
        del _cache[key]
    return None


def _cache_set(key: str, value: str) -> None:
    """Insert into cache, evicting oldest if full."""
    _cache[key] = (value, time.time())
    if len(_cache) > _CACHE_MAX:
        _cache.popitem(last=False)


# ---------------------------------------------------------------------------
# Simple per-IP rate limiter (sliding window, in-memory)
# ---------------------------------------------------------------------------
_RATE_WINDOW = 60  # seconds
_RATE_LIMIT = 20   # max requests per window per IP
_rate_buckets: Dict[str, list[float]] = {}


def _check_rate_limit(client_ip: str) -> bool:
    """Return True if the request is allowed, False if rate-limited."""
    now = time.time()
    bucket = _rate_buckets.setdefault(client_ip, [])
    # prune old entries
    bucket[:] = [t for t in bucket if now - t < _RATE_WINDOW]
    if len(bucket) >= _RATE_LIMIT:
        return False
    bucket.append(now)
    return True


# ---------------------------------------------------------------------------
# Route
# ---------------------------------------------------------------------------
@router.post(
    "/api/clarify",
    response_model=ClarifyResponse,
    responses={
        400: {"model": ErrorResponse, "description": "Invalid input"},
        429: {"model": ErrorResponse, "description": "Rate limited"},
        503: {"model": ErrorResponse, "description": "LLM not configured"},
        504: {"model": ErrorResponse, "description": "LLM timeout"},
    },
    summary="Simplify government policy text",
    description="Accepts complex policy/legal text and returns a citizen-friendly plain-language version.",
)
async def clarify(req: ClarifyRequest, request: Request):
    client_ip = request.client.host if request.client else "unknown"

    # Rate limit check
    if not _check_rate_limit(client_ip):
        logger.warning("Rate limit exceeded for %s", client_ip)
        return JSONResponse(
            status_code=429,
            content={"error": "rate_limit_exceeded", "detail": "Too many requests. Please wait a minute."},
        )

    # Cache check
    key = _cache_key(req.text, req.language, req.mode)
    cached = _cache_get(key)
    if cached is not None:
        logger.info("Cache hit for key=%s", key[:12])
        return ClarifyResponse(
            simplified=cached,
            language=req.language,
            mode=req.mode,
            cached=True,
        )

    # Build prompt and call LLM
    messages = build_messages(req.text, language=req.language, mode=req.mode)

    try:
        llm_resp = await chat_completion(messages, temperature=0.3, max_tokens=1024)
    except LLMConfigError as exc:
        return JSONResponse(
            status_code=503,
            content={"error": "llm_not_configured", "detail": str(exc)},
        )
    except LLMRateLimitError as exc:
        return JSONResponse(
            status_code=429,
            content={"error": "llm_rate_limited", "detail": str(exc)},
        )
    except LLMTimeoutError as exc:
        return JSONResponse(
            status_code=504,
            content={"error": "llm_timeout", "detail": str(exc)},
        )
    except LLMError as exc:
        logger.error("LLM error: %s", exc)
        return JSONResponse(
            status_code=exc.status_code,
            content={"error": "llm_error", "detail": str(exc)},
        )

    simplified = llm_resp.content

    # Cache the result
    _cache_set(key, simplified)

    logger.info(
        "Clarify success | lang=%s mode=%s chars_in=%d chars_out=%d ip=%s",
        req.language, req.mode, len(req.text), len(simplified), client_ip,
    )

    return ClarifyResponse(
        simplified=simplified,
        language=req.language,
        mode=req.mode,
        cached=False,
    )
