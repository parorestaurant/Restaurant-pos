import React, { useState, useEffect, useRef } from 'react';
import {
  ChefHat, Wine, UtensilsCrossed, Clock, Plus, Minus, Flame, Check, X,
  CreditCard, Edit3, Image as ImageIcon, Trash2, Loader2, Banknote, Bell, Map as MapIcon,
  Lock, Settings as SettingsIcon, LogOut, ShieldCheck,
} from 'lucide-react';
import { loadKey, saveKey, checkConnection } from './lib/storage';

// ---------- Menu (Korean restaurant, with two combo/set items) ----------

const DEFAULT_MENU = [
  { id: 'm1', name: 'Mandu (Korean Dumplings)', category: 'Starters', station: 'kitchen', price: 8, image: '', modifierGroups: [] },
  { id: 'm2', name: 'Kimchi Pancake (Kimchijeon)', category: 'Starters', station: 'kitchen', price: 11, image: '', modifierGroups: [] },
  { id: 'm3', name: 'Korean Fried Chicken Wings', category: 'Starters', station: 'kitchen', price: 12, image: '', modifierGroups: [] },
  { id: 'm4', name: 'Japchae (Glass Noodles)', category: 'Starters', station: 'kitchen', price: 10, image: '', modifierGroups: [] },
  { id: 'm5', name: 'Bibimbap', category: 'Mains', station: 'kitchen', price: 15, image: '', modifierGroups: [] },
  { id: 'm6', name: 'Bulgogi (Marinated Beef)', category: 'Mains', station: 'kitchen', price: 19, image: '', modifierGroups: [] },
  { id: 'm7', name: 'Kimchi Jjigae (Stew)', category: 'Mains', station: 'kitchen', price: 14, image: '', modifierGroups: [] },
  { id: 'm8', name: 'Tteokbokki (Spicy Rice Cakes)', category: 'Mains', station: 'kitchen', price: 13, image: '', modifierGroups: [] },
  { id: 'm9', name: 'Samgyeopsal (Grilled Pork Belly)', category: 'Mains', station: 'kitchen', price: 22, image: '', modifierGroups: [] },
  {
    id: 'combo1', name: 'Bulgogi Set Combo', category: 'Combos', station: 'kitchen', price: 24, image: '',
    modifierGroups: [
      { id: 'spice', name: 'Spice Level', required: true, options: [
        { id: 'mild', label: 'Mild', priceDelta: 0 },
        { id: 'medium', label: 'Medium', priceDelta: 0 },
        { id: 'spicy', label: 'Spicy', priceDelta: 0 },
      ]},
      { id: 'side', name: 'Side', required: true, options: [
        { id: 'rice', label: 'Steamed Rice', priceDelta: 0 },
        { id: 'japchae', label: 'Japchae', priceDelta: 0 },
        { id: 'salad', label: 'Side Salad', priceDelta: 0 },
      ]},
      { id: 'addon', name: 'Add-on', required: false, options: [
        { id: 'extrameat', label: 'Extra Bulgogi (+$4.50)', priceDelta: 4.5 },
        { id: 'extrarice', label: 'Extra Rice (+$2.00)', priceDelta: 2 },
      ]},
    ],
  },
  {
    id: 'combo2', name: 'Korean Fried Chicken Combo', category: 'Combos', station: 'kitchen', price: 20, image: '',
    modifierGroups: [
      { id: 'sauce', name: 'Sauce', required: true, options: [
        { id: 'original', label: 'Original Crispy', priceDelta: 0 },
        { id: 'soygarlic', label: 'Soy Garlic', priceDelta: 0 },
        { id: 'gochujang', label: 'Spicy Gochujang', priceDelta: 0 },
      ]},
      { id: 'side', name: 'Side', required: true, options: [
        { id: 'fries', label: 'Fries', priceDelta: 0 },
        { id: 'radish', label: 'Pickled Radish', priceDelta: 0 },
        { id: 'rice2', label: 'Steamed Rice', priceDelta: 0 },
      ]},
    ],
  },
  { id: 'm10', name: 'Bingsu (Shaved Ice Dessert)', category: 'Desserts', station: 'kitchen', price: 9, image: '', modifierGroups: [] },
  { id: 'm11', name: 'Hotteok (Sweet Pancake)', category: 'Desserts', station: 'kitchen', price: 6, image: '', modifierGroups: [] },
  { id: 'm12', name: 'Soju', category: 'Drinks', station: 'bar', price: 9, image: '', modifierGroups: [] },
  { id: 'm13', name: 'Makgeolli (Rice Wine)', category: 'Drinks', station: 'bar', price: 10, image: '', modifierGroups: [] },
  { id: 'm14', name: 'Korean Beer (Cass)', category: 'Drinks', station: 'bar', price: 7, image: '', modifierGroups: [] },
  { id: 'm15', name: 'Yuzu Soju Cocktail', category: 'Drinks', station: 'bar', price: 11, image: '', modifierGroups: [] },
  { id: 'm16', name: 'Barley Tea', category: 'Drinks', station: 'bar', price: 3, image: '', modifierGroups: [] },
  { id: 'm17', name: 'Sikhye (Sweet Rice Drink)', category: 'Drinks', station: 'bar', price: 5, image: '', modifierGroups: [] },
];

function makeTables(count) { return Array.from({ length: count }, (_, i) => i + 1); }
const DEFAULT_TABLE_COUNT = 12;

// ---------- Alarm sound (Web Audio API, no external file needed) ----------

function playAlarm() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    [[0, 880], [0.18, 1100], [0.36, 880]].forEach(([when, freq]) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain); gain.connect(ctx.destination);
      osc.frequency.value = freq;
      osc.type = 'sine';
      gain.gain.setValueAtTime(0.35, ctx.currentTime + when);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + when + 0.14);
      osc.start(ctx.currentTime + when);
      osc.stop(ctx.currentTime + when + 0.15);
    });
  } catch (e) { /* browser blocked audio — ignore */ }
}

const COLORS = {
  bg: '#16140F', panel: '#201D17', border: '#39332A', paper: '#F2ECDD', ink: '#2A2620',
  cream: '#EDE6D6', muted: '#9A9384', ember: '#D9622B', well: '#2E7D8C', warn: '#D9A12B',
  urgent: '#C73E3E', good: '#5C9D6E',
};

const STATION_META = {
  kitchen: { label: 'Kitchen', accent: COLORS.ember, Icon: ChefHat },
  bar: { label: 'Bar', accent: COLORS.well, Icon: Wine },
};

const money = (n) => `$${(Number(n) || 0).toFixed(2)}`;

function formatElapsed(ms) {
  const totalSec = Math.max(0, Math.floor(ms / 1000));
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}
function ageLevel(ms) {
  const min = ms / 60000;
  if (min < 5) return 'calm';
  if (min < 10) return 'warn';
  return 'urgent';
}
function newId(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}
function tableUrl(n) {
  if (typeof window === 'undefined') return '';
  const base = window.location.origin + window.location.pathname;
  return `${base}?table=${n}`;
}
function getTableStatus(n, tickets, bills, calls) {
  const callPending = calls.some((c) => c.table === n && c.status === 'pending');
  if (callPending) return { key: 'calling', label: 'Calling staff', color: COLORS.urgent, pulse: true };
  const activeTickets = tickets.filter((t) => t.table === n && t.status !== 'served');
  if (activeTickets.some((t) => t.status === 'ready')) return { key: 'ready', label: 'Ready to serve', color: COLORS.warn };
  if (activeTickets.length > 0) return { key: 'cooking', label: 'Preparing', color: COLORS.ember };
  const openBill = bills.find((b) => b.table === n && b.status === 'open' && b.lines.length > 0);
  if (openBill) return { key: 'payment', label: 'Awaiting payment', color: COLORS.good };
  return { key: 'available', label: 'Available', color: COLORS.border, muted: true };
}

// ---------- Image resize (client-side, before upload) ----------

function resizeImageFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const maxW = 360;
        const scale = Math.min(1, maxW / img.width);
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', 0.72));
      };
      img.onerror = reject;
      img.src = e.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// ---------- Style helpers ----------

