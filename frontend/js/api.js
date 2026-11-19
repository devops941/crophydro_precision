/**
 * Crop Hydro-Precision — Unified API Client
 * - Handles JSON serialization
 * - Injects JWT Bearer token
 * - Mutex-protected auto-refresh on 401
 * - Standardized ApiError handling
 */

import { API_BASE_URL } from "./config.js";

export class ApiError extends Error {
  constructor(message, status = 0, details = null) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.details = details; // field-level details object: { field: ["msg", ...] }
  }
}

// Single in-flight refresh promise to share across concurrent 401 requests
let refreshPromise = null;

/**
 * Perform an authenticated or unauthenticated API request
 * @param {string} path - Endpoint path (e.g., "/crops/" or "/calculate/")
 * @param {object} options - { method = "GET", body = null, auth = true }
 * @returns {Promise<any>}
 */
export async function api(path, { method = "GET", body = null, auth = true } = {}) {
  const url = `${API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;

  const headers = {
    "Accept": "application/json",
  };

  if (body !== null) {
    headers["Content-Type"] = "application/json";
  }

  if (auth) {
    const token = localStorage.getItem("access_token");
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
  }

  const fetchOptions = {
    method,
    headers,
  };

  if (body !== null) {
    fetchOptions.body = JSON.stringify(body);
  }

  let response;
  try {
    response = await fetch(url, fetchOptions);
  } catch (err) {
    // Network failure (server down, CORS blocked, DNS failure)
    throw new ApiError(
      "Server not reachable — is the backend running at " + API_BASE_URL + "?",
      0,
      null
    );
  }

  // Handle 401 Unauthorized with token refresh if auth was requested
  if (response.status === 401 && auth && !path.includes("/auth/refresh/") && !path.includes("/auth/login/")) {
    const refreshToken = localStorage.getItem("refresh_token");

    if (!refreshToken) {
      handleAuthFailure();
      throw new ApiError("Session expired. Please log in again.", 401);
    }

    try {
      if (!refreshPromise) {
        refreshPromise = refreshTokens(refreshToken);
      }
      const newTokens = await refreshPromise;
      refreshPromise = null;

      // Retry the original request with the new access token
      headers["Authorization"] = `Bearer ${newTokens.access}`;
      const retryResponse = await fetch(url, fetchOptions);

      if (!retryResponse.ok) {
        return parseResponseError(retryResponse);
      }

      if (retryResponse.status === 204) {
        return null;
      }
      return await retryResponse.json();
    } catch (refreshErr) {
      refreshPromise = null;
      handleAuthFailure();
      throw new ApiError("Session expired. Please log in again.", 401);
    }
  }

  if (!response.ok) {
    return parseResponseError(response);
  }

  if (response.status === 204) {
    return null;
  }

  return await response.json();
}

/**
 * Call the refresh token endpoint
 */
async function refreshTokens(refreshToken) {
  const res = await fetch(`${API_BASE_URL}/auth/refresh/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Accept": "application/json",
    },
    body: JSON.stringify({ refresh: refreshToken }),
  });

  if (!res.ok) {
    throw new Error("Refresh failed");
  }

  const data = await res.json();
  localStorage.setItem("access_token", data.access);
  if (data.refresh) {
    localStorage.setItem("refresh_token", data.refresh);
  }
  return data;
}

/**
 * Clear auth state and redirect to login page with return parameter
 */
function handleAuthFailure() {
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
  localStorage.removeItem("user");

  const currentPath = window.location.pathname;
  if (!currentPath.endsWith("login.html") && !currentPath.endsWith("register.html")) {
    const next = encodeURIComponent(window.location.pathname + window.location.search);
    window.location.href = `login.html?next=${next}`;
  }
}

/**
 * Standardize error responses to throw ApiError
 */
async function parseResponseError(response) {
  let errorData;
  try {
    errorData = await response.json();
  } catch (e) {
    errorData = { error: `HTTP ${response.status}: ${response.statusText}` };
  }

  const message = errorData.error || errorData.detail || "An unexpected error occurred.";
  const details = errorData.details || null;

  throw new ApiError(message, response.status, details);
}
