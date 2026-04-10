import React, { useState } from "react";

const SCREENS = {
  home: {
    text: "Welcome to FarmShield\n*384*1#\n\n1. Check Safety Status\n2. Report a Threat\n3. My Points\n4. Emergency Alert\n\nReply with option number:",
    options: { "1": "safety", "2": "report_menu", "3": "points", "4": "emergency" }
  },
  safety: {
    text: "SAFETY STATUS\n──────────────\n✅ Area: GREEN\nNo threats in last 24hrs\n\nNearby farmers: 3 active\n\n0. Back to main menu",
    options: { "0": "home" }
  },
  report_menu: {
    text: "REPORT A THREAT\n──────────────\n1. Bandits/Armed men\n2. Flood warning\n3. Crop disease\n4. Pest outbreak\n5. Dead animals\n\n0. Back\nReply with option:",
    options: { "1": "report_bandits", "2": "report_flood", "3": "report_crop", "4": "report_pest", "5": "report_animal", "0": "home" }
  },
  report_bandits: {
    text: "⚠️ REPORT SENT\n──────────────\nThreat: Armed bandits\nStatus: Verified ✅\n\nAll nearby farmers\nhave been alerted!\n\n+10 points earned 🏆\n\n0. Main menu",
    options: { "0": "home" }
  },
  report_flood: {
    text: "🌊 REPORT SENT\n──────────────\nThreat: Flood warning\nStatus: Verified ✅\n\nAll nearby farmers\nhave been alerted!\n\n+10 points earned 🏆\n\n0. Main menu",
    options: { "0": "home" }
  },
  report_crop: {
    text: "🌾 REPORT SENT\n──────────────\nThreat: Crop disease\nStatus: Verified ✅\n\nAll nearby farmers\nhave been alerted!\n\n+10 points earned 🏆\n\n0. Main menu",
    options: { "0": "home" }
  },
  report_pest: {
    text: "🐛 REPORT SENT\n──────────────\nThreat: Pest outbreak\nStatus: Verified ✅\n\nAll nearby farmers\nhave been alerted!\n\n+10 points earned 🏆\n\n0. Main menu",
    options: { "0": "home" }
  },
  report_animal: {
    text: "💀 REPORT SENT\n──────────────\nThreat: Dead animals\nStatus: Verified ✅\n\nAll nearby farmers\nhave been alerted!\n\n+10 points earned 🏆\n\n0. Main menu",
    options: { "0": "home" }
  },
  points: {
    text: "YOUR REWARDS\n──────────────\nPoints: 45 🏆\nBadge: Seedling 🌱\nReports: 3\nCheck-ins: 6\n\nNext badge: 55 pts\nto reach Sprout 🌿\n\n0. Back to main menu",
    options: { "0": "home" }
  },
  emergency: {
    text: "🚨 EMERGENCY ALERT\n──────────────\nSending SOS to:\n• Local authorities\n• Nearby farmers\n• Emergency contacts\n\nHelp is on the way!\nStay safe.\n\n0. Main menu",
    options: { "0": "home" }
  }
};

