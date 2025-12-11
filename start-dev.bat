@echo off
echo Starting PostMind Development Environment...

echo Starting Backend Server...
start "Backend" cmd /k "cd backend && npm start"

echo Waiting for backend to start...
timeout /t 5

echo Starting Frontend Server...
start "Frontend" cmd /k "cd frontend/web && npm start"

echo Development servers started!
echo Backend: http://localhost:8000
echo Frontend: http://localhost:3000
pause