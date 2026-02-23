from datetime import datetime, timedelta
from statistics import mean
from typing import List


def _parse_date(s: str) -> datetime | None:
    s = s.strip()
    for fmt in ("%Y-%m-%d", "%d-%m-%Y", "%d/%m/%Y", "%Y/%m/%d", "%d %B %Y"):
        try:
            return datetime.strptime(s, fmt)
        except Exception:
            continue
    try:
        # ISO fallback
        return datetime.fromisoformat(s)
    except Exception:
        return None


def predict_delay(payment_history: List[str]) -> dict:
    # Convert to datetimes and sort
    dates = [_parse_date(d) for d in payment_history]
    dates = [d for d in dates if d is not None]
    if not dates:
        # no history, return neutral prediction
        return {"risk_score": 0.1, "status": "Insufficient data", "expected_next_date": None}

    dates.sort()
    # compute gaps in days
    gaps = []
    for a, b in zip(dates[:-1], dates[1:]):
        gaps.append((b - a).days)

    if gaps:
        mean_gap = max(1, mean(gaps))
        latest_gap = gaps[-1]
    else:
        mean_gap = 30
        latest_gap = mean_gap

    # simple scoring: risk increases when latest gap significantly exceeds mean
    diff = latest_gap - mean_gap
    if diff <= 0:
        risk_score = 0.05
    else:
        # normalize diff relative to mean
        norm = diff / (mean_gap + 1)
        risk_score = min(1.0, 0.2 + norm * 0.8)

    if latest_gap > mean_gap * 1.5:
        status = "High Risk of Delay"
    elif latest_gap > mean_gap * 1.1:
        status = "Medium Risk of Delay"
    else:
        status = "Low Risk"

    last_date = dates[-1]
    expected_next = last_date + timedelta(days=round(mean_gap))

    return {
        "risk_score": round(risk_score, 3),
        "status": status,
        "expected_next_date": expected_next.date().isoformat(),
    }
