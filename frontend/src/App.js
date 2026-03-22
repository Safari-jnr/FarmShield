import React, { useState, useEffect } from "react";

import "./styles/globals.css";

import LoginPage from "./pages/Login";
import RegisterPage from "./pages/Register";
import DashboardPage from "./pages/Dashboard";
import MapPage from "./pages/Map";
import ReportPage from "./pages/Report";
import SoilTestingPage from "./pages/SoilTesting";
import BottomNav from "./components/BottomNav";
import { isLoggedIn, clearSession } from "./services/api";

export default function App() {
  const [screen, setScreen] = useState("login");
  const [page, setPage] = useState("dashboard");

  useEffect(() => {
    if (isLoggedIn()) setScreen("app");
    else setScreen("login");
  }, []);

  function handleLogin() { setScreen("app"); }
  function handleLogout() { clearSession(); setScreen("login"); }

  if (screen === "login") {
    return (
      <LoginPage
        onLogin={handleLogin}
        goRegister={() => setScreen("register")}
      />
    );
  }

  if (screen === "register") {
    return (
      <RegisterPage
        onLogin={handleLogin}
        goLogin={() => setScreen("login")}
      />
    );
  }

  return (
    <div className="app">
      {page === "dashboard" && <DashboardPage />}
      {page === "map"       && <MapPage />}
      {page === "soil"      && <SoilTestingPage />}
      {page === "report"    && <ReportPage />}
      <BottomNav page={page} setPage={setPage} />
    </div>
  );
}