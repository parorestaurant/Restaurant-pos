import React, { useState, useEffect } from 'react';
import { UtensilsCrossed, CalendarDays, MapPin, Plus, Minus, ShoppingCart, X, QrCode, Globe } from 'lucide-react';

const API = import.meta.env.VITE_API_BASE || 'https://restaurant-pos-j0sb.onrender.com';
const _code = new URLSearchParams(window.location.search).get('code') || '';
const _table = new URLSearchParams(window.location.search).get('table') || '';

// ── Translations ──────────────────────────────────────────
const LANG = {
  en: {
    tableAvail:'Table Availability', ourMenu:'Our Menu',
    placeOrder:'Place an Order', bookTable:'Book a Table',
    tables:'Tables', menu:'Menu', order:'Order', book:'Book',
    welcome:'Welcome! Scan, browse & order.',
    tableAt:'Table', browseBelow:'Browse menu and order below',
    callStaff:'Call Staff', payBill:'Pay Bill',
    available:'Available', occupied:'Occupied',
  },
  dz: {
    tableAvail:'ལྟེབས་ཡོད་མེད', ourMenu:'ཟས་ཐོ',
    placeOrder:'ཟས་ཤོག་བཀོད', bookTable:'ལྟེབས་བཀོད',
    tables:'ལྟེབས', menu:'ཟས་ཐོ', order:'ཤོག', book:'བཀོད',
    welcome:'བཀྲ་ཤིས་བདེ་ལེགས། སྐེན་གྱིས།',
    tableAt:'ལྟེབས', browseBelow:'ཟས་ཐོ་ལྟ་ལ་གདམ་ཁ་རྒྱབ།',
    callStaff:'ལས་བྱེད་གདོང་འབོད', payBill:'གནང་བ་ཞུ',
    available:'ཡོད', occupied:'བཀྱེད་ཡོད',
  }
};

function makeMoney(sym='Nu', pos='before', dec=0) {
  return n => {
    const amt = (Number(n)||0).toFixed(dec);
    return pos === 'before' ? `${sym} ${amt}` : `${amt} ${sym}`;
  };
}
let money = makeMoney();

const C = {
  bg:'#16140F', panel:'#201D17', border:'#39332A',
  cream:'#F2ECDD', muted:'#9A9384',
  ember:'#D9622B', good:'#5C9D6E', urgent:'#C73E3E', warn:'#D9A12B', well:'#4A90D9',
};

const btn = (bg=C.ember) => ({ width:'100%', padding:14, borderRadius:8, border:'none', background:bg, color:'#fff', fontSize:15, fontWeight:700, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:8 });

async function api(path, options={}) {
  const res = await fetch(`${API}${path}`, {
    headers:{'Content-Type':'application/json'},
    ...options,
    body: options.body ? JSON.stringify(options.body) : undefined
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}
function CIDModal({ title, onConfirm, onCancel }) {
  const [form, setForm] = useState({ name:'', cid:'', phone:'' });
  const [error, setError] = useState('');

  function submit() {
    if (!form.name.trim()) { setError('Please enter your name'); return; }
    if (!form.cid.trim()) { setError('Please enter your CID number'); return; }
    onConfirm(form);
  }

  return (
    <div style={{ position:'fixed', inset:0, background:'#000000AA', display:'flex', alignItems:'center', justifyContent:'center', padding:16, zIndex:60 }}>
      <div style={{ background:C.panel, border:`1px solid ${C.border}`, borderRadius:12, padding:24, width:'100%', maxWidth:380 }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:4 }}>
          <div style={{ fontFamily:"'Oswald',sans-serif", fontSize:18, color:C.cream, textTransform:'uppercase', letterSpacing:1 }}>{title}</div>
          <button onClick={onCancel} style={{ background:'none', border:'none', color:C.muted, cursor:'pointer' }}><X size={18}/></button>
        </div>
        <p style={{ color:C.muted, fontSize:13, marginBottom:16 }}>Please enter your details to continue.</p>

        <label style={lbl}>Full name *</label>
        <input value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder="Your name" style={inp}/>

        <label style={lbl}>CID number *</label>
        <input value={form.cid} onChange={e=>setForm({...form,cid:e.target.value})} placeholder="10-digit CID number" style={{...inp, fontFamily:'monospace', letterSpacing:2}} maxLength={11}/>

        <label style={lbl}>Phone number (optional)</label>
        <input value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})} placeholder="+975 17 123 456" type="tel" style={inp}/>

        {error && <div style={{ color:C.urgent, fontSize:13, marginTop:10 }}>{error}</div>}

        <button onClick={submit} style={{...btn(), marginTop:20}}>Confirm →</button>
      </div>
    </div>
  );
}

