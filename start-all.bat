@echo off
setlocal
cd /d "%~dp0"

where node >nul 2>nul
if errorlevel 1 (
  echo [ERROR] Node.js is required. Install Node.js LTS and try again.
  exit /b 1
)

where npm >nul 2>nul
if errorlevel 1 (
  echo [ERROR] npm is required. Install Node.js LTS and try again.
  exit /b 1
)

where python >nul 2>nul
if errorlevel 1 (
  echo [ERROR] Python is required. Install Python 3 and try again.
  exit /b 1
)

if not exist "node_modules" (
  echo [INFO] Installing root dependencies...
  call npm install
  if errorlevel 1 exit /b 1
)

python -c "import cv2, requests, ultralytics" >nul 2>nul
if errorlevel 1 (
  echo [ERROR] Python AI dependencies are missing. Run:
  echo         python -m pip install -r backend\requirements.txt
  exit /b 1
)

call npm run dev
