from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import logging

from app.api.routes import auth, chat, planner  # adjust if needed

app = FastAPI(title="Productiv API")

logging.basicConfig(level=logging.INFO)

origins = [
    "http://localhost:5173",
    "https://productiv-eight.vercel.app",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {"message": "API running 🚀"}

@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    logging.error(f"ERROR: {exc}")
    return JSONResponse(
        status_code=500,
        content={"message": "Internal Server Error"}
    )

app.include_router(auth.router, prefix="/api")
app.include_router(chat.router, prefix="/api")
app.include_router(planner.router, prefix="/api")
