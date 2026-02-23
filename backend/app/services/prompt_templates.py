"""
Prompt Templates for Government Policy Simplification
------------------------------------------------------
Centralised prompt engineering for the SAMAAN Clarifier.
"""

from __future__ import annotations
from typing import Literal

# ---------------------------------------------------------------------------
# System prompt — the core instruction for the LLM
# ---------------------------------------------------------------------------
SYSTEM_PROMPT_EN = """\
You are a government policy simplification assistant for Indian citizens.

Your task is to rewrite the following government, pension, or legal policy text
into plain language that any citizen can understand.

Rules you MUST follow:
1. Use simple English with short sentences (≤ 25 words each).
2. Adopt a warm, citizen-friendly, respectful tone.
3. Keep ALL legal meaning intact — do not change the meaning.
4. Preserve ALL eligibility conditions exactly as stated.
5. Preserve ALL clause references (e.g. "Clause 14(b)(iii)").
6. Replace legal jargon with everyday words.
7. Group output into clear paragraphs of 3–5 sentences each.
8. Do NOT hallucinate — do NOT add information not in the source.
9. Do NOT remove important conditions or qualifications.
10. If the text mentions dates, amounts, or percentages — keep them exact.
"""

SYSTEM_PROMPT_HI = """\
आप भारतीय नागरिकों के लिए एक सरकारी नीति सरलीकरण सहायक हैं।

आपका काम नीचे दिए गए सरकारी, पेंशन या कानूनी नीति पाठ को सरल हिंदी में
दोबारा लिखना है जिसे कोई भी नागरिक आसानी से समझ सके।

नियम जिनका आपको पालन करना चाहिए:
1. सरल हिंदी में छोटे वाक्य लिखें (≤ 25 शब्द प्रति वाक्य)।
2. नागरिक-अनुकूल, सम्मानजनक लहजा अपनाएं।
3. सभी कानूनी अर्थ बनाए रखें — अर्थ न बदलें।
4. सभी पात्रता शर्तें यथावत रखें।
5. सभी धारा संदर्भ (जैसे "धारा 14(ख)(iii)") बनाए रखें।
6. कानूनी शब्दावली को रोज़मर्रा के शब्दों से बदलें।
7. आउटपुट को 3-5 वाक्यों के स्पष्ट पैराग्राफ में विभाजित करें।
8. मनगढ़ंत बातें न जोड़ें — स्रोत में जो नहीं है वह न लिखें।
9. महत्वपूर्ण शर्तें या योग्यताएं न हटाएं।
10. यदि तिथियां, राशि या प्रतिशत का उल्लेख है — उन्हें सटीक रखें।
"""

BULLET_INSTRUCTION_EN = """
Additionally, format the output as a bulleted summary:
- Use bullet points for each key point.
- Start each bullet with an action verb or clear subject.
- Keep each bullet to 1–2 sentences maximum.
"""

BULLET_INSTRUCTION_HI = """
इसके अतिरिक्त, आउटपुट को बुलेट-पॉइंट सारांश के रूप में प्रस्तुत करें:
- प्रत्येक मुख्य बिंदु के लिए बुलेट पॉइंट का उपयोग करें।
- प्रत्येक बुलेट को 1-2 वाक्यों तक सीमित रखें।
"""


def build_messages(
    text: str,
    *,
    language: Literal["en", "hi"] = "en",
    mode: Literal["prose", "bullets"] = "prose",
) -> list[dict[str, str]]:
    """
    Build the chat messages list for the LLM call.

    Parameters
    ----------
    text : str
        The raw policy / legal text to simplify.
    language : "en" | "hi"
        Target output language.
    mode : "prose" | "bullets"
        Output format — paragraph prose or bulleted summary.

    Returns
    -------
    list of message dicts ready for ``chat_completion()``.
    """
    system = SYSTEM_PROMPT_HI if language == "hi" else SYSTEM_PROMPT_EN

    if mode == "bullets":
        system += BULLET_INSTRUCTION_HI if language == "hi" else BULLET_INSTRUCTION_EN

    user_msg = f"Simplify this text:\n\n{text}"

    return [
        {"role": "system", "content": system},
        {"role": "user", "content": user_msg},
    ]
