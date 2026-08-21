# Installation

## Prerequisites

- Node.js 14 or newer
- Python 3.9 or newer for computer vision
- npm

## Services

```powershell
npm install
npm install --prefix backend
npm install --prefix frontend
python -m pip install -r backend/requirements.txt
```

Copy `config/.env.example` to `backend/.env` and update only the services you use. Start everything from the submission root with `npm run dev`, or start the backend and frontend separately with `npm start --prefix backend` and `npm start --prefix frontend`.

The API runs on `http://localhost:5000` and the dashboard on `http://localhost:3000`.