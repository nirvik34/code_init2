# SAMAAN Pension Assist — Backend (FastAPI)

Lightweight FastAPI app exposing ML-only endpoints used by the SAMAAN frontend.

Quick start (local):

1. Create a virtualenv and install deps:

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

2. Run the server:

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Endpoints:
- `POST /predict-delay` — predict payment delay risk
- `POST /ocr-extract` — OCR extraction from an uploaded image
- `POST /generate-grievance` — generate a grievance letter
- `POST /simplify-text` — return simplified text

Notes:
- This service purposefully contains *no* auth or business routes.
- OCR uses `pytesseract` and requires the `tesseract` binary to be installed on the host.
