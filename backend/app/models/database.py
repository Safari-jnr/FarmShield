from sqlalchemy import Column, Integer, String, DateTime, Float, Boolean
from app.database import Base
from datetime import datetime

class UserDB(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    phone = Column(String, unique=True, index=True)
    email = Column(String, nullable=True, index=True)
    name = Column(String)
    hashed_password = Column(String)
    language = Column(String, default="en")
    location_lat = Column(Float, nullable=True)
    location_lng = Column(Float, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    points = Column(Integer, default=0)
    reports_submitted = Column(Integer, default=0)
    reports_verified = Column(Integer, default=0)
    check_ins = Column(Integer, default=0)
    badge_level = Column(String, default="Seedling")  # Seedling, Sprout, Farmer, Guardian

class CheckInDB(Base):
    __tablename__ = "checkins"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer)
    check_in_time = Column(DateTime, default=datetime.utcnow)
    check_out_time = Column(DateTime, nullable=True)
    location_lat = Column(Float)
    location_lng = Column(Float)

class ReportDB(Base):
    __tablename__ = "reports"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer)
    description = Column(String)
    photo_url = Column(String, nullable=True)
    location_lat = Column(Float)
    location_lng = Column(Float)
    threat_type = Column(String)
    verified = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

class SoilTestDB(Base):
    __tablename__ = "soil_tests"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, index=True)
    location_lat = Column(Float, nullable=True)
    location_lng = Column(Float, nullable=True)
    
    # Soil measurements
    ph_level = Column(Float)  # 0-14
    nitrogen = Column(Float)  # mg/kg
    phosphorus = Column(Float)  # mg/kg
    potassium = Column(Float)  # mg/kg
    moisture = Column(Float, nullable=True)  # percentage (optional)
    
    # Results
    soil_health = Column(String)  # "Poor", "Fair", "Good", "Excellent"
    recommendations = Column(String)  # JSON string or text
    
    created_at = Column(DateTime, default=datetime.utcnow)

class NotificationLogDB(Base):
    __tablename__ = "notification_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=True)
    channel = Column(String)          # "email" | "sms" | "in_app"
    recipient = Column(String)        # email address or phone
    subject = Column(String, nullable=True)
    message = Column(String)
    status = Column(String, default="sent")   # sent | failed
    threat_type = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
