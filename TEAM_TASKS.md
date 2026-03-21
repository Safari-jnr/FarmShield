# FarmShield - Team Task List (2 People)

## Team
- **Backend**: You - FastAPI, Database, APIs
- **Frontend**: Teammate - React, UI, Maps

## Git Workflow

### Rule: NEVER push directly to `main`

| Person | Their Branch | Purpose |
|--------|--------------|---------|
| You | `feature/backend-*` | Your backend code |
| Frontend Dev | `feature/frontend-*` | Their React code |
| Both | `main` | Only merge working, tested code |

---

## Current Status: Week 2 In Progress

### ✅ Completed (Week 1-2)
| Feature | Backend | Frontend |
|---------|---------|----------|
| User Auth | ✅ /auth/register, /auth/login | ✅ Login/Register pages |
| Safety Check | ✅ /safety/check | ✅ Risk badge |
| Check-in System | ✅ /checkins, /checkins/nearby | ✅ Check In/Out button |

### 🔄 In Progress (Week 2)
| Feature | Backend | Frontend |
|---------|---------|----------|
| Threat Reporting | 🔄 POST /reports | ⏳ Waiting for API |
| Reward Points | 🔄 Add points system | ⏳ Points display |
| Soil Testing | ⏳ Not started | 🔄 Soil Test Form |

### ⏳ Pending (Week 2-3)
| Feature | Backend | Frontend |
|---------|---------|----------|
| SMS Alerts | ⏳ Africa's Talking | ⏳ Alert banner |
| USSD Menu | ⏳ *347# callback | N/A |
| Interactive Map | ⏳ GeoJSON zones | ⏳ Leaflet map |
| Reward Redemption | ⏳ /rewards/redeem | ⏳ Rewards page |

---

## Your Current Task (Backend)

**Branch**: `feature/backend-threats`

### Task 1: Threat Reporting API
- [ ] POST /reports - Submit threat report
- [ ] Auto +10 reward points for reporting
- [ ] GET /reports/verified - Get verified threats
- [ ] GET /reports/crowd-verify - Auto-verify if 3+ reports

### Task 2: Update User Model for Rewards
- [ ] Add `points` column to UserDB
- [ ] Add `badge_level` column (Seedling, Sprout, Farmer, Guardian)

### Task 3: Reward System
- [ ] GET /rewards/points - Get user's points
- [ ] POST /rewards/calculate - Calculate points from actions

---

## Frontend Dev Current Task

**Branch**: `feature/frontend-soil-testing`

### Task 1: Soil Testing Form
- File: `src/components/SoilTestForm.js`
- Fields: pH slider (0-14), Nitrogen, Phosphorus, Potassium inputs
- Submit button calls POST /soil-tests (when ready)

### Task 2: Soil Results Display
- File: `src/components/SoilResults.js`
- Show soil data + farming recommendations

---

## API Endpoints Status

| Endpoint | Method | Status | Frontend Ready |
|----------|--------|--------|----------------|
| /auth/register | POST | ✅ Live | ✅ Yes |
| /auth/login | POST | ✅ Live | ✅ Yes |
| /safety/check | GET | ✅ Live | ✅ Yes |
| /checkins/ | POST | ✅ Live | ✅ Yes |
| /checkins/nearby | GET | ✅ Live | ✅ Yes |
| /reports/ | POST | 🔄 Building | ⏳ Waiting |
| /soil-tests/ | POST | ⏳ Not started | 🔄 Building form |

---

## Reward Points System

| Action | Points | Badge Progress |
|--------|--------|----------------|
| Daily check-in | +5 | - |
| Report threat | +10 | +1 report count |
| Verified report | +20 | +1 verified count |
| Soil test | +15 | - |
| 7-day streak | +50 bonus | - |

**Badges:**
- 🌱 Seedling: 0-100 points
- 🌿 Sprout: 100-500 points
- 🌾 Farmer: 500-1000 points
- 🏆 Guardian: 1000+ points

---

## Communication Rules

1. **Daily check-in**: "What I did, blockers, what's next"
2. **API ready?**: Backend tells frontend when endpoint is live
3. **Blocked?**: Ask immediately, don't wait
4. **Friday**: Test integration together

---

## Next Milestone

**Friday Goal**: 
- Backend: Threat reporting API working
- Frontend: Soil testing form ready
- Together: Test both features

---

## Quick Commands

```cmd
# You - Backend
git checkout main && git pull origin main
git checkout feature/backend-threats
# ... code ...
git add . && git commit -m "Add threat reporting API"
git push origin feature/backend-threats

# Frontend Dev
git checkout main && git pull origin main
git checkout feature/frontend-soil-testing
# ... code ...
git add . && git commit -m "Add soil testing form"
git push origin feature/frontend-soil-testing
# Create PR on GitHub
