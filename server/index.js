import express from 'express';
import cors from 'cors';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

// ── Simple file-based storage (no Supabase needed) ────────
const DATA_FILE = path.join('/tmp', 'tablefire_data.json');

function readAll() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
    }
  } catch {}
  return {};
}

function writeAll(data) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data), 'utf8');
  } catch(e) {
    console.error('writeAll error', e);
  }
}

async function dbGet(key) {
  const all = readAll();
  return all[key] ?? null;
}

async function dbSet(key, value) {
  const all = readAll();
  all[key] = value;
  writeAll(all);
}

// ── Platform data ─────────────────────────────────────────
async function readPlatform() {
  try {
    const data = await dbGet('__platform__');
    return data || { tenants: {}, ownerToken: '', ownerLockedIp: '' };
  } catch {
    return { tenants: {}, ownerToken: '', ownerLockedIp: '' };
  }
}
async function writePlatform(d) {
  await dbSet('__platform__', d);
}

// ── Helpers ───────────────────────────────────────────────
const MASTER_SECRET = process.env.MASTER_SECRET || 'tf_master_changeme';
const OWNER_EMAIL   = process.env.OWNER_EMAIL   || 'tpee00767@gmail.com';
const OWNER_PASS    = process.env.OWNER_PASS    || 'tablefire2026';

function hash(s)    { return crypto.createHash('sha256').update(s + MASTER_SECRET).digest('hex'); }
function newId(p)   { return `${p}-${Date.now()}-${Math.random().toString(36).slice(2,7)}`; }
function newKey()   { return 'TF-' + crypto.randomBytes(12).toString('hex').toUpperCase().match(/.{4}/g).join('-'); }
function getIp(req) { return (req.headers['x-forwarded-for']||'').split(',')[0].trim() || req.ip || 'unknown'; }

function sign(obj)  { return crypto.createHmac('sha256', MASTER_SECRET).update(JSON.stringify(obj)).digest('hex'); }

