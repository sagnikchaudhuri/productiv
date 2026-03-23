from datetime import date
from typing import Optional
from fastapi import APIRouter, Depends, Query
from pydantic import BaseModel
from sqlalchemy.orm import Session
from core.database import get_db
from core.security import get_current_user
from models.task import TaskStatus
from services import task_service

router = APIRouter(prefix="/tasks", tags=["tasks"])

class TaskCreate(BaseModel):
    title: str; subject: Optional[str]=None; notes: Optional[str]=None
    scheduled_date: date; start_time: Optional[str]=None
    duration_minutes: int=60; priority: int=2

class TaskUpdate(BaseModel):
    title: Optional[str]=None; subject: Optional[str]=None; notes: Optional[str]=None
    scheduled_date: Optional[date]=None; start_time: Optional[str]=None
    duration_minutes: Optional[int]=None; status: Optional[TaskStatus]=None; priority: Optional[int]=None

class TaskOut(BaseModel):
    id: int; title: str; subject: Optional[str]; notes: Optional[str]
    scheduled_date: date; start_time: Optional[str]; duration_minutes: int
    status: TaskStatus; priority: int; ai_generated: bool
    class Config: from_attributes = True

@router.get("/", response_model=list[TaskOut])
def list_tasks(scheduled_date: Optional[date]=Query(None), status: Optional[TaskStatus]=Query(None),
               db: Session=Depends(get_db), user=Depends(get_current_user)):
    return task_service.get_tasks(db, user.id, scheduled_date, status)

@router.post("/", response_model=TaskOut, status_code=201)
def create(body: TaskCreate, db: Session=Depends(get_db), user=Depends(get_current_user)):
    return task_service.create_task(db, user.id, **body.model_dump())

@router.patch("/{task_id}", response_model=TaskOut)
def update(task_id: int, body: TaskUpdate, db: Session=Depends(get_db), user=Depends(get_current_user)):
    return task_service.update_task(db, user.id, task_id, **body.model_dump(exclude_none=True))

@router.delete("/{task_id}", status_code=204)
def delete(task_id: int, db: Session=Depends(get_db), user=Depends(get_current_user)):
    task_service.delete_task(db, user.id, task_id)
