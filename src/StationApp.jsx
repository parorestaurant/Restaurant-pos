import React, { useState, useEffect, useRef } from 'react';
import { ChefHat, Wine, Clock, Check, X, History, Bell } from 'lucide-react';
import { loadKey, saveKey } from './lib/storage';

const COLORS = {
  bg:'#16140F', panel:'#201D17', border:'#39332A',
  cream:'#F2ECDD', muted:'#9A9384',
  ember:'#D9622B', good:'#5C9D6E', urgent:'#C73E3E',
  warn:'#D9A12B', well:'#4A90D9',
};

const money = () => {};

// Beep sound using Web Audio API
function playBeep(type='ready') {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    if (type === 'ready') {
      // Two-tone pleasant beep for "order ready"
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      osc.frequency.setValueAtTime(1100, ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.3);
    } else {
      // Single beep for new order
      osc.frequency.setValueAtTime(660, ctx.currentTime);
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.2);
    }
  } catch {}
}

function formatElapsed(ms) {
  const m = Math.floor(ms/60000);
  const s = Math.floor((ms%60000)/1000);
  return `${m}:${String(s).padStart(2,'0')}`;
}

function ageColor(ms) {
  if (ms < 5*60000) return COLORS.good;
  if (ms < 10*60000) return COLORS.warn;
  return COLORS.urgent;
}

