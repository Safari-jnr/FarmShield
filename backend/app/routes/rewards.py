from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.database import UserDB
from pydantic import BaseModel
from typing import List

router = APIRouter(prefix="/rewards", tags=["rewards"])

class UserRewards(BaseModel):
    user_id: int
    points: int
    badge_level: str
    reports_submitted: int
    reports_verified: int
    check_ins: int
    next_badge_points: int
    
    class Config:
        from_attributes = True

class LeaderboardEntry(BaseModel):
    name: str
    points: int
    badge_level: str
    
    class Config:
        from_attributes = True

@router.get("/leaderboard/top", response_model=List[LeaderboardEntry])
async def get_leaderboard(db: Session = Depends(get_db), limit: int = 10):
    top_users = db.query(UserDB).order_by(UserDB.points.desc()).limit(limit).all()
    
    return [
        {
            "name": user.name or user.phone,
            "points": user.points,
            "badge_level": user.badge_level
        }
        for user in top_users
    ]

@router.get("/{user_id}", response_model=UserRewards)
async def get_user_rewards(user_id: int, db: Session = Depends(get_db)):
    user = db.query(UserDB).filter(UserDB.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Calculate points needed for next badge
    next_badge_points = 0
    if user.badge_level == "Seedling":
        next_badge_points = 100 - user.points
    elif user.badge_level == "Sprout":
        next_badge_points = 500 - user.points
    elif user.badge_level == "Farmer":
        next_badge_points = 1000 - user.points
    
    return {
        "user_id": user.id,
        "points": user.points,
        "badge_level": user.badge_level,
        "reports_submitted": user.reports_submitted,
        "reports_verified": user.reports_verified,
        "check_ins": user.check_ins or 0,
        "next_badge_points": max(0, next_badge_points)
    }