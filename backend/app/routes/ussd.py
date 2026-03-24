from fastapi import APIRouter, Form, Response, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.database import UserDB, CheckInDB, ReportDB
from datetime import datetime, timedelta

router = APIRouter(tags=["ussd"])

@router.post("/ussd")
async def ussd_callback(
    sessionId: str = Form(...),
    phoneNumber: str = Form(...),
    text: str = Form(default=""),
    db: Session = Depends(get_db)
):
    """
    USSD callback for *347#
    Farmers dial *347# to check safety without internet
    """
    
    # Parse user input (e.g., "1*2" means pressed 1, then 2)
    inputs = text.split("*") if text else []
    current_input = inputs[-1] if inputs else ""
    
    # Get user from database
    user = db.query(UserDB).filter(UserDB.phone == phoneNumber).first()
    
    # ========== MAIN MENU ==========
    if not text:
        response = """CON Welcome to FarmShield NG
1. Check Safety Status
2. Check In (Start Farming)
3. Check Out (Stop Farming)
4. Report Threat
5. My Points & Badge
0. Exit"""
        return Response(content=response, media_type="text/plain")
    
    # ========== OPTION 1: CHECK SAFETY ==========
    if current_input == "1":
        # Check for verified threats in last 24 hours
        time_threshold = datetime.utcnow() - timedelta(hours=24)
        threat_count = db.query(ReportDB).filter(
            ReportDB.verified == True,
            ReportDB.created_at > time_threshold
        ).count()
        
        # Determine status
        if threat_count >= 3:
            status = "RED - DANGER!"
            message = "AVOID farming today. Multiple threats reported."
        elif threat_count >= 1:
            status = "YELLOW - CAUTION"
            message = "Be careful. Some threats nearby."
        else:
            status = "GREEN - SAFE"
            message = "Safe to farm. Have a good day!"
        
        response = f"""END Safety Status: {status}
{message}
FarmShield NG"""
        return Response(content=response, media_type="text/plain")
    
    # ========== OPTION 2: CHECK IN ==========
    if current_input == "2":
        if not user:
            response = """END Please register first.
Download FarmShield app or visit farmshield.ng"""
            return Response(content=response, media_type="text/plain")
        
        # Check if already checked in today
        today_start = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
        existing = db.query(CheckInDB).filter(
            CheckInDB.user_id == user.id,
            CheckInDB.check_in_time >= today_start
        ).first()
        
        if existing:
            response = f"""END You are already checked in today.
Current points: {user.points}
Stay safe!"""
        else:
            # Create check-in (simplified - no location from USSD)
            checkin = CheckInDB(
                user_id=user.id,
                check_in_time=datetime.utcnow()
            )
            db.add(checkin)
            user.points += 5  # +5 for check-in
            db.commit()
            
            response = f"""END Checked in successfully!
+5 points earned!
Total points: {user.points}
Happy farming!"""
        
        return Response(content=response, media_type="text/plain")
    
    # ========== OPTION 3: CHECK OUT ==========
    if current_input == "3":
        if not user:
            response = """END Please register first.
Download FarmShield app or visit farmshield.ng"""
            return Response(content=response, media_type="text/plain")
        
        # Find active check-in
        checkin = db.query(CheckInDB).filter(
            CheckInDB.user_id == user.id,
            CheckInDB.check_out_time.is_(None)
        ).first()
        
        if not checkin:
            response = """END No active check-in found.
You may have already checked out."""
        else:
            checkin.check_out_time = datetime.utcnow()
            db.commit()
            response = """END Checked out successfully.
Thanks for using FarmShield!
Come back tomorrow."""
        
        return Response(content=response, media_type="text/plain")
    
    # ========== OPTION 4: REPORT THREAT (Sub-menu) ==========
    if current_input == "4":
        response = """CON Report Threat:
1. Bandits/Robbers
2. Sick Crops
3. Pests/Diseases
4. Dead Animals
5. Other
0. Back to Main"""
        return Response(content=response, media_type="text/plain")
    
    # ========== OPTION 5: MY POINTS ==========
    if current_input == "5":
        if not user:
            response = """END Please register first.
Download FarmShield app or visit farmshield.ng"""
            return Response(content=response, media_type="text/plain")
        
        # Calculate next badge
        next_badge = 0
        if user.badge_level == "Seedling":
            next_badge = 100 - user.points
        elif user.badge_level == "Sprout":
            next_badge = 500 - user.points
        elif user.badge_level == "Farmer":
            next_badge = 1000 - user.points
        
        response = f"""END Your Stats:
Points: {user.points}
Badge: {user.badge_level}
Reports: {user.reports_submitted}
Next badge: {max(0, next_badge)} pts needed
Keep it up!"""
        return Response(content=response, media_type="text/plain")
    
    # ========== OPTION 0: EXIT ==========
    if current_input == "0":
        response = """END Thank you for using FarmShield NG.
Stay safe!"""
        return Response(content=response, media_type="text/plain")
    
    # ========== THREAT TYPE SELECTION (4 -> 1/2/3/4/5) ==========
    if len(inputs) >= 2 and inputs[-2] == "4":
        threat_types = {
            "1": "Bandits",
            "2": "Sick Crops",
            "3": "Pests",
            "4": "Dead Animals",
            "5": "Other"
        }
        
        if current_input in threat_types:
            threat = threat_types[current_input]
            
            if user:
                # Create report
                report = ReportDB(
                    user_id=user.id,
                    description=f"USSD: {threat}",
                    threat_type=threat.lower().replace(" ", "_"),
                    verified=False,
                    created_at=datetime.utcnow()
                )
                db.add(report)
                user.points += 10
                user.reports_submitted += 1
                db.commit()
                
                response = f"""END Threat reported: {threat}
+10 points earned!
Total: {user.points} points
We'll alert nearby farmers."""
            else:
                response = """END Please register first to report threats.
Download FarmShield app."""
            
            return Response(content=response, media_type="text/plain")
    
    # ========== INVALID INPUT ==========
    response = """CON Invalid option.
Please try again:
0. Back to Main Menu"""
    return Response(content=response, media_type="text/plain")