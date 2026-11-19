/**
 * Crop Hydro-Precision — Authentication Management
 * - Token & user state management in localStorage
 * - Route guards (requireAuth, redirectIfLoggedIn)
 * - Logout workflow
 */

import { api } from "./api.js";

const TOKEN_KEY = "access_token";
const REFRESH_KEY = "refresh_token";
const USER_KEY = "user";

export function getAccessToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function getRefreshToken() {
  return localStorage.getItem(REFRESH_KEY);
}

export function getUser() {
  const userStr = localStorage.getItem(USER_KEY);
  if (!userStr) return null;
  try {
    return JSON.parse(userStr);
  } catch (e) {
    return null;
  }
}

export function setUser(user) {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function setAuth(tokens, user) {
  if (tokens.access) localStorage.setItem(TOKEN_KEY, tokens.access);
  if (tokens.refresh) localStorage.setItem(REFRESH_KEY, tokens.refresh);
  if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function isAuthenticated() {
  return Boolean(getAccessToken());
}

export function clearAuth() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_KEY);
  localStorage.removeItem(USER_KEY);
}

/**
 * Route guard for protected pages (dashboard.html, history.html, profile.html)
 * Call at the very top of page script.
 */
export function requireAuth() {
  if (!isAuthenticated()) {
    const next = encodeURIComponent(window.location.pathname + window.location.search);
    window.location.replace(`login.html?next=${next}`);
    return false;
  }
  return true;
}

/**
 * Route guard for auth pages (login.html, register.html)
 * Redirects already logged-in users to dashboard.html or the 'next' parameter.
 */
export function redirectIfLoggedIn() {
  if (isAuthenticated()) {
    const urlParams = new URLSearchParams(window.location.search);
    const next = urlParams.get("next") || "dashboard.html";
    window.location.replace(next);
    return true;
  }
  return false;
}

/**
 * Logout workflow
 * Blacklists the refresh token on the server, then clears local state.
 */
export async function logout() {
  const refreshToken = getRefreshToken();
  if (refreshToken) {
    try {
      await api("/auth/logout/", {
        method: "POST",
        body: { refresh: refreshToken },
        auth: true,
      });
    } catch (e) {
      console.warn("Logout endpoint call failed, clearing local tokens anyway:", e);
    }
  }
  clearAuth();
  window.location.href = "login.html";
}

/**
 * Get display initials from user's full name (e.g. "Arun Kumar" -> "AK")
 */
export function getInitials(name) {
  if (!name) return "U";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}
