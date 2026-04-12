const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:8000";

// Simple in-memory cache for GET requests
const cache = new Map();
const CACHE_TTL = 30000; // 30 seconds

// These paths should never be cached (always fresh)
const NO_CACHE_PATHS = ["/notifications/history", "/reports/my-reports", "/admin/stats"];

export async function apiFetch(path, opts = {}) {
  const isGet = !opts.method || opts.method === "GET";
  const shouldCache = isGet && !NO_CACHE_PATHS.some(p => path.startsWith(p));

  // Return cached response for GET requests
  if (shouldCache && cache.has(path)) {
    const { data, ts } = cache.get(path);
    if (Date.now() - ts < CACHE_TTL) return data;
  }

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
  const data = await res.json();
  if (shouldCache) cache.set(path, { data, ts: Date.now() });
  return data;
}

export function invalidateCache(path) {
  cache.delete(path);
}

export function getLocation() {
  return new Promise((resolve) => {
    if (!navigator.geolocation) return resolve({ lat: 9.0765, lon: 7.3986 });
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
      () => resolve({ lat: 9.0765, lon: 7.3986 }),
      { timeout: 5000 }
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
  cache.clear();
}

export function getUser() {
  try {
    const u = JSON.parse(localStorage.getItem("fs_user"));
    if (!u) return { name: "Farmer" };
    // Extract real ID from token if user.id is missing or stale
    if (!u.id) {
      const token = localStorage.getItem("fs_token");
      const match = token?.match(/token-(\d+)/);
      if (match) u.id = parseInt(match[1]);
    }
    return u;
  } catch {
    return { name: "Farmer" };
  }
}

export function isLoggedIn() {
  return !!localStorage.getItem("fs_token");
}

// Keep-alive ping every 10 minutes to prevent Render cold starts
if (typeof window !== "undefined") {
  setInterval(() => {
    fetch(API_BASE + "/health").catch(() => {});
  }, 10 * 60 * 1000);
}