// ── Default menu ──────────────────────────────────────────
const DEFAULT_MENU = [
  { id:'m1',  name:'Mandu (Korean Dumplings)',      category:'Starters', station:'kitchen', price:8,  image:'', modifierGroups:[], outOfStock:false },
  { id:'m2',  name:'Kimchi Pancake (Kimchijeon)',   category:'Starters', station:'kitchen', price:11, image:'', modifierGroups:[], outOfStock:false },
  { id:'m3',  name:'Korean Fried Chicken Wings',    category:'Starters', station:'kitchen', price:12, image:'', modifierGroups:[], outOfStock:false },
  { id:'m4',  name:'Japchae (Glass Noodles)',       category:'Starters', station:'kitchen', price:10, image:'', modifierGroups:[], outOfStock:false },
  { id:'m5',  name:'Bibimbap',                      category:'Mains',    station:'kitchen', price:15, image:'', modifierGroups:[], outOfStock:false },
  { id:'m6',  name:'Bulgogi (Marinated Beef)',      category:'Mains',    station:'kitchen', price:19, image:'', modifierGroups:[], outOfStock:false },
  { id:'m7',  name:'Kimchi Jjigae (Stew)',          category:'Mains',    station:'kitchen', price:14, image:'', modifierGroups:[], outOfStock:false },
  { id:'m8',  name:'Tteokbokki (Spicy Rice Cakes)', category:'Mains',   station:'kitchen', price:13, image:'', modifierGroups:[], outOfStock:false },
  { id:'m9',  name:'Samgyeopsal (Grilled Pork Belly)', category:'Mains', station:'kitchen', price:22, image:'', modifierGroups:[], outOfStock:false },
  { id:'combo1', name:'Bulgogi Set Combo', category:'Combos', station:'kitchen', price:24, image:'', outOfStock:false, modifierGroups:[
    { id:'spice', name:'Spice Level', required:true,  options:[{id:'mild',label:'Mild',priceDelta:0},{id:'medium',label:'Medium',priceDelta:0},{id:'spicy',label:'Spicy',priceDelta:0}]},
    { id:'side',  name:'Side',        required:true,  options:[{id:'rice',label:'Steamed Rice',priceDelta:0},{id:'japchae',label:'Japchae',priceDelta:0},{id:'salad',label:'Side Salad',priceDelta:0}]},
    { id:'addon', name:'Add-on',      required:false, options:[{id:'extrameat',label:'Extra Bulgogi',priceDelta:4.5},{id:'extrarice',label:'Extra Rice',priceDelta:2}]},
  ]},
  { id:'combo2', name:'Korean Fried Chicken Combo', category:'Combos', station:'kitchen', price:20, image:'', outOfStock:false, modifierGroups:[
    { id:'sauce', name:'Sauce', required:true, options:[{id:'original',label:'Original Crispy',priceDelta:0},{id:'soygarlic',label:'Soy Garlic',priceDelta:0},{id:'gochujang',label:'Spicy Gochujang',priceDelta:0}]},
    { id:'side',  name:'Side',  required:true, options:[{id:'fries',label:'Fries',priceDelta:0},{id:'radish',label:'Pickled Radish',priceDelta:0},{id:'rice2',label:'Steamed Rice',priceDelta:0}]},
  ]},
  { id:'m10', name:'Extra Beef Slices',        category:'Extras',      station:'kitchen', price:8,  image:'', modifierGroups:[], outOfStock:false },
  { id:'m11', name:'Extra Pork Belly',         category:'Extras',      station:'kitchen', price:8,  image:'', modifierGroups:[], outOfStock:false },
  { id:'m18', name:'Extra Chicken',            category:'Extras',      station:'kitchen', price:7,  image:'', modifierGroups:[], outOfStock:false },
  { id:'m19', name:'Extra Lamb',               category:'Extras',      station:'kitchen', price:9,  image:'', modifierGroups:[], outOfStock:false },
  { id:'m12', name:'Soju',                     category:'Drinks', subcategory:'Others',      station:'bar', price:9,  image:'', modifierGroups:[], outOfStock:false },
  { id:'m13', name:'Makgeolli (Rice Wine)',     category:'Drinks', subcategory:'Others',      station:'bar', price:10, image:'', modifierGroups:[], outOfStock:false },
  { id:'m14', name:'Korean Beer (Cass)',        category:'Drinks', subcategory:'Others',      station:'bar', price:7,  image:'', modifierGroups:[], outOfStock:false },
  { id:'m15', name:'Yuzu Soju Cocktail',       category:'Drinks', subcategory:'Cocktails',   station:'bar', price:11, image:'', modifierGroups:[], outOfStock:false },
  { id:'m20', name:'Lychee Soju Cocktail',     category:'Drinks', subcategory:'Cocktails',   station:'bar', price:11, image:'', modifierGroups:[], outOfStock:false },
  { id:'m21', name:'Peach Makgeolli Cocktail', category:'Drinks', subcategory:'Cocktails',   station:'bar', price:12, image:'', modifierGroups:[], outOfStock:false },
  { id:'m16', name:'Barley Tea',               category:'Drinks', subcategory:'Soft Drinks', station:'bar', price:3,  image:'', modifierGroups:[], outOfStock:false },
  { id:'m17', name:'Sikhye (Sweet Rice Drink)',category:'Drinks', subcategory:'Soft Drinks', station:'bar', price:5,  image:'', modifierGroups:[], outOfStock:false },
  { id:'m22', name:'Cola',                     category:'Drinks', subcategory:'Soft Drinks', station:'bar', price:2,  image:'', modifierGroups:[], outOfStock:false },
  { id:'m23', name:'Sparkling Water',          category:'Drinks', subcategory:'Soft Drinks', station:'bar', price:2,  image:'', modifierGroups:[], outOfStock:false },
];

// ── Express setup ─────────────────────────────────────────
const app = express();
app.use(cors());
app.use(express.json({ limit: '15mb' }));

// ── Health ────────────────────────────────────────────────
app.get('/health', async (req, res) => {
  try {
    const test = await fetch(`${SUPABASE_URL}/rest/v1/kv_store?select=key&limit=1`, { headers: SB_HEADERS });
    const stored = await dbGet('menu');
    const needsSync = !stored || !stored.find(i=>i.id==='combo1') || !stored.find(i=>i.subcategory);
    if (needsSync) {
      const custom = stored ? stored.filter(i=>!DEFAULT_MENU.find(d=>d.id===i.id)) : [];
      await dbSet('menu', [...DEFAULT_MENU, ...custom]);
    }
    res.json({ ok: test.ok, db: 'supabase' });
  } catch(e) { res.json({ ok: false, error: e.message }); }
});

