const base = '/api/budgets';

function authHeaders() {
  const token = localStorage.getItem('token');
  return token ? { 'Authorization': token, 'Content-Type': 'application/json' } : { 'Content-Type': 'application/json' };
}

// Helper localStorage fallback - budgets stored as array of {id, userId, category, month, amount}
function readLocalBudgets() {
  try { return JSON.parse(localStorage.getItem('budgets')) || []; } catch (e) { return []; }
}
function writeLocalBudgets(data) { localStorage.setItem('budgets', JSON.stringify(data)); }

export async function fetchBudgets(userId, month) {
  try {
    const res = await fetch(`${base}?userId=${userId}&month=${encodeURIComponent(month)}`, { headers: authHeaders() });
    if (!res.ok) throw new Error('Fetch failed');
    return res.json();
  } catch (err) {
    // fallback to localStorage
    const all = readLocalBudgets();
    const filtered = all.filter(b => String(b.userId) === String(userId) && b.month === month).map(b => ({
      id: b.id,
      category: b.category,
      month: b.month,
      amount: b.amount,
      // compute spent from local expenses (assume expenses belong to current user in localStorage)
      spent: (function(){
        try {
          const expenses = JSON.parse(localStorage.getItem('expenses')) || [];
          const sum = expenses
            .filter(e => e.category === b.category && (e.date || '').slice(0,7) === month)
            .reduce((s, x) => s + (parseFloat(x.amount) || 0), 0);
          return sum;
        } catch(e){ return 0; }
      })()
    }));
    return filtered;
  }
}

export async function saveBudget(payload) {
  try {
    const res = await fetch(base, { method: 'POST', headers: authHeaders(), body: JSON.stringify(payload) });
    if (!res.ok) throw new Error('Save failed');
    return res.json();
  } catch (err) {
    // fallback to localStorage
    try {
      const all = readLocalBudgets();
      // resolve userId from payload or localStorage
      const resolvedUserId = payload && payload.userId != null ? payload.userId : (function(){
        try { const u = localStorage.getItem('user'); return u ? JSON.parse(u).id : null; } catch(e){ return null; }
      })();

      const pCategory = (payload && payload.category) ? String(payload.category) : '';
      let idx = all.findIndex(b => String(b.userId) === String(resolvedUserId) && String((b.category||'')).toLowerCase() === pCategory.toLowerCase() && String(b.month) === String(payload.month));
      if (idx >= 0) {
        all[idx].amount = payload.amount;
      } else {
        const id = Date.now();
        all.push({ id, userId: resolvedUserId, category: pCategory, month: payload.month, amount: payload.amount });
      }
      writeLocalBudgets(all);
      return { success: true };
    } catch (e) {
      // If fallback itself fails, rethrow to let caller handle
      throw e;
    }
  }
}

export async function deleteBudget(userId, id) {
  try {
    const res = await fetch(`${base}/${id}?userId=${userId}`, { method: 'DELETE', headers: authHeaders() });
    if (!res.ok && res.status !== 204) throw new Error('Delete failed');
  } catch (err) {
    const all = readLocalBudgets();
    const filtered = all.filter(b => !(String(b.id) === String(id) && String(b.userId) === String(userId)));
    writeLocalBudgets(filtered);
  }
}