// Tables view
function TablesView({ onBook }) {
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    try { setTables(await api(`/customer/tables?code=${_code}`)); }
    catch {}
    setLoading(false);
  }
  useEffect(()=>{ load(); const t=setInterval(load,10000); return()=>clearInterval(t); },[]);

  if (loading) return <div style={{ color:C.muted, textAlign:'center', padding:40 }}>Loading tables…</div>;

  const available = tables.filter(t=>t.available).length;

  function tableColor(t) {
    if (t.occupied) return C.urgent;
    if (t.booked) return C.warn;
    return C.good;
  }
  function tableLabel(t) {
    if (t.occupied) return 'Occupied';
    if (t.booked) return 'Booked today';
    return 'Available';
  }

  return (
    <div>
      <div style={{ background:`${C.good}22`, border:`1px solid ${C.good}55`, borderRadius:10, padding:'14px 18px', marginBottom:16, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <span style={{ color:C.cream, fontSize:14 }}>Tables available now</span>
        <span style={{ fontFamily:"'Oswald',sans-serif", fontSize:32, color:C.good }}>{available}</span>
      </div>

      {/* Legend */}
      <div style={{ display:'flex', gap:12, marginBottom:14, flexWrap:'wrap' }}>
        {[[C.good,'Available'],[C.warn,'Booked today'],[C.urgent,'Occupied']].map(([col,lbl])=>(
          <div key={lbl} style={{ display:'flex', alignItems:'center', gap:5, fontSize:12, color:C.muted }}>
            <div style={{ width:10, height:10, borderRadius:'50%', background:col }}/>
            {lbl}
          </div>
        ))}
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(90px,1fr))', gap:10, marginBottom:20 }}>
        {tables.map(t=>(
          <div key={t.table} style={{ background:`${tableColor(t)}18`, border:`1px solid ${tableColor(t)}55`, borderRadius:10, padding:'14px 8px', textAlign:'center' }}>
            <div style={{ fontFamily:"'Oswald',sans-serif", fontSize:26, color:C.cream }}>{t.table}</div>
            <div style={{ fontSize:11, textTransform:'uppercase', color:tableColor(t), marginTop:4 }}>{tableLabel(t)}</div>
          </div>
        ))}
      </div>

      <button onClick={onBook} style={btn()}>
        <CalendarDays size={16}/> Book a table
      </button>
      <p style={{ fontSize:11, color:C.muted, marginTop:12, textAlign:'center' }}>Refreshes every 10 seconds</p>
    </div>
  );
}

