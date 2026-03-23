# Productiv 

AI-powered productivity assistant — study planner, habit tracker, and smart AI coach.

## Stack
- **Backend**: Python + FastAPI + SQLite + Claude AI
- **Frontend**: React + Vite

## Quick Start

### Backend
```bash
cd backend
python -m venv venv
venv\Scripts\activate        # Windows
source venv/bin/activate     # Mac/Linux
pip install -r requirements.txt
copy .env.example .env         # fill in ANTHROPIC_API_KEY and SECRET_KEY
uvicorn main:app --reload
```
API at http://localhost:8000 — docs at http://localhost:8000/docs

### Frontend
```bash
cd frontend
npm install
npm run dev
```
App at http://localhost:5173

<img width="1536" height="1024" alt="Productiv UI" src="https://github.com/user-attachments/assets/796d039b-badc-4cf3-8b31-fa359537aaca" />




