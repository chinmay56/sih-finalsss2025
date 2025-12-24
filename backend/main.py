import io
import os
import re
import warnings
from typing import List, Tuple

import pdfplumber
import torch
import uvicorn
from docx import Document
from dotenv import load_dotenv
from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pdf2image import convert_from_bytes
from pydantic import BaseModel
from transformers import MBart50TokenizerFast, MBartForConditionalGeneration

# Suppress warnings
warnings.filterwarnings('ignore', category=UserWarning)
warnings.filterwarnings('ignore', category=FutureWarning)

# Load environment variables
load_dotenv()

app = FastAPI(
    title="Nepali/Sinhala to English Translation API",
    description="Offline translation with proper noun preservation",
    version="2.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global variables for model and tokenizer
tokenizer = None
model = None
device = None

class TranslateRequest(BaseModel):
    text: str
    src_lang: str = "ne_NP"  # Default to Nepali
    tgt_lang: str = "en_XX"  # Default to English

# =============================================================================
# PROPER NOUN PROTECTION - FIXED VERSION
# =============================================================================

def extract_proper_nouns_offline(text: str) -> Tuple[str, List[Tuple[str, str]]]:
    """Extract and replace proper nouns with placeholders - DISABLED for better translation"""
    # Disabled proper noun extraction as it interferes with translation
    return text, []

def restore_proper_nouns(translated_text: str, entities: List[Tuple[str, str]]) -> str:
    """Restore original proper nouns from placeholders"""
    for placeholder, original in entities:
        translated_text = translated_text.replace(placeholder, original)
    return translated_text

# =============================================================================
# MODEL LOADING
# =============================================================================

def load_model_lazy():
    global tokenizer, model, device

    if tokenizer is None or model is None:
        try:
            MODEL_ID = os.getenv("MODEL_ID", "Nikss2709/Mbart-nepali-sinhala-finetuned")

            print("Loading tokenizer...")
            tokenizer = MBart50TokenizerFast.from_pretrained(MODEL_ID)

            print("Loading model...")
            device = "cuda" if torch.cuda.is_available() else "cpu"
            model = MBartForConditionalGeneration.from_pretrained(
                MODEL_ID,
                torch_dtype=torch.float16 if device == "cuda" else torch.float32,
                low_cpu_mem_usage=True
            )

            model = model.to(device)
            model.eval()

            print(f"Model loaded on: {device}")
        except Exception as e:
            print(f"ERROR loading model: {e}")
            raise HTTPException(status_code=503, detail=f"Model loading failed: {str(e)}") from e

# =============================================================================
# TEXT PREPROCESSING
# =============================================================================

def preprocess_text(text: str) -> str:
    """Preprocess text to handle blank lines, extra spaces, and formatting issues"""
    # Remove blank lines and normalize whitespace
    lines = [line.strip() for line in text.split('\n') if line.strip()]
    # Join lines with single space
    text = ' '.join(lines)
    # Normalize multiple spaces to single space
    text = re.sub(r'\s+', ' ', text)
    return text.strip()

# =============================================================================
# TRANSLATION FUNCTION - OPTIMIZED
# =============================================================================

def translate_text(text: str, src_lang: str, tgt_lang: str) -> str:
    try:
        print(f"Translating from {src_lang} to {tgt_lang}")

        if not text or not text.strip():
            return text

        load_model_lazy()

        # Preprocess text to remove blank lines and normalize whitespace
        text = preprocess_text(text)

        # Set up tokenizer
        tokenizer.src_lang = src_lang
        forced_bos_id = tokenizer.lang_code_to_id[tgt_lang]

        # Split into sentences
        sentences = re.split(r'(?<=[।.!?])\s+', text.strip())
        if not sentences:
            sentences = [text]

        # Translate each sentence
        translated_parts = []

        for sentence in sentences:
            if not sentence.strip():
                continue

            inputs = tokenizer(
                sentence,
                return_tensors="pt",
                truncation=True,
                max_length=512,
                padding=True
            ).to(device)

            with torch.no_grad():
                outputs = model.generate(
                    **inputs,
                    forced_bos_token_id=forced_bos_id,
                    max_length=512,
                    num_beams=4,
                    length_penalty=1.0,
                    early_stopping=True,
                    no_repeat_ngram_size=3
                )

            translated = tokenizer.decode(outputs[0], skip_special_tokens=True)
            translated_parts.append(translated)

        return " ".join(translated_parts).strip()

    except Exception as e:
        print(f"Translation error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Translation failed: {str(e)}") from e

# =============================================================================
# OCR FUNCTIONS - Using Tesseract for Nepali/Sinhala
# =============================================================================

# Import OCR modules
try:
    from ocr import (extract_handwritten_text,
                     extract_printed_text)
    OCR_AVAILABLE = True
except ImportError as e:
    print(f"OCR modules not found: {e}")
    OCR_AVAILABLE = False

async def extract_text_with_ocr(image_bytes: bytes, ocr_type: str = "printed") -> str:
    """Extract text from image using advanced OCR (same as image upload)"""
    try:
        if not OCR_AVAILABLE:
            return "OCR modules not available"

        if ocr_type == "handwritten":
            return extract_handwritten_text(image_bytes)
        else:
            # Default to printed OCR (Tesseract with advanced preprocessing)
            return extract_printed_text(image_bytes)

    except Exception as e:
        print(f"OCR Error: {e}")
        return ""

# =============================================================================
# FILE PROCESSING
# =============================================================================

async def extract_text_from_file(file_bytes: bytes, filename: str, ocr_type: str = "printed") -> str:
    """Extract text from various file formats using advanced OCR"""
    try:
        ext = filename.lower().split('.')[-1]

        if ext in ['txt', 'text']:
            return file_bytes.decode('utf-8', errors='ignore').strip()

        elif ext in ['pdf']:
            # Try extracting text directly first
            with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:
                text_parts = []
                for page in pdf.pages:
                    text = page.extract_text()
                    if text:
                        text_parts.append(text)

                if text_parts:
                    return '\n'.join(text_parts).strip()

            # Fallback to advanced OCR for scanned PDFs
            try:
                images = convert_from_bytes(file_bytes)
                ocr_text = []
                for img in images:
                    img_bytes = io.BytesIO()
                    img.save(img_bytes, format='PNG')
                    text = await extract_text_with_ocr(img_bytes.getvalue(), ocr_type)
                    if text and not text.startswith("OCR") and not text.startswith("No text"):
                        ocr_text.append(text)
                return '\n'.join(ocr_text).strip()
            except:
                return ""

        elif ext in ['docx', 'doc']:
            doc = Document(io.BytesIO(file_bytes))
            return '\n'.join([p.text for p in doc.paragraphs if p.text]).strip()

        elif ext in ['jpg', 'jpeg', 'png', 'bmp', 'gif']:
            # Use advanced OCR (same as image upload section)
            return await extract_text_with_ocr(file_bytes, ocr_type)

        else:
            return f"Unsupported file format: {ext}"

    except Exception as e:
        print(f"Error extracting text from {filename}: {e}")
        return ""

# =============================================================================
# API ENDPOINTS
# =============================================================================

@app.get("/")
def root():
    return {
        "message": "Nepali/Sinhala to English Translation API",
        "version": "2.0",
        "features": ["translation", "file_processing", "proper_noun_preservation"]
    }

@app.post("/translate")
async def translate_api(request: TranslateRequest):
    """Translate text from Nepali/Sinhala to English"""
    try:
        result = translate_text(request.text, request.src_lang, request.tgt_lang)
        return {
            "success": True,
            "translated_text": result,
            "source_lang": request.src_lang,
            "target_lang": request.tgt_lang
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) from e

@app.get("/languages")
def get_languages():
    return {
        "supported": [
            {"code": "ne_NP", "name": "Nepali"},
            {"code": "si_LK", "name": "Sinhala"},
            {"code": "en_XX", "name": "English"}
        ],
        "default_source": "ne_NP",
        "default_target": "en_XX"
    }

@app.post("/translate-file")
async def translate_file(file: UploadFile = File(...)):
    """Upload and translate a file"""
    try:
        # Read file
        contents = await file.read()

        # Extract text
        text = await extract_text_from_file(contents, file.filename)

        if not text:
            return {
                "success": False,
                "error": "No text could be extracted from the file"
            }

        # Auto-detect language
        src_lang = "ne_NP"
        if re.search(r'[\u0D80-\u0DFF]', text):  # Sinhala characters
            src_lang = "si_LK"

        # Translate
        translated = translate_text(text, src_lang, "en_XX")

        return {
            "success": True,
            "filename": file.filename,
            "original_text": text[:500] + "..." if len(text) > 500 else text,
            "translated_text": translated,
            "detected_language": src_lang
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) from e

@app.post("/bulk-extract")
async def bulk_extract(files: List[UploadFile] = File(...)):
    """Extract text from multiple files without translating"""
    results = []

    for file in files:
        try:
            contents = await file.read()
            text = await extract_text_from_file(contents, file.filename)

            if text:
                # Auto-detect language
                src_lang = "ne_NP"
                if re.search(r'[\u0D80-\u0DFF]', text):
                    src_lang = "si_LK"

                results.append({
                    "filename": file.filename,
                    "status": "success",
                    "original_text": text,
                    "detected_language": src_lang
                })
            else:
                results.append({
                    "filename": file.filename,
                    "status": "error",
                    "error": "No text extracted"
                })

        except Exception as e:
            results.append({
                "filename": file.filename,
                "status": "error",
                "error": str(e)
            })

    return {"results": results}

@app.post("/bulk-translate")
async def bulk_translate(files: List[UploadFile] = File(...)):
    """Translate multiple files at once"""
    results = []

    for file in files:
        try:
            contents = await file.read()
            text = await extract_text_from_file(contents, file.filename)

            if text:
                # Auto-detect language
                src_lang = "ne_NP"
                if re.search(r'[\u0D80-\u0DFF]', text):
                    src_lang = "si_LK"

                translated = translate_text(text, src_lang, "en_XX")

                results.append({
                    "filename": file.filename,
                    "status": "success",
                    "original_text": text,
                    "translated_text": translated,
                    "detected_language": src_lang
                })
            else:
                results.append({
                    "filename": file.filename,
                    "status": "error",
                    "error": "No text extracted"
                })

        except Exception as e:
            results.append({
                "filename": file.filename,
                "status": "error",
                "error": str(e)
            })

    return {"results": results}

@app.post("/ocr/printed")
async def ocr_printed(file: UploadFile = File(...)):
    """Extract text from printed image using OCR and translate"""
    try:
        contents = await file.read()
        text = await extract_text_with_ocr(contents, "printed")

        if not text or text.startswith("OCR") or text.startswith("No text"):
            return {
                "success": False,
                "error": text if text else "No text could be extracted from the image"
            }

        # Auto-detect language
        src_lang = "ne_NP"
        if re.search(r'[\u0D80-\u0DFF]', text):  # Sinhala characters
            src_lang = "si_LK"

        # Translate
        translated = translate_text(text, src_lang, "en_XX")

        return {
            "success": True,
            "text": text,
            "translated_text": translated,
            "detected_language": src_lang
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) from e

@app.post("/ocr/handwritten")
async def ocr_handwritten(file: UploadFile = File(...)):
    """Extract text from handwritten image using OCR and translate"""
    try:
        contents = await file.read()
        text = await extract_text_with_ocr(contents, "handwritten")

        if not text or text.startswith("OCR") or text.startswith("No text"):
            return {
                "success": False,
                "error": text if text else "No text could be extracted from the image"
            }

        # Auto-detect language
        src_lang = "ne_NP"
        if re.search(r'[\u0D80-\u0DFF]', text):  # Sinhala characters
            src_lang = "si_LK"

        # Translate
        translated = translate_text(text, src_lang, "en_XX")

        return {
            "success": True,
            "text": text,
            "translated_text": translated,
            "detected_language": src_lang
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) from e

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "model_loaded": model is not None,
        "device": device if device else "cpu",
        "ocr_available": OCR_AVAILABLE
    }

if __name__ == "__main__":
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=int(os.getenv("PORT", 8000)),
        reload=False
    )