import React, { useState, useEffect } from 'react';
import './Reports.css';
import Header from './Header';

const Reports = () => {
  const [expenses, setExpenses] = useState([]);
  const [incomes, setIncomes] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      window.location.href = '/login';
      return;
    }

    // Fetch data from localStorage (not from API)
    const exp = JSON.parse(localStorage.getItem('expenses')) || [];
    const inc = JSON.parse(localStorage.getItem('incomes')) || [];
    setExpenses(exp);
    setIncomes(inc);
  }, []);

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  const deleteExpense = (index) => {
    const expensesData = [...expenses];
    expensesData.splice(index, 1);
    localStorage.setItem('expenses', JSON.stringify(expensesData));
    setExpenses(expensesData);
  };

  const deleteIncome = (index) => {
    const incomesData = [...incomes];
    incomesData.splice(index, 1);
    localStorage.setItem('incomes', JSON.stringify(incomesData));
    setIncomes(incomesData);
  };

  const categorySums = expenses.reduce((acc, e) => {
    acc[e.category] = (acc[e.category] || 0) + e.amount;
    return acc;
  }, {});

  const sourceSums = incomes.reduce((acc, i) => {
    acc[i.source] = (acc[i.source] || 0) + i.amount;
    return acc;
  }, {});

  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const totalIncomes = incomes.reduce((sum, i) => sum + i.amount, 0);
  const balance = totalIncomes - totalExpenses;

  return (
    <div>
      <Header title="Expense & Income Reports" />
      {/* only show delete controls when on the dashboard page */}
      {null}
      <div className="reports-container">
        <div className="report-card">
          <h3>Expenses by Category</h3>
          <table>
            <thead>
              <tr>
                <th>Category</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(categorySums).map(([cat, amt]) => (
                <tr key={cat}>
                  <td>{cat}</td>
                  <td>₹{amt.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="report-card">
          <h3>Income by Source</h3>
          <table>
            <thead>
              <tr>
                <th>Source</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(sourceSums).map(([src, amt]) => (
                <tr key={src}>
                  <td>{src}</td>
                  <td>₹{amt.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="report-card">
          <h3>Monthly Balance</h3>
          <table>
            <thead>
              <tr>
                <th>Month</th>
                <th>Balance</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Current</td>
                <td>₹{balance.toFixed(2)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Expenses and Incomes Lists with Delete */}
      <div style={{ maxWidth: '1200px', margin: '40px auto', padding: '0 20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
          {/* All Expenses */}
          <div className="panel">
            <h3 style={{ marginTop: 0, fontWeight: 300 }}>All Expenses</h3>
            {expenses.length === 0 ? (
              <p className="empty">No expenses</p>
            ) : (
              <div className="scroll-list">
                {expenses.map((exp, idx) => (
                  <div key={idx} className="list-item">
                    <div style={{ flex: 1 }}>
                      <p style={{ margin: '0 0 4px 0', fontWeight: 500 }}>₹{parseFloat(exp.amount).toFixed(2)} - {exp.category}</p>
                      <p style={{ margin: 0, fontSize: '12px', color: 'var(--muted)' }}>{exp.date}</p>
                    </div>
                    {window.location.pathname === '/dashboard' && (
                      <button className="danger-btn" onClick={() => deleteExpense(idx)}>Delete</button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* All Incomes */}
          <div className="panel">
            <h3 style={{ marginTop: 0, fontWeight: 300 }}>All Incomes</h3>
            {incomes.length === 0 ? (
              <p className="empty">No incomes</p>
            ) : (
              <div className="scroll-list">
                {incomes.map((inc, idx) => (
                  <div key={idx} className="list-item">
                    <div style={{ flex: 1 }}>
                      <p style={{ margin: '0 0 4px 0', fontWeight: 500 }}>₹{parseFloat(inc.amount).toFixed(2)} - {inc.source}</p>
                      <p style={{ margin: 0, fontSize: '12px', color: 'var(--muted)' }}>{inc.date}</p>
                    </div>
                    {window.location.pathname === '/dashboard' && (
                      <button className="danger-btn" onClick={() => deleteIncome(idx)}>Delete</button>
                    )}
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

export default Reports;