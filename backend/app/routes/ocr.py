from fastapi import APIRouter, UploadFile, File, HTTPException
from pydantic import BaseModel
from app.models.ocr_engine import ocr_extract_from_upload
import re

router = APIRouter()


class OcrResponse(BaseModel):
    name: str | None = None
    pension_id: str | None = None
    account_number: str | None = None
    ifsc: str | None = None
    raw_text: str | None = None


@router.post("/ocr-extract", response_model=OcrResponse)
async def ocr_extract(file: UploadFile = File(...)):
    content = await file.read()
    try:
        text = ocr_extract_from_upload(content)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    # regex helpers
    ifsc_re = re.compile(r"\b[A-Z]{4}0[A-Z0-9]{6}\b")
    acct_re = re.compile(r"\b\d{6,18}\b")
    pension_re = re.compile(r"\b[A-Z0-9]{3,12}\b")

    name = None
    pension_id = None
    account_number = None
    ifsc = None

    # naive heuristics: look for labels
    lines = [l.strip() for l in text.splitlines() if l.strip()]
    for i, line in enumerate(lines):
        low = line.lower()
        if 'name' in low and not name:
            parts = line.split(':')
            name = parts[1].strip() if len(parts) > 1 else lines[i + 1] if i + 1 < len(lines) else None
        if 'pension' in low and not pension_id:
            parts = line.split(':')
            pension_id = parts[1].strip() if len(parts) > 1 else None
        if 'account' in low and not account_number:
            parts = line.split(':')
            account_number = parts[1].strip() if len(parts) > 1 else None
        if 'ifsc' in low and not ifsc:
            parts = line.split(':')
            ifsc = parts[1].strip() if len(parts) > 1 else None

    # fallback regex scans
    if not ifsc:
        m = ifsc_re.search(text)
        if m:
            ifsc = m.group(0)
    if not account_number:
        m = acct_re.search(text)
        if m:
            account_number = m.group(0)
    if not pension_id:
        # pick first alnum token that looks like an id but avoid dates
        for token in re.findall(r"\b[A-Z0-9-]{3,12}\b", text):
            if not re.match(r"\d{4}-\d{2}-\d{2}", token):
                pension_id = token
                break

    return OcrResponse(
        name=name,
        pension_id=pension_id,
        account_number=account_number,
        ifsc=ifsc,
        raw_text=text,
    )
