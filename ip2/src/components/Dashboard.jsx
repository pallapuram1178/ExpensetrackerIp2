import React, { useState, useEffect } from 'react';
import './Dashboard.css';
import Header from './Header';

const Dashboard = () => {
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [balance, setBalance] = useState(0);

  const [expenses, setExpenses] = useState([]);
  const [incomes, setIncomes] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      window.location.href = '/login';
      return;
    }

    // Try fetching from API (preferred). If that fails, fall back to localStorage.
    const loadFromLocal = () => {
      const expData = JSON.parse(localStorage.getItem('expenses')) || [];
      const incData = JSON.parse(localStorage.getItem('incomes')) || [];

      const totalExp = expData.reduce((sum, e) => sum + parseFloat(e.amount || 0), 0);
      const totalInc = incData.reduce((sum, i) => sum + parseFloat(i.amount || 0), 0);

      setExpenses(expData);
      setIncomes(incData);
      setTotalExpenses(totalExp);
      setTotalIncome(totalInc);
      setBalance(totalInc - totalExp);
    };

    (async () => {
      try {
        const headers = { Authorization: `Bearer ${token}` };
        const [resE, resI] = await Promise.all([
          fetch('http://localhost:3001/api/expenses', { headers }),
          fetch('http://localhost:3001/api/incomes', { headers })
        ]);

        if (!resE.ok || !resI.ok) throw new Error('API fetch failed');

        const dataE = await resE.json();
        const dataI = await resI.json();

        // persist to localStorage for offline use
        localStorage.setItem('expenses', JSON.stringify(dataE));
        localStorage.setItem('incomes', JSON.stringify(dataI));

        const totalExp = dataE.reduce((sum, e) => sum + parseFloat(e.amount || 0), 0);
        const totalInc = dataI.reduce((sum, i) => sum + parseFloat(i.amount || 0), 0);

        setExpenses(dataE);
        setIncomes(dataI);
        setTotalExpenses(totalExp);
        setTotalIncome(totalInc);
        setBalance(totalInc - totalExp);
      } catch (err) {
        console.error('API fetch failed, falling back to localStorage', err);
        loadFromLocal();
      }
    })();
  }, []);

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  const deleteExpense = async (index) => {
    const token = localStorage.getItem('token');
    const current = expenses.slice();
    const item = current[index];
    // If authenticated and item has an id, request backend delete
    if (token && item && (item._id || item.id)) {
      const id = item._id || item.id;
      try {
        const res = await fetch(`http://localhost:3001/api/expenses/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
        if (!res.ok) throw new Error('Failed to delete on server');
      } catch (err) {
        console.error('Server delete failed, will still remove locally', err);
      }
    }

    // Remove locally (state + localStorage)
    const updatedExpenses = JSON.parse(localStorage.getItem('expenses')) || expenses.slice();
    updatedExpenses.splice(index, 1);
    localStorage.setItem('expenses', JSON.stringify(updatedExpenses));
    setExpenses(updatedExpenses);

    const totalExp = updatedExpenses.reduce((sum, e) => sum + parseFloat(e.amount || 0), 0);
    setTotalExpenses(totalExp);
    setBalance(totalIncome - totalExp);
  };

  const deleteIncome = async (index) => {
    const token = localStorage.getItem('token');
    const current = incomes.slice();
    const item = current[index];
    if (token && item && (item._id || item.id)) {
      const id = item._id || item.id;
      try {
        const res = await fetch(`http://localhost:3001/api/incomes/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
        if (!res.ok) throw new Error('Failed to delete income on server');
      } catch (err) {
        console.error('Server delete failed, will still remove locally', err);
      }
    }

    const updatedIncomes = JSON.parse(localStorage.getItem('incomes')) || incomes.slice();
    updatedIncomes.splice(index, 1);
    localStorage.setItem('incomes', JSON.stringify(updatedIncomes));
    setIncomes(updatedIncomes);

    const totalInc = updatedIncomes.reduce((sum, i) => sum + parseFloat(i.amount || 0), 0);
    setTotalIncome(totalInc);
    setBalance(totalInc - totalExpenses);
  };

  const clearAllData = () => {
    localStorage.removeItem('expenses');
    localStorage.removeItem('incomes');
    setTotalIncome(0);
    setTotalExpenses(0);
    setBalance(0);
    alert('All data has been cleared.');
  };

  return (
    <div>
      {/* shared header */}
      <Header title="Welcome, User!" />
      <div className="summary">
        <div className="card">
          <h3>Total Income</h3>
          <p>₹{totalIncome.toFixed(2)}</p>
        </div>
        <div className="card">
          <h3>Total Expenses</h3>
          <p>₹{totalExpenses.toFixed(2)}</p>
        </div>
        <div className="card">
          <h3>Balance</h3>
          <p>₹{balance.toFixed(2)}</p>
        </div>
      </div>

      <div style={{ maxWidth: '1200px', margin: '40px auto', padding: '0 20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
          {/* Expenses List */}
          <div className="panel">
            <h3 style={{ marginTop: 0, fontWeight: 300 }}>Recent Expenses</h3>
            {expenses.length === 0 ? (
              <p className="empty">No expenses added yet</p>
            ) : (
              <div className="scroll-list">
                {expenses.map((exp, idx) => (
                  <div key={idx} className="list-item">
                    <div style={{ flex: 1 }}>
                      <p style={{ margin: '0 0 4px 0', fontWeight: 500 }}>₹{parseFloat(exp.amount).toFixed(2)} - {exp.category}</p>
                      <p style={{ margin: 0, fontSize: '12px', color: 'var(--muted)' }}>{exp.date} {exp.description && `(${exp.description})`}</p>
                    </div>
                    <button className="danger-btn" onClick={() => deleteExpense(idx)}>Delete</button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Incomes List */}
          <div className="panel">
            <h3 style={{ marginTop: 0, fontWeight: 300 }}>Recent Incomes</h3>
            {incomes.length === 0 ? (
              <p className="empty">No incomes added yet</p>
            ) : (
              <div className="scroll-list">
                {incomes.map((inc, idx) => (
                  <div key={idx} className="list-item">
                    <div style={{ flex: 1 }}>
                      <p style={{ margin: '0 0 4px 0', fontWeight: 500 }}>₹{parseFloat(inc.amount).toFixed(2)} - {inc.source}</p>
                      <p style={{ margin: 0, fontSize: '12px', color: 'var(--muted)' }}>{inc.date}</p>
                    </div>
                    <button className="danger-btn" onClick={() => deleteIncome(idx)}>Delete</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;