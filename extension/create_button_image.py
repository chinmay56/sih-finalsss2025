from PIL import Image, ImageDraw, ImageFont
import os

# Create a simple button image
def create_button_image():
    # Create a 100x100 image with cultural colors
    size = 100
    img = Image.new('RGB', (size, size), '#8B4513')  # Brown background
    draw = ImageDraw.Draw(img)
    
    # Draw a golden circle
    margin = 10
    draw.ellipse([margin, margin, size-margin, size-margin], 
                fill='#DAA520', outline='#CD853F', width=3)
    
    # Add text in center
    try:
        font = ImageFont.truetype("arial.ttf", 24)
    except:
        font = ImageFont.load_default()
    
    # Draw "ST" text
    text = "ST"
    bbox = draw.textbbox((0, 0), text, font=font)
    text_width = bbox[2] - bbox[0]
    text_height = bbox[3] - bbox[1]
    
    x = (size - text_width) // 2
    y = (size - text_height) // 2
    
    draw.text((x, y), text, fill='white', font=font)
    
    # Save as JPG
    img.save('button_icon.jpg', 'JPEG', quality=95)
    print("Button image created: button_icon.jpg")

if __name__ == "__main__":
    create_button_image()