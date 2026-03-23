from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from core.database import get_db
from core.security import get_current_user
from services import analytics_service

router = APIRouter(prefix="/analytics", tags=["analytics"])

@router.get("/dashboard")
def dashboard(db: Session=Depends(get_db), user=Depends(get_current_user)):
    return analytics_service.get_dashboard_stats(db, user.id)

@router.get("/summary")
def summary(db: Session=Depends(get_db), user=Depends(get_current_user)):
    return analytics_service.get_analytics_summary(db, user.id)
