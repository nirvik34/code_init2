import re


def simplify_text(text: str) -> str:
    """Very lightweight simplifier: split into sentences, keep short sentences,
    and rephrase long clauses simply. This is intentionally simple and deterministic.
    """
    if not text:
        return ""

    # naive sentence split
    parts = re.split(r'[\n\.]', text)
    sentences = [p.strip() for p in parts if p.strip()]

    # keep up to first 3 sentences and shorten long sentences
    kept = []
    for s in sentences[:3]:
        # collapse multiple spaces
        s2 = re.sub(r'\s+', ' ', s)
        # break very long sentences into shorter clauses
        if len(s2) > 160:
            clauses = re.split(r',|;| and ', s2)
            s2 = '. '.join([c.strip() for c in clauses[:2]])
        kept.append(s2)

    simplified = '. '.join(kept)
    if not simplified.endswith('.'):
        simplified += '.'

    # final pass: replace some complex words with simpler alternatives
    replacements = {
        'utilize': 'use',
        'commence': 'start',
        'cease': 'stop',
        'expedite': 'speed up',
    }
    for k, v in replacements.items():
        simplified = re.sub(rf"\b{k}\b", v, simplified, flags=re.IGNORECASE)

    return simplified