// Menu view
function MenuView({ cart, onAddToCart, onRemoveFromCart }) {
  const [menu, setMenu] = useState([]);
  const [selectedCat, setSelectedCat] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(()=>{
    api(`/customer/menu?code=${_code}`).then(m=>{ setMenu(m); setLoading(false); }).catch(()=>setLoading(false));
  },[]);

  if (loading) return <div style={{ color:C.muted, textAlign:'center', padding:40 }}>Loading menu…</div>;

  const categories = [...new Set(menu.map(m=>m.category))];
  const filtered = menu.filter(m=>!selectedCat||m.category===selectedCat);
  const cartQty = id => cart.filter(c=>c.menuId===id).reduce((s,c)=>s+c.qty,0);

  return (
    <div>
      <div style={{ display:'flex', gap:8, flexWrap:'wrap', marginBottom:16 }}>
        <button onClick={()=>setSelectedCat(null)} style={{ padding:'6px 14px', borderRadius:20, fontSize:13, cursor:'pointer', border:`1px solid ${!selectedCat?C.ember:C.border}`, background:!selectedCat?`${C.ember}22`:'transparent', color:!selectedCat?C.ember:C.muted }}>All</button>
        {categories.map(cat=>(
          <button key={cat} onClick={()=>setSelectedCat(cat)} style={{ padding:'6px 14px', borderRadius:20, fontSize:13, cursor:'pointer', border:`1px solid ${selectedCat===cat?C.ember:C.border}`, background:selectedCat===cat?`${C.ember}22`:'transparent', color:selectedCat===cat?C.ember:C.muted }}>{cat}</button>
        ))}
      </div>
      {filtered.map(item=>(
        <div key={item.id} style={{ ...card, display:'flex', alignItems:'center', gap:12 }}>
          <div style={{ width:64, height:64, borderRadius:8, overflow:'hidden', flexShrink:0, background:'#2A2620', display:'flex', alignItems:'center', justifyContent:'center' }}>
            {item.image ? <img src={item.image} alt={item.name} style={{ width:'100%', height:'100%', objectFit:'cover' }}/> : <UtensilsCrossed size={20} color={C.muted}/>}
          </div>
          <div style={{ flex:1 }}>
            <div style={{ color:C.cream, fontSize:14, fontWeight:600 }}>{item.name}</div>
            <div style={{ color:C.muted, fontSize:12 }}>{item.category}</div>
            <div style={{ color:C.ember, fontSize:15, fontWeight:700, marginTop:4 }}>{money(item.price)}</div>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:8, flexShrink:0 }}>
            {cartQty(item.id)>0 && <>
              <button onClick={()=>onRemoveFromCart(item.id)} style={{ width:30,height:30,borderRadius:8,border:`1px solid ${C.border}`,background:'transparent',color:C.cream,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center' }}><Minus size={13}/></button>
              <span style={{ color:C.cream, fontSize:14, minWidth:18, textAlign:'center' }}>{cartQty(item.id)}</span>
            </>}
            <button onClick={()=>onAddToCart(item)} style={{ width:30,height:30,borderRadius:8,border:'none',background:C.ember,color:'#fff',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center' }}><Plus size={13}/></button>
          </div>
        </div>
      ))}
    </div>
  );
}

// Order view
function OrderView({ cart, onClearCart, onRemoveItem }) {
  const [tableNum, setTableNum] = useState(_table || '');
  const [showCID, setShowCID] = useState(false);
  const [placing, setPlacing] = useState(false);
  const [success, setSuccess] = useState(null); // { tickets, bill }
  const [bankQR, setBankQR] = useState('');
  const [flash, setFlash] = useState('');

  const STATUS_LABEL = { new:'Received 📋', preparing:'Preparing 👨‍🍳', ready:'Ready ✅', served:'Served ✅' };
  const STATUS_COLOR = { new:C.muted, preparing:C.ember, ready:C.warn, served:C.good };

  useEffect(()=>{
    fetch(`${API}/state/${encodeURIComponent(_code?`${_code}:config`:'config')}`).then(r=>r.json()).then(d=>{ if(d.value?.bankQR) setBankQR(d.value.bankQR); }).catch(()=>{});
  },[]);

  async function placeOrder(cidDetails) {
    setPlacing(true); setShowCID(false);
    try {
      const items = cart.map(c=>({ menuId:c.menuId, qty:c.qty, notes:'' }));
      const result = await api('/customer/orders', { method:'POST', body:{ table:parseInt(tableNum), items, code:_code, customerName:cidDetails.name, customerCID:cidDetails.cid, customerPhone:cidDetails.phone }});
      setSuccess(result);
      onClearCart();
    } catch(e) { setFlash(e.message); }
    setPlacing(false);
  }

  const subtotal = success?.bill?.lines?.reduce((s,l)=>s+l.price*l.qty,0) || 0;

  return (
    <div>
      {flash && <div style={{ background:`${C.urgent}22`, border:`1px solid ${C.urgent}55`, borderRadius:8, padding:'10px 14px', fontSize:13, color:C.urgent, marginBottom:16 }}>{flash}</div>}

      {showCID && <CIDModal title="Place order" onConfirm={placeOrder} onCancel={()=>setShowCID(false)}/>}

      <label style={lbl}>Your table number</label>
      <input value={tableNum} onChange={e=>setTableNum(e.target.value.replace(/\D/g,''))} placeholder="e.g. 3" type="number" style={{...inp, marginBottom:16}}/>

      {cart.length===0 ? (
        <div style={{ ...card, textAlign:'center', color:C.muted, fontSize:14, padding:32 }}>
          <ShoppingCart size={32} color={C.muted} style={{ margin:'0 auto 12px', display:'block' }}/>
          Cart is empty — go to Menu to add items.
        </div>
      ) : (
        <>
          {cart.map((c,i)=>(
            <div key={i} style={{ ...card, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <div><div style={{ color:C.cream, fontSize:14 }}><span style={{ fontWeight:700 }}>{c.qty}×</span> {c.name}</div></div>
              <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                <span style={{ color:C.ember, fontSize:14, fontWeight:700 }}>{money(c.price*c.qty)}</span>
                <button onClick={()=>onRemoveItem(i)} style={{ background:'none', border:`1px solid ${C.border}`, color:C.muted, borderRadius:6, width:26, height:26, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}><X size={12}/></button>
              </div>
            </div>
          ))}
          <div style={{ display:'flex', justifyContent:'space-between', padding:'8px 4px', marginBottom:16 }}>
            <span style={{ color:C.muted }}>Total</span>
            <span style={{ color:C.cream, fontWeight:700, fontSize:18 }}>{money(cart.reduce((s,c)=>s+c.price*c.qty,0))}</span>
          </div>
          <button onClick={()=>{ if(!tableNum){setFlash('Please enter your table number');return;} setFlash(''); setShowCID(true); }} disabled={placing} style={btn(tableNum?C.ember:'#555')}>
            {placing?'Placing order…':`Place order · ${money(cart.reduce((s,c)=>s+c.price*c.qty,0))}`}
          </button>
        </>
      )}

      {success && (
        <div style={{ marginTop:24 }}>
          {success.tickets?.length>0 && <>
            <div style={{ fontSize:12, color:C.muted, textTransform:'uppercase', letterSpacing:1, marginBottom:12 }}>Order status</div>
            {success.tickets.map(t=>(
              <div key={t.id} style={card}>
                <div style={{ color:C.cream, fontSize:13, marginBottom:8 }}>{t.items.map(i=>`${i.qty}× ${i.name}`).join(', ')}</div>
                <div style={{ display:'inline-block', padding:'4px 12px', borderRadius:10, background:`${STATUS_COLOR[t.status]||C.muted}22`, color:STATUS_COLOR[t.status]||C.muted, fontSize:12, fontWeight:600 }}>{STATUS_LABEL[t.status]||t.status}</div>
              </div>
            ))}
          </>}

          {success.bill && (
            <div style={{ ...card, background:'#F2ECDD', color:C.ink, marginTop:8 }}>
              <div style={{ fontFamily:"'Oswald',sans-serif", fontSize:18, marginBottom:12 }}>Your Bill — Table {tableNum}</div>
              {success.bill.lines?.map((l,i)=>(
                <div key={i} style={{ display:'flex', justifyContent:'space-between', fontSize:14, padding:'3px 0', borderBottom:`1px solid ${C.ink}12` }}>
                  <span><span style={{ fontWeight:700 }}>{l.qty}×</span> {l.name}</span>
                  <span style={{ fontFamily:'monospace' }}>{money(l.price*l.qty)}</span>
                </div>
              ))}
              <div style={{ display:'flex', justifyContent:'space-between', fontWeight:700, fontSize:17, marginTop:10, paddingTop:8, borderTop:`2px solid ${C.ink}20` }}>
                <span>Total</span><span>{money(subtotal)}</span>
              </div>
              {bankQR && (
                <div style={{ marginTop:16, textAlign:'center' }}>
                  <div style={{ fontSize:13, color:C.ink, opacity:0.7, marginBottom:10 }}>📱 Scan to pay · {money(subtotal)}</div>
                  <img src={bankQR} alt="Pay by QR" style={{ width:160, height:160, objectFit:'contain', background:'#fff', padding:8, borderRadius:8, margin:'0 auto', display:'block' }}/>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Booking view
function BookingView() {
  const [showCID, setShowCID] = useState(false);
  const [tables, setTables] = useState([]);
  const [form, setForm] = useState({ date:'', time:'12:00', partySize:2, notes:'', table:'' });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [flash, setFlash] = useState('');
  const today = new Date().toISOString().slice(0,10);

  useEffect(()=>{
    api(`/customer/tables?code=${_code}`).then(t=>setTables(t.filter(t=>t.available))).catch(()=>{});
  },[]);

  async function book(cidDetails) {
    setLoading(true); setShowCID(false);
    try {
      await api('/customer/book', { method:'POST', body:{ ...form, table: form.table ? parseInt(form.table) : null, code:_code, customerName:cidDetails.name, customerCID:cidDetails.cid, customerPhone:cidDetails.phone }});
      setSuccess(true);
    } catch(e) { setFlash(e.message); }
    setLoading(false);
  }

  if (success) return (
    <div style={{ textAlign:'center', padding:40 }}>
      <div style={{ fontSize:48, marginBottom:12 }}>✅</div>
      <div style={{ fontFamily:"'Oswald',sans-serif", fontSize:22, color:C.good, marginBottom:8 }}>Booking confirmed!</div>
      <div style={{ color:C.muted, fontSize:14, marginBottom:24 }}>{form.date} at {form.time} · {form.partySize} people</div>
      <button onClick={()=>{setSuccess(false);setForm({date:'',time:'12:00',partySize:2,notes:''}); }} style={btn()}>Book another table</button>
    </div>
  );

  return (
    <div>
      {showCID && <CIDModal title="Book a table" onConfirm={book} onCancel={()=>setShowCID(false)}/>}
      {flash && <div style={{ color:C.urgent, fontSize:13, marginBottom:14 }}>{flash}</div>}

      <label style={lbl}>Preferred table (optional)</label>
      <select value={form.table} onChange={e=>setForm({...form,table:e.target.value})} style={inp}>
        <option value="">Any available table</option>
        {tables.map(t=><option key={t.table} value={t.table}>Table {t.table}</option>)}
      </select>

      <label style={lbl}>Date</label>
      <input type="date" min={today} value={form.date} onChange={e=>setForm({...form,date:e.target.value})} style={inp}/>

      <label style={lbl}>Time</label>
      <select value={form.time} onChange={e=>setForm({...form,time:e.target.value})} style={inp}>
        {['11:00','11:30','12:00','12:30','13:00','13:30','14:00','18:00','18:30','19:00','19:30','20:00','20:30','21:00'].map(t=><option key={t} value={t}>{t}</option>)}
      </select>

      <label style={lbl}>Party size</label>
      <div style={{ display:'flex', alignItems:'center', gap:14, marginTop:4, marginBottom:14 }}>
        <button onClick={()=>setForm({...form,partySize:Math.max(1,form.partySize-1)})} style={{ width:36,height:36,borderRadius:8,border:`1px solid ${C.border}`,background:'transparent',color:C.cream,cursor:'pointer',fontSize:20 }}>−</button>
        <span style={{ fontSize:22, color:C.cream, minWidth:32, textAlign:'center' }}>{form.partySize}</span>
        <button onClick={()=>setForm({...form,partySize:Math.min(20,form.partySize+1)})} style={{ width:36,height:36,borderRadius:8,border:'none',background:C.ember,color:'#fff',cursor:'pointer',fontSize:20 }}>+</button>
      </div>

      <label style={lbl}>Special requests (optional)</label>
      <input value={form.notes} onChange={e=>setForm({...form,notes:e.target.value})} placeholder="Birthday, allergies, etc." style={inp}/>

      <button onClick={()=>{ if(!form.date){setFlash('Please pick a date');return;} setFlash(''); setShowCID(true); }} disabled={loading} style={{...btn(), marginTop:20}}>
        {loading?'Booking…':'Confirm booking →'}
      </button>
    </div>
  );
}

// Main customer app


export default function CustomerApp() {
  const [view, setView] = useState(_table ? 'menu' : 'tables');
  const [cart, setCart] = useState([]);
  const [restaurantName, setRestaurantName] = useState('THAB - BHUTANESE BBQ');
  const [lang, setLang] = useState('en');
  const t = LANG[lang];

  useEffect(()=>{
    // Load saved language preference
    try { const l = localStorage.getItem('tf_lang'); if(l) setLang(l); } catch{}
    const key = _code?`${_code}:config`:'config';
    fetch(`${API}/state/${encodeURIComponent(key)}`).then(r=>r.json()).then(d=>{
      if(d.value?.restaurantName) setRestaurantName(d.value.restaurantName);
      if(d.value?.currencySymbol) money = makeMoney(d.value.currencySymbol, d.value.currencyPosition||'before', d.value.currencyDecimals||0);
    }).catch(()=>{});
  },[]);

  function setLanguage(l) {
    setLang(l);
    try { localStorage.setItem('tf_lang', l); } catch{}
  }

  function addToCart(item) {
    setCart(prev => {
      const ex = prev.find(c=>c.menuId===item.id);
      if (ex) return prev.map(c=>c.menuId===item.id?{...c,qty:c.qty+1}:c);
      return [...prev, { menuId:item.id, name:item.name, price:item.price, qty:1, station:item.station }];
    });
  }
  function removeFromCart(menuId) {
    setCart(prev => prev.map(c=>c.menuId===menuId?{...c,qty:c.qty-1}:c).filter(c=>c.qty>0));
  }
  function removeItem(index) { setCart(prev=>prev.filter((_,i)=>i!==index)); }

  const cartCount = cart.reduce((s,c)=>s+c.qty,0);

  const tabs = [
    { key:'tables', label:t.tables,  Icon:MapPin },
    { key:'menu',   label:t.menu,    Icon:UtensilsCrossed },
    { key:'order',  label:t.order,   Icon:ShoppingCart },
    { key:'book',   label:t.book,    Icon:CalendarDays },
  ];

  const viewTitle = {
    tables:t.tableAvail, menu:t.ourMenu,
    order:t.placeOrder, book:t.bookTable
  }[view];

  return (
    <div style={{ minHeight:'100vh', background:C.bg, fontFamily:'Inter,sans-serif', color:C.cream }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Oswald:wght@600;700&family=Inter:wght@400;600;700&display=swap');
        input,select{outline:none}
        input[type=date],input[type=number]{color-scheme:dark}
        *{box-sizing:border-box}
        @media(max-width:400px){
          .menu-grid { grid-template-columns: 1fr !important; }
          .item-card { padding: 10px !important; }
        }
      `}</style>

      {/* Header — compact for phones */}
      <div style={{ background:C.panel, borderBottom:`1px solid ${C.border}`,
        padding:'10px 14px', position:'sticky', top:0, zIndex:10 }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <div>
            <div style={{ fontFamily:"'Oswald',sans-serif", fontSize:16,
              letterSpacing:2, color:C.ember, textTransform:'uppercase' }}>
              🔥 {restaurantName}
            </div>
            {_table ? (
              <div style={{ fontSize:11, color:C.good, letterSpacing:1, marginTop:1 }}>
                📍 {t.tableAt} {_table} · {t.browseBelow}
              </div>
            ) : (
              <div style={{ fontSize:11, color:C.muted, letterSpacing:1 }}>{t.welcome}</div>
            )}
          </div>
          {/* Language toggle */}
          <div style={{ display:'flex', gap:4 }}>
            <button onClick={()=>setLanguage('en')} style={{
              padding:'4px 8px', borderRadius:6, fontSize:11, fontWeight:700,
              background: lang==='en' ? C.ember : 'transparent',
              border:`1px solid ${lang==='en' ? C.ember : C.border}`,
              color: lang==='en' ? '#fff' : C.muted,
              cursor:'pointer', fontFamily:'inherit'
            }}>EN</button>
            <button onClick={()=>setLanguage('dz')} style={{
              padding:'4px 8px', borderRadius:6, fontSize:11, fontWeight:700,
              background: lang==='dz' ? C.ember : 'transparent',
              border:`1px solid ${lang==='dz' ? C.ember : C.border}`,
              color: lang==='dz' ? '#fff' : C.muted,
              cursor:'pointer', fontFamily:'inherit'
            }}>དཀར་</button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth:480, margin:'0 auto', padding:'16px 12px', paddingBottom:80 }}>
        <div style={{ fontFamily:"'Oswald',sans-serif", fontSize:18,
          textTransform:'uppercase', letterSpacing:1, marginBottom:14, color:C.cream }}>
          {viewTitle}
        </div>
        {view==='tables' && <TablesView onBook={()=>setView('book')}/>}
        {view==='menu'   && <MenuView cart={cart} onAddToCart={addToCart} onRemoveFromCart={removeFromCart}/>}
        {view==='order'  && <OrderView cart={cart} onClearCart={()=>setCart([])} onRemoveItem={removeItem}/>}
        {view==='book'   && <BookingView/>}
      </div>

      {/* Bottom nav — big touch targets for phones */}
      <div style={{ position:'fixed', bottom:0, left:0, right:0,
        background:C.panel, borderTop:`1px solid ${C.border}`, display:'flex', zIndex:20 }}>
        {tabs.map(({key,label,Icon})=>(
          <button key={key} onClick={()=>setView(key)} style={{
            flex:1, padding:'10px 4px 10px', background:'none', border:'none',
            cursor:'pointer', display:'flex', flexDirection:'column',
            alignItems:'center', gap:3, position:'relative',
            borderTop: view===key ? `2px solid ${C.ember}` : '2px solid transparent',
            minHeight:56
          }}>
            <div style={{ position:'relative' }}>
              <Icon size={22} color={view===key?C.ember:C.muted}/>
              {key==='order'&&cartCount>0&&(
                <span style={{ position:'absolute', top:-6, right:-8,
                  background:C.urgent, color:'#fff', borderRadius:8,
                  minWidth:16, height:16, fontSize:10, fontWeight:700,
                  display:'flex', alignItems:'center', justifyContent:'center', padding:'0 3px'
                }}>{cartCount}</span>
              )}
            </div>
            <span style={{ fontSize:10, color:view===key?C.ember:C.muted,
              fontWeight:view===key?700:400, lineHeight:1 }}>{label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
