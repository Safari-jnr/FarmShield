import React, { useState, useEffect } from "react";
import { apiFetch } from "../services/api";

const THREAT_COLORS = {
  bandits: "#ef4444", flood: "#3b82f6", pests: "#f59e0b",
  sick_crops: "#a855f7", dead_animals: "#6b7280", other: "#f97316"
};
const THREAT_LABELS = {
  bandits: "⚠️ Bandits", flood: "🌊 Flood", pests: "🐛 Pests",
  sick_crops: "🌾 Sick Crops", dead_animals: "💀 Dead Animals", other: "⚠️ Other"
};

function StatCard({ value, label, color = "#16a34a", icon }) {
  return (
    <div style={{ background: "white", borderRadius: 14, padding: "18px 16px", boxShadow: "0 1px 8px rgba(0,0,0,0.06)", textAlign: "center" }}>
      <div style={{ fontSize: 28, marginBottom: 4 }}>{icon}</div>
      <div style={{ fontSize: 28, fontWeight: 800, color }}>{value}</div>
      <div style={{ fontSize: 12, color: "#6b7280", marginTop: 4 }}>{label}</div>
    </div>
  );
}

export default function AdminDashboard({ standalone = false }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch("/admin/stats").then(s => { setStats(s); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", gap: 10 }}>
      <div className="spinner dark" /> <span style={{ color: "#6b7280" }}>Loading dashboard...</span>
    </div>
  );

  const maxThreat = Math.max(...(stats?.threat_breakdown?.map(t => t.count) || [1]), 1);

  return (
    <div className="page-shell" style={standalone ? { maxWidth: 900, margin: "0 auto", padding: "32px 24px" } : {}}>
      {standalone && (
        <div style={{ background: "#14532d", color: "white", padding: "16px 24px", borderRadius: 12, marginBottom: 24, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontSize: 20, fontWeight: 800 }}>🛡️ FarmShield Admin</div>
            <div style={{ fontSize: 13, opacity: 0.7 }}>Platform Overview</div>
          </div>
          <a href="/" style={{ color: "#4ade80", fontSize: 13 }}>← Back to App</a>
        </div>
      )}

      {/* Stats grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12, marginBottom: 24 }}>
        <StatCard icon="👨‍🌾" value={stats?.total_users || 0}          label="Registered Farmers" color="#16a34a" />
        <StatCard icon="📋" value={stats?.total_reports || 0}         label="Total Reports"       color="#3b82f6" />
        <StatCard icon="✅" value={stats?.verified_reports || 0}      label="Verified Threats"    color="#7c3aed" />
        <StatCard icon="🟢" value={stats?.active_farmers_today || 0}  label="Active Today"        color="#f59e0b" />
        <StatCard icon="📅" value={stats?.reports_this_week || 0}     label="Reports This Week"   color="#ef4444" />
        <StatCard icon="📧" value={stats?.email_alerts_sent || 0}     label="Emails Sent"         color="#0891b2" />
      </div>

      {/* Threat breakdown */}
      {stats?.threat_breakdown?.length > 0 && (
        <div style={{ background: "white", borderRadius: 14, padding: 18, marginBottom: 20, boxShadow: "0 1px 8px rgba(0,0,0,0.06)" }}>
          <div style={{ fontWeight: 700, color: "#14532d", marginBottom: 14 }}>🗂️ Threat Breakdown</div>
          {stats.threat_breakdown.map(t => (
            <div key={t.type} style={{ marginBottom: 10 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 4 }}>
                <span>{THREAT_LABELS[t.type] || t.type}</span>
                <span style={{ fontWeight: 600 }}>{t.count}</span>
              </div>
              <div style={{ height: 8, background: "#f3f4f6", borderRadius: 4, overflow: "hidden" }}>
                <div style={{ width: `${(t.count / maxThreat) * 100}%`, height: "100%", background: THREAT_COLORS[t.type] || "#6b7280", borderRadius: 4 }} />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Top farmers */}
      {stats?.top_farmers?.length > 0 && (
        <div style={{ background: "white", borderRadius: 14, padding: 18, marginBottom: 20, boxShadow: "0 1px 8px rgba(0,0,0,0.06)" }}>
          <div style={{ fontWeight: 700, color: "#14532d", marginBottom: 14 }}>🏆 Top Farmers</div>
          {stats.top_farmers.map((f, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "8px 0", borderBottom: i < stats.top_farmers.length - 1 ? "1px solid #f3f4f6" : "none" }}>
              <div style={{ width: 28, height: 28, borderRadius: "50%", background: i === 0 ? "#fbbf24" : i === 1 ? "#94a3b8" : "#d97706", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 13, color: "white" }}>{i + 1}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{f.name}</div>
                <div style={{ fontSize: 12, color: "#6b7280" }}>{f.badge}</div>
              </div>
              <div style={{ fontWeight: 700, color: "#16a34a" }}>{f.points} pts</div>
            </div>
          ))}
        </div>
      )}

      {/* Recent activity */}
      <div style={{ background: "white", borderRadius: 14, padding: 18, boxShadow: "0 1px 8px rgba(0,0,0,0.06)" }}>
        <div style={{ fontWeight: 700, color: "#14532d", marginBottom: 14 }}>🕐 Recent Reports</div>
        {stats?.recent_reports?.length === 0 ? (
          <div style={{ color: "#9ca3af", textAlign: "center", padding: 20 }}>No reports yet</div>
        ) : (
          stats?.recent_reports?.map(r => (
            <div key={r.id} style={{ display: "flex", gap: 10, padding: "8px 0", borderBottom: "1px solid #f3f4f6", alignItems: "flex-start" }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: r.verified ? "#22c55e" : "#f59e0b", marginTop: 5, flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 600 }}>{THREAT_LABELS[r.threat_type] || r.threat_type}</div>
                <div style={{ fontSize: 12, color: "#6b7280" }}>{r.description || "No description"}</div>
              </div>
              <div style={{ fontSize: 11, color: "#9ca3af", whiteSpace: "nowrap" }}>
                {new Date(r.created_at).toLocaleDateString()}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
