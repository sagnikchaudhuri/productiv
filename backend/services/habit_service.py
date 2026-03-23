from datetime import date, timedelta
from typing import Optional
from fastapi import HTTPException
from models.habit import Habit, HabitLog

def get_habits(db, user_id, active_only=True):
    q = db.query(Habit).filter(Habit.user_id == user_id)
    if active_only: q = q.filter(Habit.is_active == True)
    return q.order_by(Habit.created_at).all()

def get_habit(db, user_id, habit_id):
    h = db.query(Habit).filter(Habit.id == habit_id, Habit.user_id == user_id).first()
    if not h: raise HTTPException(status_code=404, detail="Habit not found")
    return h

def create_habit(db, user_id, **data):
    h = Habit(user_id=user_id, **data); db.add(h); db.commit(); db.refresh(h); return h

def update_habit(db, user_id, habit_id, **data):
    h = get_habit(db, user_id, habit_id)
    for k, v in data.items(): setattr(h, k, v)
    db.commit(); db.refresh(h); return h

def delete_habit(db, user_id, habit_id):
    h = get_habit(db, user_id, habit_id); db.delete(h); db.commit()

def log_habit(db, user_id, habit_id, log_date, completed=True, note=None):
    existing = db.query(HabitLog).filter(HabitLog.user_id == user_id, HabitLog.habit_id == habit_id, HabitLog.log_date == log_date).first()
    if existing:
        existing.completed = completed; existing.note = note; db.commit(); db.refresh(existing); return existing
    log = HabitLog(user_id=user_id, habit_id=habit_id, log_date=log_date, completed=completed, note=note)
    db.add(log); db.commit(); db.refresh(log); return log

def compute_streak(db, habit_id):
    streak = 0; d = date.today()
    while True:
        log = db.query(HabitLog).filter(HabitLog.habit_id == habit_id, HabitLog.log_date == d, HabitLog.completed == True).first()
        if not log: break
        streak += 1; d -= timedelta(days=1)
    return streak

def compute_consistency(db, user_id, habit_id, days=30):
    since = date.today() - timedelta(days=days)
    done = db.query(HabitLog).filter(HabitLog.user_id == user_id, HabitLog.habit_id == habit_id, HabitLog.log_date >= since, HabitLog.completed == True).count()
    return round(done / days * 100, 1)

def get_all_habits_with_stats(db, user_id):
    habits = get_habits(db, user_id)
    return [{"habit": h, "streak": compute_streak(db, h.id), "consistency_30d": compute_consistency(db, user_id, h.id)} for h in habits]

def get_overall_consistency(db, user_id, days=7):
    habits = get_habits(db, user_id)
    if not habits: return 0.0
    return round(sum(compute_consistency(db, user_id, h.id, days) for h in habits) / len(habits), 1)

def get_heatmap_data(db, user_id, days=28):
    result = []
    for i in range(days - 1, -1, -1):
        d = date.today() - timedelta(days=i)
        logs = db.query(HabitLog).filter(HabitLog.user_id == user_id, HabitLog.log_date == d, HabitLog.completed == True).count()
        total = len(get_habits(db, user_id)) or 1
        result.append({"date": d.isoformat(), "level": min(4, int(logs / total * 4))})
    return result
