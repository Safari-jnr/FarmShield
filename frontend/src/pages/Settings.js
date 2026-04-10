import React, { useState, useEffect } from "react";
import { apiFetch, getUser, saveSession } from "../services/api";
import Toast, { useToast } from "../components/Toast";

function Section({ title, children }) {
  return (
    <div style={{ background: "white", borderRadius: 14, padding: "18px 20px", marginBottom: 16, boxShadow: "0 1px 6px rgba(0,0,0,0.06)" }}>
      <div style={{ fontWeight: 700, color: "#14532d", fontSize: 14, marginBottom: 14, paddingBottom: 10, borderBottom: "1px solid #f3f4f6" }}>
        {title}
      </div>
      {children}
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>
        {label}
      </label>
      {children}
    </div>
  );
}

const inputStyle = {
  width: "100%", padding: "11px 14px", borderRadius: 9,
  border: "1.5px solid #e5e7eb", fontSize: 14, color: "#1f2937",
  outline: "none", background: "white"
};

export default function SettingsPage() {
  const currentUser = getUser();
  const [toast, showToast] = useToast();

  // Profile state
  const [name, setName]         = useState(currentUser?.name || "");
  const [language, setLanguage] = useState(currentUser?.language || "en");
  const [savingProfile, setSavingProfile] = useState(false);

  // Email state
  const [email, setEmail]       = useState(currentUser?.email || "");
  const [savingEmail, setSavingEmail] = useState(false);

  // Password state
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw]         = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [savingPw, setSavingPw]   = useState(false);
  const [showPw, setShowPw]       = useState(false);

  useEffect(() => {
    if (currentUser?.id) {
      apiFetch(`/settings/${currentUser.id}`)
        .then(data => {
          setName(data.name || "");
          setEmail(data.email || "");
          setLanguage(data.language || "en");
          // Update session with latest points/badge from server
          const token = localStorage.getItem("fs_token");
          saveSession(token, { ...currentUser, ...data });
        })
        .catch(() => {});
    }
  }, []);

  async function handleSaveProfile() {
    setSavingProfile(true);
    try {
      const data = await apiFetch("/settings/profile", {
        method: "PUT",
        body: JSON.stringify({ user_id: currentUser.id, name, language }),
      });
      // Update local session
      const token = localStorage.getItem("fs_token");
      saveSession(token, { ...currentUser, name: data.name, language: data.language });
      showToast("Profile updated", "success");
    } catch (e) {
      showToast(e.message || "Failed to update profile", "error");
    } finally {
      setSavingProfile(false);
    }
  }

  async function handleSaveEmail() {
    if (!email || !email.includes("@")) { showToast("Enter a valid email address", "error"); return; }
    setSavingEmail(true);
    try {
      await apiFetch("/settings/email", {
        method: "PUT",
        body: JSON.stringify({ user_id: currentUser.id, email }),
      });
      const token = localStorage.getItem("fs_token");
      saveSession(token, { ...currentUser, email });
      showToast("Email saved — you'll now receive alert emails", "success");
    } catch (e) {
      showToast(e.message || "Failed to update email", "error");
    } finally {
      setSavingEmail(false);
    }
  }

  async function handleChangePassword() {
    if (!currentPw) { showToast("Enter your current password", "error"); return; }
    if (newPw.length < 6) { showToast("New password must be at least 6 characters", "error"); return; }
    if (newPw !== confirmPw) { showToast("Passwords don't match", "error"); return; }
    setSavingPw(true);
    try {
      await apiFetch("/settings/password", {
        method: "PUT",
        body: JSON.stringify({ user_id: currentUser.id, current_password: currentPw, new_password: newPw }),
      });
      setCurrentPw(""); setNewPw(""); setConfirmPw("");
      showToast("Password changed successfully", "success");
    } catch (e) {
      showToast(e.message || "Failed to change password", "error");
    } finally {
      setSavingPw(false);
    }
  }

  return (
    <div className="page-shell">
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 13, color: "#6b7280", marginBottom: 4 }}>FarmShield</div>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: "#14532d", margin: 0 }}>Settings</h1>
        <p style={{ color: "#6b7280", fontSize: 14, marginTop: 6 }}>Manage your account and notification preferences.</p>
      </div>

      {/* Account info */}
      <div style={{ background: "linear-gradient(135deg, #14532d, #16a34a)", borderRadius: 14, padding: "18px 20px", marginBottom: 16, display: "flex", alignItems: "center", gap: 14 }}>
        <div style={{ width: 48, height: 48, borderRadius: "50%", background: "rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>
          👨‍🌾
        </div>
        <div>
          <div style={{ color: "white", fontWeight: 700, fontSize: 16 }}>{currentUser?.name}</div>
          <div style={{ color: "rgba(255,255,255,0.7)", fontSize: 13 }}>{currentUser?.phone}</div>
          <div style={{ color: "#4ade80", fontSize: 12, marginTop: 2 }}>
            {currentUser?.badge_level || "Seedling"} · {currentUser?.points || 0} pts
          </div>
        </div>
      </div>

      {/* Profile */}
      <Section title="👤 Profile">
        <Field label="Full Name">
          <input style={inputStyle} value={name} onChange={e => setName(e.target.value)} placeholder="Your name" />
        </Field>
        <Field label="Language">
          <select style={inputStyle} value={language} onChange={e => setLanguage(e.target.value)}>
            <option value="en">English</option>
            <option value="ha">Hausa</option>
            <option value="yo">Yoruba</option>
            <option value="ig">Igbo</option>
          </select>
        </Field>
        <button onClick={handleSaveProfile} disabled={savingProfile} style={{ padding: "10px 20px", background: "#16a34a", color: "white", border: "none", borderRadius: 9, fontWeight: 600, fontSize: 14, cursor: "pointer", opacity: savingProfile ? 0.6 : 1 }}>
          {savingProfile ? "Saving..." : "Save Profile"}
        </button>
      </Section>

      {/* Email */}
      <Section title="📧 Email for Alerts">
        {!currentUser?.email && (
          <div style={{ background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 8, padding: "10px 12px", fontSize: 13, color: "#92400e", marginBottom: 14 }}>
            ⚠️ No email set — you're missing out on threat alert emails. Add one below.
          </div>
        )}
        <Field label="Email Address">
          <input style={inputStyle} type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" />
        </Field>
        <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 12 }}>
          You'll receive instant email alerts whenever a threat is reported near your farm.
        </div>
        <button onClick={handleSaveEmail} disabled={savingEmail} style={{ padding: "10px 20px", background: "#3b82f6", color: "white", border: "none", borderRadius: 9, fontWeight: 600, fontSize: 14, cursor: "pointer", opacity: savingEmail ? 0.6 : 1 }}>
          {savingEmail ? "Saving..." : email && currentUser?.email === email ? "Email Saved ✓" : "Save Email"}
        </button>
      </Section>

      {/* Password */}
      <Section title="🔒 Change Password">
        <Field label="Current Password">
          <div style={{ position: "relative" }}>
            <input style={inputStyle} type={showPw ? "text" : "password"} value={currentPw} onChange={e => setCurrentPw(e.target.value)} placeholder="Your current password" />
          </div>
        </Field>
        <Field label="New Password">
          <input style={inputStyle} type={showPw ? "text" : "password"} value={newPw} onChange={e => setNewPw(e.target.value)} placeholder="At least 6 characters" />
        </Field>
        <Field label="Confirm New Password">
          <input style={inputStyle} type={showPw ? "text" : "password"} value={confirmPw} onChange={e => setConfirmPw(e.target.value)} placeholder="Repeat new password" />
        </Field>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
          <input type="checkbox" id="showpw" checked={showPw} onChange={e => setShowPw(e.target.checked)} />
          <label htmlFor="showpw" style={{ fontSize: 13, color: "#6b7280", cursor: "pointer" }}>Show passwords</label>
        </div>
        <button onClick={handleChangePassword} disabled={savingPw} style={{ padding: "10px 20px", background: "#dc2626", color: "white", border: "none", borderRadius: 9, fontWeight: 600, fontSize: 14, cursor: "pointer", opacity: savingPw ? 0.6 : 1 }}>
          {savingPw ? "Updating..." : "Change Password"}
        </button>
      </Section>

      {/* Notification info */}
      <Section title="🔔 Notification Channels">
        {[
          { icon: "🔔", label: "In-App Alerts", status: "Active", color: "#7c3aed" },
          { icon: "📱", label: "SMS Alerts", status: "Active (mock)", color: "#16a34a" },
          { icon: "📧", label: "Email Alerts", status: email ? "Active" : "Add email above", color: email ? "#3b82f6" : "#9ca3af" },
        ].map(n => (
          <div key={n.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid #f3f4f6" }}>
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <span style={{ fontSize: 18 }}>{n.icon}</span>
              <span style={{ fontSize: 14, color: "#374151" }}>{n.label}</span>
            </div>
            <span style={{ fontSize: 12, fontWeight: 600, color: n.color }}>{n.status}</span>
          </div>
        ))}
      </Section>

      <Toast {...(toast || {})} />
    </div>
  );
}
