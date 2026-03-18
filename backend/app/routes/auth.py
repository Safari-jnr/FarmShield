from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.database import UserDB
from app.models.user import UserCreate, User, Token
from app.utils.security import get_password_hash, verify_password
from datetime import datetime

router = APIRouter(prefix="/auth", tags=["authentication"])

@router.post("/register", response_model=User)
async def register(user: UserCreate, db: Session = Depends(get_db)):
    # Check if user exists
    db_user = db.query(UserDB).filter(UserDB.phone == user.phone).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Phone already registered")
    
    # Create user with hashed password
    hashed_password = get_password_hash(user.password)
    db_user = UserDB(
        phone=user.phone,
        name=user.name,
        hashed_password=hashed_password,
        language=user.language
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

@router.post("/login")
async def login(phone: str, password: str, db: Session = Depends(get_db)):
    user = db.query(UserDB).filter(UserDB.phone == phone).first()
    if not user or not verify_password(password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect phone or password"
        )
    
    # For now, return simple token (we'll add JWT later)
    return {"access_token": f"token-{user.id}", "token_type": "bearer"}