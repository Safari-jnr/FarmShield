import React from "react";

const NUTRIENT_LEVELS = {
  nitrogen:   { low: 20, high: 40, unit: "mg/kg", label: "Nitrogen (N)" },
  phosphorus: { low: 15, high: 30, unit: "mg/kg", label: "Phosphorus (P)" },
  potassium:  { low: 20, high: 40, unit: "mg/kg", label: "Potassium (K)" },
};

function getLevel(value, thresholds) {
  if (value < thresholds.low)  return { label: "Low",    color: "#dc2626", bg: "#fee2e2", bar: "#dc2626" };
  if (value > thresholds.high) return { label: "High",   color: "#d97706", bg: "#fef9c3", bar: "#d97706" };
  return                               { label: "Optimal", color: "#15803d", bg: "#dcfce7", bar: "#15803d" };
}

function getPhStatus(ph) {
  if (ph < 4)   return { label: "Strongly Acidic", color: "#dc2626", bg: "#fee2e2" };
  if (ph < 6)   return { label: "Acidic",          color: "#f59e0b", bg: "#fef9c3" };
  if (ph <= 7.5)return { label: "Ideal",            color: "#15803d", bg: "#dcfce7" };
  if (ph <= 9)  return { label: "Alkaline",         color: "#f59e0b", bg: "#fef9c3" };
  return               { label: "Strongly Alkaline",color: "#dc2626", bg: "#fee2e2" };
}

function NutrientBar({ label, value, thresholds }) {
  const level = getLevel(value, thresholds);
  const pct = Math.min((value / (thresholds.high * 1.5)) * 100, 100);

  return (
    <div style={styles.nutrientRow}>
      <div style={styles.nutrientTop}>
        <span style={styles.nutrientLabel}>{label}</span>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={styles.nutrientValue}>{value} {thresholds.unit}</span>
          <span style={{ ...styles.levelBadge, background: level.bg, color: level.color }}>
            {level.label}
          </span>
        </div>
      </div>
      <div style={styles.barTrack}>
        <div style={{ ...styles.barFill, width: `${pct}%`, background: level.bar }} />
      </div>
    </div>
  );
}

export default function SoilResults({ results, onRetry }) {
  if (!results) return null;

  const phStatus = getPhStatus(results.ph);
  const overallHealthy =
    results.ph >= 6 && results.ph <= 7.5 &&
    results.nitrogen >= 20 &&
    results.phosphorus >= 15 &&
    results.potassium >= 20;

  return (
    <div style={styles.wrap}>

      {/* Overall status */}
      <div style={{ ...styles.overallCard, background: overallHealthy ? "linear-gradient(135deg, #14532d, #16a34a)" : "linear-gradient(135deg, #92400e, #d97706)" }}>
        <div style={styles.overallIcon}>
          <svg viewBox="0 0 24 24" style={styles.overallSvg}>
            {overallHealthy
              ? <><path d="M12 2a10 10 0 100 20A10 10 0 0012 2z"/><path d="M8 12l3 3 5-5"/></>
              : <><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></>
            }
          </svg>
        </div>
        <div>
          <div style={styles.overallTitle}>
            {overallHealthy ? "Soil is Healthy" : "Soil Needs Attention"}
          </div>
          <div style={styles.overallSub}>
            {overallHealthy
              ? "Your soil is well balanced for farming"
              : "Some nutrients need adjustment"}
          </div>
        </div>
      </div>

      {/* pH Reading */}
      <div style={styles.card}>
        <div style={styles.cardTitleRow}>
          <span style={styles.sectionTitle}>pH Level</span>
          <span style={{ ...styles.levelBadge, background: phStatus.bg, color: phStatus.color }}>
            {phStatus.label}
          </span>
        </div>
        <div style={styles.phDisplay}>
          <span style={{ ...styles.phNumber, color: phStatus.color }}>{results.ph}</span>
          <span style={styles.phScale}>/ 14</span>
        </div>
        <div style={styles.phBarWrap}>
          <div style={styles.phBarFull} />
          <div style={{ ...styles.phDot, left: `${(results.ph / 14) * 100}%`, background: phStatus.color }} />
        </div>
        <div style={styles.phScaleLabels}>
          <span>Acidic (0)</span>
          <span>Neutral (7)</span>
          <span>Alkaline (14)</span>
        </div>
      </div>

      {/* Nutrient Levels */}
      <div style={styles.card}>
        <div style={styles.sectionTitle}>Nutrient Levels</div>
        <NutrientBar label="Nitrogen (N)"   value={results.nitrogen}   thresholds={NUTRIENT_LEVELS.nitrogen} />
        <NutrientBar label="Phosphorus (P)" value={results.phosphorus} thresholds={NUTRIENT_LEVELS.phosphorus} />
        <NutrientBar label="Potassium (K)"  value={results.potassium}  thresholds={NUTRIENT_LEVELS.potassium} />
      </div>

      {/* Recommendations */}
      {results.recommendations && results.recommendations.length > 0 && (
        <div style={styles.card}>
          <div style={styles.sectionTitle}>Farming Recommendations</div>
          {results.recommendations.map((rec, i) => (
            <div key={i} style={styles.recRow}>
              <div style={styles.recDot} />
              <span style={styles.recText}>{rec}</span>
            </div>
          ))}
        </div>
      )}

      {/* Retry button */}
      <button onClick={onRetry} style={styles.retryBtn}>
        Run Another Test
      </button>
    </div>
  );
}

