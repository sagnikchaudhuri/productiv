from datetime import date
from typing import Optional
from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session
from core.database import get_db
from core.security import get_current_user
from services import ai_service, task_service, analytics_service

router = APIRouter(prefix="/ai", tags=["ai"])

class ChatReq(BaseModel): message: str
class PlanReq(BaseModel):
    subjects: list[str]; notes: str=""; goals: str=""
    available_hours: int=8; plan_date: Optional[str]=None; save_to_tasks: bool=True

@router.post("/chat")
def chat(body: ChatReq, db: Session=Depends(get_db), user=Depends(get_current_user)):
    return {"reply": ai_service.chat(db, user, body.message)}

@router.get("/chat/history")
def history(db: Session=Depends(get_db), user=Depends(get_current_user)):
    return ai_service.get_chat_history(db, user.id, 50)

@router.delete("/chat/history", status_code=204)
def clear(db: Session=Depends(get_db), user=Depends(get_current_user)):
    ai_service.clear_chat_history(db, user.id)

@router.get("/insight")
def insight(db: Session=Depends(get_db), user=Depends(get_current_user)):
    stats = analytics_service.get_dashboard_stats(db, user.id)
    return {"insight": ai_service.generate_insight({"completion_rate_7d": stats["consistency_score"], "day_streak": stats["day_streak"], "habit_consistency": stats["habit_consistency"], "pending_today": stats["today"]["pending"]})}

@router.post("/plan")
def plan(body: PlanReq, db: Session=Depends(get_db), user=Depends(get_current_user)):
    tasks = ai_service.generate_plan(body.subjects, body.notes, body.goals, body.available_hours, body.plan_date or date.today().isoformat())
    if body.save_to_tasks and tasks: task_service.bulk_create_tasks(db, user.id, tasks)
    return tasks
