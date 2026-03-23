from datetime import date, timedelta
from typing import Optional
from sqlalchemy.orm import Session
from fastapi import HTTPException
from models.task import Task, TaskStatus

def get_tasks(db, user_id, scheduled_date=None, status=None):
    q = db.query(Task).filter(Task.user_id == user_id)
    if scheduled_date: q = q.filter(Task.scheduled_date == scheduled_date)
    if status: q = q.filter(Task.status == status)
    return q.order_by(Task.scheduled_date, Task.start_time).all()

def get_task(db, user_id, task_id):
    t = db.query(Task).filter(Task.id == task_id, Task.user_id == user_id).first()
    if not t: raise HTTPException(status_code=404, detail="Task not found")
    return t

def create_task(db, user_id, **data):
    t = Task(user_id=user_id, **data); db.add(t); db.commit(); db.refresh(t); return t

def update_task(db, user_id, task_id, **data):
    t = get_task(db, user_id, task_id)
    for k, v in data.items(): setattr(t, k, v)
    db.commit(); db.refresh(t); return t

def delete_task(db, user_id, task_id):
    t = get_task(db, user_id, task_id); db.delete(t); db.commit()

def bulk_create_tasks(db, user_id, tasks):
    objs = [Task(user_id=user_id, **t) for t in tasks]
    db.add_all(objs); db.commit()
    for o in objs: db.refresh(o)
    return objs

def get_completion_rate(db, user_id, days=7):
    since = date.today() - timedelta(days=days)
    total = db.query(Task).filter(Task.user_id == user_id, Task.scheduled_date >= since).count()
    if not total: return 0.0
    done = db.query(Task).filter(Task.user_id == user_id, Task.scheduled_date >= since, Task.status == TaskStatus.done).count()
    return round(done / total * 100, 1)

def get_daily_hours(db, user_id, days=7):
    result = []
    for i in range(days - 1, -1, -1):
        d = date.today() - timedelta(days=i)
        tasks = db.query(Task).filter(Task.user_id == user_id, Task.scheduled_date == d, Task.status == TaskStatus.done).all()
        result.append({"date": d.isoformat(), "hours": round(sum(t.duration_minutes or 0 for t in tasks) / 60, 1)})
    return result