// ── Supabase state endpoints (scoped by restaurant code prefix) ──
app.get('/state/:key', async (req, res) => {
  const value = await dbGet(req.params.key);
  if (value === null) {
    const bare = req.params.key.split(':').pop();
    const hasCode = req.params.key.includes(':');
    // Only return defaults for scoped keys (with restaurant code prefix)
    // or unscoped keys (THAB's own data)
    if (bare==='menu')    return res.json({ key:req.params.key, value:DEFAULT_MENU });
    if (bare==='tickets') return res.json({ key:req.params.key, value:[] });
    if (bare==='bills')   return res.json({ key:req.params.key, value:[] });
    if (bare==='calls')   return res.json({ key:req.params.key, value:[] });
    if (bare==='config')  return res.json({ key:req.params.key, value:{} }); // Empty config = default PINs
    if (bare==='tablet_unlocks') return res.json({ key:req.params.key, value:{} });
    return res.status(404).json({ error: 'not found' });
  }
  res.json({ key:req.params.key, value });
});
app.put('/state/:key', async (req, res) => {
  await dbSet(req.params.key, req.body.value);
  res.json({ key:req.params.key, value:req.body.value });
});
app.delete('/state/:key', async (req, res) => {
  await fetch(`${SUPABASE_URL}/rest/v1/kv_store?key=eq.${encodeURIComponent(req.params.key)}`, { method:'DELETE', headers:SB_HEADERS });
  res.json({ deleted:true });
});

// ── Customer public endpoints ──────────────────────────────
app.get('/customer/menu', async (req, res) => {
  const code = req.query.code || '';
  const key  = code ? `${code}:menu` : 'menu';
  const menu = await dbGet(key) || DEFAULT_MENU;
  res.json(menu.filter(i=>!i.outOfStock));
});

app.get('/customer/tables', async (req, res) => {
  const code = req.query.code || '';
  if (!code) return res.json([]);
  const [config, tickets, bills, bookings] = await Promise.all([
    dbGet(`${code}:config`),
    dbGet(`${code}:tickets`),
    dbGet(`${code}:bills`),
    dbGet(`${code}:bookings`),
  ]);
  const tableCount = (config||{}).tableCount || 8;
  const today = new Date().toISOString().slice(0,10);
  const tables = Array.from({ length:tableCount }, (_,i) => {
    const n = i+1;
    const hasActiveTicket = (tickets||[]).some(t =>
      t.table === n && !['served','cancelled'].includes(t.status)
    );
    const hasOpenBill = (bills||[]).some(b =>
      b.table === n && b.status === 'open' && (b.lines||[]).length > 0
    );
    const hasBookingToday = (bookings||[]).some(b =>
      b.date === today && b.status === 'confirmed' &&
      (b.table === n || b.table === String(n))
    );
    return {
      table: n,
      available: !hasActiveTicket && !hasOpenBill && !hasBookingToday,
      booked: hasBookingToday,
      occupied: hasActiveTicket || hasOpenBill,
    };
  });
  res.json(tables);
});

// ── Restaurant tenant login (email + one-time license key) ──
app.post('/restaurant/login', async (req, res) => {
  const { email, licenseKey, deviceId } = req.body;
  if (!email || !licenseKey) return res.status(400).json({ error: 'Email and license key required' });

  const data = await readPlatform();
  const tenant = Object.values(data.tenants||{}).find(
    t => t.email.toLowerCase()===email.toLowerCase() && t.licenseKey===licenseKey
  );

  if (!tenant) return res.status(401).json({ error: 'Invalid email or license key.' });
  if (!tenant.active) return res.status(401).json({ error: 'Your subscription is inactive. Contact TableFire support.' });
  if (Date.now() > tenant.expiresAt) return res.status(401).json({ error: 'Your subscription has expired. Please renew.' });

  // One-time key check — if already used, verify device
  if (tenant.keyUsed) {
    if (deviceId !== tenant.lockedDeviceId) {
      return res.status(401).json({ error: 'This license key has already been activated on another device. Contact TableFire to reset.' });
    }
  } else {
    // First use — burn the key, lock to this device and IP
    data.tenants[tenant.id].keyUsed = true;
    data.tenants[tenant.id].lockedDeviceId = deviceId;
    data.tenants[tenant.id].lockedIp = getIp(req);
    data.tenants[tenant.id].activatedAt = Date.now();
  }

  // Issue a session token locked to this specific device
  const sessionToken = crypto.randomBytes(32).toString('hex');
  // Store session tokens per device (array) so multiple devices can have separate sessions
  if (!data.tenants[tenant.id].deviceSessions) data.tenants[tenant.id].deviceSessions = {};
  data.tenants[tenant.id].deviceSessions[deviceId] = sessionToken;
  // Keep backwards compat
  data.tenants[tenant.id].sessionToken = sessionToken;
  data.tenants[tenant.id].lastCheckin = Date.now();
  await writePlatform(data);

  res.json({
    sessionToken,
    restaurantCode: tenant.code || tenant.id,
    restaurantName: tenant.name,
    plan: tenant.plan,
    daysLeft: Math.ceil((tenant.expiresAt - Date.now()) / 86400000),
  });
});

