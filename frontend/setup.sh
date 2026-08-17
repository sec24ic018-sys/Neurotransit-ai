#!/bin/bash

# ========================================
# NeuroTransit AI - Frontend Setup (Mac/Linux)
# ========================================

echo ""
echo "========================================"
echo "NeuroTransit AI - Frontend Setup"
echo "========================================"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "[ERROR] Node.js is not installed"
    echo ""
    echo "Please install Node.js from: https://nodejs.org/"
    echo "Recommended: Node.js LTS (v18+)"
    echo ""
    exit 1
fi

echo "[OK] Node.js found:"
node --version
npm --version
echo ""

# Navigate to frontend folder
cd "$(dirname "$0")"
echo "[INFO] Working directory: $(pwd)"
echo ""

# Install dependencies
echo "[STEP 1/3] Installing dependencies..."
echo ""
npm install
if [ $? -ne 0 ]; then
    echo "[ERROR] npm install failed"
    exit 1
fi
echo "[OK] Dependencies installed"
echo ""

# Create .env file if it doesn't exist
if [ ! -f ".env" ]; then
    echo "[STEP 2/3] Creating .env file..."
    cat > .env << EOF
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_ENV=development
EOF
    echo "[OK] .env file created"
    echo ""
fi

# Start development server
echo "[STEP 3/3] Starting development server..."
echo ""
echo "[INFO] Frontend will open at: http://localhost:3000"
echo "[INFO] Make sure backend is running on http://localhost:5000"
echo "[INFO] Press Ctrl+C to stop the server"
echo ""
npm start
