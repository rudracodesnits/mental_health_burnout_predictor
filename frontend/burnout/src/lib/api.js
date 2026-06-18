// src/lib/api.js
// Centralized API client — reads backend URL from env variable.
// Also acts as a telemetry recorder — every prediction is logged
// to localStorage 'wc-admin-log' for the admin analytics dashboard.

const API_BASE = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000';

// Stable session ID for this browser tab
const SESSION_ID = (() => {
  let id = sessionStorage.getItem('wc-session-id');
  if (!id) {
    id = `sess_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
    sessionStorage.setItem('wc-session-id', id);
  }
  return id;
})();

/** Append a prediction record to the admin log (max 500 entries). */
function recordAdminLog(entry) {
  try {
    const raw  = localStorage.getItem('wc-admin-log');
    const log  = raw ? JSON.parse(raw) : [];
    log.unshift(entry);                      // newest first
    localStorage.setItem('wc-admin-log', JSON.stringify(log.slice(0, 500)));
  } catch {
    // Never let logging break the main prediction flow
  }
}

/**
 * POST /predict
 * @param {Object} formData     - The 14-field burnout assessment form data
 * @param {Object} [meta={}]    - Optional metadata (userEmail, userName, mode)
 * @returns {Promise<{predicted_level: string, predicted_score: number}>}
 */
export async function predictBurnout(formData, meta = {}) {
  const startedAt = Date.now();

  const response = await fetch(`${API_BASE}/predict`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(formData),
  });

  if (!response.ok) {
    const text = await response.text();
    // Log failed attempts too
    recordAdminLog({
      id:        `${SESSION_ID}_${startedAt}`,
      sessionId: SESSION_ID,
      timestamp: new Date().toISOString(),
      durationMs: Date.now() - startedAt,
      status:    'error',
      httpStatus: response.status,
      mode:      meta.mode || 'guest',
      userEmail: meta.userEmail || null,
      userName:  meta.userName  || null,
      inputs:    formData,
      result:    null,
    });
    throw new Error(`Prediction failed (${response.status}): ${text}`);
  }

  const result = await response.json();

  // Record successful prediction
  recordAdminLog({
    id:         `${SESSION_ID}_${startedAt}`,
    sessionId:  SESSION_ID,
    timestamp:  new Date().toISOString(),
    durationMs: Date.now() - startedAt,
    status:     'success',
    httpStatus: 200,
    mode:       meta.mode || 'guest',
    userEmail:  meta.userEmail || null,
    userName:   meta.userName  || null,
    inputs:     formData,
    result: {
      level: result.predicted_level,
      score: result.predicted_score,
    },
  });

  return result;
}

/** Check if the backend is reachable (used by Admin health monitor). */
export async function checkBackendHealth() {
  const start = Date.now();
  try {
    // A lightweight OPTIONS/HEAD isn't supported — use a tiny POST with dummy data
    const res = await fetch(`${API_BASE}/predict`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        Family_History: 0, Social_Support: 0.5, Counseling_Service_Use: 0,
        Extracurricular_Involvement: 0.5, Semester_Credit_Load: 14,
        Sleep_Quality: 0.5, Physical_Activity: 0.5, Stress_Level: 0.5,
        Financial_Stress: 0.5, Substance_Use: 0.5, Diet_Quality: 0.5,
        Depression_Score: 0.5, Anxiety_Score: 0.5, Chronic_Illness: 0,
      }),
      signal: AbortSignal.timeout(4000),
    });
    return { online: res.ok, latencyMs: Date.now() - start, status: res.status };
  } catch {
    return { online: false, latencyMs: Date.now() - start, status: 0 };
  }
}

/** Read the full admin log from localStorage. */
export function getAdminLog() {
  try {
    const raw = localStorage.getItem('wc-admin-log');
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/** Clear the admin log. */
export function clearAdminLog() {
  localStorage.removeItem('wc-admin-log');
}

