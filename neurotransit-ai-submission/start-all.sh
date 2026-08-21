#!/usr/bin/env bash

set -e
cd "$(dirname "$0")"

if ! command -v node >/dev/null 2>&1; then
  echo "[ERROR] Node.js is required. Install Node.js LTS and try again."
  exit 1
fi

if ! command -v npm >/dev/null 2>&1; then
  echo "[ERROR] npm is required. Install Node.js LTS and try again."
  exit 1
fi

if ! command -v python >/dev/null 2>&1 && ! command -v python3 >/dev/null 2>&1; then
  echo "[ERROR] Python is required. Install Python 3 and try again."
  exit 1
fi

PYTHON_COMMAND="python"
if ! command -v python >/dev/null 2>&1; then
  PYTHON_COMMAND="python3"
fi

if [ ! -d "node_modules" ]; then
  echo "[INFO] Installing root dependencies..."
  npm install
fi

if ! "$PYTHON_COMMAND" -c "import cv2, requests, ultralytics" >/dev/null 2>&1; then
  echo "[ERROR] Python AI dependencies are missing. Run:"
  echo "        $PYTHON_COMMAND -m pip install -r backend/requirements.txt"
  exit 1
fi

npm run dev
