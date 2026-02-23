from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional, Literal
from app.models.text_simplifier import simplify_text_async, translate_text_async

router = APIRouter()


class SimplifyRequest(BaseModel):
    text: str
    language: Optional[str] = "en"
    mode: Optional[Literal["simplify", "translate"]] = "simplify"


class SimplifyResponse(BaseModel):
    simplified_text: str


@router.post("/simplify-text", response_model=SimplifyResponse)
async def simplify(req: SimplifyRequest):
    lang = req.language or "en"
    if req.mode == "translate":
        out = await translate_text_async(req.text, language=lang)
    else:
        out = await simplify_text_async(req.text, language=lang)
    return SimplifyResponse(simplified_text=out)
