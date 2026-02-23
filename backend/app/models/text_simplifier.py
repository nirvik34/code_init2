import re
import asyncio
from app.services.llm_provider import chat_completion, LLMError


# All 22 scheduled languages of India + English
LANGUAGE_NAMES = {
    "en":  "English",
    "hi":  "Hindi (हिन्दी)",
    "bn":  "Bengali (বাংলা)",
    "ta":  "Tamil (தமிழ்)",
    "te":  "Telugu (తెలుగు)",
    "mr":  "Marathi (मराठी)",
    "gu":  "Gujarati (ગુજરાતી)",
    "kn":  "Kannada (ಕನ್ನಡ)",
    "ml":  "Malayalam (മലയാളം)",
    "pa":  "Punjabi (ਪੰਜਾਬੀ)",
    "or":  "Odia (ଓଡ଼ିଆ)",
    "as":  "Assamese (অসমীয়া)",
    "ur":  "Urdu (اردو)",
    "ne":  "Nepali (नेपाली)",
    "ks":  "Kashmiri (کٲشُر)",
    "kok": "Konkani (कोंकणी)",
    "mai": "Maithili (मैथिली)",
    "sd":  "Sindhi (سنڌي)",
    "sa":  "Sanskrit (संस्कृतम्)",
    "doi": "Dogri (डोगरी)",
    "brx": "Bodo (बड़ो)",
    "mni": "Manipuri / Meitei (মৈতৈলোন্)",
    "sat": "Santali (ᱥᱟᱱᱛᱟᱲᱤ)",
}


def _fallback_simplify(text: str) -> str:
    """Lightweight rule-based fallback when LLM is unavailable."""
    if not text:
        return ""
    parts = re.split(r'[\n\.]', text)
    sentences = [p.strip() for p in parts if p.strip()]
    kept = []
    for s in sentences[:3]:
        s2 = re.sub(r'\s+', ' ', s)
        if len(s2) > 160:
            clauses = re.split(r',|;| and ', s2)
            s2 = '. '.join([c.strip() for c in clauses[:2]])
        kept.append(s2)
    simplified = '. '.join(kept)
    if not simplified.endswith('.'):
        simplified += '.'
    for k, v in {'utilize': 'use', 'commence': 'start', 'cease': 'stop', 'expedite': 'speed up'}.items():
        simplified = re.sub(rf"\b{k}\b", v, simplified, flags=re.IGNORECASE)
    return simplified


async def simplify_text_async(text: str, language: str = "en") -> str:
    """Use LLM to simplify text into the target language. Falls back to rule-based on error."""
    if not text:
        return ""

    lang_name = LANGUAGE_NAMES.get(language, "English")

    system_prompt = (
        "You are SAMAAN, an AI assistant that helps Indian senior citizens understand "
        "complex government documents, pension orders, and legal notices. "
        "Rewrite the given text in very simple, clear language suitable for elderly people. "
        "Use short sentences. Avoid jargon. Be warm and reassuring. "
        f"Respond ONLY in {lang_name}. Do not include any preamble or explanation — just the simplified text."
    )

    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": f"Simplify this text:\n\n{text}"},
    ]

    try:
        response = await chat_completion(messages, temperature=0.4, max_tokens=512)
        return response.content
    except LLMError:
        # Fall back to rule-based approach
        return _fallback_simplify(text)


async def translate_text_async(text: str, language: str = "en") -> str:
    """Use LLM to translate text into the target language, preserving full meaning."""
    if not text:
        return ""

    lang_name = LANGUAGE_NAMES.get(language, "English")

    system_prompt = (
        "You are SAMAAN, a translation assistant for Indian senior citizens. "
        "Translate the given text accurately and completely into "
        f"{lang_name}. "
        "Preserve the full meaning, context, and all details from the original. "
        "Do NOT simplify or shorten. Respond ONLY with the translated text — no preamble, no explanation."
    )

    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": f"Translate this text:\n\n{text}"},
    ]

    try:
        response = await chat_completion(messages, temperature=0.2, max_tokens=1024)
        return response.content
    except LLMError:
        return text  # fallback: return original if translation fails


def simplify_text(text: str) -> str:
    """Sync wrapper for backward compatibility."""
    return _fallback_simplify(text)
