import React from "react";

import { MOCK_FARMERS } from "../constants";

export default function MapPage() {
  return (
    <div className="page-shell">
      <h2 className="page-title">Safety Map</h2>
      <p className="page-sub">Farmers and risk zones near you</p>

      <div className="map-outer">
        <svg className="map-icon" viewBox="0 0 24 24">
          <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" />
          <line x1="8" y1="2" x2="8" y2="18" />
          <line x1="16" y1="6" x2="16" y2="22" />
        </svg>
        <div className="map-ph-title">Interactive Map</div>
        <div className="map-ph-note">Install react-leaflet and replace this placeholder</div>
      </div>

      <div className="map-legend">
        <div className="legend-item"><div className="legend-dot" style={{ background: "#15803d" }} />Safe zone</div>
        <div className="legend-item"><div className="legend-dot" style={{ background: "#ca8a04" }} />Caution</div>
        <div className="legend-item"><div className="legend-dot" style={{ background: "#dc2626" }} />Danger</div>
        <div className="legend-item"><div className="legend-dot" style={{ background: "#052e16" }} />You</div>
      </div>

      <div className="section-title">Nearby Farmers</div>
      {MOCK_FARMERS.map((f) => (
        <div className="farmer-card" key={f.id}>
          <div className="farmer-avatar">
            <svg viewBox="0 0 24 24">
              <circle cx="12" cy="8" r="4" />
              <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
            </svg>
          </div>
          <div>
            <div className="farmer-name">{f.name}</div>
            <div className="farmer-dist">{f.dist} away</div>
          </div>
          <div className={`farmer-status ${f.status}`}>
            {f.status === "safe" ? "Safe" : f.status === "warn" ? "Caution" : "Danger"}
          </div>
        </div>
      ))}
    </div>
  );
}