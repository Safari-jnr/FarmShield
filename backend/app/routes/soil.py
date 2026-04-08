from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.database import SoilTestDB, UserDB
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime, timedelta
import json
import hashlib

router = APIRouter(prefix="/soil", tags=["soil"])


# ─── Schemas ────────────────────────────────────────────────────────────────

class SoilTestCreate(BaseModel):
    user_id: int
    lat: Optional[float] = None
    lng: Optional[float] = None
    ph_level: float
    nitrogen: float
    phosphorus: float
    potassium: float
    moisture: Optional[float] = None

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
    model_config = {"from_attributes": True}

# ─── IoT Device Payload ──────────────────────────────────────────────────────
# Future: ESP32 / Arduino sensors will POST to /soil/iot/ingest
# Sensor kit: pH probe + NPK sensor + capacitive moisture sensor + GPS module
class IoTSensorPayload(BaseModel):
    device_id: str          # Unique sensor device ID
    api_key: str            # Device auth key (replace with JWT in production)
    lat: float
    lng: float
    ph_level: float
    nitrogen: float
    phosphorus: float
    potassium: float
    moisture: Optional[float] = None
    temperature: Optional[float] = None   # Soil temperature (°C)
    battery_pct: Optional[float] = None   # Device battery level


# ─── Analysis Logic ──────────────────────────────────────────────────────────

def analyze_soil(ph: float, n: float, p: float, k: float) -> tuple:
    score = 0
    recommendations = []

    if 6.0 <= ph <= 7.5:
        score += 25
        recommendations.append("✅ pH is optimal for most crops")
    elif ph < 6.0:
        score += 10
        recommendations.append("⚠️ Soil is acidic — add lime to raise pH")
    else:
        score += 10
        recommendations.append("⚠️ Soil is alkaline — add sulfur to lower pH")

    if n > 50:
        score += 25
        recommendations.append("✅ Nitrogen levels good")
    elif n > 20:
        score += 15
        recommendations.append("⚠️ Low nitrogen — add compost or urea")
    else:
        score += 5
        recommendations.append("🚨 Very low nitrogen — apply urea urgently")

    if p > 25:
        score += 25
        recommendations.append("✅ Phosphorus adequate")
    elif p > 10:
        score += 15
        recommendations.append("⚠️ Low phosphorus — add bone meal or DAP")
    else:
        score += 5
        recommendations.append("🚨 Very low phosphorus — apply DAP fertiliser")

    if k > 150:
        score += 25
        recommendations.append("✅ Potassium excellent")
    elif k > 80:
        score += 15
        recommendations.append("⚠️ Moderate potassium — add wood ash or MOP")
    else:
        score += 5
        recommendations.append("🚨 Low potassium — apply MOP fertiliser")

    if score >= 80:
        soil_health = "Excellent"
    elif score >= 60:
        soil_health = "Good"
    elif score >= 40:
        soil_health = "Fair"
    else:
        soil_health = "Poor"
        recommendations.append("🚨 Consult an agronomist urgently")

    if ph < 6.0:
        recommendations.append("🌱 Best crops: Cassava, Sweet potato, Groundnut")
    elif ph > 7.5:
        recommendations.append("🌱 Best crops: Cabbage, Carrot, Spinach")
    else:
        recommendations.append("🌱 Best crops: Maize, Rice, Beans, Sorghum")

    return soil_health, recommendations


# ─── Endpoints ───────────────────────────────────────────────────────────────

