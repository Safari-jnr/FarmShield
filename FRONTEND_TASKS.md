\# Frontend Dev Tasks - FarmShield



\## Tools to Install

\- Node.js 18+

\- Libraries: `npm install axios react-router-dom leaflet react-leaflet`



\## Week 1: Auth Pages



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

\- Make buttons big for farmers

\- Simple, clear UI (many users have low literacy)



\## API Base URL
http://localhost:8000

