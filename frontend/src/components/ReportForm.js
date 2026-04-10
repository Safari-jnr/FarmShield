import React from "react";
import { useState } from "react";
import Toast, { useToast } from "./Toast";
import { apiFetch, getLocation, getUser } from "../services/api";
import { THREAT_TYPES } from "../constants";

const THREAT_ICONS = {
  flood: (<svg viewBox="0 0 24 24"><path d="M3 18c0-1.1.9-2 2-2s2 .9 2 2 .9 2 2 2 2-.9 2-2 .9-2 2-2 2 .9 2 2 .9 2 2 2 2-.9 2-2"/><path d="M3 13c0-1.1.9-2 2-2s2 .9 2 2 .9 2 2 2 2-.9 2-2 .9-2 2-2 2 .9 2 2 .9 2 2 2 2-.9 2-2"/></svg>),
  fire:  (<svg viewBox="0 0 24 24"><path d="M8.5 14.5A2.5 2.5 0 0011 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 01-7 7 7 7 0 01-7-7c0-1.53.4-2.973 1.1-4.22L8.5 14.5z"/></svg>),
  pest:  (<svg viewBox="0 0 24 24"><ellipse cx="12" cy="12" rx="4" ry="6"/><path d="M12 6V2M8 8l-4-2M16 8l4-2M8 16l-4 2M16 16l4 2M8 12H4M16 12h4"/></svg>),
  drought:(<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>),
  theft: (<svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M12 14c-6 0-8 2-8 4v2h16v-2c0-2-2-4-8-4z"/><line x1="18" y1="6" x2="22" y2="6"/></svg>),
  other: (<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>),
};

export default function ReportForm() {
  const [threat,  setThreat]  = useState("");
  const [desc,    setDesc]    = useState("");
  const [photo,   setPhoto]   = useState(null);
  const [loading, setLoading] = useState(false);
  const [toast,   showToast]  = useToast();

  async function handleSubmit() {
    if (!threat) { showToast("Please select a threat type", "error"); return; }
    setLoading(true);
    try {
      const loc = await getLocation();
      const user = getUser();
      if (!user?.id) { showToast("Please log in again", "error"); setLoading(false); return; }
      const fd = new FormData();
      fd.append("description", desc || "");
      fd.append("threat_type", threat);
      fd.append("user_id", user.id);
      fd.append("lat", loc.lat);
      fd.append("lng", loc.lon);
      if (photo) fd.append("photo", photo);
      await apiFetch("/reports/", { method: "POST", headers: {}, body: fd });
      showToast("Report submitted — thank you", "success");
      setThreat(""); setDesc(""); setPhoto(null);
    } catch (e) {
      showToast(`Error: ${e.message}`, "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <div className="field" style={{ marginBottom: 8 }}>
        <label>Type of Threat</label>
      </div>
      <div className="threat-grid">
        {THREAT_TYPES.map((t) => (
          <div
            key={t.id}
            className={`threat-chip ${threat === t.id ? "selected" : ""}`}
            onClick={() => setThreat(t.id)}
          >
            {THREAT_ICONS[t.id]}
            {t.label}
          </div>
        ))}
      </div>
      <div className="field">
        <label>Description <span style={{ fontWeight: 400, textTransform: "none", letterSpacing: 0 }}>(optional)</span></label>
        <textarea
          className="textarea"
          placeholder="Describe what you saw..."
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
        />
      </div>
      <label htmlFor="photo-input">
        <div className="photo-upload">
          <svg viewBox="0 0 24 24">
            <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" />
            <circle cx="12" cy="13" r="4" />
          </svg>
          <div className="photo-upload-label">
            {photo ? `Photo attached: ${photo.name}` : "Tap to add a photo (optional)"}
          </div>
        </div>
      </label>
      <input
        id="photo-input"
        type="file"
        accept="image/*"
        style={{ display: "none" }}
        onChange={(e) => setPhoto(e.target.files[0])}
      />
      <button className="btn-primary" onClick={handleSubmit} disabled={loading}>
        {loading ? <div className="spinner" /> : "Submit Report"}
      </button>
      <Toast {...(toast || {})} />
    </>
  );
}