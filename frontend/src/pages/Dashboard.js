import React from "react";
import { useState, useEffect } from "react";
import Toast, { useToast } from "../components/Toast";
import { apiFetch, getLocation, getUser, clearSession, invalidateCache } from "../services/api";
import { RISK_DESC } from "../constants";

function WeatherCard({ weather }) {
  if (!weather) return null;
  const bg = weather.risk_level === "RED" ? "#fef2f2" : weather.risk_level === "YELLOW" ? "#fffbeb" : "#f0fdf4";
  const color = weather.risk_level === "RED" ? "#dc2626" : weather.risk_level === "YELLOW" ? "#d97706" : "#16a34a";
  return (
    <div style={{ background: bg, borderRadius: 12, padding: "12px 16px", marginBottom: 16, border: `1px solid ${color}22` }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div style={{ fontSize: 13, color: "#6b7280", marginBottom: 2 }}>Today's Weather</div>
          <div style={{ fontWeight: 700, color, fontSize: 15 }}>{weather.farm_advice}</div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 24, fontWeight: 800, color }}>{weather.temp}°C</div>
          <div style={{ fontSize: 11, color: "#9ca3af" }}>💧 {weather.humidity}%</div>
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage({ setPage, onLogout }) {
  const user = getUser();
  const [risk,      setRisk]      = useState("GREEN");
  const [checkedIn, setCheckedIn] = useState(false);
  const [farmers,   setFarmers]   = useState(4);
  const [alert,     setAlert]     = useState(null);
  const [loading,   setLoading]   = useState(false);
  const [toast,     showToast]    = useToast();
  const [points,    setPoints]    = useState(0);
  const [badge,     setBadge]     = useState("Seedling");
  const [weather,   setWeather]   = useState(null);

  useEffect(() => {
    async function poll() {
      try {
        const d = await apiFetch("/safety/check");
        if (d.risk_level)     setRisk(d.risk_level);
        if (d.farmers_nearby) setFarmers(d.farmers_nearby);
        if (d.alert)          setAlert(d.alert);
      } catch {}
    }
    
    // ADD: Fetch user rewards
    async function fetchRewards() {
      try {
        const userData = getUser();
        if (userData?.id) {
          const rewards = await apiFetch(`/rewards/${userData.id}`);
          setPoints(rewards.points || 0);
          setBadge(rewards.badge_level || "Seedling");
        }
      } catch {}
    }
    
    poll();
    fetchRewards();

    // Fetch weather
    getLocation().then(loc => {
      apiFetch(`/weather/current?lat=${loc.lat}&lon=${loc.lon}`)
        .then(w => setWeather(w)).catch(() => {});
    });

    const id = setInterval(poll, 5 * 60 * 1000);
    return () => clearInterval(id);
  }, []);

  async function handleCheckIn() {
    // Optimistic update — show result immediately
    const next = !checkedIn;
    setCheckedIn(next);
    if (next) setPoints(p => p + 5);
    setLoading(true);
    try {
      const loc = await getLocation();
      const fd = new FormData();
      fd.append("user_id", user?.id || 1);
      fd.append("lat", loc.lat);
      fd.append("lng", loc.lon);
      await apiFetch("/checkins/", { method: "POST", headers: {}, body: fd });
      invalidateCache(`/rewards/${user?.id}`);
      showToast(next ? "Checked in! +5 points" : "Checked out safely", "success");
    } catch (e) {
      const alreadyIn = e.message?.includes("Already checked in");
      if (alreadyIn) {
        showToast("Already checked in today", "error");
        setCheckedIn(true); // revert to checked-in state
        setPoints(p => p - 5);
      } else {
        showToast(next ? "Checked in (offline mode)" : "Checked out", "success");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page-shell">
      <div className="dash-header">
        <div>
          <div className="dash-greeting">Good morning</div>
          <div className="dash-name">{user.name}</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div className="dash-shield">
            <svg viewBox="0 0 24 24">
              <path d="M12 2L3 7v5c0 5.25 3.75 10.15 9 11.35C17.25 22.15 21 17.25 21 12V7L12 2z" />
            </svg>
          </div>
          <button
            onClick={onLogout}
            className="dash-logout-btn"
            style={{
              background: 'none', border: '1px solid #e2e8f0',
              borderRadius: '8px', padding: '6px 12px',
              fontSize: '13px', color: '#64748b', cursor: 'pointer'
            }}
          >
            Logout
          </button>
        </div>
      </div>

      {/* ADD: Rewards Card */}
      <div 
        className="rewards-card" 
        onClick={() => setPage("rewards")}
        style={{
          background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
          color: 'white',
          padding: '16px',
          borderRadius: '12px',
          marginBottom: '16px',
          cursor: 'pointer',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >
        <div>
          <div style={{ fontSize: '12px', opacity: 0.9 }}>Your Points</div>
          <div style={{ fontSize: '28px', fontWeight: 'bold' }}>{points}</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '12px', opacity: 0.9 }}>Badge</div>
          <div style={{ fontSize: '16px', fontWeight: '600' }}>🌱 {badge}</div>
        </div>
      </div>

      {/* Weather */}
      <WeatherCard weather={weather} />

      {alert && (
        <div className="alert-banner">
          <div className="alert-icon-wrap">
            <svg viewBox="0 0 24 24">
              <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          </div>
          <div>
            <div className="alert-title">Safety Alert</div>
            <div className="alert-body">{alert}</div>
          </div>
        </div>
      )}

      <div className={`risk-badge ${risk}`}>
        <div className="risk-pulse" />
        <div className="risk-label">Current Risk Level</div>
        <div className="risk-level">{risk}</div>
        <div className="risk-desc">{RISK_DESC[risk]}</div>
      </div>

      {/* ADD: Quick Actions */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
        <button 
          onClick={() => setPage("map")}
          style={{
            padding: '16px',
            borderRadius: '12px',
            border: 'none',
            background: '#f0fdf4',
            color: '#16a34a',
            cursor: 'pointer',
            fontWeight: '600'
          }}
        >
          🗺️ View Risk Map
        </button>
        <button 
          onClick={() => setPage("notifications")}
          style={{
            padding: '16px',
            borderRadius: '12px',
            border: 'none',
            background: '#fef2f2',
            color: '#dc2626',
            cursor: 'pointer',
            fontWeight: '600'
          }}
        >
          🔔 Alerts History
        </button>
      </div>

      <div className="stat-row">
        <div className="stat-card">
          <div className="stat-num">{farmers}</div>
          <div className="stat-label">Farmers Near You</div>
        </div>
        <div className="stat-card">
          <div className="stat-num" style={{ fontSize: "1.4rem", paddingTop: 6 }}>
            {checkedIn ? "Active" : "Offline"}
          </div>
          <div className="stat-label">Your Status</div>
        </div>
      </div>

      <button
        className={`checkin-btn ${checkedIn ? "out" : "in"}`}
        onClick={handleCheckIn}
        disabled={loading}
      >
        {loading ? (
          <div className={`spinner ${checkedIn ? "dark" : ""}`} />
        ) : checkedIn ? "Check Out" : "Check In"}
      </button>

      <Toast {...(toast || {})} />
    </div>
  );
}