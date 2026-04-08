from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.database import engine, Base
from app.routes import auth, checkins, safety, reports, rewards, soil, ussd
from app.routes import map as map_router
from app.routes import notifications
from app.routes import settings
from sqlalchemy import text
import os
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="FarmShield API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve uploaded images
os.makedirs("uploads", exist_ok=True)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# Create tables, then patch any missing columns
Base.metadata.create_all(bind=engine)

with engine.connect() as conn:
    for col, definition in [
        ("check_ins", "INTEGER DEFAULT 0"),
        ("points", "INTEGER DEFAULT 0"),
        ("reports_submitted", "INTEGER DEFAULT 0"),
        ("reports_verified", "INTEGER DEFAULT 0"),
        ("badge_level", "VARCHAR DEFAULT 'Seedling'"),
        ("email", "VARCHAR"),
    ]:
        try:
            conn.execute(text(f"ALTER TABLE users ADD COLUMN {col} {definition}"))
            conn.commit()
        except Exception:
            pass  # column already exists

# Include routers
app.include_router(auth.router)
app.include_router(checkins.router)
app.include_router(safety.router)
app.include_router(reports.router)
app.include_router(rewards.router)
app.include_router(soil.router)
app.include_router(ussd.router)
app.include_router(map_router.router)
app.include_router(notifications.router)
app.include_router(settings.router)

@app.get("/")
async def root():
    return {"message": "FarmShield API is running"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "farmshield-api", "database": "connected"}