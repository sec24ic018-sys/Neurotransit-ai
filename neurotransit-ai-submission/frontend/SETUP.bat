@echo off
REM ========================================
REM NeuroTransit AI - Frontend Setup
REM ========================================

echo.
echo ========================================
echo NeuroTransit AI - Frontend Setup
echo ========================================
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Node.js is not installed or not in PATH
    echo.
    echo Please install Node.js from: https://nodejs.org/
    echo Recommended: Node.js LTS (v18+)
    echo.
    echo After installation, restart your terminal and run this script again.
    pause
    exit /b 1
)

echo [OK] Node.js found: %NODE_VERSION%
node --version
npm --version
echo.

REM Navigate to frontend folder
cd /d "%~dp0"
echo [INFO] Working directory: %cd%
echo.

REM Install dependencies
echo [STEP 1/3] Installing dependencies...
echo.
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] npm install failed
    pause
    exit /b 1
)
echo [OK] Dependencies installed
echo.

REM Create .env file if it doesn't exist
if not exist ".env" (
    echo [STEP 2/3] Creating .env file...
    (
        echo REACT_APP_API_URL=http://localhost:5000/api
        echo REACT_APP_ENV=development
    ) > .env
    echo [OK] .env file created
    echo.
)

REM Start development server
echo [STEP 3/3] Starting development server...
echo.
echo [INFO] Frontend will open at: http://localhost:3000
echo [INFO] Make sure backend is running on http://localhost:5000
echo [INFO] Press Ctrl+C to stop the server
echo.
call npm start

pause
