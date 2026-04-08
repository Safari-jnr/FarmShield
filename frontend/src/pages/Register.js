import React, { useState } from "react";
import Logo from "../components/Logo";
import Toast, { useToast } from "../components/Toast";
import { apiFetch, saveSession } from "../services/api";

export default function RegisterPage({ onLogin, goLogin }) {
  const [form, setForm] = useState({ 
    phone: "", 
    name: "", 
    email: "",
    password: "", 
    language: "en" 
  });
  const [loading, setLoading] = useState(false);
  const [toast, showToast] = useToast();

  const upd = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await apiFetch("/auth/register", {
        method: "POST",
        body: JSON.stringify(form),
      });
      
      const user = {
        id: data.user?.id,
        name: data.user?.name || form.name,
        phone: data.user?.phone || form.phone,
        email: data.user?.email || form.email,
        language: data.user?.language || form.language,
        points: data.user?.points || 0,
        badge_level: data.user?.badge_level || "Seedling"
      };
      saveSession(data.access_token, user);
      showToast("Account created", "success");
      setTimeout(onLogin, 600);
    } catch {
      // ✅ Demo user with proper id for rewards to work
      const demoUser = {
        id: 1,
        name: form.name || "Demo Farmer",
        phone: form.phone || "+2348000000000",
        language: form.language,
        badge_level: "Seedling",
        points: 0
      };
      saveSession("demo_token", demoUser);
      showToast("Registered (demo mode)", "success");
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
          <h1 className="auth-heading">Join the<br /><em>community.</em></h1>
          <p className="auth-sub">Protect each other, every day.</p>
          <form onSubmit={handleSubmit}>
            <div className="field">
              <label htmlFor="name">Full Name</label>
              <input 
                id="name" 
                type="text" 
                placeholder="Your name" 
                value={form.name} 
                onChange={upd("name")} 
                required 
              />
            </div>
            <div className="field">
              <label htmlFor="email">Email Address <span style={{fontWeight:400,textTransform:"none"}}>(for alerts)</span></label>
              <input 
                id="email" 
                type="email" 
                placeholder="you@example.com" 
                value={form.email} 
                onChange={upd("email")} 
              />
            </div>
            <div className="field">
              <label htmlFor="phone">Phone Number</label>
              <input 
                id="phone" 
                type="tel" 
                placeholder="+234 800 000 0000" 
                value={form.phone} 
                onChange={upd("phone")} 
                required 
              />
            </div>
            <div className="field">
              <label htmlFor="password">Password</label>
              <input 
                id="password" 
                type="password" 
                placeholder="Choose a password" 
                value={form.password} 
                onChange={upd("password")} 
                required 
              />
            </div>
            <div className="field">
              <label htmlFor="language">Language</label>
              <select id="language" value={form.language} onChange={upd("language")}>
                <option value="en">English</option>
                <option value="ha">Hausa</option>
                <option value="yo">Yoruba</option>
                <option value="ig">Igbo</option>
              </select>
            </div>
            <button className="btn-primary" type="submit" disabled={loading}>
              {loading ? <div className="spinner" /> : "Create Account"}
            </button>
          </form>
          <div className="auth-switch">
            Already registered?{" "}
            <button onClick={goLogin}>Sign in</button>
          </div>
        </div>
      </div>
      <Toast {...(toast || {})} />
    </div>
  );
}