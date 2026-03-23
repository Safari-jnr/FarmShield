from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database import get_db
from app.models.database import ReportDB, UserDB
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime, timedelta

router = APIRouter(prefix="/reports", tags=["reports"])

class ReportCreate(BaseModel):
    user_id: int
    description: str
    threat_type: str  # "bandits", "sick_crops", "pests", "dead_animals", "other"
    lat: float
    lng: float
    photo_url: Optional[str] = None

class ReportResponse(BaseModel):
    id: int
    user_id: int
    description: str
    threat_type: str
    verified: bool
    created_at: datetime
    reward_points: int
    message: str

    class Config:
        from_attributes = True

@router.post("/", response_model=ReportResponse)
async def create_report(report: ReportCreate, db: Session = Depends(get_db)):
    # Create the report
    db_report = ReportDB(
        user_id=report.user_id,
        description=report.description,
        threat_type=report.threat_type,
        location_lat=report.lat,
        location_lng=report.lng,
        photo_url=report.photo_url,
        verified=False,
        created_at=datetime.utcnow()
    )
    db.add(db_report)
    
    # Add reward points to user
    user = db.query(UserDB).filter(UserDB.id == report.user_id).first()
    if user:
        user.points += 10  # +10 for reporting
        user.reports_submitted += 1
        
        # Update badge level based on points
        if user.points >= 1000:
            user.badge_level = "Guardian"
        elif user.points >= 500:
            user.badge_level = "Farmer"
        elif user.points >= 100:
            user.badge_level = "Sprout"
    
    db.commit()
    db.refresh(db_report)
    
    return {
        "id": db_report.id,
        "user_id": db_report.user_id,
        "description": db_report.description,
        "threat_type": db_report.threat_type,
        "verified": db_report.verified,
        "created_at": db_report.created_at,
        "reward_points": 10,
        "message": f"Report submitted! +10 points earned. Total: {user.points if user else 0} points. Verification pending."
    }
@router.get("/verified")
async def get_verified_threats(
    lat: float,
    lng: float,
    radius_km: float = 5.0,
    db: Session = Depends(get_db)
):
    # Get threats from last 24 hours
    time_threshold = datetime.utcnow() - timedelta(hours=24)
    
    verified_reports = db.query(ReportDB).filter(
        ReportDB.verified == True,
        ReportDB.created_at > time_threshold
    ).all()
    
    return {
        "threats": verified_reports,
        "count": len(verified_reports),
        "message": f"{len(verified_reports)} verified threats in your area"
    }

@router.get("/crowd-verify")
async def crowd_verify_reports(db: Session = Depends(get_db)):
    """
    Auto-verify reports if 3+ reports in same area within 30 minutes
    """
    time_threshold = datetime.utcnow() - timedelta(minutes=30)
    
    # Find reports in last 30 minutes
    recent_reports = db.query(ReportDB).filter(
        ReportDB.created_at > time_threshold,
        ReportDB.verified == False
    ).all()
    
    # Group by location (simplified - within 2km radius)
    # In production, use proper geospatial clustering
    
    verified_count = 0
    for report in recent_reports:
        # Check if 3+ reports nearby
        nearby_count = db.query(ReportDB).filter(
            ReportDB.created_at > time_threshold,
            ReportDB.verified == False,
            func.abs(ReportDB.location_lat - report.location_lat) < 0.018,  # ~2km
            func.abs(ReportDB.location_lng - report.location_lng) < 0.018
        ).count()
        
        if nearby_count >= 3:
            report.verified = True
            verified_count += 1
    
    if verified_count > 0:
        db.commit()
        # TODO: Trigger SMS alerts to nearby farmers
    
    return {
        "verified_count": verified_count,
        "message": f"{verified_count} reports verified via crowd verification"
    }