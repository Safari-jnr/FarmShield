\# 🛡️ FarmShield | Sprint Roadmap: Week 3

\*\*Phase:\*\* Telephony Integration \& UI Expansion  

\*\*Current Branch:\*\* `feature/backend-sms`  

\*\*Status:\*\* Active Execution (Parallel Development)



\---



\## 👥 Core Workstreams



| Role | Lead | Domain | Tech Stack |

| :--- | :--- | :--- | :--- |

| \*\*Backend\*\* | @User | API \& Telephony Gateway | FastAPI, Africa's Talking SDK |

| \*\*Frontend\*\* | @Teammate | UX/UI \& Alert Systems | React.js, Tailwind CSS |



\---



\## 🛠️ Backend Objectives (USSD Architecture)

\*Objective: Implement a robust USSD gateway to ensure offline accessibility for non-smartphone users.\*



\### 1. Gateway Implementation

\- \*\*Module:\*\* `app/routes/ussd.py`

\- \*\*Endpoint:\*\* `POST /ussd`

\- \*\*Integration:\*\* Callback listener for Africa’s Talking platform (`\*347#`).



\### 2. USSD State Machine logic:

\- \[ ] \*\*Root (`\*347#`):\*\* Welcome menu (1. Status, 2. Check-In, 3. Check-Out, 4. Report, 5. Points).

\- \[ ] \*\*Level 1 (Safety):\*\* Query DB for regional safety color (Green/Yellow/Red).

\- \[ ] \*\*Level 4 (Threat):\*\* Trigger emergency broadcast to verified users in proximity.



\---



\## 🎨 Frontend Objectives (SMS \& Notification UI)

\*Objective: Build modular notification components to handle real-time and historical threat data.\*



\### 1. Component Development

| Component | Source File | Description |

| :--- | :--- | :--- |

| \*\*SMS Notification Banner\*\* | `SMSNotificationBanner.js` | Top-level alert showing "Alert sent to X farmers." |

| \*\*Notification History\*\* | `NotificationHistory.js` | Archive page for past SMS broadcast logs. |

| \*\*Push Notification Toggle\*\* | `PushNotificationToggle.js` | User settings for opt-in/opt-out of alerts. |



\### 2. API Integration Reference

The following endpoints are \*\*READY\*\* for consumption at `http://localhost:8000`:



| Endpoint | Method | Purpose |

| :--- | :--- | :--- |

| `/reports/sms-logs` | `GET` | Fetch broadcast history (Timestamp, message, recipients). |

| `/reports/verified` | `GET` | Fetch live verified threats for the notification banner. |

| `/user/{id}` | `GET` | Fetch user metadata for settings/toggles. |



\#### Example Consumption (React):

```javascript

// Fetching SMS Broadcast Logs

const fetchSmsLogs = async () => {

&#x20;   const res = await fetch('http://localhost:8000/reports/sms-logs');

&#x20;   const data = await res.json();

&#x20;   // Expected structure: { count: integer, logs: Array, note: string }

};





## 🗺️ Sprint Expansion: Geospatial & Risk Visualization
**Module:** Mapping Engine (Phase 2)  
**Objective:** Visualize regional risk zones and farmer distribution via GeoJSON integration.

---

### 📡 Map API Specifications
The following Geospatial endpoints are now **Live** for Frontend consumption:

| Endpoint | Method | Response Type | Application |
| :--- | :--- | :--- | :--- |
| `/map/risk-zones` | `GET` | `GeoJSON` | Dynamic Risk Overlays (Red/Yellow/Green) |
| `/map/nearby-farmers` | `GET` | `GeoJSON` | Real-time Farmer Position Markers |
| `/map/soil-heatmap` | `GET` | `GeoJSON` | Soil Quality & Nutrient Heatmap |

---

### 🎨 Frontend Task: Geospatial Intelligence UI
**Lead:** @Teammate  
**Core Component:** `src/components/RiskMap.js`  
**Required Dependencies:** ```bash
npm install leaflet react-leaflet

🛠️ Implementation Requirements:
[ ] Risk Perimeters: Render RED (#ef4444) 2km radius and YELLOW (#eab308) 5km radius circles around verified threats.

[ ] Presence Tracking: Render GREEN (#22c55e) markers for all farmers currently "Checked In."

[ ] Soil Analytics: Overlay colored polygons/points based on the soil health heatmap data.

[ ] Geolocation: Implement navigator.geolocation to auto-center the map on the user’s current coordinates.


// Example: Consuming Risk Zone GeoJSON
const fetchRiskZones = async (lat, lng) => {
    const response = await fetch(`http://localhost:8000/map/risk-zones?lat=${lat}&lng=${lng}`);
    const geojson = await response.json();
    return geojson;
};

// Usage within <MapContainer />:
// <GeoJSON data={geojson} style={(feature) => ({ color: feature.properties.color })} />

Gemini said
This is the professional GitHub Markdown addition for the Map integration. I have integrated this into a "Sprint Expansion" format that fits perfectly with the previous task lists.

You can copy and paste this directly into your GitHub Issue or TASKS.md:

Markdown
## 🗺️ Sprint Expansion: Geospatial & Risk Visualization
**Module:** Mapping Engine (Phase 2)  
**Objective:** Visualize regional risk zones and farmer distribution via GeoJSON integration.

---

### 📡 Map API Specifications
The following Geospatial endpoints are now **Live** for Frontend consumption:

| Endpoint | Method | Response Type | Application |
| :--- | :--- | :--- | :--- |
| `/map/risk-zones` | `GET` | `GeoJSON` | Dynamic Risk Overlays (Red/Yellow/Green) |
| `/map/nearby-farmers` | `GET` | `GeoJSON` | Real-time Farmer Position Markers |
| `/map/soil-heatmap` | `GET` | `GeoJSON` | Soil Quality & Nutrient Heatmap |

---

### 🎨 Frontend Task: Geospatial Intelligence UI
**Lead:** @Teammate  
**Core Component:** `src/components/RiskMap.js`  
**Required Dependencies:** ```bash
npm install leaflet react-leaflet
🛠️ Implementation Requirements:
[ ] Risk Perimeters: Render RED (#ef4444) 2km radius and YELLOW (#eab308) 5km radius circles around verified threats.

[ ] Presence Tracking: Render GREEN (#22c55e) markers for all farmers currently "Checked In."

[ ] Soil Analytics: Overlay colored polygons/points based on the soil health heatmap data.

[ ] Geolocation: Implement navigator.geolocation to auto-center the map on the user’s current coordinates.

🏗️ Technical Example (Leaflet Integration):
JavaScript
// Example: Consuming Risk Zone GeoJSON
const fetchRiskZones = async (lat, lng) => {
    const response = await fetch(`http://localhost:8000/map/risk-zones?lat=${lat}&lng=${lng}`);
    const geojson = await response.json();
    return geojson;
};

// Usage within <MapContainer />:
// <GeoJSON data={geojson} style={(feature) => ({ color: feature.properties.color })} />
🎨 Design System: Map Palette
Zone Type	Hex Code	Utility
Danger	#ef4444	High-risk verified threats (2km radius)
Caution	#eab308	Unverified reports or perimeter (5km radius)
Safe/Active	#22c55e	Farmer markers and verified safe zones




