import React, { useState, useEffect } from 'react';
import {
  ChefHat, Wine, UtensilsCrossed, CreditCard, Map as MapIcon,
  Plus, Minus, X, Check, Bell, Clock, ShoppingCart,
  BarChart2, TrendingUp, ShoppingBag, Star,
} from 'lucide-react';

const C = {
  bg:'#16140F', panel:'#201D17', border:'#39332A',
  cream:'#F2ECDD', muted:'#9A9384',
  ember:'#D9622B', good:'#5C9D6E', urgent:'#C73E3E',
  warn:'#D9A12B', well:'#4A90D9',
};
const money = n => `$${(Number(n)||0).toFixed(2)}`;
const card = (extra={}) => ({ background:C.panel, border:`1px solid ${C.border}`, borderRadius:10, padding:18, ...extra });

// ── Demo data ─────────────────────────────────────────────
const DEMO_MENU = [
  { id:'m1', name:'Mandu (Dumplings)',      category:'Starters', station:'kitchen', price:8  },
  { id:'m2', name:'Kimchi Pancake',         category:'Starters', station:'kitchen', price:11 },
  { id:'m3', name:'Chicken Wings',          category:'Starters', station:'kitchen', price:12 },
  { id:'m4', name:'Bibimbap',               category:'Mains',    station:'kitchen', price:15 },
  { id:'m5', name:'Bulgogi Beef',           category:'Mains',    station:'kitchen', price:19 },
  { id:'m6', name:'Samgyeopsal Pork Belly', category:'Mains',    station:'kitchen', price:22 },
  { id:'m7', name:'Extra Beef Slices',      category:'Extras',   station:'kitchen', price:8  },
  { id:'m8', name:'Extra Pork Belly',       category:'Extras',   station:'kitchen', price:8  },
  { id:'m9', name:'Soju',                   category:'Drinks',   station:'bar',     price:9  },
  { id:'m10',name:'Korean Beer',            category:'Drinks',   station:'bar',     price:7  },
  { id:'m11',name:'Yuzu Cocktail',          category:'Drinks',   station:'bar',     price:11 },
  { id:'m12',name:'Barley Tea',             category:'Drinks',   station:'bar',     price:3  },
];

const DEMO_TABLES = 8;

const DEMO_TICKETS = [
  { id:'t1', table:2, station:'kitchen', status:'new',      firedAt:Date.now()-4*60000, items:[{name:'Bibimbap',qty:2,notes:''},{name:'Chicken Wings',qty:1,notes:'extra crispy'}] },
  { id:'t2', table:2, station:'bar',     status:'preparing', firedAt:Date.now()-4*60000, items:[{name:'Korean Beer',qty:2,notes:''},{name:'Soju',qty:1,notes:''}] },
  { id:'t3', table:5, station:'kitchen', status:'preparing', firedAt:Date.now()-12*60000, items:[{name:'Bulgogi Beef',qty:1,notes:''},{name:'Samgyeopsal Pork Belly',qty:2,notes:'well done'}] },
  { id:'t4', table:5, station:'bar',     status:'ready',     firedAt:Date.now()-12*60000, items:[{name:'Yuzu Cocktail',qty:2,notes:''}] },
  { id:'t5', table:3, station:'kitchen', status:'ready',     firedAt:Date.now()-20*60000, items:[{name:'Mandu (Dumplings)',qty:3,notes:''}] },
];

const DEMO_REPORTS = {
  todayRevenue: 4280,
  weekRevenue: 18650,
  monthRevenue: 67400,
  todayOrders: 23,
  avgOrder: 186,
  topItems: [
    { name:'Samgyeopsal Pork Belly', qty:47, revenue:1034 },
    { name:'Bulgogi Beef',           qty:38, revenue: 722 },
    { name:'Bibimbap',               qty:35, revenue: 525 },
    { name:'Soju',                   qty:61, revenue: 549 },
    { name:'Korean Beer',            qty:54, revenue: 378 },
  ],
  last7: [
    { label:'Mon', revenue:2100 },
    { label:'Tue', revenue:3400 },
    { label:'Wed', revenue:2800 },
    { label:'Thu', revenue:4100 },
    { label:'Fri', revenue:5200 },
    { label:'Sat', revenue:6800 },
    { label:'Today', revenue:4280 },
  ],
};

