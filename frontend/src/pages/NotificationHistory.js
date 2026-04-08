import React, { useState, useEffect } from 'react';
import { apiFetch, getUser } from '../services/api';

const CHANNEL_CONFIG = {
  email:  { icon: "📧", label: "Email",   color: "#3b82f6", bg: "#eff6ff" },
  sms:    { icon: "📱", label: "SMS",     color: "#16a34a", bg: "#f0fdf4" },
  in_app: { icon: "🔔", label: "In-App",  color: "#7c3aed", bg: "#f5f3ff" },
};

const THREAT_LABELS = {
  bandits:      "⚠️ Bandits",
  flood:        "🌊 Flood",
  pests:        "🐛 Pests",
  sick_crops:   "🌾 Sick Crops",
  dead_animals: "💀 Dead Animals",
  other:        "⚠️ Other",
};

export default function NotificationHistory() {
  const [logs, setLogs]       = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter]   = useState("all");
  const user = getUser();

  useEffect(() => {
    const url = user?.id
      ? `/notifications/history?user_id=${user.id}`
      : `/notifications/history`;

    apiFetch(url)
      .then(data => { setLogs(data.logs || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const filtered = filter === "all" ? logs : logs.filter(l => l.channel === filter);

  const counts = {
    all:    logs.length,
    email:  logs.filter(l => l.channel === "email").length,
    sms:    logs.filter(l => l.channel === "sms").length,
    in_app: logs.filter(l => l.channel === "in_app").length,
  };

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 200, gap: 10 }}>
      <div className="spinner dark" /> <span style={{ color: "#6b7280" }}>Loading alerts...</span>
    </div>
  );

  return (
    <div className="page-shell">
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 13, color: "#6b7280", marginBottom: 4 }}>FarmShield</div>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: "#14532d", margin: 0 }}>Alert History</h1>
        <p style={{ color: "#6b7280", fontSize: 14, marginTop: 6 }}>
          All notifications sent to you — SMS, email and in-app.
        </p>
      </div>

      {/* Summary cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginBottom: 20 }}>
        {["email", "sms", "in_app"].map(ch => {
          const c = CHANNEL_CONFIG[ch];
          return (
            <div key={ch} style={{ background: c.bg, borderRadius: 12, padding: "14px 12px", textAlign: "center", border: `1px solid ${c.color}22` }}>
              <div style={{ fontSize: 22 }}>{c.icon}</div>
              <div style={{ fontSize: 20, fontWeight: 700, color: c.color }}>{counts[ch]}</div>
              <div style={{ fontSize: 11, color: "#6b7280", marginTop: 2 }}>{c.label}</div>
            </div>
          );
        })}
      </div>

      {/* Filter tabs */}
      <div style={{ display: "flex", gap: 8, marginBottom: 20, overflowX: "auto", paddingBottom: 2 }}>
        {["all", "in_app", "email", "sms"].map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{
            padding: "7px 14px", borderRadius: 20, border: "none", whiteSpace: "nowrap",
            fontSize: 13, fontWeight: 600, cursor: "pointer",
            background: filter === f ? "#14532d" : "#f3f4f6",
            color: filter === f ? "white" : "#374151"
          }}>
            {f === "all" ? `All (${counts.all})` : `${CHANNEL_CONFIG[f].icon} ${CHANNEL_CONFIG[f].label} (${counts[f]})`}
          </button>
        ))}
      </div>

      {/* Log list */}
      {filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: "48px 20px", color: "#9ca3af" }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🔕</div>
          <div style={{ fontWeight: 600, color: "#374151", marginBottom: 6 }}>No alerts yet</div>
          <div style={{ fontSize: 14 }}>Alerts will appear here when threats are reported near you.</div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {filtered.map(log => {
            const ch = CHANNEL_CONFIG[log.channel] || CHANNEL_CONFIG.in_app;
            const isEmail = log.channel === "email";
            return (
              <div key={log.id} style={{
                background: "white", borderRadius: 12, padding: "14px 16px",
                boxShadow: "0 1px 6px rgba(0,0,0,0.06)",
                borderLeft: `4px solid ${ch.color}`
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 16 }}>{ch.icon}</span>
                    <span style={{ fontWeight: 700, fontSize: 14, color: "#1f2937" }}>
                      {log.subject || THREAT_LABELS[log.threat_type] || "Alert"}
                    </span>
                  </div>
                  <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                    <span style={{
                      fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 10,
                      background: log.status === "sent" ? "#f0fdf4" : log.status === "mock" ? "#fffbeb" : "#fef2f2",
                      color: log.status === "sent" ? "#16a34a" : log.status === "mock" ? "#d97706" : "#dc2626"
                    }}>
                      {log.status === "mock" ? "SMS (mock)" : log.status}
                    </span>
                  </div>
                </div>
                <div style={{ fontSize: 13, color: "#6b7280", marginBottom: 8, lineHeight: 1.4 }}>
                  {log.message}
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#9ca3af" }}>
                  <span>{ch.label} → {isEmail ? log.recipient : log.recipient?.replace(/(\d{3})\d{4}(\d{4})/, "$1****$2")}</span>
                  <span>{log.created_at ? new Date(log.created_at).toLocaleString() : ""}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
