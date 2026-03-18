from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, Base
from app.routes import auth

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="FarmShield API", version="1.0.0")

# CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router)

from app.routes import safety
app.include_router(safety.router)

@app.get("/")
async def root():
    return {"message": "FarmShield API is running 🚀"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "farmshield-api", "database": "connected"}