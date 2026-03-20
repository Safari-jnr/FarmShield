# FarmShield - Team Task List (2 People)

## Team
- **Backend**: You - FastAPI, Database, APIs
- **Frontend**: Teammate - React, UI, Maps

## PRD Features to Build
✅ User Registration & Login (DONE)
✅ Safety Check API (DONE)
⏳ Check-in System
⏳ Threat Reporting + Rewards
⏳ Soil Testing
⏳ SMS Alerts (Africa's Talking)
⏳ USSD Menu (*347#)
⏳ Interactive Map
⏳ Reward System (points, badges, redemption)

## Git Workflow
- NEVER push to `main` directly
- Use branches: `feature/backend-[name]`, `feature/frontend-[name]`
- Create PR → Review → Merge

---

## Week 2: Check-ins, Threats, Soil Testing

### Backend Tasks (You)

| # | Task | Endpoint | Details |
|---|------|----------|---------|
| 2.1 | Check-in System | `POST /checkins` | Mark user as farming, save location |
| 2.1 | Nearby Farmers | `GET /checkins/nearby` | Count farmers within 5km radius |
| 2.2 | Threat Reporting | `POST /reports` | Save threat report, +10 reward points |
| 2.2 | Crowd Verification | Auto-verify if 3+ reports in 30min | Trigger SMS alerts |
| 2.3 | Soil Testing | `POST /soil-tests` | pH, NPK, moisture levels |
| 2.3 | Soil Recommendations | `GET /soil-tests/nearby` | Return soil data + farming advice |
| 2.4 | SMS Alerts | Africa's Talking API | Send to all farmers in danger zone |

### Frontend Tasks (Teammate)

| # | Task | Component | Details |
|---|------|-----------|---------|
| 2.1 | Check-in Button | `CheckInButton.js` | Geolocation, POST location |
| 2.1 | Nearby Counter | `NearbyFarmers.js` | Show "12 farmers near you" |
| 2.2 | Report Form | `ReportThreat.js` | Text, photo, location, +points animation |
| 2.2 | Rewards Display | `RewardPoints.js` | Show current points, badge level |
| 2.3 | Soil Test Form | `SoilTestForm.js` | pH slider, NPK inputs, submit |
| 2.3 | Soil Results | `SoilResults.js` | Display recommendations |
| 2.4 | Alert Banner | `AlertBanner.js` | Show when SMS alert received |

---

## Week 3: USSD, Maps, Rewards System

### Backend Tasks

| # | Task | Endpoint | Details |
|---|------|----------|---------|
| 3.1 | USSD Callback | `POST /ussd` | Africa's Talking *347# menu |
| 3.2 | Risk Zones GeoJSON | `GET /safety/zones` | Map-friendly data |
| 3.3 | Reward System | `GET /rewards/points` | Calculate user points |
| 3.3 | Leaderboard | `GET /rewards/leaderboard` | Top 10 reporters |
| 3.3 | Redeem Points | `POST /rewards/redeem` | Exchange for items |
| 3.4 | Complete API Docs | `/docs` | Full documentation |

### Frontend Tasks

| # | Task | Component | Details |
|---|------|-----------|---------|
| 3.1 | N/A | - | USSD is phone-based |
| 3.2 | Interactive Map | `RiskMap.js` | Leaflet, color zones, farmer markers |
| 3.3 | Rewards Dashboard | `RewardsPage.js` | Points, badges, redeem options |
| 3.3 | Leaderboard | `Leaderboard.js` | Top farmers list |
| 3.4 | Final Polish | All components | Loading states, errors, mobile responsive |

---

## API Endpoints Summary

### Auth (DONE)
- `POST /auth/register` - Register new farmer
- `POST /auth/login` - Login, get token

### Safety (DONE)
- `GET /safety/check?lat=&lng=` - Get GREEN/YELLOW/RED status

### Check-ins (Week 2)
- `POST /checkins` - Check in (send lat, lng)
- `GET /checkins/nearby?lat=&lng=` - Count nearby farmers

### Threats (Week 2)
- `POST /reports` - Report threat (+10 points)
- `GET /reports/verified` - Get verified threats

### Soil Testing (Week 2)
- `POST /soil-tests` - Submit soil data
- `GET /soil-tests/nearby?lat=&lng=` - Get soil info for area

### Rewards (Week 3)
- `GET /rewards/points` - Get user's points
- `GET /rewards/leaderboard` - Top reporters
- `POST /rewards/redeem` - Redeem points

### USSD (Week 3)
- `POST /ussd` - Africa's Talking callback

---

## Reward Points System

| Action | Points |
|--------|--------|
| Daily check-in | +5 points |
| Report threat | +10 points |
| Report verified | +20 points |
| Soil test submitted | +15 points |
| 7-day streak | +50 bonus |

**Badges:**
- 🌱 Seedling: 0-100 points
- 🌿 Sprout: 100-500 points  
- 🌾 Farmer: 500-1000 points
- 🏆 Guardian: 1000+ points

---

## Communication
- Daily: "What I did, what's next, blockers"
- Friday: Test integration together
- Blockers: Ask immediately

## Current Status
🔴 Week 2 Starting - Check-in System