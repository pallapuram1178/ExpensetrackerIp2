import React, { useEffect, useState } from 'react';
import './BudgetPlanning.css';
import { fetchBudgets, saveBudget, deleteBudget } from '../api/budgetApi';
import Header from './Header';

const BudgetPlanning = ({ embedded = false }) => {
  const [budgets, setBudgets] = useState([]);
  const [month, setMonth] = useState(new Date().toISOString().slice(0,7)); // YYYY-MM
  const [userId, setUserId] = useState(() => {
    const raw = localStorage.getItem('user');
    try {
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      // prefer numeric id, otherwise use email as identifier for local mode
      if (parsed.id != null) return parsed.id;
      return parsed.email || null;
    } catch(e){ return null }
  });

  const [form, setForm] = useState({ category: '', amount: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => { load(); }, [month, userId]);

  async function load() {
    if (!userId) return;
    setLoading(true);
    try {
      const data = await fetchBudgets(userId, month);
      setBudgets(data);
    } catch (err) {
      console.error('fetchBudgets failed, falling back to local:', err);
      // fallback: read local budgets directly so page still shows data
      try {
        const raw = localStorage.getItem('budgets');
        const all = raw ? JSON.parse(raw) : [];
        const filtered = all.filter(b => String(b.userId) === String(userId) && b.month === month).map(b => ({
          id: b.id,
          category: b.category,
          month: b.month,
          amount: b.amount,
          spent: (function(){
            try {
              const expenses = JSON.parse(localStorage.getItem('expenses')) || [];
              return expenses.filter(e => e.category === b.category && (e.date||'').slice(0,7) === month)
                .reduce((s,x)=>s + (parseFloat(x.amount)||0), 0);
            } catch(e){ return 0; }
          })()
        }));
        setBudgets(filtered);
      } catch (e) {
        console.error('local fallback failed', e);
      }
    } finally { setLoading(false); }
  }

  async function handleSave(e) {
    e.preventDefault();
    if (!form.category || form.amount === '') return alert('Enter category and amount');
    const payload = { userId, category: form.category, month, amount: parseFloat(form.amount) };
    try {
      await saveBudget(payload);
      setForm({ category: '', amount: '' });
      load();
    } catch (err) { console.error(err); alert('Save failed'); }
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this budget?')) return;
    try {
      await deleteBudget(userId, id);
      load();
    } catch (err) { console.error(err); alert('Delete failed'); }
  }

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  return (
    <div className={embedded ? 'budget-embedded' : ''}>
      {!embedded && <Header title="Budget Planning" />}

      <div style={{ maxWidth: '1100px', margin: '32px auto', padding: '0 16px' }}>
        <div className="budget-header" style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:18}}>
          <h2 style={{margin:0,fontWeight:600}}>Budget Planning</h2>
          <div className="month-picker" style={{display:'flex',flexDirection:'column',fontSize:12,color:'#666'}}>
            <label style={{fontSize:12,color:'#666'}}>Month</label>
            <input type="month" value={month} onChange={e => setMonth(e.target.value)} />
          </div>
        </div>

        <section className="budget-form">
          <form onSubmit={handleSave} style={{display:'flex',flexDirection:'column',gap:12,alignItems:'stretch',marginBottom:20}}>
            <div style={{display:'flex',gap:10,flexWrap:'wrap'}}>
              <input placeholder="Category" value={form.category} onChange={e => setForm({...form, category: e.target.value})} style={{padding:10,borderRadius:8,border:'1px solid #e6e6e6',width:220}} />
              <input placeholder="Amount" type="number" min="0" step="0.01" value={form.amount} onChange={e => setForm({...form, amount: e.target.value})} style={{padding:10,borderRadius:8,border:'1px solid #e6e6e6',width:180}} />
            </div>
            <div style={{marginTop:6}}>
              <button type="submit" className="save-btn" style={{color:'white',padding:'12px 18px',borderRadius:12,border:'2px solid #0f172a',cursor:'pointer',width:'100%'}}>Save</button>
            </div>
          </form>
        </section>

        <section className="budget-list">
          {loading ? <div className="loader">Loading...</div> : (
            budgets.length === 0 ? <div className="empty">No budgets set for this month.</div> : (
              budgets.map(b => (
                  <div className="budget-card" key={b.id}>
                  <div className="card-left" style={{flex:1}}>
                    <div className="cat" style={{fontSize:16,fontWeight:600,marginBottom:6}}>{b.category}</div>
                    <div className="meta" style={{fontSize:13,color:'#666',marginBottom:8}}>Budget: ₹{Number(b.amount).toFixed(2)} • Spent: ₹{Number(b.spent || 0).toFixed(2)}</div>
                    <div className="progress-wrapper" style={{height:10,background:'#f3f4f6',borderRadius:999,overflow:'hidden',marginBottom:8}}>
                      <div className="progress-bar" aria-valuenow={b.progress} style={{height:'100%',background:'linear-gradient(90deg,#06b6d4,#06b6d4)',width:`${(b.spent && b.amount) ? Math.min(100,(b.spent/b.amount)*100) : 0}%`}}></div>
                    </div>
                    <div className="status" style={{fontSize:13,color:'#374151'}}>Remaining: ₹{((b.amount||0)-(b.spent||0)).toFixed(2)} — <strong>{((b.amount||0)-(b.spent||0))>=0 ? 'Under Budget' : 'Over Budget'}</strong></div>
                  </div>
                  <div className="card-right" style={{marginLeft:16}}>
                    {window.location.pathname === '/dashboard' && (
                      <button className="delete" onClick={() => handleDelete(b.id)} style={{background:'#ef4444',color:'white',padding:'8px 12px',borderRadius:8,border:'none',cursor:'pointer'}}>Delete</button>
                    )}
                  </div>
                </div>
              ))
            )
          )}
        </section>
      </div>
    </div>
  );
};

export default BudgetPlanning;
