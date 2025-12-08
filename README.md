# Translation Tool

A web application for translating Nepali and Sinhala text to English using machine learning models.

## Project Structure

```
Translation tool/
├── backend/
│   ├── main.py              # FastAPI server
│   ├── requirements.txt     # Python dependencies
│   └── model/              # Translation model files
│       ├── adapter_model.safetensors
│       ├── adapter_config.json
│       ├── tokenizer.json
│       └── ...
└── frontend/
    ├── src/
    │   ├── app/
    │   │   ├── page.tsx     # Main page
    │   │   ├── layout.tsx   # Root layout
    │   │   └── globals.css  # Global styles
    │   └── components/
    │       └── TranslationForm.tsx  # Translation interface
    ├── package.json
    └── ...
```

## Setup Instructions

### Backend Setup

1. Navigate to backend directory:
   ```bash
   cd backend
   ```

2. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Start the FastAPI server:
   ```bash
   python main.py
   ```

   The API will be available at `http://localhost:8000`

### Frontend Setup

1. Navigate to frontend directory:
   ```bash
   cd frontend
   ```

2. Install Node.js dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

   The website will be available at `http://localhost:3000`

## Usage

1. Start both backend and frontend servers
2. Open `http://localhost:3000` in your browser
3. Select source language (Nepali or Sinhala)
4. Enter text to translate
5. Click "Translate" to get English translation

## API Endpoints

- `GET /` - Health check
- `POST /translate` - Translate text
- `GET /supported-languages` - Get supported languages

## Features

- Support for Nepali to English translation
- Support for Sinhala to English translation
- Clean, responsive web interface
- Real-time translation
- Error handling and loading states
- OCR support for printed and handwritten text
- Voice input and text-to-speech output
- File download capabilities

## VPS Deployment (e.g., Hostinger KVM 8)

### Prerequisites Installation

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install required packages
sudo apt install -y python3 python3-pip python3-venv nodejs npm nginx git git-lfs

# Install Docker (recommended)
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

### Deployment Steps

1. **Clone Repository with LFS**:
   ```bash
   git clone https://github.com/JayBhandarkar/aditya_host.git
   cd aditya_host
   git lfs pull  # Download model files
   ```

2. **Docker Deployment (Recommended)**:
   ```bash
   # Production deployment
   docker-compose -f docker-compose.prod.yml up -d --build
   
   # Check status
   docker-compose ps
   ```

3. **Manual Deployment (Alternative)**:
   
   **Backend Setup**:
   ```bash
   cd backend
   python3 -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt
   
   # Run in background
   nohup python main.py > backend.log 2>&1 &
   ```
   
   **Frontend Setup**:
   ```bash
   cd frontend
   cp .env.production .env.local
   # Edit .env.local with your domain/IP
   
   npm install
   npm run build
   
   # Run in background
   nohup npm start > frontend.log 2>&1 &
   ```

4. **Nginx Configuration**:
   ```bash
   sudo nano /etc/nginx/sites-available/default
   ```
   
   Add this configuration:
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;  # Replace with your domain/IP
       
       client_max_body_size 10M;
       
       # API routes
       location /api/ {
           rewrite ^/api/(.*) /$1 break;
           proxy_pass http://127.0.0.1:8000;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_read_timeout 300s;
       }
       
       # Direct backend routes
       location ~ ^/(translate|health|supported-languages|ocr) {
           proxy_pass http://127.0.0.1:8000;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_read_timeout 300s;
       }
       
       # Frontend routes
       location / {
           proxy_pass http://127.0.0.1:3000;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
       }
   }
   ```
   
   ```bash
   # Test and restart Nginx
   sudo nginx -t
   sudo systemctl restart nginx
   sudo systemctl enable nginx
   ```

5. **Firewall Setup**:
   ```bash
   sudo ufw allow 80
   sudo ufw allow 443
   sudo ufw allow 22
   sudo ufw enable
   ```

### Environment Configuration

- Update `frontend/.env.local` with your domain:
  ```
  NEXT_PUBLIC_API_URL=https://your-domain.com
  ```

- Update `backend/.env` with API keys:
  ```
  GOOGLE_VISION_API_KEY=your_google_vision_api_key
  MODEL_ID=Nikss2709/Mbart-nepali-sinhala-finetuned
  ```

### Monitoring

```bash
# Check Docker logs
docker-compose logs -f

# Check manual deployment logs
tail -f backend.log
tail -f frontend.log

# Check system resources
htop
docker stats
```

### KVM 8 Resource Usage

- **Backend**: 8GB RAM, 4 CPU cores (ML model)
- **Frontend**: 2GB RAM, 2 CPU cores
- **Nginx**: 256MB RAM, 1 CPU core
- **Total**: ~10.3GB RAM, 7 CPU cores (optimal for KVM 8)

Your application will be accessible at `http://your-domain.com` or `http://your-kvm-ip`