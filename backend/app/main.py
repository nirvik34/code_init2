from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os
from pathlib import Path

# Load env: try root .env.local first, then backend/.env
_root = Path(__file__).resolve().parent.parent.parent
load_dotenv(_root / ".env.local", override=False)
load_dotenv(override=False)

from app.routes import predict, ocr, grievance, simplify, auth, chat, clarify

app = FastAPI(title="SAMAAN ML Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(predict.router, prefix="", tags=["predict"])
app.include_router(ocr.router, prefix="", tags=["ocr"])
app.include_router(grievance.router, prefix="", tags=["grievance"])
app.include_router(simplify.router, prefix="", tags=["simplify"])
app.include_router(auth.router, prefix="", tags=["auth"])
app.include_router(chat.router, prefix="", tags=["chat"])
app.include_router(clarify.router, prefix="", tags=["clarify"])


@app.on_event("startup")
async def startup_event():
    from app.db import USING_MONGO
    if USING_MONGO:
        print("[STARTUP] ✅  Storage: MongoDB Atlas")
    else:
        print("[STARTUP] ⚠️   Storage: local file fallback (no MongoDB)")

@app.get("/")
async def root():
    return {"service": "SAMAAN ML Backend", "status": "ok"}


@app.get("/health")
async def health():
    """Health-check endpoint for monitoring."""
    return {"status": "healthy", "service": "samaan-backend", "version": "2.0.0"}
