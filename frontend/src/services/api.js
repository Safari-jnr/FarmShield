const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:8000";

export async function apiFetch(path, opts = {}) {
  const token = localStorage.getItem("fs_token");
  const headers = {
    ...(!opts.body || typeof opts.body === "string" ? { "Content-Type": "application/json" } : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(opts.headers || {}),
  };
  const res = await fetch(API_BASE + path, { ...opts, headers });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || `Request failed: ${res.status}`);
  }
  return res.json();
}

export function getLocation() {
  return new Promise((resolve) => {
    if (!navigator.geolocation) return resolve({ lat: 9.0765, lon: 7.3986 });
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
      () => resolve({ lat: 9.0765, lon: 7.3986 })
    );
  });
}

export function saveSession(token, user) {
  localStorage.setItem("fs_token", token);
  localStorage.setItem("fs_user", JSON.stringify(user));
}

export function clearSession() {
  localStorage.removeItem("fs_token");
  localStorage.removeItem("fs_user");
}

export function getUser() {
  try {
    return JSON.parse(localStorage.getItem("fs_user")) || { name: "Farmer" };
  } catch {
    return { name: "Farmer" };
  }
}

export function isLoggedIn() {
  return !!localStorage.getItem("fs_token");
}