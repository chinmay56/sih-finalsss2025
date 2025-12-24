import os

import cv2
import easyocr
import numpy as np
import pytesseract

# Configure Tesseract
if os.name == 'nt':
    paths = [r'C:\Program Files\Tesseract-OCR\tesseract.exe',
             r'C:\Program Files (x86)\Tesseract-OCR\tesseract.exe']
    for p in paths:
        if os.path.exists(p):
            pytesseract.pytesseract.tesseract_cmd = p
            break

_easyocr_reader = None

def get_easyocr():
    global _easyocr_reader
    if _easyocr_reader is None:
        _easyocr_reader = easyocr.Reader(['ne'], gpu=False)
    return _easyocr_reader

def detect_language_from_text(text):
    """Detect language based on Unicode ranges"""
    nep = sum(1 for c in text if '\u0900' <= c <= '\u097F')
    sin = sum(1 for c in text if '\u0D80' <= c <= '\u0DFF')
    if nep > sin:
        return 'nep'
    elif sin > 0:
        return 'sin'
    return 'en'

def is_handwritten_from_text(text, edge_density, variance):
    """Determine if handwritten based on OCR quality and image metrics"""
    # Low confidence indicators: short text, high metrics
    if len(text.strip()) < 10 and (edge_density > 0.08 or variance > 1500):
        return True
    # High variance/edge density = handwritten
    if edge_density > 0.15 or variance > 2500:
        return True
    return False

def auto_extract_text(image_bytes):
    """OCR with automatic language and style detection"""
    try:
        nparr = np.frombuffer(image_bytes, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_GRAYSCALE)
        if img is None:
            return "Failed to decode image"

        # Calculate image metrics
        edges = cv2.Canny(img, 50, 150)
        edge_density = np.sum(edges > 0) / edges.size
        variance = np.var(img)
        print(f"Metrics - Edge: {edge_density:.4f}, Var: {variance:.2f}")

        # Try Tesseract first (faster for printed text)
        tess_text = pytesseract.image_to_string(img, lang='nep+sin+eng')
        lang = detect_language_from_text(tess_text)
        print(f"Tesseract result ({len(tess_text)} chars), Lang: {lang}")

        # Check if handwritten based on quality
        if is_handwritten_from_text(tess_text, edge_density, variance):
            print("Switching to EasyOCR (handwritten detected)")
            reader = get_easyocr()
            results = reader.readtext(img, detail=0)
            easy_text = ' '.join(results)
            lang = detect_language_from_text(easy_text)
            print(f"EasyOCR result ({len(easy_text)} chars), Lang: {lang}")
            return easy_text if easy_text.strip() else "No text detected"

        return tess_text.strip() if tess_text.strip() else "No text detected"

    except Exception as e:
        print(f"OCR Error: {e}")
        return f"OCR failed: {str(e)}"
