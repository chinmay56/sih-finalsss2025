@echo off
start "Backend" cmd /k "cd backend && python app/main.py"
start "Frontend" cmd /k "cd frontend && npm run dev"