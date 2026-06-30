// Storage client — talks to the backend
// AUTO-FALLBACK: uses cloud by default, falls back to local server only on failure
// All keys are automatically prefixed with the restaurant code
//
// © 2026 TableFire. All rights reserved.

const CLOUD_API = import.meta.env.VITE_API_BASE || 'https://restaurant-pos-j0sb.onrender.com';
const TIMEOUT_MS = 6000;

let _restaurantCode = '';
let _activeAPI = CLOUD_API;
let _mode = 'cloud'; // 'cloud' | 'local'

export function setRestaurantCode(code) { _restaurantCode = code; }
export function getRestaurantCode() { return _restaurantCode; }
export function getCurrentMode() { return _mode; }

function getLocalAPI() {
  try {
    const ip = localStorage.getItem('tf_local_server_ip');
    return ip ? `http://${ip}` : null;
  } catch { return null; }
}
export function setLocalServerIP(ip) { try { localStorage.setItem('tf_local_server_ip', ip); } catch {} }
export function getLocalServerIP() { try { return localStorage.getItem('tf_local_server_ip') || ''; } catch { return ''; } }

function scopedKey(key) {
  const code = _restaurantCode || (() => {
    try { return localStorage.getItem('tf_restaurant_code') || ''; } catch { return ''; }
  })();
  return code ? `${code}:${key}` : key;
}

function getDeviceId() {
  try {
    let id = localStorage.getItem('thab_device_id');
    if (!id) {
      id = 'dev_' + Math.random().toString(36).slice(2) + Date.now().toString(36);
      localStorage.setItem('thab_device_id', id);
    }
    return id;
  } catch { return 'unknown'; }
}

async function fetchWithTimeout(url, opts = {}, ms = TIMEOUT_MS) {
  const ctrl = new AbortController();
  const tid = setTimeout(() => ctrl.abort(), ms);
  try {
    const res = await fetch(url, { ...opts, signal: ctrl.signal });
    clearTimeout(tid);
    return res;
  } catch (e) {
    clearTimeout(tid);
    throw e;
  }
}

// Try the local server as a fallback. Only called when the active API fails.
async function trySwitchToLocal() {
  const localAPI = getLocalAPI();
  if (!localAPI || localAPI === _activeAPI) return false;
  try {
    const res = await fetchWithTimeout(`${localAPI}/health`, {}, 2500);
    if (res.ok) {
      _activeAPI = localAPI;
      _mode = 'local';
      return true;
    }
  } catch {}
  return false;
}

// Try switching back to cloud. Only called periodically when on local mode.
async function trySwitchToCloud() {
  if (_activeAPI === CLOUD_API) return true;
  try {
    const res = await fetchWithTimeout(`${CLOUD_API}/health`, {}, 2500);
    if (res.ok) {
      _activeAPI = CLOUD_API;
      _mode = 'cloud';
      return true;
    }
  } catch {}
  return false;
}

export async function checkConnection() {
  // If currently on local, periodically try to recover to cloud (preferred)
  if (_mode === 'local') await trySwitchToCloud();
  try {
    const res = await fetchWithTimeout(`${_activeAPI}/health`, {}, 3000);
    if (res.ok) return true;
  } catch {}
  // Active API failed — try falling back to local
  const switched = await trySwitchToLocal();
  if (switched) return true;
  return false;
}

export async function loadKey(key, fallback) {
  try {
    const res = await fetchWithTimeout(`${_activeAPI}/state/${encodeURIComponent(scopedKey(key))}`, {}, TIMEOUT_MS);
    if (res.status === 404) return fallback;
    if (!res.ok) throw new Error(`Load failed: ${res.status}`);
    const data = await res.json();
    return data.value ?? fallback;
  } catch (e) {
    // Primary failed — try local fallback once, then retry this request
    const switched = await trySwitchToLocal();
    if (switched) {
      try {
        const res2 = await fetchWithTimeout(`${_activeAPI}/state/${encodeURIComponent(scopedKey(key))}`, {}, TIMEOUT_MS);
        if (res2.ok) { const data2 = await res2.json(); return data2.value ?? fallback; }
      } catch {}
    }
    console.error('loadKey failed', key, e.message);
    return fallback;
  }
}

export async function saveKey(key, value) {
  try {
    const res = await fetchWithTimeout(
      `${_activeAPI}/state/${encodeURIComponent(scopedKey(key))}`,
      { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ value }) },
      TIMEOUT_MS
    );
    if (!res.ok) throw new Error(`Save failed: ${res.status}`);
  } catch (e) {
    const switched = await trySwitchToLocal();
    if (switched) {
      try {
        await fetchWithTimeout(
          `${_activeAPI}/state/${encodeURIComponent(scopedKey(key))}`,
          { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ value }) },
          TIMEOUT_MS
        );
        return;
      } catch {}
    }
    console.error('saveKey failed', key, e.message);
  }
}

export async function verifyRestaurantCode(code) {
  const apis = [CLOUD_API];
  const localAPI = getLocalAPI();
  if (localAPI) apis.push(localAPI);

  let lastErr;
  for (const api of apis) {
    try {
      const res = await fetchWithTimeout(`${api}/restaurant/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, deviceId: getDeviceId() }),
      }, TIMEOUT_MS);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Invalid code');
      if (api !== CLOUD_API) { _activeAPI = api; _mode = 'local'; }
      return data;
    } catch (e) { lastErr = e; }
  }
  throw lastErr;
}
