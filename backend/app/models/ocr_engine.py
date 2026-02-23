from typing import Optional
from PIL import Image, ImageOps
import pytesseract
import io


def ocr_extract_from_upload(content: bytes) -> str:
    """Return extracted text from uploaded image bytes using pytesseract.

    Note: Host must have `tesseract` binary installed.
    """
    img = Image.open(io.BytesIO(content))
    # basic preprocessing: convert to grayscale and increase contrast
    try:
        img = img.convert('L')
        img = ImageOps.autocontrast(img)
    except Exception:
        pass

    text = pytesseract.image_to_string(img, lang='eng')
    return text
