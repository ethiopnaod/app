@echo off
echo Starting Bingo Game Demo...
echo.

echo Starting Frontend Server...
start "Frontend" cmd /c "npm run dev"

echo Waiting 3 seconds for frontend to start...
timeout /t 3 /nobreak >nul

echo Starting Backend Server...
start "Backend" cmd /c "cd backend && python app.py"

echo.
echo Demo servers starting...
echo Frontend: http://localhost:5173
echo Backend:  http://localhost:5000
echo.
echo Press any key to continue...
pause >nul