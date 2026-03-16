import React, { useState } from 'react';
import { reset } from '../api/authApi';
import Header from './Header';

function getQueryParam(name) {
  const params = new URLSearchParams(window.location.search);
  return params.get(name);
}

const ResetPassword = () => {
  const token = getQueryParam('token') || '';
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handle = async (e) => {
    e.preventDefault();
    if (newPassword.length < 6) return alert('Password must be at least 6 chars');
    setLoading(true);
    try {
      await reset({ token, newPassword });
      alert('Password reset. Please login.');
      window.location.href = '/login';
    } catch (err) {
      console.error(err);
      alert('Reset failed');
    } finally { setLoading(false); }
  };

  return (
    <div>
      <Header title="Reset Password" />
      <div className="login-container">
        <h2>Enter new password</h2>
        <form onSubmit={handle}>
          <label>New Password</label>
          <input type="password" value={newPassword} onChange={e=>setNewPassword(e.target.value)} required />
          <button type="submit" disabled={loading}>{loading ? 'Saving...' : 'Save Password'}</button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
