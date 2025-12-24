# 🔧 Installation Instructions for Python 3.13

## Issue: Python 3.13 Compatibility

Python 3.13 has compatibility issues with some older packages. Follow these steps:

## Step 1: Upgrade pip and setuptools

```bash
python.exe -m pip install --upgrade pip setuptools wheel
```

## Step 2: Install packages individually (skip errors)

```bash
# Core API packages
pip install fastapi==0.115.2
pip install uvicorn[standard]==0.30.6
pip install python-multipart==0.0.9
pip install pydantic==2.9.2
pip install python-dotenv==1.0.1

# Hugging Face + Model (already installed)
pip install transformers==4.44.2
# torch and sentencepiece are already installed

# Document & Image Processing
pip install pdfplumber==0.11.4
pip install python-docx==1.1.2
pip install Pillow==10.4.0
# pdf2image and easyocr are already installed

# OCR Dependencies
pip install pytesseract==0.3.10

# Optional (already installed)
# numpy and opencv-python-headless are already installed
```

## Step 3: Verify Installation

```bash
python -c "import fastapi, uvicorn, easyocr, pytesseract, cv2; print('✅ All packages installed!')"
```

## Step 4: Install Tesseract OCR

1. Download: https://github.com/UB-Mannheim/tesseract/wiki
2. Install to: `C:\Program Files\Tesseract-OCR\`
3. Download language files:
   - https://github.com/tesseract-ocr/tessdata/raw/main/nep.traineddata
   - https://github.com/tesseract-ocr/tessdata/raw/main/sin.traineddata
4. Place in: `C:\Program Files\Tesseract-OCR\tessdata\`

## Step 5: Run the Server

```bash
cd backend
python main.py
```

## Alternative: Use Python 3.11 or 3.12

If issues persist, consider using Python 3.11 or 3.12 which have better package compatibility:

```bash
# Download Python 3.11 from python.org
# Create virtual environment
python3.11 -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
```
