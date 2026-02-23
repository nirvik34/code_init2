"""
Pydantic schemas for the /api/clarify endpoint.
"""

from __future__ import annotations

from typing import Literal, Optional
from pydantic import BaseModel, Field, validator


class ClarifyRequest(BaseModel):
    """Incoming request to simplify policy text."""

    text: str = Field(
        ...,
        min_length=1,
        max_length=5000,
        description="The government / legal text to simplify (1–5 000 chars).",
    )
    language: Literal["en", "hi"] = Field(
        default="en",
        description="Target output language: 'en' (English) or 'hi' (Hindi).",
    )
    mode: Literal["prose", "bullets"] = Field(
        default="prose",
        description="Output format: 'prose' (paragraphs) or 'bullets' (bulleted summary).",
    )

    @validator("text")
    def text_must_not_be_blank(cls, v: str) -> str:
        stripped = v.strip()
        if not stripped:
            raise ValueError("text must contain non-whitespace characters")
        return stripped

    class Config:
        schema_extra = {
            "example": {
                "text": "Pursuant to Clause 14(b)(iii) of the National Pension System...",
                "language": "en",
                "mode": "prose",
            }
        }


class ClarifyResponse(BaseModel):
    """Response from the clarify endpoint."""

    simplified: str = Field(
        ...,
        description="The simplified, citizen-friendly text.",
    )
    language: str = Field(
        ...,
        description="Language of the output.",
    )
    mode: str = Field(
        ...,
        description="Output format used.",
    )
    cached: bool = Field(
        default=False,
        description="Whether this response was served from cache.",
    )


class ErrorResponse(BaseModel):
    """Structured error body."""

    error: str
    detail: Optional[str] = None
