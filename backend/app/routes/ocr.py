from fastapi import APIRouter, UploadFile, File, HTTPException
from pydantic import BaseModel
from app.models.ocr_engine import ocr_extract_from_upload
from app.services.llm_provider import chat_completion, LLMError
import asyncio
import re

router = APIRouter()


class OcrResponse(BaseModel):
    doc_name: str | None = None
    name: str | None = None
    dob: str | None = None
    age: str | None = None
    pension_id: str | None = None
    account_number: str | None = None
    ifsc: str | None = None
    address: str | None = None
    raw_text: str | None = None
    ai_fields: dict | None = None  # AI-extracted labeled fields


async def _ai_extract_fields(raw_text: str) -> dict:
    """Use AI to extract and label all identifiable fields from OCR text."""
    import json as _json
    try:
        resp = await chat_completion(
            messages=[
                {
                    "role": "system",
                    "content": (
                        "You are a document field extraction assistant. "
                        "Given OCR-extracted text from a scanned document (ID card, certificate, form, etc.), "
                        "extract ALL identifiable fields and return them as a JSON object. "
                        "Common fields to look for: Full Name, Date of Birth, Age, Gender, "
                        "Father's Name, Mother's Name, Spouse Name, Address, Mobile Number, "
                        "Email, Aadhaar Number, PAN Number, Voter ID, Passport Number, "
                        "Account Number, IFSC Code, Bank Name, Pension ID, Issue Date, "
                        "Expiry Date, Nationality, Occupation, Pincode, State, District, "
                        "Blood Group, Marital Status. "
                        "Only include fields that are clearly present in the text. "
                        "Return ONLY a valid JSON object with field labels as keys and extracted values as strings. "
                        'Example: {"Full Name": "Ramesh Kumar", "Date of Birth": "15/08/1960", "Age": "63", "Gender": "Male"}'
                    ),
                },
                {
                    "role": "user",
                    "content": f"Extract all labeled fields from this OCR text:\n\n{raw_text[:2000]}",
                },
            ],
            temperature=0.1,
            max_tokens=600,
        )
        content = resp.content.strip()
        # Strip markdown code fences if present
        if "```" in content:
            parts = content.split("```")
            for part in parts:
                part = part.strip()
                if part.startswith("json"):
                    part = part[4:].strip()
                if part.startswith("{"):
                    content = part
                    break
        return _json.loads(content)
    except Exception:
        return {}


async def _ai_doc_name(raw_text: str) -> str:
    """Ask the LLM to produce a short, descriptive document name."""
    try:
        resp = await chat_completion(
            messages=[
                {
                    "role": "system",
                    "content": (
                        "You are a document classification assistant. "
                        "Given OCR-extracted text from a scanned document, "
                        "generate a concise, descriptive document name (max 8 words). "
                        "Format: '<Document Type> – <Person/Entity Name if present>'. "
                        "Examples: 'Age Certificate – Ramesh Kumar', "
                        "'Pension Payment Slip – March 2024', "
                        "'Aadhaar Card – Sunita Devi', "
                        "'Life Certificate', 'Bank Passbook – SBI'. "
                        "Return ONLY the document name string, nothing else."
                    ),
                },
                {
                    "role": "user",
                    "content": f"Document text (first 800 chars):\n\n{raw_text[:800]}",
                },
            ],
            temperature=0.2,
            max_tokens=40,
        )
        return resp.content.strip().strip('"').strip("'")
    except LLMError:
        return _fallback_doc_name(raw_text)


def _fallback_doc_name(text: str) -> str:
    """Rule-based fallback doc name when LLM is unavailable."""
    lt = text.lower()
    if "aadhaar" in lt or "aadhar" in lt:
        return "Aadhaar Card"
    if "pension" in lt and ("slip" in lt or "payment" in lt):
        return "Pension Payment Slip"
    if "life certificate" in lt or "jeevan pramaan" in lt:
        return "Life Certificate"
    if "age certificate" in lt or "date of birth" in lt:
        return "Age Certificate"
    if "passbook" in lt:
        return "Bank Passbook"
    if "pan" in lt and len(re.findall(r"[A-Z]{5}\d{4}[A-Z]", text)) > 0:
        return "PAN Card"
    return "Scanned Document"


