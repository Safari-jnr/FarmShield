import React, { useState } from "react";
import { apiFetch } from "../services/api";

const HEALTH_CONFIG = {
  Excellent: { color: "#16a34a", bg: "#f0fdf4", emoji: "🌟", bar: 100 },
  Good:      { color: "#65a30d", bg: "#f7fee7", emoji: "✅", bar: 75 },
  Fair:      { color: "#d97706", bg: "#fffbeb", emoji: "⚠️", bar: 50 },
  Poor:      { color: "#dc2626", bg: "#fef2f2", emoji: "🚨", bar: 25 },
};

function MetricBar({ label, value, max, unit, color }) {
  const pct = Math.min((value / max) * 100, 100);
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 4 }}>
        <span style={{ color: "#374151", fontWeight: 600 }}>{label}</span>
        <span style={{ color: "#6b7280" }}>{value} {unit}</span>
      </div>
      <div style={{ height: 8, background: "#e5e7eb", borderRadius: 4, overflow: "hidden" }}>
        <div style={{ width: `${pct}%`, height: "100%", background: color, borderRadius: 4, transition: "width 0.8s ease" }} />
      </div>
    </div>
  );
}

export default function SoilTestingPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult]   = useState(null);
  const [error, setError]     = useState(null);
  const [coords, setCoords]   = useState(null);

  async function handleAnalyze() {
    setLoading(true);
    setError(null);
    setResult(null);

    if (!navigator.geolocation) {
      setError("Geolocation not supported on this device.");
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;
        setCoords({ lat, lon });
        try {
          const data = await apiFetch(`/soil?lat=${lat}&lon=${lon}`);
          setResult(data);
        } catch {
          setError("Could not fetch soil data. Try again.");
        } finally {
          setLoading(false);
        }
      },
      () => {
        setError("Location access denied. Please allow location to analyse soil.");
        setLoading(false);
      }
    );
  }

  const health = result ? HEALTH_CONFIG[result.soil_health] || HEALTH_CONFIG.Fair : null;

  return (
    <div className="page-shell" style={{ paddingBottom: 90, overflowY: "auto" }}>
      {/* Header */}
      <div style={{ padding: "24px 20px 0" }}>
        <div style={{ fontSize: 13, color: "#6b7280", marginBottom: 4 }}>FarmShield</div>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: "#14532d", margin: 0 }}>Soil Intelligence</h1>
        <p style={{ color: "#6b7280", fontSize: 14, marginTop: 6 }}>
          Instant soil analysis using your GPS location — no lab needed.
        </p>
      </div>

      {/* CTA */}
      <div style={{ padding: "20px 20px 0" }}>
        <button
          onClick={handleAnalyze}
          disabled={loading}
          style={{
            width: "100%", padding: "16px", borderRadius: 14, border: "none",
            background: loading ? "#86efac" : "linear-gradient(135deg, #22c55e, #16a34a)",
            color: "white", fontSize: 16, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
            boxShadow: "0 4px 14px rgba(34,197,94,0.4)"
          }}
        >
          {loading ? (
            <><div className="spinner" /> Analysing your soil...</>
          ) : (
            <> 📍 Analyse My Soil Now</>
          )}
        </button>
      </div>

      {error && (
        <div style={{ margin: "16px 20px 0", padding: 14, background: "#fef2f2", borderRadius: 10, color: "#dc2626", fontSize: 14 }}>
          {error}
        </div>
      )}

      {coords && !result && !error && (
        <div style={{ margin: "12px 20px 0", fontSize: 13, color: "#6b7280" }}>
          📍 {coords.lat.toFixed(4)}, {coords.lon.toFixed(4)}
        </div>
      )}

      {result && health && (
        <div style={{ padding: "20px 20px 0" }}>

          {/* Health Score Card */}
          <div style={{
            background: `linear-gradient(135deg, ${health.color}, ${health.color}cc)`,
            borderRadius: 16, padding: 20, color: "white", marginBottom: 16,
            display: "flex", justifyContent: "space-between", alignItems: "center"
          }}>
            <div>
              <div style={{ fontSize: 13, opacity: 0.85, marginBottom: 4 }}>Soil Health Score</div>
              <div style={{ fontSize: 32, fontWeight: 800 }}>{health.emoji} {result.soil_health}</div>
              <div style={{ fontSize: 13, opacity: 0.85, marginTop: 4 }}>
                {result.soil_type} · pH {result.ph}
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 13, opacity: 0.85 }}>Moisture</div>
              <div style={{ fontSize: 28, fontWeight: 700 }}>{result.moisture}%</div>
            </div>
          </div>

          {/* NPK Metrics */}
          <div style={{ background: "white", borderRadius: 14, padding: 18, marginBottom: 16, boxShadow: "0 1px 8px rgba(0,0,0,0.06)" }}>
            <div style={{ fontWeight: 700, color: "#14532d", marginBottom: 14, fontSize: 15 }}>🧪 Nutrient Levels</div>
            <MetricBar label="Nitrogen (N)"   value={result.nitrogen}   max={150} unit="mg/kg" color="#22c55e" />
            <MetricBar label="Phosphorus (P)" value={result.phosphorus} max={60}  unit="mg/kg" color="#3b82f6" />
            <MetricBar label="Potassium (K)"  value={result.potassium}  max={300} unit="mg/kg" color="#f59e0b" />
          </div>

          {/* Recommendations */}
          <div style={{ background: "white", borderRadius: 14, padding: 18, marginBottom: 16, boxShadow: "0 1px 8px rgba(0,0,0,0.06)" }}>
            <div style={{ fontWeight: 700, color: "#14532d", marginBottom: 12, fontSize: 15 }}>💡 Recommendations</div>
            {result.recommendations?.map((rec, i) => (
              <div key={i} style={{
                padding: "10px 12px", background: "#f8fafc", borderRadius: 8,
                marginBottom: 8, fontSize: 14, color: "#374151", lineHeight: 1.4
              }}>
                {rec}
              </div>
            ))}
          </div>

          {/* Location */}
          <div style={{ background: "#f0fdf4", borderRadius: 12, padding: 14, fontSize: 13, color: "#166534" }}>
            📍 Analysed at {coords?.lat.toFixed(5)}, {coords?.lon.toFixed(5)}
            <span style={{ float: "right", opacity: 0.7 }}>Source: {result.source}</span>
          </div>

          {/* Data source notice */}
          {result.source === "Simulated" && (
            <div style={{ marginTop: 12, background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 10, padding: "12px 14px", fontSize: 13, color: "#92400e" }}>
              ⚠️ This is a simulated estimate based on your GPS location. Results will be replaced with real sensor readings once IoT devices are deployed in your area.
            </div>
          )}
          {result.source === "IoT Sensor" && (
            <div style={{ marginTop: 12, background: "#f0fdf4", border: "1px solid #86efac", borderRadius: 10, padding: "12px 14px", fontSize: 13, color: "#166534" }}>
              ✅ Live data from a FarmShield IoT sensor {result.data_age_hours != null ? `· ${result.data_age_hours}h ago` : ""}
            </div>
          )}

        </div>
      )}

      <div style={{ padding: "40px 20px", textAlign: "center" }}>
          <div style={{ fontSize: 64, marginBottom: 16 }}>🌍</div>
          <div style={{ fontWeight: 600, color: "#374151", marginBottom: 8 }}>No analysis yet</div>
          <div style={{ color: "#9ca3af", fontSize: 14 }}>
            Tap the button above to get instant soil data for your farm location.
          </div>
          <div style={{ marginTop: 24, display: "flex", flexDirection: "column", gap: 8 }}>
            {["pH level & soil type", "Nitrogen, Phosphorus & Potassium", "Moisture content", "Crop recommendations"].map(f => (
              <div key={f} style={{ background: "#f0fdf4", borderRadius: 8, padding: "10px 14px", fontSize: 13, color: "#166534", textAlign: "left" }}>
                ✓ {f}
              </div>
            ))}
          </div>
        </div>
    </div>
  );
}
