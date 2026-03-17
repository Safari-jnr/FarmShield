\# Backend Dev Tasks - FarmShield



\## Week 1: Auth \& Safety API



\### Task 1: Database Setup

\- Install: `pip install sqlalchemy aiosqlite`

\- Create `app/database.py` with SQLite connection

\- Create models: User, CheckIn, Report

\- File to create: `app/models/database.py`



\### Task 2: User Registration API

\- Endpoint: `POST /auth/register`

\- Fields: phone, name, password, language

\- Hash password with bcrypt

\- Save to database



\### Task 3: User Login API  

\- Endpoint: `POST /auth/login`

\- Return JWT token

\- Verify password



\### Task 4: Safety Check API

\- Endpoint: `GET /safety/check?lat=\&lng=`

\- Return: GREEN, YELLOW, or RED status

\- Count nearby threats in 5km radius



\## Week 2: Check-ins \& Reports



\### Task 5: Check-in System

\- Endpoint: `POST /checkins` - Mark user as farming

\- Endpoint: `GET /checkins/nearby` - Count farmers near location

\- Auto checkout after 12 hours



\### Task 6: Threat Reporting

\- Endpoint: `POST /reports` - Submit threat

\- Fields: description, location, photo (optional)

\- Store in database



\### Task 7: SMS Alerts (Africa's Talking)

\- Sign up: africastalking.com

\- Send SMS when 3+ reports in same area

\- Endpoint for USSD callback (\*347#)



\## Week 3: Maps \& Polish



\### Task 8: Risk Zones API

\- Return geoJSON for map overlay

\- Endpoint: `GET /safety/zones`



\### Task 9: API Documentation

\- Test all endpoints at `/docs`

\- Write README for frontend dev