export default function USSDSimulator() {
  const [screen, setScreen] = useState("home");
  const [input, setInput]   = useState("");
  const [history, setHistory] = useState([]);
  const [dialing, setDialing] = useState(false);
  const [dialInput, setDialInput] = useState("");

  function handleDial() {
    if (dialInput.trim() === "*384*1#" || dialInput.trim() === "*384#") {
      setDialing(true);
      setTimeout(() => { setScreen("home"); setHistory([]); }, 800);
    }
  }

  function handleReply() {
    const current = SCREENS[screen];
    const next = current?.options?.[input.trim()];
    if (next) {
      setHistory(h => [...h, { screen, input }]);
      setScreen(next);
      setInput("");
    } else {
      setInput("");
    }
  }

  if (!dialing && screen === "home" && history.length === 0) {
    return (
      <div className="page-shell">
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 13, color: "#6b7280" }}>FarmShield</div>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: "#14532d", margin: "4px 0" }}>USSD Demo</h1>
          <p style={{ color: "#6b7280", fontSize: 14 }}>See how FarmShield works on any basic phone — no internet needed.</p>
        </div>

        {/* Phone mockup */}
        <div style={{ maxWidth: 320, margin: "0 auto" }}>
          <div style={{ background: "#1f2937", borderRadius: 32, padding: "20px 16px", boxShadow: "0 20px 60px rgba(0,0,0,0.3)" }}>
            {/* Screen */}
            <div style={{ background: "#111827", borderRadius: 16, padding: 20, marginBottom: 16, minHeight: 200, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
              <div style={{ color: "#9ca3af", fontSize: 12, marginBottom: 8 }}>Enter USSD code</div>
              <div style={{ color: "#4ade80", fontSize: 28, fontWeight: 700, letterSpacing: 2, fontFamily: "monospace" }}>
                {dialInput || "_"}
              </div>
            </div>
            {/* Keypad */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
              {["1","2","3","4","5","6","7","8","9","*","0","#"].map(k => (
                <button key={k} onClick={() => setDialInput(d => d + k)} style={{
                  background: "#374151", color: "white", border: "none", borderRadius: 12,
                  padding: "14px 0", fontSize: 18, fontWeight: 600, cursor: "pointer"
                }}>{k}</button>
              ))}
            </div>
            <button onClick={handleDial} style={{
              width: "100%", marginTop: 10, background: "#16a34a", color: "white",
              border: "none", borderRadius: 12, padding: 14, fontSize: 15, fontWeight: 700, cursor: "pointer"
            }}>
              📞 Call
            </button>
            <button onClick={() => setDialInput(d => d.slice(0, -1))} style={{
              width: "100%", marginTop: 6, background: "#374151", color: "#9ca3af",
              border: "none", borderRadius: 12, padding: 10, fontSize: 13, cursor: "pointer"
            }}>
              ⌫ Delete
            </button>
          </div>
          <div style={{ textAlign: "center", marginTop: 16, color: "#6b7280", fontSize: 13 }}>
            Dial <strong style={{ color: "#16a34a" }}>*384*1#</strong> to start
          </div>
        </div>
      </div>
    );
  }

  const current = SCREENS[screen];

  return (
    <div className="page-shell">
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 13, color: "#6b7280" }}>FarmShield USSD</div>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: "#14532d", margin: "4px 0" }}>*384*1# Demo</h1>
      </div>

      <div style={{ maxWidth: 320, margin: "0 auto" }}>
        <div style={{ background: "#1f2937", borderRadius: 32, padding: "20px 16px", boxShadow: "0 20px 60px rgba(0,0,0,0.3)" }}>
          {/* USSD screen */}
          <div style={{ background: "#d4edda", borderRadius: 12, padding: 16, marginBottom: 16, minHeight: 220 }}>
            <div style={{ fontSize: 11, color: "#6b7280", marginBottom: 8, fontFamily: "monospace" }}>FarmShield USSD</div>
            <pre style={{ fontSize: 13, color: "#1f2937", fontFamily: "monospace", whiteSpace: "pre-wrap", lineHeight: 1.6, margin: 0 }}>
              {current.text}
            </pre>
          </div>
          {/* Input */}
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleReply()}
            placeholder="Type option..."
            style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: "none", fontSize: 16, fontFamily: "monospace", marginBottom: 8, boxSizing: "border-box" }}
          />
          <button onClick={handleReply} style={{
            width: "100%", background: "#16a34a", color: "white", border: "none",
            borderRadius: 10, padding: 12, fontSize: 15, fontWeight: 700, cursor: "pointer", marginBottom: 8
          }}>
            Send Reply
          </button>
          <button onClick={() => { setScreen("home"); setHistory([]); setDialing(false); setDialInput(""); }} style={{
            width: "100%", background: "#374151", color: "#9ca3af", border: "none",
            borderRadius: 10, padding: 10, fontSize: 13, cursor: "pointer"
          }}>
            🔴 End Session
          </button>
        </div>
        <div style={{ textAlign: "center", marginTop: 12, fontSize: 12, color: "#9ca3af" }}>
          Works on any phone · No internet required · Available 24/7
        </div>
      </div>
    </div>
  );
}
