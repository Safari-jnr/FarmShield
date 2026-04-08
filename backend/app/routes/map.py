from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.database import ReportDB, CheckInDB, SoilTestDB
from datetime import datetime, timedelta
from typing import List, Dict, Any
from pydantic import BaseModel
import math

router = APIRouter(prefix="/map", tags=["map"])

class RiskZone(BaseModel):
    type: str = "Feature"
    geometry: Dict[str, Any]
    properties: Dict[str, Any]

class MapDataResponse(BaseModel):
    type: str = "FeatureCollection"
    features: List[RiskZone]
    
    model_config = {"from_attributes": True}

def calculate_distance(lat1: float, lng1: float, lat2: float, lng2: float) -> float:
    """Calculate distance in km between two points using Haversine formula"""
    R = 6371  # Earth's radius in km
    
    lat1_rad = math.radians(lat1)
    lat2_rad = math.radians(lat2)
    delta_lat = math.radians(lat2 - lat1)
    delta_lng = math.radians(lng2 - lng1)
    
    a = math.sin(delta_lat/2)**2 + math.cos(lat1_rad) * math.cos(lat2_rad) * math.sin(delta_lng/2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))
    
    return R * c

@router.get("/risk-zones", response_model=MapDataResponse)
async def get_risk_zones(
    lat: float = Query(..., description="Center latitude"),
    lng: float = Query(..., description="Center longitude"),
    radius_km: float = Query(10.0, description="Radius in km"),
    db: Session = Depends(get_db)
):
    """
    Get GeoJSON risk zones for map display
    Returns: RED (danger), YELLOW (caution), GREEN (safe) zones
    """
    
    # Get verified threats from last 24 hours
    time_threshold = datetime.utcnow() - timedelta(hours=24)
    threats = db.query(ReportDB).filter(
        ReportDB.verified == True,
        ReportDB.created_at > time_threshold
    ).all()
    
    features = []
    
    # Create risk zones around threats (RED zones - 2km radius)
    for threat in threats:
        if threat.location_lat and threat.location_lng:
            # Calculate distance from center
            distance = calculate_distance(lat, lng, threat.location_lat, threat.location_lng)
            
            if distance <= radius_km:
                # RED zone circle (2km radius around threat)
                red_zone = {
                    "type": "Feature",
                    "geometry": {
                        "type": "Point",
                        "coordinates": [threat.location_lng, threat.location_lat]
                    },
                    "properties": {
                        "zone_type": "RED",
                        "threat_type": threat.threat_type,
                        "description": threat.description,
                        "reported_at": threat.created_at.isoformat(),
                        "radius_km": 2.0,
                        "color": "#ef4444",  # Red
                        "fillColor": "#ef4444",
                        "fillOpacity": 0.3,
                        "message": f"DANGER: {threat.threat_type} reported here"
                    }
                }
                features.append(red_zone)
                
                # YELLOW buffer zone (5km radius - outer ring)
                yellow_zone = {
                    "type": "Feature",
                    "geometry": {
                        "type": "Point",
                        "coordinates": [threat.location_lng, threat.location_lat]
                    },
                    "properties": {
                        "zone_type": "YELLOW",
                        "threat_type": threat.threat_type,
                        "radius_km": 5.0,
                        "color": "#eab308",  # Yellow
                        "fillColor": "#eab308",
                        "fillOpacity": 0.1,
                        "message": f"CAUTION: {threat.threat_type} nearby"
                    }
                }
                features.append(yellow_zone)
    
    # Get active farmers (checked in within last 12 hours)
    checkin_threshold = datetime.utcnow() - timedelta(hours=12)
    active_farmers = db.query(CheckInDB).filter(
        CheckInDB.check_in_time > checkin_threshold,
        CheckInDB.check_out_time.is_(None),
        CheckInDB.location_lat.isnot(None),
        CheckInDB.location_lng.isnot(None)
    ).all()
    
    # Add farmer markers
    for farmer in active_farmers:
        distance = calculate_distance(lat, lng, farmer.location_lat, farmer.location_lng)
        
        if distance <= radius_km:
            farmer_marker = {
                "type": "Feature",
                "geometry": {
                    "type": "Point",
                    "coordinates": [farmer.location_lng, farmer.location_lat]
                },
                "properties": {
                    "zone_type": "FARMER",
                    "user_id": farmer.user_id,
                    "checked_in_at": farmer.check_in_time.isoformat(),
                    "color": "#22c55e",  # Green
                    "fillColor": "#22c55e",
                    "radius": 5,
                    "message": "Active farmer"
                }
            }
            features.append(farmer_marker)
    
    # Add safe zones (GREEN areas with no threats)
    # Create a grid of safe points
    safe_points = generate_safe_zones(lat, lng, radius_km, threats)
    for point in safe_points:
        features.append(point)
    
    return {
        "type": "FeatureCollection",
        "features": features
    }