// ── PIN screen ─────────────────────────────────────────────
function PinScreen({ station, pin, onSuccess }) {
  const [input, setInput] = useState('');
  const [error, setError] = useState('');
  const Icon = station === 'kitchen' ? ChefHat : Wine;
  const color = station === 'kitchen' ? COLORS.ember : COLORS.well;

  function tryPin() {
    if (input === pin) { setError(''); onSuccess(); }
    else { setError('Wrong PIN — try again'); setInput(''); }
  }

  return (
    <div style={{ minHeight:'100vh', background:COLORS.bg, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', fontFamily:'Inter,sans-serif' }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Oswald:wght@600;700&family=Inter:wght@400;600;700&display=swap')`}</style>
      <Icon size={40} color={color} style={{ marginBottom:16 }}/>
      <div style={{ fontFamily:"'Oswald',sans-serif", fontSize:28, color:COLORS.cream, textTransform:'uppercase', letterSpacing:2, marginBottom:4 }}>
        {station === 'kitchen' ? 'Kitchen' : 'Bar'} Display
      </div>
      <div style={{ color:COLORS.muted, fontSize:13, marginBottom:36 }}>Enter {station} PIN to continue</div>

      {/* PIN dots */}
      <div style={{ display:'flex', gap:10, marginBottom:20 }}>
        {[0,1,2,3].map(i=>(
          <div key={i} style={{ width:14, height:14, borderRadius:'50%', background: i < input.length ? color : COLORS.border }}/>
        ))}
      </div>

      {/* Keypad */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:10, width:240 }}>
        {[1,2,3,4,5,6,7,8,9,'⌫',0,'→'].map(k=>(
          <button key={k} onClick={()=>{
            if (k==='⌫') setInput(p=>p.slice(0,-1));
            else if (k==='→') tryPin();
            else if (input.length < 6) setInput(p=>p+k);
          }} style={{ height:60, borderRadius:8, border:`1px solid ${k==='→'?color:COLORS.border}`, background:k==='→'?color:COLORS.panel, color:COLORS.cream, fontSize:k==='→'||k==='⌫'?20:22, fontWeight:600, cursor:'pointer' }}>
            {k}
          </button>
        ))}
      </div>

      {error && <div style={{ color:COLORS.urgent, fontSize:13, marginTop:16 }}>{error}</div>}
    </div>
  );
}

// ── Ticket card ────────────────────────────────────────────
function TicketCard({ ticket, now, onAdvance, station }) {
  const [confirmCancel, setConfirmCancel] = React.useState(null);
  if (!ticket || !ticket.items || ticket.status === 'cancelled') return null;
  const elapsed = now - (ticket.firedAt || now);
  const color = ageColor(elapsed);
  const accent = station === 'kitchen' ? COLORS.ember : COLORS.well;
  const nextLabel = ticket.status === 'new' ? '▶ Start' : ticket.status === 'preparing' ? '✓ Mark ready' : '✓ Served';

  return (
    <div style={{ background:COLORS.paper||'#F2ECDD', color:'#2A2620', borderRadius:6, borderTop:`4px solid ${accent}`, padding:'14px 16px', marginBottom:12, boxShadow:'0 2px 8px #0004' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'baseline', marginBottom:4 }}>
        <span style={{ fontFamily:"'Oswald',sans-serif", fontSize:22, fontWeight:700 }}>TABLE {ticket.table}</span>
        <span style={{ fontFamily:'monospace', fontSize:11, opacity:0.5 }}>#{(ticket.id||'').slice(-5)}</span>
      </div>
      <div style={{ display:'inline-flex', alignItems:'center', gap:5, marginBottom:10, fontFamily:'monospace', fontSize:12, color }}>
        <Clock size={12}/> {formatElapsed(elapsed)} on rail
      </div>
      {ticket.customerName && <div style={{ fontSize:11, color:'#555', marginBottom:6 }}>👤 {ticket.customerName}{ticket.customerCID?` · CID: ${ticket.customerCID}`:''}</div>}
      <ul style={{ listStyle:'none', padding:0, margin:0 }}>
        {ticket.items.map((it, i)=>(
          <li key={i} style={{ padding:'5px 0', borderTop:i===0?'none':'1px solid #2A262015', fontSize:14 }}>
            {confirmCancel===i ? (
              <div style={{ display:'flex', alignItems:'center', gap:6, background:'#C73E3E18', padding:'4px 6px', borderRadius:4 }}>
                <span style={{ flex:1, fontSize:12 }}>Remove {it.qty}× {it.name}?</span>
                <button onClick={()=>{ onAdvance(ticket.id, 'cancel-item', i); setConfirmCancel(null); }} style={{ background:COLORS.urgent, color:'#fff', border:'none', borderRadius:3, padding:'3px 8px', fontSize:12, fontWeight:700, cursor:'pointer' }}>Yes</button>
                <button onClick={()=>setConfirmCancel(null)} style={{ background:COLORS.muted, color:'#fff', border:'none', borderRadius:3, padding:'3px 8px', fontSize:12, cursor:'pointer' }}>No</button>
              </div>
            ) : (
              <div style={{ display:'flex', alignItems:'flex-start', gap:6 }}>
                <div style={{ flex:1, textDecoration: it.ready ? 'line-through' : 'none', opacity: it.ready ? 0.5 : 1 }}><span style={{ fontWeight:700 }}>{it.qty}×</span> {it.name}
                  {it.notes&&<div style={{ fontSize:11, fontStyle:'italic', opacity:0.6, marginLeft:22 }}>{it.notes}</div>}
                </div>
                {!it.ready && <button onClick={()=>onAdvance(ticket.id,'ready-item',i)} style={{ height:20, borderRadius:3, border:'1px solid #5C9D6E55', background:'#5C9D6E18', color:'#5C9D6E', cursor:'pointer', padding:'0 6px', fontSize:11, fontWeight:700 }}>✓ Ready</button>}
                {it.ready && <span style={{ fontSize:11, color:'#5C9D6E', fontWeight:700 }}>✓ Served</span>}
                <button onClick={()=>setConfirmCancel(i)} style={{ width:20, height:20, borderRadius:3, border:'1px solid #C73E3E55', background:'#C73E3E18', color:COLORS.urgent, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}><X size={11}/></button>
              </div>
            )}
          </li>
        ))}
      </ul>
      <button onClick={()=>onAdvance(ticket.id, 'advance')} style={{ marginTop:12, width:'100%', background:accent, color:'#fff', border:'none', borderRadius:4, padding:'9px 0', fontWeight:700, fontSize:13, cursor:'pointer' }}>
        {nextLabel}
      </button>
    </div>
  );
}

// ── Main station app ───────────────────────────────────────
export default function StationApp() {
  const station = window.location.pathname.includes('bar') ? 'bar' : 'kitchen';
  const accent = station === 'kitchen' ? COLORS.ember : COLORS.well;
  const Icon = station === 'kitchen' ? ChefHat : Wine;

  // Get restaurant code from storage
  const restaurantCode = (() => { try { return localStorage.getItem('tf_restaurant_code') || ''; } catch { return ''; } })();
  useEffect(() => {
    // Storage scoping handled via loadKey prefix
  }, []);

  const [authed, setAuthed] = useState(false);
  const [pin, setPin] = useState('0000'); // loaded from config
  const [tickets, setTickets] = useState([]);
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [now, setNow] = useState(Date.now());
  const [restaurantName, setRestaurantName] = useState('THAB - BHUTANESE BBQ');
  const prevTicketIds = useRef(new Set());
  const prevReadyIds = useRef(new Set());

  useEffect(() => { const t = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(t); }, []);

  // Load config and tickets
  async function loadData() {
    try {
      const cfgKey = restaurantCode ? `${restaurantCode}:config` : 'config';
      const cfg = await loadKey(cfgKey.split(':').pop(), {});
      if (cfg) {
        const stationPin = station === 'kitchen' ? (cfg.kitchenPin || cfg.staffPin || '5678') : (cfg.barPin || cfg.staffPin || '5678');
        setPin(stationPin);
        if (cfg.restaurantName) setRestaurantName(cfg.restaurantName);
      }
    } catch {}
    try {
      const t = await loadKey('tickets', []);
      const active = (t||[]).filter(tk => tk.station === station && tk.status !== 'cancelled');
      const served = (t||[]).filter(tk => tk.station === station && tk.status === 'served');

      // Beep on new tickets
      const newIds = new Set(active.map(tk=>tk.id));
      const readyIds = new Set(active.filter(tk=>tk.status==='ready').map(tk=>tk.id));

      active.forEach(tk => {
        if (!prevTicketIds.current.has(tk.id)) playBeep('new');
      });
      readyIds.forEach(id => {
        if (!prevReadyIds.current.has(id)) playBeep('ready');
      });

      prevTicketIds.current = newIds;
      prevReadyIds.current = readyIds;

      setTickets(active);
      setHistory(served.slice(-20).reverse());
    } catch {}
  }

  useEffect(() => {
    loadData();
    const t = setInterval(loadData, 6000);
    return () => clearInterval(t);
  }, [authed]);

  async function handleAdvance(ticketId, action, itemIdx) {
    const all = await loadKey('tickets', []);
    let updated;
    if (action === 'ready-item') {
      const ticket = all.find(t => t.id === ticketId);
      const item = ticket?.items?.[itemIdx];
      updated = all.map(t => t.id === ticketId ? {
        ...t,
        items: t.items.map((it, i) => i === itemIdx ? { ...it, ready: true } : it)
      } : t);
      await saveKey('tickets', updated);
      setTickets(updated);
      // Notify staff that item is ready to serve
      if (item && ticket) {
        const calls = await loadKey('calls', []);
        const stationLabel = station === 'kitchen' ? '👨‍🍳 Kitchen' : '🍹 Bar';
        const newCalls = [...calls, {
          id: 'ready-' + Date.now(),
          type: 'item-ready',
          table: ticket.table,
          message: `${stationLabel}: ${item.qty}× ${item.name} ready — Table ${ticket.table}`,
          status: 'pending',
          createdAt: Date.now(),
        }];
        await saveKey('calls', newCalls);
      }
      return;
    }
    if (action === 'cancel-item') {
      updated = all.map(t => {
        if (t.id !== ticketId) return t;
        const items = t.items.filter((_, i) => i !== itemIdx);
        return items.length === 0 ? { ...t, status:'cancelled' } : { ...t, items };
      });
    } else {
      updated = all.map(t => {
        if (t.id !== ticketId) return t;
        const next = t.status === 'new' ? 'preparing' : t.status === 'preparing' ? 'ready' : 'served';
        return { ...t, status: next };
      });
    }
    await saveKey('tickets', updated);
    loadData();
  }

  if (!authed) return <PinScreen station={station} pin={pin} onSuccess={() => setAuthed(true)}/>;

  const lanes = ['new', 'preparing', 'ready'];
  const active = tickets.filter(t => t.status !== 'served');
  const newCount = active.filter(t => t.status === 'new').length;
  const readyCount = active.filter(t => t.status === 'ready').length;

  return (
    <div style={{ minHeight:'100vh', background:COLORS.bg, fontFamily:'Inter,sans-serif', color:COLORS.cream }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Oswald:wght@600;700&family=Inter:wght@400;600;700&family=JetBrains+Mono:wght@700&display=swap'); *{box-sizing:border-box}`}</style>

      {/* Header */}
      <div style={{ background:COLORS.panel, borderBottom:`1px solid ${COLORS.border}`, padding:'12px 20px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <Icon size={22} color={accent}/>
          <div>
            <div style={{ fontFamily:"'Oswald',sans-serif", fontSize:18, textTransform:'uppercase', letterSpacing:1, color:COLORS.cream }}>{station === 'kitchen' ? 'Kitchen' : 'Bar'} Display</div>
            <div style={{ fontSize:11, color:COLORS.muted }}>{restaurantName}</div>
          </div>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          {newCount > 0 && <div style={{ background:`${COLORS.urgent}22`, border:`1px solid ${COLORS.urgent}55`, borderRadius:6, padding:'4px 10px', fontSize:12, color:COLORS.urgent, fontWeight:700 }}>{newCount} new</div>}
          {readyCount > 0 && <div style={{ background:`${COLORS.good}22`, border:`1px solid ${COLORS.good}55`, borderRadius:6, padding:'4px 10px', fontSize:12, color:COLORS.good, fontWeight:700 }}>{readyCount} ready</div>}
          <button onClick={() => setShowHistory(!showHistory)} style={{ display:'flex', alignItems:'center', gap:6, padding:'6px 12px', background:showHistory?`${COLORS.well}22`:'transparent', border:`1px solid ${showHistory?COLORS.well:COLORS.border}`, borderRadius:6, color:showHistory?COLORS.well:COLORS.muted, fontSize:12, cursor:'pointer' }}>
            <History size={14}/> History
          </button>
          <button onClick={() => setAuthed(false)} style={{ padding:'6px 12px', background:'transparent', border:`1px solid ${COLORS.border}`, borderRadius:6, color:COLORS.muted, fontSize:12, cursor:'pointer' }}>Lock</button>
        </div>
      </div>

      <div style={{ maxWidth:1200, margin:'0 auto', padding:'20px 16px' }}>
        {showHistory ? (
          /* History view */
          <div>
            <div style={{ fontFamily:"'Oswald',sans-serif", fontSize:20, textTransform:'uppercase', letterSpacing:1, color:COLORS.cream, marginBottom:16 }}>Served today</div>
            {history.length === 0 ? (
              <div style={{ color:COLORS.muted, textAlign:'center', padding:40, fontSize:14 }}>No served orders yet today</div>
            ) : (
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(260px,1fr))', gap:12 }}>
                {history.map(t => (
                  <div key={t.id} style={{ background:COLORS.panel, border:`1px solid ${COLORS.border}`, borderRadius:8, padding:14 }}>
                    <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}>
                      <span style={{ fontFamily:"'Oswald',sans-serif", fontSize:18, color:COLORS.cream }}>TABLE {t.table}</span>
                      <span style={{ fontSize:11, color:COLORS.muted, fontFamily:'monospace' }}>{t.firedAt ? new Date(t.firedAt).toLocaleTimeString() : ''}</span>
                    </div>
                    {t.customerName && <div style={{ fontSize:11, color:COLORS.muted, marginBottom:6 }}>👤 {t.customerName}</div>}
                    {t.items.map((it,i) => (
                      <div key={i} style={{ fontSize:13, color:COLORS.muted, padding:'2px 0' }}><span style={{ color:COLORS.cream, fontWeight:600 }}>{it.qty}×</span> {it.name}</div>
                    ))}
                    <div style={{ marginTop:8, display:'inline-block', padding:'2px 10px', borderRadius:10, background:`${COLORS.good}22`, color:COLORS.good, fontSize:11, fontWeight:700 }}>✓ Served</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          /* Active tickets — 3 lane view */
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:16 }}>
            {lanes.map(lane => {
              const laneTickets = active.filter(t => t.status === lane).sort((a,b) => a.firedAt - b.firedAt);
              const laneColor = lane === 'new' ? COLORS.urgent : lane === 'preparing' ? COLORS.warn : COLORS.good;
              return (
                <div key={lane}>
                  <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12, paddingBottom:8, borderBottom:`2px solid ${laneColor}44` }}>
                    <span style={{ fontFamily:"'Oswald',sans-serif", fontSize:14, textTransform:'uppercase', letterSpacing:1, color:laneColor }}>
                      {lane === 'new' ? '🔴 New' : lane === 'preparing' ? '🟡 Preparing' : '🟢 Ready'}
                    </span>
                    <span style={{ background:`${laneColor}22`, color:laneColor, borderRadius:10, padding:'2px 8px', fontSize:12, fontWeight:700 }}>{laneTickets.length}</span>
                  </div>
                  {laneTickets.length === 0 ? (
                    <div style={{ color:COLORS.muted, fontSize:13, fontStyle:'italic', textAlign:'center', padding:'20px 0' }}>Clear</div>
                  ) : laneTickets.map(t => (
                    <TicketCard key={t.id} ticket={t} now={now} station={station} onAdvance={handleAdvance}/>
                  ))}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
