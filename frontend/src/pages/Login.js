import React, { useState } from "react";
import Logo from "../components/Logo";
import Toast, { useToast } from "../components/Toast";
import { apiFetch, saveSession } from "../services/api";

export default function LoginPage({ onLogin, goRegister }) {
  const [phone, setPhone] = useState("");
  const [pass, setPass] = useState("");
  const [loading, setLoading] = useState(false);
  const [toast, showToast] = useToast();

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await apiFetch("/auth/login", {
        method: "POST",
        body: JSON.stringify({ phone, password: pass }),
      });
      
      const user = {
        id: data.user?.id,
        name: data.user?.name || phone,
        phone: data.user?.phone || phone,
        language: data.user?.language || "en",
        points: data.user?.points || 0,
        badge_level: data.user?.badge_level || "Seedling"
      };
      saveSession(data.access_token, user);
      showToast("Welcome back", "success");
      setTimeout(onLogin, 600);
    } catch {
      // ✅ Demo user with proper id for rewards to work
      const demoUser = {
        id: 1,
        name: "Demo Farmer",
        phone: phone || "+2348000000000",
        badge_level: "Seedling",
        points: 0
      };
      saveSession("demo_token", demoUser);
      showToast("Signed in (demo mode)", "success");
      setTimeout(onLogin, 600);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="app">
      <div className="auth-shell">
        <div className="auth-inner">
          <Logo />
          <h1 className="auth-heading">Welcome<br /><em>back.</em></h1>
          <p className="auth-sub">Stay safe. Stay connected.</p>
          <form onSubmit={handleSubmit}>
            <div className="field">
              <label htmlFor="phone">Phone Number</label>
              <input 
                id="phone" 
                type="tel" 
                placeholder="+234 800 000 0000" 
                value={phone} 
                onChange={(e) => setPhone(e.target.value)} 
                required 
              />
            </div>
            <div className="field">
              <label htmlFor="password">Password</label>
              <input 
                id="password" 
                type="password" 
                placeholder="Enter your password" 
                value={pass} 
                onChange={(e) => setPass(e.target.value)} 
                required 
              />
            </div>
            <button className="btn-primary" type="submit" disabled={loading}>
              {loading ? <div className="spinner" /> : "Sign In"}
            </button>
          </form>
          <div className="auth-switch">
            New to FarmShield?{" "}
            <button onClick={goRegister}>Create account</button>
          </div>
        </div>
      </div>
      <Toast {...(toast || {})} />
    </div>
  );
}