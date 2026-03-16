import React from 'react';
import Login from './components/Login';
import Register from './components/Register';
import ForgotPassword from './components/ForgotPassword';
import ResetPassword from './components/ResetPassword';
import Dashboard from './components/Dashboard';
import AddExpense from './components/AddExpense';
import AddIncome from './components/AddIncome';
import Reports from './components/Reports';
import BudgetPlanning from './components/BudgetPlanning';
import './App.css';

// Simple routing based on URL path
function App() {
  const path = window.location.pathname;
  let comp = null;
  switch (path) {
    case '/':
    case '/login':
      comp = <Login />;
      break;
    case '/register':
      comp = <Register />;
      break;
    case '/forgot':
      comp = <ForgotPassword />;
      break;
    case '/reset':
      comp = <ResetPassword />;
      break;
    case '/dashboard':
      comp = <Dashboard />;
      break;
    case '/add-expense':
      comp = <AddExpense />;
      break;
    case '/add-income':
      comp = <AddIncome />;
      break;
    case '/reports':
      comp = <Reports />;
      break;
    case '/budget':
      comp = <BudgetPlanning />; // full page
      break;
    default:
      comp = <Login />;
  }

  // Do not auto-embed budget on every page. Budget is only shown on its full route.
  return comp;
}

export default App;
