// Storage client — talks to the backend in /server.
//
// This mirrors the shape of the get/set helpers the app used to call against
// Claude's artifact storage, so the rest of the app (App.jsx) didn't need to
// change. Swap the fetch calls below for Firebase/Supabase/your own API if
// you want a different backend — just keep the same loadKey/saveKey/
// checkConnection function signatures.

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8787';

export async function checkConnection() {
  try {
    const res = await fetch(`${API_BASE}/health`);
    return res.ok;
  } catch (e) {
    return false;
  }
}

export async function loadKey(key, fallback) {
  try {
    const res = await fetch(`${API_BASE}/state/${encodeURIComponent(key)}`);
    if (res.status === 404) return fallback;
    if (!res.ok) throw new Error(`Load failed: ${res.status}`);
    const data = await res.json();
    return data.value;
  } catch (e) {
    console.error('loadKey failed', key, e);
    return fallback;
  }
}

export async function saveKey(key, value) {
  try {
    const res = await fetch(`${API_BASE}/state/${encodeURIComponent(key)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ value }),
    });
    if (!res.ok) throw new Error(`Save failed: ${res.status}`);
  } catch (e) {
    console.error('saveKey failed', key, e);
  }
}
