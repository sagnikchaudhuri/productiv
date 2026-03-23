from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import logging

# ✅ Import your routers
from app.api.routes import auth, chat, planner  # adjust if needed

# ✅ Initialize app
app = FastAPI(
    title="Productiv API",
    version="1.0.0"
)

# ✅ Logging (important for debugging)
logging.basicConfig(level=logging.INFO)

# ✅ CORS CONFIG (MULTI-USER SAFE)
origins = [
    "http://localhost:5173",  # local dev
    "http://localhost:3000",  # optional
    "https://productiv-eight.vercel.app",  # your deployed frontend
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,   # NOT "*" in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ✅ Health check route
@app.get("/")
def root():
    return {"message": "Productiv API running 🚀"}

# ✅ Global error handler (prevents crashes)
@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    logging.error(f"ERROR: {exc}")
    return JSONResponse(
        status_code=500,
        content={"message": "Internal Server Error"}
    )

# ✅ Include routers
app.include_router(auth.router, prefix="/api", tags=["Auth"])
app.include_router(chat.router, prefix="/api", tags=["Chat"])
app.include_router(planner.router, prefix="/api", tags=["Planner"])
