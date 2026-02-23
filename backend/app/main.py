from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routes import predict, ocr, grievance, simplify

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

@app.get("/")
async def root():
    return {"service": "SAMAAN ML Backend", "status": "ok"}
