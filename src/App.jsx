import React, { useState, useEffect, useRef } from 'react';
import {
  ChefHat, Wine, UtensilsCrossed, Clock, Plus, Minus, Flame, Check, X,
  CreditCard, Edit3, Image as ImageIcon, Trash2, Loader2, Banknote, Bell, Map as MapIcon,
  Lock, Settings as SettingsIcon, LogOut, ShieldCheck, BarChart2, TrendingUp, Users, ShoppingBag,
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
  { id: 'm10', name: 'Extra Beef Slices', category: 'Extras', station: 'kitchen', price: 8, image: '', modifierGroups: [] },
  { id: 'm11', name: 'Extra Pork Belly', category: 'Extras', station: 'kitchen', price: 8, image: '', modifierGroups: [] },
  { id: 'm18', name: 'Extra Chicken', category: 'Extras', station: 'kitchen', price: 7, image: '', modifierGroups: [] },
  { id: 'm19', name: 'Extra Lamb', category: 'Extras', station: 'kitchen', price: 9, image: '', modifierGroups: [] },
  { id: 'm12', name: 'Soju', category: 'Drinks', subcategory: 'Others', station: 'bar', price: 9, image: '', modifierGroups: [] },
  { id: 'm13', name: 'Makgeolli (Rice Wine)', category: 'Drinks', subcategory: 'Others', station: 'bar', price: 10, image: '', modifierGroups: [] },
  { id: 'm14', name: 'Korean Beer (Cass)', category: 'Drinks', subcategory: 'Others', station: 'bar', price: 7, image: '', modifierGroups: [] },
  { id: 'm15', name: 'Yuzu Soju Cocktail', category: 'Drinks', subcategory: 'Cocktails', station: 'bar', price: 11, image: '', modifierGroups: [] },
  { id: 'm20', name: 'Lychee Soju Cocktail', category: 'Drinks', subcategory: 'Cocktails', station: 'bar', price: 11, image: '', modifierGroups: [] },
  { id: 'm21', name: 'Peach Makgeolli Cocktail', category: 'Drinks', subcategory: 'Cocktails', station: 'bar', price: 12, image: '', modifierGroups: [] },
  { id: 'm16', name: 'Barley Tea', category: 'Drinks', subcategory: 'Soft Drinks', station: 'bar', price: 3, image: '', modifierGroups: [] },
  { id: 'm17', name: 'Sikhye (Sweet Rice Drink)', category: 'Drinks', subcategory: 'Soft Drinks', station: 'bar', price: 5, image: '', modifierGroups: [] },
  { id: 'm22', name: 'Cola', category: 'Drinks', subcategory: 'Soft Drinks', station: 'bar', price: 2, image: '', modifierGroups: [] },
  { id: 'm23', name: 'Sparkling Water', category: 'Drinks', subcategory: 'Soft Drinks', station: 'bar', price: 2, image: '', modifierGroups: [] },
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

function getCurrency() {
  try {
    const code = localStorage.getItem('tf_restaurant_code') || '';
    const cacheKey = code ? `config_cache_${code}` : null;
    if (!cacheKey) return { sym:'Nu', pos:'before', dec:0 };
    const cfg = JSON.parse(localStorage.getItem(cacheKey) || '{}');
    return { sym: cfg.currencySymbol||'Nu', pos: cfg.currencyPosition||'before', dec: cfg.currencyDecimals||0 };
  } catch { return { sym:'Nu', pos:'before', dec:0 }; }
}
const money = (n, sym, pos, dec) => {
  if (sym === undefined) { const c = getCurrency(); sym=c.sym; pos=c.pos; dec=c.dec; }
  const amt = (Number(n)||0).toFixed(dec);
  return pos === 'before' ? `${sym} ${amt}` : `${amt} ${sym}`;
};

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
function customerAppUrl(restaurantCode) {
  if (typeof window === 'undefined') return '';
  return `${window.location.origin}/customer?code=${restaurantCode}`;
}
function tableOrderUrl(restaurantCode, tableNum) {
  if (typeof window === 'undefined') return '';
  return `${window.location.origin}/customer?code=${restaurantCode}&table=${tableNum}`;
}
function getTableStatus(n, tickets, bills, calls, reservations=[]) {
  const callPending = calls.some((c) => c.table === n && c.status === 'pending' && c.type !== 'booking');
  if (callPending) return { key: 'calling', label: 'Calling staff', color: COLORS.urgent, pulse: true };
  const activeTickets = tickets.filter((t) => t.table === n && t.status !== 'served' && t.status !== 'cancelled');
  if (activeTickets.some((t) => t.status === 'ready')) return { key: 'ready', label: 'Ready to serve', color: COLORS.warn };
  if (activeTickets.length > 0) return { key: 'cooking', label: 'Preparing', color: COLORS.ember };
  const openBill = bills.find((b) => b.table === n && b.status === 'open' && b.lines.length > 0);
  if (openBill) return { key: 'payment', label: 'Awaiting payment', color: COLORS.good };
  const reserved = reservations.find((r) => r.table === n && r.status === 'reserved');
  if (reserved) return { key: 'reserved', label: `Reserved · ${reserved.time || ''}`, color: COLORS.well };
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

function TicketCard({ ticket, now, onAdvance, onCancelItem }) {
  const [confirmCancel, setConfirmCancel] = React.useState(null);
  if (!ticket || !ticket.items || ticket.status === 'cancelled') return null;
  const elapsed = now - (ticket.firedAt || now);
  const level = ageLevel(elapsed);
  const levelColor = level === 'calm' ? COLORS.muted : level === 'warn' ? COLORS.warn : COLORS.urgent;
  const nextLabel = ticket.status === 'new' ? 'Start' : ticket.status === 'preparing' ? 'Mark ready' : 'Served';
  const accent = (STATION_META[ticket.station] || STATION_META.kitchen).accent;
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
          <li key={i} style={{ fontSize: 14, padding: '5px 0', borderTop: i === 0 ? 'none' : `1px solid ${COLORS.ink}15` }}>
            {confirmCancel === i ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: `${COLORS.urgent}15`, padding: '4px 6px', borderRadius: 4 }}>
                <span style={{ flex: 1, fontSize: 12 }}>Remove {it.qty}× {it.name}?</span>
                <button onClick={() => { onCancelItem(ticket.id, i); setConfirmCancel(null); }} style={{ background: COLORS.urgent, color: '#fff', border: 'none', borderRadius: 3, padding: '3px 8px', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>Yes</button>
                <button onClick={() => setConfirmCancel(null)} style={{ background: COLORS.muted, color: '#fff', border: 'none', borderRadius: 3, padding: '3px 8px', fontSize: 12, cursor: 'pointer' }}>No</button>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 6 }}>
                <div style={{ flex: 1 }}>
                  <span style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 700 }}>{it.qty}×</span> {it.name}
                  {it.notes ? <div style={{ fontSize: 12, fontStyle: 'italic', opacity: 0.7, marginLeft: 22 }}>{it.notes}</div> : null}
                </div>
                <button onClick={() => setConfirmCancel(i)} title="Cancel this item" style={{ flexShrink: 0, marginTop: 2, width: 20, height: 20, borderRadius: 3, border: `1px solid ${COLORS.urgent}55`, background: `${COLORS.urgent}18`, color: COLORS.urgent, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                  <X size={11} />
                </button>
              </div>
            )}
          </li>
        ))}
      </ul>
      <button onClick={() => onAdvance(ticket.id)} style={{ marginTop: 12, width: '100%', background: accent, color: '#fff', border: 'none', borderRadius: 3, padding: '8px 0', fontFamily: "'Inter', sans-serif", fontWeight: 600, fontSize: 13, letterSpacing: 0.3, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
        <Check size={14} /> {nextLabel}
      </button>
    </div>
  );
}