const styles = {
  wrap: { display: "flex", flexDirection: "column", gap: 14 },
  overallCard: {
    borderRadius: 16,
    padding: "18px 20px",
    display: "flex",
    alignItems: "center",
    gap: 14,
  },
  overallIcon: {
    width: 44,
    height: 44,
    borderRadius: "50%",
    background: "rgba(255,255,255,0.15)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  overallSvg: {
    width: 22,
    height: 22,
    stroke: "#fff",
    fill: "none",
    strokeWidth: 2,
    strokeLinecap: "round",
    strokeLinejoin: "round",
  },
  overallTitle: {
    fontFamily: "'Fraunces', serif",
    fontSize: "1.05rem",
    fontWeight: 900,
    color: "#fff",
    letterSpacing: "-0.02em",
  },
  overallSub: {
    fontSize: "0.78rem",
    color: "rgba(255,255,255,0.82)",
    marginTop: 2,
  },
  card: {
    background: "#fff",
    borderRadius: 16,
    padding: "16px 18px",
    border: "1px solid #d1fae5",
    boxShadow: "0 2px 8px rgba(5,46,22,0.08)",
  },
  cardTitleRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: "0.75rem",
    fontWeight: 700,
    color: "#14532d",
    textTransform: "uppercase",
    letterSpacing: "0.06em",
    marginBottom: 12,
    display: "block",
  },
  phDisplay: {
    display: "flex",
    alignItems: "baseline",
    gap: 4,
    marginBottom: 10,
  },
  phNumber: {
    fontFamily: "'Fraunces', serif",
    fontSize: "2.6rem",
    fontWeight: 900,
    lineHeight: 1,
    letterSpacing: "-0.02em",
  },
  phScale: {
    fontSize: "1rem",
    color: "#4b7a60",
  },
  phBarWrap: {
    position: "relative",
    height: 8,
    borderRadius: 4,
    marginBottom: 6,
  },
  phBarFull: {
    position: "absolute",
    inset: 0,
    borderRadius: 4,
    background: "linear-gradient(to right, #dc2626, #f59e0b, #15803d, #f59e0b, #dc2626)",
  },
  phDot: {
    position: "absolute",
    top: -4,
    width: 16,
    height: 16,
    borderRadius: "50%",
    border: "2.5px solid #fff",
    transform: "translateX(-50%)",
    boxShadow: "0 1px 4px rgba(0,0,0,0.2)",
  },
  phScaleLabels: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: "0.62rem",
    color: "#4b7a60",
    marginTop: 4,
  },
  levelBadge: {
    fontSize: "0.68rem",
    fontWeight: 700,
    padding: "3px 10px",
    borderRadius: 50,
    textTransform: "uppercase",
    letterSpacing: "0.04em",
    whiteSpace: "nowrap",
  },
  nutrientRow: {
    marginBottom: 14,
  },
  nutrientTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
    flexWrap: "wrap",
    gap: 4,
  },
  nutrientLabel: {
    fontSize: "0.82rem",
    fontWeight: 600,
    color: "#052e16",
  },
  nutrientValue: {
    fontSize: "0.78rem",
    color: "#4b7a60",
  },
  barTrack: {
    height: 8,
    borderRadius: 4,
    background: "#f0fdf4",
    overflow: "hidden",
  },
  barFill: {
    height: "100%",
    borderRadius: 4,
    transition: "width 0.6s ease",
  },
  recRow: {
    display: "flex",
    alignItems: "flex-start",
    gap: 10,
    marginBottom: 10,
  },
  recDot: {
    width: 8,
    height: 8,
    borderRadius: "50%",
    background: "#15803d",
    flexShrink: 0,
    marginTop: 5,
  },
  recText: {
    fontSize: "0.85rem",
    color: "#052e16",
    lineHeight: 1.5,
  },
  retryBtn: {
    width: "100%",
    padding: 14,
    borderRadius: 10,
    background: "#f0fdf4",
    color: "#15803d",
    fontSize: "0.9rem",
    fontWeight: 600,
    border: "1.5px solid #d1fae5",
    cursor: "pointer",
  },
};