// Verify session token - strict device locking
app.post('/restaurant/verify-session', async (req, res) => {
  const { sessionToken, deviceId } = req.body;
  if (!sessionToken || !deviceId) return res.json({ valid: false, reason: 'Missing token or device' });

  const data = await readPlatform();

  // Find tenant where this device has this session token
  const tenant = Object.values(data.tenants||{}).find(t => {
    // Check device-specific sessions first
    if (t.deviceSessions && t.deviceSessions[deviceId] === sessionToken) return true;
    // Fallback to legacy single session (same device)
    return t.sessionToken === sessionToken && t.lockedDeviceId === deviceId;
  });

  if (!tenant) {
    console.warn(`Session rejected: token=${sessionToken.slice(0,8)}... device=${deviceId.slice(0,12)}...`);
    return res.json({ valid: false, reason: 'Wrong device' });
  }
  if (!tenant.active) return res.json({ valid: false, reason: 'Subscription inactive' });
  if (Date.now() > tenant.expiresAt) return res.json({ valid: false, reason: 'Subscription expired' });

  res.json({
    valid: true,
    restaurantCode: tenant.code || tenant.id,
    restaurantName: tenant.name,
    plan: tenant.plan,
    daysLeft: Math.ceil((tenant.expiresAt - Date.now()) / 86400000),
  });
});

// Debug — check env vars are loaded (remove after fixing)
app.get('/debug/env', (req, res) => {
  res.json({
    hasEmail: !!OWNER_EMAIL && OWNER_EMAIL !== 'your@email.com',
    hasPass: !!OWNER_PASS && OWNER_PASS !== 'changeme',
    emailPrefix: OWNER_EMAIL?.slice(0,4) + '...',
  });
});

// ── TableFire owner dashboard auth ────────────────────────
app.post('/platform/login', async (req, res) => {
  const { email, password } = req.body;
  console.log(`Login attempt: email=${email}, expected=${OWNER_EMAIL}`);
  if (email !== OWNER_EMAIL || password !== OWNER_PASS)
    return res.status(401).json({ error: 'Invalid credentials' });

  const data = await readPlatform();
  const token = crypto.randomBytes(32).toString('hex');
  data.ownerToken = token;
  await writePlatform(data);
  console.log('Owner login successful');
  res.json({ token });
});

// Emergency reset (master secret required)
app.post('/platform/reset-ip', async (req, res) => {
  if (req.headers['x-master-secret']!==MASTER_SECRET) return res.status(401).json({ error: 'No' });
  const data = await readPlatform();
  delete data.ownerLockedIp; delete data.ownerToken;
  await writePlatform(data);
  res.json({ ok: true });
});

async function authOwner(req, res, next) {
  const token = req.headers['x-owner-token'];
  const data = await readPlatform();
  if (!token || data.ownerToken !== token) return res.status(401).json({ error: 'Not authorized' });
  next();
}

// ── Tenant management ─────────────────────────────────────
app.post('/platform/tenants', authOwner, async (req, res) => {
  const { name, email, plan } = req.body;
  if (!name || !email) return res.status(400).json({ error: 'name and email required' });
  const data = await readPlatform();
  if (Object.values(data.tenants||{}).find(t=>t.email.toLowerCase()===email.toLowerCase()))
    return res.status(409).json({ error: 'Email already registered' });
  const id = newId('ten');
  const licenseKey = newKey();
  const code = name.toUpperCase().replace(/[^A-Z0-9]/g,'').slice(0,6) + Math.floor(1000+Math.random()*9000);
  const expiresAt = Date.now() + (plan === 'trial' ? 7 : 30)*24*60*60*1000;
  data.tenants = data.tenants||{};
  data.tenants[id] = { id, name, email, code, licenseKey, plan:plan||'trial', active:true, keyUsed:false, expiresAt, createdAt:Date.now(), lastCheckin:null };
  await writePlatform(data);
  res.json({ id, name, email, code, licenseKey, expiresAt:new Date(expiresAt).toISOString() });
});

