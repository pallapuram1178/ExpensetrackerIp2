require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_key';

// MongoDB / Mongoose setup
const mongoose = require('mongoose');
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/expense_tracker';
mongoose.connect(MONGODB_URI).then(() => {
  console.log('Connected to MongoDB:', MONGODB_URI);
}).catch(err => {
  console.error('MongoDB connection error:', err);
});

// Define simple Mongoose models for the app
const UserSchema = new mongoose.Schema({
  fullName: String,
  email: { type: String, unique: true, index: true },
  passwordHash: String,
  resetToken: String,
  resetTokenExpiry: Date,
  createdAt: { type: Date, default: Date.now }
});
const User = mongoose.model('User', UserSchema);

const ExpenseSchema = new mongoose.Schema({ userId: mongoose.Schema.Types.Mixed, amount: Number, category: String, date: Date, description: String });
const Expense = mongoose.model('Expense', ExpenseSchema);

const IncomeSchema = new mongoose.Schema({ userId: mongoose.Schema.Types.Mixed, amount: Number, source: String, date: Date });
const Income = mongoose.model('Income', IncomeSchema);

const BudgetSchema = new mongoose.Schema({ userId: mongoose.Schema.Types.Mixed, category: String, month: String, amount: Number });
const Budget = mongoose.model('Budget', BudgetSchema);

app.use(cors());
app.use(bodyParser.json());

// Simple in-memory stores for demo / local development
const users = []; // { id, email, passwordHash }
const expenses = []; // { id, userId, amount, category, date, description }
const incomes = []; // { id, userId, amount, source, date }

let nextUserId = 1;
let nextExpenseId = 1;
let nextIncomeId = 1;

// Helper: verify Bearer token
function verifyToken(req, res, next) {
  const authHeader = req.headers['authorization'] || req.headers['Authorization'];
  if (!authHeader) return res.status(403).json({ error: 'No token provided' });

  const parts = authHeader.split(' ');
  const token = parts.length === 2 && parts[0] === 'Bearer' ? parts[1] : authHeader;

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) return res.status(401).json({ error: 'Invalid token' });
    req.userId = decoded.id;
    next();
  });
}

// Register (uses MongoDB)
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, fullName } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

    const exists = await User.findOne({ email }).lean();
    if (exists) return res.status(409).json({ error: 'User exists' });

    const passwordHash = bcrypt.hashSync(password, 10);
    const created = await User.create({ email, passwordHash, fullName });
    res.json({ message: 'User registered successfully', user: { id: created._id, email: created.email } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Login (uses MongoDB)
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).lean();
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    const valid = bcrypt.compareSync(password, user.passwordHash);
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ id: String(user._id) }, JWT_SECRET, { expiresIn: '24h' });
    res.json({ token, user: { id: user._id, email: user.email } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Get expenses
app.get('/api/expenses', verifyToken, async (req, res) => {
  try {
    const docs = await Expense.find({ userId: req.userId }).sort({ date: -1 }).lean();
    res.json(docs);
  } catch (err) { console.error(err); res.status(500).json({ error: 'Failed to fetch expenses' }); }
});

// Add expense
app.post('/api/expenses', verifyToken, async (req, res) => {
  try {
    const { amount, category, date, description } = req.body;
    const doc = await Expense.create({ userId: req.userId, amount, category, date: date ? new Date(date) : new Date(), description });
    res.json({ message: 'Expense added successfully', expense: doc });
  } catch (err) { console.error(err); res.status(500).json({ error: 'Failed to add expense' }); }
});

// Get incomes
app.get('/api/incomes', verifyToken, async (req, res) => {
  try {
    const docs = await Income.find({ userId: req.userId }).sort({ date: -1 }).lean();
    res.json(docs);
  } catch (err) { console.error(err); res.status(500).json({ error: 'Failed to fetch incomes' }); }
});

// Add income
app.post('/api/incomes', verifyToken, async (req, res) => {
  try {
    const { amount, source, date } = req.body;
    const doc = await Income.create({ userId: req.userId, amount, source, date: date ? new Date(date) : new Date() });
    res.json({ message: 'Income added successfully', income: doc });
  } catch (err) { console.error(err); res.status(500).json({ error: 'Failed to add income' }); }
});

// Budgets endpoints used by frontend (GET, POST, DELETE)
app.get('/api/budgets', verifyToken, async (req, res) => {
  try {
    const { month } = req.query;
    const userIdQuery = req.query.userId || req.userId;
    if (!userIdQuery || !month) return res.json([]);
    const docs = await Budget.find({ userId: userIdQuery, month }).lean();
    // compute spent per budget by querying expenses
    const withSpent = await Promise.all(docs.map(async b => {
      const spent = await Expense.aggregate([
        { $match: { userId: userId, category: b.category, date: { $gte: new Date(b.month + '-01'), $lt: new Date(new Date(b.month + '-01').getFullYear(), new Date(b.month + '-01').getMonth()+1, 1) } } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]);
      return { id: b._id, category: b.category, month: b.month, amount: b.amount, spent: (withSpent = (spent[0] && spent[0].total) || 0) };
    }));
    res.json(withSpent);
  } catch (err) { console.error(err); res.status(500).json({ error: 'Failed to fetch budgets' }); }
});

app.post('/api/budgets', verifyToken, async (req, res) => {
  try {
    let { userId, category, month, amount } = req.body;
    console.log('/api/budgets POST body:', req.body);
    console.log('req.userId from token:', req.userId);
    // prefer authenticated user id
    userId = userId || req.userId;
    if (!userId || !category || !month) {
      console.error('Missing fields in /api/budgets POST', { userId, reqUserId: req.userId, category, month, amount, body: req.body });
      return res.status(400).json({ error: 'Missing fields', details: { userId, reqUserId: req.userId, category, month, amount } });
    }
    // upsert
    const updated = await Budget.findOneAndUpdate({ userId, category, month }, { amount }, { upsert: true, new: true });
    res.json({ success: true, budget: updated });
  } catch (err) { console.error(err); res.status(500).json({ error: 'Failed to save budget' }); }
});

app.delete('/api/budgets/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.query.userId || req.userId;
    if (!userId) return res.status(400).json({ error: 'Missing userId' });
    await Budget.deleteOne({ _id: id, userId });
    res.status(204).end();
  } catch (err) { console.error(err); res.status(500).json({ error: 'Failed to delete budget' }); }
});

// Delete expense by id
app.delete('/api/expenses/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    await Expense.deleteOne({ _id: id, userId: req.userId });
    res.status(204).end();
  } catch (err) { console.error(err); res.status(500).json({ error: 'Failed to delete expense' }); }
});

// Delete income by id
app.delete('/api/incomes/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    await Income.deleteOne({ _id: id, userId: req.userId });
    res.status(204).end();
  } catch (err) { console.error(err); res.status(500).json({ error: 'Failed to delete income' }); }
});

// Basic health
app.get('/', (req, res) => res.json({ status: 'ok' }));

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
