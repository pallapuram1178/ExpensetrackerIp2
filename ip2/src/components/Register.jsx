import React, { useState } from 'react';
import Header from './Header';
// register will call backend API directly to persist to MongoDB

const Register = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return alert('Invalid email');
    if (password.length < 6) return alert('Password must be at least 6 chars');
    if (password !== confirmPassword) return alert('Passwords do not match');
    setLoading(true);
    try {
      const body = { fullName, email, password };
      const url = 'http://localhost:3001/api/auth/register';
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      const text = await res.text();
      let data = null;
      try { data = text ? JSON.parse(text) : null; } catch (e) { data = null; }
      if (!res.ok) {
        const msg = (data && (data.error || data.message)) || text || 'Registration failed';
        throw new Error(`Status ${res.status}: ${msg}`);
      }
      alert('Registered successfully. Please login.');
      window.location.href = '/login';
    } catch (err) {
      console.error(err);
      alert('Registration failed: ' + (err.message || err));
    } finally { setLoading(false); }
  };

  return (
    <div>
      <Header title="Register" />
      <div className="login-container">
        <h2>Create account</h2>
        <form onSubmit={handleSubmit}>
          <label>Full Name</label>
          <input value={fullName} onChange={e=>setFullName(e.target.value)} required />
          <label>Email</label>
          <input type="email" value={email} onChange={e=>setEmail(e.target.value)} required />
          <label>Password</label>
          <input type="password" value={password} onChange={e=>setPassword(e.target.value)} required />
          <label>Confirm Password</label>
          <input type="password" value={confirmPassword} onChange={e=>setConfirmPassword(e.target.value)} required />
          <button type="submit" disabled={loading}>{loading ? 'Creating...' : 'Register'}</button>
        </form>
      </div>
    </div>
  );
};

export default Register;