const titleStyle = { fontFamily: "'Oswald', sans-serif", fontSize: 24, letterSpacing: 1, textTransform: 'uppercase', margin: 0, color: COLORS.cream };
const subTitleStyle = { fontFamily: "'Oswald', sans-serif", textTransform: 'uppercase', letterSpacing: 1.5, fontSize: 15, color: COLORS.cream, borderBottom: `1px solid ${COLORS.border}`, paddingBottom: 6, marginBottom: 10 };
const labelStyle = { display: 'block', fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.5, color: COLORS.muted, marginBottom: 4, marginTop: 10 };
const inputStyle = { width: '100%', padding: '8px 10px', borderRadius: 4, border: `1px solid ${COLORS.border}`, background: COLORS.bg, color: COLORS.cream, fontSize: 14, fontFamily: "'Inter', sans-serif", boxSizing: 'border-box' };
const iconBtnStyle = { width: 26, height: 26, borderRadius: 3, border: `1px solid ${COLORS.border}`, background: 'transparent', color: COLORS.cream, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 };
function primaryBtnStyle(color) {
  return { display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 4, border: 'none', background: color, color: '#fff', fontWeight: 700, fontSize: 13, cursor: 'pointer' };
}

// ---------- Ticket card / Station board ----------

function TicketCard({ ticket, now, onAdvance }) {
  const elapsed = now - ticket.firedAt;
  const level = ageLevel(elapsed);
  const levelColor = level === 'calm' ? COLORS.muted : level === 'warn' ? COLORS.warn : COLORS.urgent;
  const nextLabel = ticket.status === 'new' ? 'Start' : ticket.status === 'preparing' ? 'Mark ready' : 'Served';
  const accent = STATION_META[ticket.station].accent;
  return (
    <div className={level === 'urgent' ? 'pulse-urgent' : ''} style={{ background: COLORS.paper, color: COLORS.ink, borderRadius: 4, borderTop: `3px dashed ${accent}80`, padding: '14px 16px', marginBottom: 12, position: 'relative' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <span style={{ fontFamily: "'Oswald', sans-serif", fontSize: 22, fontWeight: 600 }}>TABLE {ticket.table}</span>
        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, opacity: 0.5 }}>#{ticket.id.slice(-5)}</span>
      </div>
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, marginTop: 4, marginBottom: 10, fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: levelColor }}>
        <Clock size={12} /> {formatElapsed(elapsed)} on the rail
      </div>
      <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
        {ticket.items.map((it, i) => (
          <li key={i} style={{ fontSize: 14, padding: '3px 0', borderTop: i === 0 ? 'none' : `1px solid ${COLORS.ink}15` }}>
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 700 }}>{it.qty}×</span> {it.name}
            {it.notes ? <div style={{ fontSize: 12, fontStyle: 'italic', opacity: 0.7, marginLeft: 22 }}>{it.notes}</div> : null}
          </li>
        ))}
      </ul>
      <button onClick={() => onAdvance(ticket.id)} style={{ marginTop: 12, width: '100%', background: accent, color: '#fff', border: 'none', borderRadius: 3, padding: '8px 0', fontFamily: "'Inter', sans-serif", fontWeight: 600, fontSize: 13, letterSpacing: 0.3, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
        <Check size={14} /> {nextLabel}
      </button>
    </div>
  );
}