// ── Components ────────────────────────────────────────────

function FloorView({ tickets, onUnlock }) {
  const [selected, setSelected] = useState(null);
  const occupied = [2,3,5];
  const calling = [3];

  function status(n) {
    if (calling.includes(n)) return { color:C.urgent, label:'Calling staff', pulse:true };
    if (occupied.includes(n)) return { color:C.warn, label:'Occupied', pulse:false };
    return { color:C.good, label:'Available', pulse:false };
  }

  return (
    <div>
      <h2 style={{ fontFamily:"'Oswald',sans-serif", fontSize:22, textTransform:'uppercase', letterSpacing:1, marginBottom:16, color:C.cream }}>Floor map</h2>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:10, marginBottom:20 }}>
        {Array.from({length:DEMO_TABLES},(_,i)=>i+1).map(n => {
          const s = status(n);
          const isSel = selected===n;
          return (
            <div key={n} onClick={()=>setSelected(isSel?null:n)} style={{ ...card(), border:`2px solid ${isSel?s.color:C.border}`, cursor:'pointer', textAlign:'center', padding:14, animation: s.pulse?'pulse 1.5s infinite':'' }}>
              <div style={{ fontFamily:"'Oswald',sans-serif", fontSize:28, color:C.cream }}>{n}</div>
              <div style={{ fontSize:11, color:s.color, textTransform:'uppercase', letterSpacing:0.5, marginTop:4 }}>{s.label}</div>
            </div>
          );
        })}
      </div>
      {selected && (
        <div style={card()}>
          <div style={{ fontFamily:"'Oswald',sans-serif", fontSize:18, color:C.cream, marginBottom:12 }}>Table {selected}</div>
          {calling.includes(selected) && <div style={{ color:C.urgent, fontSize:13, marginBottom:12 }}>⚠️ Customer is calling for staff!</div>}
          <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
            {!occupied.includes(selected) && <button onClick={()=>onUnlock(selected)} style={{ padding:'8px 16px', background:C.good, color:'#fff', border:'none', borderRadius:6, cursor:'pointer', fontSize:13, fontWeight:700 }}>Unlock for customers</button>}
            {occupied.includes(selected) && <button style={{ padding:'8px 16px', background:C.ember, color:'#fff', border:'none', borderRadius:6, cursor:'pointer', fontSize:13, fontWeight:700 }}>Go to checkout</button>}
            {calling.includes(selected) && <button style={{ padding:'8px 16px', background:C.urgent, color:'#fff', border:'none', borderRadius:6, cursor:'pointer', fontSize:13, fontWeight:700 }}>Acknowledge call</button>}
          </div>
        </div>
      )}
    </div>
  );
}

