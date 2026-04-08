from fastapi import APIRouter, Depends, HTTPException, Form, File, UploadFile, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database import get_db
from app.models.database import ReportDB, UserDB, NotificationLogDB
from app.services.email_service import send_alert_email
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime, timedelta
from app.services.sms_service import SMSService
import shutil
import os

router = APIRouter(prefix="/reports", tags=["reports"])

class ReportResponse(BaseModel):
    id: int
    user_id: int
    description: Optional[str] = ""
    threat_type: str
    verified: bool
    created_at: datetime
    reward_points: int
    message: str

    model_config = {"from_attributes": True}

@router.post("/", response_model=ReportResponse)
async def create_report(
    user_id: int = Form(...),
    description: str = Form(""),
    threat_type: str = Form(...),
    lat: float = Form(...),
    lng: float = Form(...),
    photo: UploadFile = File(None),
    db: Session = Depends(get_db)
):
    # Save photo if provided
    photo_url = None
    if photo:
        photo_path = f"uploads/{photo.filename}"
        os.makedirs("uploads", exist_ok=True)
        with open(photo_path, "wb") as buffer:
            shutil.copyfileobj(photo.file, buffer)
        photo_url = photo_path
    
    # Create report
    db_report = ReportDB(
        user_id=user_id,  
        description=description,
        threat_type=threat_type,
        location_lat=lat,
        location_lng=lng,
        photo_url=photo_url,
        verified=False,
        created_at=datetime.utcnow()
    )
    db.add(db_report)
    
    user = db.query(UserDB).filter(UserDB.id == user_id).first()
    if user:
        user.points += 10
        user.reports_submitted += 1
        if user.points >= 1000:
            user.badge_level = "Guardian"
        elif user.points >= 500:
            user.badge_level = "Farmer"
        elif user.points >= 100:
            user.badge_level = "Sprout"

    # Auto-verify after a short delay — mark as verified immediately for solo use
    db_report.verified = True
    if user:
        user.reports_verified += 1

    db.commit()
    db.refresh(db_report)

    # ── Notify all users ──────────────────────────────────────────────────
    all_users = db.query(UserDB).all()
    for u in all_users:
        # In-app
        db.add(NotificationLogDB(
            user_id=u.id, channel="in_app", recipient=u.phone,
            subject=f"{threat_type.replace('_',' ').title()} Alert",
            message=f"⚠️ {threat_type.replace('_',' ').title()} reported near your area. {description or ''}".strip(),
            threat_type=threat_type, status="sent", created_at=datetime.utcnow()
        ))
        # Email
        if u.email:
            ok = send_alert_email(u.email, threat_type, description or "",
                                  location=f"{lat:.4f}, {lng:.4f}",
                                  reporter=user.name if user else "A farmer")
            db.add(NotificationLogDB(
                user_id=u.id, channel="email", recipient=u.email,
                subject=f"{threat_type.replace('_',' ').title()} Alert",
                message=description or "", threat_type=threat_type,
                status="sent" if ok else "failed", created_at=datetime.utcnow()
            ))
        # SMS (mock)
        db.add(NotificationLogDB(
            user_id=u.id, channel="sms", recipient=u.phone,
            message=f"FarmShield: {threat_type.replace('_',' ').title()} reported near you. Stay safe.",
            threat_type=threat_type, status="mock", created_at=datetime.utcnow()
        ))
    db.commit()
    
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
    time_threshold = datetime.utcnow() - timedelta(minutes=30)
    
    recent_reports = db.query(ReportDB).filter(
        ReportDB.created_at > time_threshold,
        ReportDB.verified == False
    ).all()
    
    verified_count = 0
    for report in recent_reports:
        nearby_count = db.query(ReportDB).filter(
            ReportDB.created_at > time_threshold,
            ReportDB.verified == False,
            func.abs(ReportDB.location_lat - report.location_lat) < 0.018,
            func.abs(ReportDB.location_lng - report.location_lng) < 0.018
        ).count()
        
        if nearby_count >= 3:
            report.verified = True
            verified_count += 1
    
    if verified_count > 0:
        db.commit()
    
    return {
        "verified_count": verified_count,
        "message": f"{verified_count} reports verified via crowd verification"
    }

@router.get("/sms-logs")
async def get_sms_logs():
    logs = SMSService.get_mock_logs()
    return {
        "count": len(logs),
        "logs": logs,
        "note": "This is MOCK SMS. Real Africa's Talking integration pending."
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