app.get('/platform/tenants', authOwner, async (req, res) => {
  const data = await readPlatform();
  res.json(Object.values(data.tenants||{}).map(t=>({
    id:t.id, name:t.name, email:t.email, code:t.code,
    licenseKey:t.licenseKey, keyUsed:t.keyUsed||false,
    plan:t.plan, active:t.active,
    expiresAt:new Date(t.expiresAt).toISOString(),
    lastCheckin:t.lastCheckin?new Date(t.lastCheckin).toISOString():null,
  })));
});

app.patch('/platform/tenants/:id', authOwner, async (req, res) => {
  const data = await readPlatform();
  if (!data.tenants?.[req.params.id]) return res.status(404).json({ error:'not found' });
  const { active, expiresAt, plan } = req.body;
  if (active!==undefined) data.tenants[req.params.id].active = active;
  if (expiresAt) data.tenants[req.params.id].expiresAt = new Date(expiresAt).getTime();
  if (plan) data.tenants[req.params.id].plan = plan;
  await writePlatform(data);
  res.json({ ok:true });
});

app.delete('/platform/tenants/:id', authOwner, async (req, res) => {
  const data = await readPlatform();
  delete data.tenants[req.params.id];
  await writePlatform(data);
  res.json({ ok:true });
});

// Reset device lock (when restaurant gets new tablet)
app.post('/platform/tenants/:id/reset-device', authOwner, async (req, res) => {
  const data = await readPlatform();
  if (!data.tenants?.[req.params.id]) return res.status(404).json({ error:'not found' });
  data.tenants[req.params.id].keyUsed = false;
  delete data.tenants[req.params.id].lockedDeviceId;
  delete data.tenants[req.params.id].lockedIp;
  delete data.tenants[req.params.id].sessionToken;
  await writePlatform(data);
  res.json({ ok:true });
});

// Regenerate license key (if they lose it)
app.post('/platform/tenants/:id/new-key', authOwner, async (req, res) => {
  const data = await readPlatform();
  if (!data.tenants?.[req.params.id]) return res.status(404).json({ error:'not found' });
  const licenseKey = newKey();
  data.tenants[req.params.id].licenseKey = licenseKey;
  data.tenants[req.params.id].keyUsed = false;
  delete data.tenants[req.params.id].lockedDeviceId;
  delete data.tenants[req.params.id].sessionToken;
  await writePlatform(data);
  res.json({ ok:true, licenseKey });
});

app.get('/platform/stats', authOwner, async (req, res) => {
  const data = await readPlatform();
  const tenants = Object.values(data.tenants||{});
  res.json({
    total:tenants.length,
    active:tenants.filter(t=>t.active&&Date.now()<t.expiresAt).length,
    expired:tenants.filter(t=>Date.now()>t.expiresAt).length,
    disabled:tenants.filter(t=>!t.active).length,
    plans:tenants.reduce((acc,t)=>{ acc[t.plan]=(acc[t.plan]||0)+1; return acc; },{}),
  });
});

// Simple booking — no registration needed, just CID details
app.post('/customer/book', async (req, res) => {
  const { date, time, partySize, notes, code, customerName, customerCID, customerPhone, table } = req.body;
  if (!date || !time || !partySize || !customerName || !customerCID)
    return res.status(400).json({ error: 'Date, time, party size, name and CID are required' });

  const bKey = code ? `${code}:bookings` : 'bookings';
  const callsKey = code ? `${code}:calls` : 'calls';
  const bookings = await dbGet(bKey) || [];
  const booking = {
    id: newId('bk'),
    customerName, customerCID, customerPhone: customerPhone || '',
    date, time, partySize, notes: notes || '',
    table: table || null,
    status: 'confirmed', createdAt: Date.now(),
  };
  await dbSet(bKey, [...bookings, booking]);

  // Add notification to floor map calls so staff see it
  const calls = await dbGet(callsKey) || [];
  calls.push({
    id: newId('call'),
    type: 'booking',
    table: table || null,
    message: `📅 New booking: ${customerName}, ${partySize} people on ${date} at ${time}${notes ? ` (${notes})` : ''}`,
    status: 'pending',
    createdAt: Date.now(),
  });
  await dbSet(callsKey, calls);

  res.json(booking);
});

