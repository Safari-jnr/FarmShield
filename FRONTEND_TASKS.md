\# Frontend Dev Tasks - FarmShield



\## Tools to Install

\- Node.js 18+

\- Libraries: `npm install axios react-router-dom leaflet react-leaflet`



\## Week 1: Auth Pages    venv\Scripts\activate



\### Task 1: Project Setup

\- Run: `npx create-react-app frontend` (or use existing)

\- Install: `npm install axios react-router-dom`

\- Folder structure: components/, pages/, services/



\### Task 2: Login Page

\- File: `src/pages/Login.js`

\- Form: phone input, password input

\- API call to: `POST http://localhost:8000/auth/login`

\- Store token in localStorage



\### Task 3: Register Page

\- File: `src/pages/Register.js`

\- Form: phone, name, password, language

\- API call to: `POST http://localhost:8000/auth/register`



\### Task 4: Safety Dashboard (Main Page)

\- File: `src/pages/Dashboard.js`

\- Show: Risk level badge (GREEN/YELLOW/RED)

\- Show: "Farmers near you: X"

\- Button: "Check In" / "Check Out"



\## Week 2: Core Features



\### Task 5: Check-in Button

\- Get user location (browser geolocation)

\- POST to: `POST /checkins` with location

\- Show success message



\### Task 6: Report Threat Form

\- File: `src/components/ReportForm.js`

\- Fields: description, threat type dropdown

\- Optional: photo upload

\- POST to: `POST /reports`



\### Task 7: Alerts Display

\- Show banner when SMS alert received

\- Polling: GET `/safety/check` every 5 minutes



\## Week 3: Maps \& Polish



\### Task 8: Interactive Map

\- Library: Leaflet (react-leaflet)

\- Show: User location, nearby farmers

\- Color zones: Green safe, Yellow caution, Red danger



\### Task 9: Mobile Responsive

\- Test on phone browser


Rewards Task---------------------------------
## Frontend Tasks - Reward System (New)

### Task: Rewards Dashboard Page
**File**: `src/pages/Rewards.js`
**API**: `GET /rewards/{user_id}`

Display:
- Current points (big number)
- Badge level with icon (🌱 Seedling, 🌿 Sprout, 🌾 Farmer, 🏆 Guardian)
- Progress bar to next badge
- Reports submitted count
- Reports verified count

### Task: Leaderboard Page
**File**: `src/pages/Leaderboard.js`
**API**: `GET /rewards/leaderboard/top`

Display:
- Top 10 farmers list
- Rank number, name, points, badge
- Highlight current user

### Task: Points Animation
**File**: `src/components/PointsAnimation.js`

When user submits report:
- Show "+10 points!" floating animation
- Update points display in real-time

### Task: Badge Unlock Notification
**File**: `src/components/BadgeNotification.js`

When user levels up (e.g., Seedling → Sprout):
- Show congratulation modal
- Display new badge icon

\- Make buttons big for farmers

\- Simple, clear UI (many users have low literacy)



\## API Base URL
http://localhost:8000

