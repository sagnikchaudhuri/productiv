from sqlalchemy.orm import Session
from fastapi import HTTPException
from models.user import User
from core.security import hash_password, verify_password, create_access_token

def register_user(db, name, email, password):
    if db.query(User).filter(User.email == email).first():
        raise HTTPException(status_code=400, detail="Email already registered")
    user = User(name=name, email=email, hashed_password=hash_password(password))
    db.add(user); db.commit(); db.refresh(user)
    return user

def authenticate_user(db, email, password):
    user = db.query(User).filter(User.email == email).first()
    if not user or not verify_password(password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Incorrect email or password")
    return create_access_token({"sub": str(user.id), "name": user.name})
