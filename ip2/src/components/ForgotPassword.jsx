import React, { useState } from 'react';
import { forgot } from '../api/authApi';
import Header from './Header';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handle = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await forgot({ email });
      alert('If the email exists, a reset link/token was generated. Check console in dev.');
      window.location.href = '/login';
    } catch (err) {
      console.error(err);
      alert('Request failed');
    } finally { setLoading(false); }
  };

  return (
    <div>
      <Header title="Forgot Password" />
      <div className="login-container">
        <h2>Reset password</h2>
        <form onSubmit={handle}>
          <label>Email</label>
          <input type="email" value={email} onChange={e=>setEmail(e.target.value)} required />
          <button type="submit" disabled={loading}>{loading ? 'Sending...' : 'Send Reset'}</button>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;
