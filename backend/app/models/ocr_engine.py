from typing import Optional
from PIL import Image, ImageOps, ImageFilter, ImageEnhance
import pytesseract
import io


def _preprocess_image(img: Image.Image) -> Image.Image:
    """Apply aggressive preprocessing to maximise OCR accuracy."""
    # Convert to grayscale
    img = img.convert("L")
    # Boost contrast strongly
    img = ImageOps.autocontrast(img, cutoff=2)
    enhancer = ImageEnhance.Contrast(img)
    img = enhancer.enhance(2.0)
    # Sharpen to make characters crisper
    img = img.filter(ImageFilter.SHARPEN)
    img = img.filter(ImageFilter.SHARPEN)
    return img


def _ocr_image(img: Image.Image) -> str:
    """Run tesseract on a preprocessed PIL image."""
    processed = _preprocess_image(img)
    # Try multiple PSM modes: 3 (auto), then 6 (single block) as fallback
    text = pytesseract.image_to_string(processed, lang="eng", config="--psm 3")
    if not text.strip():
        text = pytesseract.image_to_string(processed, lang="eng", config="--psm 6")
    return text


def ocr_extract_from_upload(content: bytes, filename: str = "") -> str:
    """Return extracted text from uploaded file bytes using pytesseract.

    Supports both image files (JPEG, PNG, WEBP, TIFF, BMP) and PDF files.
    Host must have `tesseract` and `poppler-utils` (for PDF) installed.
    """
    fn_lower = filename.lower()
    is_pdf = fn_lower.endswith(".pdf") or content[:4] == b"%PDF"

    if is_pdf:
        return _ocr_pdf(content)

    # --- Image path ---
    try:
        img = Image.open(io.BytesIO(content))
    except Exception as exc:
        raise ValueError(f"Cannot open file as image: {exc}") from exc

    return _ocr_image(img)


def _ocr_pdf(content: bytes) -> str:
    """Convert each PDF page to an image and OCR it."""
    texts: list[str] = []

    # Primary: try pdf2image (needs poppler installed)
    try:
        from pdf2image import convert_from_bytes  # type: ignore
        pages = convert_from_bytes(content, dpi=250)
        for page_img in pages:
            texts.append(_ocr_image(page_img))
        if any(t.strip() for t in texts):
            return "\n\n--- PAGE BREAK ---\n\n".join(texts)
    except Exception:
        pass  # fall through to pypdf text extraction

    # Fallback: extract embedded text layer from PDF (works for text-based PDFs)
    try:
        import io as _io
        from pypdf import PdfReader  # type: ignore
        reader = PdfReader(_io.BytesIO(content))
        for page in reader.pages:
            page_text = page.extract_text() or ""
            if page_text.strip():
                texts.append(page_text)
        if texts:
            return "\n\n--- PAGE BREAK ---\n\n".join(texts)
    except Exception:
        pass

    return ""
