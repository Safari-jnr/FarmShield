from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
from app.database import get_db
from app.models.database import UserDB
from app.utils.security import get_password_hash, verify_password

router = APIRouter(prefix="/settings", tags=["settings"])


class UpdateEmailRequest(BaseModel):
    user_id: int
    email: str


class UpdatePasswordRequest(BaseModel):
    user_id: int
    current_password: str
    new_password: str


class UpdateProfileRequest(BaseModel):
    user_id: int
    name: Optional[str] = None
    language: Optional[str] = None


@router.put("/email")
async def update_email(req: UpdateEmailRequest, db: Session = Depends(get_db)):
    user = db.query(UserDB).filter(UserDB.id == req.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    # Check email not taken by another user
    existing = db.query(UserDB).filter(UserDB.email == req.email, UserDB.id != req.user_id).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already in use")
    user.email = req.email
    db.commit()
    return {"message": "Email updated", "email": req.email}


@router.put("/password")
async def update_password(req: UpdatePasswordRequest, db: Session = Depends(get_db)):
    user = db.query(UserDB).filter(UserDB.id == req.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if not verify_password(req.current_password, user.hashed_password):
        raise HTTPException(status_code=400, detail="Current password is incorrect")
    user.hashed_password = get_password_hash(req.new_password)
    db.commit()
    return {"message": "Password updated successfully"}


@router.put("/profile")
async def update_profile(req: UpdateProfileRequest, db: Session = Depends(get_db)):
    user = db.query(UserDB).filter(UserDB.id == req.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if req.name:
        user.name = req.name
    if req.language:
        user.language = req.language
    db.commit()
    return {"message": "Profile updated", "name": user.name, "language": user.language}


@router.get("/{user_id}")
async def get_settings(user_id: int, db: Session = Depends(get_db)):
    user = db.query(UserDB).filter(UserDB.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return {
        "id": user.id,
        "name": user.name,
        "phone": user.phone,
        "email": user.email or "",
        "language": user.language,
        "points": user.points,
        "badge_level": user.badge_level,
    }