def generate_safe_zones(center_lat: float, center_lng: float, radius_km: float, threats: list) -> list:
    """Generate GREEN safe zone markers where no threats exist"""
    safe_zones = []
    
    # Simple grid - 4 points in cardinal directions
    offsets = [
        (0.5, 0),   # North
        (-0.5, 0),  # South
        (0, 0.5),   # East
        (0, -0.5),  # West
    ]
    
    for lat_offset, lng_offset in offsets:
        # Approximate conversion: 1 degree ≈ 111 km
        point_lat = center_lat + (lat_offset / 111)
        point_lng = center_lng + (lng_offset / (111 * math.cos(math.radians(center_lat))))
        
        # Check if near any threat
        is_safe = True
        for threat in threats:
            if threat.location_lat and threat.location_lng:
                dist = calculate_distance(point_lat, point_lng, threat.location_lat, threat.location_lng)
                if dist < 3:  # Within 3km of threat = not safe
                    is_safe = False
                    break
        
        if is_safe:
            safe_zone = {
                "type": "Feature",
                "geometry": {
                    "type": "Point",
                    "coordinates": [point_lng, point_lat]
                },
                "properties": {
                    "zone_type": "GREEN",
                    "color": "#22c55e",
                    "fillColor": "#22c55e",
                    "fillOpacity": 0.2,
                    "radius_km": 1.5,
                    "message": "SAFE: No threats reported"
                }
            }
            safe_zones.append(safe_zone)
    
    return safe_zones

@router.get("/nearby-farmers")
async def get_nearby_farmers_map(
    lat: float,
    lng: float,
    radius_km: float = 5.0,
    db: Session = Depends(get_db)
):
    """
    Get active farmers for map display (simplified GeoJSON)
    """
    time_threshold = datetime.utcnow() - timedelta(hours=12)
    
    farmers = db.query(CheckInDB).filter(
        CheckInDB.check_in_time > time_threshold,
        CheckInDB.check_out_time.is_(None),
        CheckInDB.location_lat.isnot(None),
        CheckInDB.location_lng.isnot(None)
    ).all()
    
    nearby = []
    for farmer in farmers:
        dist = calculate_distance(lat, lng, farmer.location_lat, farmer.location_lng)
        if dist <= radius_km:
            nearby.append({
                "id": farmer.id,
                "user_id": farmer.user_id,
                "lat": farmer.location_lat,
                "lng": farmer.location_lng,
                "distance_km": round(dist, 2),
                "checked_in": farmer.check_in_time.isoformat()
            })
    
    return {
        "count": len(nearby),
        "farmers": nearby,
        "center": {"lat": lat, "lng": lng}
    }

@router.get("/soil-heatmap")
async def get_soil_heatmap(
    lat: float,
    lng: float,
    radius_km: float = 10.0,
    db: Session = Depends(get_db)
):
    """
    Get soil test data for heatmap display
    """
    time_threshold = datetime.utcnow() - timedelta(days=30)
    
    soil_tests = db.query(SoilTestDB).filter(
        SoilTestDB.created_at > time_threshold,
        SoilTestDB.location_lat.isnot(None),
        SoilTestDB.location_lng.isnot(None)
    ).all()
    
    heatmap_points = []
    for test in soil_tests:
        dist = calculate_distance(lat, lng, test.location_lat, test.location_lng)
        if dist <= radius_km:
            # Color based on soil health
            color_map = {
                "Excellent": "#22c55e",
                "Good": "#84cc16",
                "Fair": "#eab308",
                "Poor": "#ef4444"
            }
            
            heatmap_points.append({
                "lat": test.location_lat,
                "lng": test.location_lng,
                "ph": test.ph_level,
                "health": test.soil_health,
                "color": color_map.get(test.soil_health, "#64748b"),
                "intensity": 0.7
            })
    
    return {
        "points": heatmap_points,
        "count": len(heatmap_points)
    }