function StationBoard({ station, tickets, now, onAdvance }) {
  const meta = STATION_META[station];
  const active = tickets.filter((t) => t.station === station && t.status !== 'served');
  const lanes = [{ key: 'new', label: 'New' }, { key: 'preparing', label: 'Preparing' }, { key: 'ready', label: 'Ready' }];
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
        <meta.Icon size={22} color={meta.accent} />
        <h2 style={titleStyle}>{meta.label} display</h2>
        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: COLORS.muted }}>{active.length} active</span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3" style={{ gap: 16 }}>
        {lanes.map((lane) => {
          const laneTickets = active.filter((t) => t.status === lane.key).sort((a, b) => a.firedAt - b.firedAt);
          return (
            <div key={lane.key}>
              <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: COLORS.muted, borderBottom: `1px solid ${COLORS.border}`, paddingBottom: 8, marginBottom: 12 }}>
                {lane.label} · {laneTickets.length}
              </div>
              {laneTickets.length === 0 ? (
                <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: COLORS.muted, fontStyle: 'italic' }}>Rail is clear.</div>
              ) : (
                laneTickets.map((t) => <TicketCard key={t.id} ticket={t} now={now} onAdvance={onAdvance} />)
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ---------- Menu card ----------

function MenuCard({ item, qty, onTap }) {
  const accent = STATION_META[item.station]?.accent || COLORS.muted;
  const hasMods = item.modifierGroups && item.modifierGroups.length > 0;
  return (
    <div onClick={onTap} style={{ cursor: 'pointer', position: 'relative', background: COLORS.panel, border: `1px solid ${COLORS.border}`, borderRadius: 6, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      <div style={{ width: '100%', aspectRatio: '4 / 3', background: '#2A2620', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', position: 'relative' }}>
        {item.image ? <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <ImageIcon size={24} color={COLORS.muted} />}
        {hasMods && (
          <div style={{ position: 'absolute', bottom: 6, left: 6, background: '#00000099', color: COLORS.cream, fontSize: 10, padding: '2px 6px', borderRadius: 3 }}>Customize</div>
        )}
      </div>
      <div style={{ padding: '8px 10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: accent, display: 'inline-block', flexShrink: 0 }} />
          <span style={{ color: COLORS.cream, fontSize: 13, fontWeight: 600, lineHeight: 1.2 }}>{item.name}</span>
        </div>
        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: COLORS.muted, marginTop: 3 }}>{money(item.price)}</div>
      </div>
      {qty > 0 && (
        <div style={{ position: 'absolute', top: 6, right: 6, background: accent, color: '#fff', borderRadius: 12, minWidth: 22, height: 22, padding: '0 6px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace" }}>
          {qty}
        </div>
      )}
    </div>
  );
}

// ---------- Customize modal (combo/set options) ----------

function CustomizeModal({ item, selections, onSelect, qty, onQtyChange, notes, onNotes, onCancel, onConfirm }) {
  const extra = item.modifierGroups.reduce((sum, g) => {
    const sel = selections[g.id];
    if (!sel) return sum;
    const opt = g.options.find((o) => o.id === sel);
    return sum + (opt ? opt.priceDelta : 0);
  }, 0);
  const unitPrice = item.price + extra;
  return (
    <div style={{ position: 'fixed', inset: 0, background: '#00000080', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, zIndex: 60 }}>
      <div style={{ background: COLORS.panel, border: `1px solid ${COLORS.border}`, borderRadius: 6, padding: 20, width: '100%', maxWidth: 420, maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
          <h3 style={{ ...subTitleStyle, margin: 0, border: 'none', padding: 0 }}>{item.name}</h3>
          <button onClick={onCancel} style={iconBtnStyle}><X size={13} /></button>
        </div>
        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13, color: COLORS.muted, marginBottom: 14 }}>{money(item.price)} base</div>

        {item.modifierGroups.map((g) => (
          <div key={g.id} style={{ marginBottom: 14 }}>
            <label style={{ ...labelStyle, marginTop: 0 }}>{g.name}{g.required ? ' *' : ' (optional)'}</label>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {g.options.map((o) => {
                const active = selections[g.id] === o.id;
                return (
                  <button
                    key={o.id}
                    onClick={() => onSelect(g.id, active && !g.required ? null : o.id)}
                    style={{ padding: '7px 12px', borderRadius: 4, fontSize: 13, cursor: 'pointer', border: `1px solid ${active ? COLORS.ember : COLORS.border}`, background: active ? `${COLORS.ember}22` : 'transparent', color: active ? COLORS.ember : COLORS.cream }}
                  >
                    {o.label}
                  </button>
                );
              })}
            </div>
          </div>
        ))}

        <label style={labelStyle}>Special instructions</label>
        <input value={notes} onChange={(e) => onNotes(e.target.value)} placeholder="e.g. no onions" style={inputStyle} />

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button onClick={() => onQtyChange(Math.max(1, qty - 1))} style={iconBtnStyle}><Minus size={13} /></button>
            <span style={{ fontFamily: "'JetBrains Mono', monospace", color: COLORS.cream, fontSize: 15, minWidth: 16, textAlign: 'center' }}>{qty}</span>
            <button onClick={() => onQtyChange(qty + 1)} style={iconBtnStyle}><Plus size={13} /></button>
          </div>
          <span style={{ fontFamily: "'JetBrains Mono', monospace", color: COLORS.cream, fontSize: 16, fontWeight: 700 }}>{money(unitPrice * qty)}</span>
        </div>

        <button onClick={onConfirm} style={{ ...primaryBtnStyle(COLORS.ember), width: '100%', justifyContent: 'center', marginTop: 14 }}>
          <Plus size={14} /> Add to order
        </button>
      </div>
    </div>
  );
}

// ---------- Main app ----------

export default function KoreanRestaurantPOS() {
  const [guestTable] = useState(() => {
    if (typeof window === 'undefined') return null;
    const n = parseInt(new URLSearchParams(window.location.search).get('table'), 10);
    return n >= 1 && n <= 50 ? n : null;
  });
  const isGuestMode = guestTable !== null;

  const [loading, setLoading] = useState(true);
  const [connected, setConnected] = useState(true);

  // --- auth ---
  const [authRole, setAuthRole] = useState(null); // null | 'owner' | 'staff'
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState('');
  const [ownerPin, setOwnerPin] = useState('1234');
  const [staffPin, setStaffPin] = useState('5678');

  // --- settings ---
  const [tableCount, setTableCount] = useState(DEFAULT_TABLE_COUNT);
  const [bankQR, setBankQR] = useState(''); // base64 image
  const [settingsDraft, setSettingsDraft] = useState(null);

  const TABLES = makeTables(tableCount);

  const [menu, setMenu] = useState(DEFAULT_MENU);
  const [tickets, setTickets] = useState([]);
  const [bills, setBills] = useState([]);
  const [calls, setCalls] = useState([]);

  const [view, setView] = useState(isGuestMode ? 'table' : 'floor');
  const [selectedTable, setSelectedTable] = useState(guestTable);
  const [cart, setCart] = useState([]);
  const [now, setNow] = useState(Date.now());
  const [flash, setFlash] = useState('');

  const [draftItem, setDraftItem] = useState(null);
  const [uploading, setUploading] = useState(false);

  const [customizeItem, setCustomizeItem] = useState(null);
  const [customizeSelections, setCustomizeSelections] = useState({});
  const [customizeQty, setCustomizeQty] = useState(1);
  const [customizeNotes, setCustomizeNotes] = useState('');

  const [payTable, setPayTable] = useState(null);
  const [tipPercent, setTipPercent] = useState(0);
  const [showCardForm, setShowCardForm] = useState(false);
  const [card, setCard] = useState({ name: '', number: '', expiry: '', cvc: '' });
  const [processing, setProcessing] = useState(false);
  const [paySuccess, setPaySuccess] = useState(false);

  const [floorSelected, setFloorSelected] = useState(null);
  const [showCalls, setShowCalls] = useState(false);

  const processingRef = useRef(false);
  useEffect(() => { processingRef.current = processing; }, [processing]);

  useEffect(() => {
    (async () => {
      const [ok, m, t, b, c, cfg] = await Promise.all([
        checkConnection(),
        loadKey('menu', DEFAULT_MENU),
        loadKey('tickets', []),
        loadKey('bills', []),
        loadKey('calls', []),
        loadKey('config', {}),
      ]);
      setConnected(ok);
      setMenu(m); setTickets(t); setBills(b); setCalls(c);
      if (cfg.ownerPin) setOwnerPin(cfg.ownerPin);
      if (cfg.staffPin) setStaffPin(cfg.staffPin);
      if (cfg.tableCount) setTableCount(cfg.tableCount);
      if (cfg.bankQR) setBankQR(cfg.bankQR);
      setLoading(false);
    })();
  }, []);

  useEffect(() => {
    const interval = setInterval(async () => {
      const ok = await checkConnection();
      setConnected(ok);
      if (!ok) return;
      const [m, t, b, c, cfg] = await Promise.all([loadKey('menu', null), loadKey('tickets', null), loadKey('bills', null), loadKey('calls', null), loadKey('config', null)]);
      if (m) setMenu(m);
      if (t) setTickets(t);
      if (b && !processingRef.current) setBills(b);
      if (c) setCalls(c);
      if (cfg) {
        if (cfg.tableCount) setTableCount(cfg.tableCount);
        if (cfg.bankQR !== undefined) setBankQR(cfg.bankQR);
      }
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => { const t = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(t); }, []);
  useEffect(() => { if (!flash) return; const t = setTimeout(() => setFlash(''), 2600); return () => clearTimeout(t); }, [flash]);

  // --- cart / ordering ---

  function addToCart(item) {
    setCart((prev) => {
      const existing = prev.find((c) => c.lineKey === item.id);
      if (existing) return prev.map((c) => (c.lineKey === item.id ? { ...c, qty: c.qty + 1 } : c));
      return [...prev, { lineKey: item.id, menuId: item.id, name: item.name, station: item.station, price: item.price, qty: 1, notes: '', modifiers: [] }];
    });
  }
  function handleCardTap(item) {
    if (item.modifierGroups && item.modifierGroups.length > 0) openCustomize(item);
    else addToCart(item);
  }
  function openCustomize(item) {
    const initial = {};
    (item.modifierGroups || []).forEach((g) => { if (g.required && g.options.length) initial[g.id] = g.options[0].id; });
    setCustomizeItem(item); setCustomizeSelections(initial); setCustomizeQty(1); setCustomizeNotes('');
  }
  function confirmCustomize() {
    const item = customizeItem;
    const missing = (item.modifierGroups || []).filter((g) => g.required && !customizeSelections[g.id]);
    if (missing.length) { setFlash(`Please choose: ${missing.map((g) => g.name).join(', ')}`); return; }
    const chosen = (item.modifierGroups || [])
      .filter((g) => customizeSelections[g.id])
      .map((g) => { const opt = g.options.find((o) => o.id === customizeSelections[g.id]); return { group: g.name, label: opt.label, priceDelta: opt.priceDelta || 0 }; });
    const extra = chosen.reduce((s, c) => s + c.priceDelta, 0);
    const lineKey = `${item.id}::${JSON.stringify(customizeSelections)}::${customizeNotes}`;
    setCart((prev) => {
      const existing = prev.find((c) => c.lineKey === lineKey);
      if (existing) return prev.map((c) => (c.lineKey === lineKey ? { ...c, qty: c.qty + customizeQty } : c));
      return [...prev, { lineKey, menuId: item.id, name: item.name, station: item.station, price: item.price + extra, qty: customizeQty, notes: customizeNotes, modifiers: chosen }];
    });
    setCustomizeItem(null);
  }
  function changeQty(lineKey, delta) {
    setCart((prev) => prev.map((c) => (c.lineKey === lineKey ? { ...c, qty: c.qty + delta } : c)).filter((c) => c.qty > 0));
  }
  function updateNotes(lineKey, notes) {
    setCart((prev) => prev.map((c) => (c.lineKey === lineKey ? { ...c, notes } : c)));
  }

  async function fireOrder() {
    if (!selectedTable || cart.length === 0) return;
    playAlarm();
    const stations = [...new Set(cart.map((c) => c.station))];
    const newTickets = stations.map((station) => ({
      id: newId('t'), table: selectedTable, station,
      items: cart.filter((c) => c.station === station).map((c) => ({
        name: c.name, qty: c.qty,
        notes: [...(c.modifiers || []).map((m) => `${m.group}: ${m.label}`), c.notes].filter(Boolean).join(' · '),
      })),
      status: 'new', firedAt: Date.now(),
    }));
    const updatedTickets = [...tickets, ...newTickets];
    setTickets(updatedTickets); saveKey('tickets', updatedTickets);

    const billsCopy = bills.map((b) => ({ ...b, lines: [...b.lines] }));
    let bill = billsCopy.find((b) => b.table === selectedTable && b.status === 'open');
    if (!bill) { bill = { id: newId('bill'), table: selectedTable, lines: [], status: 'open', tip: 0, total: 0, paymentMethod: null, createdAt: Date.now(), paidAt: null }; billsCopy.push(bill); }
    bill.lines.push(...cart.map((c) => ({
      name: c.modifiers && c.modifiers.length ? `${c.name} (${c.modifiers.map((m) => m.label).join(', ')})` : c.name,
      qty: c.qty, price: c.price,
    })));
    setBills(billsCopy); saveKey('bills', billsCopy);

    setCart([]);
    setFlash(`Sent to ${stations.map((s) => STATION_META[s].label).join(' & ')} — Table ${selectedTable}`);
  }

  function advanceStatus(ticketId) {
    setTickets((prev) => {
      const updated = prev.map((t) => {
        if (t.id !== ticketId) return t;
        const next = t.status === 'new' ? 'preparing' : t.status === 'preparing' ? 'ready' : 'served';
        return { ...t, status: next };
      });
      saveKey('tickets', updated);
      return updated;
    });
  }

  // --- call staff ---

  const hasPendingCall = calls.some((c) => c.table === guestTable && c.status === 'pending');
  const pendingCalls = calls.filter((c) => c.status === 'pending').sort((a, b) => a.calledAt - b.calledAt);

  function callStaff() {
    if (hasPendingCall) return;
    const updated = [...calls, { id: newId('call'), table: guestTable, status: 'pending', calledAt: Date.now() }];
    setCalls(updated); saveKey('calls', updated);
    setFlash('Staff has been notified');
  }
  function acknowledgeCall(id) {
    const updated = calls.map((c) => (c.id === id ? { ...c, status: 'done' } : c));
    setCalls(updated); saveKey('calls', updated);
  }

  // --- menu editing ---

  function startNewItem() { setDraftItem({ id: null, name: '', category: menu[0]?.category || 'Starters', station: 'kitchen', price: '', image: '', modifierGroups: [] }); }
  function startEditItem(item) { setDraftItem({ ...item, price: String(item.price), modifierGroups: item.modifierGroups ? item.modifierGroups.map((g) => ({ ...g, options: [...g.options] })) : [] }); }
  async function handleImageChange(e) {
    const file = e.target.files?.[0]; if (!file) return;
    setUploading(true);
    try { const dataUrl = await resizeImageFile(file); setDraftItem((d) => ({ ...d, image: dataUrl })); } catch (err) { console.error(err); }
    setUploading(false);
  }
  async function saveDraftItem() {
    if (!draftItem.name.trim() || draftItem.price === '') return;
    const priceNum = parseFloat(draftItem.price);
    if (Number.isNaN(priceNum)) return;
    let updated;
    if (draftItem.id) updated = menu.map((m) => (m.id === draftItem.id ? { ...draftItem, price: priceNum } : m));
    else updated = [...menu, { ...draftItem, id: newId('m'), price: priceNum }];
    setMenu(updated); await saveKey('menu', updated); setDraftItem(null); setFlash('Menu updated');
  }
  function deleteItem(id) { const updated = menu.filter((m) => m.id !== id); setMenu(updated); saveKey('menu', updated); }
  function addGroup() { setDraftItem((d) => ({ ...d, modifierGroups: [...(d.modifierGroups || []), { id: newId('g'), name: '', required: true, options: [] }] })); }
  function removeGroup(gid) { setDraftItem((d) => ({ ...d, modifierGroups: d.modifierGroups.filter((g) => g.id !== gid) })); }
  function updateGroup(gid, patch) { setDraftItem((d) => ({ ...d, modifierGroups: d.modifierGroups.map((g) => (g.id === gid ? { ...g, ...patch } : g)) })); }
  function addOption(gid) { setDraftItem((d) => ({ ...d, modifierGroups: d.modifierGroups.map((g) => (g.id === gid ? { ...g, options: [...g.options, { id: newId('o'), label: '', priceDelta: 0 }] } : g)) })); }
  function updateOption(gid, oid, patch) { setDraftItem((d) => ({ ...d, modifierGroups: d.modifierGroups.map((g) => (g.id === gid ? { ...g, options: g.options.map((o) => (o.id === oid ? { ...o, ...patch } : o)) } : g)) })); }
  function removeOption(gid, oid) { setDraftItem((d) => ({ ...d, modifierGroups: d.modifierGroups.map((g) => (g.id === gid ? { ...g, options: g.options.filter((o) => o.id !== oid) } : g)) })); }

  async function saveConfig(patch) {
    const cfg = { ownerPin, staffPin, tableCount, bankQR, ...patch };
    await saveKey('config', cfg);
    if (patch.ownerPin !== undefined) setOwnerPin(patch.ownerPin);
    if (patch.staffPin !== undefined) setStaffPin(patch.staffPin);
    if (patch.tableCount !== undefined) setTableCount(patch.tableCount);
    if (patch.bankQR !== undefined) setBankQR(patch.bankQR);
  }

  async function handleBankQRChange(e) {
    const file = e.target.files?.[0]; if (!file) return;
    try { const dataUrl = await resizeImageFile(file); saveConfig({ bankQR: dataUrl }); } catch (err) { console.error(err); }
  }

  // --- auth helpers ---
  function tryLogin() {
    if (pinInput === ownerPin) { setAuthRole('owner'); setPinInput(''); setPinError(''); }
    else if (pinInput === staffPin) { setAuthRole('staff'); setPinInput(''); setPinError(''); }
    else { setPinError('Wrong PIN — try again'); setPinInput(''); }
  }

  // --- checkout ---

  const openBillForTable = (t) => bills.find((b) => b.table === t && b.status === 'open' && b.lines.length > 0);
  function selectPayTable(t) { setPayTable(t); setShowCardForm(false); setPaySuccess(false); setTipPercent(0); setCard({ name: '', number: '', expiry: '', cvc: '' }); }
  function computeTotals(bill) {
    const subtotal = bill ? bill.lines.reduce((s, l) => s + l.price * l.qty, 0) : 0;
    const tip = subtotal * (tipPercent / 100);
    return { subtotal, tip, total: subtotal + tip };
  }
  async function finalizePayment(method) {
    const bill = openBillForTable(payTable); if (!bill) return;
    const { tip, total } = computeTotals(bill);
    if (method === 'card') { setProcessing(true); await new Promise((res) => setTimeout(res, 1200)); setProcessing(false); }
    const updated = bills.map((b) => (b.id === bill.id ? { ...b, status: 'paid', tip, total, paymentMethod: method, paidAt: Date.now() } : b));
    setBills(updated); saveKey('bills', updated); setPaySuccess(true);
  }

  const cartTotal = cart.reduce((sum, c) => sum + c.price * c.qty, 0);
  const cartQtyFor = (menuId) => cart.filter((c) => c.menuId === menuId).reduce((s, c) => s + c.qty, 0);
  const categories = [...new Set(menu.map((m) => m.category))];
  const myTickets = selectedTable ? tickets.filter((t) => t.table === selectedTable).sort((a, b) => a.firedAt - b.firedAt) : [];
  const STATUS_LABEL = { new: 'Received', preparing: 'Preparing', ready: 'Ready', served: 'Served' };
  const STATUS_COLOR = { new: COLORS.muted, preparing: COLORS.ember, ready: COLORS.warn, served: COLORS.good };

  const navItems = [
    { key: 'floor', label: 'Floor map', Icon: MapIcon, accent: COLORS.cream },
    { key: 'table', label: 'Table order', Icon: UtensilsCrossed, accent: COLORS.cream },
    { key: 'kitchen', label: 'Kitchen', Icon: ChefHat, accent: COLORS.ember },
    { key: 'bar', label: 'Bar', Icon: Wine, accent: COLORS.well },
    { key: 'checkout', label: 'Checkout', Icon: CreditCard, accent: COLORS.good },
    { key: 'menu', label: 'Menu', Icon: Edit3, accent: COLORS.warn },
    ...(authRole === 'owner' ? [{ key: 'settings', label: 'Settings', Icon: SettingsIcon, accent: COLORS.muted }] : []),
  ];

  if (loading) {
    return <div style={{ minHeight: '100vh', background: COLORS.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: COLORS.muted, fontFamily: "'Inter', sans-serif" }}>Loading…</div>;
  }

  // Login screen (staff and owner, not guests)
  if (!isGuestMode && !authRole) {
    return (
      <div style={{ minHeight: '100vh', background: COLORS.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, fontFamily: "'Inter', sans-serif" }}>
        <style>{`@import url('https://fonts.googleapis.com/css2?family=Oswald:wght@600;700&family=Inter:wght@400;600;700&family=JetBrains+Mono:wght@700&display=swap'); input::placeholder{color:${COLORS.muted}}`}</style>
        <div style={{ width: '100%', maxWidth: 340, textAlign: 'center' }}>
          <Lock size={36} color={COLORS.ember} style={{ marginBottom: 14 }} />
          <h1 style={{ fontFamily: "'Oswald', sans-serif", fontSize: 28, letterSpacing: 2, textTransform: 'uppercase', color: COLORS.cream, margin: '0 0 4px' }}>The Pass</h1>
          <p style={{ color: COLORS.muted, fontSize: 13, marginBottom: 28 }}>Enter your staff or owner PIN to continue</p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginBottom: 14 }}>
            {[1,2,3,4,5,6,7,8,9,'⌫',0,'→'].map((k) => (
              <button key={k} onClick={() => {
                if (k === '⌫') setPinInput((p) => p.slice(0,-1));
                else if (k === '→') tryLogin();
                else if (pinInput.length < 8) setPinInput((p) => p + k);
              }} style={{ height: 56, borderRadius: 6, border: `1px solid ${k === '→' ? COLORS.ember : COLORS.border}`, background: k === '→' ? COLORS.ember : COLORS.panel, color: '#fff', fontSize: k === '→' || k === '⌫' ? 20 : 22, fontFamily: "'JetBrains Mono', monospace", cursor: 'pointer' }}>
                {k}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 14 }}>
            {Array.from({ length: Math.max(4, pinInput.length) }).map((_, i) => (
              <div key={i} style={{ width: 12, height: 12, borderRadius: '50%', background: i < pinInput.length ? COLORS.ember : COLORS.border }} />
            ))}
          </div>

          {pinError && <p style={{ color: COLORS.urgent, fontSize: 13, marginBottom: 8 }}>{pinError}</p>}
          <p style={{ color: COLORS.muted, fontSize: 11, marginTop: 16 }}>Default owner PIN: 1234 · Staff PIN: 5678<br/>Change these in Settings after logging in as owner.</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: COLORS.bg, fontFamily: "'Inter', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Oswald:wght@500;600;700&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;700&display=swap');
        @keyframes pulseUrgent { 0%, 100% { box-shadow: 0 0 0 0 rgba(199,62,62,0.45); } 50% { box-shadow: 0 0 0 7px rgba(199,62,62,0); } }
        @keyframes spin { to { transform: rotate(360deg); } }
        .pulse-urgent { animation: pulseUrgent 1.6s ease-in-out infinite; }
        .spin { animation: spin 0.8s linear infinite; }
        input::placeholder { color: ${COLORS.muted}; }
      `}</style>

      <div style={{ borderBottom: `1px solid ${COLORS.border}`, background: COLORS.panel }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <span>
            <span style={{ fontFamily: "'Oswald', sans-serif", fontSize: 20, letterSpacing: 3, color: COLORS.cream, textTransform: 'uppercase' }}>The Pass</span>
            <span style={{ fontSize: 10, color: connected ? COLORS.good : COLORS.urgent, fontFamily: "'JetBrains Mono', monospace", marginLeft: 10 }}>{connected ? '● synced' : '○ offline — check backend'}</span>
          </span>

          {!isGuestMode && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {navItems.map(({ key, label, Icon, accent }) => (
                  <button key={key} onClick={() => setView(key)} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 4, border: `1px solid ${view === key ? accent : COLORS.border}`, background: view === key ? `${accent}1A` : 'transparent', color: view === key ? accent : COLORS.muted, fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>
                    <Icon size={15} /> {label}
                  </button>
                ))}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 11, color: authRole === 'owner' ? COLORS.ember : COLORS.muted, fontFamily: "'JetBrains Mono', monospace", padding: '3px 8px', border: `1px solid ${authRole === 'owner' ? COLORS.ember : COLORS.border}`, borderRadius: 10 }}>
                  {authRole === 'owner' ? '👑 Owner' : '👤 Staff'}
                </span>
                <div style={{ position: 'relative' }}>
                  <button onClick={() => setShowCalls((s) => !s)} style={{ ...iconBtnStyle, width: 34, height: 34, position: 'relative', border: `1px solid ${pendingCalls.length ? COLORS.urgent : COLORS.border}` }}>
                    <Bell size={16} color={pendingCalls.length ? COLORS.urgent : COLORS.cream} />
                    {pendingCalls.length > 0 && (
                      <span style={{ position: 'absolute', top: -4, right: -4, background: COLORS.urgent, color: '#fff', borderRadius: 8, fontSize: 10, minWidth: 16, height: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'JetBrains Mono', monospace" }}>{pendingCalls.length}</span>
                    )}
                  </button>
                  {showCalls && (
                    <div style={{ position: 'absolute', right: 0, top: '110%', background: COLORS.panel, border: `1px solid ${COLORS.border}`, borderRadius: 6, padding: 10, width: 220, zIndex: 70 }}>
                      {pendingCalls.length === 0 ? (
                        <div style={{ fontSize: 12, color: COLORS.muted, padding: '6px 4px' }}>No active calls.</div>
                      ) : pendingCalls.map((c) => (
                        <div key={c.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 4px', borderBottom: `1px solid ${COLORS.border}55` }}>
                          <span style={{ fontSize: 12, color: COLORS.cream }}>Table {c.table}</span>
                          <button onClick={() => acknowledgeCall(c.id)} style={{ ...primaryBtnStyle(COLORS.good), padding: '3px 8px', fontSize: 11 }}>OK</button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <button onClick={() => setAuthRole(null)} title="Log out" style={{ ...iconBtnStyle, width: 34, height: 34 }}><LogOut size={15} /></button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '24px 20px 60px' }}>
        {flash && (
          <div style={{ marginBottom: 18, padding: '10px 14px', borderRadius: 4, background: `${COLORS.ember}1A`, border: `1px solid ${COLORS.ember}55`, color: COLORS.cream, fontSize: 13 }}>{flash}</div>
        )}

        {view === 'table' && (
          <div>
            {!isGuestMode && (
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 24 }}>
                {TABLES.map((n) => (
                  <button key={n} onClick={() => setSelectedTable(n)} style={{ width: 42, height: 42, borderRadius: 4, border: `1px solid ${selectedTable === n ? COLORS.ember : COLORS.border}`, background: selectedTable === n ? COLORS.ember : COLORS.panel, color: selectedTable === n ? '#fff' : COLORS.cream, fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, cursor: 'pointer' }}>{n}</button>
                ))}
              </div>
            )}

            {isGuestMode && (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18, padding: '10px 14px', background: COLORS.panel, border: `1px solid ${COLORS.border}`, borderRadius: 4 }}>
                <span style={{ color: COLORS.cream, fontSize: 14 }}>Table {guestTable}</span>
                <button onClick={callStaff} disabled={hasPendingCall} style={primaryBtnStyle(hasPendingCall ? COLORS.muted : COLORS.urgent)}>
                  <Bell size={14} /> {hasPendingCall ? 'Staff is on the way' : 'Call staff'}
                </button>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3" style={{ gap: 28 }}>
              <div className="md:col-span-2">
                {categories.map((cat) => (
                  <div key={cat} style={{ marginBottom: 26 }}>
                    <h3 style={subTitleStyle}>{cat}</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3" style={{ gap: 12 }}>
                      {menu.filter((m) => m.category === cat).map((item) => (
                        <MenuCard key={item.id} item={item} qty={cartQtyFor(item.id)} onTap={() => handleCardTap(item)} />
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div>
                <div style={{ background: COLORS.paper, color: COLORS.ink, borderRadius: 4, borderTop: `3px dashed ${COLORS.ember}80`, padding: 18, position: 'sticky', top: 20 }}>
                  <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, opacity: 0.5, textTransform: 'uppercase', marginBottom: 4 }}>Order chit</div>
                  <div style={{ fontFamily: "'Oswald', sans-serif", fontSize: 22, marginBottom: 12 }}>{selectedTable ? `Table ${selectedTable}` : 'Select a table'}</div>

                  {cart.length === 0 ? (
                    <div style={{ fontSize: 13, fontStyle: 'italic', opacity: 0.6 }}>No items yet. Tap a dish to add it.</div>
                  ) : (
                    cart.map((c) => (
                      <div key={c.lineKey} style={{ marginBottom: 10, paddingBottom: 10, borderBottom: `1px solid ${COLORS.ink}15` }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
                          <span><span style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 700 }}>{c.qty}×</span> {c.name}</span>
                          <button onClick={() => changeQty(c.lineKey, -c.qty)} style={{ background: 'none', border: 'none', cursor: 'pointer', opacity: 0.5 }}><X size={13} /></button>
                        </div>
                        {c.modifiers && c.modifiers.length > 0 && (
                          <div style={{ fontSize: 11, opacity: 0.65, marginTop: 2 }}>{c.modifiers.map((m) => m.label).join(' · ')}</div>
                        )}
                        <input value={c.notes} onChange={(e) => updateNotes(c.lineKey, e.target.value)} placeholder="Note for the kitchen/bar…" style={{ width: '100%', marginTop: 4, fontSize: 12, padding: '4px 6px', border: `1px solid ${COLORS.ink}25`, borderRadius: 3, background: 'transparent', color: COLORS.ink, boxSizing: 'border-box' }} />
                      </div>
                    ))
                  )}

                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginTop: 14, fontFamily: "'JetBrains Mono', monospace" }}><span>Total</span><span>{money(cartTotal)}</span></div>

                  <button onClick={fireOrder} disabled={!selectedTable || cart.length === 0} style={{ width: '100%', marginTop: 14, padding: '11px 0', borderRadius: 3, border: 'none', background: !selectedTable || cart.length === 0 ? '#88888055' : COLORS.ember, color: '#fff', fontWeight: 700, fontSize: 14, letterSpacing: 0.5, cursor: !selectedTable || cart.length === 0 ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                    <Flame size={16} /> Fire order
                  </button>
                </div>
              </div>
            </div>

            {myTickets.length > 0 && (
              <div style={{ marginTop: 28, maxWidth: 600 }}>
                <h3 style={subTitleStyle}>Order status — Table {selectedTable}</h3>
                {myTickets.map((t) => (
                  <div key={t.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: `1px solid ${COLORS.border}55`, gap: 10 }}>
                    <span style={{ fontSize: 13, color: COLORS.cream }}>{STATION_META[t.station].label}: {t.items.map((i) => `${i.qty}× ${i.name}`).join(', ')}</span>
                    <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, padding: '3px 8px', borderRadius: 10, background: `${STATUS_COLOR[t.status]}22`, color: STATUS_COLOR[t.status], flexShrink: 0 }}>{STATUS_LABEL[t.status]}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {view === 'kitchen' && !isGuestMode && <StationBoard station="kitchen" tickets={tickets} now={now} onAdvance={advanceStatus} />}
        {view === 'bar' && !isGuestMode && <StationBoard station="bar" tickets={tickets} now={now} onAdvance={advanceStatus} />}

        {view === 'floor' && !isGuestMode && (
          <div>
            <h2 style={titleStyle}>Floor map</h2>
            <p style={{ color: COLORS.muted, fontSize: 13, marginTop: 4, marginBottom: 18 }}>Live status of every table.</p>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6" style={{ gap: 10, marginBottom: 24 }}>
              {TABLES.map((n) => {
                const status = getTableStatus(n, tickets, bills, calls);
                const isSel = floorSelected === n;
                return (
                  <button key={n} onClick={() => setFloorSelected(n)} className={status.key === 'calling' ? 'pulse-urgent' : ''} style={{ padding: '14px 6px', borderRadius: 6, textAlign: 'center', cursor: 'pointer', border: `1px solid ${isSel ? COLORS.cream : status.color}`, background: status.muted ? COLORS.panel : `${status.color}22` }}>
                    <div style={{ fontFamily: "'Oswald', sans-serif", fontSize: 20, color: COLORS.cream }}>{n}</div>
                    <div style={{ fontSize: 10, color: status.color, marginTop: 4, textTransform: 'uppercase', letterSpacing: 0.4 }}>{status.label}</div>
                  </button>
                );
              })}
            </div>

            {floorSelected && (() => {
              const n = floorSelected;
              const status = getTableStatus(n, tickets, bills, calls);
              const bill = bills.find((b) => b.table === n && b.status === 'open' && b.lines.length > 0);
              const tableTickets = tickets.filter((t) => t.table === n && t.status !== 'served');
              const pendingCall = calls.find((c) => c.table === n && c.status === 'pending');
              return (
                <div style={{ background: COLORS.panel, border: `1px solid ${COLORS.border}`, borderRadius: 6, padding: 18, maxWidth: 480 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                    <h3 style={{ ...subTitleStyle, margin: 0, border: 'none', padding: 0 }}>Table {n} · {status.label}</h3>
                    <button onClick={() => setFloorSelected(null)} style={iconBtnStyle}><X size={13} /></button>
                  </div>

                  {pendingCall && (
                    <button onClick={() => acknowledgeCall(pendingCall.id)} style={{ ...primaryBtnStyle(COLORS.urgent), width: '100%', justifyContent: 'center', marginBottom: 12 }}>
                      <Bell size={14} /> Acknowledge call
                    </button>
                  )}

                  {tableTickets.length > 0 && (
                    <div style={{ marginBottom: 12 }}>
                      {tableTickets.map((t) => (
                        <div key={t.id} style={{ fontSize: 12, color: COLORS.muted, padding: '3px 0' }}>
                          {STATION_META[t.station].label}: {t.items.map((i) => `${i.qty}× ${i.name}`).join(', ')} — <span style={{ color: t.status === 'ready' ? COLORS.warn : COLORS.ember }}>{t.status}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {bill && <div style={{ fontSize: 13, color: COLORS.cream, marginBottom: 12 }}>Open bill: {money(bill.lines.reduce((s, l) => s + l.price * l.qty, 0))}</div>}

                  {bill && (
                    <button onClick={() => { selectPayTable(n); setView('checkout'); }} style={{ ...primaryBtnStyle(COLORS.good), marginBottom: 14 }}>
                      <CreditCard size={14} /> Go to checkout
                    </button>
                  )}

                  <label style={labelStyle}>Table QR code</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <img src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(tableUrl(n))}`} alt={`QR for table ${n}`} style={{ width: 90, height: 90, borderRadius: 4, background: '#fff', padding: 4 }} />
                    <div style={{ fontSize: 11, color: COLORS.muted, wordBreak: 'break-all' }}>{tableUrl(n)}</div>
                  </div>
                </div>
              );
            })()}
          </div>
        )}

        {view === 'menu' && !isGuestMode && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18, flexWrap: 'wrap', gap: 10 }}>
              <h2 style={titleStyle}>Menu editor</h2>
              <button onClick={startNewItem} style={primaryBtnStyle(COLORS.ember)}><Plus size={14} /> Add item</button>
            </div>

            {categories.map((cat) => (
              <div key={cat} style={{ marginBottom: 22 }}>
                <h3 style={subTitleStyle}>{cat}</h3>
                {menu.filter((m) => m.category === cat).map((item) => (
                  <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: `1px solid ${COLORS.border}55` }}>
                    <div style={{ width: 40, height: 40, borderRadius: 4, overflow: 'hidden', background: '#2A2620', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {item.image ? <img src={item.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <ImageIcon size={16} color={COLORS.muted} />}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ color: COLORS.cream, fontSize: 14 }}>{item.name}</div>
                      <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: COLORS.muted }}>
                        {money(item.price)} · {STATION_META[item.station]?.label}
                        {item.modifierGroups && item.modifierGroups.length > 0 && <span style={{ color: COLORS.ember }}> · {item.modifierGroups.length} option group{item.modifierGroups.length > 1 ? 's' : ''}</span>}
                      </div>
                    </div>
                    <button onClick={() => startEditItem(item)} style={iconBtnStyle}><Edit3 size={13} /></button>
                    <button onClick={() => deleteItem(item.id)} style={iconBtnStyle}><Trash2 size={13} /></button>
                  </div>
                ))}
              </div>
            ))}

            {draftItem && (
              <div style={{ position: 'fixed', inset: 0, background: '#00000080', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, zIndex: 50 }}>
                <div style={{ background: COLORS.panel, border: `1px solid ${COLORS.border}`, borderRadius: 6, padding: 20, width: '100%', maxWidth: 440, maxHeight: '90vh', overflowY: 'auto' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                    <h3 style={{ ...subTitleStyle, margin: 0, border: 'none', padding: 0 }}>{draftItem.id ? 'Edit item' : 'New item'}</h3>
                    <button onClick={() => setDraftItem(null)} style={iconBtnStyle}><X size={13} /></button>
                  </div>

                  <label style={labelStyle}>Photo</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                    <div style={{ width: 56, height: 56, borderRadius: 4, overflow: 'hidden', background: '#2A2620', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      {uploading ? <Loader2 size={18} className="spin" color={COLORS.muted} /> : draftItem.image ? <img src={draftItem.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <ImageIcon size={20} color={COLORS.muted} />}
                    </div>
                    <input type="file" accept="image/*" onChange={handleImageChange} style={{ fontSize: 12, color: COLORS.cream, maxWidth: 200 }} />
                  </div>

                  <label style={labelStyle}>Name</label>
                  <input value={draftItem.name} onChange={(e) => setDraftItem({ ...draftItem, name: e.target.value })} style={inputStyle} />

                  <label style={labelStyle}>Category</label>
                  <input value={draftItem.category} onChange={(e) => setDraftItem({ ...draftItem, category: e.target.value })} style={inputStyle} list="categories" />
                  <datalist id="categories">{categories.map((c) => <option key={c} value={c} />)}</datalist>

                  <label style={labelStyle}>Station</label>
                  <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                    {['kitchen', 'bar'].map((s) => (
                      <button key={s} onClick={() => setDraftItem({ ...draftItem, station: s })} style={{ flex: 1, padding: '7px 0', borderRadius: 4, fontSize: 13, fontWeight: 600, cursor: 'pointer', border: `1px solid ${draftItem.station === s ? STATION_META[s].accent : COLORS.border}`, background: draftItem.station === s ? `${STATION_META[s].accent}22` : 'transparent', color: draftItem.station === s ? STATION_META[s].accent : COLORS.muted }}>{STATION_META[s].label}</button>
                    ))}
                  </div>

                  <label style={labelStyle}>Price (USD)</label>
                  <input value={draftItem.price} onChange={(e) => setDraftItem({ ...draftItem, price: e.target.value })} type="number" step="0.5" min="0" style={inputStyle} />

                  <label style={labelStyle}>Options (optional — for combos/sets)</label>
                  {(draftItem.modifierGroups || []).map((g) => (
                    <div key={g.id} style={{ border: `1px solid ${COLORS.border}`, borderRadius: 4, padding: 10, marginBottom: 8 }}>
                      <div style={{ display: 'flex', gap: 6, marginBottom: 6 }}>
                        <input value={g.name} onChange={(e) => updateGroup(g.id, { name: e.target.value })} placeholder="Group name e.g. Spice Level" style={{ ...inputStyle, flex: 1 }} />
                        <button onClick={() => updateGroup(g.id, { required: !g.required })} style={{ ...iconBtnStyle, width: 'auto', padding: '0 8px', fontSize: 11, color: g.required ? COLORS.ember : COLORS.muted, borderColor: g.required ? COLORS.ember : COLORS.border }}>{g.required ? 'Required' : 'Optional'}</button>
                        <button onClick={() => removeGroup(g.id)} style={iconBtnStyle}><Trash2 size={12} /></button>
                      </div>
                      {g.options.map((o) => (
                        <div key={o.id} style={{ display: 'flex', gap: 6, marginBottom: 4 }}>
                          <input value={o.label} onChange={(e) => updateOption(g.id, o.id, { label: e.target.value })} placeholder="Option label" style={{ ...inputStyle, flex: 2 }} />
                          <input value={o.priceDelta} onChange={(e) => updateOption(g.id, o.id, { priceDelta: parseFloat(e.target.value) || 0 })} type="number" step="0.5" placeholder="+$" style={{ ...inputStyle, flex: 1 }} />
                          <button onClick={() => removeOption(g.id, o.id)} style={iconBtnStyle}><X size={12} /></button>
                        </div>
                      ))}
                      <button onClick={() => addOption(g.id)} style={{ ...primaryBtnStyle(COLORS.border), background: 'transparent', color: COLORS.muted, border: `1px dashed ${COLORS.border}`, fontSize: 11, padding: '5px 10px' }}><Plus size={11} /> Add option</button>
                    </div>
                  ))}
                  <button onClick={addGroup} style={{ ...primaryBtnStyle(COLORS.border), background: 'transparent', color: COLORS.muted, border: `1px dashed ${COLORS.border}`, fontSize: 12 }}><Plus size={12} /> Add option group</button>

                  <button onClick={saveDraftItem} style={{ ...primaryBtnStyle(COLORS.ember), width: '100%', justifyContent: 'center', marginTop: 16 }}><Check size={14} /> Save item</button>
                </div>
              </div>
            )}
          </div>
        )}

        {view === 'checkout' && !isGuestMode && (
          <div>
            <h2 style={titleStyle}>Checkout</h2>
            <p style={{ color: COLORS.muted, fontSize: 13, marginTop: 4, marginBottom: 18 }}>Pick a table to close out their check.</p>

            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 24 }}>
              {TABLES.map((n) => {
                const bill = openBillForTable(n);
                const isSelected = payTable === n;
                return (
                  <button key={n} onClick={() => bill && selectPayTable(n)} disabled={!bill} style={{ width: 50, height: 50, borderRadius: 4, border: `1px solid ${isSelected ? COLORS.good : bill ? COLORS.warn : COLORS.border}`, background: isSelected ? COLORS.good : bill ? `${COLORS.warn}22` : COLORS.panel, color: isSelected ? '#fff' : bill ? COLORS.warn : COLORS.muted, fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, fontSize: 14, cursor: bill ? 'pointer' : 'not-allowed', opacity: bill ? 1 : 0.5 }}>{n}</button>
                );
              })}
            </div>

            {payTable && (() => {
              const bill = openBillForTable(payTable);
              if (!bill) return <p style={{ color: COLORS.muted, fontSize: 13 }}>No open check for this table.</p>;
              const { subtotal, tip, total } = computeTotals(bill);

              if (paySuccess) {
                return (
                  <div style={{ background: COLORS.paper, borderRadius: 4, padding: 24, maxWidth: 380, textAlign: 'center' }}>
                    <Check size={32} color={COLORS.good} style={{ marginBottom: 8 }} />
                    <div style={{ fontFamily: "'Oswald', sans-serif", fontSize: 20, color: COLORS.ink, marginBottom: 4 }}>Payment received</div>
                    <div style={{ fontSize: 13, color: COLORS.ink, opacity: 0.7, marginBottom: 16 }}>Table {payTable} · {money(total)} paid</div>
                    <button onClick={() => setPayTable(null)} style={{ ...primaryBtnStyle(COLORS.ember), justifyContent: 'center', width: '100%' }}>Done</button>
                  </div>
                );
              }

              return (
                <div style={{ background: COLORS.paper, color: COLORS.ink, borderRadius: 4, borderTop: `3px dashed ${COLORS.warn}80`, padding: 20, maxWidth: 420 }}>
                  <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, opacity: 0.5, textTransform: 'uppercase', marginBottom: 4 }}>Check</div>
                  <div style={{ fontFamily: "'Oswald', sans-serif", fontSize: 22, marginBottom: 12 }}>Table {payTable}</div>

                  {bill.lines.map((l, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, padding: '3px 0' }}>
                      <span><span style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 700 }}>{l.qty}×</span> {l.name}</span>
                      <span style={{ fontFamily: "'JetBrains Mono', monospace" }}>{money(l.price * l.qty)}</span>
                    </div>
                  ))}

                  <div style={{ borderTop: `1px dashed ${COLORS.ink}30`, marginTop: 10, paddingTop: 10, fontFamily: "'JetBrains Mono', monospace", fontSize: 13 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Subtotal</span><span>{money(subtotal)}</span></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}><span>Tip</span><span>{money(tip)}</span></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: 16, marginTop: 6 }}><span>Total</span><span>{money(total)}</span></div>
                  </div>

                  {bankQR && (
                    <div style={{ marginTop: 14, textAlign: 'center', borderTop: `1px dashed ${COLORS.ink}30`, paddingTop: 14 }}>
                      <div style={{ fontSize: 12, color: COLORS.ink, opacity: 0.6, marginBottom: 8 }}>Scan to pay · {money(total)}</div>
                      <img src={bankQR} alt="Bank payment QR" style={{ width: 160, height: 160, borderRadius: 6, objectFit: 'contain', background: '#fff', padding: 6, margin: '0 auto', display: 'block' }} />
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: 6, marginTop: 12 }}>
                    {[0, 15, 20, 25].map((p) => (
                      <button key={p} onClick={() => setTipPercent(p)} style={{ flex: 1, padding: '6px 0', borderRadius: 3, fontSize: 12, fontWeight: 600, cursor: 'pointer', border: `1px solid ${COLORS.ink}30`, background: tipPercent === p ? COLORS.ink : 'transparent', color: tipPercent === p ? COLORS.paper : COLORS.ink }}>{p === 0 ? 'No tip' : `${p}%`}</button>
                    ))}
                  </div>

                  {!showCardForm ? (
                    <div style={{ display: 'flex', gap: 8, marginTop: 16, flexWrap: 'wrap' }}>
                      <button onClick={() => setShowCardForm(true)} style={{ ...primaryBtnStyle(COLORS.well), flex: 1, justifyContent: 'center' }}><CreditCard size={14} /> Pay by card</button>
                      <button onClick={() => finalizePayment('cash')} style={{ ...primaryBtnStyle(COLORS.good), flex: 1, justifyContent: 'center' }}><Banknote size={14} /> Cash received</button>
                      {bankQR && (
                        <button onClick={() => finalizePayment('qr')} style={{ ...primaryBtnStyle(COLORS.ember), flex: 1, justifyContent: 'center' }}>📱 QR paid</button>
                      )}
                    </div>
                  ) : (
                    <div style={{ marginTop: 16, borderTop: `1px dashed ${COLORS.ink}30`, paddingTop: 14 }}>
                      <label style={{ ...labelStyle, color: COLORS.ink, opacity: 0.6 }}>Name on card</label>
                      <input value={card.name} onChange={(e) => setCard({ ...card, name: e.target.value })} style={{ ...inputStyle, background: '#fff', color: COLORS.ink, border: `1px solid ${COLORS.ink}30` }} />
                      <label style={{ ...labelStyle, color: COLORS.ink, opacity: 0.6 }}>Card number</label>
                      <input value={card.number} onChange={(e) => setCard({ ...card, number: e.target.value.replace(/[^\d]/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim() })} placeholder="4242 4242 4242 4242" style={{ ...inputStyle, background: '#fff', color: COLORS.ink, border: `1px solid ${COLORS.ink}30` }} />
                      <div style={{ display: 'flex', gap: 8 }}>
                        <div style={{ flex: 1 }}>
                          <label style={{ ...labelStyle, color: COLORS.ink, opacity: 0.6 }}>Expiry</label>
                          <input value={card.expiry} onChange={(e) => setCard({ ...card, expiry: e.target.value })} placeholder="MM/YY" style={{ ...inputStyle, background: '#fff', color: COLORS.ink, border: `1px solid ${COLORS.ink}30` }} />
                        </div>
                        <div style={{ flex: 1 }}>
                          <label style={{ ...labelStyle, color: COLORS.ink, opacity: 0.6 }}>CVC</label>
                          <input value={card.cvc} onChange={(e) => setCard({ ...card, cvc: e.target.value })} placeholder="123" style={{ ...inputStyle, background: '#fff', color: COLORS.ink, border: `1px solid ${COLORS.ink}30` }} />
                        </div>
                      </div>
                      <button onClick={() => finalizePayment('card')} disabled={processing} style={{ ...primaryBtnStyle(COLORS.well), width: '100%', justifyContent: 'center', marginTop: 10 }}>
                        {processing ? <Loader2 size={14} className="spin" /> : <CreditCard size={14} />} {processing ? 'Processing…' : `Pay ${money(total)}`}
                      </button>
                      <p style={{ fontSize: 11, color: COLORS.ink, opacity: 0.5, fontStyle: 'italic', marginTop: 8 }}>Demo payment — no real charge is made. Connect a processor like Stripe for live transactions.</p>
                    </div>
                  )}
                </div>
              );
            })()}

            {bills.filter((b) => b.status === 'paid').length > 0 && (
              <div style={{ marginTop: 32 }}>
                <h3 style={subTitleStyle}>Recently closed</h3>
                {bills.filter((b) => b.status === 'paid').sort((a, b) => b.paidAt - a.paidAt).slice(0, 5).map((b) => (
                  <div key={b.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: COLORS.muted, padding: '4px 0' }}>
                    <span>Table {b.table}</span>
                    <span style={{ fontFamily: "'JetBrains Mono', monospace" }}>{money(b.total)} · {new Date(b.paidAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {view === 'settings' && authRole === 'owner' && (
          <div style={{ maxWidth: 480 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
              <ShieldCheck size={22} color={COLORS.ember} />
              <h2 style={titleStyle}>Settings</h2>
              <span style={{ fontSize: 11, color: COLORS.ember, fontFamily: "'JetBrains Mono', monospace" }}>Owner only</span>
            </div>

            <div style={{ background: COLORS.panel, border: `1px solid ${COLORS.border}`, borderRadius: 6, padding: 18, marginBottom: 16 }}>
              <h3 style={{ ...subTitleStyle, marginTop: 0 }}>Number of tables</h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <button onClick={() => { const n = Math.max(1, tableCount - 1); saveConfig({ tableCount: n }); }} style={{ ...iconBtnStyle, width: 36, height: 36 }}><Minus size={16} /></button>
                <span style={{ fontFamily: "'Oswald', sans-serif", fontSize: 36, color: COLORS.cream, minWidth: 48, textAlign: 'center' }}>{tableCount}</span>
                <button onClick={() => { const n = Math.min(50, tableCount + 1); saveConfig({ tableCount: n }); }} style={{ ...iconBtnStyle, width: 36, height: 36 }}><Plus size={16} /></button>
              </div>
              <p style={{ fontSize: 12, color: COLORS.muted, marginTop: 10 }}>Changes take effect immediately on all devices. QR codes for new tables appear in the Floor map.</p>
            </div>

            <div style={{ background: COLORS.panel, border: `1px solid ${COLORS.border}`, borderRadius: 6, padding: 18, marginBottom: 16 }}>
              <h3 style={{ ...subTitleStyle, marginTop: 0 }}>Bank payment QR code</h3>
              <p style={{ fontSize: 12, color: COLORS.muted, marginBottom: 12 }}>Upload your bank's QR code. It will appear on every checkout bill so customers can scan and pay directly.</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                {bankQR ? (
                  <img src={bankQR} alt="Bank QR" style={{ width: 90, height: 90, borderRadius: 4, objectFit: 'contain', background: '#fff', padding: 4 }} />
                ) : (
                  <div style={{ width: 90, height: 90, borderRadius: 4, background: COLORS.bg, border: `1px dashed ${COLORS.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <ImageIcon size={24} color={COLORS.muted} />
                  </div>
                )}
                <div>
                  <input type="file" accept="image/*" onChange={handleBankQRChange} style={{ fontSize: 12, color: COLORS.cream }} />
                  {bankQR && <button onClick={() => saveConfig({ bankQR: '' })} style={{ display: 'block', marginTop: 8, fontSize: 12, color: COLORS.urgent, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>Remove QR</button>}
                </div>
              </div>
            </div>

            <div style={{ background: COLORS.panel, border: `1px solid ${COLORS.border}`, borderRadius: 6, padding: 18, marginBottom: 16 }}>
              <h3 style={{ ...subTitleStyle, marginTop: 0 }}>Change PINs</h3>
              {settingsDraft === null ? (
                <button onClick={() => setSettingsDraft({ ownerPin, staffPin })} style={primaryBtnStyle(COLORS.ember)}><Edit3 size={13} /> Edit PINs</button>
              ) : (
                <div>
                  <label style={labelStyle}>Owner PIN (you)</label>
                  <input value={settingsDraft.ownerPin} onChange={(e) => setSettingsDraft({ ...settingsDraft, ownerPin: e.target.value.replace(/\D/g,'').slice(0,8) })} placeholder="4–8 digits" style={inputStyle} type="password" />
                  <label style={labelStyle}>Staff PIN</label>
                  <input value={settingsDraft.staffPin} onChange={(e) => setSettingsDraft({ ...settingsDraft, staffPin: e.target.value.replace(/\D/g,'').slice(0,8) })} placeholder="4–8 digits" style={inputStyle} type="password" />
                  <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
                    <button onClick={async () => { await saveConfig({ ownerPin: settingsDraft.ownerPin, staffPin: settingsDraft.staffPin }); setSettingsDraft(null); setFlash('PINs updated'); }} style={primaryBtnStyle(COLORS.good)}><Check size={13} /> Save PINs</button>
                    <button onClick={() => setSettingsDraft(null)} style={{ ...primaryBtnStyle(COLORS.border), background: 'transparent', color: COLORS.muted, border: `1px solid ${COLORS.border}` }}><X size={13} /> Cancel</button>
                  </div>
                  <p style={{ fontSize: 11, color: COLORS.muted, marginTop: 8 }}>Write the new PINs down before saving. If you forget the owner PIN, you'll need to reset via the Render dashboard shell.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {customizeItem && (
        <CustomizeModal
          item={customizeItem}
          selections={customizeSelections}
          onSelect={(gid, oid) => setCustomizeSelections((prev) => ({ ...prev, [gid]: oid }))}
          qty={customizeQty}
          onQtyChange={setCustomizeQty}
          notes={customizeNotes}
          onNotes={setCustomizeNotes}
          onCancel={() => setCustomizeItem(null)}
          onConfirm={confirmCustomize}
        />
      )}
    </div>
  );
}
