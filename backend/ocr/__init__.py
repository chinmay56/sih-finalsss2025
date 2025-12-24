# OCR Module for Nepali and Sinhala text extraction
from .auto_detect import auto_extract_text
from .handwritten_ocr import extract_handwritten_text
from .printed_ocr import extract_printed_text

__all__ = ['extract_handwritten_text', 'extract_printed_text', 'auto_extract_text']
