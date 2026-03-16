const base = 'http://localhost:3001/api/auth';

function readLocalUsers(){ try { return JSON.parse(localStorage.getItem('local_users')) || []; } catch(e){ return []; } }
function writeLocalUsers(u){ localStorage.setItem('local_users', JSON.stringify(u)); }

async function sha256(text){
  const enc = new TextEncoder();
  const data = enc.encode(text);
  const hash = await crypto.subtle.digest('SHA-256', data);
  const arr = Array.from(new Uint8Array(hash));
  return arr.map(b=>b.toString(16).padStart(2,'0')).join('');
}

async function post(path, body){
  try {
    const res = await fetch(`${base}${path}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    const text = await res.text();
    let json = null;
    try { json = text ? JSON.parse(text) : null; } catch(e) { json = text; }
    if (!res.ok) {
      const msg = (json && (json.error || json.message)) || text || `HTTP ${res.status}`;
      throw new Error(msg);
    }
    return json;
  } catch (err) {
    // fallback to localStorage-based auth for register/login/forgot/reset
    const p = path.toLowerCase();
    if (p === '/register') {
      // register locally: check duplicate email
      const users = readLocalUsers();
      if (users.find(u=>u.email === body.email)) throw new Error('Email already registered (local)');
      const hashed = await sha256(body.password || '');
      const id = Date.now();
      users.push({ id, fullName: body.fullName, email: body.email, passwordHash: hashed, createdAt: new Date().toISOString() });
      writeLocalUsers(users);
      return { message: 'registered (local)' };
    }

    if (p === '/login') {
      const users = readLocalUsers();
      const u = users.find(x=>x.email === body.email);
      if (!u) throw new Error('Invalid credentials (local)');
      const hashed = await sha256(body.password || '');
      if (hashed !== u.passwordHash) throw new Error('Invalid credentials (local)');
      // generate a fake token (not JWT) for local mode
      const token = 'localtoken-' + btoa(u.email + ':' + Date.now());
      return { token, email: u.email };
    }

    if (p === '/forgot') {
      const users = readLocalUsers();
      const u = users.find(x=>x.email === body.email);
      if (!u) return { message: 'If the email exists, a reset token was generated' };
      const token = Math.random().toString(36).slice(2,12);
      u.resetToken = token;
      u.resetTokenExpiry = Date.now() + 3600*1000; // 1 hour
      writeLocalUsers(users);
      console.log('Local reset token for', u.email, token);
      return { message: 'If the email exists, a reset token was generated' };
    }

    if (p === '/reset') {
      const users = readLocalUsers();
      const u = users.find(x=>x.resetToken === body.token && x.resetTokenExpiry && x.resetTokenExpiry > Date.now());
      if (!u) throw new Error('Invalid or expired token (local)');
      if (!body.newPassword || body.newPassword.length < 6) throw new Error('Password must be at least 6 chars');
      u.passwordHash = await sha256(body.newPassword);
      delete u.resetToken; delete u.resetTokenExpiry;
      writeLocalUsers(users);
      return { message: 'Password reset (local)' };
    }

    throw err;
  }
}

export function register(payload){ return post('/register', payload); }
export function login(payload){ return post('/login', payload); }
export function forgot(payload){ return post('/forgot', payload); }
export function reset(payload){ return post('/reset', payload); }
