@echo off
echo.
echo ====================================
echo    MiBroker Development Setup
echo ====================================
echo.

echo [1/4] Installing frontend dependencies...
call npm install
if errorlevel 1 (
    echo ERROR: Frontend dependency installation failed
    pause
    exit /b 1
)

echo.
echo [2/4] Installing backend dependencies...
cd server
call npm install
if errorlevel 1 (
    echo ERROR: Backend dependency installation failed
    pause
    exit /b 1
)

echo.
echo [3/4] Starting backend server...
start "MiBroker Backend" cmd /c "npm start & pause"

echo.
echo [4/4] Waiting 3 seconds then starting frontend...
timeout /t 3 /nobreak > nul

cd ..
echo.
echo Starting frontend development server...
echo.
echo Backend API: http://localhost:3001
echo Frontend: http://localhost:5174
echo.
call npm run dev

pause