function OrderView() {
  const [selectedCat, setSelectedCat] = useState('Mains');
  const [cart, setCart] = useState([]);
  const [ordered, setOrdered] = useState(false);
  const [selectedTable, setSelectedTable] = useState(2);
  const cats = [...new Set(DEMO_MENU.map(m=>m.category))];

  function addItem(item) {
    setCart(prev => {
      const ex = prev.find(c=>c.id===item.id);
      if (ex) return prev.map(c=>c.id===item.id?{...c,qty:c.qty+1}:c);
      return [...prev, {...item, qty:1}];
    });
  }

  function removeItem(id) {
    setCart(prev => prev.map(c=>c.id===id?{...c,qty:c.qty-1}:c).filter(c=>c.qty>0));
  }

  const total = cart.reduce((s,c)=>s+c.price*c.qty,0);

  if (ordered) return (
    <div style={{ textAlign:'center', padding:40 }}>
      <div style={{ fontSize:48, marginBottom:16 }}>🔥</div>
      <div style={{ fontFamily:"'Oswald',sans-serif", fontSize:24, color:C.good, marginBottom:8 }}>Order fired!</div>
      <div style={{ color:C.muted, fontSize:14, marginBottom:24 }}>Table {selectedTable} order sent to kitchen & bar</div>
      <button onClick={()=>{setOrdered(false);setCart([]);}} style={{ padding:'10px 24px', background:C.ember, color:'#fff', border:'none', borderRadius:6, cursor:'pointer', fontSize:14, fontWeight:700 }}>New order</button>
    </div>
  );

  return (
    <div style={{ display:'flex', gap:16, flexWrap:'wrap' }}>
      <div style={{ flex:2, minWidth:280 }}>
        <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:16 }}>
          <span style={{ color:C.muted, fontSize:13 }}>Table:</span>
          {[1,2,3,4,5].map(n=>(
            <button key={n} onClick={()=>setSelectedTable(n)} style={{ width:34, height:34, borderRadius:6, border:`1px solid ${selectedTable===n?C.ember:C.border}`, background:selectedTable===n?`${C.ember}22`:'transparent', color:selectedTable===n?C.ember:C.muted, cursor:'pointer', fontWeight:700 }}>{n}</button>
          ))}
        </div>
        <div style={{ display:'flex', gap:6, flexWrap:'wrap', marginBottom:14 }}>
          {cats.map(cat=>(
            <button key={cat} onClick={()=>setSelectedCat(cat)} style={{ padding:'6px 14px', borderRadius:20, fontSize:13, cursor:'pointer', border:`1px solid ${selectedCat===cat?C.ember:C.border}`, background:selectedCat===cat?`${C.ember}22`:'transparent', color:selectedCat===cat?C.ember:C.muted }}>{cat}</button>
          ))}
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:10 }}>
          {DEMO_MENU.filter(m=>m.category===selectedCat).map(item=>{
            const inCart = cart.find(c=>c.id===item.id);
            return (
              <div key={item.id} style={card({cursor:'pointer'})} onClick={()=>addItem(item)}>
                <div style={{ color:C.cream, fontSize:14, fontWeight:600 }}>{item.name}</div>
                <div style={{ color:C.ember, fontSize:14, fontWeight:700, marginTop:6 }}>{money(item.price)}</div>
                {inCart && <div style={{ marginTop:6, display:'inline-block', background:`${C.good}22`, color:C.good, borderRadius:10, padding:'2px 10px', fontSize:12, fontWeight:700 }}>× {inCart.qty} in cart</div>}
              </div>
            );
          })}
        </div>
      </div>
      <div style={{ flex:1, minWidth:220 }}>
        <div style={card({position:'sticky', top:80})}>
          <div style={{ fontFamily:"'Oswald',sans-serif", fontSize:16, color:C.cream, textTransform:'uppercase', letterSpacing:1, marginBottom:12 }}>Table {selectedTable} order</div>
          {cart.length===0 ? <div style={{ color:C.muted, fontSize:13, fontStyle:'italic' }}>Tap items to add them</div> : <>
            {cart.map(c=>(
              <div key={c.id} style={{ display:'flex', alignItems:'center', gap:8, padding:'8px 0', borderBottom:`1px solid ${C.border}` }}>
                <div style={{ flex:1, color:C.cream, fontSize:13 }}>{c.name}</div>
                <button onClick={()=>removeItem(c.id)} style={{ width:22,height:22,borderRadius:4,border:`1px solid ${C.border}`,background:'transparent',color:C.muted,cursor:'pointer',fontSize:14 }}>−</button>
                <span style={{ color:C.cream, fontSize:13, minWidth:16, textAlign:'center' }}>{c.qty}</span>
                <button onClick={()=>addItem(c)} style={{ width:22,height:22,borderRadius:4,border:'none',background:C.ember,color:'#fff',cursor:'pointer',fontSize:14 }}>+</button>
              </div>
            ))}
            <div style={{ display:'flex', justifyContent:'space-between', marginTop:12, marginBottom:16 }}>
              <span style={{ color:C.muted }}>Total</span>
              <span style={{ color:C.cream, fontWeight:700, fontSize:18 }}>{money(total)}</span>
            </div>
            <button onClick={()=>setOrdered(true)} style={{ width:'100%', padding:12, background:C.ember, color:'#fff', border:'none', borderRadius:6, fontWeight:700, fontSize:14, cursor:'pointer' }}>🔥 Fire order</button>
          </>}
        </div>
      </div>
    </div>
  );
}

