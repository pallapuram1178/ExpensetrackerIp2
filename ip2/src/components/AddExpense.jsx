import React, { useState, useEffect } from 'react';
import './AddExpense.css';
import Header from './Header';

const AddExpense = () => {
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Food');
  const [date, setDate] = useState('');
  const [description, setDescription] = useState('');

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    const expense = { amount: parseFloat(amount), category, date, description };
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const res = await fetch('http://localhost:3001/api/expenses', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify(expense)
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
        let expenses = JSON.parse(localStorage.getItem('expenses')) || [];
        expenses.push(expense);
        localStorage.setItem('expenses', JSON.stringify(expenses));
        window.location.href = '/dashboard';
      }
    } else {
      let expenses = JSON.parse(localStorage.getItem('expenses')) || [];
      expenses.push(expense);
      localStorage.setItem('expenses', JSON.stringify(expenses));
      window.location.href = '/dashboard';
    }
  };

  return (
    <div>
      <Header title="Add Expense" />
      <div className="form-container">
        <form onSubmit={handleSubmit}>
          <label>Amount:</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
          />

          <label>Category:</label>
          <select value={category} onChange={(e) => setCategory(e.target.value)}>
            <option>Food</option>
            <option>Transport</option>
            <option>Utilities</option>
            <option>Entertainment</option>
          </select>

          <label>Date:</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />

          <label>Description:</label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <button type="submit">Add Expense</button>
        </form>
      </div>
    </div>
  );
};

export default AddExpense;