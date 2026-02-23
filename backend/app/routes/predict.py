from fastapi import APIRouter
from pydantic import BaseModel
from app.models.delay_model import predict_delay as _predict

router = APIRouter()


class PredictRequest(BaseModel):
    payment_history: list[str]


class PredictResponse(BaseModel):
    risk_score: float
    status: str
    expected_next_date: str


@router.post("/predict-delay", response_model=PredictResponse)
async def predict_delay(req: PredictRequest):
    """Return risk score, status and expected next date."""
    return _predict(req.payment_history)
