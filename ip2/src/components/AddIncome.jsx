import React, { useState, useEffect } from 'react';
import './AddIncome.css';
import Header from './Header';

const AddIncome = () => {
  const [amount, setAmount] = useState('');
  const [source, setSource] = useState('');
  const [date, setDate] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      window.location.href = '/login';
    }
  }, []);

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const income = { amount: parseFloat(amount), source, date };
    const token = localStorage.getItem('token');
    if (token) {
      (async () => {
        try {
          const res = await fetch('http://localhost:3001/api/incomes', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify(income)
          });
          const text = await res.text();
          let data = null;
          try { data = text ? JSON.parse(text) : null; } catch (e) { data = null; }
          if (!res.ok) {
            const msg = (data && (data.error || data.message)) || text || `Status ${res.status}`;
            throw new Error(msg);
          }
          // success
          window.location.href = '/dashboard';
        } catch (err) {
          console.error('Backend save failed, falling back to localStorage', err);
          let incomes = JSON.parse(localStorage.getItem('incomes')) || [];
          incomes.push(income);
          localStorage.setItem('incomes', JSON.stringify(incomes));
          window.location.href = '/dashboard';
        }
      })();
    } else {
      let incomes = JSON.parse(localStorage.getItem('incomes')) || [];
      incomes.push(income);
      localStorage.setItem('incomes', JSON.stringify(incomes));
      window.location.href = '/dashboard';
    }
  };

  return (
    <div>
      <Header title="Add Income" />
      <div className="form-container">
        <form onSubmit={handleSubmit}>
          <label>Amount:</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
          />

          <label>Source:</label>
          <input
            type="text"
            value={source}
            onChange={(e) => setSource(e.target.value)}
            required
          />

          <label>Date:</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />

          <button type="submit">Add Income</button>
        </form>
      </div>
    </div>
  );
};

export default AddIncome;