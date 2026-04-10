import React, { useState, useEffect } from "react";
import "./styles/globals.css";

import LandingPage from "./pages/Landing";
import LoginPage from "./pages/Login";
import RegisterPage from "./pages/Register";
import DashboardPage from "./pages/Dashboard";
import MapPage from "./pages/Map";
import ReportPage from "./pages/Report";
import SoilTestingPage from "./pages/SoilTesting";
import NotificationHistory from "./pages/NotificationHistory";
import RewardsPage from "./pages/RewardsPage";
import ReportHistory from "./pages/ReportHistory";
import SettingsPage from "./pages/Settings";
import AdminDashboard from "./pages/AdminDashboard";
import USSDSimulator from "./pages/USSDSimulator";
import BottomNav from "./components/BottomNav";
import Logo from "./components/Logo";
import SMSNotificationBanner from "./components/SMSNotificationBanner";
import { isLoggedIn, clearSession } from "./services/api";

const NAV_ITEMS = [
  { id: "dashboard", label: "Home", icon: <svg viewBox="0 0 24 24"><path d="M3 12L12 3l9 9"/><path d="M9 21V12h6v9"/><path d="M3 12v9h18V12"/></svg> },
  { id: "map",       label: "Risk Map", icon: <svg viewBox="0 0 24 24"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/><line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/></svg> },
  { id: "soil",      label: "Soil Analysis", icon: <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></svg> },
  { id: "report",    label: "Report Threat", icon: <svg viewBox="0 0 24 24"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg> },
  { id: "notifications", label: "Alerts", icon: <svg viewBox="0 0 24 24"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg> },
  { id: "rewards",   label: "Rewards", icon: <svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="7"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/></svg> },
  { id: "history",   label: "My Reports", icon: <svg viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg> },
  { id: "settings",  label: "Settings", icon: <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg> },
  { id: "ussd",      label: "USSD Demo", icon: <svg viewBox="0 0 24 24"><rect x="5" y="2" width="14" height="20" rx="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg> },
  { id: "admin",     label: "Admin", icon: <svg viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg> },
];

function SidebarNav({ page, setPage, onLogout }) {
  return (
    <nav className="sidebar-nav">
      <div className="sidebar-logo"><Logo /></div>
      {NAV_ITEMS.map(item => (
        <button key={item.id} className={`sidebar-item ${page === item.id ? "active" : ""}`} onClick={() => setPage(item.id)}>
          {item.icon}{item.label}
        </button>
      ))}
      <div className="sidebar-logout">
        <button className="sidebar-item" onClick={onLogout}>
          <svg viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
          Logout
        </button>
      </div>
    </nav>
  );
}

export default function App() {
  const [screen, setScreen] = useState("landing");
  const [page, setPage]     = useState("dashboard");
  const [smsAlert, setSmsAlert] = useState(null);

  useEffect(() => { if (isLoggedIn()) setScreen("app"); }, []);

  function handleLogin()  { setScreen("app"); setPage("dashboard"); }
  function handleLogout() { clearSession(); setScreen("landing"); }

  if (screen === "landing")  return <LandingPage onGetStarted={() => setScreen("login")} />;
  if (screen === "login")    return <LoginPage onLogin={handleLogin} goRegister={() => setScreen("register")} />;
  if (screen === "register") return <RegisterPage onLogin={handleLogin} goLogin={() => setScreen("login")} />;

  return (
    <div className="app">
      <SidebarNav page={page} setPage={setPage} onLogout={handleLogout} />
      <div className="app-content">
        <SMSNotificationBanner alertData={smsAlert} />
        {page === "dashboard"     && <DashboardPage setPage={setPage} onLogout={handleLogout} />}
        {page === "map"           && <MapPage />}
        {page === "soil"          && <SoilTestingPage />}
        {page === "report"        && <ReportPage onThreatVerified={d => setSmsAlert(d)} />}
        {page === "notifications" && <NotificationHistory />}
        {page === "rewards"       && <RewardsPage />}
        {page === "history"       && <ReportHistory />}
        {page === "settings"      && <SettingsPage />}
        {page === "admin"         && <AdminDashboard />}
        {page === "ussd"          && <USSDSimulator />}
      </div>
      <BottomNav page={page} setPage={setPage} />
    </div>
  );
}