function StationBoard({ station, tickets, now, onAdvance, onCancelItem }) {
  const meta = STATION_META[station] || STATION_META.kitchen;
  const active = (tickets || []).filter((t) => t && t.station === station && t.status !== 'served' && t.status !== 'cancelled');
  const lanes = [{ key: 'new', label: 'New' }, { key: 'preparing', label: 'Preparing' }, { key: 'ready', label: 'Ready' }];
  const stationHeadStyle = { fontFamily: "'Oswald', sans-serif", fontSize: 22, letterSpacing: 1, textTransform: 'uppercase', margin: 0, color: COLORS.cream };
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
        <meta.Icon size={22} color={meta.accent} />
        <h2 style={stationHeadStyle}>{meta.label} display</h2>
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
                laneTickets.map((t) => <TicketCard key={t.id} ticket={t} now={now} onAdvance={onAdvance} onCancelItem={onCancelItem} />)
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
  const oos = !!item.outOfStock;
  return (
    <div onClick={oos ? undefined : onTap} style={{ cursor: oos ? 'not-allowed' : 'pointer', position: 'relative', background: COLORS.panel, border: `1px solid ${oos ? COLORS.border : COLORS.border}`, borderRadius: 6, overflow: 'hidden', display: 'flex', flexDirection: 'column', opacity: oos ? 0.6 : 1 }}>
      <div style={{ width: '100%', aspectRatio: '4 / 3', background: '#2A2620', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', position: 'relative' }}>
        {item.image ? <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover', filter: oos ? 'grayscale(80%)' : 'none' }} /> : <ImageIcon size={24} color={COLORS.muted} />}
        {hasMods && !oos && (
          <div style={{ position: 'absolute', bottom: 6, left: 6, background: '#00000099', color: COLORS.cream, fontSize: 10, padding: '2px 6px', borderRadius: 3 }}>Customize</div>
        )}
        {oos && (
          <div style={{ position: 'absolute', inset: 0, background: '#00000070', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ background: COLORS.urgent, color: '#fff', fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 4, letterSpacing: 0.5, textTransform: 'uppercase' }}>Out of Stock</span>
          </div>
        )}
      </div>
      <div style={{ padding: '8px 10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: oos ? COLORS.muted : accent, display: 'inline-block', flexShrink: 0 }} />
          <span style={{ color: COLORS.cream, fontSize: 13, fontWeight: 600, lineHeight: 1.2 }}>{item.name}</span>
        </div>
        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: COLORS.muted, marginTop: 3 }}>{oos ? <span style={{ color: COLORS.urgent }}>Unavailable</span> : money(item.price)}</div>
      </div>
      {qty > 0 && !oos && (
        <div style={{ position: 'absolute', top: 6, right: 6, background: accent, color: '#fff', borderRadius: 12, minWidth: 22, height: 22, padding: '0 6px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace" }}>
          {qty}
        </div>
      )}
    </div>
  );
}

// ---------- Customize modal (combo/set options) ----------

function CustomizeModal({ item, selections, onSelect, qty, onQtyChange, notes, onNotes, onCancel, onConfirm }) {
  if (!item || !item.modifierGroups) return null;
  const extra = item.modifierGroups.reduce((sum, g) => {
    const sel = selections[g.id];
    if (!sel) return sum;
    const opt = g.options.find((o) => o.id === sel);
    return sum + (opt ? opt.priceDelta : 0);
  }, 0);
  const unitPrice = item.price + extra;
  const modalHeadStyle = { fontFamily: "'Oswald', sans-serif", textTransform: 'uppercase', letterSpacing: 1.5, fontSize: 15, color: COLORS.cream, margin: 0, border: 'none', padding: 0 };
  return (
    <div style={{ position: 'fixed', inset: 0, background: '#00000080', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, zIndex: 60 }}>
      <div style={{ background: COLORS.panel, border: `1px solid ${COLORS.border}`, borderRadius: 6, padding: 20, width: '100%', maxWidth: 420, maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
          <h3 style={modalHeadStyle}>{item.name}</h3>
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
                  <button key={o.id} onClick={() => onSelect(g.id, active && !g.required ? null : o.id)} style={{ padding: '7px 12px', borderRadius: 4, fontSize: 13, cursor: 'pointer', border: `1px solid ${active ? COLORS.ember : COLORS.border}`, background: active ? `${COLORS.ember}22` : 'transparent', color: active ? COLORS.ember : COLORS.cream }}>
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

// ---------- Error boundary (catches crashes, shows reload button) ----------

class ErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { crashed: false }; }
  static getDerivedStateFromError() { return { crashed: true }; }
  render() {
    if (this.state.crashed) {
      return (
        <div style={{ minHeight: '100vh', background: '#16140F', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, padding: 24 }}>
          <div style={{ fontFamily: "'Oswald', sans-serif", fontSize: 22, color: '#F2ECDD', letterSpacing: 2 }}>{restaurantName}</div>
          <div style={{ fontSize: 14, color: '#9A9384', textAlign: 'center' }}>Something went wrong. Tap below to reload.</div>
          <button onClick={() => window.location.reload()} style={{ padding: '12px 28px', background: '#D9622B', color: '#fff', border: 'none', borderRadius: 6, fontSize: 15, fontWeight: 700, cursor: 'pointer' }}>
            Reload app
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

// ---------- Main app ----------

// ---------- Emergency unlock component ----------
function EmergencyUnlock({ ownerPin, staffPin, onStaff, onOwner }) {
  const [taps, setTaps] = React.useState(0);
  const [showPin, setShowPin] = React.useState(false);
  const [pin, setPin] = React.useState('');
  const [error, setError] = React.useState('');
  const tapTimer = React.useRef(null);

  function handleLockTap() {
    const newTaps = taps + 1;
    setTaps(newTaps);
    clearTimeout(tapTimer.current);
    if (newTaps >= 5) { setShowPin(true); setTaps(0); return; }
    tapTimer.current = setTimeout(() => setTaps(0), 2000);
  }

  function tryPin() {
    if (pin === ownerPin) { setShowPin(false); setPin(''); setError(''); onOwner(); }
    else if (pin === staffPin) { setShowPin(false); setPin(''); setError(''); onStaff(); }
    else { setError('Wrong PIN'); setPin(''); }
  }

  if (showPin) return (
    <div style={{ marginTop: 32, background: '#00000066', borderRadius: 12, padding: 20, maxWidth: 280, margin: '32px auto 0' }}>
      <div style={{ color: COLORS.cream, fontSize: 13, marginBottom: 14 }}>Enter staff or owner PIN</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8, marginBottom: 12 }}>
        {[1,2,3,4,5,6,7,8,9,'⌫',0,'→'].map((k) => (
          <button key={k} onClick={() => {
            if (k === '⌫') setPin(p => p.slice(0,-1));
            else if (k === '→') tryPin();
            else if (pin.length < 8) setPin(p => p + k);
          }} style={{ height: 48, borderRadius: 6, border: `1px solid ${k === '→' ? COLORS.ember : COLORS.border}`, background: k === '→' ? COLORS.ember : COLORS.panel, color: '#fff', fontSize: k === '→' || k === '⌫' ? 18 : 20, cursor: 'pointer' }}>
            {k}
          </button>
        ))}
      </div>
      <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 8 }}>
        {Array.from({ length: Math.max(4, pin.length) }).map((_, i) => (
          <div key={i} style={{ width: 10, height: 10, borderRadius: '50%', background: i < pin.length ? COLORS.ember : COLORS.border }} />
        ))}
      </div>
      {error && <div style={{ color: COLORS.urgent, fontSize: 12, marginTop: 6 }}>{error}</div>}
      <button onClick={() => { setShowPin(false); setPin(''); setError(''); }} style={{ marginTop: 10, background: 'none', border: 'none', color: COLORS.muted, fontSize: 12, cursor: 'pointer', width: '100%' }}>Cancel</button>
    </div>
  );

  return (
    <div onClick={handleLockTap} style={{ marginTop: 36, width: 64, height: 64, borderRadius: '50%', border: `3px solid ${taps > 0 ? COLORS.ember : COLORS.ember + '55'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '36px auto 0', cursor: 'pointer', transition: 'border-color 0.2s' }}>
      <Lock size={26} color={taps > 0 ? COLORS.ember : COLORS.ember + '88'}/>
    </div>
  );
}

export { ErrorBoundary };

function KoreanRestaurantPOS() {
  // Tablet mode — set permanently per device by staff, no URL param needed
  // Device role — set once by you during setup, stored permanently
  const [deviceRole, setDeviceRole] = useState(() => {
    try { return localStorage.getItem('thab_device_role') || null; } catch { return null; }
  });
  const restaurantCode = (() => {
    try {
      const code = localStorage.getItem('tf_restaurant_code') || '';
      if (code) import('./lib/storage').then(m => m.setRestaurantCode(code));
      return code;
    } catch { return ''; }
  })();
  // 'owner-staff' = owner/staff device (PIN screen), 'table-N' = table tablet

  function assignDeviceRole(role) {
    setDeviceRole(role);
    try { localStorage.setItem('thab_device_role', role); } catch {}
    if (role.startsWith('table-')) {
      const n = parseInt(role.split('-')[1]);
      try {
        localStorage.setItem('thab_tablet_table', String(n));
        localStorage.setItem('thab_tablet_locked', 'true');
        localStorage.removeItem('thab_role');
      } catch {}
      setTabletTable(n);     // ← update state so isGuestMode becomes true immediately
      setTabletLocked(true); // ← show locked screen right away
      setAuthRole(null);     // ← clear any staff auth
    }
  }

  const [tabletTable, setTabletTable] = useState(() => {
    try { return parseInt(localStorage.getItem('thab_tablet_table') || '0', 10) || null; } catch { return null; }
  });
  const [tabletLocked, setTabletLocked] = useState(() => {
    try { return localStorage.getItem('thab_tablet_locked') !== 'false'; } catch { return true; }
  });

  const guestTable = tabletTable;
  const isGuestMode = tabletTable !== null;
  const isLockedScreen = isGuestMode && tabletLocked;

  const [loading, setLoading] = useState(true);
  const [connected, setConnected] = useState(true);

  // --- auth ---
  const [authRole, setAuthRole] = useState(() => {
    try {
      // Table tablets must NEVER have authRole — clear it if somehow set
      const role = localStorage.getItem('thab_role');
      const tabletT = localStorage.getItem('thab_tablet_table');
      if (tabletT && parseInt(tabletT) > 0) {
        localStorage.removeItem('thab_role');
        return null;
      }
      return role || null;
    } catch { return null; }
  });
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState('');
  const [ownerPin, setOwnerPin] = useState('1234');
  const [staffPin, setStaffPin] = useState('5678');

  function persistRole(role) {
    setAuthRole(role);
    try { if (role) localStorage.setItem('thab_role', role); else localStorage.removeItem('thab_role'); } catch {}
  }

  function unlockTablet() {
    setTabletLocked(false);
    try { localStorage.setItem('thab_tablet_locked', 'false'); } catch {}
  }

  function lockTablet() {
    setTabletLocked(true);
    try {
      localStorage.setItem('thab_tablet_locked', 'true');
      localStorage.setItem('thab_last_lock', String(Date.now()));
    } catch {}
  }

  // --- settings ---
  const [tableCount, setTableCount] = useState(DEFAULT_TABLE_COUNT);
  const [bankQR, setBankQR] = useState('');
  const [settingsDraft, setSettingsDraft] = useState(null);
  const [pageBg, setPageBg] = useState('');
  const [headerBg, setHeaderBg] = useState('');
  const [fontFamily, setFontFamily] = useState('Inter');
  const [fontSize, setFontSize] = useState('medium');
  const [fontColor, setFontColor] = useState('#F2ECDD');
  const [textBg, setTextBg] = useState('rgba(22,20,15,0.72)');
  const [headingBg, setHeadingBg] = useState('rgba(0,0,0,0.55)');
  const [headingSize, setHeadingSize] = useState('medium');
  const [defaultServiceCharge, setDefaultServiceCharge] = useState(0);
  const [defaultGst, setDefaultGst] = useState(0);
  const [kitchenPin, setKitchenPin] = useState('5678');
  const [barPin, setBarPin] = useState('5678');
  const [currencySymbol, setCurrencySymbol] = useState('Nu');
  const [currencyPosition, setCurrencyPosition] = useState('before');
  const [currencyDecimals, setCurrencyDecimals] = useState(0);
  const fmt = (n) => money(n, currencySymbol, currencyPosition, currencyDecimals);

  const DEFAULT_CATEGORIES = [
    { id: 'cat-starters', name: 'Starters', subcategories: [] },
    { id: 'cat-mains', name: 'Mains', subcategories: [] },
    { id: 'cat-combos', name: 'Combos', subcategories: [] },
    { id: 'cat-extras', name: 'Extras', subcategories: [] },
    { id: 'cat-drinks', name: 'Drinks', subcategories: ['Soft Drinks', 'Cocktails', 'Others'] },
  ];
  const [menuCategories, setMenuCategories] = useState(DEFAULT_CATEGORIES);
  const [editingCat, setEditingCat] = useState(null); // category being edited
  const [restaurantName, setRestaurantName] = useState('THAB - BHUTANESE BBQ');

  const TABLES = makeTables(tableCount);

  const [menu, setMenu] = useState(DEFAULT_MENU);
  const [tickets, setTickets] = useState([]);
  const [bills, setBills] = useState([]);
  const [calls, setCalls] = useState([]);
  const [reservations, setReservations] = useState([]);

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
  const [serviceCharge, setServiceCharge] = useState(0);
  const [gst, setGst] = useState(0);
  const [showCardForm, setShowCardForm] = useState(false);
  const [card, setCard] = useState({ name: '', number: '', expiry: '', cvc: '' });
  const [processing, setProcessing] = useState(false);
  const [paySuccess, setPaySuccess] = useState(false);

  const [floorSelected, setFloorSelected] = useState(null);
  const [showCalls, setShowCalls] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedDrinkSub, setSelectedDrinkSub] = useState(null);
  const [showGuestBill, setShowGuestBill] = useState(false);

  const processingRef = useRef(false);
  useEffect(() => { processingRef.current = processing; }, [processing]);

  useEffect(() => {
    // Restore config instantly from localStorage — scoped to THIS restaurant only
    try {
      const cacheKey = restaurantCode ? `config_cache_${restaurantCode}` : null;
      if (!cacheKey) return; // No restaurant code = no cache, use defaults
      const local = JSON.parse(localStorage.getItem(cacheKey) || '{}');
      if (local.ownerPin) setOwnerPin(local.ownerPin);
      if (local.staffPin) setStaffPin(local.staffPin);
      if (local.tableCount) setTableCount(local.tableCount);
      if (local.bankQR !== undefined) setBankQR(local.bankQR);
      if (local.pageBg !== undefined) setPageBg(local.pageBg);
      if (local.headerBg !== undefined) setHeaderBg(local.headerBg);
      if (local.fontFamily) setFontFamily(local.fontFamily);
      if (local.fontSize) setFontSize(local.fontSize);
      if (local.fontColor) setFontColor(local.fontColor);
      if (local.textBg) setTextBg(local.textBg);
      if (local.headingBg !== undefined) setHeadingBg(local.headingBg);
      if (local.headingSize) setHeadingSize(local.headingSize);
      if (local.defaultServiceCharge !== undefined) setDefaultServiceCharge(local.defaultServiceCharge);
      if (local.defaultGst !== undefined) setDefaultGst(local.defaultGst);
      if (local.menuCategories) setMenuCategories(local.menuCategories);
      if (local.kitchenPin) setKitchenPin(local.kitchenPin);
      if (local.barPin) setBarPin(local.barPin);
      if (local.currencySymbol) setCurrencySymbol(local.currencySymbol);
      if (local.currencyPosition) setCurrencyPosition(local.currencyPosition);
      if (local.currencyDecimals !== undefined) setCurrencyDecimals(local.currencyDecimals);
      if (local.restaurantName) setRestaurantName(local.restaurantName);
    } catch {}

    (async () => {
      const [ok, m, t, b, c, rv, cfg] = await Promise.all([
        checkConnection(),
        loadKey('menu', DEFAULT_MENU),
        loadKey('tickets', []),
        loadKey('bills', []),
        loadKey('calls', []),
        loadKey('reservations', []),
        loadKey('config', {}),
      ]);
      setConnected(ok);
      setMenu(m); setTickets(t); setBills(b); setCalls(c); setReservations(rv||[]);
      if (cfg.ownerPin) setOwnerPin(cfg.ownerPin);
      if (cfg.staffPin) setStaffPin(cfg.staffPin);
      if (cfg.tableCount) setTableCount(cfg.tableCount);
      if (cfg.bankQR) setBankQR(cfg.bankQR);
      if (cfg.pageBg !== undefined) setPageBg(cfg.pageBg);
      if (cfg.headerBg !== undefined) setHeaderBg(cfg.headerBg);
      if (cfg.fontFamily) setFontFamily(cfg.fontFamily);
      if (cfg.fontSize) setFontSize(cfg.fontSize);
      if (cfg.fontColor) setFontColor(cfg.fontColor);
      if (cfg.textBg) setTextBg(cfg.textBg);
      if (cfg.headingBg !== undefined) setHeadingBg(cfg.headingBg);
      if (cfg.headingSize) setHeadingSize(cfg.headingSize);
      if (cfg.defaultServiceCharge !== undefined) setDefaultServiceCharge(cfg.defaultServiceCharge);
      if (cfg.defaultGst !== undefined) setDefaultGst(cfg.defaultGst);
      if (cfg.restaurantName) setRestaurantName(cfg.restaurantName);
      if (cfg.menuCategories) setMenuCategories(cfg.menuCategories);
      if (cfg.kitchenPin) setKitchenPin(cfg.kitchenPin);
      if (cfg.barPin) setBarPin(cfg.barPin);
      setLoading(false);
    })();
  }, []);

  const configLoadedRef = useRef(false);

  useEffect(() => {
    let failCount = 0;
    const interval = setInterval(async () => {
      try {
        const ok = await checkConnection();
        setConnected(ok);
        if (!ok) { failCount++; if (failCount > 5) window.location.reload(); return; }
        failCount = 0;

        // Only poll config once every 5 cycles (40s) after first load
        const pollCfg = !configLoadedRef.current || Math.random() < 0.2;

        const keys = ['tickets', 'bills', 'calls', 'reservations'];
        if (!configLoadedRef.current) keys.push('menu', 'config');
        else keys.push('menu');

        const results = await Promise.all(keys.map(k => loadKey(k, null)));
        const data = Object.fromEntries(keys.map((k, i) => [k, results[i]]));

        if (data.menu) setMenu(data.menu);
        if (data.tickets) setTickets(data.tickets);
        if (data.bills && !processingRef.current) setBills(data.bills);
        if (data.calls) setCalls(data.calls);
        if (data.reservations) setReservations(data.reservations);

        if (data.config && !configLoadedRef.current) {
          const cfg = data.config;
          configLoadedRef.current = true;
          if (cfg.tableCount) setTableCount(cfg.tableCount);
          if (cfg.bankQR !== undefined) setBankQR(cfg.bankQR);
          if (cfg.pageBg !== undefined) setPageBg(cfg.pageBg);
          if (cfg.headerBg !== undefined) setHeaderBg(cfg.headerBg);
          if (cfg.fontFamily) setFontFamily(cfg.fontFamily);
          if (cfg.fontSize) setFontSize(cfg.fontSize);
          if (cfg.fontColor) setFontColor(cfg.fontColor);
          if (cfg.textBg) setTextBg(cfg.textBg);
          if (cfg.headingBg !== undefined) setHeadingBg(cfg.headingBg);
          if (cfg.headingSize) setHeadingSize(cfg.headingSize);
          if (cfg.defaultServiceCharge !== undefined) setDefaultServiceCharge(cfg.defaultServiceCharge);
          if (cfg.defaultGst !== undefined) setDefaultGst(cfg.defaultGst);
          if (cfg.restaurantName) setRestaurantName(cfg.restaurantName);
          if (cfg.menuCategories) setMenuCategories(cfg.menuCategories);
          if (cfg.kitchenPin) setKitchenPin(cfg.kitchenPin);
          if (cfg.barPin) setBarPin(cfg.barPin);
          if (cfg.currencySymbol) setCurrencySymbol(cfg.currencySymbol);
          if (cfg.currencyPosition) setCurrencyPosition(cfg.currencyPosition);
          if (cfg.currencyDecimals !== undefined) setCurrencyDecimals(cfg.currencyDecimals);
        }
      } catch (e) {
        console.error('Poll error', e);
        failCount++;
        if (failCount > 8) window.location.reload();
      }
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => { const t = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(t); }, []);

  // Poll for unlock signal when tablet is locked
  useEffect(() => {
    if (!isGuestMode || !tabletLocked) return;
    const interval = setInterval(async () => {
      try {
        const unlocks = await loadKey('tablet_unlocks', {});
        if (unlocks && unlocks[tabletTable] && unlocks[tabletTable] > (parseInt(localStorage.getItem('thab_last_lock') || '0'))) {
          unlockTablet();
        }
      } catch {}
    }, 5000);
    return () => clearInterval(interval);
  }, [isGuestMode, tabletLocked, tabletTable]);
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

  function cancelItem(ticketId, itemIndex) {
    const ticket = tickets.find((t) => t.id === ticketId);
    if (!ticket) return;
    const cancelledItem = ticket.items[itemIndex];
    if (!cancelledItem) return;

    // Remove item from ticket; cancel whole ticket if last item
    const newItems = ticket.items.filter((_, i) => i !== itemIndex);
    const updatedTickets = tickets.map((t) =>
      t.id === ticketId ? { ...t, items: newItems, status: newItems.length === 0 ? 'cancelled' : t.status } : t
    );
    setTickets(updatedTickets); saveKey('tickets', updatedTickets);

    // Remove that item from the open bill
    const bill = bills.find((b) => b.table === ticket.table && b.status === 'open');
    if (!bill) return;
    let lines = [...bill.lines];
    const billIdx = lines.findIndex((l) => l.name.startsWith(cancelledItem.name.split(' (')[0]) && l.qty >= cancelledItem.qty);
    if (billIdx !== -1) {
      const newQty = lines[billIdx].qty - cancelledItem.qty;
      if (newQty <= 0) lines.splice(billIdx, 1);
      else lines[billIdx] = { ...lines[billIdx], qty: newQty };
    }
    const updatedBills = bills.map((b) => b.id === bill.id ? { ...b, lines } : b);
    setBills(updatedBills); saveKey('bills', updatedBills);
    setFlash(`Removed ${cancelledItem.qty}× ${cancelledItem.name} — Table ${ticket.table}. Bill updated.`);
  }

  async function handlePageBgChange(e) {
    const file = e.target.files?.[0]; if (!file) return;
    try { const d = await resizeImageFile(file); saveConfig({ pageBg: d }); } catch (err) { console.error(err); }
  }
  async function handleHeaderBgChange(e) {
    const file = e.target.files?.[0]; if (!file) return;
    try { const d = await resizeImageFile(file); saveConfig({ headerBg: d }); } catch (err) { console.error(err); }
  }

  // --- call staff ---

  const hasPendingCall = calls.some((c) => c.table === guestTable && c.status === 'pending');
  const pendingCalls = calls.filter((c) => c.status === 'pending' && c.type !== 'booking').sort((a, b) => a.calledAt - b.calledAt);
  const pendingBookings = calls.filter((c) => c.status === 'pending' && c.type === 'booking').sort((a,b) => b.createdAt - a.createdAt);

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
  function toggleOutOfStock(id) {
    const updated = menu.map((m) => m.id === id ? { ...m, outOfStock: !m.outOfStock } : m);
    setMenu(updated); saveKey('menu', updated);
  }
  function addGroup() { setDraftItem((d) => ({ ...d, modifierGroups: [...(d.modifierGroups || []), { id: newId('g'), name: '', required: true, options: [] }] })); }
  function removeGroup(gid) { setDraftItem((d) => ({ ...d, modifierGroups: d.modifierGroups.filter((g) => g.id !== gid) })); }
  function updateGroup(gid, patch) { setDraftItem((d) => ({ ...d, modifierGroups: d.modifierGroups.map((g) => (g.id === gid ? { ...g, ...patch } : g)) })); }
  function addOption(gid) { setDraftItem((d) => ({ ...d, modifierGroups: d.modifierGroups.map((g) => (g.id === gid ? { ...g, options: [...g.options, { id: newId('o'), label: '', priceDelta: 0 }] } : g)) })); }
  function updateOption(gid, oid, patch) { setDraftItem((d) => ({ ...d, modifierGroups: d.modifierGroups.map((g) => (g.id === gid ? { ...g, options: g.options.map((o) => (o.id === oid ? { ...o, ...patch } : o)) } : g)) })); }
  function removeOption(gid, oid) { setDraftItem((d) => ({ ...d, modifierGroups: d.modifierGroups.map((g) => (g.id === gid ? { ...g, options: g.options.filter((o) => o.id !== oid) } : g)) })); }

  async function saveConfig(patch) {
    const cfg = { ownerPin, staffPin, kitchenPin, barPin, tableCount, bankQR, pageBg, headerBg, fontFamily, fontSize, fontColor, textBg, headingBg, headingSize, defaultServiceCharge, defaultGst, restaurantName, menuCategories, currencySymbol, currencyPosition, currencyDecimals, ...patch };
    await saveKey('config', cfg);
    try {
      const cacheKey = restaurantCode ? `config_cache_${restaurantCode}` : 'config_cache_default';
      localStorage.setItem(cacheKey, JSON.stringify(cfg));
    } catch {}
    if (patch.ownerPin !== undefined) setOwnerPin(patch.ownerPin);
    if (patch.staffPin !== undefined) setStaffPin(patch.staffPin);
    if (patch.tableCount !== undefined) setTableCount(patch.tableCount);
    if (patch.bankQR !== undefined) setBankQR(patch.bankQR);
    if (patch.pageBg !== undefined) setPageBg(patch.pageBg);
    if (patch.headerBg !== undefined) setHeaderBg(patch.headerBg);
    if (patch.fontFamily !== undefined) setFontFamily(patch.fontFamily);
    if (patch.fontSize !== undefined) setFontSize(patch.fontSize);
    if (patch.fontColor !== undefined) setFontColor(patch.fontColor);
    if (patch.textBg !== undefined) setTextBg(patch.textBg);
    if (patch.headingBg !== undefined) setHeadingBg(patch.headingBg);
    if (patch.headingSize !== undefined) setHeadingSize(patch.headingSize);
    if (patch.defaultServiceCharge !== undefined) setDefaultServiceCharge(patch.defaultServiceCharge);
    if (patch.defaultGst !== undefined) setDefaultGst(patch.defaultGst);
    if (patch.restaurantName !== undefined) setRestaurantName(patch.restaurantName);
    if (patch.menuCategories !== undefined) setMenuCategories(patch.menuCategories);
    if (patch.kitchenPin !== undefined) setKitchenPin(patch.kitchenPin);
    if (patch.barPin !== undefined) setBarPin(patch.barPin);
  }

  async function handleBankQRChange(e) {
    const file = e.target.files?.[0]; if (!file) return;
    try { const dataUrl = await resizeImageFile(file); saveConfig({ bankQR: dataUrl }); } catch (err) { console.error(err); }
  }

  // --- auth helpers ---
  function tryLogin() {
    if (pinInput === ownerPin) { persistRole('owner'); setPinInput(''); setPinError(''); }
    else if (pinInput === staffPin) { persistRole('staff'); setPinInput(''); setPinError(''); }
    else { setPinError('Wrong PIN — try again'); setPinInput(''); }
  }

  // --- checkout ---

  const openBillForTable = (t) => bills.find((b) => b.table === t && b.status === 'open' && b.lines.length > 0);
  function selectPayTable(t) { setPayTable(t); setShowCardForm(false); setPaySuccess(false); setServiceCharge(0); setGst(0); setCard({ name: '', number: '', expiry: '', cvc: '' }); }
  function computeTotals(bill) {
    const subtotal = bill ? bill.lines.reduce((s, l) => s + l.price * l.qty, 0) : 0;
    const serviceAmt = subtotal * (serviceCharge / 100);
    const gstAmt = (subtotal + serviceAmt) * (gst / 100);
    return { subtotal, serviceAmt, gstAmt, total: subtotal + serviceAmt + gstAmt };
  }
  async function finalizePayment(method) {
    const bill = openBillForTable(payTable); if (!bill) return;
    const { serviceAmt, gstAmt, total } = computeTotals(bill);
    if (method === 'card') { setProcessing(true); await new Promise((res) => setTimeout(res, 1200)); setProcessing(false); }
    const updated = bills.map((b) => (b.id === bill.id ? { ...b, status: 'paid', serviceCharge: serviceAmt, gst: gstAmt, total, paymentMethod: method, paidAt: Date.now() } : b));
    setBills(updated); saveKey('bills', updated); setPaySuccess(true);
  }

  const cartTotal = cart.reduce((sum, c) => sum + c.price * c.qty, 0);
  const cartQtyFor = (menuId) => cart.filter((c) => c.menuId === menuId).reduce((s, c) => s + c.qty, 0);
  // Use menuCategories for display order, falling back to what's in the menu
  const categories = menuCategories.map(c => c.name).filter(name => menu.some(m => m.category === name))
    .concat([...new Set(menu.map(m => m.category))].filter(name => !menuCategories.find(c => c.name === name)));
  const myTickets = selectedTable ? tickets.filter((t) => t.table === selectedTable).sort((a, b) => a.firedAt - b.firedAt) : [];
  const STATUS_LABEL = { new: 'Received', preparing: 'Preparing', ready: 'Ready', served: 'Served', cancelled: 'Cancelled' };
  const STATUS_COLOR = { new: COLORS.muted, preparing: COLORS.ember, ready: COLORS.warn, served: COLORS.good, cancelled: COLORS.urgent };

  const kitchenCount = tickets.filter((t) => t.station === 'kitchen' && t.status !== 'served' && t.status !== 'cancelled').length;
  const barCount = tickets.filter((t) => t.station === 'bar' && t.status !== 'served' && t.status !== 'cancelled').length;

  const navItems = [
    { key: 'floor',    label: 'Floor map',    Icon: MapIcon,        accent: COLORS.cream, badge: 0 },
    { key: 'table',    label: 'Table order',  Icon: UtensilsCrossed, accent: COLORS.cream, badge: 0 },
    { key: 'kitchen',  label: 'Kitchen',      Icon: ChefHat,        accent: COLORS.ember, badge: kitchenCount },
    { key: 'bar',      label: 'Bar',          Icon: Wine,           accent: COLORS.well,  badge: barCount },
    { key: 'checkout', label: 'Checkout',     Icon: CreditCard,     accent: COLORS.good,  badge: 0 },
    ...(authRole === 'owner' ? [
      { key: 'reports',  label: 'Reports',    Icon: BarChart2,      accent: COLORS.warn,  badge: 0 },
      { key: 'menu',     label: 'Menu',       Icon: Edit3,          accent: COLORS.warn,  badge: 0 },
      { key: 'settings', label: 'Settings',   Icon: SettingsIcon,   accent: COLORS.muted, badge: 0 },
    ] : []),
  ];

  if (loading) {
    return <div style={{ minHeight: '100vh', background: COLORS.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: COLORS.muted, fontFamily: "'Inter', sans-serif" }}>Loading…</div>;
  }

  // ── Device setup screen (shown once by you during installation) ──
  if (!isGuestMode && !deviceRole) {
    return (
      <div style={{ minHeight:'100vh', background:COLORS.bg, display:'flex', alignItems:'center', justifyContent:'center', padding:24, fontFamily:"'Inter',sans-serif" }}>
        <style>{`@import url('https://fonts.googleapis.com/css2?family=Oswald:wght@600;700&family=Inter:wght@400;600;700&display=swap');`}</style>
        <div style={{ width:'100%', maxWidth:420 }}>
          <div style={{ textAlign:'center', marginBottom:32 }}>
            <div style={{ fontFamily:"'Oswald',sans-serif", fontSize:28, color:COLORS.ember, letterSpacing:2, textTransform:'uppercase' }}>{restaurantName}</div>
            <div style={{ color:COLORS.muted, fontSize:13, marginTop:8 }}>First time setup — assign this device a role</div>
          </div>

          <div style={{ marginBottom:16 }}>
            <div style={{ fontFamily:"'Oswald',sans-serif", textTransform:'uppercase', letterSpacing:1.5, fontSize:15, color:COLORS.cream, borderBottom:`1px solid ${COLORS.border}`, paddingBottom:6, marginBottom:12 }}>This device is for:</div>

            <button onClick={() => assignDeviceRole('owner-staff')} style={{ width:'100%', padding:18, marginBottom:10, borderRadius:8, border:`1px solid ${COLORS.border}`, background:COLORS.panel, color:COLORS.cream, cursor:'pointer', textAlign:'left', display:'flex', alignItems:'center', gap:14 }}>
              <ShieldCheck size={28} color={COLORS.ember}/>
              <div>
                <div style={{ fontSize:16, fontWeight:700 }}>Owner / Staff device</div>
                <div style={{ fontSize:12, color:COLORS.muted, marginTop:2 }}>Floor map, kitchen, bar, checkout, orders. Owner also gets menu & settings.</div>
              </div>
            </button>

            <div style={{ color:COLORS.muted, fontSize:12, textTransform:'uppercase', letterSpacing:1, margin:'16px 0 10px' }}>Table tablet — select table number:</div>
            <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
              {TABLES.map(n => (
                <button key={n} onClick={() => assignDeviceRole(`table-${n}`)} style={{ width:52, height:52, borderRadius:6, border:`1px solid ${COLORS.border}`, background:COLORS.panel, color:COLORS.cream, fontFamily:"'JetBrains Mono',monospace", fontWeight:700, fontSize:16, cursor:'pointer' }}>{n}</button>
              ))}
            </div>
          </div>

          <p style={{ color:COLORS.muted, fontSize:11, marginTop:20, textAlign:'center' }}>This choice is permanent and cannot be changed without resetting the device.<br/>Only assign roles yourself — do not let restaurant staff do this step.</p>
        </div>
      </div>
    );
  }

  // Login screen (staff and owner only — table tablets skip this entirely)
  if (!isGuestMode && !authRole) {
    return (
      <div style={{ minHeight: '100vh', background: COLORS.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, fontFamily: "'Inter', sans-serif" }}>
        <style>{`@import url('https://fonts.googleapis.com/css2?family=Oswald:wght@600;700&family=Inter:wght@400;600;700&family=JetBrains+Mono:wght@700&display=swap'); input::placeholder{color:${COLORS.muted}}`}</style>
        <div style={{ width: '100%', maxWidth: 340, textAlign: 'center' }}>
          <Lock size={36} color={COLORS.ember} style={{ marginBottom: 14 }} />
          <h1 style={{ fontFamily: "'Oswald', sans-serif", fontSize: 28, letterSpacing: 2, textTransform: 'uppercase', color: COLORS.cream, margin: '0 0 4px' }}>{restaurantName}</h1>
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

  const fontSizePx = { small: 13, medium: 15, large: 17 }[fontSize] || 15;
  const headingSizePx = { small: 18, medium: 24, large: 32 }[headingSize] || 24;
  const subHeadingSizePx = { small: 12, medium: 15, large: 19 }[headingSize] || 15;
  const dynTitleStyle = { fontFamily: "'Oswald', sans-serif", fontSize: headingSizePx, letterSpacing: 1, textTransform: 'uppercase', margin: 0, color: COLORS.cream, background: headingBg, display: 'inline-block', padding: headingBg !== 'transparent' ? '2px 10px' : '0', borderRadius: 4 };
  const dynSubTitleStyle = { fontFamily: "'Oswald', sans-serif", textTransform: 'uppercase', letterSpacing: 1.5, fontSize: subHeadingSizePx, color: COLORS.cream, borderBottom: `1px solid ${COLORS.border}`, paddingBottom: 6, marginBottom: 10, background: headingBg, padding: headingBg !== 'transparent' ? '4px 10px 6px' : '0 0 6px', borderRadius: headingBg !== 'transparent' ? '4px 4px 0 0' : 0 };
  const FONT_OPTIONS = ['Inter', 'Oswald', 'Poppins', 'Roboto', 'Playfair Display'];
  const PRESET_TEXT_BG = [
    { label: 'Dark (default)', value: 'rgba(22,20,15,0.82)' },
    { label: 'Medium dark', value: 'rgba(0,0,0,0.55)' },
    { label: 'Light', value: 'rgba(255,255,255,0.15)' },
    { label: 'None', value: 'transparent' },
  ];
  const PRESET_FONT_COLOR = [
    { label: 'Cream (default)', value: '#F2ECDD' },
    { label: 'White', value: '#FFFFFF' },
    { label: 'Black', value: '#1A1A1A' },
    { label: 'Gold', value: '#D4AF37' },
  ];

  // Locked tablet screen — shown between customers
  if (isLockedScreen) {
    return (
      <div style={{ minHeight:'100vh', background: pageBg ? `url(${pageBg}) center/cover fixed` : COLORS.bg, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:24, fontFamily:"'Inter',sans-serif" }}>
        <style>{`@import url('https://fonts.googleapis.com/css2?family=Oswald:wght@600;700&display=swap');`}</style>
        <div style={{ textAlign:'center' }}>
          <div style={{ fontFamily:"'Oswald',sans-serif", fontSize:32, letterSpacing:3, color:COLORS.ember, textTransform:'uppercase', marginBottom:4 }}>{restaurantName}</div>
          <div style={{ fontFamily:"'Oswald',sans-serif", fontSize:56, color:COLORS.cream, marginTop:24 }}>{tabletTable}</div>
          <div style={{ color:COLORS.muted, fontSize:13, marginTop:4, textTransform:'uppercase', letterSpacing:1 }}>Table</div>

          <EmergencyUnlock ownerPin={ownerPin} staffPin={staffPin} onStaff={() => { unlockTablet(); }} onOwner={() => { try { localStorage.removeItem('thab_tablet_table'); localStorage.removeItem('thab_tablet_locked'); } catch {} window.location.reload(); }} />

          <div style={{ color:COLORS.muted, fontSize:14, marginTop:16 }}>Staff will seat and unlock this tablet for you</div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: pageBg ? `url(${pageBg}) center/cover fixed` : COLORS.bg, fontFamily: `'${fontFamily}', sans-serif`, fontSize: fontSizePx, color: fontColor }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Oswald:wght@500;600;700&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;700&family=Poppins:wght@400;600;700&family=Roboto:wght@400;500;700&family=Playfair+Display:wght@400;700&display=swap');
        @keyframes pulseUrgent { 0%, 100% { box-shadow: 0 0 0 0 rgba(199,62,62,0.45); } 50% { box-shadow: 0 0 0 7px rgba(199,62,62,0); } }
        @keyframes spin { to { transform: rotate(360deg); } }
        .pulse-urgent { animation: pulseUrgent 1.6s ease-in-out infinite; }
        .spin { animation: spin 0.8s linear infinite; }
        input::placeholder { color: ${COLORS.muted}; }
      `}</style>

      <div style={{ borderBottom: `1px solid ${COLORS.border}`, background: headerBg ? `url(${headerBg}) center/cover` : COLORS.panel }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <span>
            <span style={{ fontFamily: "'Oswald', sans-serif", fontSize: 20, letterSpacing: 3, color: COLORS.cream, textTransform: 'uppercase' }}>{restaurantName}</span>
            <span style={{ fontSize: 10, color: connected ? COLORS.good : COLORS.urgent, fontFamily: "'JetBrains Mono', monospace", marginLeft: 10 }}>{connected ? '● synced' : '○ offline — check backend'}</span>
          </span>

          {!isGuestMode && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {navItems.map(({ key, label, Icon, accent, badge }) => (
                  <button key={key} onClick={() => setView(key)} style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 4, border: `1px solid ${view === key ? accent : COLORS.border}`, background: view === key ? `${accent}1A` : 'transparent', color: view === key ? accent : COLORS.muted, fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>
                    <Icon size={15} /> {label}
                    {badge > 0 && (
                      <span style={{ position: 'absolute', top: -6, right: -6, background: COLORS.urgent, color: '#fff', borderRadius: 10, minWidth: 18, height: 18, fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'JetBrains Mono', monospace", padding: '0 4px' }}>{badge}</span>
                    )}
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
                    {(pendingCalls.length + pendingBookings.length) > 0 && (
                      <span style={{ position: 'absolute', top: -4, right: -4, background: pendingBookings.length > 0 ? COLORS.well : COLORS.urgent, color: '#fff', borderRadius: 8, fontSize: 10, minWidth: 16, height: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'JetBrains Mono', monospace" }}>{pendingCalls.length + pendingBookings.length}</span>
                    )}
                  </button>
                  {showCalls && (
                    <div style={{ position: 'absolute', right: 0, top: '110%', background: COLORS.panel, border: `1px solid ${COLORS.border}`, borderRadius: 6, padding: 10, width: 260, zIndex: 70 }}>
                      {pendingBookings.length > 0 && pendingBookings.map((b) => (
                        <div key={b.id} style={{ padding: '6px 4px', borderBottom: `1px solid ${COLORS.border}55` }}>
                          <div style={{ fontSize: 11, color: COLORS.well, fontWeight: 700, marginBottom: 2 }}>📅 New booking</div>
                          <div style={{ fontSize: 11, color: COLORS.cream, marginBottom: 4 }}>{b.message}</div>
                          <button onClick={() => acknowledgeCall(b.id)} style={{ ...primaryBtnStyle(COLORS.well), padding: '3px 8px', fontSize: 11 }}>✓ Got it</button>
                        </div>
                      ))}
                      {pendingCalls.length === 0 && pendingBookings.length === 0 ? (
                        <div style={{ fontSize: 12, color: COLORS.muted, padding: '6px 4px' }}>No active calls.</div>
                      ) : pendingCalls.map((c) => (
                        <div key={c.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 4px', borderBottom: `1px solid ${COLORS.border}55` }}>
                          <span style={{ fontSize: 12, color: COLORS.cream }}>Table {c.table} calling</span>
                          <button onClick={() => acknowledgeCall(c.id)} style={{ ...primaryBtnStyle(COLORS.good), padding: '3px 8px', fontSize: 11 }}>OK</button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <button onClick={() => persistRole(null)} title="Log out" style={{ ...iconBtnStyle, width: 34, height: 34 }}><LogOut size={15} /></button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '24px 20px 60px', background: textBg, minHeight: 'calc(100vh - 62px)' }}>
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
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18, padding: '10px 14px', background: COLORS.panel, border: `1px solid ${COLORS.border}`, borderRadius: 4, flexWrap: 'wrap', gap: 8 }}>
                <span style={{ color: COLORS.cream, fontSize: 14, fontFamily:"'Oswald',sans-serif", letterSpacing:1 }}>TABLE {guestTable}</span>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => setShowGuestBill(true)} style={primaryBtnStyle(COLORS.well)}>
                    <CreditCard size={14} /> View bill
                  </button>
                  <button onClick={callStaff} disabled={hasPendingCall} style={primaryBtnStyle(hasPendingCall ? COLORS.muted : COLORS.urgent)}>
                    <Bell size={14} /> {hasPendingCall ? 'On the way' : 'Call staff'}
                  </button>
                  <button onClick={lockTablet} style={primaryBtnStyle(COLORS.border)} title="Lock tablet (staff only)">
                    <Lock size={14} />
                  </button>
                </div>
              </div>
            )}

            {/* Category tabs */}
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 20 }}>
              <button onClick={() => { setSelectedCategory(null); setSelectedDrinkSub(null); }} style={{ padding: '7px 14px', borderRadius: 20, fontSize: 13, fontWeight: 600, cursor: 'pointer', border: `1px solid ${!selectedCategory ? COLORS.ember : COLORS.border}`, background: !selectedCategory ? `${COLORS.ember}22` : 'transparent', color: !selectedCategory ? COLORS.ember : COLORS.muted }}>All</button>
              {categories.map((cat) => (
                <button key={cat} onClick={() => { setSelectedCategory(cat); setSelectedDrinkSub(null); }} style={{ padding: '7px 14px', borderRadius: 20, fontSize: 13, fontWeight: 600, cursor: 'pointer', border: `1px solid ${selectedCategory === cat ? COLORS.ember : COLORS.border}`, background: selectedCategory === cat ? `${COLORS.ember}22` : 'transparent', color: selectedCategory === cat ? COLORS.ember : COLORS.muted }}>{cat}</button>
              ))}
            </div>

            {/* Sub-tabs for any category with subcategories */}
            {selectedCategory && (() => {
              const catDef = menuCategories.find(c => c.name === selectedCategory);
              const subs = catDef?.subcategories?.length ? catDef.subcategories : [...new Set(menu.filter(m => m.category === selectedCategory && m.subcategory).map(m => m.subcategory))];
              if (!subs.length) return null;
              return (
                <div style={{ display: 'flex', gap: 6, marginBottom: 16, flexWrap: 'wrap' }}>
                  <button onClick={() => setSelectedDrinkSub(null)} style={{ padding: '5px 12px', borderRadius: 16, fontSize: 12, cursor: 'pointer', border: `1px solid ${!selectedDrinkSub ? COLORS.well : COLORS.border}`, background: !selectedDrinkSub ? `${COLORS.well}22` : 'transparent', color: !selectedDrinkSub ? COLORS.well : COLORS.muted }}>All {selectedCategory}</button>
                  {subs.map(sub => (
                    <button key={sub} onClick={() => setSelectedDrinkSub(sub)} style={{ padding: '5px 12px', borderRadius: 16, fontSize: 12, cursor: 'pointer', border: `1px solid ${selectedDrinkSub === sub ? COLORS.well : COLORS.border}`, background: selectedDrinkSub === sub ? `${COLORS.well}22` : 'transparent', color: selectedDrinkSub === sub ? COLORS.well : COLORS.muted }}>{sub}</button>
                  ))}
                </div>
              );
            })()}

            <div className="grid grid-cols-1 md:grid-cols-3" style={{ gap: 28 }}>
              <div className="md:col-span-2">
                {(selectedCategory ? [selectedCategory] : categories).map((cat) => {
                  let items = menu.filter((m) => m.category === cat);
                  if (selectedDrinkSub) items = items.filter(m => m.subcategory === selectedDrinkSub);
                  return (
                    <div key={cat} style={{ marginBottom: 26 }}>
                      <h3 style={dynSubTitleStyle}>{cat}</h3>
                      <div className="grid grid-cols-2 sm:grid-cols-3" style={{ gap: 12 }}>
                        {items.map((item) => (
                          <MenuCard key={item.id} item={item} qty={cartQtyFor(item.id)} onTap={() => handleCardTap(item)} />
                        ))}
                      </div>
                    </div>
                  );
                })}
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

                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginTop: 14, fontFamily: "'JetBrains Mono', monospace" }}><span>Total</span><span>{fmt(cartTotal)}</span></div>

                  <button onClick={fireOrder} disabled={!selectedTable || cart.length === 0} style={{ width: '100%', marginTop: 14, padding: '11px 0', borderRadius: 3, border: 'none', background: !selectedTable || cart.length === 0 ? '#88888055' : COLORS.ember, color: '#fff', fontWeight: 700, fontSize: 14, letterSpacing: 0.5, cursor: !selectedTable || cart.length === 0 ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                    <Flame size={16} /> Fire order
                  </button>
                </div>
              </div>
            </div>

            {myTickets.length > 0 && (
              <div style={{ marginTop: 28, maxWidth: 600 }}>
                <h3 style={dynSubTitleStyle}>Order status — Table {selectedTable}</h3>
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

        {view === 'kitchen' && !isGuestMode && <StationBoard station="kitchen" tickets={tickets} now={now} onAdvance={advanceStatus} onCancelItem={cancelItem} />}
        {view === 'bar' && !isGuestMode && <StationBoard station="bar" tickets={tickets} now={now} onAdvance={advanceStatus} onCancelItem={cancelItem} />}

        {view === 'floor' && !isGuestMode && (
          <div>
            <h2 style={dynTitleStyle}>Floor map</h2>
            <p style={{ color: COLORS.muted, fontSize: 13, marginTop: 4, marginBottom: 18 }}>Live status of every table.</p>

          {/* Today's bookings summary */}
            {(() => {
              const todayBookings = (calls||[]).filter(c => c.type==='booking' && c.status==='pending');
              if (!todayBookings.length) return null;
              return (
                <div style={{ background:`${COLORS.well}15`, border:`1px solid ${COLORS.well}44`, borderRadius:8, padding:'12px 16px', marginBottom:16 }}>
                  <div style={{ fontFamily:"'Oswald',sans-serif", fontSize:14, color:COLORS.well, marginBottom:8, textTransform:'uppercase', letterSpacing:1 }}>📅 Today's bookings ({todayBookings.length})</div>
                  {todayBookings.map(b=>(
                    <div key={b.id} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'6px 0', borderBottom:`1px solid ${COLORS.border}33` }}>
                      <span style={{ fontSize:13, color:COLORS.cream }}>{b.message}</span>
                      <button onClick={()=>acknowledgeCall(b.id)} style={{ ...primaryBtnStyle(COLORS.well), padding:'4px 10px', fontSize:11, marginLeft:10, flexShrink:0 }}>✓ Done</button>
                    </div>
                  ))}
                </div>
              );
            })()}

            {/* Booking notifications */}
            {pendingBookings.length > 0 && (
              <div style={{ background:`${COLORS.well}18`, border:`1px solid ${COLORS.well}55`, borderRadius:8, padding:'12px 16px', marginBottom:16 }}>
                <div style={{ fontFamily:"'Oswald',sans-serif", fontSize:14, color:COLORS.well, marginBottom:8, textTransform:'uppercase', letterSpacing:1 }}>📅 New bookings ({pendingBookings.length})</div>
                {pendingBookings.map(b=>(
                  <div key={b.id} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'6px 0', borderBottom:`1px solid ${COLORS.border}44` }}>
                    <span style={{ fontSize:13, color:COLORS.cream }}>{b.message}</span>
                    <button onClick={()=>acknowledgeCall(b.id)} style={{ ...primaryBtnStyle(COLORS.well), padding:'4px 10px', fontSize:11, flexShrink:0, marginLeft:10 }}>✓ Got it</button>
                  </div>
                ))}
              </div>
            )}
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6" style={{ gap: 10, marginBottom: 24 }}>
              {TABLES.map((n) => {
                const status = getTableStatus(n, tickets, bills, calls, reservations);
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
              const status = getTableStatus(n, tickets, bills, calls, reservations);
              const bill = bills.find((b) => b.table === n && b.status === 'open' && b.lines.length > 0);
              const tableTickets = tickets.filter((t) => t.table === n && t.status !== 'served' && t.status !== 'cancelled');
              const pendingCall = calls.find((c) => c.table === n && c.status === 'pending');
              return (
                <div style={{ background: COLORS.panel, border: `1px solid ${COLORS.border}`, borderRadius: 6, padding: 18, maxWidth: 480 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                    <h3 style={{ ...dynSubTitleStyle, margin: 0, border: 'none', padding: 0 }}>Table {n} · {status.label}</h3>
                    <button onClick={() => setFloorSelected(null)} style={iconBtnStyle}><X size={13} /></button>
                  </div>

                  {pendingCall && (
                    <button onClick={() => acknowledgeCall(pendingCall.id)} style={{ ...primaryBtnStyle(COLORS.urgent), width: '100%', justifyContent: 'center', marginBottom: 12 }}>
                      <Bell size={14} /> Acknowledge call
                    </button>
                  )}

                  {/* Bookings for this table today */}
                  {(() => {
                    const today = new Date().toISOString().slice(0,10);
                    const todayBookings = (calls||[]).filter(c => c.type==='booking' && c.status==='pending' && (c.table===n || c.table===null));
                    const isReserved = reservations.some(r => r.table===n && r.status==='reserved');
                    return (
                      <>
                        {todayBookings.length > 0 && (
                          <div style={{ background:`${COLORS.well}18`, border:`1px solid ${COLORS.well}44`, borderRadius:6, padding:'10px 12px', marginBottom:10, fontSize:12 }}>
                            <div style={{ color:COLORS.well, fontWeight:700, marginBottom:6 }}>📅 Bookings for this table</div>
                            {todayBookings.map(b=>(
                              <div key={b.id} style={{ color:COLORS.cream, marginBottom:4 }}>{b.message}</div>
                            ))}
                          </div>
                        )}
                        {status.key === 'available' || status.key === 'reserved' ? (
                          <button onClick={() => {
                            let updated;
                            if (isReserved) {
                              updated = reservations.filter(r => !(r.table===n && r.status==='reserved'));
                            } else {
                              const now = new Date();
                              const time = now.toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'});
                              updated = [...reservations.filter(r=>r.table!==n), { id:newId('rsv'), table:n, status:'reserved', time, reservedAt:Date.now() }];
                            }
                            setReservations(updated);
                            saveKey('reservations', updated);
                          }} style={{ ...primaryBtnStyle(isReserved ? COLORS.muted : COLORS.well), width:'100%', justifyContent:'center', marginBottom:8, border: isReserved?`1px solid ${COLORS.border}`:'none', background: isReserved ? 'transparent' : COLORS.well }}>
                            {isReserved ? '✕ Remove reservation' : '📅 Mark table as reserved'}
                          </button>
                        ) : null}
                      </>
                    );
                  })()}

                  <button onClick={() => {
                    // Unlock the table tablet remotely via shared storage signal
                    const updated = [...(calls || []), { id: newId('unlock'), table: n, status: 'unlock', calledAt: Date.now() }];
                    saveKey('tablet_unlocks', { ...{}, [n]: Date.now() });
                    setFlash(`Table ${n} tablet unlocked for customers`);
                  }} style={{ ...primaryBtnStyle(COLORS.good), width: '100%', justifyContent: 'center', marginBottom: 8 }}>
                    <Check size={14} /> Unlock table {n} tablet
                  </button>
                  {tableTickets.length > 0 && (
                    <div style={{ marginBottom: 12 }}>
                      {tableTickets.map((t) => (
                        <div key={t.id} style={{ fontSize: 12, color: COLORS.muted, padding: '3px 0' }}>
                          {STATION_META[t.station].label}: {t.items.map((i) => `${i.qty}× ${i.name}`).join(', ')} — <span style={{ color: t.status === 'ready' ? COLORS.warn : COLORS.ember }}>{t.status}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {bill && <div style={{ fontSize: 13, color: COLORS.cream, marginBottom: 12 }}>Open bill: {fmt(bill.lines.reduce((s, l) => s + l.price * l.qty, 0))}</div>}

                  {bill && (
                    <button onClick={() => { selectPayTable(n); setView('checkout'); }} style={{ ...primaryBtnStyle(COLORS.good), marginBottom: 14 }}>
                      <CreditCard size={14} /> Go to checkout
                    </button>
                  )}

                  <label style={labelStyle}>Table QR code</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <img src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(tableOrderUrl(restaurantCode, n))}`} alt={`QR for table ${n}`} style={{ width: 90, height: 90, borderRadius: 4, background: '#fff', padding: 4 }} />
                    <div style={{ fontSize: 11, color: COLORS.muted, wordBreak: 'break-all' }}>{tableUrl(n)}</div>
                  </div>
                </div>
              );
            })()}
          </div>
        )}

        {view === 'reports' && authRole === 'owner' && (() => {
          // Calculate reports from bills data
          const today = new Date().toISOString().slice(0,10);
          const todayBills = bills.filter(b => b.status === 'paid' && b.createdAt && new Date(b.createdAt).toISOString().slice(0,10) === today);
          const allPaidBills = bills.filter(b => b.status === 'paid');

          // Revenue calculations
          const todayRevenue = todayBills.reduce((s,b) => s + (b.total || b.lines?.reduce((ls,l)=>ls+l.price*l.qty,0) || 0), 0);
          const weekRevenue = allPaidBills.filter(b => Date.now() - b.createdAt < 7*86400000).reduce((s,b) => s + (b.total || b.lines?.reduce((ls,l)=>ls+l.price*l.qty,0) || 0), 0);
          const monthRevenue = allPaidBills.filter(b => Date.now() - b.createdAt < 30*86400000).reduce((s,b) => s + (b.total || b.lines?.reduce((ls,l)=>ls+l.price*l.qty,0) || 0), 0);
          const totalRevenue = allPaidBills.reduce((s,b) => s + (b.total || b.lines?.reduce((ls,l)=>ls+l.price*l.qty,0) || 0), 0);

          // Top selling items
          const itemCounts = {};
          allPaidBills.forEach(b => (b.lines||[]).forEach(l => {
            itemCounts[l.name] = (itemCounts[l.name] || { qty: 0, revenue: 0 });
            itemCounts[l.name].qty += l.qty;
            itemCounts[l.name].revenue += l.price * l.qty;
          }));
          const topItems = Object.entries(itemCounts).sort((a,b) => b[1].qty - a[1].qty).slice(0,5);

          // Daily revenue last 7 days
          const last7 = Array.from({length:7}, (_,i) => {
            const d = new Date(); d.setDate(d.getDate()-i);
            const dateStr = d.toISOString().slice(0,10);
            const dayBills = allPaidBills.filter(b => b.createdAt && new Date(b.createdAt).toISOString().slice(0,10) === dateStr);
            const rev = dayBills.reduce((s,b) => s + (b.total || b.lines?.reduce((ls,l)=>ls+l.price*l.qty,0) || 0), 0);
            return { date: dateStr, label: d.toLocaleDateString('en',{weekday:'short'}), revenue: rev, orders: dayBills.length };
          }).reverse();

          const maxRev = Math.max(...last7.map(d=>d.revenue), 1);

          const statCard = (icon, label, value, color=COLORS.ember) => (
            <div style={{ background:COLORS.panel, border:`1px solid ${COLORS.border}`, borderRadius:10, padding:20, flex:1, minWidth:140 }}>
              <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:10, color:COLORS.muted, fontSize:12, textTransform:'uppercase', letterSpacing:0.5 }}>
                {icon} {label}
              </div>
              <div style={{ fontFamily:"'Oswald',sans-serif", fontSize:28, color }}>{value}</div>
            </div>
          );

          return (
            <div>
              <h2 style={dynTitleStyle}>Sales reports</h2>

              {/* Stat cards */}
              <div style={{ display:'flex', gap:12, flexWrap:'wrap', marginBottom:24, marginTop:16 }}>
                {statCard(<TrendingUp size={14}/>, "Today", fmt(todayRevenue), COLORS.good)}
                {statCard(<BarChart2 size={14}/>, "This week", fmt(weekRevenue))}
                {statCard(<BarChart2 size={14}/>, "This month", fmt(monthRevenue))}
                {statCard(<ShoppingBag size={14}/>, "All time", fmt(totalRevenue), COLORS.well)}
              </div>

              {/* Orders today */}
              <div style={{ display:'flex', gap:12, flexWrap:'wrap', marginBottom:24 }}>
                <div style={{ background:COLORS.panel, border:`1px solid ${COLORS.border}`, borderRadius:10, padding:20, flex:1, minWidth:140 }}>
                  <div style={{ color:COLORS.muted, fontSize:12, textTransform:'uppercase', letterSpacing:0.5, marginBottom:10 }}>Orders today</div>
                  <div style={{ fontFamily:"'Oswald',sans-serif", fontSize:28, color:COLORS.cream }}>{todayBills.length}</div>
                </div>
                <div style={{ background:COLORS.panel, border:`1px solid ${COLORS.border}`, borderRadius:10, padding:20, flex:1, minWidth:140 }}>
                  <div style={{ color:COLORS.muted, fontSize:12, textTransform:'uppercase', letterSpacing:0.5, marginBottom:10 }}>Avg order value</div>
                  <div style={{ fontFamily:"'Oswald',sans-serif", fontSize:28, color:COLORS.cream }}>{fmt(todayBills.length ? todayRevenue/todayBills.length : 0)}</div>
                </div>
                <div style={{ background:COLORS.panel, border:`1px solid ${COLORS.border}`, borderRadius:10, padding:20, flex:1, minWidth:140 }}>
                  <div style={{ color:COLORS.muted, fontSize:12, textTransform:'uppercase', letterSpacing:0.5, marginBottom:10 }}>Total orders</div>
                  <div style={{ fontFamily:"'Oswald',sans-serif", fontSize:28, color:COLORS.cream }}>{allPaidBills.length}</div>
                </div>
              </div>

              {/* 7-day bar chart */}
              <div style={{ background:COLORS.panel, border:`1px solid ${COLORS.border}`, borderRadius:10, padding:20, marginBottom:24 }}>
                <div style={{ fontFamily:"'Oswald',sans-serif", fontSize:16, textTransform:'uppercase', letterSpacing:1, marginBottom:16, color:COLORS.cream }}>Last 7 days</div>
                <div style={{ display:'flex', alignItems:'flex-end', gap:8, height:140 }}>
                  {last7.map((d,i) => (
                    <div key={i} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:4, height:'100%', justifyContent:'flex-end' }}>
                      <div style={{ fontSize:10, color:COLORS.muted, fontFamily:"'JetBrains Mono',monospace" }}>{d.revenue > 0 ? fmt(d.revenue).replace('$','') : ''}</div>
                      <div style={{ width:'100%', background: d.date===today ? COLORS.ember : `${COLORS.ember}55`, borderRadius:'4px 4px 0 0', height: `${Math.max(4, (d.revenue/maxRev)*100)}%`, transition:'height 0.3s' }}/>
                      <div style={{ fontSize:11, color: d.date===today ? COLORS.ember : COLORS.muted, fontWeight: d.date===today ? 700 : 400 }}>{d.label}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Top items */}
              <div style={{ background:COLORS.panel, border:`1px solid ${COLORS.border}`, borderRadius:10, padding:20, marginBottom:24 }}>
                <div style={{ fontFamily:"'Oswald',sans-serif", fontSize:16, textTransform:'uppercase', letterSpacing:1, marginBottom:16, color:COLORS.cream }}>Top selling items</div>
                {topItems.length === 0 ? (
                  <div style={{ color:COLORS.muted, fontSize:13, fontStyle:'italic' }}>No sales data yet — bills will appear here after checkout.</div>
                ) : topItems.map(([name, data], i) => (
                  <div key={name} style={{ display:'flex', alignItems:'center', gap:12, padding:'10px 0', borderBottom: i < topItems.length-1 ? `1px solid ${COLORS.border}` : 'none' }}>
                    <div style={{ fontFamily:"'Oswald',sans-serif", fontSize:20, color:COLORS.ember, minWidth:28 }}>#{i+1}</div>
                    <div style={{ flex:1 }}>
                      <div style={{ color:COLORS.cream, fontSize:14, fontWeight:600 }}>{name}</div>
                      <div style={{ color:COLORS.muted, fontSize:12, marginTop:2 }}>{data.qty} orders</div>
                    </div>
                    <div style={{ color:COLORS.good, fontSize:14, fontWeight:700 }}>{fmt(data.revenue)}</div>
                  </div>
                ))}
              </div>

              {/* Recent bills */}
              <div style={{ background:COLORS.panel, border:`1px solid ${COLORS.border}`, borderRadius:10, padding:20 }}>
                <div style={{ fontFamily:"'Oswald',sans-serif", fontSize:16, textTransform:'uppercase', letterSpacing:1, marginBottom:16, color:COLORS.cream }}>Recent bills</div>
                {allPaidBills.length === 0 ? (
                  <div style={{ color:COLORS.muted, fontSize:13, fontStyle:'italic' }}>No paid bills yet.</div>
                ) : [...allPaidBills].sort((a,b)=>(b.createdAt||0)-(a.createdAt||0)).slice(0,10).map((b,i) => (
                  <div key={b.id} style={{ display:'flex', alignItems:'center', gap:12, padding:'10px 0', borderBottom: i < 9 ? `1px solid ${COLORS.border}` : 'none' }}>
                    <div style={{ flex:1 }}>
                      <div style={{ color:COLORS.cream, fontSize:13 }}>Table {b.table} · {b.lines?.length || 0} items</div>
                      <div style={{ color:COLORS.muted, fontSize:11, marginTop:2 }}>{b.createdAt ? new Date(b.createdAt).toLocaleString() : '—'}</div>
                    </div>
                    <div style={{ color:COLORS.good, fontSize:14, fontWeight:700 }}>{fmt(b.total || b.lines?.reduce((s,l)=>s+l.price*l.qty,0) || 0)}</div>
                  </div>
                ))}
              </div>
            </div>
          );
        })()}

        {view === 'menu' && !isGuestMode && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18, flexWrap: 'wrap', gap: 10 }}>
              <h2 style={dynTitleStyle}>Menu editor</h2>
              <button onClick={startNewItem} style={primaryBtnStyle(COLORS.ember)}><Plus size={14} /> Add item</button>
            </div>

            {/* Category Manager — owner only */}
            {authRole === 'owner' && (
              <div style={{ background: COLORS.panel, border: `1px solid ${COLORS.border}`, borderRadius: 8, padding: 16, marginBottom: 24 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                  <div style={{ fontFamily: "'Oswald',sans-serif", fontSize: 16, color: COLORS.cream, textTransform: 'uppercase', letterSpacing: 1 }}>Categories & Sub-menus</div>
                </div>

                {/* Add new category */}
                <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
                  <input
                    id="new-cat-input"
                    placeholder="New category name (e.g. Desserts)"
                    style={{ ...inputStyle, flex: 1, margin: 0 }}
                    onKeyDown={e => {
                      if (e.key === 'Enter' && e.target.value.trim()) {
                        const updated = [...menuCategories, { id: newId('cat'), name: e.target.value.trim(), subcategories: [] }];
                        setMenuCategories(updated); saveConfig({ menuCategories: updated });
                        e.target.value = '';
                      }
                    }}
                  />
                  <button onClick={() => {
                    const input = document.getElementById('new-cat-input');
                    if (!input.value.trim()) return;
                    const updated = [...menuCategories, { id: newId('cat'), name: input.value.trim(), subcategories: [] }];
                    setMenuCategories(updated); saveConfig({ menuCategories: updated });
                    input.value = '';
                  }} style={{ ...primaryBtnStyle(COLORS.ember), whiteSpace: 'nowrap' }}>
                    <Plus size={13} /> Add
                  </button>
                </div>

                {menuCategories.map((cat, ci) => (
                  <div key={cat.id} style={{ marginBottom: 10, background: COLORS.bg, borderRadius: 6, padding: '10px 12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: cat.subcategories.length ? 8 : 0 }}>
                      {editingCat === `rename-${cat.id}` ? (
                        <input
                          autoFocus
                          defaultValue={cat.name}
                          style={{ ...inputStyle, flex: 1, margin: 0, padding: '6px 10px', fontSize: 13 }}
                          onBlur={e => {
                            const val = e.target.value.trim();
                            if (val && val !== cat.name) {
                              const updated = menuCategories.map(c => c.id === cat.id ? { ...c, name: val } : c);
                              setMenuCategories(updated); saveConfig({ menuCategories: updated });
                            }
                            setEditingCat(null);
                          }}
                          onKeyDown={e => e.key === 'Enter' && e.target.blur()}
                        />
                      ) : (
                        <span style={{ flex: 1, color: COLORS.cream, fontWeight: 600, fontSize: 14 }}>{cat.name}</span>
                      )}
                      <button onClick={() => setEditingCat(`rename-${cat.id}`)} style={{ ...iconBtnStyle, color: COLORS.muted }} title="Rename"><Edit3 size={12} /></button>
                      <button onClick={() => setEditingCat(editingCat === `addsub-${cat.id}` ? null : `addsub-${cat.id}`)} style={{ ...iconBtnStyle, color: COLORS.well }} title="Add sub-menu"><Plus size={12} /></button>
                      <button onClick={() => {
                        const updated = menuCategories.filter(c => c.id !== cat.id);
                        setMenuCategories(updated); saveConfig({ menuCategories: updated });
                      }} style={{ ...iconBtnStyle, color: COLORS.urgent }} title="Delete"><Trash2 size={12} /></button>
                    </div>

                    {/* Add sub-menu input */}
                    {editingCat === `addsub-${cat.id}` && (
                      <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
                        <input
                          autoFocus
                          placeholder="Sub-menu name (e.g. Cocktails)"
                          style={{ ...inputStyle, flex: 1, margin: 0, padding: '6px 10px', fontSize: 12 }}
                          onKeyDown={e => {
                            if (e.key === 'Enter' && e.target.value.trim()) {
                              const updated = menuCategories.map(c => c.id === cat.id ? { ...c, subcategories: [...c.subcategories, e.target.value.trim()] } : c);
                              setMenuCategories(updated); saveConfig({ menuCategories: updated });
                              setEditingCat(null);
                            }
                            if (e.key === 'Escape') setEditingCat(null);
                          }}
                        />
                        <button onClick={e => {
                          const inp = e.target.closest('div').querySelector('input');
                          if (!inp.value.trim()) return;
                          const updated = menuCategories.map(c => c.id === cat.id ? { ...c, subcategories: [...c.subcategories, inp.value.trim()] } : c);
                          setMenuCategories(updated); saveConfig({ menuCategories: updated });
                          setEditingCat(null);
                        }} style={{ ...primaryBtnStyle(COLORS.well), padding: '6px 10px', fontSize: 12 }}>Add</button>
                      </div>
                    )}

                    {cat.subcategories.length > 0 && (
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        {cat.subcategories.map((sub, si) => (
                          <div key={si} style={{ display: 'flex', alignItems: 'center', gap: 4, background: `${COLORS.well}18`, border: `1px solid ${COLORS.well}44`, borderRadius: 12, padding: '3px 10px', fontSize: 12 }}>
                            <span style={{ color: COLORS.well }}>{sub}</span>
                            <button onClick={() => {
                              const updated = menuCategories.map(c => c.id === cat.id ? { ...c, subcategories: c.subcategories.filter((_, i) => i !== si) } : c);
                              setMenuCategories(updated); saveConfig({ menuCategories: updated });
                            }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: COLORS.muted, lineHeight: 1, padding: 0 }}><X size={10} /></button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {categories.map((cat) => (
              <div key={cat} style={{ marginBottom: 22 }}>
                <h3 style={dynSubTitleStyle}>{cat}</h3>
                {menu.filter((m) => m.category === cat).map((item) => (
                  <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: `1px solid ${COLORS.border}55` }}>
                    <div style={{ width: 40, height: 40, borderRadius: 4, overflow: 'hidden', background: '#2A2620', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {item.image ? <img src={item.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <ImageIcon size={16} color={COLORS.muted} />}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ color: COLORS.cream, fontSize: 14 }}>{item.name}</div>
                      <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: COLORS.muted }}>
                        {fmt(item.price)} · {STATION_META[item.station]?.label}
                        {item.modifierGroups && item.modifierGroups.length > 0 && <span style={{ color: COLORS.ember }}> · {item.modifierGroups.length} option group{item.modifierGroups.length > 1 ? 's' : ''}</span>}
                      </div>
                    </div>
                    <button onClick={() => toggleOutOfStock(item.id)} style={{ ...iconBtnStyle, width: 'auto', padding: '0 8px', fontSize: 11, color: item.outOfStock ? COLORS.urgent : COLORS.muted, borderColor: item.outOfStock ? COLORS.urgent : COLORS.border }} title="Toggle out of stock">
                      {item.outOfStock ? '✗ OOS' : '✓ In stock'}
                    </button>
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
                    <h3 style={{ ...dynSubTitleStyle, margin: 0, border: 'none', padding: 0 }}>{draftItem.id ? 'Edit item' : 'New item'}</h3>
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
                  <select value={draftItem.category} onChange={(e) => setDraftItem({ ...draftItem, category: e.target.value, subcategory: '' })} style={inputStyle}>
                    {menuCategories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                    {categories.filter(c => !menuCategories.find(mc => mc.name === c)).map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  {(() => {
                    const catDef = menuCategories.find(c => c.name === draftItem.category);
                    if (!catDef?.subcategories?.length) return null;
                    return (
                      <>
                        <label style={labelStyle}>Sub-menu</label>
                        <select value={draftItem.subcategory || ''} onChange={e => setDraftItem({ ...draftItem, subcategory: e.target.value })} style={inputStyle}>
                          <option value="">None</option>
                          {catDef.subcategories.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </>
                    );
                  })()}

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
            <h2 style={dynTitleStyle}>Checkout</h2>
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
              const { subtotal, serviceAmt, gstAmt, total } = computeTotals(bill);

              if (paySuccess) {
                return (
                  <div style={{ background: COLORS.paper, borderRadius: 4, padding: 24, maxWidth: 380, textAlign: 'center' }}>
                    <Check size={32} color={COLORS.good} style={{ marginBottom: 8 }} />
                    <div style={{ fontFamily: "'Oswald', sans-serif", fontSize: 20, color: COLORS.ink, marginBottom: 4 }}>Payment received</div>
                    <div style={{ fontSize: 13, color: COLORS.ink, opacity: 0.7, marginBottom: 16 }}>Table {payTable} · {fmt(total)} paid</div>
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
                      <span style={{ fontFamily: "'JetBrains Mono', monospace" }}>{fmt(l.price * l.qty)}</span>
                    </div>
                  ))}

                  <div style={{ borderTop: `1px dashed ${COLORS.ink}30`, marginTop: 10, paddingTop: 10, fontFamily: "'JetBrains Mono', monospace", fontSize: 13 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Subtotal</span><span>{fmt(subtotal)}</span></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}><span>Service charge ({serviceCharge}%)</span><span>{fmt(serviceAmt)}</span></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}><span>GST ({gst}%)</span><span>{fmt(gstAmt)}</span></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: 16, marginTop: 6 }}><span>Total</span><span>{fmt(total)}</span></div>
                  </div>

                  {/* Service charge selector */}
                  <div style={{ marginTop: 14 }}>
                    <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.5, color: COLORS.ink, opacity: 0.5, marginBottom: 5 }}>Service charge</div>
                    <div style={{ display: 'flex', gap: 6 }}>
                      {[0, 5, 10, 15].map((p) => (
                        <button key={p} onClick={() => setServiceCharge(p)} style={{ flex: 1, padding: '6px 0', borderRadius: 3, fontSize: 12, fontWeight: 600, cursor: 'pointer', border: `1px solid ${COLORS.ink}30`, background: serviceCharge === p ? COLORS.ink : 'transparent', color: serviceCharge === p ? COLORS.paper : COLORS.ink }}>{p === 0 ? 'None' : `${p}%`}</button>
                      ))}
                    </div>
                  </div>

                  {/* GST selector */}
                  <div style={{ marginTop: 10, marginBottom: 4 }}>
                    <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.5, color: COLORS.ink, opacity: 0.5, marginBottom: 5 }}>GST</div>
                    <div style={{ display: 'flex', gap: 6 }}>
                      {[0, 5, 10, 15].map((p) => (
                        <button key={p} onClick={() => setGst(p)} style={{ flex: 1, padding: '6px 0', borderRadius: 3, fontSize: 12, fontWeight: 600, cursor: 'pointer', border: `1px solid ${COLORS.ink}30`, background: gst === p ? COLORS.ink : 'transparent', color: gst === p ? COLORS.paper : COLORS.ink }}>{p === 0 ? 'None' : `${p}%`}</button>
                      ))}
                    </div>
                  </div>

                  {bankQR && (
                    <div style={{ marginTop: 14, textAlign: 'center', borderTop: `1px dashed ${COLORS.ink}30`, paddingTop: 14 }}>
                      <div style={{ fontSize: 12, color: COLORS.ink, opacity: 0.6, marginBottom: 8 }}>Scan to pay · {fmt(total)}</div>
                      <img src={bankQR} alt="Bank payment QR" style={{ width: 160, height: 160, borderRadius: 6, objectFit: 'contain', background: '#fff', padding: 6, margin: '0 auto', display: 'block' }} />
                    </div>
                  )}

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
                        {processing ? <Loader2 size={14} className="spin" /> : <CreditCard size={14} />} {processing ? 'Processing…' : `Pay ${fmt(total)}`}
                      </button>
                      <p style={{ fontSize: 11, color: COLORS.ink, opacity: 0.5, fontStyle: 'italic', marginTop: 8 }}>Demo payment — no real charge is made. Connect a processor like Stripe for live transactions.</p>
                    </div>
                  )}
                </div>
              );
            })()}

            {bills.filter((b) => b.status === 'paid').length > 0 && (
              <div style={{ marginTop: 32 }}>
                <h3 style={dynSubTitleStyle}>Recently closed</h3>
                {bills.filter((b) => b.status === 'paid').sort((a, b) => b.paidAt - a.paidAt).slice(0, 5).map((b) => (
                  <div key={b.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: COLORS.muted, padding: '4px 0' }}>
                    <span>Table {b.table}</span>
                    <span style={{ fontFamily: "'JetBrains Mono', monospace" }}>{fmt(b.total)} · {new Date(b.paidAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
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
              <h2 style={dynTitleStyle}>Settings</h2>
              <span style={{ fontSize: 11, color: COLORS.ember, fontFamily: "'JetBrains Mono', monospace" }}>Owner only</span>
            </div>

            <div style={{ background: COLORS.panel, border: `1px solid ${COLORS.border}`, borderRadius: 6, padding: 18, marginBottom: 16 }}>
              <h3 style={{ ...dynSubTitleStyle, marginTop: 0 }}>Table QR codes (no tablet needed)</h3>
              <p style={{ fontSize: 12, color: COLORS.muted, marginBottom: 14 }}>Print these QR codes and place them on each table. Customers scan with their own phone — table number is pre-set, they go straight to ordering.</p>
              {!restaurantCode ? (
                <div style={{ background:`${COLORS.urgent}18`, border:`1px solid ${COLORS.urgent}44`, borderRadius:8, padding:'14px 16px', color:COLORS.urgent, fontSize:13 }}>
                  ⚠️ Your restaurant is not registered in the owner dashboard yet.<br/>
                  <span style={{ color:COLORS.muted, fontSize:12, marginTop:4, display:'block' }}>Go to <strong style={{ color:COLORS.cream }}>korean-restaurant-pos.vercel.app/owner</strong> → Add restaurant with code <strong style={{ color:COLORS.cream }}>THAB2026</strong> → Re-login on this device with your new license key. QR codes will work after that.</span>
                </div>
              ) : (
                <div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 12 }}>
                    {TABLES.map(n => (
                      <div key={n} style={{ background: COLORS.bg, border: `1px solid ${COLORS.border}`, borderRadius: 8, padding: 12, textAlign: 'center' }}>
                        <div style={{ fontFamily: "'Oswald', sans-serif", fontSize: 16, color: COLORS.ember, marginBottom: 8, letterSpacing: 1 }}>TABLE {n}</div>
                        <div style={{ background: '#fff', padding: 6, borderRadius: 6, display: 'inline-block', marginBottom: 8 }}>
                          <img
                            src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(tableOrderUrl(restaurantCode, n))}`}
                            alt={`Table ${n} QR`}
                            style={{ width: 120, height: 120, display: 'block' }}
                          />
                        </div>
                        <div style={{ fontSize: 10, color: COLORS.muted, wordBreak: 'break-all' }}>Scan to order at Table {n}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{ marginTop: 14, padding: '10px 14px', background: `${COLORS.good}18`, border: `1px solid ${COLORS.good}44`, borderRadius: 6, fontSize: 12, color: COLORS.good }}>
                    💡 Tip: Take a screenshot of each QR code, print it and laminate it for each table. Customers scan → straight to ordering, no tablet needed.
                  </div>
                </div>
              )}
            </div>

            <div style={{ background: COLORS.panel, border: `1px solid ${COLORS.border}`, borderRadius: 6, padding: 18, marginBottom: 16 }}>
              <h3 style={{ ...dynSubTitleStyle, marginTop: 0 }}>Customer app QR code</h3>
              <p style={{ fontSize: 12, color: COLORS.muted, marginBottom: 14 }}>Print this QR code and place it at your entrance or on tables. Customers scan it to open your restaurant's app — they can register, check table availability, view the menu and book a table.</p>
              {restaurantCode ? (
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
                  <div style={{ background: '#fff', padding: 8, borderRadius: 8, flexShrink: 0 }}>
                    <img src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(customerAppUrl(restaurantCode))}`} alt="Customer app QR" style={{ width: 160, height: 160, display: 'block' }}/>
                  </div>
                  <div>
                    <div style={{ fontSize: 12, color: COLORS.muted, marginBottom: 8 }}>Your customer app link:</div>
                    <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 11, color: COLORS.ember, wordBreak: 'break-all', background: COLORS.bg, padding: '8px 10px', borderRadius: 4, marginBottom: 10 }}>{customerAppUrl(restaurantCode)}</div>
                    <div style={{ fontSize: 11, color: COLORS.muted }}>Restaurant code: <span style={{ color: COLORS.ember, fontWeight: 700 }}>{restaurantCode}</span></div>
                  </div>
                </div>
              ) : (
                <div style={{ color: COLORS.muted, fontSize: 13 }}>Restaurant code not found. Please sign in again.</div>
              )}
            </div>

            <div style={{ background: COLORS.panel, border: `1px solid ${COLORS.border}`, borderRadius: 6, padding: 18, marginBottom: 16 }}>
              <h3 style={{ ...dynSubTitleStyle, marginTop: 0 }}>Restaurant name</h3>
              <p style={{ fontSize: 12, color: COLORS.muted, marginBottom: 12 }}>This name appears on all screens, bills, and the customer app. Change it to your restaurant's name.</p>
              <input
                defaultValue={restaurantName}
                onBlur={e => saveConfig({ restaurantName: e.target.value.trim() || 'THAB - BHUTANESE BBQ' })}
                placeholder="Your Restaurant Name"
                style={inputStyle}
              />
              <p style={{ fontSize: 11, color: COLORS.muted, marginTop: 8 }}>Tap outside the field to save.</p>
            </div>

            <div style={{ background: COLORS.panel, border: `1px solid ${COLORS.border}`, borderRadius: 6, padding: 18, marginBottom: 16 }}>
              <h3 style={{ ...dynSubTitleStyle, marginTop: 0 }}>This device</h3>
              <div style={{ fontSize: 14, color: COLORS.cream, marginBottom: 12 }}>
                Current role: <span style={{ color: COLORS.ember, fontWeight: 700 }}>{deviceRole === 'owner-staff' ? 'Owner / Staff' : deviceRole ? `Table ${deviceRole.split('-')[1]} tablet` : 'Not assigned'}</span>
              </div>
              <p style={{ fontSize: 12, color: COLORS.muted, marginBottom: 14 }}>
                To change this device's role, reset it below. You'll need to go through the device setup screen again.
              </p>
              <button onClick={() => {
                if (!window.confirm('Reset this device? You will need to go through setup again.')) return;
                localStorage.removeItem('thab_device_role');
                localStorage.removeItem('thab_tablet_table');
                localStorage.removeItem('thab_tablet_locked');
                window.location.reload();
              }} style={{ ...primaryBtnStyle(COLORS.urgent) }}>
                <X size={13} /> Reset device role
              </button>
            </div>

            <div style={{ background: COLORS.panel, border: `1px solid ${COLORS.border}`, borderRadius: 6, padding: 18, marginBottom: 16 }}>
              <h3 style={{ ...dynSubTitleStyle, marginTop: 0 }}>Appearance</h3>

              <label style={labelStyle}>Page background image</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                {pageBg ? <img src={pageBg} alt="Page bg" style={{ width: 70, height: 50, objectFit: 'cover', borderRadius: 4 }} /> : <div style={{ width: 70, height: 50, background: COLORS.bg, borderRadius: 4, border: `1px dashed ${COLORS.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><ImageIcon size={18} color={COLORS.muted} /></div>}
                <div>
                  <input type="file" accept="image/*" onChange={handlePageBgChange} style={{ fontSize: 12, color: COLORS.cream }} />
                  {pageBg && <button onClick={() => saveConfig({ pageBg: '' })} style={{ display: 'block', marginTop: 6, fontSize: 12, color: COLORS.urgent, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>Remove</button>}
                </div>
              </div>

              <label style={labelStyle}>Header background image</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
                {headerBg ? <img src={headerBg} alt="Header bg" style={{ width: 70, height: 50, objectFit: 'cover', borderRadius: 4 }} /> : <div style={{ width: 70, height: 50, background: COLORS.bg, borderRadius: 4, border: `1px dashed ${COLORS.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><ImageIcon size={18} color={COLORS.muted} /></div>}
                <div>
                  <input type="file" accept="image/*" onChange={handleHeaderBgChange} style={{ fontSize: 12, color: COLORS.cream }} />
                  {headerBg && <button onClick={() => saveConfig({ headerBg: '' })} style={{ display: 'block', marginTop: 6, fontSize: 12, color: COLORS.urgent, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>Remove</button>}
                </div>
              </div>

              <label style={labelStyle}>Heading background color</label>
              <p style={{ fontSize: 11, color: COLORS.muted, margin: '0 0 8px' }}>Puts a color block behind headings like "Floor Map", "Table Order" etc. so they're readable over background photos.</p>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 14 }}>
                {[
                  { label: 'Dark (default)', value: 'rgba(0,0,0,0.55)' },
                  { label: 'Ember', value: 'rgba(217,98,43,0.85)' },
                  { label: 'Deep blue', value: 'rgba(20,40,80,0.85)' },
                  { label: 'None', value: 'transparent' },
                ].map((p) => (
                  <button key={p.value} onClick={() => saveConfig({ headingBg: p.value })} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 4, fontSize: 12, cursor: 'pointer', border: `1px solid ${headingBg === p.value ? COLORS.ember : COLORS.border}`, background: headingBg === p.value ? `${COLORS.ember}22` : 'transparent', color: COLORS.cream }}>
                    <span style={{ width: 14, height: 14, borderRadius: 3, background: p.value === 'transparent' ? 'repeating-linear-gradient(45deg,#666 0,#666 2px,transparent 0,transparent 50%) 0/6px 6px' : p.value, border: '1px solid #ffffff33', flexShrink: 0 }} />
                    {p.label}
                  </button>
                ))}
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontSize: 11, color: COLORS.muted }}>Custom:</span>
                  <input type="color" defaultValue="#000000" onChange={(e) => { const hex = e.target.value; saveConfig({ headingBg: hex }); }} style={{ width: 36, height: 28, borderRadius: 4, border: `1px solid ${COLORS.border}`, background: 'transparent', cursor: 'pointer' }} />
                </div>
              </div>

              <label style={labelStyle}>Heading font size</label>
              <div style={{ display: 'flex', gap: 6, marginBottom: 14 }}>
                {[['small','Small'],['medium','Medium'],['large','Large']].map(([key, label]) => (
                  <button key={key} onClick={() => saveConfig({ headingSize: key })} style={{ flex: 1, padding: '7px 0', borderRadius: 4, fontSize: 12, cursor: 'pointer', border: `1px solid ${headingSize === key ? COLORS.ember : COLORS.border}`, background: headingSize === key ? `${COLORS.ember}22` : 'transparent', color: headingSize === key ? COLORS.ember : COLORS.cream }}>{label}</button>
                ))}
              </div>

              <label style={labelStyle}>Font color</label>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 14 }}>
                {PRESET_FONT_COLOR.map((p) => (
                  <button key={p.value} onClick={() => saveConfig({ fontColor: p.value })} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 4, fontSize: 12, cursor: 'pointer', border: `1px solid ${fontColor === p.value ? COLORS.ember : COLORS.border}`, background: fontColor === p.value ? `${COLORS.ember}22` : 'transparent', color: COLORS.cream }}>
                    <span style={{ width: 14, height: 14, borderRadius: '50%', background: p.value, border: '1px solid #ffffff44', flexShrink: 0 }} />
                    {p.label}
                  </button>
                ))}
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontSize: 11, color: COLORS.muted }}>Custom:</span>
                  <input type="color" value={fontColor} onChange={(e) => saveConfig({ fontColor: e.target.value })} style={{ width: 36, height: 28, borderRadius: 4, border: `1px solid ${COLORS.border}`, background: 'transparent', cursor: 'pointer' }} />
                </div>
              </div>

              <label style={labelStyle}>Text background overlay</label>
              <p style={{ fontSize: 11, color: COLORS.muted, margin: '0 0 8px' }}>Adds a tinted layer behind all text so it stays readable when a background photo is set.</p>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 4 }}>
                {PRESET_TEXT_BG.map((p) => (
                  <button key={p.value} onClick={() => saveConfig({ textBg: p.value })} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 4, fontSize: 12, cursor: 'pointer', border: `1px solid ${textBg === p.value ? COLORS.ember : COLORS.border}`, background: textBg === p.value ? `${COLORS.ember}22` : 'transparent', color: COLORS.cream }}>
                    <span style={{ width: 14, height: 14, borderRadius: 3, background: p.value === 'transparent' ? 'repeating-linear-gradient(45deg,#666 0,#666 2px,transparent 0,transparent 50%) 0/6px 6px' : p.value, border: '1px solid #ffffff33', flexShrink: 0 }} />
                    {p.label}
                  </button>
                ))}
              </div>

              <label style={labelStyle}>Font</label>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 14 }}>
                {FONT_OPTIONS.map((f) => (
                  <button key={f} onClick={() => saveConfig({ fontFamily: f })} style={{ padding: '6px 12px', borderRadius: 4, fontSize: 13, cursor: 'pointer', fontFamily: `'${f}', sans-serif`, border: `1px solid ${fontFamily === f ? COLORS.ember : COLORS.border}`, background: fontFamily === f ? `${COLORS.ember}22` : 'transparent', color: fontFamily === f ? COLORS.ember : COLORS.cream }}>{f}</button>
                ))}
              </div>

              <label style={labelStyle}>Text size</label>
              <div style={{ display: 'flex', gap: 6 }}>
                {[['small','Small (13px)'],['medium','Medium (15px)'],['large','Large (17px)']].map(([key, label]) => (
                  <button key={key} onClick={() => saveConfig({ fontSize: key })} style={{ flex: 1, padding: '7px 0', borderRadius: 4, fontSize: 12, cursor: 'pointer', border: `1px solid ${fontSize === key ? COLORS.ember : COLORS.border}`, background: fontSize === key ? `${COLORS.ember}22` : 'transparent', color: fontSize === key ? COLORS.ember : COLORS.cream }}>{label}</button>
                ))}
              </div>
            </div>

            <div style={{ background: COLORS.panel, border: `1px solid ${COLORS.border}`, borderRadius: 6, padding: 18, marginBottom: 16 }}>
              <h3 style={{ ...dynSubTitleStyle, marginTop: 0 }}>Number of tables</h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <button onClick={() => {
                  const n = Math.max(1, tableCount - 1);
                  setTableCount(n);
                  clearTimeout(window._tableCountTimer);
                  window._tableCountTimer = setTimeout(() => saveConfig({ tableCount: n }), 800);
                }} style={{ ...iconBtnStyle, width: 36, height: 36 }}><Minus size={16} /></button>
                <span style={{ fontFamily: "'Oswald', sans-serif", fontSize: 36, color: COLORS.cream, minWidth: 48, textAlign: 'center' }}>{tableCount}</span>
                <button onClick={async () => {
                  const n = Math.min(50, tableCount + 1);
                  // Check plan limit
                  try {
                    const session = localStorage.getItem('tf_session');
                    const deviceId = localStorage.getItem('tf_device_id');
                    if (session && deviceId) {
                      const API = import.meta.env.VITE_API_BASE || 'https://restaurant-pos-j0sb.onrender.com';
                      const res = await fetch(`${API}/restaurant/check-tables`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ sessionToken: session, deviceId, tableCount: n }),
                      });
                      const data = await res.json();
                      if (!data.allowed) {
                        setFlash(`⚠️ ${data.reason}`);
                        return;
                      }
                    }
                  } catch {}
                  setTableCount(n);
                  clearTimeout(window._tableCountTimer);
                  window._tableCountTimer = setTimeout(() => saveConfig({ tableCount: n }), 800);
                }} style={{ ...iconBtnStyle, width: 36, height: 36 }}><Plus size={16} /></button>
              </div>
              <p style={{ fontSize: 12, color: COLORS.muted, marginTop: 10 }}>Changes take effect immediately on all devices. QR codes for new tables appear in the Floor map.</p>
            </div>

            <div style={{ background: COLORS.panel, border: `1px solid ${COLORS.border}`, borderRadius: 6, padding: 18, marginBottom: 16 }}>
              <h3 style={{ ...dynSubTitleStyle, marginTop: 0 }}>Bank payment QR code</h3>
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
              <h3 style={{ ...dynSubTitleStyle, marginTop: 0 }}>Currency</h3>
              <p style={{ fontSize: 12, color: COLORS.muted, marginBottom: 12 }}>Set the currency symbol shown on all bills and the customer app.</p>

              <label style={labelStyle}>Quick select</label>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 14 }}>
                {[
                  { sym:'Nu', pos:'before', dec:0 },
                  { sym:'$',  pos:'before', dec:2 },
                  { sym:'₹',  pos:'before', dec:0 },
                  { sym:'£',  pos:'before', dec:2 },
                  { sym:'€',  pos:'before', dec:2 },
                  { sym:'¥',  pos:'before', dec:0 },
                ].map(c => (
                  <button key={c.sym} onClick={() => { setCurrencySymbol(c.sym); setCurrencyPosition(c.pos); setCurrencyDecimals(c.dec); saveConfig({ currencySymbol: c.sym, currencyPosition: c.pos, currencyDecimals: c.dec }); }} style={{ padding:'8px 16px', borderRadius:6, fontSize:16, fontWeight:700, cursor:'pointer', border:`1px solid ${currencySymbol===c.sym?COLORS.ember:COLORS.border}`, background:currencySymbol===c.sym?`${COLORS.ember}22`:'transparent', color:currencySymbol===c.sym?COLORS.ember:COLORS.cream }}>{c.sym}</button>
                ))}
              </div>

              <div style={{ display:'flex', gap:12, flexWrap:'wrap' }}>
                <div style={{ flex:1, minWidth:140 }}>
                  <label style={labelStyle}>Custom symbol</label>
                  <input value={currencySymbol} onChange={e=>{ setCurrencySymbol(e.target.value); saveConfig({ currencySymbol: e.target.value }); }} placeholder="Nu" style={{...inputStyle, fontSize:18, textAlign:'center'}}/>
                </div>
                <div style={{ flex:1, minWidth:140 }}>
                  <label style={labelStyle}>Position</label>
                  <select value={currencyPosition} onChange={e=>{ setCurrencyPosition(e.target.value); saveConfig({ currencyPosition: e.target.value }); }} style={inputStyle}>
                    <option value="before">Before — Nu 100</option>
                    <option value="after">After — 100 Nu</option>
                  </select>
                </div>
                <div style={{ flex:1, minWidth:140 }}>
                  <label style={labelStyle}>Decimals</label>
                  <select value={currencyDecimals} onChange={e=>{ setCurrencyDecimals(parseInt(e.target.value)); saveConfig({ currencyDecimals: parseInt(e.target.value) }); }} style={inputStyle}>
                    <option value={0}>None — 100</option>
                    <option value={2}>2 places — 100.00</option>
                  </select>
                </div>
              </div>

              <div style={{ marginTop:12, padding:'10px 14px', background:`${COLORS.good}18`, border:`1px solid ${COLORS.good}44`, borderRadius:6, fontSize:13, color:COLORS.good }}>
                Preview: <strong>{fmt(1500)}</strong>
              </div>
            </div>

            <div style={{ background: COLORS.panel, border: `1px solid ${COLORS.border}`, borderRadius: 6, padding: 18, marginBottom: 16 }}>
              <h3 style={{ ...dynSubTitleStyle, marginTop: 0 }}>Default tax rates</h3>
              <p style={{ fontSize: 12, color: COLORS.muted, marginBottom: 12 }}>These rates are shown on the customer's bill view at each table. Staff can still change them per bill at checkout.</p>

              <label style={labelStyle}>Service charge</label>
              <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
                {[0, 5, 10, 15].map((p) => (
                  <button key={p} onClick={() => saveConfig({ defaultServiceCharge: p })} style={{ flex: 1, padding: '7px 0', borderRadius: 4, fontSize: 12, fontWeight: 600, cursor: 'pointer', border: `1px solid ${defaultServiceCharge === p ? COLORS.ember : COLORS.border}`, background: defaultServiceCharge === p ? `${COLORS.ember}22` : 'transparent', color: defaultServiceCharge === p ? COLORS.ember : COLORS.cream }}>{p === 0 ? 'None' : `${p}%`}</button>
                ))}
              </div>

              <label style={labelStyle}>GST</label>
              <div style={{ display: 'flex', gap: 6 }}>
                {[0, 5, 10, 15].map((p) => (
                  <button key={p} onClick={() => saveConfig({ defaultGst: p })} style={{ flex: 1, padding: '7px 0', borderRadius: 4, fontSize: 12, fontWeight: 600, cursor: 'pointer', border: `1px solid ${defaultGst === p ? COLORS.ember : COLORS.border}`, background: defaultGst === p ? `${COLORS.ember}22` : 'transparent', color: defaultGst === p ? COLORS.ember : COLORS.cream }}>{p === 0 ? 'None' : `${p}%`}</button>
                ))}
              </div>
            </div>


            <div style={{ background: COLORS.panel, border: `1px solid ${COLORS.border}`, borderRadius: 6, padding: 18, marginBottom: 16 }}>
              <h3 style={{ ...dynSubTitleStyle, marginTop: 0 }}>Kitchen & Bar station pages</h3>
              <p style={{ fontSize: 12, color: COLORS.muted, marginBottom: 14 }}>Dedicated pages for kitchen and bar staff. Each has its own PIN. Open on a screen in the kitchen or behind the bar.</p>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 14 }}>
                <div style={{ flex: 1, minWidth: 180 }}>
                  <label style={labelStyle}>Kitchen PIN</label>
                  <input value={kitchenPin} onChange={e => { setKitchenPin(e.target.value.replace(/\D/g,'').slice(0,8)); saveConfig({ kitchenPin: e.target.value.replace(/\D/g,'').slice(0,8) }); }} style={inputStyle} maxLength={8} placeholder="e.g. 1111" type="password"/>
                </div>
                <div style={{ flex: 1, minWidth: 180 }}>
                  <label style={labelStyle}>Bar PIN</label>
                  <input value={barPin} onChange={e => { setBarPin(e.target.value.replace(/\D/g,'').slice(0,8)); saveConfig({ barPin: e.target.value.replace(/\D/g,'').slice(0,8) }); }} style={inputStyle} maxLength={8} placeholder="e.g. 2222" type="password"/>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <a href="/kitchen" target="_blank" rel="noopener noreferrer" style={{ ...primaryBtnStyle(COLORS.ember), textDecoration:'none' }}>🍳 Open Kitchen page</a>
                <a href="/bar" target="_blank" rel="noopener noreferrer" style={{ ...primaryBtnStyle(COLORS.well), textDecoration:'none' }}>🍹 Open Bar page</a>
              </div>
            </div>

            <div style={{ background: COLORS.panel, border: `1px solid ${COLORS.border}`, borderRadius: 6, padding: 18, marginBottom: 16 }}>
              <h3 style={{ ...dynSubTitleStyle, marginTop: 0 }}>Change PINs</h3>
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

      {showGuestBill && (() => {
        const bill = bills.find((b) => b.table === guestTable && b.status === 'open' && b.lines.length > 0);
        const subtotal = bill ? bill.lines.reduce((s, l) => s + l.price * l.qty, 0) : 0;
        const serviceAmt = subtotal * (defaultServiceCharge / 100);
        const gstAmt = (subtotal + serviceAmt) * (defaultGst / 100);
        const grandTotal = subtotal + serviceAmt + gstAmt;
        return (
          <div style={{ position: 'fixed', inset: 0, background: '#000000AA', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, zIndex: 60 }}>
            <div style={{ background: COLORS.paper, color: COLORS.ink, borderRadius: 6, padding: 22, width: '100%', maxWidth: 380, maxHeight: '90vh', overflowY: 'auto' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                <div style={{ fontFamily: "'Oswald', sans-serif", fontSize: 22 }}>Table {guestTable} — Your Bill</div>
                <button onClick={() => setShowGuestBill(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: COLORS.ink, opacity: 0.5 }}><X size={18} /></button>
              </div>

              {!bill ? (
                <p style={{ fontSize: 14, fontStyle: 'italic', opacity: 0.6 }}>No items ordered yet.</p>
              ) : (
                <>
                  {bill.lines.map((l, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, padding: '4px 0', borderBottom: `1px solid ${COLORS.ink}12` }}>
                      <span><span style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 700 }}>{l.qty}×</span> {l.name}</span>
                      <span style={{ fontFamily: "'JetBrains Mono', monospace" }}>{fmt(l.price * l.qty)}</span>
                    </div>
                  ))}

                  <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13, marginTop: 10, paddingTop: 10, borderTop: `1px dashed ${COLORS.ink}20` }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}><span>Subtotal</span><span>{fmt(subtotal)}</span></div>
                    {defaultServiceCharge > 0 && <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}><span>Service charge ({defaultServiceCharge}%)</span><span>{fmt(serviceAmt)}</span></div>}
                    {defaultGst > 0 && <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}><span>GST ({defaultGst}%)</span><span>{fmt(gstAmt)}</span></div>}
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: 17, marginTop: 8, paddingTop: 8, borderTop: `2px solid ${COLORS.ink}20` }}>
                      <span>Total</span><span>{fmt(grandTotal)}</span>
                    </div>
                  </div>

                  {bankQR ? (
                    <div style={{ marginTop: 18, textAlign: 'center' }}>
                      <div style={{ fontSize: 13, color: COLORS.ink, opacity: 0.7, marginBottom: 10 }}>Scan to pay · {fmt(grandTotal)}</div>
                      <img src={bankQR} alt="Pay by QR" style={{ width: 180, height: 180, objectFit: 'contain', background: '#fff', padding: 8, borderRadius: 6, border: `1px solid ${COLORS.ink}20`, margin: '0 auto', display: 'block' }} />
                      <p style={{ fontSize: 11, color: COLORS.ink, opacity: 0.5, marginTop: 10 }}>After paying, let your staff know or tap "Call staff" so they can confirm.</p>
                    </div>
                  ) : (
                    <p style={{ fontSize: 13, marginTop: 14, color: COLORS.ink, opacity: 0.6, fontStyle: 'italic' }}>Ask staff to process payment at the counter.</p>
                  )}
                </>
              )}
            </div>
          </div>
        );
      })()}

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


import ReactDOM from 'react-dom/client';
import './index.css';

const API = import.meta.env.VITE_API_BASE || 'https://restaurant-pos-j0sb.onrender.com';
const C = { bg:'#16140F', panel:'#201D17', border:'#39332A', cream:'#F2ECDD', muted:'#9A9384', ember:'#D9622B', urgent:'#C73E3E', good:'#5C9D6E' };
const inp = { width:'100%', padding:'14px', borderRadius:8, border:`1px solid ${C.border}`, background:C.panel, color:C.cream, fontSize:15, fontFamily:'inherit', outline:'none', boxSizing:'border-box', marginBottom:14 };

// Unique device ID — combines random ID with browser fingerprint
// so iCloud sync can't copy it to another device meaningfully
function getDeviceId() {
  try {
    let id = localStorage.getItem('tf_device_id');
    if (!id) {
      // Generate ID that includes device-specific info
      const fp = [
        navigator.userAgent,
        navigator.language,
        screen.width + 'x' + screen.height,
        screen.colorDepth,
        new Date().getTimezoneOffset(),
        navigator.hardwareConcurrency || 0,
      ].join('|');
      // Hash-like combination
      let hash = 0;
      for (let i = 0; i < fp.length; i++) {
        hash = ((hash << 5) - hash) + fp.charCodeAt(i);
        hash |= 0;
      }
      id = 'dev_' + Math.abs(hash).toString(36) + '_' + Math.random().toString(36).slice(2) + Date.now().toString(36);
      localStorage.setItem('tf_device_id', id);
    }
    return id;
  } catch { return 'unknown_' + Math.random().toString(36).slice(2); }
}

// ── Restaurant login screen ────────────────────────────────
function LoginScreen({ onSuccess }) {
  const [email, setEmail] = useState('');
  const [key, setKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function login() {
    if (!email.trim() || !key.trim()) { setError('Please enter your email and license key'); return; }
    setLoading(true); setError('');
    try {
      const res = await fetch(`${API}/restaurant/login`, {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ email: email.trim(), licenseKey: key.trim(), deviceId: getDeviceId() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Login failed');
      // Save session
      localStorage.setItem('tf_session', data.sessionToken);
      localStorage.setItem('tf_restaurant_code', data.restaurantCode);
      localStorage.setItem('tf_restaurant_name', data.restaurantName);
      onSuccess(data);
    } catch(e) { setError(e.message); }
    setLoading(false);
  }

  return (
    <div style={{ minHeight:'100vh', background:C.bg, display:'flex', alignItems:'center', justifyContent:'center', padding:24, fontFamily:'Inter,sans-serif' }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Oswald:wght@600;700&family=Inter:wght@400;600;700&display=swap'); input::placeholder{color:${C.muted}}`}</style>
      <div style={{ width:'100%', maxWidth:380 }}>
        <div style={{ textAlign:'center', marginBottom:36 }}>
          <div style={{ fontFamily:"'Oswald',sans-serif", fontSize:36, letterSpacing:3, color:C.ember, textTransform:'uppercase' }}>🔥 TableFire</div>
          <div style={{ color:C.muted, fontSize:13, marginTop:6 }}>Sign in to your restaurant</div>
        </div>

        <label style={{ display:'block', fontSize:11, textTransform:'uppercase', letterSpacing:0.5, color:C.muted, marginBottom:6 }}>Email address</label>
        <input value={email} onChange={e=>setEmail(e.target.value)} type="email" placeholder="owner@restaurant.com" style={inp}/>

        <label style={{ display:'block', fontSize:11, textTransform:'uppercase', letterSpacing:0.5, color:C.muted, marginBottom:6 }}>License key</label>
        <input
          value={key}
          onChange={e=>setKey(e.target.value.toUpperCase().trim())}
          onPaste={e=>{ setTimeout(()=>setKey(e.target.value.toUpperCase().trim()),10); }}
          placeholder="TF-XXXX-XXXX-XXXX-XXXX"
          style={{...inp, fontFamily:'monospace'}}
          autoCapitalize="characters"
          autoCorrect="off"
          spellCheck={false}
          onKeyDown={e=>e.key==='Enter'&&login()}
        />

        {error && <div style={{ color:C.urgent, fontSize:13, marginBottom:14, padding:'10px 14px', background:`${C.urgent}15`, border:`1px solid ${C.urgent}44`, borderRadius:6 }}>{error}</div>}

        <button onClick={login} disabled={loading} style={{ width:'100%', padding:16, borderRadius:8, border:'none', background:C.ember, color:'#fff', fontSize:16, fontWeight:700, cursor:'pointer' }}>
          {loading ? 'Signing in…' : 'Sign in →'}
        </button>

        <p style={{ color:C.muted, fontSize:12, marginTop:20, textAlign:'center', lineHeight:1.6 }}>
          Your license key was sent to your email when you signed up.<br/>
          Need help? <a href="mailto:support@tablefire.app" style={{ color:C.ember }}>support@tablefire.app</a>
        </p>
      </div>
    </div>
  );
}

function BlockedScreen({ reason, onReset }) {
  return (
    <div style={{ minHeight:'100vh', background:C.bg, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:24, fontFamily:'Inter,sans-serif', textAlign:'center' }}>
      <div style={{ fontSize:48, marginBottom:16 }}>🔒</div>
      <div style={{ fontFamily:"'Oswald',sans-serif", fontSize:22, color:C.cream, letterSpacing:2, textTransform:'uppercase', marginBottom:12 }}>Access Denied</div>
      <div style={{ color:C.urgent, fontSize:15, maxWidth:360, marginBottom:24, lineHeight:1.6 }}>{reason}</div>
      <a href="mailto:support@tablefire.app" style={{ color:C.ember, fontSize:14 }}>support@tablefire.app</a>
      <button onClick={onReset} style={{ marginTop:20, padding:'10px 24px', borderRadius:8, border:`1px solid ${C.border}`, background:'transparent', color:C.muted, fontSize:13, cursor:'pointer' }}>
        Sign in with different account
      </button>
    </div>
  );
}

// ── Root router ────────────────────────────────────────────
function Root() {
  const path = window.location.pathname;
  const isCustomer = path.startsWith('/customer');
  const isOwner    = path.startsWith('/owner');
  const isDemo     = path.startsWith('/demo');
  const isStation  = path.startsWith('/kitchen') || path.startsWith('/bar');

  const [session, setSession] = useState(null); // { restaurantCode, restaurantName }
  const [blocked, setBlocked] = useState(null);
  const [checking, setChecking] = useState(true);
  const [Comp, setComp] = useState(null);

  // On load, try to restore session
  useEffect(() => {
    if (isStation || isDemo || isOwner || isCustomer) { setChecking(false); return; }
    const savedToken = localStorage.getItem('tf_session');
    const savedCode  = localStorage.getItem('tf_restaurant_code');
    const savedName  = localStorage.getItem('tf_restaurant_name');

    if (!savedToken || !savedCode) { setChecking(false); return; }

    // INSTANTLY load from cache so app opens right away
    import('./lib/storage.js').then(m => m.setRestaurantCode(savedCode));
    setSession({ restaurantCode: savedCode, restaurantName: savedName });
    setChecking(false);

    // Verify in background — if wrong device, block after the fact
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000); // 8 second timeout
    fetch(`${API}/restaurant/verify-session`, {
      method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ sessionToken: savedToken, deviceId: getDeviceId() }),
      signal: controller.signal,
    }).then(r=>r.json()).then(data => {
      clearTimeout(timeout);
      if (data.reason === 'Wrong device') {
        // Block after background check confirms wrong device
        localStorage.removeItem('tf_session');
        localStorage.removeItem('tf_restaurant_code');
        localStorage.removeItem('tf_restaurant_name');
        localStorage.removeItem('tf_device_id');
        setSession(null);
        setBlocked('This account is registered to a different device.');
      }
    }).catch(() => {
      clearTimeout(timeout);
      // Server offline or timeout — keep using cached session, no problem
    });
  }, []);

  // Load component when session/route is known
  useEffect(() => {
    if (isStation) { import('./StationApp.jsx').then(m=>setComp(()=>m.default)); return; }
    if (isDemo) { import('./DemoApp.jsx').then(m=>setComp(()=>m.default)); return; }
    if (isOwner) { import('./OwnerDashboard.jsx').then(m=>setComp(()=>m.default)); return; }
    if (isCustomer) { import('./CustomerApp.jsx').then(m=>setComp(()=>m.default)); return; }
    if (session) { setComp(()=>KoreanRestaurantPOS); }
  }, [session, isOwner, isCustomer]);

  function handleLogin(data) {
    import('./lib/storage.js').then(m => m.setRestaurantCode(data.restaurantCode));
    setSession({ restaurantCode: data.restaurantCode, restaurantName: data.restaurantName });
  }

  function handleReset() {
    localStorage.removeItem('tf_session');
    localStorage.removeItem('tf_restaurant_code');
    localStorage.removeItem('tf_restaurant_name');
    setBlocked(null); setSession(null);
  }

  if (isStation || isDemo || isOwner || isCustomer) {
    if (!Comp) return <Loader/>;
    return <Comp/>;
  }

  if (checking) return <Loader/>;
  if (blocked) return <BlockedScreen reason={blocked} onReset={handleReset}/>;
  if (!session) return <LoginScreen onSuccess={handleLogin}/>;
  if (!Comp) return <Loader/>;
  return <Comp/>;
}

function Loader() {
  return <div style={{ minHeight:'100vh', background:C.bg, display:'flex', alignItems:'center', justifyContent:'center', color:C.muted, fontFamily:'Inter,sans-serif', fontSize:14 }}>Loading…</div>;
}
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <ErrorBoundary><Root/></ErrorBoundary>
);

export default KoreanRestaurantPOS;
