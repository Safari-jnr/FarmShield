from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, Base
from app.routes import auth, checkins, safety,reports,rewards,soil,ussd,map

# Create database tables on startup
Base.metadata.create_all(bind=engine)

app = FastAPI(title="FarmShield API", version="1.0.0")

# CORS for frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router)
app.include_router(checkins.router)
app.include_router(safety.router)
app.include_router(reports.router)
app.include_router(rewards.router)
app.include_router(soil.router)
app.include_router(ussd.router)
app.include_router(map.router)

@app.get("/")
async def root():
    return {"message": "FarmShield API is running"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "farmshield-api", "database": "connected"}