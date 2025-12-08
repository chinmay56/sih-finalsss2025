import os
import io
import requests
from PIL import Image
import base64

# Google Vision API key
GOOGLE_API_KEY = "AIzaSyAbgeVCWl9KcuZotZagLWibRXpGa26nucw"
GOOGLE_VISION_URL = f"https://vision.googleapis.com/v1/images:annotate?key={GOOGLE_API_KEY}"

def extract_text_google_vision(image_bytes):
    """Extract text using Google Vision API"""
    try:
        # Encode image to base64
        base64_image = base64.b64encode(image_bytes).decode('utf-8')
        
        # Prepare request
        request_body = {
            "requests": [{
                "image": {"content": base64_image},
                "features": [{"type": "TEXT_DETECTION"}]
            }]
        }
        
        # Call Google Vision API
        response = requests.post(GOOGLE_VISION_URL, json=request_body, timeout=10)
        
        if response.status_code == 200:
            result = response.json()
            if 'responses' in result and len(result['responses']) > 0:
                annotations = result['responses'][0].get('textAnnotations', [])
                if annotations:
                    return annotations[0].get('description', '')
        return None
    except Exception as e:
        print(f"Google Vision API error: {e}")
        return None

def extract_text_tesseract(image_bytes):
    """Extract text using Tesseract OCR (offline fallback)"""
    try:
        import pytesseract
        from PIL import Image
        
        # Open image from bytes
        image = Image.open(io.BytesIO(image_bytes))
        
        # Extract text
        text = pytesseract.image_to_string(image)
        return text
    except ImportError:
        print("Tesseract not installed. Install with: pip install pytesseract")
        return None
    except Exception as e:
        print(f"Tesseract OCR error: {e}")
        return None

def extract_text_from_image(image_bytes):
    """Extract text from image, try Google Vision first, fallback to Tesseract"""
    # Try Google Vision API first
    text = extract_text_google_vision(image_bytes)
    
    if text:
        print("Text extracted using Google Vision API")
        return text
    
    # Fallback to Tesseract
    print("Falling back to Tesseract OCR")
    text = extract_text_tesseract(image_bytes)
    
    if text:
        return text
    
    return "Could not extract text from image"

def extract_text_from_pdf(pdf_bytes):
    """Extract text from PDF"""
    try:
        import PyPDF2
        
        pdf_file = io.BytesIO(pdf_bytes)
        pdf_reader = PyPDF2.PdfReader(pdf_file)
        
        text = ""
        for page in pdf_reader.pages:
            text += page.extract_text() + "\n"
        
        if text.strip():
            print("Text extracted from PDF using PyPDF2")
            return text.strip()
        
        # If no text found, PDF might be image-based, try OCR on first page
        return "PDF contains no extractable text. Use image-based PDF processing."
        
    except ImportError:
        return "PyPDF2 not installed. Install with: pip install PyPDF2"
    except Exception as e:
        return f"Error extracting text from PDF: {str(e)}"
