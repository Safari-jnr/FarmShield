from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.database import CheckInDB
from pydantic import BaseModel
from datetime import datetime, timedelta

router = APIRouter(prefix="/checkins", tags=["checkins"])

class CheckInCreate(BaseModel):
    user_id: int
    lat: float
    lng: float

class CheckInResponse(BaseModel):
    id: int
    user_id: int
    check_in_time: datetime
    message: str

    class Config:
        from_attributes = True

@router.post("/", response_model=CheckInResponse)
async def check_in(data: CheckInCreate, db: Session = Depends(get_db)):
    # Check if user already checked in today
    today_start = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
    existing = db.query(CheckInDB).filter(
        CheckInDB.user_id == data.user_id,
        CheckInDB.check_in_time >= today_start
    ).first()
    
    if existing:
        raise HTTPException(status_code=400, detail="Already checked in today")
    
    # Create new check-in
    checkin = CheckInDB(
        user_id=data.user_id,
        location_lat=data.lat,
        location_lng=data.lng,
        check_in_time=datetime.utcnow()
    )
    db.add(checkin)
    db.commit()
    db.refresh(checkin)
    
    return {
        "id": checkin.id,
        "user_id": checkin.user_id,
        "check_in_time": checkin.check_in_time,
        "message": "Checked in successfully! +5 points"
    }

@router.get("/nearby")
async def get_nearby_farmers(
    lat: float,
    lng: float,
    radius_km: float = 5.0,
    db: Session = Depends(get_db)
):
    # Get active check-ins from last 12 hours
    time_threshold = datetime.utcnow() - timedelta(hours=12)
    
    farmers = db.query(CheckInDB).filter(
        CheckInDB.check_in_time >= time_threshold,
        CheckInDB.check_out_time.is_(None)
    ).all()
    
    nearby_count = len(farmers)
    
    return {
        "farmers_nearby": nearby_count,
        "radius_km": radius_km,
        "message": f"{nearby_count} farmers farming near you"
    }

@router.post("/checkout/{user_id}")
async def check_out(user_id: int, db: Session = Depends(get_db)):
    # Find active check-in
    checkin = db.query(CheckInDB).filter(
        CheckInDB.user_id == user_id,
        CheckInDB.check_out_time.is_(None)
    ).first()
    
    if not checkin:
        raise HTTPException(status_code=400, detail="No active check-in found")
    
    checkin.check_out_time = datetime.utcnow()
    db.commit()
    
    return {"message": "Checked out successfully. Stay safe!"}