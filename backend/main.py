from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from core.config import get_settings
from core.database import engine, Base
import models
from routers import auth, tasks, habits, ai, analytics
import logging
logging.basicConfig(level=logging.INFO)
from fastapi.responses import JSONResponse

@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    print("ERROR:", exc)
    return JSONResponse(
        status_code=500,
        content={"message": "Internal Server Error"}
    )

settings = get_settings()
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Productiv API", version="1.0.0")

app.add_middleware(CORSMiddleware,
    allow_origins=settings.origins_list,
    allow_credentials=True, allow_methods=["*"], allow_headers=["*"])

app.include_router(auth.router,      prefix="/api")
app.include_router(tasks.router,     prefix="/api")
app.include_router(habits.router,    prefix="/api")
app.include_router(ai.router,        prefix="/api")
app.include_router(analytics.router, prefix="/api")

@app.get("/health")
def health(): return {"status": "ok"}
