import React, { useEffect } from 'react';
import './Header.css';

const Header = ({ title }) => {
  useEffect(() => {
    try {
      // force dark theme for the app (restore original behaviour)
      document.documentElement.removeAttribute('data-theme');
      localStorage.setItem('theme', 'dark');
    } catch (e) {
      // ignore
    }
  }, []);

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };
  const isAuth = !!localStorage.getItem('token');
  const path = typeof window !== 'undefined' ? window.location.pathname : '/';
  const publicPaths = ['/', '/login', '/register', '/forgot', '/reset'];
  const showNav = isAuth && !publicPaths.includes(path);

  return (
    <>
      <header className="site-header">
        <h1>{title || 'Expense Tracker'}</h1>
      </header>
      {showNav && (
        <nav className="site-nav">
          <a href="/dashboard">Dashboard</a>
          <a href="/add-expense">Add Expense</a>
          <a href="/add-income">Add Income</a>
          <a href="/reports">Reports</a>
          <a href="/budget">Budget</a>
          <a href="#" onClick={logout} className="logout-link">Logout</a>
        </nav>
      )}
    </>
  );
};

export default Header;
