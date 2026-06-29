/**
 * TableFire LOCAL SERVER
 * Run this on a mini PC or laptop inside the restaurant.
 * All tablets connect via WiFi: http://192.168.1.100:8787
 * No internet needed — data stored in local JSON file.
 *
 * Setup:
 *   1. Install Node.js on your mini PC
 *   2. Run: node server_local.js
 *   3. All tablets point to: http://YOUR_LOCAL_IP:8787
 *
 * Find your local IP:
 *   Windows: ipconfig → IPv4 Address
 *   Mac/Linux: ifconfig | grep inet
 */

import express from 'express';
import cors from 'cors';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_FILE = path.join(__dirname, 'tablefire_local_data.json');
const PORT = process.env.PORT || 8787;

// ── Local file storage ────────────────────────────────────
function readAll() {
  try {
    if (fs.existsSync(DATA_FILE)) return JSON.parse(fs.readFileSync(DATA_FILE,'utf8'));
  } catch {}
  return {};
}
function writeAll(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
}
async function dbGet(key) { return readAll()[key] ?? null; }
async function dbSet(key, value) {
  const all = readAll(); all[key] = value; writeAll(all);
}
async function dbDelete(key) {
  const all = readAll(); delete all[key]; writeAll(all);
}

const app = express();
app.use(cors({ origin:'*' }));
app.use(express.json());

// ── Health check ──────────────────────────────────────────
app.get('/health', (req,res) => {
  res.json({ ok:true, mode:'local', time:new Date().toISOString() });
});

// ── State endpoints (same API as cloud server) ────────────
app.get('/state/:key', async (req,res) => {
  const val = await dbGet(decodeURIComponent(req.params.key));
  res.json({ value: val });
});

app.put('/state/:key', async (req,res) => {
  await dbSet(decodeURIComponent(req.params.key), req.body.value);
  res.json({ ok:true });
});

app.delete('/state/:key', async (req,res) => {
  await dbDelete(decodeURIComponent(req.params.key));
  res.json({ ok:true });
});

// ── Customer table status ─────────────────────────────────
app.get('/customer/tables', async (req,res) => {
  const { code } = req.query;
  const cfg = await dbGet(`${code}:config`) || {};
  const tickets = await dbGet(`${code}:tickets`) || [];
  const bills = await dbGet(`${code}:bills`) || [];
  const tableCount = cfg.tableCount || 8;

  const tables = Array.from({length:tableCount},(_,i)=>({
    number: i+1,
    occupied: tickets.some(t=>t.table===(i+1) && t.status!=='paid'),
    booked: false,
    available: !tickets.some(t=>t.table===(i+1) && t.status!=='paid'),
  }));
  res.json(tables);
});

// ── Customer orders ───────────────────────────────────────
app.post('/customer/orders', async (req,res) => {
  const { code, table, items, customerName } = req.body;
  const menu = await dbGet(`${code}:menu`) || [];
  const tickets = await dbGet(`${code}:tickets`) || [];
  const bills = await dbGet(`${code}:bills`) || [];

  const newTickets = [];
  const kitchenItems = items.filter(i=>{
    const m = menu.find(m=>m.id===i.menuId);
    return !m || m.station!=='bar';
  });
  const barItems = items.filter(i=>{
    const m = menu.find(m=>m.id===i.menuId);
    return m?.station==='bar';
  });

  if (kitchenItems.length) {
    newTickets.push({
      id: Date.now(), table, station:'kitchen', status:'new',
      items: kitchenItems.map(i=>({
        ...i, name: menu.find(m=>m.id===i.menuId)?.name || i.menuId
      })),
      createdAt: new Date().toISOString(), customerName
    });
  }
  if (barItems.length) {
    newTickets.push({
      id: Date.now()+1, table, station:'bar', status:'new',
      items: barItems.map(i=>({
        ...i, name: menu.find(m=>m.id===i.menuId)?.name || i.menuId
      })),
      createdAt: new Date().toISOString(), customerName
    });
  }

  const allTickets = [...tickets, ...newTickets];
  await dbSet(`${code}:tickets`, allTickets);

  // Create/update bill
  const billLines = items.map(i=>{
    const m = menu.find(m=>m.id===i.menuId);
    return { menuId:i.menuId, name:m?.name||'Item', price:m?.price||0, qty:i.qty };
  });
  const existingBill = bills.find(b=>b.table===table && b.status==='open');
  if (existingBill) {
    existingBill.lines.push(...billLines);
    await dbSet(`${code}:bills`, bills);
  } else {
    const newBill = { id:Date.now()+2, table, status:'open',
      lines:billLines, createdAt:new Date().toISOString(), customerName };
    await dbSet(`${code}:bills`, [...bills, newBill]);
  }

  res.json({ ok:true, tickets:newTickets });
});

// ── Restaurant login (local mode uses simple code check) ──
app.post('/restaurant/login', async (req,res) => {
  const { email, licenseKey } = req.body;
  const platform = await dbGet('__platform__') || { tenants:{} };
  const tenant = Object.values(platform.tenants||{}).find(
    t => t.email===email && t.licenseKey===licenseKey && t.active
  );
  if (!tenant) return res.status(401).json({ error:'Invalid credentials' });
  const token = crypto.randomBytes(16).toString('hex');
  tenant.sessionToken = token;
  await dbSet('__platform__', platform);
  res.json({ ok:true, sessionToken:token, restaurantCode:tenant.code, restaurantName:tenant.name });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n🔥 TableFire LOCAL SERVER running`);
  console.log(`📡 Port: ${PORT}`);
  console.log(`💾 Data: ${DATA_FILE}`);
  console.log(`\nAll tablets connect to:`);
  console.log(`  http://YOUR_LOCAL_IP:${PORT}`);
  console.log(`\nFind your IP with: ipconfig (Windows) or ifconfig (Mac/Linux)\n`);
});
