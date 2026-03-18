from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import Literal
from app.database import get_db
from app.models.database import ReportDB
from datetime import datetime, timedelta

router = APIRouter(prefix="/safety", tags=["safety"])

@router.get("/check")
async def check_safety(
    lat: float = Query(..., description="Latitude"),
    lng: float = Query(..., description="Longitude"),
    db: Session = Depends(get_db)
):
    # Check for verified threats within 24 hours
    time_threshold = datetime.utcnow() - timedelta(hours=24)
    
    # Get all verified threats in last 24 hours
    threats = db.query(ReportDB).filter(
        ReportDB.verified == True,
        ReportDB.created_at > time_threshold
    ).all()
    
    # Simple risk logic (improve with geospatial later)
    threat_count = len(threats)
    
    if threat_count >= 3:
        status = "RED"  # Danger - stay home
    elif threat_count >= 1:
        status = "YELLOW"  # Caution - be careful
    else:
        status = "GREEN"  # Safe - happy farming!
    
    # TODO: Count nearby farmers from checkins table
    farmers_nearby = 0
    
    return {
        "status": status,
        "farmers_nearby": farmers_nearby,
        "threats_reported": threat_count,
        "message": f"Area status: {status}. {threat_count} threats in last 24h."
    }