from fastapi import APIRouter
from pydantic import BaseModel
from datetime import datetime

router = APIRouter()


class GrievanceRequest(BaseModel):
    scheme: str
    last_payment: str
    delay_days: int
    name: str


class GrievanceResponse(BaseModel):
    letter: str


@router.post("/generate-grievance", response_model=GrievanceResponse)
async def generate_grievance(req: GrievanceRequest):
    # Simple template-based generator
    try:
        last = datetime.fromisoformat(req.last_payment)
        last_str = last.strftime("%d %B %Y")
    except Exception:
        last_str = req.last_payment

    letter = (
        f"Respected Sir/Madam,\n\n"
        f"I, {req.name}, am writing regarding delayed pension payments under the {req.scheme} scheme. "
        f"My last received pension payment was on {last_str}. It has been {req.delay_days} days since the expected payment date. "
        "Kindly look into this matter and expedite the pending disbursement. I request you to inform me of the reason for the delay and the expected date of payment.\n\n"
        "Thank you for your prompt attention to this matter.\n\n"
        f"Yours faithfully,\n{req.name}"
    )

    return GrievanceResponse(letter=letter)
