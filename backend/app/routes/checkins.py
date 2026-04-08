from fastapi import APIRouter, Depends, HTTPException, Form, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database import get_db
from app.models.database import CheckInDB, UserDB, ReportDB  # ✅ Fixed import
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime, timedelta

router = APIRouter(prefix="/checkins", tags=["checkins"])

class CheckinCreate(BaseModel):
    user_id: int
    lat: float
    lng: float

class CheckinResponse(BaseModel):
    id: int
    user_id: int
    points_earned: int
    message: str

    class Config:
        from_attributes = True

@router.post("/")
async def create_checkin(
    user_id: int = Form(...),
    lat: float = Form(...),
    lng: float = Form(...),
    db: Session = Depends(get_db)
):
    # Check if already checked in today
    today = datetime.utcnow().date()
    existing = db.query(CheckInDB).filter(  # ✅ Fixed
        CheckInDB.user_id == user_id,       # ✅ Fixed
        func.date(CheckInDB.check_in_time) == today  # ✅ Fixed - use check_in_time not created_at
    ).first()
    
    if existing:
        raise HTTPException(status_code=400, detail="Already checked in today")
    
    # Create checkin
    checkin = CheckInDB(  # ✅ Fixed
        user_id=user_id,
        location_lat=lat,
        location_lng=lng,
        check_in_time=datetime.utcnow()  # ✅ Use check_in_time not created_at
    )
    db.add(checkin)
    
    # Add reward points to user
    user = db.query(UserDB).filter(UserDB.id == user_id).first()
    if user:
        user.points += 5  # +5 for check-in
        user.check_ins += 1
        # Update badge level
        if user.points >= 1000:
            user.badge_level = "Guardian"
        elif user.points >= 500:
            user.badge_level = "Farmer"
        elif user.points >= 100:
            user.badge_level = "Sprout"
    
    db.commit()
    db.refresh(checkin)
    
    return {
        "id": checkin.id,
        "user_id": checkin.user_id,
        "points_earned": 5,
        "message": f"Check-in successful! +5 points. Total: {user.points if user else 0}"
    }

@router.get("/streak/{user_id}")
async def get_checkin_streak(user_id: int, db: Session = Depends(get_db)):
    """
    Get user's current check-in streak
    """
    checkins = db.query(CheckInDB).filter(  
        CheckInDB.user_id == user_id        
    ).order_by(CheckInDB.check_in_time.desc()).all()  
    
    if not checkins:
        return {
            "streak": 0,
            "message": "Start checking in daily to build your streak!"
        }
    
    streak = 0
    today = datetime.utcnow().date()
    
    for i, checkin in enumerate(checkins):
        checkin_date = checkin.check_in_time.date()  
        expected_date = today - timedelta(days=i)
        
        if checkin_date == expected_date:
            streak += 1
        else:
            break
    
    return {
        "streak": streak,
        "last_checkin": checkins[0].check_in_time,  
        "message": f"🔥 {streak} day streak! Keep it up!" if streak > 1 else "First check-in! Come back tomorrow."
    }

@router.get("/leaderboard")
async def get_checkin_leaderboard(db: Session = Depends(get_db)):
    thirty_days_ago = datetime.utcnow() - timedelta(days=30)
    
    leaderboard = db.query(
        UserDB.id,
        UserDB.name,
        UserDB.phone,
        func.count(CheckInDB.id).label('checkin_count')  
    ).join(CheckInDB, UserDB.id == CheckInDB.user_id).filter(  
        CheckInDB.check_in_time > thirty_days_ago  
    ).group_by(UserDB.id).order_by(func.count(CheckInDB.id).desc()).limit(10).all()  
    
    return {
        "leaderboard": [
            {
                "user_id": user.id,
                "name": user.name or f"Farmer {user.phone[-4:]}",
                "checkins": user.checkin_count
            }
            for user in leaderboard
        ]
    }

@router.get("/my-reports")
async def get_my_reports(
    user_id: int = Query(...),
    db: Session = Depends(get_db)
):
    """
    Get all reports submitted by a specific user
    """
    reports = db.query(ReportDB).filter(
        ReportDB.user_id == user_id
    ).order_by(ReportDB.created_at.desc()).all()
    
    return {
        "reports": reports,
        "count": len(reports)
    }