function KitchenView({ station }) {
  const [tickets, setTickets] = useState(DEMO_TICKETS.filter(t=>t.station===station));
  const [now, setNow] = useState(Date.now());
  useEffect(()=>{ const t=setInterval(()=>setNow(Date.now()),1000); return()=>clearInterval(t); },[]);

  const STATUS_COLOR = { new:C.urgent, preparing:C.warn, ready:C.good };
  const lanes = ['new','preparing','ready'];

  function advance(id) {
    setTickets(prev=>prev.map(t=>t.id===id?{...t,status:t.status==='new'?'preparing':t.status==='preparing'?'ready':'served'}:t).filter(t=>t.status!=='served'));
  }

  return (
    <div>
      <h2 style={{ fontFamily:"'Oswald',sans-serif", fontSize:22, textTransform:'uppercase', letterSpacing:1, marginBottom:16, color:C.cream }}>
        {station==='kitchen'?'👨‍🍳 Kitchen':'🍹 Bar'} display
      </h2>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:14 }}>
        {lanes.map(lane=>(
          <div key={lane}>
            <div style={{ color:C.muted, fontSize:11, textTransform:'uppercase', letterSpacing:1, paddingBottom:8, marginBottom:10, borderBottom:`1px solid ${C.border}` }}>
              {lane} · {tickets.filter(t=>t.status===lane).length}
            </div>
            {tickets.filter(t=>t.status===lane).length===0 && <div style={{ color:C.muted, fontSize:13, fontStyle:'italic' }}>Rail clear</div>}
            {tickets.filter(t=>t.status===lane).map(t=>{
              const elapsed = now - t.firedAt;
              const mins = Math.floor(elapsed/60000);
              const secs = Math.floor((elapsed%60000)/1000);
              const color = elapsed < 5*60000 ? C.good : elapsed < 10*60000 ? C.warn : C.urgent;
              return (
                <div key={t.id} style={{ ...card(), marginBottom:10, borderTop:`3px solid ${station==='kitchen'?C.ember:C.well}` }}>
                  <div style={{ fontFamily:"'Oswald',sans-serif", fontSize:20, color:C.cream }}>TABLE {t.table}</div>
                  <div style={{ fontFamily:'monospace', fontSize:12, color, marginBottom:8 }}>⏱ {mins}:{String(secs).padStart(2,'0')} on rail</div>
                  {t.items.map((it,i)=>(
                    <div key={i} style={{ fontSize:13, color:C.cream, padding:'3px 0', borderBottom:i<t.items.length-1?`1px solid ${C.border}33`:'none' }}>
                      <span style={{ fontWeight:700 }}>{it.qty}×</span> {it.name}
                      {it.notes&&<div style={{ fontSize:11, color:C.muted, fontStyle:'italic', marginLeft:16 }}>{it.notes}</div>}
                    </div>
                  ))}
                  <button onClick={()=>advance(t.id)} style={{ width:'100%', marginTop:10, padding:'8px', background:station==='kitchen'?C.ember:C.well, color:'#fff', border:'none', borderRadius:4, cursor:'pointer', fontWeight:700, fontSize:13 }}>
                    {t.status==='new'?'Start':'Mark ready'}
                  </button>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

function CheckoutView() {
  const [paid, setPaid] = useState(false);
  const lines = [
    { name:'Samgyeopsal Pork Belly', qty:2, price:22 },
    { name:'Bibimbap', qty:1, price:15 },
    { name:'Korean Beer', qty:3, price:7 },
    { name:'Yuzu Cocktail', qty:1, price:11 },
  ];
  const subtotal = lines.reduce((s,l)=>s+l.price*l.qty,0);
  const service = subtotal * 0.1;
  const gst = (subtotal+service) * 0.05;
  const total = subtotal + service + gst;

  if (paid) return (
    <div style={{ textAlign:'center', padding:40 }}>
      <div style={{ fontSize:48, marginBottom:12 }}>✅</div>
      <div style={{ fontFamily:"'Oswald',sans-serif", fontSize:24, color:C.good, marginBottom:8 }}>Payment received!</div>
      <div style={{ color:C.muted, fontSize:14, marginBottom:24 }}>Table 5 · {money(total)} cleared</div>
      <button onClick={()=>setPaid(false)} style={{ padding:'10px 24px', background:C.ember, color:'#fff', border:'none', borderRadius:6, cursor:'pointer', fontSize:14, fontWeight:700 }}>New checkout</button>
    </div>
  );

  return (
    <div style={{ maxWidth:420 }}>
      <h2 style={{ fontFamily:"'Oswald',sans-serif", fontSize:22, textTransform:'uppercase', letterSpacing:1, marginBottom:16, color:C.cream }}>Checkout — Table 5</h2>
      <div style={{ ...card(), marginBottom:16, background:'#F2ECDD', color:'#2A2620' }}>
        {lines.map((l,i)=>(
          <div key={i} style={{ display:'flex', justifyContent:'space-between', padding:'6px 0', borderBottom:i<lines.length-1?'1px solid #2A262015':'' }}>
            <span><span style={{ fontWeight:700 }}>{l.qty}×</span> {l.name}</span>
            <span style={{ fontFamily:'monospace' }}>{money(l.price*l.qty)}</span>
          </div>
        ))}
        <div style={{ marginTop:12, paddingTop:8, borderTop:'1px solid #2A262020' }}>
          <div style={{ display:'flex', justifyContent:'space-between', fontSize:13, marginBottom:4, color:'#555' }}><span>Subtotal</span><span>{money(subtotal)}</span></div>
          <div style={{ display:'flex', justifyContent:'space-between', fontSize:13, marginBottom:4, color:'#555' }}><span>Service charge (10%)</span><span>{money(service)}</span></div>
          <div style={{ display:'flex', justifyContent:'space-between', fontSize:13, marginBottom:8, color:'#555' }}><span>GST (5%)</span><span>{money(gst)}</span></div>
          <div style={{ display:'flex', justifyContent:'space-between', fontWeight:700, fontSize:20 }}><span>Total</span><span>{money(total)}</span></div>
        </div>
      </div>
      <div style={{ display:'flex', gap:10 }}>
        <button onClick={()=>setPaid(true)} style={{ flex:1, padding:14, background:C.good, color:'#fff', border:'none', borderRadius:6, fontWeight:700, fontSize:14, cursor:'pointer' }}>💵 Cash</button>
        <button onClick={()=>setPaid(true)} style={{ flex:1, padding:14, background:C.ember, color:'#fff', border:'none', borderRadius:6, fontWeight:700, fontSize:14, cursor:'pointer' }}>💳 Card</button>
        <button onClick={()=>setPaid(true)} style={{ flex:1, padding:14, background:C.well, color:'#fff', border:'none', borderRadius:6, fontWeight:700, fontSize:14, cursor:'pointer' }}>📱 QR</button>
      </div>
    </div>
  );
}

function ReportsView() {
  const r = DEMO_REPORTS;
  const maxRev = Math.max(...r.last7.map(d=>d.revenue));
  return (
    <div>
      <h2 style={{ fontFamily:"'Oswald',sans-serif", fontSize:22, textTransform:'uppercase', letterSpacing:1, marginBottom:16, color:C.cream }}>Sales reports</h2>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:10, marginBottom:16 }}>
        {[
          ['Today',money(r.todayRevenue),C.good],
          ['This week',money(r.weekRevenue),C.ember],
          ['This month',money(r.monthRevenue),C.well],
          ['Orders today',r.todayOrders,C.warn],
        ].map(([label,value,color])=>(
          <div key={label} style={card()}>
            <div style={{ color:C.muted, fontSize:11, textTransform:'uppercase', letterSpacing:0.5, marginBottom:8 }}>{label}</div>
            <div style={{ fontFamily:"'Oswald',sans-serif", fontSize:26, color }}>{value}</div>
          </div>
        ))}
      </div>

      {/* Bar chart */}
      <div style={{ ...card(), marginBottom:16 }}>
        <div style={{ fontFamily:"'Oswald',sans-serif", fontSize:14, color:C.cream, textTransform:'uppercase', letterSpacing:1, marginBottom:14 }}>Last 7 days</div>
        <div style={{ display:'flex', alignItems:'flex-end', gap:6, height:100 }}>
          {r.last7.map((d,i)=>(
            <div key={i} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:3, height:'100%', justifyContent:'flex-end' }}>
              <div style={{ width:'100%', background:i===6?C.ember:`${C.ember}55`, borderRadius:'3px 3px 0 0', height:`${Math.max(4,(d.revenue/maxRev)*100)}%` }}/>
              <div style={{ fontSize:10, color:i===6?C.ember:C.muted }}>{d.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Top items */}
      <div style={card()}>
        <div style={{ fontFamily:"'Oswald',sans-serif", fontSize:14, color:C.cream, textTransform:'uppercase', letterSpacing:1, marginBottom:14 }}>Top selling items</div>
        {r.topItems.map((item,i)=>(
          <div key={item.name} style={{ display:'flex', alignItems:'center', gap:10, padding:'8px 0', borderBottom:i<r.topItems.length-1?`1px solid ${C.border}`:'none' }}>
            <div style={{ fontFamily:"'Oswald',sans-serif", fontSize:18, color:C.ember, minWidth:24 }}>#{i+1}</div>
            <div style={{ flex:1 }}>
              <div style={{ color:C.cream, fontSize:13, fontWeight:600 }}>{item.name}</div>
              <div style={{ color:C.muted, fontSize:11 }}>{item.qty} orders</div>
            </div>
            <div style={{ color:C.good, fontSize:13, fontWeight:700 }}>{money(item.revenue)}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Main demo app ─────────────────────────────────────────
export default function DemoApp() {
  const [view, setView] = useState('floor');
  const [unlocked, setUnlocked] = useState([]);

  const tabs = [
    { key:'floor',    label:'Floor map',   Icon:MapIcon },
    { key:'order',    label:'Table order', Icon:UtensilsCrossed },
    { key:'kitchen',  label:'Kitchen',     Icon:ChefHat },
    { key:'bar',      label:'Bar',         Icon:Wine },
    { key:'checkout', label:'Checkout',    Icon:CreditCard },
    { key:'reports',  label:'Reports',     Icon:BarChart2 },
  ];

  return (
    <div style={{ minHeight:'100vh', background:C.bg, fontFamily:'Inter,sans-serif', color:C.cream, paddingBottom:80 }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Oswald:wght@600;700&family=Inter:wght@400;600;700&family=JetBrains+Mono:wght@700&display=swap');
        * { box-sizing: border-box; }
        @keyframes pulse { 0%,100%{box-shadow:0 0 0 0 rgba(199,62,62,0.4)} 50%{box-shadow:0 0 0 6px rgba(199,62,62,0)} }
      `}</style>

      {/* Demo banner */}
      <div style={{ background:`${C.ember}`, padding:'8px 20px', textAlign:'center', fontSize:13, fontWeight:700, letterSpacing:1 }}>
        🔥 TABLEFIRE POS — LIVE DEMO · All data is simulated
      </div>

      {/* Header */}
      <div style={{ background:C.panel, borderBottom:`1px solid ${C.border}`, padding:'12px 20px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <div>
          <div style={{ fontFamily:"'Oswald',sans-serif", fontSize:20, letterSpacing:2, color:C.ember, textTransform:'uppercase' }}>THAB — BHUTANESE BBQ</div>
          <div style={{ fontSize:11, color:C.muted, letterSpacing:1 }}>Staff dashboard · Demo mode</div>
        </div>
        <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
          {tabs.map(({key,label,Icon})=>(
            <button key={key} onClick={()=>setView(key)} style={{ display:'flex', alignItems:'center', gap:5, padding:'7px 12px', borderRadius:6, border:`1px solid ${view===key?C.ember:C.border}`, background:view===key?`${C.ember}22`:'transparent', color:view===key?C.ember:C.muted, fontSize:12, fontWeight:600, cursor:'pointer' }}>
              <Icon size={14}/> {label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth:1100, margin:'0 auto', padding:'24px 16px' }}>
        {view==='floor'    && <FloorView tickets={DEMO_TICKETS} onUnlock={n=>setUnlocked([...unlocked,n])}/>}
        {view==='order'    && <OrderView/>}
        {view==='kitchen'  && <KitchenView station="kitchen"/>}
        {view==='bar'      && <KitchenView station="bar"/>}
        {view==='checkout' && <CheckoutView/>}
        {view==='reports'  && <ReportsView/>}
      </div>

      {/* Mobile bottom nav */}
      <div style={{ position:'fixed', bottom:0, left:0, right:0, background:C.panel, borderTop:`1px solid ${C.border}`, display:'flex', zIndex:20 }}>
        {tabs.map(({key,label,Icon})=>(
          <button key={key} onClick={()=>setView(key)} style={{ flex:1, padding:'10px 4px 8px', background:'none', border:'none', cursor:'pointer', display:'flex', flexDirection:'column', alignItems:'center', gap:3 }}>
            <Icon size={18} color={view===key?C.ember:C.muted}/>
            <span style={{ fontSize:9, color:view===key?C.ember:C.muted, fontWeight:view===key?700:400 }}>{label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
