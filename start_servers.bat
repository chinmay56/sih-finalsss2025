@echo off
echo Starting Translation Tool...
echo.

REM Start backend server in a new window
echo Starting backend server...
start "Backend Server" cmd /k "cd /d "%~dp0backend" && python main.py"

REM Wait a moment for backend to start
timeout /t 3 /nobreak >nul

REM Start frontend server in a new window
echo Starting frontend server...
start "Frontend Server" cmd /k "cd /d "%~dp0frontend" && npm run dev"

echo.
echo Both servers are starting...
echo Backend will be available at: http://localhost:8000
echo Frontend will be available at: http://localhost:3000
echo.
echo Press any key to exit this window...
pause >nul