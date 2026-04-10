# FarmShield Public API

Base URL: `https://farmshield-7ska.onrender.com`

All endpoints return JSON. No authentication required for read endpoints.

---

## Authentication

### Register
`POST /auth/register`
```json
{
  "name": "Adegboyega Faruq",
  "phone": "+2349023527870",
  "email": "farmer@example.com",
  "password": "yourpassword",
  "language": "en"
}

Returns: `{ access_token, user: { id, name, phone, email, points, badge_level } }`

### Login
`POST /auth/login`
```json
{ "phone": "+2349023527870", "password": "yourpassword" }
```
Returns: `{ access_token, user: { id, name, phone, email, points, badge_level } }`

---

## Safety

### Get Area Safety Status
`GET /safety/check?lat={lat}&lng={lng}`

Returns current risk level (GREEN / YELLOW / RED) based on verified threats nearby.
```json
{
  "status": "GREEN",
  "risk_level": "GREEN",
  "farmers_nearby": 3,
  "threats_reported": 0,
  "message": "Area status: GREEN. 0 threats in last 24h."
}
```

---

## Reports

### Submit a Threat Report
`POST /reports/`  
Content-Type: `multipart/form-data`

| Field | Type | Required |
|-------|------|----------|
| user_id | int | yes |
| threat_type | string | yes — `bandits`, `flood`, `pests`, `sick_crops`, `dead_animals`, `other` |
| description | string | no |
| lat | float | yes |
| lng | float | yes |
| photo | file | no |

### Get Verified Threats (Map)
`GET /reports/verified?lat={lat}&lng={lng}&radius_km={radius}`

Returns verified threats in the area for map display.

### Get My Reports
`GET /reports/my-reports?user_id={id}`

Returns all reports submitted by a specific user.

---

## Rewards

### Get User Rewards
`GET /rewards/{user_id}`
```json
{
  "user_id": 1,
  "points": 45,
  "badge_level": "Seedling",
  "reports_submitted": 3,
  "reports_verified": 2,
  "check_ins": 4,
  "next_badge_points": 55
}
```

### Leaderboard
`GET /rewards/leaderboard/top`

Returns top 10 farmers by points.

---

## Check-ins

### Check In
`POST /checkins/`  
Content-Type: `multipart/form-data`

| Field | Type |
|-------|------|
| user_id | int |
| lat | float |
| lng | float |

Returns `+5 points` on success.

---

## Soil Analysis

### Get Soil Data by Location
`GET /soil?lat={lat}&lon={lon}`

Returns soil health analysis for a GPS location.
```json
{
  "ph": 6.5,
  "moisture": 42.0,
  "nitrogen": 68.0,
  "phosphorus": 28.0,
  "potassium": 180.0,
  "soil_health": "Good",
  "recommendations": [" pH is optimal", "🌱 Best crops: Maize, Rice, Beans"],
  "source": "Simulated"
}
```

### IoT Sensor Ingestion *(Future)*
`POST /soil/iot/ingest`

Endpoint ready for ESP32/Arduino sensor kits to push real soil readings.
```json
{
  "device_id": "sensor-001",
  "api_key": "farmshield-iot-v1",
  "lat": 9.0765,
  "lng": 7.3986,
  "ph_level": 6.8,
  "nitrogen": 72.0,
  "phosphorus": 31.0,
  "potassium": 195.0,
  "moisture": 38.5
}
```

---

## Notifications

### Get Notification History
`GET /notifications/history?user_id={id}`

Returns all SMS, email and in-app alerts for a user.

---

## Settings

### Update Email
`PUT /settings/email`
```json
{ "user_id": 1, "email": "new@example.com" }
```

### Change Password
`PUT /settings/password`
```json
{ "user_id": 1, "current_password": "old", "new_password": "new" }
```

### Update Profile
`PUT /settings/profile`
```json
{ "user_id": 1, "name": "New Name", "language": "ha" }
```

---

## Third-Party APIs Used

| Service | Purpose | Docs |
|---------|---------|------|
| OpenStreetMap / Leaflet | Interactive threat map | https://leafletjs.com |
| Gmail SMTP | Email alert delivery | https://support.google.com/mail/answer/185833 |
| Africa's Talking *(planned)* | SMS alerts to farmers | https://africastalking.com/sms |
| IoT Sensor Kit *(planned)* | Real soil data ingestion | ESP32 + DFRobot pH + NPK sensor |
