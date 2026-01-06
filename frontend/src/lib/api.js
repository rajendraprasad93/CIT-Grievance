/**
 * API utility functions for authenticated fetch calls
 */

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

/**
 * Make an authenticated API call
 * Includes session token in Authorization header
 */
export async function apiFetch(endpoint, options = {}) {
  const url = `${BACKEND_URL}${endpoint}`;

  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  // Add session token from localStorage if available
  const sessionToken = localStorage.getItem("session_token");
  if (sessionToken) {
    headers["Authorization"] = `Bearer ${sessionToken}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

/**
 * Make a GET request
 */
export function apiGet(endpoint) {
  return apiFetch(endpoint, { method: "GET" });
}

/**
 * Make a POST request
 */
export function apiPost(endpoint, data) {
  return apiFetch(endpoint, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

/**
 * Make a PUT request
 */
export function apiPut(endpoint, data) {
  return apiFetch(endpoint, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

/**
 * Make a DELETE request
 */
export function apiDelete(endpoint) {
  return apiFetch(endpoint, { method: "DELETE" });
}
