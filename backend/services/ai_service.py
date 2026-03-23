import json
from datetime import date
from sqlalchemy.orm import Session
import anthropic
from core.config import get_settings
from models.chat import ChatMessage, MessageRole

settings = get_settings()
MODEL = "claude-sonnet-4-20250514"

SYSTEM = """You are Productiv, an AI productivity assistant. Help users manage study schedules, habits, and goals.
Be calm, encouraging, concise. Under 120 words unless asked for a plan. No markdown headers."""

PLANNER_SYSTEM = """You are a study planner. Given subjects, notes and goals, return ONLY a valid JSON array of tasks.
Each item: {title, subject, start_time (HH:MM 24h), duration_minutes (int), notes, priority (1-3), scheduled_date}.
Schedule 09:00-21:00. Include short breaks. No prose, no markdown fences."""

INSIGHT_SYSTEM = """You are a productivity coach. Given user stats JSON, write ONE insight: 2-3 sentences, specific, actionable, encouraging. No 'Based on your data' opener."""

def _client(): return anthropic.Anthropic(api_key=settings.anthropic_api_key)

def get_chat_history(db, user_id, limit=20):
    msgs = db.query(ChatMessage).filter(ChatMessage.user_id == user_id).order_by(ChatMessage.created_at.desc()).limit(limit).all()
    return [{"role": m.role, "content": m.content} for m in reversed(msgs)]

def chat(db, user, user_message):
    db.add(ChatMessage(user_id=user.id, role=MessageRole.user, content=user_message))
    db.commit()
    history = get_chat_history(db, user.id)
    response = _client().messages.create(model=MODEL, max_tokens=400, system=SYSTEM, messages=history)
    reply = response.content[0].text
    db.add(ChatMessage(user_id=user.id, role=MessageRole.assistant, content=reply))
    db.commit()
    return reply

def clear_chat_history(db, user_id):
    db.query(ChatMessage).filter(ChatMessage.user_id == user_id).delete(); db.commit()

def generate_insight(snapshot):
    response = _client().messages.create(model=MODEL, max_tokens=150, system=INSIGHT_SYSTEM,
        messages=[{"role": "user", "content": json.dumps(snapshot)}])
    return response.content[0].text

def generate_plan(subjects, notes, goals, available_hours=8, plan_date=None):
    plan_date = plan_date or date.today().isoformat()
    prompt = json.dumps({"date": plan_date, "subjects": subjects, "notes": notes, "goals": goals, "available_hours": available_hours})
    response = _client().messages.create(model=MODEL, max_tokens=1000, system=PLANNER_SYSTEM,
        messages=[{"role": "user", "content": prompt}])
    raw = response.content[0].text.strip()
    if raw.startswith("```"): raw = raw.split("```")[1]; raw = raw[4:] if raw.startswith("json") else raw
    try:
        tasks = json.loads(raw.strip())
    except: return []
    return [{**t, "scheduled_date": plan_date, "ai_generated": True, "duration_minutes": int(t.get("duration_minutes", 60)), "priority": int(t.get("priority", 2))} for t in tasks]