@router.post("/ocr-extract", response_model=OcrResponse)
async def ocr_extract(file: UploadFile = File(...)):
    content = await file.read()
    filename = file.filename or ""

    try:
        text = ocr_extract_from_upload(content, filename=filename)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    if not text.strip():
        raise HTTPException(
            status_code=422,
            detail="Could not extract text from this document. Please ensure the image is clear or use a text-based PDF."
        )

    # ── Regex helpers ──────────────────────────────────────────────
    ifsc_re = re.compile(r"\b[A-Z]{4}0[A-Z0-9]{6}\b")
    acct_re = re.compile(r"\b\d{9,18}\b")
    dob_re = re.compile(
        r"\b(\d{1,2}[/-]\d{1,2}[/-]\d{2,4}|\d{4}-\d{2}-\d{2})\b"
    )
    age_re = re.compile(r"\bage[:\s]*(\d{2,3})\b", re.IGNORECASE)
    pin_re = re.compile(r"\b[1-9]\d{5}\b")

    name = dob = age_str = pension_id = account_number = ifsc = address = None

    lines = [l.strip() for l in text.splitlines() if l.strip()]
    for i, line in enumerate(lines):
        low = line.lower()

        # Name
        if not name and any(kw in low for kw in ("name", "नाम")):
            parts = line.split(":")
            if len(parts) > 1 and parts[1].strip():
                name = parts[1].strip()
            elif i + 1 < len(lines):
                name = lines[i + 1]

        # Date of birth
        if not dob and any(kw in low for kw in ("date of birth", "dob", "d.o.b", "जन्म")):
            m = dob_re.search(line)
            if not m and i + 1 < len(lines):
                m = dob_re.search(lines[i + 1])
            if m:
                dob = m.group(0)

        # Age
        if not age_str and "age" in low:
            m = age_re.search(line)
            if m:
                age_str = m.group(1) + " years"

        # Pension ID
        if not pension_id and any(kw in low for kw in ("pension", "ppo", "ppoid")):
            parts = line.split(":")
            if len(parts) > 1:
                pension_id = parts[1].strip()

        # Account number
        if not account_number and any(kw in low for kw in ("account", "a/c", "acct")):
            parts = line.split(":")
            if len(parts) > 1:
                account_number = parts[1].strip()

        # IFSC
        if not ifsc and "ifsc" in low:
            parts = line.split(":")
            if len(parts) > 1:
                ifsc = parts[1].strip()

        # Address (look for "address" label)
        if not address and "address" in low:
            parts = line.split(":")
            if len(parts) > 1 and parts[1].strip():
                address = parts[1].strip()

    # ── Regex fallbacks ────────────────────────────────────────────
    if not ifsc:
        m = ifsc_re.search(text)
        if m:
            ifsc = m.group(0)

    if not account_number:
        m = acct_re.search(text)
        if m:
            account_number = m.group(0)

    if not dob:
        m = dob_re.search(text)
        if m:
            dob = m.group(0)

    if not age_str:
        m = age_re.search(text)
        if m:
            age_str = m.group(1) + " years"

    if not pension_id:
        for token in re.findall(r"\b[A-Z0-9-]{3,12}\b", text):
            if not dob_re.match(token) and not ifsc_re.match(token):
                pension_id = token
                break

    # ── AI document naming + AI field extraction ──────────────────
    doc_name, ai_fields = await asyncio.gather(
        _ai_doc_name(text),
        _ai_extract_fields(text),
    )

    # Promote AI-extracted core fields if regex missed them
    if not name and ai_fields.get("Full Name"):
        name = ai_fields["Full Name"]
    if not dob and ai_fields.get("Date of Birth"):
        dob = ai_fields["Date of Birth"]
    if not age_str and ai_fields.get("Age"):
        age_str = ai_fields["Age"]
    if not address and ai_fields.get("Address"):
        address = ai_fields["Address"]
    if not account_number and ai_fields.get("Account Number"):
        account_number = ai_fields["Account Number"]
    if not ifsc and ai_fields.get("IFSC Code"):
        ifsc = ai_fields["IFSC Code"]

    return OcrResponse(
        doc_name=doc_name,
        name=name,
        dob=dob,
        age=age_str,
        pension_id=pension_id,
        account_number=account_number,
        ifsc=ifsc,
        address=address,
        raw_text=text,
        ai_fields=ai_fields if ai_fields else None,
    )
