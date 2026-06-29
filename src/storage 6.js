// Storage client — talks to the backend
// All keys are automatically prefixed with the restaurant code
// © 2026 TableFire. All rights reserved.

const API_BASE = import.meta.env.VITE_API_BASE || 'https://restaurant-pos-j0sb.onrender.com';

let _restaurantCode = '';

export function setRestaurantCode(code) {
  _restaurantCode = code;
}

export function getRestaurantCode() {
  return _restaurantCode;
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

export async function checkConnection() {
  try {
    const res = await fetch(`${API_BASE}/health`);
    return res.ok;
  } catch {
    return false;
  }
}

export async function loadKey(key, fallback) {
  try {
    const res = await fetch(`${API_BASE}/state/${encodeURIComponent(scopedKey(key))}`);
    if (res.status === 404) return fallback;
    if (!res.ok) throw new Error(`Load failed: ${res.status}`);
    const data = await res.json();
    return data.value ?? fallback;
  } catch (e) {
    console.error('loadKey failed', key, e);
    return fallback;
  }
}

export async function saveKey(key, value) {
  try {
    const res = await fetch(`${API_BASE}/state/${encodeURIComponent(scopedKey(key))}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ value }),
    });
    if (!res.ok) throw new Error(`Save failed: ${res.status}`);
  } catch (e) {
    console.error('saveKey failed', key, e);
  }
}

export async function verifyRestaurantCode(code) {
  try {
    const res = await fetch(`${API_BASE}/restaurant/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, deviceId: getDeviceId() }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Invalid code');
    return data;
  } catch (e) {
    throw e;
  }
}
