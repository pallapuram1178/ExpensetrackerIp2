import React, { useState } from 'react';
import './Login.css';
import Header from './Header';
import { login } from '../api/authApi';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await login({ email, password });
      // res expected { token, user: { id, email } }
      if (res && res.token) {
        localStorage.setItem('token', res.token);
        const user = res.user || res;
        // prefer id, fallback to email
        const userId = user.id != null ? user.id : user.email;
        localStorage.setItem('user', JSON.stringify({ id: userId, email: user.email }));
        window.location.href = '/dashboard';
      } else {
        alert('Login failed');
      }
    } catch (err) {
      console.error(err);
      alert(err.message || 'Invalid credentials');
    } finally { setLoading(false); }
  };

  return (
    <div>
      <Header />
      <div className="login-container">
        <h2>Login</h2>
        <form onSubmit={handleSubmit}>
          <label>Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <label>Password:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button type="submit" disabled={loading}>{loading ? 'Signing in...' : 'Login'}</button>
        </form>
        <p style={{ textAlign: 'center', marginTop: '12px' }}>
          <a href="/forgot">Forgot password?</a> | <a href="/register">Register</a>
        </p>
      </div>
    </div>
  );
};

export default Login;