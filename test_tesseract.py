import pytesseract
import os
import sys

# Fix encoding for Windows console
sys.stdout.reconfigure(encoding='utf-8')

# Set Tesseract path
pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'

# Test if Tesseract is accessible
try:
    version = pytesseract.get_tesseract_version()
    print(f"[OK] Tesseract version: {version}")
    
    # List available languages
    langs = pytesseract.get_languages()
    print(f"\n[OK] Available languages: {langs}")
    
    if 'nep' in langs and 'sin' in langs:
        print("\n[SUCCESS] Nepali and Sinhala languages are installed!")
    else:
        print("\n[WARNING] Missing languages")
        if 'nep' not in langs:
            print("   - Nepali (nep) NOT found")
        if 'sin' not in langs:
            print("   - Sinhala (sin) NOT found")
            
except Exception as e:
    print(f"[ERROR] {e}")
