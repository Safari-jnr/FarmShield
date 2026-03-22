import React, { useState } from "react";
import { apiFetch } from "../services/api";

export default function SoilTestForm({ onResults }) {
  const [form, setForm] = useState({
    ph: 7,
    nitrogen: "",
    phosphorus: "",
    potassium: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  function upd(key) {
    return (e) => setForm((f) => ({ ...f, [key]: e.target.value }));
  }

  function getPhColor(ph) {
    if (ph < 4) return "#dc2626";
    if (ph < 6) return "#f59e0b";
    if (ph <= 7.5) return "#15803d";
    if (ph <= 9) return "#f59e0b";
    return "#dc2626";
  }

  function getPhLabel(ph) {
    if (ph < 4) return "Strongly Acidic";
    if (ph < 6) return "Acidic";
    if (ph <= 7.5) return "Neutral (Ideal)";
    if (ph <= 9) return "Alkaline";
    return "Strongly Alkaline";
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const data = await apiFetch("/soil-tests/", {
        method: "POST",
        body: JSON.stringify({
          ph: parseFloat(form.ph),
          nitrogen: parseFloat(form.nitrogen),
          phosphorus: parseFloat(form.phosphorus),
          potassium: parseFloat(form.potassium),
        }),
      });
      if (onResults) onResults(data);
    } catch {
      // Demo mode — generate mock results
      const mockResults = {
        ph: parseFloat(form.ph),
        nitrogen: parseFloat(form.nitrogen),
        phosphorus: parseFloat(form.phosphorus),
        potassium: parseFloat(form.potassium),
        recommendations: generateRecommendations(form),
      };
      if (onResults) onResults(mockResults);
    } finally {
      setLoading(false);
    }
  }

  function generateRecommendations(f) {
    const recs = [];
    const ph = parseFloat(f.ph);
    const n = parseFloat(f.nitrogen);
    const p = parseFloat(f.phosphorus);
    const k = parseFloat(f.potassium);

    if (ph < 6) recs.push("Add lime to raise soil pH for better nutrient absorption.");
    if (ph > 7.5) recs.push("Add sulfur or organic matter to lower soil pH.");
    if (n < 20) recs.push("Nitrogen is low — apply nitrogen-rich fertilizer or compost.");
    if (p < 15) recs.push("Phosphorus is low — consider bone meal or superphosphate.");
    if (k < 20) recs.push("Potassium is low — apply potash fertilizer.");
    if (recs.length === 0) recs.push("Soil health looks good! Maintain with regular organic matter.");
    return recs;
  }

  return (
    <div style={styles.card}>
      <div style={styles.cardHeader}>
        <div style={styles.iconWrap}>
          <svg viewBox="0 0 24 24" style={styles.headerIcon}>
            <path d="M12 2a10 10 0 100 20A10 10 0 0012 2z"/>
            <path d="M12 6v6l4 2"/>
          </svg>
        </div>
        <div>
          <div style={styles.cardTitle}>Soil Test</div>
          <div style={styles.cardSub}>Enter your soil sample results</div>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        {/* pH Slider */}
        <div style={styles.field}>
          <div style={styles.labelRow}>
            <label style={styles.label}>Soil pH Level</label>
            <span style={{ ...styles.phBadge, background: getPhColor(form.ph) }}>
              {form.ph} — {getPhLabel(form.ph)}
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="14"
            step="0.1"
            value={form.ph}
            onChange={upd("ph")}
            style={styles.slider}
          />
          <div style={styles.sliderLabels}>
            <span>0 Acidic</span>
            <span>7 Neutral</span>
            <span>14 Alkaline</span>
          </div>
          {/* pH color bar */}
          <div style={styles.phBar}>
            <div style={{ ...styles.phIndicator, left: `${(form.ph / 14) * 100}%`, background: getPhColor(form.ph) }} />
          </div>
        </div>

        {/* NPK Inputs */}
        <div style={styles.npkGrid}>
          <div style={styles.field}>
            <label style={styles.label}>Nitrogen (mg/kg)</label>
            <input
              type="number"
              placeholder="e.g. 25"
              value={form.nitrogen}
              onChange={upd("nitrogen")}
              required
              min="0"
              style={styles.input}
            />
          </div>
          <div style={styles.field}>
            <label style={styles.label}>Phosphorus (mg/kg)</label>
            <input
              type="number"
              placeholder="e.g. 18"
              value={form.phosphorus}
              onChange={upd("phosphorus")}
              required
              min="0"
              style={styles.input}
            />
          </div>
          <div style={styles.field}>
            <label style={styles.label}>Potassium (mg/kg)</label>
            <input
              type="number"
              placeholder="e.g. 22"
              value={form.potassium}
              onChange={upd("potassium")}
              required
              min="0"
              style={styles.input}
            />
          </div>
        </div>

        {error && <div style={styles.errorMsg}>{error}</div>}

        <button type="submit" disabled={loading} style={styles.btn}>
          {loading ? <div style={styles.spinner} /> : "Analyse Soil"}
        </button>
      </form>
    </div>
  );
}

const styles = {
  card: {
    background: "#fff",
    borderRadius: 16,
    padding: "20px",
    border: "1px solid #d1fae5",
    boxShadow: "0 2px 8px rgba(5,46,22,0.08)",
    marginBottom: 16,
  },
  cardHeader: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    marginBottom: 20,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    background: "linear-gradient(135deg, #14532d, #16a34a)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  headerIcon: {
    width: 20,
    height: 20,
    stroke: "#fff",
    fill: "none",
    strokeWidth: 2,
    strokeLinecap: "round",
    strokeLinejoin: "round",
  },
  cardTitle: {
    fontFamily: "'Fraunces', serif",
    fontSize: "1.1rem",
    fontWeight: 900,
    color: "#052e16",
    letterSpacing: "-0.02em",
  },
  cardSub: {
    fontSize: "0.78rem",
    color: "#4b7a60",
    marginTop: 2,
  },
  field: {
    display: "flex",
    flexDirection: "column",
    gap: 6,
    marginBottom: 16,
  },
  labelRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 6,
  },
  label: {
    fontSize: "0.75rem",
    fontWeight: 600,
    color: "#14532d",
    letterSpacing: "0.05em",
    textTransform: "uppercase",
  },
  phBadge: {
    fontSize: "0.7rem",
    fontWeight: 700,
    color: "#fff",
    padding: "3px 10px",
    borderRadius: 50,
  },
  slider: {
    width: "100%",
    accentColor: "#15803d",
    cursor: "pointer",
  },
  sliderLabels: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: "0.65rem",
    color: "#4b7a60",
    marginTop: 2,
  },
  phBar: {
    position: "relative",
    height: 6,
    borderRadius: 3,
    background: "linear-gradient(to right, #dc2626, #f59e0b, #15803d, #f59e0b, #dc2626)",
    marginTop: 6,
  },
  phIndicator: {
    position: "absolute",
    top: -3,
    width: 12,
    height: 12,
    borderRadius: "50%",
    border: "2px solid #fff",
    transform: "translateX(-50%)",
    boxShadow: "0 1px 4px rgba(0,0,0,0.2)",
  },
  npkGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr 1fr",
    gap: 10,
  },
  input: {
    padding: "12px 14px",
    borderRadius: 8,
    border: "1.5px solid #d1fae5",
    background: "#fff",
    fontSize: "0.9rem",
    color: "#052e16",
    outline: "none",
    fontFamily: "'Outfit', sans-serif",
    width: "100%",
  },
  errorMsg: {
    background: "#fee2e2",
    color: "#b91c1c",
    borderRadius: 8,
    padding: "10px 14px",
    fontSize: "0.82rem",
    marginBottom: 12,
  },
  btn: {
    width: "100%",
    padding: 16,
    borderRadius: 10,
    background: "linear-gradient(135deg, #15803d, #22c55e)",
    color: "#fff",
    fontSize: "0.95rem",
    fontWeight: 600,
    border: "none",
    cursor: "pointer",
    boxShadow: "0 3px 10px rgba(21,128,61,0.28)",
    marginTop: 4,
  },
  spinner: {
    width: 20,
    height: 20,
    border: "2.5px solid rgba(255,255,255,0.3)",
    borderTopColor: "#fff",
    borderRadius: "50%",
    animation: "spin 0.7s linear infinite",
    margin: "0 auto",
  },
};