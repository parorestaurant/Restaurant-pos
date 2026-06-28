import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import KoreanRestaurantPOS from './App.jsx';

const API = import.meta.env.VITE_API_BASE || 'https://restaurant-pos-j0sb.onrender.com';
const C = { bg:'#16140F', panel:'#201D17', border:'#39332A', cream:'#F2ECDD', muted:'#9A9384', ember:'#D9622B', urgent:'#C73E3E', good:'#5C9D6E' };
const inp = { width:'100%', padding:'14px', borderRadius:8, border:`1px solid ${C.border}`, background:C.panel, color:C.cream, fontSize:15, fontFamily:'inherit', outline:'none', boxSizing:'border-box', marginBottom:14 };

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

class ErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { crashed: false }; }
  static getDerivedStateFromError() { return { crashed: true }; }
  render() {
    if (this.state.crashed) return (
      <div style={{ minHeight:'100vh', background:C.bg, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:16, padding:24, fontFamily:'Inter,sans-serif' }}>
        <div style={{ fontSize:14, color:'#9A9384', textAlign:'center' }}>Something went wrong.</div>
        <button onClick={()=>window.location.reload()} style={{ padding:'12px 28px', background:'#D9622B', color:'#fff', border:'none', borderRadius:6, fontSize:15, fontWeight:700, cursor:'pointer' }}>Reload app</button>
      </div>
    );
    return this.props.children;
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <ErrorBoundary><Root/></ErrorBoundary>
);
