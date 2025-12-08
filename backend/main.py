import os
import torch
import requests
import base64
import io
import re
from typing import List
from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from transformers import MBart50TokenizerFast, MBartForConditionalGeneration
from dotenv import load_dotenv
import uvicorn
import pdfplumber
from docx import Document
from PIL import Image
import zipfile
import easyocr
from pdf2image import convert_from_bytes

# Load environment variables
load_dotenv()

app = FastAPI(
    title="Translation API",
    description="Translate Nepali/Sinhala to English using fine-tuned MBART",
    version="1.0"
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

def load_model_lazy():
    global tokenizer, model, device
    
    if tokenizer is None or model is None:
        try:
            MODEL_ID = os.getenv("MODEL_ID", "Nikss2709/Mbart-nepali-sinhala-finetuned")
            
            print("Loading tokenizer...")
            tokenizer = MBart50TokenizerFast.from_pretrained(MODEL_ID)
            
            print("Loading model with low memory usage...")
            device = "cuda" if torch.cuda.is_available() else "cpu"
            model = MBartForConditionalGeneration.from_pretrained(
                MODEL_ID,
                low_cpu_mem_usage=True,
                torch_dtype=torch.float16 if device == "cuda" else torch.float32
            )
            
            model = model.to(device)
            model.eval()
            
            print(f"Model loaded on: {device}")
        except Exception as e:
            print(f"ERROR loading model: {e}")
            raise HTTPException(status_code=503, detail=f"Model loading failed: {str(e)}")

def translate_text(text: str, src_lang: str, tgt_lang: str):
    try:
        print(f"\n=== Starting translation ===")
        print(f"Text: '{text}'")
        print(f"From {src_lang} to {tgt_lang}")
        
        load_model_lazy()
        
        if not tokenizer or not model:
            raise HTTPException(status_code=500, detail="Model not loaded")
        
        print(f"Setting tokenizer languages...")
        tokenizer.src_lang = src_lang
        tokenizer.tgt_lang = tgt_lang

        MAX_TOKENS = 128  # Current limit; increase to 256/512 if needed (mBART max is 1024)

        # Split text into sentences using regex for multilingual punctuation
        sentences = re.split(r'(?<=[.!?।])\s+', text.strip())

        # Group sentences into chunks based on token length
        chunks = []
        current_chunk = []
        for sent in sentences:
            # Tentatively add to current chunk and check tokenized length
            test_chunk = ' '.join(current_chunk + [sent])
            encoded_test = tokenizer(
                test_chunk,
                return_tensors="pt",
                truncation=False,
                add_special_tokens=True
            )['input_ids'][0]
            if len(encoded_test) <= MAX_TOKENS:
                current_chunk.append(sent)
            else:
                if current_chunk:
                    chunks.append(' '.join(current_chunk))
                current_chunk = [sent]  # Start new chunk

        if current_chunk:
            chunks.append(' '.join(current_chunk))

        print(f"Split into {len(chunks)} chunks")

        # Translate each chunk
        translated_chunks = []
        for idx, chunk_text in enumerate(chunks):
            print(f"Translating chunk {idx + 1}/{len(chunks)}: '{chunk_text}'")
            encoded = tokenizer(
                chunk_text,
                return_tensors="pt",
                truncation=True,
                padding=True,
                max_length=MAX_TOKENS
            ).to(device)
            print(f"Chunk encoded, shape: {encoded['input_ids'].shape}")

            generated = model.generate(
                **encoded,
                max_length=MAX_TOKENS * 2,  # Allow longer output if needed
                num_beams=4,
                early_stopping=True
            )
            output = tokenizer.decode(generated[0], skip_special_tokens=True)
            translated_chunks.append(output)
            print(f"Chunk translated: '{output}'")

        # Join translated chunks
        final_output = ' '.join(translated_chunks)
        print(f"Final output: '{final_output}'")
        print(f"=== Translation complete ===\n")
        return final_output
    except Exception as e:
        print(f"\n!!! ERROR in translate_text: {str(e)}")
        import traceback
        traceback.print_exc()
        raise

@app.get("/")
def home():
    return {"message": "Translation API is running!", "status": "healthy"}

@app.post("/translate")
def translate_api(req: TranslateRequest):
    try:
        print(f"\nReceived translation request: {req}")
        result = translate_text(req.text, req.src_lang, req.tgt_lang)
        return {"translated_text": result, "source_language": req.src_lang, "target_language": req.tgt_lang}
    except Exception as e:
        print(f"\n!!! ERROR in translate_api: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Translation failed: {str(e)}")

@app.get("/supported-languages")
def get_supported_languages():
    return {
        "languages": [
            {"code": "ne_NP", "name": "Nepali", "display": "नेपाली"},
            {"code": "si_LK", "name": "Sinhala", "display": "සිංහල"},
            {"code": "en_XX", "name": "English", "display": "English"}
        ]
    }

@app.get("/health")
def health_check():
    model_status = "loaded" if model is not None else "not_loaded"
    return {
        "status": "healthy",
        "model_status": model_status,
        "device": device if device else "unknown"
    }

@app.post("/ocr/printed")
async def extract_printed_text(file: UploadFile = File(...)):
    try:
        image_bytes = await file.read()
        image = Image.open(io.BytesIO(image_bytes))
        reader = easyocr.Reader(['ne', 'si', 'en'], gpu=False)
        result = reader.readtext(image, detail=0)
        text = ' '.join(result)
        
        if text.strip():
            return {"extracted_text": text.strip(), "type": "printed"}
        return {"extracted_text": "No text found in image", "type": "printed"}
    except Exception as e:
        print(f"OCR Error: {str(e)}")
        return {"extracted_text": "OCR extraction failed", "type": "printed"}

@app.post("/ocr/handwritten")
async def extract_handwritten_text(file: UploadFile = File(...)):
    try:
        image_bytes = await file.read()
        image = Image.open(io.BytesIO(image_bytes))
        reader = easyocr.Reader(['ne', 'si', 'en'], gpu=False)
        result = reader.readtext(image, detail=0)
        text = ' '.join(result)
        
        if text.strip():
            return {"extracted_text": text.strip(), "type": "handwritten"}
        return {"extracted_text": "No text found in image", "type": "handwritten"}
    except Exception as e:
        print(f"OCR Error: {str(e)}")
        return {"extracted_text": "OCR extraction failed", "type": "handwritten"}

def extract_text_from_file(file_bytes: bytes, filename: str) -> str:
    ext = filename.lower().split('.')[-1]
    print(f"\n=== Extracting text from {filename} (type: {ext}) ===")
    
    try:
        if ext in ['jpg', 'jpeg', 'png', 'bmp']:
            reader = easyocr.Reader(['ne', 'si', 'en'], gpu=False)
            image = Image.open(io.BytesIO(file_bytes))
            result = reader.readtext(image, detail=0)
            text = ' '.join(result)
            print(f"SUCCESS: Extracted {len(text)} characters from image using EasyOCR")
            return text.strip()
        
        elif ext == 'pdf':
            # Try text extraction first
            with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:
                text = ""
                for page in pdf.pages:
                    page_text = page.extract_text()
                    if page_text:
                        text += page_text + "\n"
            
            # If no text found, use OCR on scanned PDF
            if not text.strip():
                print("No embedded text found, using OCR...")
                reader = easyocr.Reader(['ne', 'si', 'en'], gpu=False)
                images = convert_from_bytes(file_bytes)
                for img in images:
                    result = reader.readtext(img, detail=0)
                    text += ' '.join(result) + "\n"
            
            print(f"SUCCESS: Extracted {len(text)} characters from PDF")
            return text.strip()
        
        elif ext in ['doc', 'docx']:
            doc = Document(io.BytesIO(file_bytes))
            text = "\n".join([para.text for para in doc.paragraphs if para.text.strip()])
            print(f"SUCCESS: Extracted {len(text)} characters from Word doc")
            return text
        
        elif ext == 'txt':
            text = file_bytes.decode('utf-8', errors='ignore')
            print(f"SUCCESS: Extracted {len(text)} characters from TXT")
            return text
        
        print(f"ERROR: Unsupported file type: {ext}")
        return ""
    except Exception as e:
        print(f"ERROR extracting text from {filename}: {str(e)}")
        import traceback
        traceback.print_exc()
        return ""

@app.post("/bulk-translate")
async def bulk_translate(files: List[UploadFile] = File(...)):
    results = []
    
    for file in files:
        try:
            file_bytes = await file.read()
            text = extract_text_from_file(file_bytes, file.filename)
            
            if not text.strip():
                results.append({
                    "filename": file.filename,
                    "status": "error",
                    "error": "No text extracted"
                })
                continue
            
            src_lang = 'ne_NP'
            if any('\u0D80' <= c <= '\u0DFF' for c in text):
                src_lang = 'si_LK'
            
            translated = translate_text(text, src_lang, 'en_XX')
            
            results.append({
                "filename": file.filename,
                "status": "success",
                "original_text": text,
                "translated_text": translated,
                "detected_language": src_lang
            })
        except Exception as e:
            results.append({
                "filename": file.filename,
                "status": "error",
                "error": str(e)
            })
    
    return {"results": results}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=False, workers=1)