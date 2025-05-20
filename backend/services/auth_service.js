const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const { v4: uuidv4 } = require('uuid');
const db = require('../db');
const app = express();
const cors = require('cors');

// Enable CORS
app.use(cors({
  origin: 'http://localhost:5173', // Update with your front-end URL
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true, // Allow cookies (for sessions)
}));

app.use(express.json());

const SECRET_KEY = process.env.SECRET_KEY;

// Sign-up Endpoint
app.post('/signup', async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    const [existingUser] = await db.promise().query('SELECT * FROM users WHERE email = ?', [email]);
    if (existingUser.length > 0) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = uuidv4();

    const query = `INSERT INTO users (user_id, name, email, password) VALUES (?, ?, ?, ?)`;
    await db.promise().query(query, [userId, name, email, hashedPassword]);

    res.status(201).json({ message: 'User created successfully', user_id: userId });
  } catch (err) {
    console.error('Error during signup:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Login Endpoint
app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    const [users] = await db.promise().query('SELECT * FROM users WHERE email = ?', [email]);
    if (users.length === 0) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    const user = users[0];
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    const token = jwt.sign({ userId: user.user_id, email: user.email, role: user.role, branch: user.branch }, SECRET_KEY, { expiresIn: '1h' });

    res.status(200).json({ message: 'Login successful', token, user: { userId: user.user_id, email: user.email, role: user.role, branch: user.branch } });
  } catch (err) {
    console.error('Error during login:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Middleware to authenticate token
const authenticateToken = (req, res, next) => {
  const token = req.headers['authorization'];
  if (!token) return res.status(401).json({ message: 'Access denied' });

  jwt.verify(token.split(' ')[1], SECRET_KEY, (err, user) => {
    if (err) return res.status(403).json({ message: 'Invalid token' });
    req.user = user;
    next();
  });
};

// Example Protected Route
app.get('/protected', authenticateToken, (req, res) => {
  res.status(200).json({ message: 'Welcome to the protected route', user: req.user });
});

app.listen(3004, () => console.log('Auth Service running on port 3004'));