@router.get("/")
async def get_soil_by_location(
    lat: float = Query(...),
    lon: float = Query(...),
    db: Session = Depends(get_db)
):
    """
    Simulated soil analysis based on GPS coordinates.
    DATA SOURCE: Algorithmically generated from location hash.
    TODO: Replace with real sensor data from /soil/iot/ingest when IoT kit is deployed.
    """
    # Check if real IoT data exists for this location (within ~500m)
    recent = db.query(SoilTestDB).filter(
        SoilTestDB.created_at > datetime.utcnow() - timedelta(days=7),
        SoilTestDB.location_lat.between(lat - 0.005, lat + 0.005),
        SoilTestDB.location_lng.between(lon - 0.005, lon + 0.005)
    ).order_by(SoilTestDB.created_at.desc()).first()

    if recent:
        # Real sensor data available — use it
        try:
            recs = json.loads(recent.recommendations) if recent.recommendations else []
        except Exception:
            recs = []
        return {
            "lat": lat, "lon": lon,
            "soil_type": "Loamy Sand" if recent.ph_level < 7 else "Clay Loam",
            "ph": round(recent.ph_level, 1),
            "moisture": round(recent.moisture or 0, 1),
            "nitrogen": round(recent.nitrogen, 1),
            "phosphorus": round(recent.phosphorus, 1),
            "potassium": round(recent.potassium, 1),
            "npk": f"N:{int(recent.nitrogen)} P:{int(recent.phosphorus)} K:{int(recent.potassium)}",
            "soil_health": recent.soil_health,
            "recommendations": recs,
            "source": "IoT Sensor",          # Real data badge
            "data_age_hours": round((datetime.utcnow() - recent.created_at).seconds / 3600, 1)
        }

    # No real data — fall back to simulated estimate
    loc_string = f"{round(lat,3)},{round(lon,3)}"
    hash_val = int(hashlib.md5(loc_string.encode()).hexdigest(), 16)

    ph         = round(5.5 + (hash_val % 30) / 10, 1)
    nitrogen   = round(20  + (hash_val % 80), 1)
    phosphorus = round(10  + (hash_val % 40), 1)
    potassium  = round(80  + (hash_val % 200), 1)
    moisture   = round(30  + (hash_val % 50), 1)

    soil_health, recommendations = analyze_soil(ph, nitrogen, phosphorus, potassium)

    return {
        "lat": lat, "lon": lon,
        "soil_type": "Loamy Sand" if ph < 7 else "Clay Loam",
        "ph": ph, "moisture": moisture,
        "nitrogen": nitrogen, "phosphorus": phosphorus, "potassium": potassium,
        "npk": f"N:{int(nitrogen)} P:{int(phosphorus)} K:{int(potassium)}",
        "soil_health": soil_health,
        "recommendations": recommendations,
        "source": "Simulated",               # Honest label
        "data_age_hours": None
    }


@router.post("/iot/ingest")
async def iot_ingest(payload: IoTSensorPayload, db: Session = Depends(get_db)):
    """
    IoT sensor ingestion endpoint.
    
    FUTURE HARDWARE:
    - ESP32 microcontroller with WiFi/GSM (SIM800L for rural areas)
    - Gravity analog pH sensor (DFRobot)
    - NPK soil sensor (RS485 Modbus)
    - Capacitive soil moisture sensor v1.2
    - NEO-6M GPS module
    
    Device sends POST to this endpoint every 6 hours or on-demand.
    API key auth here — upgrade to JWT + device registry in production.
    """
    # TODO: Replace with proper device registry lookup
    VALID_API_KEY = "farmshield-iot-v1"
    if payload.api_key != VALID_API_KEY:
        raise HTTPException(status_code=401, detail="Invalid device API key")

    soil_health, recommendations = analyze_soil(
        payload.ph_level, payload.nitrogen, payload.phosphorus, payload.potassium
    )

    db_test = SoilTestDB(
        user_id=0,  # 0 = IoT device (no user)
        location_lat=payload.lat,
        location_lng=payload.lng,
        ph_level=payload.ph_level,
        nitrogen=payload.nitrogen,
        phosphorus=payload.phosphorus,
        potassium=payload.potassium,
        moisture=payload.moisture,
        soil_health=soil_health,
        recommendations=json.dumps(recommendations),
        created_at=datetime.utcnow()
    )
    db.add(db_test)
    db.commit()
    db.refresh(db_test)

    return {
        "status": "ok",
        "device_id": payload.device_id,
        "soil_health": soil_health,
        "record_id": db_test.id,
        "message": f"Sensor data saved. Health: {soil_health}"
    }


