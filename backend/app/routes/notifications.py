from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.database import NotificationLogDB, UserDB, ReportDB
from app.services.email_service import send_alert_email
from pydantic import BaseModel
from typing import Optional
from datetime import datetime

router = APIRouter(prefix="/notifications", tags=["notifications"])


class NotifyRequest(BaseModel):
    report_id: int
    threat_type: str
    description: Optional[str] = ""
    location: Optional[str] = "Near your farm"
    reporter_name: Optional[str] = "A community member"


@router.post("/send-alert")
async def send_threat_alert(req: NotifyRequest, db: Session = Depends(get_db)):
    """
    Send SMS + email + in-app notification to all users when a threat is reported.
    Called automatically when a report is submitted.
    """
    users = db.query(UserDB).all()
    email_sent = 0
    in_app_count = 0

    for user in users:
        # ── In-app notification log ──────────────────────────────────────
        in_app = NotificationLogDB(
            user_id=user.id,
            channel="in_app",
            recipient=user.phone,
            subject=f"{req.threat_type.replace('_',' ').title()} Alert",
            message=f"⚠️ {req.threat_type.replace('_',' ').title()} reported near your area. {req.description or ''}".strip(),
            threat_type=req.threat_type,
            status="sent",
            created_at=datetime.utcnow()
        )
        db.add(in_app)
        in_app_count += 1

        # ── Email notification ────────────────────────────────────────────
        if user.email:
            success = send_alert_email(
                to_email=user.email,
                threat_type=req.threat_type,
                description=req.description or "",
                location=req.location,
                reporter=req.reporter_name
            )
            email_log = NotificationLogDB(
                user_id=user.id,
                channel="email",
                recipient=user.email,
                subject=f"{req.threat_type.replace('_',' ').title()} Alert",
                message=req.description or "",
                threat_type=req.threat_type,
                status="sent" if success else "failed",
                created_at=datetime.utcnow()
            )
            db.add(email_log)
            if success:
                email_sent += 1

        # ── SMS (mock — plug in Africa's Talking here) ────────────────────
        sms_log = NotificationLogDB(
            user_id=user.id,
            channel="sms",
            recipient=user.phone,
            message=f"FarmShield Alert: {req.threat_type.replace('_',' ').title()} reported near you. Stay safe.",
            threat_type=req.threat_type,
            status="mock",   # change to "sent" when AT is integrated
            created_at=datetime.utcnow()
        )
        db.add(sms_log)

    db.commit()

    return {
        "in_app": in_app_count,
        "emails_sent": email_sent,
        "sms": len(users),
        "message": f"Notified {in_app_count} farmers in-app, {email_sent} via email, {len(users)} via SMS (mock)"
    }


@router.get("/history")
async def get_notification_history(
    user_id: int = Query(...),
    db: Session = Depends(get_db)
):
    """Get notifications for a specific user only."""
    logs = db.query(NotificationLogDB).filter(
        NotificationLogDB.user_id == user_id
    ).order_by(NotificationLogDB.created_at.desc()).limit(100).all()

    return {
        "count": len(logs),
        "logs": [
            {
                "id": l.id,
                "channel": l.channel,
                "recipient": l.recipient,
                "subject": l.subject,
                "message": l.message,
                "threat_type": l.threat_type,
                "status": l.status,
                "created_at": l.created_at.isoformat() if l.created_at else None
            }
            for l in logs
        ]
    }
