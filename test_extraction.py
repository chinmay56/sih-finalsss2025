import io
import pdfplumber
from docx import Document

# Test TXT
print("=== Testing TXT ===")
txt_content = "यो एक परीक्षण हो। This is a test."
print(f"TXT extracted: {txt_content}")

# Test DOCX
print("\n=== Testing DOCX ===")
try:
    with open("test_sample.docx", "rb") as f:
        doc = Document(io.BytesIO(f.read()))
        text = "\n".join([para.text for para in doc.paragraphs if para.text.strip()])
        print(f"DOCX extracted: {text}")
except FileNotFoundError:
    print("test_sample.docx not found - create one to test")

# Test PDF
print("\n=== Testing PDF ===")
try:
    with open("test_sample.pdf", "rb") as f:
        with pdfplumber.open(io.BytesIO(f.read())) as pdf:
            text = ""
            for page in pdf.pages:
                page_text = page.extract_text()
                if page_text:
                    text += page_text + "\n"
            print(f"PDF extracted: {text.strip()}")
except FileNotFoundError:
    print("test_sample.pdf not found - create one to test")

print("\n=== All libraries are working! ===")
