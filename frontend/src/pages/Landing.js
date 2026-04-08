import React from "react";
import Logo from "../components/Logo";

const FEATURES = [
  { icon: "🛡️", title: "Real-Time Safety Alerts", desc: "Farmers report threats — bandits, floods, pests — and the whole community gets notified instantly." },
  { icon: "🌍", title: "Live Threat Map", desc: "See verified danger zones on a live map. Know before you go to your farm." },
  { icon: "🧪", title: "Instant Soil Analysis", desc: "Get NPK levels, pH, moisture and crop recommendations using just your GPS — no lab, no cost." },
  { icon: "🏆", title: "Rewards & Badges", desc: "Earn points for check-ins and reports. Climb from Seedling to Guardian as you protect your community." },
];

const STATS = [
  { value: "2min", label: "Alert delivery time" },
  { value: "Free", label: "No lab fees" },
  { value: "SMS", label: "Works on basic phones" },
];

export default function LandingPage({ onGetStarted }) {
  return (
    <div style={{ minHeight: "100vh", background: "#f0fdf4", fontFamily: "inherit" }}>

      {/* Nav */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 24px", background: "white", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
        <Logo />
        <button onClick={onGetStarted} style={{ background: "#16a34a", color: "white", border: "none", borderRadius: 8, padding: "8px 18px", fontWeight: 600, fontSize: 14, cursor: "pointer" }}>
          Sign In
        </button>
      </div>

      {/* Hero */}
      <div style={{ textAlign: "center", padding: "56px 24px 40px", background: "linear-gradient(180deg, white 0%, #f0fdf4 100%)" }}>
        <div style={{ display: "inline-block", background: "#dcfce7", color: "#16a34a", borderRadius: 20, padding: "6px 14px", fontSize: 13, fontWeight: 600, marginBottom: 20 }}>
          🌾 Built for Nigerian Farmers
        </div>
        <h1 style={{ fontSize: "clamp(28px, 7vw, 42px)", fontWeight: 800, color: "#14532d", lineHeight: 1.2, margin: "0 0 16px" }}>
          Protect Your Farm.<br />Protect Your Community.
        </h1>
        <p style={{ color: "#4b7c5a", fontSize: 16, maxWidth: 360, margin: "0 auto 32px", lineHeight: 1.6 }}>
          FarmShield gives rural farmers real-time safety alerts, soil intelligence, and a community network — all from their phone.
        </p>
        <button onClick={onGetStarted} style={{
          background: "linear-gradient(135deg, #22c55e, #16a34a)", color: "white",
          border: "none", borderRadius: 14, padding: "16px 36px",
          fontSize: 17, fontWeight: 700, cursor: "pointer",
          boxShadow: "0 4px 20px rgba(34,197,94,0.4)"
        }}>
          Get Started — It's Free
        </button>
        <div style={{ marginTop: 12, fontSize: 13, color: "#86a892" }}>No credit card · Works offline · SMS support</div>
      </div>

      {/* Stats */}
      <div style={{ display: "flex", justifyContent: "center", gap: 0, background: "#14532d", padding: "20px 0" }}>
        {STATS.map((s, i) => (
          <div key={i} style={{ flex: 1, textAlign: "center", borderRight: i < STATS.length - 1 ? "1px solid #166534" : "none", padding: "0 8px" }}>
            <div style={{ fontSize: 22, fontWeight: 800, color: "#4ade80" }}>{s.value}</div>
            <div style={{ fontSize: 12, color: "#86efac", marginTop: 2 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Features */}
      <div style={{ padding: "40px 20px" }}>
        <h2 style={{ textAlign: "center", color: "#14532d", fontWeight: 700, fontSize: 20, marginBottom: 24 }}>Everything a farmer needs</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 14, maxWidth: 480, margin: "0 auto" }}>
          {FEATURES.map((f, i) => (
            <div key={i} style={{ background: "white", borderRadius: 14, padding: "18px 16px", display: "flex", gap: 14, alignItems: "flex-start", boxShadow: "0 1px 8px rgba(0,0,0,0.06)" }}>
              <div style={{ fontSize: 28, lineHeight: 1 }}>{f.icon}</div>
              <div>
                <div style={{ fontWeight: 700, color: "#14532d", marginBottom: 4 }}>{f.title}</div>
                <div style={{ fontSize: 14, color: "#6b7280", lineHeight: 1.5 }}>{f.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* How it works */}
      <div style={{ background: "white", padding: "40px 20px" }}>
        <h2 style={{ textAlign: "center", color: "#14532d", fontWeight: 700, fontSize: 20, marginBottom: 28 }}>How it works</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 20, maxWidth: 400, margin: "0 auto" }}>
          {[
            ["1", "#22c55e", "Register with your phone number", "No email needed. Just your number and a password."],
            ["2", "#3b82f6", "Check in when you go to your farm", "Let the community know you're out. Earn points too."],
            ["3", "#f59e0b", "Report threats you see", "Bandits, floods, sick crops — tap and report in seconds."],
            ["4", "#a855f7", "Everyone gets alerted", "Verified threats trigger SMS alerts to nearby farmers."],
          ].map(([num, color, title, desc]) => (
            <div key={num} style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
              <div style={{ width: 36, height: 36, borderRadius: "50%", background: color, color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 16, flexShrink: 0 }}>{num}</div>
              <div>
                <div style={{ fontWeight: 600, color: "#1f2937", marginBottom: 2 }}>{title}</div>
                <div style={{ fontSize: 13, color: "#6b7280" }}>{desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div style={{ background: "linear-gradient(135deg, #14532d, #166534)", padding: "48px 24px", textAlign: "center" }}>
        <h2 style={{ color: "white", fontSize: 22, fontWeight: 700, marginBottom: 12 }}>Ready to protect your farm?</h2>
        <p style={{ color: "#86efac", fontSize: 14, marginBottom: 28 }}>Join farmers already using FarmShield to stay safe.</p>
        <button onClick={onGetStarted} style={{
          background: "white", color: "#16a34a", border: "none",
          borderRadius: 12, padding: "14px 32px", fontSize: 16, fontWeight: 700, cursor: "pointer"
        }}>
          Create Free Account
        </button>
      </div>

      {/* Footer */}
      <div style={{ background: "#14532d", padding: "16px 24px", textAlign: "center", borderTop: "1px solid #166534" }}>
        <div style={{ color: "#4ade80", fontSize: 13 }}>FarmShield · Protecting Nigerian Farmers · 2026</div>
      </div>
    </div>
  );
}
