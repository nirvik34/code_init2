from fastapi import APIRouter
from pydantic import BaseModel
from typing import List
import os
import httpx

router = APIRouter()

LLM_API_KEY = os.getenv("LLM_API_KEY", "")
LLM_BASE_URL = os.getenv("LLM_BASE_URL", "https://api.groq.com/openai/v1")
LLM_MODEL = os.getenv("LLM_MODEL", "mixtral-8x7b-32768")

SYSTEM_PROMPT = """You are SAMAAN Assistant — a helpful, empathetic AI chatbot for the SAMAAN Pension Assist platform.
You help Indian pensioners with:
• Understanding pension schemes (NPS, EPS, OPS, GPF, EPFO, etc.)
• Explaining payment delays and arrears
• Guiding them through grievance filing
• Simplifying government circulars and notifications
• General pension-related queries

Rules:
- Be concise, warm, and use simple language. Many users are senior citizens.
- If unsure, say so honestly and suggest contacting the nearest pension office.
- Keep answers under 120 words unless the user explicitly asks for detail.
- Always address the user respectfully.
- When relevant, mention that SAMAAN tools (Grievance Generator, Document Scanner, Prediction) can help."""


class ChatMessage(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    messages: List[ChatMessage]


class ChatResponse(BaseModel):
    reply: str


@router.post("/chat", response_model=ChatResponse)
async def chat(req: ChatRequest):
    """Send a message to the LLM and return the response."""
    if not LLM_API_KEY:
        return ChatResponse(
            reply="Chat service is not configured yet. Please ask the administrator to set the LLM_API_KEY in the environment."
        )

    api_messages = [{"role": "system", "content": SYSTEM_PROMPT}]
    for msg in req.messages[-10:]:
        api_messages.append({"role": msg.role, "content": msg.content})

    async with httpx.AsyncClient(timeout=30.0) as client:
        try:
            response = await client.post(
                f"{LLM_BASE_URL}/chat/completions",
                headers={
                    "Authorization": f"Bearer {LLM_API_KEY}",
                    "Content-Type": "application/json",
                },
                json={
                    "model": LLM_MODEL,
                    "messages": api_messages,
                    "temperature": 0.7,
                    "max_tokens": 512,
                },
            )
            response.raise_for_status()
            data = response.json()
            reply = data["choices"][0]["message"]["content"]
            return ChatResponse(reply=reply.strip())
        except httpx.HTTPStatusError as e:
            error_body = e.response.text[:200] if e.response else "Unknown"
            print(f"[CHAT] ❌ LLM API error {e.response.status_code}: {error_body}")
            return ChatResponse(
                reply="I'm having trouble connecting to my brain right now. Please try again in a moment."
            )
        except Exception as e:
            print(f"[CHAT] ❌ Exception: {e}")
            return ChatResponse(
                reply="Something went wrong on my end. Please try again shortly."
            )
