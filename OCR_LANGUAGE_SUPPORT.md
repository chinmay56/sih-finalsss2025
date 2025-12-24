# OCR Language Support

## Printed Text OCR (Tesseract)
✅ **Nepali** - Fully supported
✅ **Sinhala** - Fully supported
✅ **English** - Fully supported

**Engine:** Tesseract 5.4.0
**File:** `backend/ocr/printed_ocr.py`

## Handwritten Text OCR (EasyOCR)
✅ **Nepali** - Fully supported
❌ **Sinhala** - NOT supported by EasyOCR
✅ **English** - Fully supported

**Engine:** EasyOCR 1.7.2
**File:** `backend/ocr/handwritten_ocr.py`

## Recommendation
- **Nepali printed/handwritten:** Use either OCR (auto-detect works)
- **Sinhala printed:** Use printed OCR (Tesseract)
- **Sinhala handwritten:** Use printed OCR (Tesseract is better than nothing)

## Auto-Detection Logic
The system detects handwritten vs printed text and routes to the appropriate engine:
- Handwritten → EasyOCR (Nepali/English only)
- Printed → Tesseract (Nepali/Sinhala/English)

**For Sinhala text:** The auto-detection will likely route to Tesseract (printed OCR) which supports Sinhala.
