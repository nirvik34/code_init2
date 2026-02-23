# SAMAAN Pension Assist — Project Root

This repository contains a minimal scaffold for the SAMAAN Pension Assist demo: a mobile-first Next.js PWA frontend and a FastAPI backend exposing ML-only endpoints (delay prediction, OCR extraction, grievance letter generation, and text simplification).

Summary of what was added
- Backend (FastAPI): [backend](backend)
  - `app/main.py` — FastAPI application with CORS enabled
  - `app/routes/predict.py` — `/predict-delay` endpoint
  - `app/routes/ocr.py` — `/ocr-extract` endpoint (multipart file)
  - `app/routes/grievance.py` — `/generate-grievance` endpoint
  - `app/routes/simplify.py` — `/simplify-text` endpoint
  - `app/models/delay_model.py` — gap-based delay predictor
  - `app/models/ocr_engine.py` — `pytesseract` wrapper for OCR
  - `app/models/text_simplifier.py` — lightweight deterministic simplifier
  - `requirements.txt` — Python deps

- Frontend (Next.js PWA): [frontend](frontend)
  - `app/` — App Router pages: `dashboard`, `upload-doc`, `prediction`, `grievance`, `simplify`
  - `lib/api.ts` — Axios client wired to backend endpoints
  - `next.config.js` + `public/manifest.json` — PWA configuration
  - `tailwind.config.js` + `globals.css` — styling for elder-friendly UI
  - `package.json` — frontend dependencies (Next.js, Axios, Zustand, next-pwa, Tailwind, jsPDF)

Key design choices
- Backend exposes only ML endpoints (no auth, no DB).
- OCR uses `pytesseract` (host must have the `tesseract` binary installed).
- Delay prediction is deterministic and statistical (no deep learning).
- Text simplifier is a deterministic fallback; LLM integration can be added later.
- Frontend focuses on accessibility (large fonts, accessible controls) and PWA installability.

System requirements
- Python 3.10+
- Node.js 18+ (npm)
- `tesseract` binary (for OCR) — install via your package manager, e.g. `sudo apt install tesseract-ocr`

Quick start — Backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
# ensure tesseract binary is installed on the host
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Quick start — Frontend

```bash
cd frontend
npm install
NEXT_PUBLIC_API_URL=http://localhost:8000 npm run dev
```

Environment variables
- `NEXT_PUBLIC_API_URL` — URL of the backend (default `http://localhost:8000` in frontend client)
- `PORT` — backend port used by `run.sh` (defaults to `8000`)

Example API usage

- Predict delay

```bash
curl -s -X POST http://localhost:8000/predict-delay -H "Content-Type: application/json" -d '{"payment_history":["2024-01-10","2024-02-11","2024-03-15"]}' | jq
```

- OCR extract (image upload)

```bash
curl -F "file=@/path/to/image.jpg" http://localhost:8000/ocr-extract
```

- Generate grievance

```bash
curl -s -X POST http://localhost:8000/generate-grievance -H "Content-Type: application/json" -d '{"scheme":"IGNOAPS","last_payment":"2024-01-10","delay_days":35,"name":"Ramesh Kumar"}' | jq
```

- Simplify text

```bash
curl -s -X POST http://localhost:8000/simplify-text -H "Content-Type: application/json" -d '{"text":"Complex government explanation..."}' | jq
```

Helper script
- A convenience script `run-all.sh` is provided to install dependencies (creates a Python venv for the backend and runs `npm install` for the frontend). It does not automatically start servers; it prepares the environment.

Next steps and recommendations
- Add more accessibility UI components: `Read Aloud` (Web Speech API), ARIA labels on form controls, Elder Mode toggle that increases font size and contrast.
- Integrate a lightweight LLM service (or OpenAI) for improved text simplification and complaint drafting (ensure proper API key handling).
- Add unit tests for backend models and E2E tests for critical flows (OCR → auto-fill → predict → grievance).
- Prepare production configs for deployment: Vercel for frontend, Render/Railway for backend. Add Dockerfile if desired.

If you want, I can:
- start both services locally and run a quick end-to-end smoke test, or
- add Elder Mode and Read Aloud UI controls to the frontend.
