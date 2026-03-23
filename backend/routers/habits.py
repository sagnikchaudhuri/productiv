from datetime import date
from typing import Optional
from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session
from core.database import get_db
from core.security import get_current_user
from services import habit_service

router = APIRouter(prefix="/habits", tags=["habits"])

class HabitCreate(BaseModel):
    name: str; description: Optional[str]=None; target_days_per_week: int=7; color: str="cyan"

class HabitUpdate(BaseModel):
    name: Optional[str]=None; description: Optional[str]=None
    target_days_per_week: Optional[int]=None; color: Optional[str]=None; is_active: Optional[bool]=None

class HabitLogReq(BaseModel):
    log_date: date; completed: bool=True; note: Optional[str]=None

class HabitOut(BaseModel):
    id: int; name: str; description: Optional[str]; target_days_per_week: int; color: str; is_active: bool
    class Config: from_attributes = True

@router.get("/")
def list_habits(db: Session=Depends(get_db), user=Depends(get_current_user)):
    return habit_service.get_all_habits_with_stats(db, user.id)

@router.post("/", response_model=HabitOut, status_code=201)
def create(body: HabitCreate, db: Session=Depends(get_db), user=Depends(get_current_user)):
    return habit_service.create_habit(db, user.id, **body.model_dump())

@router.patch("/{habit_id}", response_model=HabitOut)
def update(habit_id: int, body: HabitUpdate, db: Session=Depends(get_db), user=Depends(get_current_user)):
    return habit_service.update_habit(db, user.id, habit_id, **body.model_dump(exclude_none=True))

@router.delete("/{habit_id}", status_code=204)
def delete(habit_id: int, db: Session=Depends(get_db), user=Depends(get_current_user)):
    habit_service.delete_habit(db, user.id, habit_id)

@router.post("/{habit_id}/log")
def log(habit_id: int, body: HabitLogReq, db: Session=Depends(get_db), user=Depends(get_current_user)):
    log = habit_service.log_habit(db, user.id, habit_id, body.log_date, body.completed, body.note)
    return {"id": log.id, "completed": log.completed, "log_date": log.log_date.isoformat()}
