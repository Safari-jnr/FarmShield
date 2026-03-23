from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.database import SoilTestDB, UserDB
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime, timedelta
import json

router = APIRouter(prefix="/soil-tests", tags=["soil-testing"])

class SoilTestCreate(BaseModel):
    user_id: int
    lat: Optional[float] = None
    lng: Optional[float] = None
    ph_level: float  # 0-14
    nitrogen: float  # mg/kg
    phosphorus: float  # mg/kg
    potassium: float  # mg/kg
    moisture: Optional[float] = None  # percentage

class SoilTestResponse(BaseModel):
    id: int
    user_id: int
    ph_level: float
    nitrogen: float
    phosphorus: float
    potassium: float
    moisture: Optional[float]
    soil_health: str
    recommendations: List[str]
    created_at: datetime
    
    class Config:
        from_attributes = True

def analyze_soil(ph: float, n: float, p: float, k: float) -> tuple:
    """
    Analyze soil and return health status + recommendations
    Returns: (soil_health: str, recommendations: list)
    """
    score = 0
    recommendations = []
    
    # pH analysis (optimal: 6.0-7.5)
    if 6.0 <= ph <= 7.5:
        score += 25
        recommendations.append(" pH is optimal for most crops")
    elif ph < 6.0:
        score += 10
        recommendations.append("Soil is acidic - add lime to raise pH")
    else:
        score += 10
        recommendations.append(" Soil is alkaline - add sulfur to lower pH")
    
    # Nitrogen analysis (optimal: >50 mg/kg)
    if n > 50:
        score += 25
        recommendations.append(" Nitrogen levels good for plant growth")
    elif n > 20:
        score += 15
        recommendations.append(" Low nitrogen - add compost or NPK fertilizer")
    else:
        score += 5
        recommendations.append(" Very low nitrogen - urgent: apply urea or manure")
    
    # Phosphorus analysis (optimal: >25 mg/kg)
    if p > 25:
        score += 25
        recommendations.append(" Phosphorus adequate for root development")
    elif p > 10:
        score += 15
        recommendations.append(" Low phosphorus - add bone meal or TSP fertilizer")
    else:
        score += 5
        recommendations.append(" Very low phosphorus - apply DAP or TSP urgently")
    
    # Potassium analysis (optimal: >150 mg/kg)
    if k > 150:
        score += 25
        recommendations.append(" Potassium levels excellent for disease resistance")
    elif k > 80:
        score += 15
        recommendations.append(" Moderate potassium - add wood ash or KCl fertilizer")
    else:
        score += 5
        recommendations.append(" Low potassium - apply muriate of potash (MOP)")
    
    # Overall health rating
    if score >= 80:
        soil_health = "Excellent"
    elif score >= 60:
        soil_health = "Good"
    elif score >= 40:
        soil_health = "Fair"
    else:
        soil_health = "Poor"
        recommendations.append("🚨 Soil needs comprehensive treatment - consult agronomist")
    
    # Add crop suggestions based on pH
    if ph < 6.0:
        recommendations.append("🌱 Suitable crops: Cassava, Sweet potato, Pineapple")
    elif ph > 7.5:
        recommendations.append("🌱 Suitable crops: Cabbage, Carrot, Spinach")
    else:
        recommendations.append("🌱 Suitable crops: Maize, Rice, Beans, Vegetables")
    
    return soil_health, recommendations

@router.post("/", response_model=SoilTestResponse)
async def create_soil_test(test: SoilTestCreate, db: Session = Depends(get_db)):
    # Verify user exists
    user = db.query(UserDB).filter(UserDB.id == test.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Analyze soil
    soil_health, recommendations = analyze_soil(
        test.ph_level, 
        test.nitrogen, 
        test.phosphorus, 
        test.potassium
    )
    
    # Create database record
    db_test = SoilTestDB(
        user_id=test.user_id,
        location_lat=test.lat,
        location_lng=test.lng,
        ph_level=test.ph_level,
        nitrogen=test.nitrogen,
        phosphorus=test.phosphorus,
        potassium=test.potassium,
        moisture=test.moisture,
        soil_health=soil_health,
        recommendations=json.dumps(recommendations),
        created_at=datetime.utcnow()
    )
    
    db.add(db_test)
    
    # Add reward points for soil testing (+15 points)
    user.points += 15
    user.points += 15
    
    db.commit()
    db.refresh(db_test)
    
    return {
        "id": db_test.id,
        "user_id": db_test.user_id,
        "ph_level": db_test.ph_level,
        "nitrogen": db_test.nitrogen,
        "phosphorus": db_test.phosphorus,
        "potassium": db_test.potassium,
        "moisture": db_test.moisture,
        "soil_health": soil_health,
        "recommendations": recommendations,
        "created_at": db_test.created_at
    }

@router.get("/nearby")
async def get_nearby_soil_tests(
    lat: float,
    lng: float,
    radius_km: float = 5.0,
    db: Session = Depends(get_db)
):
    """
    Get soil tests from nearby farmers
    """
    # Get tests from last 30 days
    time_threshold = datetime.utcnow() - timedelta(days=30)
    
    recent_tests = db.query(SoilTestDB).filter(
        SoilTestDB.created_at > time_threshold
    ).all()
    
    # Parse recommendations from JSON
    results = []
    for test in recent_tests:
        try:
            recs = json.loads(test.recommendations) if test.recommendations else []
        except:
            recs = []
        
        results.append({
            "id": test.id,
            "location": {"lat": test.location_lat, "lng": test.location_lng},
            "ph_level": test.ph_level,
            "soil_health": test.soil_health,
            "recommendations": recs[:2],  # First 2 recommendations
            "created_at": test.created_at
        })
    
    return {
        "tests": results,
        "count": len(results),
        "message": f"Found {len(results)} soil tests in your area"
    }

@router.get("/user/{user_id}", response_model=List[SoilTestResponse])
async def get_user_soil_tests(user_id: int, db: Session = Depends(get_db)):
    """
    Get all soil tests for a specific user
    """
    tests = db.query(SoilTestDB).filter(SoilTestDB.user_id == user_id).order_by(
        SoilTestDB.created_at.desc()
    ).all()
    
    results = []
    for test in tests:
        try:
            recs = json.loads(test.recommendations) if test.recommendations else []
        except:
            recs = []
        
        results.append({
            "id": test.id,
            "user_id": test.user_id,
            "ph_level": test.ph_level,
            "nitrogen": test.nitrogen,
            "phosphorus": test.phosphorus,
            "potassium": test.potassium,
            "moisture": test.moisture,
            "soil_health": test.soil_health,
            "recommendations": recs,
            "created_at": test.created_at
        })
    
    return results