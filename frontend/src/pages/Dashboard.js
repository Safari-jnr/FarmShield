import React from "react";
import { useState, useEffect } from "react";
import Toast, { useToast } from "../components/Toast";
import { apiFetch, getLocation, getUser } from "../services/api";
import { RISK_DESC } from "../constants";

export default function DashboardPage() {
  const user = getUser();
  const [risk,      setRisk]      = useState("GREEN");
  const [checkedIn, setCheckedIn] = useState(false);
  const [farmers,   setFarmers]   = useState(4);
  const [alert,     setAlert]     = useState(null);
  const [loading,   setLoading]   = useState(false);
  const [toast,     showToast]    = useToast();

  useEffect(() => {
    async function poll() {
      try {
        const d = await apiFetch("/safety/check");
        if (d.risk_level)     setRisk(d.risk_level);
        if (d.farmers_nearby) setFarmers(d.farmers_nearby);
        if (d.alert)          setAlert(d.alert);
      } catch {}
    }
    poll();
    const id = setInterval(poll, 5 * 60 * 1000);
    return () => clearInterval(id);
  }, []);

  async function handleCheckIn() {
    setLoading(true);
    try {
      const loc = await getLocation();
      await apiFetch("/checkins", { method: "POST", body: JSON.stringify(loc) });
      const next = !checkedIn;
      setCheckedIn(next);
      showToast(next ? "Checked in successfully" : "Checked out safely", "success");
    } catch {
      const next = !checkedIn;
      setCheckedIn(next);
      showToast(next ? "Checked in (demo mode)" : "Checked out (demo mode)", "success");
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
        <div className="dash-shield">
          <svg viewBox="0 0 24 24">
            <path d="M12 2L3 7v5c0 5.25 3.75 10.15 9 11.35C17.25 22.15 21 17.25 21 12V7L12 2z" />
          </svg>
        </div>
      </div>

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