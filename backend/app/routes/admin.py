from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database import get_db
from app.models.database import UserDB, ReportDB, CheckInDB, NotificationLogDB
from datetime import datetime, timedelta

router = APIRouter(prefix="/admin", tags=["admin"])

@router.get("/stats")
async def get_admin_stats(db: Session = Depends(get_db)):
    now = datetime.utcnow()
    today = now.date()
    week_ago = now - timedelta(days=7)

    total_users    = db.query(func.count(UserDB.id)).scalar() or 0
    total_reports  = db.query(func.count(ReportDB.id)).scalar() or 0
    verified_reports = db.query(func.count(ReportDB.id)).filter(ReportDB.verified == True).scalar() or 0
    active_today   = db.query(func.count(CheckInDB.id)).filter(
        func.date(CheckInDB.check_in_time) == today
    ).scalar() or 0
    reports_week   = db.query(func.count(ReportDB.id)).filter(
        ReportDB.created_at >= week_ago
    ).scalar() or 0
    alerts_sent    = db.query(func.count(NotificationLogDB.id)).filter(
        NotificationLogDB.channel == "email",
        NotificationLogDB.status == "sent"
    ).scalar() or 0

    # Threat breakdown
    threat_counts = db.query(
        ReportDB.threat_type, func.count(ReportDB.id).label("count")
    ).group_by(ReportDB.threat_type).all()

    # Recent reports for activity feed
    recent = db.query(ReportDB).order_by(ReportDB.created_at.desc()).limit(10).all()

    # Top farmers
    top_farmers = db.query(UserDB).order_by(UserDB.points.desc()).limit(5).all()

    return {
        "total_users": total_users,
        "total_reports": total_reports,
        "verified_reports": verified_reports,
        "active_farmers_today": active_today,
        "reports_this_week": reports_week,
        "email_alerts_sent": alerts_sent,
        "threat_breakdown": [{"type": t, "count": c} for t, c in threat_counts],
        "recent_reports": [
            {
                "id": r.id,
                "threat_type": r.threat_type,
                "description": r.description,
                "verified": r.verified,
                "created_at": r.created_at.isoformat()
            } for r in recent
        ],
        "top_farmers": [
            {"name": u.name or u.phone, "points": u.points, "badge": u.badge_level}
            for u in top_farmers
        ]
    }

@router.get("/reports/all")
async def get_all_reports(db: Session = Depends(get_db)):
    reports = db.query(ReportDB).order_by(ReportDB.created_at.desc()).limit(50).all()
    return {"reports": [
        {
            "id": r.id, "user_id": r.user_id,
            "threat_type": r.threat_type, "description": r.description,
            "verified": r.verified, "location_lat": r.location_lat,
            "location_lng": r.location_lng, "created_at": r.created_at.isoformat()
        } for r in reports
    ]}
