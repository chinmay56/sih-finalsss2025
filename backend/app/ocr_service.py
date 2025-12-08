import requests
import os
import base64
from dotenv import load_dotenv

class OCRService:
    def __init__(self):
        load_dotenv()
        self.api_key = os.getenv('GOOGLE_VISION_API_KEY')
    
    def extract_text(self, image_bytes):
        if not self.api_key:
            return "Google Vision API key not configured"
        
        try:
            result = self._google_ocr(image_bytes)
            print(f"Vision API result: {result}")
            return result
        except Exception as e:
            print(f"Vision API failed: {e}")
            return f"OCR failed: {str(e)}"
    
    def _google_ocr(self, image_bytes):
        url = f'https://vision.googleapis.com/v1/images:annotate?key={self.api_key}'
        
        encoded_image = base64.b64encode(image_bytes).decode('utf-8')
        
        payload = {
            'requests': [{
                'image': {'content': encoded_image},
                'features': [{'type': 'TEXT_DETECTION'}]
            }]
        }
        
        headers = {'Referer': 'http://localhost:3000'}
        response = requests.post(url, json=payload, headers=headers)
        
        if response.status_code != 200:
            raise Exception(f"API Error {response.status_code}: {response.text}")
            
        result = response.json()
        
        if 'error' in result:
            raise Exception(f"Vision API error: {result['error']['message']}")
        
        if 'responses' in result and result['responses']:
            annotations = result['responses'][0].get('textAnnotations', [])
            return annotations[0]['description'] if annotations else "No text found"
        return "No text detected"

ocr_service = OCRService()