// ── Customer auth (name-based) ────────────────────────────
app.post('/customer/register', async (req, res) => {
  const { name, phone, code } = req.body;
  if (!name||!phone) return res.status(400).json({ error:'Name and phone required' });
  const key = code?`${code}:customers`:'customers';
  let customers = await dbGet(key)||{};
  if (Object.values(customers).find(c=>c.phone===phone))
    return res.status(409).json({ error:'Phone already registered' });
  const id = newId('cust');
  const token = crypto.randomBytes(32).toString('hex');
  customers[id] = { id, name, phone, token, createdAt:Date.now(), bookings:[] };
  await dbSet(key, customers);
  res.json({ id, name, phone, token });
});

app.post('/customer/login', async (req, res) => {
  const { name, phone, code } = req.body;
  if (!name) return res.status(400).json({ error:'Name required' });
  const key = code?`${code}:customers`:'customers';
  const customers = await dbGet(key)||{};
  let customer = Object.values(customers).find(c=>c.name.toLowerCase()===name.toLowerCase());
  if (!customer) return res.status(401).json({ error:'Name not found — please register first' });
  const token = crypto.randomBytes(32).toString('hex');
  customers[customer.id].token = token;
  await dbSet(key, customers);
  res.json({ id:customer.id, name:customer.name, phone:customer.phone, token });
});

function authCustomer(getCode) {
  return async (req, res, next) => {
    const token = req.headers['x-customer-token'];
    const code  = req.query.code || req.body?.code || '';
    const key   = code?`${code}:customers`:'customers';
    const customers = await dbGet(key)||{};
    const customer = Object.values(customers).find(c=>c.token===token);
    if (!customer) return res.status(401).json({ error:'Not logged in' });
    req.customer = customer; req.customers = customers; req.customerKey = key;
    next();
  };
}

app.post('/customer/bookings', authCustomer(), async (req, res) => {
  const { table, date, time, partySize, notes, code } = req.body;
  if (!date||!time||!partySize) return res.status(400).json({ error:'date, time and partySize required' });
  const booking = { id:newId('bk'), customerId:req.customer.id, customerName:req.customer.name, table:table||null, date, time, partySize, notes:notes||'', status:'confirmed', createdAt:Date.now() };
  req.customers[req.customer.id].bookings = [...(req.customers[req.customer.id].bookings||[]), booking];
  const bKey = code?`${code}:bookings`:'bookings';
  const allBookings = (await dbGet(bKey)||[]);
  await Promise.all([dbSet(req.customerKey, req.customers), dbSet(bKey, [...allBookings, booking])]);
  res.json(booking);
});

app.get('/customer/bookings', authCustomer(), async (req, res) => { res.json(req.customer.bookings||[]); });

app.delete('/customer/bookings/:id', authCustomer(), async (req, res) => {
  req.customers[req.customer.id].bookings = (req.customers[req.customer.id].bookings||[]).map(b=>b.id===req.params.id?{...b,status:'cancelled'}:b);
  await dbSet(req.customerKey, req.customers);
  res.json({ ok:true });
});

// Simple order — no registration needed, CID details attached to order
app.post('/customer/orders', async (req, res) => {
  const { table, items, code, customerName, customerCID, customerPhone } = req.body;
  if (!table || !items?.length) return res.status(400).json({ error: 'table and items required' });
  if (!customerName || !customerCID) return res.status(400).json({ error: 'Name and CID required' });

  const mKey = code ? `${code}:menu` : 'menu';
  const tKey = code ? `${code}:tickets` : 'tickets';
  const bKey = code ? `${code}:bills` : 'bills';
  const [menu, tickets, bills] = await Promise.all([dbGet(mKey), dbGet(tKey), dbGet(bKey)]);
  const allMenu = menu || DEFAULT_MENU;
  const allTickets = tickets || [];
  const allBills = bills || [];

  const stations = [...new Set(items.map(i=>{ const m=allMenu.find(m=>m.id===i.menuId); return m?m.station:'kitchen'; }))];
  const newTickets = stations.map(station => ({
    id: newId('t'), table, station,
    items: items.filter(i=>{ const m=allMenu.find(m=>m.id===i.menuId); return m&&m.station===station; })
               .map(i=>{ const m=allMenu.find(m=>m.id===i.menuId); return { name:m.name, qty:i.qty, notes:i.notes||'' }; }),
    status: 'new', firedAt: Date.now(), source: 'customer',
    customerName, customerCID, customerPhone: customerPhone||'',
  }));

  let bill = allBills.find(b=>b.table===table&&b.status==='open');
  if (!bill) { bill={ id:newId('bill'), table, lines:[], status:'open', createdAt:Date.now(), customerName, customerCID }; allBills.push(bill); }
  items.forEach(i=>{ const m=allMenu.find(m=>m.id===i.menuId); if(m) bill.lines.push({ name:m.name, qty:i.qty, price:m.price }); });

  await Promise.all([dbSet(tKey,[...allTickets,...newTickets]), dbSet(bKey,allBills)]);
  res.json({ tickets:newTickets, bill, billId:bill.id });
});


