from fastapi import APIRouter
from pydantic import BaseModel
from app.models.text_simplifier import simplify_text

router = APIRouter()


class SimplifyRequest(BaseModel):
    text: str


class SimplifyResponse(BaseModel):
    simplified_text: str


@router.post("/simplify-text", response_model=SimplifyResponse)
async def simplify(req: SimplifyRequest):
    out = simplify_text(req.text)
    return SimplifyResponse(simplified_text=out)
