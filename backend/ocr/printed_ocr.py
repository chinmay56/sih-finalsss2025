import os
import re

import cv2
import numpy as np
import pytesseract
from pytesseract import Output

# Configure Tesseract path for Windows
if os.name == 'nt':  # Windows
    tesseract_paths = [
        r'C:\Program Files\Tesseract-OCR\tesseract.exe',
        r'C:\Program Files (x86)\Tesseract-OCR\tesseract.exe',
        r'C:\Tesseract-OCR\tesseract.exe'
    ]
    for path in tesseract_paths:
        if os.path.exists(path):
            pytesseract.pytesseract.tesseract_cmd = path
            break

def detect_lang(text):
    """Language Detection"""
    nep = sum(1 for c in text if 0x0900 <= ord(c) <= 0x097F)
    sin = sum(1 for c in text if 0x0D80 <= ord(c) <= 0x0DFF)

    print(f"Language detection: Nepali chars={nep}, Sinhala chars={sin}")

    if nep >= 3 and nep > sin:
        return "nep"
    elif sin >= 3 and sin > nep:
        return "sin"
    elif nep > 0:
        return "nep"
    elif sin > 0:
        return "sin"
    return "eng"

def extract_printed_text(image_bytes):
    """
    PRINTED OCR (NEPALI OR SINHALA)
    Detects language first, then uses only that language
    """
    try:
        print("== Tesseract Printed OCR ==")

        nparr = np.frombuffer(image_bytes, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

        if img is None:
            raise ValueError("Failed to decode image")

        h, w = img.shape[:2]
        print(f"Image size: {w}x{h}")

        # Detect language
        print("\nDetecting language...")
        nep_sample = pytesseract.image_to_string(img, lang="nep", config="--psm 3")
        sin_sample = pytesseract.image_to_string(img, lang="sin", config="--psm 3")

        nep_chars = sum(1 for c in nep_sample if 0x0900 <= ord(c) <= 0x097F)
        sin_chars = sum(1 for c in sin_sample if 0x0D80 <= ord(c) <= 0x0DFF)

        print(f"Nepali: {nep_chars} chars, Sinhala: {sin_chars} chars")

        if sin_chars > nep_chars and sin_chars >= 3:
            lang = "sin"
        elif nep_chars >= 3:
            lang = "nep"
        else:
            lang = "nep" if len(nep_sample) > len(sin_sample) else "sin"

        print(f"Detected: {lang}")

        # Full OCR with detected language
        config = "--oem 3 --psm 6"

        data = pytesseract.image_to_data(
            img,
            lang=lang,
            config=config,
            output_type=Output.DICT
        )

        lines = []
        current = ""
        last_line = data["line_num"][0] if data["text"] else 0

        for i, word in enumerate(data["text"]):
            if not word.strip():
                continue
            conf = int(data["conf"][i])
            if conf < 30:
                continue

            ln = data["line_num"][i]
            if ln != last_line:
                if current.strip():
                    lines.append(current.strip())
                current = word
                last_line = ln
            else:
                current += " " + word

        if current.strip():
            lines.append(current.strip())

        result = " ".join(lines)

        clean = result.strip()
        clean = re.sub(r'\s+', ' ', clean)
        clean = clean.replace("\u200b", "").replace("\u200c", "").replace("\ufeff", "")

        import html
        clean = html.unescape(clean)
        clean = clean.strip()

        print(f"\n===== OCR RESULT ({len(clean)} chars) =====\n{clean}")

        return clean if clean else "No text detected"

    except Exception as e:
        print(f"Printed OCR Error: {str(e)}")
        return f"Printed OCR failed: {str(e)}"
