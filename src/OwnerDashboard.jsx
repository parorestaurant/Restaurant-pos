import React, { useState, useEffect } from 'react';

const API = import.meta.env.VITE_API_BASE || 'https://restaurant-pos-j0sb.onrender.com';
const C = { bg:'#16140F', panel:'#201D17', border:'#39332A', cream:'#F2ECDD', muted:'#9A9384', ember:'#D9622B', good:'#5C9D6E', urgent:'#C73E3E', warn:'#D9A12B' };
const inp = { width:'100%', padding:'10px 12px', borderRadius:6, border:`1px solid ${C.border}`, background:C.bg, color:C.cream, fontSize:14, fontFamily:'inherit', outline:'none', boxSizing:'border-box' };
const btn = (bg=C.ember) => ({ padding:'10px 18px', borderRadius:6, border:'none', fontWeight:700, fontSize:13, cursor:'pointer', background:bg, color:'#fff', display:'inline-flex', alignItems:'center', gap:6 });
const card = { background:C.panel, border:`1px solid ${C.border}`, borderRadius:10, padding:20, marginBottom:16 };
const lbl = { display:'block', fontSize:11, textTransform:'uppercase', letterSpacing:0.5, color:C.muted, marginBottom:6, marginTop:14 };

async function apiCall(path, token, opts={}) {
  const res = await fetch(`${API}${path}`, {
    ...opts,
    headers: { 'Content-Type':'application/json', 'x-owner-token': token||'', ...(opts.headers||{}) },
    body: opts.body ? JSON.stringify(opts.body) : undefined,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Error');
  return data;
}

function CopyBox({ value, label }) {
  const [copied, setCopied] = useState(false);
  function copy() {
    try {
      const el = document.createElement('textarea');
      el.value = value;
      el.style.cssText = 'position:fixed;top:0;left:0;opacity:0;';
      document.body.appendChild(el);
      el.focus(); el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  }
  return (
    <div>
      {label && <div style={{ fontSize:11, color:C.muted, marginBottom:4 }}>{label}</div>}
      <div style={{ display:'flex', gap:6, alignItems:'center' }}>
        <div style={{ fontFamily:'monospace', fontSize:12, color:C.good, background:C.bg, padding:'6px 10px', borderRadius:4, flex:1, wordBreak:'break-all', lineHeight:1.6 }}>{value||'—'}</div>
        <button onClick={copy} style={{ ...btn(copied?C.good:C.ember), padding:'6px 12px', fontSize:12, whiteSpace:'nowrap', flexShrink:0 }}>
          {copied ? '✓ Copied!' : '📋 Copy'}
        </button>
      </div>
    </div>
  );
}

export default function OwnerDashboard() {
  const [token, setToken] = useState(() => { try { return localStorage.getItem('tf_owner_token')||''; } catch { return ''; } });
  const [loginForm, setLoginForm] = useState({ email:'', password:'' });
  const [loginError, setLoginError] = useState('');
  const [tenants, setTenants] = useState([]);
  const [stats, setStats] = useState(null);
  const [newForm, setNewForm] = useState({ name:'', email:'', code:'', plan:'trial' });
  const [newKey, setNewKey] = useState('');
  const [flash, setFlash] = useState({ msg:'', ok:true });
  const [loading, setLoading] = useState(false);
  const [planLimits, setPlanLimits] = useState({ trial:8, starter:8, restaurant:20, enterprise:999 });
  const [planPrices, setPlanPrices] = useState({ trial:0, starter:29, restaurant:59, enterprise:99 });
  const [currency, setCurrency] = useState({ symbol:'Nu', position:'before', decimals:0 });
  const [editingLimits, setEditingLimits] = useState(false);
  const [limitsForm, setLimitsForm] = useState(null);

  function showFlash(msg, ok=true, dur=5000) { setFlash({msg,ok}); setTimeout(()=>setFlash({msg:'',ok:true}), dur); }

  async function login() {
    setLoginError('');
    if (!loginForm.email || !loginForm.password) { setLoginError('Enter email and password'); return; }
    try {
      const res = await fetch(`${API}/platform/login`, {
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ email: loginForm.email.trim(), password: loginForm.password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `Server error ${res.status}`);
      localStorage.setItem('tf_owner_token', data.token);
      setToken(data.token);
    } catch(e) {
      if (e.message.includes('fetch')) setLoginError('Cannot reach server — check your internet connection');
      else setLoginError(e.message);
    }
  }

  function logout() { localStorage.removeItem('tf_owner_token'); setToken(''); }

  async function loadTenants() {
    try { const t = await apiCall('/platform/tenants', token); setTenants(t); } catch(e) { showFlash('Could not load restaurants: '+e.message, false); }
  }
  async function loadStats() {
    try { const s = await apiCall('/platform/stats', token); setStats(s); } catch {}
  }
  async function loadPlanLimits() {
    try {
      const pl = await apiCall('/platform/plan-limits', token);
      if (pl.limits) { setPlanLimits(pl.limits); setPlanPrices(pl.prices||{}); setCurrency(pl.currency||{symbol:'Nu',position:'before',decimals:0}); }
      else setPlanLimits(pl);
    } catch {}
  }
  async function loadAll() { loadTenants(); loadStats(); loadPlanLimits(); }

  useEffect(() => { if (token) loadAll(); }, [token]);

  async function savePlanLimits() {
    try {
      const body = {
        limits: limitsForm.limits,
        prices: limitsForm.prices,
        currency: limitsForm.currency,
      };
      const updated = await apiCall('/platform/plan-limits', token, { method:'POST', body });
      // Update states directly from what we sent (don't rely on response structure)
      setPlanLimits(limitsForm.limits);
      setPlanPrices(limitsForm.prices);
      setCurrency(limitsForm.currency);
      setEditingLimits(false);
      setLimitsForm(null);
      showFlash('Settings saved ✓');
    } catch(e) { showFlash('Save failed: ' + e.message, false); }
  }

  async function addTenant() {
    if (!newForm.name || !newForm.email || !newForm.code) { showFlash('Name, email and code are required', false); return; }
    setLoading(true);
    try {
      const data = await apiCall('/platform/tenants', token, { method:'POST', body: { ...newForm, code: newForm.code.toUpperCase() } });
      setNewKey(data.licenseKey);
      setNewForm({ name:'', email:'', code:'', plan:'trial' });
      loadAll();
    } catch(e) { showFlash(e.message, false); }
    setLoading(false);
  }

  async function extend(id) {
    try { await apiCall(`/platform/tenants/${id}`, token, { method:'PATCH', body:{ expiresAt: new Date(Date.now()+30*86400000).toISOString(), active:true } }); loadAll(); showFlash('+30 days ✓'); }
    catch(e) { showFlash(e.message, false); }
  }
  async function toggleActive(id, active) {
    try { await apiCall(`/platform/tenants/${id}`, token, { method:'PATCH', body:{ active } }); loadAll(); showFlash(active?'Enabled ✓':'Disabled ✓'); }
    catch(e) { showFlash(e.message, false); }
  }
  async function resetDevice(id) {
    try { await apiCall(`/platform/tenants/${id}/reset-device`, token, { method:'POST' }); loadAll(); showFlash('Device reset ✓'); }
    catch(e) { showFlash(e.message, false); }
  }
  async function deleteTenant(id, name) {
    try { await apiCall(`/platform/tenants/${id}`, token, { method:'DELETE' }); loadAll(); showFlash('Deleted'); }
    catch(e) { showFlash(e.message, false); }
  }
  async function newLicenseKey(id) {
    try {
      const data = await apiCall(`/platform/tenants/${id}/new-key`, token, { method:'POST' });
      setNewKey(data.licenseKey);
      loadAll();
    } catch(e) { showFlash(e.message, false); }
  }

  if (!token) return (
    <div style={{ minHeight:'100vh', background:C.bg, display:'flex', alignItems:'center', justifyContent:'center', padding:24, fontFamily:'Inter,sans-serif' }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Oswald:wght@600;700&family=Inter:wght@400;600;700&display=swap')`}</style>
      <div style={{ width:'100%', maxWidth:360 }}>
        <div style={{ textAlign:'center', marginBottom:32 }}>
          <div style={{ fontFamily:"'Oswald',sans-serif", fontSize:28, letterSpacing:2, color:C.ember, textTransform:'uppercase' }}>🔥 TableFire</div>
          <div style={{ color:C.muted, fontSize:13, marginTop:6 }}>Owner Dashboard</div>
        </div>
        <label style={lbl}>Email</label>
        <input value={loginForm.email} onChange={e=>setLoginForm({...loginForm,email:e.target.value})} type="email" placeholder="your@email.com" style={{...inp,marginBottom:12}}/>
        <label style={lbl}>Password</label>
        <input value={loginForm.password} onChange={e=>setLoginForm({...loginForm,password:e.target.value})} type="password" placeholder="••••••••" style={inp} onKeyDown={e=>e.key==='Enter'&&login()}/>
        {loginError && <div style={{ color:C.urgent, fontSize:13, marginTop:10, padding:'8px 12px', background:`${C.urgent}15`, borderRadius:6 }}>{loginError}</div>}
        <button onClick={login} style={{...btn(), width:'100%', justifyContent:'center', marginTop:20, padding:14, fontSize:15}}>Sign in →</button>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight:'100vh', background:C.bg, fontFamily:'Inter,sans-serif', color:C.cream }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Oswald:wght@600;700&family=Inter:wght@400;600;700&family=JetBrains+Mono:wght@700&display=swap'); *{box-sizing:border-box}`}</style>
      <div style={{ background:C.panel, borderBottom:`1px solid ${C.border}`, padding:'14px 24px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <div style={{ fontFamily:"'Oswald',sans-serif", fontSize:22, letterSpacing:2, color:C.ember, textTransform:'uppercase' }}>🔥 TableFire — Owner Dashboard</div>
        <div style={{ display:'flex', gap:10, alignItems:'center' }}>
          <button onClick={loadAll} style={{ background:'none', border:`1px solid ${C.border}`, color:C.muted, borderRadius:6, padding:'6px 12px', cursor:'pointer', fontSize:12 }}>↻ Refresh</button>
          <button onClick={logout} style={{ background:'none', border:`1px solid ${C.border}`, color:C.muted, borderRadius:6, padding:'6px 14px', cursor:'pointer', fontSize:13 }}>Sign out</button>
        </div>
      </div>

      <div style={{ maxWidth:1200, margin:'0 auto', padding:'24px 20px' }}>
        {flash.msg && <div style={{ padding:'12px 16px', borderRadius:6, fontSize:13, marginBottom:16, background:flash.ok?`${C.good}22`:`${C.urgent}22`, border:`1px solid ${flash.ok?C.good:C.urgent}55`, color:flash.ok?C.good:C.urgent }}>{flash.msg}</div>}

        {/* Stats */}
        {stats && (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12, marginBottom:20 }}>
            {[['Total',stats.total,C.ember],['Active',stats.active,C.good],['Expired',stats.expired,C.urgent],['Disabled',stats.disabled,C.muted]].map(([l,n,col])=>(
              <div key={l} style={{ background:C.panel, border:`1px solid ${C.border}`, borderRadius:8, padding:16, textAlign:'center' }}>
                <div style={{ fontFamily:"'Oswald',sans-serif", fontSize:32, color:col }}>{n}</div>
                <div style={{ fontSize:11, color:C.muted, marginTop:4, textTransform:'uppercase' }}>{l}</div>
              </div>
            ))}
          </div>
        )}

        {/* Plan limits */}
        <div style={card}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
            <div style={{ fontFamily:"'Oswald',sans-serif", fontSize:18, letterSpacing:1, textTransform:'uppercase' }}>Plans, Prices & Currency</div>
            {!editingLimits
              ? <button onClick={()=>{ setLimitsForm({ limits:{...planLimits}, prices:{...planPrices}, currency:{...currency} }); setEditingLimits(true); }} style={{...btn(), padding:'8px 16px'}}>✏️ Edit</button>
              : <div style={{ display:'flex', gap:8 }}>
                  <button onClick={savePlanLimits} style={{...btn(C.good), padding:'8px 16px'}}>✓ Save</button>
                  <button onClick={()=>{ setEditingLimits(false); setLimitsForm(null); }} style={{ padding:'8px 16px', borderRadius:6, border:`1px solid ${C.border}`, background:'transparent', color:C.muted, cursor:'pointer', fontSize:13 }}>Cancel</button>
                </div>
            }
          </div>

          {/* Currency setting */}
          {editingLimits && limitsForm && (
            <div style={{ background:C.bg, borderRadius:8, padding:14, marginBottom:14, border:`1px solid ${C.border}` }}>
              <div style={{ fontSize:12, color:C.muted, marginBottom:10, textTransform:'uppercase', letterSpacing:0.5 }}>Currency</div>
              <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
                <div>
                  <div style={{ fontSize:11, color:C.muted, marginBottom:4 }}>Symbol</div>
                  <input value={limitsForm.currency.symbol} onChange={e=>setLimitsForm({...limitsForm,currency:{...limitsForm.currency,symbol:e.target.value}})} style={{...inp, width:80, padding:'6px 8px', fontSize:18, textAlign:'center'}} placeholder="Nu"/>
                </div>
                <div>
                  <div style={{ fontSize:11, color:C.muted, marginBottom:4 }}>Position</div>
                  <select value={limitsForm.currency.position} onChange={e=>setLimitsForm({...limitsForm,currency:{...limitsForm.currency,position:e.target.value}})} style={{...inp, width:120, padding:'6px 8px'}}>
                    <option value="before">Before (Nu 100)</option>
                    <option value="after">After (100 Nu)</option>
                  </select>
                </div>
                <div>
                  <div style={{ fontSize:11, color:C.muted, marginBottom:4 }}>Decimals</div>
                  <select value={limitsForm.currency.decimals} onChange={e=>setLimitsForm({...limitsForm,currency:{...limitsForm.currency,decimals:parseInt(e.target.value)}})} style={{...inp, width:100, padding:'6px 8px'}}>
                    <option value={0}>0 (100)</option>
                    <option value={2}>2 (100.00)</option>
                  </select>
                </div>
                <div style={{ display:'flex', flexWrap:'wrap', gap:6, alignItems:'flex-end', paddingBottom:2 }}>
                  {['Nu','$','₹','£','€','¥'].map(s=>(
                    <button key={s} onClick={()=>setLimitsForm({...limitsForm,currency:{...limitsForm.currency,symbol:s}})} style={{ padding:'6px 12px', borderRadius:6, border:`1px solid ${limitsForm.currency.symbol===s?C.ember:C.border}`, background:limitsForm.currency.symbol===s?`${C.ember}22`:'transparent', color:limitsForm.currency.symbol===s?C.ember:C.muted, cursor:'pointer', fontSize:14 }}>{s}</button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {!editingLimits && (
            <div style={{ fontSize:13, color:C.muted, marginBottom:14 }}>
              Currency: <span style={{ color:C.cream, fontWeight:700 }}>{currency.symbol}</span> · {currency.position === 'before' ? `${currency.symbol}100` : `100 ${currency.symbol}`}
            </div>
          )}

          {/* Plan cards */}
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(150px,1fr))', gap:10 }}>
            {[
              { key:'trial',      label:'Trial',      color:C.warn },
              { key:'starter',    label:'Starter',    color:C.muted },
              { key:'restaurant', label:'Restaurant', color:C.good },
              { key:'enterprise', label:'Enterprise', color:C.ember },
            ].map(p=>{
              const lim = editingLimits && limitsForm ? limitsForm.limits[p.key] : planLimits[p.key];
              const price = editingLimits && limitsForm ? limitsForm.prices[p.key] : planPrices[p.key];
              const sym = currency.symbol;
              return (
                <div key={p.key} style={{ background:C.bg, border:`2px solid ${p.color}33`, borderRadius:8, padding:'14px' }}>
                  <div style={{ fontFamily:"'Oswald',sans-serif", fontSize:14, color:p.color, letterSpacing:1, marginBottom:8 }}>{p.label}</div>
                  {editingLimits && limitsForm ? (
                    <>
                      <div style={{ fontSize:10, color:C.muted, marginBottom:4 }}>Max tables</div>
                      <input type="number" value={limitsForm.limits[p.key]} min={1} max={999}
                        onChange={e=>setLimitsForm({...limitsForm,limits:{...limitsForm.limits,[p.key]:Math.max(1,parseInt(e.target.value)||1)}})}
                        style={{ ...inp, padding:'6px', fontSize:20, fontFamily:"'Oswald',sans-serif", textAlign:'center', color:p.color, marginBottom:8 }}
                      />
                      <div style={{ fontSize:10, color:C.muted, marginBottom:4 }}>Price/month ({sym})</div>
                      <input type="number" value={limitsForm.prices[p.key]||0} min={0}
                        onChange={e=>setLimitsForm({...limitsForm,prices:{...limitsForm.prices,[p.key]:parseInt(e.target.value)||0}})}
                        style={{ ...inp, padding:'6px', fontSize:16, textAlign:'center', color:C.cream }}
                      />
                    </>
                  ) : (
                    <>
                      <div style={{ fontFamily:"'Oswald',sans-serif", fontSize:28, color:p.color }}>
                        {lim >= 999 ? '∞' : lim}<span style={{ fontSize:11, color:C.muted, marginLeft:4 }}>tables</span>
                      </div>
                      <div style={{ fontSize:13, color:C.muted, marginTop:6 }}>
                        {price > 0 ? (currency.position==='before'?`${sym} ${price}`:`${price} ${sym}`) + '/month' : 'Free trial'}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Add restaurant */}
        <div style={card}>
          <div style={{ fontFamily:"'Oswald',sans-serif", fontSize:18, letterSpacing:1, textTransform:'uppercase', marginBottom:16 }}>Add new restaurant</div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))', gap:12 }}>
            <div><label style={lbl}>Restaurant name *</label><input value={newForm.name} onChange={e=>setNewForm({...newForm,name:e.target.value})} placeholder="e.g. Paro Kitchen" style={inp}/></div>
            <div><label style={lbl}>Owner email *</label><input value={newForm.email} onChange={e=>setNewForm({...newForm,email:e.target.value})} type="email" placeholder="owner@restaurant.com" style={inp}/></div>
            <div><label style={lbl}>Restaurant code * (login code)</label><input value={newForm.code} onChange={e=>setNewForm({...newForm,code:e.target.value.toUpperCase().replace(/[^A-Z0-9]/g,'')})} placeholder="e.g. PARO2026" style={{...inp, fontFamily:'monospace', letterSpacing:2, fontSize:16}}/></div>
            <div><label style={lbl}>Plan</label>
              <select value={newForm.plan} onChange={e=>setNewForm({...newForm,plan:e.target.value})} style={inp}>
                <option value="trial">Trial — {planLimits.trial} tables max (30 days)</option>
                <option value="starter">Starter — {planLimits.starter} tables max ($29/mo)</option>
                <option value="restaurant">Restaurant — {planLimits.restaurant} tables max ($59/mo)</option>
                <option value="enterprise">Enterprise — {planLimits.enterprise>=999?'unlimited':planLimits.enterprise+' max'} ($99/mo)</option>
              </select>
            </div>
          </div>
          <button onClick={addTenant} disabled={loading} style={{...btn(), marginTop:16, padding:'12px 24px'}}>
            {loading ? 'Adding…' : '+ Add restaurant'}
          </button>
        </div>

        {/* License key display box — stays until dismissed */}
        {newKey && (
          <div style={{ ...card, border:`2px solid ${C.good}` }}>
            <div style={{ color:C.good, fontWeight:700, fontSize:16, marginBottom:12 }}>✓ Restaurant added! Send this license key to the owner:</div>
            <CopyBox value={newKey} label="License key — tap Copy button"/>
            <div style={{ fontSize:12, color:C.muted, marginTop:10, marginBottom:12 }}>
              They open the app → enter their email + this key → set up their devices.
              Default PIN after first login: <strong style={{ color:C.cream }}>1234</strong> (owner) / <strong style={{ color:C.cream }}>5678</strong> (staff)
            </div>
            <button onClick={()=>setNewKey('')} style={{ background:'none', border:`1px solid ${C.border}`, color:C.muted, borderRadius:4, padding:'6px 16px', fontSize:12, cursor:'pointer' }}>✕ Dismiss</button>
          </div>
        )}

        {/* Restaurants table */}
        <div style={card}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
            <div style={{ fontFamily:"'Oswald',sans-serif", fontSize:18, letterSpacing:1, textTransform:'uppercase' }}>All restaurants ({tenants.length})</div>
          </div>
          {tenants.length === 0 ? (
            <div style={{ color:C.muted, textAlign:'center', padding:32, fontSize:14 }}>
              No restaurants yet — add one above<br/>
              <button onClick={loadTenants} style={{ marginTop:12, background:'none', border:`1px solid ${C.border}`, color:C.muted, borderRadius:6, padding:'6px 14px', cursor:'pointer', fontSize:12 }}>↻ Try loading again</button>
            </div>
          ) : (
            <div style={{ overflowX:'auto' }}>
              <table style={{ width:'100%', borderCollapse:'collapse', minWidth:800 }}>
                <thead>
                  <tr>{['Restaurant','Code','License key','Plan','Status','Expires','Actions'].map(h=>(
                    <th key={h} style={{ textAlign:'left', padding:'8px 12px', borderBottom:`1px solid ${C.border}`, fontSize:11, color:C.muted, textTransform:'uppercase', letterSpacing:0.5, whiteSpace:'nowrap' }}>{h}</th>
                  ))}</tr>
                </thead>
                <tbody>
                  {tenants.map(t => {
                    const expired = new Date(t.expiresAt) < new Date();
                    const daysLeft = Math.ceil((new Date(t.expiresAt)-Date.now())/86400000);
                    const statusColor = !t.active ? C.muted : expired ? C.urgent : C.good;
                    const statusLabel = !t.active ? 'Disabled' : expired ? 'Expired' : 'Active';
                    return (
                      <tr key={t.id}>
                        <td style={{ padding:'10px 12px', borderBottom:`1px solid ${C.border}22`, fontSize:13 }}>
                          <div style={{ fontWeight:700, color:C.cream }}>{t.name}</div>
                          <div style={{ fontSize:11, color:C.muted }}>{t.email}</div>
                        </td>
                        <td style={{ padding:'10px 12px', borderBottom:`1px solid ${C.border}22` }}>
                          <span style={{ fontFamily:'monospace', fontSize:13, color:C.ember, background:`${C.ember}18`, padding:'3px 8px', borderRadius:4 }}>{t.code||'—'}</span>
                        </td>
                        <td style={{ padding:'10px 12px', borderBottom:`1px solid ${C.border}22`, minWidth:220 }}>
                          <CopyBox value={t.licenseKey||''} />
                          {t.keyUsed && <div style={{ fontSize:10, color:C.urgent, marginTop:4 }}>⚠ Already activated</div>}
                          <button onClick={()=>newLicenseKey(t.id)} style={{ background:'none', border:`1px solid ${C.warn}55`, color:C.warn, borderRadius:4, padding:'3px 10px', fontSize:11, cursor:'pointer', marginTop:6 }}>↺ New key</button>
                        </td>
                        <td style={{ padding:'10px 12px', borderBottom:`1px solid ${C.border}22` }}>
                          <span style={{ background:`${C.warn}22`, color:C.warn, padding:'2px 8px', borderRadius:8, fontSize:11, fontWeight:700, textTransform:'uppercase' }}>{t.plan}</span>
                        </td>
                        <td style={{ padding:'10px 12px', borderBottom:`1px solid ${C.border}22` }}>
                          <span style={{ background:`${statusColor}22`, color:statusColor, padding:'2px 8px', borderRadius:8, fontSize:11, fontWeight:700, textTransform:'uppercase' }}>{statusLabel}</span>
                          <div style={{ fontSize:11, color:daysLeft<7?C.urgent:C.muted, marginTop:4 }}>{new Date(t.expiresAt).toLocaleDateString()}{daysLeft>0?` (${daysLeft}d)`:''}</div>
                        </td>
                        <td style={{ padding:'10px 12px', borderBottom:`1px solid ${C.border}22` }}>
                          <div style={{ display:'flex', gap:4, flexWrap:'wrap' }}>
                            <button onClick={()=>extend(t.id)} style={{...btn(C.good), padding:'5px 10px', fontSize:11}}>+30d</button>
                            <button onClick={()=>toggleActive(t.id,!t.active)} style={{...btn(t.active?C.urgent:C.good), padding:'5px 10px', fontSize:11}}>{t.active?'Disable':'Enable'}</button>
                            <button onClick={()=>resetDevice(t.id)} style={{...btn('#555'), padding:'5px 10px', fontSize:11}}>↺ Device</button>
                            <button onClick={()=>deleteTenant(t.id,t.name)} style={{...btn(C.urgent), padding:'5px 10px', fontSize:11}}>🗑</button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
