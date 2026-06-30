// Storage client — talks to the backend
// AUTO-FALLBACK: tries cloud first, falls back to local server if cloud unreachable
// All keys are automatically prefixed with the restaurant code
// so each restaurant's data is completely isolated.
//
// © 2026 TableFire. All rights reserved.

const CLOUD_API = import.meta.env.VITE_API_BASE || 'https://restaurant-pos-j0sb.onrender.com';
const TIMEOUT_MS = 4000;

let _restaurantCode = '';
let _activeAPI = CLOUD_API;
let _mode = 'cloud'; // 'cloud' | 'local'
let _lastCheck = 0;
const CHECK_EVERY_MS = 20000; // re-check best endpoint every 20s

export function setRestaurantCode(code) {
  _restaurantCode = code;
}
export function getRestaurantCode() {
  return _restaurantCode;
}
export function getCurrentMode() {
  return _mode;
}

function getLocalAPI() {
  try {
    const ip = localStorage.getItem('tf_local_server_ip');
    return ip ? `http://${ip}` : null;
  } catch { return null; }
}
export function setLocalServerIP(ip) {
  try { localStorage.setItem('tf_local_server_ip', ip); } catch {}
}
export function getLocalServerIP() {
  try { return localStorage.getItem('tf_local_server_ip') || ''; } catch { return ''; }
}

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

// Picks the best endpoint: tries cloud, falls back to local if cloud fails.
// Caches the result for CHECK_EVERY_MS to avoid checking on every single call.
async function getBestAPI() {
  const now = Date.now();
  if (now - _lastCheck < CHECK_EVERY_MS) return _activeAPI;

  try {
    const res = await fetchWithTimeout(`${CLOUD_API}/health`, {}, 3000);
    if (res.ok) {
      _activeAPI = CLOUD_API;
      _mode = 'cloud';
      _lastCheck = now;
      return _activeAPI;
    }
  } catch {}

  const localAPI = getLocalAPI();
  if (localAPI) {
    try {
      const res = await fetchWithTimeout(`${localAPI}/health`, {}, 2000);
      if (res.ok) {
        _activeAPI = localAPI;
        _mode = 'local';
        _lastCheck = now;
        return _activeAPI;
      }
    } catch {}
  }

  // Nothing reachable — keep last known active API, don't update _lastCheck
  // so we retry sooner next time
  return _activeAPI;
}

export async function checkConnection() {
  try {
    const api = await getBestAPI();
    const res = await fetchWithTimeout(`${api}/health`, {}, 3000);
    return res.ok;
  } catch {
    return false;
  }
}

export async function loadKey(key, fallback) {
  try {
    const api = await getBestAPI();
    const res = await fetchWithTimeout(`${api}/state/${encodeURIComponent(scopedKey(key))}`, {}, TIMEOUT_MS);
    if (res.status === 404) return fallback;
    if (!res.ok) throw new Error(`Load failed: ${res.status}`);
    const data = await res.json();
    return data.value ?? fallback;
  } catch (e) {
    console.error('loadKey failed', key, e.message);
    return fallback;
  }
}

export async function saveKey(key, value) {
  try {
    const api = await getBestAPI();
    const res = await fetchWithTimeout(
      `${api}/state/${encodeURIComponent(scopedKey(key))}`,
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ value }),
      },
      TIMEOUT_MS
    );
    if (!res.ok) throw new Error(`Save failed: ${res.status}`);
  } catch (e) {
    console.error('saveKey failed', key, e.message);
  }
}

export async function verifyRestaurantCode(code) {
  // Try cloud first, then local — login should work from either
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
