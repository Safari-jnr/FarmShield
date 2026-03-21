import React from "react";
import { useState } from "react";
import Logo from "../components/Logo";
import Toast, { useToast } from "../components/Toast";
import { apiFetch, saveSession } from "../services/api";

export default function RegisterPage({ onLogin, goLogin }) {
  const [form, setForm] = useState({ phone: "", name: "", password: "", language: "en" });
  const [loading, setLoading] = useState(false);
  const [toast,   showToast]  = useToast();

  const upd = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await apiFetch("/auth/register", {
        method: "POST",
        body: JSON.stringify(form),
      });
      saveSession(data.token || data.access_token, data.user || { name: form.name });
      showToast("Account created", "success");
      setTimeout(onLogin, 600);
    } catch {
      saveSession("demo_token", { name: form.name || "Farmer" });
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
              <input id="name" type="text" placeholder="Your name" value={form.name} onChange={upd("name")} required />
            </div>
            <div className="field">
              <label htmlFor="phone">Phone Number</label>
              <input id="phone" type="tel" placeholder="+234 800 000 0000" value={form.phone} onChange={upd("phone")} required />
            </div>
            <div className="field">
              <label htmlFor="password">Password</label>
              <input id="password" type="password" placeholder="Choose a password" value={form.password} onChange={upd("password")} required />
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