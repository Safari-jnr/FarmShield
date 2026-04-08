import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from "react-leaflet";
import { apiFetch, getLocation } from "../services/api";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const THREAT_COLORS = {
  bandits:      "#ef4444",
  flood:        "#3b82f6",
  pests:        "#f59e0b",
  sick_crops:   "#a855f7",
  dead_animals: "#6b7280",
  other:        "#f97316",
};

const THREAT_LABELS = {
  bandits:      "⚠️ Bandits",
  flood:        "🌊 Flood",
  pests:        "🐛 Pests",
  sick_crops:   "🌾 Sick Crops",
  dead_animals: "💀 Dead Animals",
  other:        "⚠️ Other",
};

function makeIcon(color) {
  return L.divIcon({
    className: "",
    html: `<div style="width:14px;height:14px;border-radius:50%;background:${color};border:2px solid white;box-shadow:0 1px 4px rgba(0,0,0,0.4)"></div>`,
    iconSize: [14, 14],
    iconAnchor: [7, 7],
  });
}

function RecenterMap({ center }) {
  const map = useMap();
  useEffect(() => { map.setView(center, map.getZoom()); }, [center, map]);
  return null;
}

export default function MapPage() {
  const [location, setLocation] = useState([9.0765, 7.3986]);
  const [reports, setReports]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [selected, setSelected] = useState(null);
  const [filter, setFilter]     = useState("all");

  useEffect(() => {
    async function init() {
      const loc = await getLocation();
      const center = [loc.lat, loc.lon];
      setLocation(center);
      try {
        const data = await apiFetch(`/reports/verified?lat=${loc.lat}&lng=${loc.lon}&radius_km=50`);
        setReports(data.threats || []);
      } catch {}
      setLoading(false);
    }
    init();
  }, []);

  const filtered = filter === "all" ? reports : reports.filter(r => r.threat_type === filter);
  const threatTypes = [...new Set(reports.map(r => r.threat_type))];

  if (loading) return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "calc(100vh - 70px)", gap: 12 }}>
      <div className="spinner" style={{ width: 32, height: 32 }} />
      <div style={{ color: "#6b7280", fontSize: 14 }}>Loading threat map...</div>
    </div>
  );

  return (
    <div style={{ height: "calc(100vh - 70px)", display: "flex", flexDirection: "column", position: "relative" }} className="map-page-wrap">

      {/* Filter bar */}
      <div style={{
        position: "absolute", top: 12, left: 12, right: 12, zIndex: 1000,
        display: "flex", gap: 6, overflowX: "auto", paddingBottom: 2
      }}>
        {["all", ...threatTypes].map(t => (
          <button key={t} onClick={() => setFilter(t)} style={{
            padding: "6px 12px", borderRadius: 20, border: "none", whiteSpace: "nowrap",
            fontSize: 12, fontWeight: 600, cursor: "pointer",
            background: filter === t ? (t === "all" ? "#14532d" : THREAT_COLORS[t]) : "white",
            color: filter === t ? "white" : "#374151",
            boxShadow: "0 1px 6px rgba(0,0,0,0.15)"
          }}>
            {t === "all" ? `🗺️ All (${reports.length})` : THREAT_LABELS[t] || t}
          </button>
        ))}
      </div>

      {/* Map */}
      <MapContainer center={location} zoom={13} style={{ flex: 1, width: "100%" }} zoomControl={false}>
        <RecenterMap center={location} />
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* User location */}
        <Circle center={location} radius={200} pathOptions={{ color: "#22c55e", fillColor: "#22c55e", fillOpacity: 0.2 }} />
        <Marker position={location}>
          <Popup><strong>📍 You are here</strong></Popup>
        </Marker>

        {/* Threat markers */}
        {filtered.map(report => {
          if (!report.location_lat || !report.location_lng) return null;
          const color = THREAT_COLORS[report.threat_type] || "#f97316";
          return (
            <React.Fragment key={report.id}>
              <Circle
                center={[report.location_lat, report.location_lng]}
                radius={1500}
                pathOptions={{ color, fillColor: color, fillOpacity: 0.12, weight: 1 }}
              />
              <Marker
                position={[report.location_lat, report.location_lng]}
                icon={makeIcon(color)}
                eventHandlers={{ click: () => setSelected(report) }}
              >
                <Popup>
                  <div style={{ minWidth: 160 }}>
                    <div style={{ fontWeight: 700, color, marginBottom: 4 }}>
                      {THREAT_LABELS[report.threat_type] || report.threat_type}
                    </div>
                    <div style={{ fontSize: 13, color: "#374151", marginBottom: 4 }}>
                      {report.description || "No description"}
                    </div>
                    <div style={{ fontSize: 11, color: "#9ca3af" }}>
                      {new Date(report.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </Popup>
              </Marker>
            </React.Fragment>
          );
        })}
      </MapContainer>

      {/* Summary panel */}
      <div style={{
        background: "white", padding: "12px 16px",
        borderTop: "1px solid #e5e7eb", display: "flex", gap: 12, alignItems: "center"
      }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 12, color: "#6b7280" }}>Active threats nearby</div>
          <div style={{ fontSize: 20, fontWeight: 700, color: reports.length > 0 ? "#ef4444" : "#16a34a" }}>
            {reports.length === 0 ? " Area Clear" : `${reports.length} threat${reports.length > 1 ? "s" : ""}`}
          </div>
        </div>
        {threatTypes.slice(0, 3).map(t => (
          <div key={t} style={{ textAlign: "center" }}>
            <div style={{ width: 10, height: 10, borderRadius: "50%", background: THREAT_COLORS[t], margin: "0 auto 2px" }} />
            <div style={{ fontSize: 10, color: "#6b7280" }}>{(THREAT_LABELS[t] || t).replace(/^[^\s]+\s/, "")}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