app.get('/customer/orders/:table', authCustomer(), async (req, res) => {
  const code = req.query.code||'';
  const [tickets, bills] = await Promise.all([dbGet(code?`${code}:tickets`:'tickets'), dbGet(code?`${code}:bills`:'bills')]);
  const myTickets = (tickets||[]).filter(t=>t.table===parseInt(req.params.table)&&t.customerId===req.customer.id);
  const bill = (bills||[]).find(b=>b.table===parseInt(req.params.table)&&b.status==='open');
  res.json({ tickets:myTickets, bill:bill||null });
});

const PORT = process.env.PORT || 8787;
app.listen(PORT, () => console.log(`TableFire backend on :${PORT}`));

const DEFAULT_PLAN_LIMITS = { trial:8, starter:8, restaurant:20, enterprise:999 };
const DEFAULT_PLAN_PRICES = { trial:0, starter:1500, restaurant:2500, enterprise:4000 };
const DEFAULT_CURRENCY = { symbol:'Nu', position:'before', decimals:0 };

async function getPlanLimits() {
  const data = await readPlatform();
  const stored = data.planSettings || {};
  return {
    limits: { ...DEFAULT_PLAN_LIMITS, ...(stored.limits || data.planLimits || {}) },
    prices: { ...DEFAULT_PLAN_PRICES, ...(stored.prices || {}) },
    currency: { ...DEFAULT_CURRENCY, ...(stored.currency || {}) },
  };
}

app.get('/platform/plan-limits', authOwner, async (req, res) => {
  res.json(await getPlanLimits());
});

app.post('/platform/plan-limits', authOwner, async (req, res) => {
  const { limits, prices, currency } = req.body;
  const data = await readPlatform();
  data.planSettings = {
    limits: { trial:parseInt(limits?.trial)||8, starter:parseInt(limits?.starter)||8, restaurant:parseInt(limits?.restaurant)||20, enterprise:parseInt(limits?.enterprise)||999 },
    prices: { trial:parseInt(prices?.trial)||0, starter:parseInt(prices?.starter)||1500, restaurant:parseInt(prices?.restaurant)||2500, enterprise:parseInt(prices?.enterprise)||4000 },
    currency: { symbol: currency?.symbol||'Nu', position: currency?.position||'before', decimals: parseInt(currency?.decimals)||0 },
  };
  await writePlatform(data);
  res.json(data.planSettings);
});

// Enforce table limit when restaurant saves config
app.post('/restaurant/check-tables', async (req, res) => {
  const { sessionToken, deviceId, tableCount } = req.body;
  if (!sessionToken) return res.status(401).json({ allowed: false, reason: 'Not logged in' });
  const data = await readPlatform();
  const tenant = Object.values(data.tenants||{}).find(t =>
    (t.deviceSessions && t.deviceSessions[deviceId] === sessionToken) ||
    (t.sessionToken === sessionToken && t.lockedDeviceId === deviceId)
  );
  if (!tenant) return res.json({ allowed: false, reason: 'Session invalid' });
  const limits = { ...DEFAULT_PLAN_LIMITS, ...(data.planLimits||{}) };
  const limit = limits[tenant.plan] || 8;
  if (tableCount > limit) {
    return res.json({ allowed: false, limit, plan: tenant.plan, reason: `Your ${tenant.plan} plan allows up to ${limit} tables. Contact TableFire to upgrade.` });
  }
  res.json({ allowed: true, limit, plan: tenant.plan });
});
