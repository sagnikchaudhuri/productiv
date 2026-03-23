from fastapi import APIRouter, Depends
from fastapi.security import OAuth2PasswordRequestForm
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session
from core.database import get_db
from core.security import get_current_user
from services.auth_service import register_user, authenticate_user

router = APIRouter(prefix="/auth", tags=["auth"])

class RegisterRequest(BaseModel):
    name: str; email: EmailStr; password: str

class TokenResponse(BaseModel):
    access_token: str; token_type: str = "bearer"

class UserOut(BaseModel):
    id: int; name: str; email: str
    class Config: from_attributes = True

@router.post("/register", response_model=UserOut, status_code=201)
def register(body: RegisterRequest, db: Session = Depends(get_db)):
    return register_user(db, body.name, body.email, body.password)

@router.post("/login", response_model=TokenResponse)
def login(form: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    return TokenResponse(access_token=authenticate_user(db, form.username, form.password))

@router.get("/me", response_model=UserOut)
def me(user=Depends(get_current_user)): return user
