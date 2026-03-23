from datetime import date, timedelta
from models.task import Task, TaskStatus
from services.task_service import get_completion_rate, get_daily_hours
from services.habit_service import get_overall_consistency, get_heatmap_data, get_habits, compute_streak, compute_consistency

def get_dashboard_stats(db, user_id):
    today = date.today()
    today_tasks = db.query(Task).filter(Task.user_id == user_id, Task.scheduled_date == today).all()
    streak = _task_streak(db, user_id)
    return {
        "consistency_score": get_completion_rate(db, user_id, 7),
        "day_streak": streak,
        "habit_consistency": get_overall_consistency(db, user_id, 7),
        "today": {"total": len(today_tasks), "done": sum(1 for t in today_tasks if t.status == TaskStatus.done), "pending": sum(1 for t in today_tasks if t.status == TaskStatus.pending)},
        "daily_hours_7d": get_daily_hours(db, user_id, 7),
    }

def get_analytics_summary(db, user_id):
    since = date.today().replace(day=1)
    week_start = date.today() - timedelta(days=date.today().weekday())
    tasks_month = db.query(Task).filter(Task.user_id == user_id, Task.scheduled_date >= since, Task.status == TaskStatus.done).all()
    tasks_week  = db.query(Task).filter(Task.user_id == user_id, Task.scheduled_date >= week_start, Task.status == TaskStatus.done).count()
    subject_hrs = {}
    for t in tasks_month:
        if t.subject: subject_hrs[t.subject] = subject_hrs.get(t.subject, 0) + (t.duration_minutes or 0) / 60
    habits = get_habits(db, user_id)
    trend = []
    for i in range(11, -1, -1):
        d = date.today() - timedelta(days=i)
        done  = db.query(Task).filter(Task.user_id == user_id, Task.scheduled_date == d, Task.status == TaskStatus.done).count()
        total = db.query(Task).filter(Task.user_id == user_id, Task.scheduled_date == d).count()
        trend.append({"date": d.isoformat(), "pct": round(done / total * 100, 1) if total else 0})
    return {
        "total_study_hours_month": round(sum(t.duration_minutes or 0 for t in tasks_month) / 60, 1),
        "tasks_completed_week": tasks_week,
        "subject_breakdown": sorted([{"subject": k, "hours": round(v, 1)} for k, v in subject_hrs.items()], key=lambda x: x["hours"], reverse=True),
        "habit_stats": [{"id": h.id, "name": h.name, "streak": compute_streak(db, h.id), "consistency_30d": compute_consistency(db, user_id, h.id, 30), "color": h.color} for h in habits],
        "heatmap": get_heatmap_data(db, user_id, 28),
        "consistency_trend": trend,
    }

def _task_streak(db, user_id):
    streak = 0; d = date.today()
    while True:
        if not db.query(Task).filter(Task.user_id == user_id, Task.scheduled_date == d, Task.status == TaskStatus.done).count(): break
        streak += 1; d -= timedelta(days=1)
    return streak
