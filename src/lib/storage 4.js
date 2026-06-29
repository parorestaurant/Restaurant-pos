// Storage client — talks to the backend
// AUTO-FALLBACK: tries cloud first, then local server if cloud unreachable
// All keys are automatically prefixed with the restaurant code
//
// © 2026 TableFire. All rights reserved.

const CLOUD_API   = import.meta.env.VITE_API_BASE || 'https://restaurant-pos-j0sb.onrender.com';
const LOCAL_KEY   = 'tf_local_server_ip';  // stored in localStorage by owner
const TIMEOUT_MS  = 4000; // 4 seconds before giving up on cloud

// ── Active endpoint (starts as cloud, auto-switches) ─────
let _activeAPI  = CLOUD_API;
let _mode       = 'cloud';   // 'cloud' | 'local'
let _lastCheck  = 0;
let _checkEvery = 30000;     // re-check every 30 seconds

let _restaurantCode = '';

// ── Mode change listeners ─────────────────────────────────
const _listeners = [];
export function onModeChange(fn) { _listeners.push(fn); }
function notifyMode(mode, api) {
  _mode = mode; _activeAPI = api;
  _listeners.forEach(fn => fn(mode, api));
}

// ── Get local server IP from localStorage ─────────────────
function getLocalAPI() {
  try {
    const ip = localStorage.getItem(LOCAL_KEY);
    return ip ? `http://${ip}` : null;
  } catch { return null; }
}

export function setLocalServerIP(ip) {
  try { localStorage.setItem(LOCAL_KEY, ip); } catch {}
}

export function getLocalServerIP() {
  try { return localStorage.getItem(LOCAL_KEY) || ''; } catch { return ''; }
}

export function getCurrentMode() { return _mode; }
export function getCurrentAPI()  { return _activeAPI; }

// ── Fetch with timeout ────────────────────────────────────
async function fetchWithTimeout(url, opts={}, ms=TIMEOUT_MS) {
  const ctrl = new AbortController();
  const tid = setTimeout(() => ctrl.abort(), ms);
  try {
    const res = await fetch(url, { ...opts, signal:ctrl.signal });
    clearTimeout(tid);
    return res;
  } catch(e) {
    clearTimeout(tid);
    throw e;
  }
}

// ── Auto-detect best endpoint ─────────────────────────────
async function detectBestEndpoint() {
  const now = Date.now();
  if (now - _lastCheck < _checkEvery) return _activeAPI;
  _lastCheck = now;

  // 1. Try cloud first
  try {
    const res = await fetchWithTimeout(`${CLOUD_API}/health`, {}, 4000);
    if (res.ok) {
      if (_mode !== 'cloud') {
        console.log('🌐 TableFire: Cloud server restored — switching back');
        notifyMode('cloud', CLOUD_API);
      }
      return CLOUD_API;
    }
  } catch {}

  // 2. Cloud failed — try local server
  const localAPI = getLocalAPI();
  if (localAPI) {
    try {
      const res = await fetchWithTimeout(`${localAPI}/health`, {}, 2000);
      if (res.ok) {
        if (_mode !== 'local') {
          console.log('🖥️ TableFire: Switched to local server —', localAPI);
          notifyMode('local', localAPI);
        }
        return localAPI;
      }
    } catch {}
  }

  // 3. Both failed — keep current
  console.warn('⚠️ TableFire: No server reachable — using last known:', _activeAPI);
  return _activeAPI;
}

// ── Restaurant code scoping ───────────────────────────────
export function setRestaurantCode(code) { _restaurantCode = code; }
export function getRestaurantCode()     { return _restaurantCode; }

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

// ── Connection check (auto-detects best endpoint) ─────────
export async function checkConnection() {
  try {
    const api = await detectBestEndpoint();
    const res = await fetchWithTimeout(`${api}/health`, {}, 3000);
    return res.ok;
  } catch {
    return false;
  }
}

// ── Core load/save ────────────────────────────────────────
export async function loadKey(key, fallback) {
  try {
    const api = await detectBestEndpoint();
    const res = await fetchWithTimeout(
      `${api}/state/${encodeURIComponent(scopedKey(key))}`, {}, TIMEOUT_MS
    );
    if (res.status === 404) return fallback;
    if (!res.ok) throw new Error(`Load failed: ${res.status}`);
    const data = await res.json();
    return data.value ?? fallback;
  } catch(e) {
    console.error('loadKey failed', key, e);
    return fallback;
  }
}

export async function saveKey(key, value) {
  try {
    const api = await detectBestEndpoint();
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
  } catch(e) {
    console.error('saveKey failed', key, e);
  }
}

// ── Restaurant login (tries cloud then local) ─────────────
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
      // If local worked, switch to local mode
      if (api !== CLOUD_API) notifyMode('local', api);
      return data;
    } catch(e) { lastErr = e; }
  }
  throw lastErr;
}