@router.post("/tests", response_model=SoilTestResponse)
async def create_soil_test(test: SoilTestCreate, db: Session = Depends(get_db)):
    """Manual soil test entry (lab results or field kit)."""
    user = db.query(UserDB).filter(UserDB.id == test.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    soil_health, recommendations = analyze_soil(
        test.ph_level, test.nitrogen, test.phosphorus, test.potassium
    )

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
    user.points += 15
    db.commit()
    db.refresh(db_test)

    return {
        "id": db_test.id, "user_id": db_test.user_id,
        "ph_level": db_test.ph_level, "nitrogen": db_test.nitrogen,
        "phosphorus": db_test.phosphorus, "potassium": db_test.potassium,
        "moisture": db_test.moisture, "soil_health": soil_health,
        "recommendations": recommendations, "created_at": db_test.created_at
    }


@router.get("/nearby")
async def get_nearby_soil_tests(lat: float, lng: float, radius_km: float = 5.0, db: Session = Depends(get_db)):
    recent_tests = db.query(SoilTestDB).filter(
        SoilTestDB.created_at > datetime.utcnow() - timedelta(days=30)
    ).all()
    results = []
    for test in recent_tests:
        try:
            recs = json.loads(test.recommendations) if test.recommendations else []
        except Exception:
            recs = []
        results.append({
            "id": test.id,
            "location": {"lat": test.location_lat, "lng": test.location_lng},
            "ph_level": test.ph_level, "soil_health": test.soil_health,
            "recommendations": recs[:2], "created_at": test.created_at
        })
    return {"tests": results, "count": len(results)}


class SoilTestCreate(BaseModel):
    user_id: int
    lat: Optional[float] = None
    lng: Optional[float] = None
    ph_level: float
    nitrogen: float
    phosphorus: float
    potassium: float
    moisture: Optional[float] = None

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
    
    model_config = {"from_attributes": True}

def analyze_soil(ph: float, n: float, p: float, k: float) -> tuple:
    score = 0
    recommendations = []
    
    if 6.0 <= ph <= 7.5:
        score += 25
        recommendations.append("✅ pH is optimal for most crops")
    elif ph < 6.0:
        score += 10
        recommendations.append("⚠️ Soil is acidic - add lime to raise pH")
    else:
        score += 10
        recommendations.append("⚠️ Soil is alkaline - add sulfur to lower pH")
    
    if n > 50:
        score += 25
        recommendations.append("✅ Nitrogen levels good")
    elif n > 20:
        score += 15
        recommendations.append("⚠️ Low nitrogen - add compost")
    else:
        score += 5
        recommendations.append("🚨 Very low nitrogen - apply urea urgently")
    
    if p > 25:
        score += 25
        recommendations.append("✅ Phosphorus adequate")
    elif p > 10:
        score += 15
        recommendations.append("⚠️ Low phosphorus - add bone meal")
    else:
        score += 5
        recommendations.append("🚨 Very low phosphorus - apply DAP")
    
    if k > 150:
        score += 25
        recommendations.append("✅ Potassium excellent")
    elif k > 80:
        score += 15
        recommendations.append("⚠️ Moderate potassium - add wood ash")
    else:
        score += 5
        recommendations.append("🚨 Low potassium - apply MOP")
    
    if score >= 80:
        soil_health = "Excellent"
    elif score >= 60:
        soil_health = "Good"
    elif score >= 40:
        soil_health = "Fair"
    else:
        soil_health = "Poor"
        recommendations.append("🚨 Consult agronomist urgently")
    
    # Crop suggestions
    if ph < 6.0:
        recommendations.append("🌱 Crops: Cassava, Sweet potato")
    elif ph > 7.5:
        recommendations.append("🌱 Crops: Cabbage, Carrot, Spinach")
    else:
        recommendations.append("🌱 Crops: Maize, Rice, Beans")
    
    return soil_health, recommendations

# ✅ NEW: Simple GET endpoint for frontend
@router.get("/")
async def get_soil_by_location(
    lat: float = Query(...),
    lon: float = Query(...),
    db: Session = Depends(get_db)
):
    """
    Get soil data by location coordinates
    """
    loc_string = f"{lat},{lon}"
    hash_val = int(hashlib.md5(loc_string.encode()).hexdigest(), 16)
    
    ph = 5.5 + (hash_val % 30) / 10
    nitrogen = 20 + (hash_val % 80)
    phosphorus = 10 + (hash_val % 40)
    potassium = 80 + (hash_val % 200)
    moisture = 30 + (hash_val % 50)
    
    soil_health, recommendations = analyze_soil(ph, nitrogen, phosphorus, potassium)
    
    return {
        "lat": lat,
        "lon": lon,
        "soil_type": "Loamy Sand" if ph < 7 else "Clay Loam",
        "ph": round(ph, 1),
        "moisture": round(moisture, 1),
        "npk": f"N: {int(nitrogen)}, P: {int(phosphorus)}, K: {int(potassium)}",
        "nitrogen": round(nitrogen, 1),
        "phosphorus": round(round(phosphorus, 1), 1),
        "potassium": round(potassium, 1),
        "soil_health": soil_health,
        "recommendations": recommendations,
        "source": "FarmShield Analysis"
    }

# Keep your existing POST endpoint for detailed testing
@router.post("/tests", response_model=SoilTestResponse)
async def create_soil_test(test: SoilTestCreate, db: Session = Depends(get_db)):
    user = db.query(UserDB).filter(UserDB.id == test.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    soil_health, recommendations = analyze_soil(
        test.ph_level, test.nitrogen, test.phosphorus, test.potassium
    )
    
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
    user.points += 15  # Fixed: was adding twice
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
    time_threshold = datetime.utcnow() - timedelta(days=30)
    recent_tests = db.query(SoilTestDB).filter(
        SoilTestDB.created_at > time_threshold
    ).all()
    
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
            "recommendations": recs[:2],
            "created_at": test.created_at
        })
    
    return {"tests": results, "count": len(results)}

@router.get("/user/{user_id}", response_model=List[SoilTestResponse])
async def get_user_soil_tests(user_id: int, db: Session = Depends(get_db)):
    tests = db.query(SoilTestDB).filter(
        SoilTestDB.user_id == user_id
    ).order_by(SoilTestDB.created_at.desc()).all()
    
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