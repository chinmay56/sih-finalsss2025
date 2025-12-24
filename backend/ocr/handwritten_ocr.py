
import cv2
import easyocr
import numpy as np

# Global EasyOCR reader
_reader = None

def get_reader():
    """Lazy load EasyOCR reader"""
    global _reader
    if _reader is None:
        print("🔄 Initializing EasyOCR reader...")
        _reader = easyocr.Reader(['ne', 'si', 'en'], gpu=False, verbose=False)
        print("✅ EasyOCR ready!")
    return _reader

def preprocess_for_ocr(image_bytes):
    """ADVANCED IMAGE PREPROCESSING"""
    nparr = np.frombuffer(image_bytes, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

    if img is None:
        raise ValueError("Could not read image")

    # Convert to grayscale
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

    # CLAHE for contrast enhancement
    clahe = cv2.createCLAHE(clipLimit=2.5, tileGridSize=(8,8))
    enhanced = clahe.apply(gray)

    # Bilateral filter to preserve edges while denoising
    denoised = cv2.bilateralFilter(enhanced, 9, 75, 75)

    # Adaptive thresholding
    thresh = cv2.adaptiveThreshold(
        denoised, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
        cv2.THRESH_BINARY, 11, 2
    )

    # Morphological operations
    kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (2, 2))
    cleaned = cv2.morphologyEx(thresh, cv2.MORPH_CLOSE, kernel)
    cleaned = cv2.morphologyEx(cleaned, cv2.MORPH_OPEN, kernel)

    # Sharpen
    sharpen_kernel = np.array([[0,-1,0], [-1,5,-1], [0,-1,0]])
    sharpened = cv2.filter2D(cleaned, -1, sharpen_kernel)

    return sharpened

def nepali_ocr(image, confidence_threshold=0.3):
    """OCR with enhanced bounding box processing"""
    if len(image.shape) == 2:
        rgb_image = cv2.cvtColor(image, cv2.COLOR_GRAY2RGB)
    else:
        rgb_image = image

    reader = get_reader()
    results = reader.readtext(rgb_image, paragraph=False, detail=1)

    print(f"\nDetected {len(results)} text regions")

    # Enhanced sorting: group by lines based on y-coordinate proximity
    boxes = []
    for bbox, text, conf in results:
        if conf > confidence_threshold:
            # Get center y-coordinate for line grouping
            y_center = (bbox[0][1] + bbox[2][1]) / 2
            x_left = bbox[0][0]
            boxes.append({
                'text': text,
                'y': y_center,
                'x': x_left,
                'conf': conf
            })
            print(f"  [{conf:.2f}] {text}")

    if not boxes:
        return ""

    # Group into lines (tolerance of 15 pixels for same line)
    boxes.sort(key=lambda b: (b['y'], b['x']))
    lines = []
    current_line = [boxes[0]]

    for box in boxes[1:]:
        if abs(box['y'] - current_line[-1]['y']) < 15:
            current_line.append(box)
        else:
            # Sort current line by x position
            current_line.sort(key=lambda b: b['x'])
            lines.append(' '.join([b['text'] for b in current_line]))
            current_line = [box]

    # Add last line
    if current_line:
        current_line.sort(key=lambda b: b['x'])
        lines.append(' '.join([b['text'] for b in current_line]))

    return ' '.join(lines)

def detect_script(text):
    """Detect script language from extracted text"""
    nep = sum(1 for c in text if '\u0900' <= c <= '\u097F')
    sin = sum(1 for c in text if '\u0D80' <= c <= '\u0DFF')

    print(f"Script detection: Nepali={nep}, Sinhala={sin}")

    if nep >= 3 and nep > sin:
        return "nep"
    elif sin >= 3 and sin > nep:
        return "sin"
    elif nep > 0:
        return "nep"
    elif sin > 0:
        return "sin"
    return "eng"

def extract_handwritten_text(image_bytes):
    """
    Enhanced Nepali/Sinhala OCR with preprocessing and bounding box grouping
    """
    try:
        print("\n== EasyOCR Handwritten Processing ==")

        # Decode original image
        nparr = np.frombuffer(image_bytes, np.uint8)
        original = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

        if original is None:
            raise ValueError("Failed to decode image")

        # Preprocess image
        print("Preprocessing image...")
        processed_img = preprocess_for_ocr(image_bytes)

        # Try preprocessed first (usually better for handwritten)
        print("\nProcessing PREPROCESSED image:")
        proc_text = nepali_ocr(processed_img, confidence_threshold=0.25)

        # Fallback to original if preprocessed gives poor results
        if len(proc_text.strip()) < 5:
            print("\nFallback to ORIGINAL image:")
            orig_text = nepali_ocr(original, confidence_threshold=0.25)
            final_text = orig_text if len(orig_text) > len(proc_text) else proc_text
        else:
            final_text = proc_text

        # Clean result
        final_text = final_text.strip()

        # Detect script
        detected_script = detect_script(final_text)
        print(f"Detected script: {detected_script}")

        print(f"\n===== OCR RESULT ({len(final_text)} chars) =====\n{final_text[:200]}")

        return final_text if final_text else "No text detected"

    except Exception as e:
        print(f"Handwritten OCR Error: {str(e)}")
        return f"Handwritten OCR failed: {str(e)}"
