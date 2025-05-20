const express = require('express');
const { verifyToken, isAdmin } = require('../middleware/auth'); // Assuming you have an auth middleware for token verification and admin check
const db = require('../db');
const app = express();
const cors = require('cors');

app.use(cors());
app.use(express.json());
app.use(verifyToken);

// Get all distribution data
app.get('/get-distribution', (req, res) => {
  const { name } = req.query;  // Change from user → name

  let query = 'SELECT * FROM distribution_fee';
  let values = [];

  if (name) { // Ensure backend uses correct filter
    query += ' WHERE name = ?';
    values.push(name);
  }

  db.query(query, values, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(200).json(results);
  });
});



// Get distribution data by branch
app.get('/branch/:branch', (req, res) => {
  let { branch } = req.params;

  const branchMapping = {
    "Acalapati": "acalapati",
    "Agregator": "aggregator",
  };

  branch = branchMapping[branch] || branch;

  db.query('SELECT * FROM distribution_fee WHERE branch = ?', [branch], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(200).json(results);
  });
});

app.get('/get-fee/:name', (req, res) => {
  const { name } = req.params;
  
  db.query('SELECT acalapati_fee FROM users WHERE name = ?', [name], (err, results) => {
    if (err) {
      console.error('Error fetching user fee:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    
    if (results.length > 0) {
      res.json({ fee: results[0].acalapati_fee });
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  });
});


// Get income by invoice number
app.get('/get-income/:invoice_number', (req, res) => {
  const { invoice_number } = req.params;
  
  db.query('SELECT * FROM income WHERE invoice_number = ?', [invoice_number], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    
    if (results.length === 0) {
      return res.status(404).json({ message: 'Income not found' });
    }

    res.status(200).json(results[0]); 
  });
});

// Add new distribution
app.post('/add-distribution', isAdmin, (req, res) => {
  let {
    invoice_number, card_qty, fee, date, payment_date, payment_status, branch, username, 
    total_fee, tax, net_fee // These are passed from the frontend
  } = req.body;


  // Insert into the database
  const query = `
    INSERT INTO distribution_fee (
      invoice_number, card_qty, fee, date, payment_date, payment_status, branch, name,
      total_fee, tax, net_fee
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;
  const values = [invoice_number, card_qty, fee, date, payment_date, payment_status, branch, username, total_fee, tax, net_fee];

  db.query(query, values, (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json({ message: 'Distribution added successfully' });
  });
});


// Update distribution data
app.put('/update-distribution/:id', isAdmin, (req, res) => {
  const { id } = req.params;
  let { order_invoices, card_qty, fee, date, payment_date, payment_status, branch, user_name } = req.body;

  if (branch === "Acalapati") {
    branch = "acalapati";
  } else if (branch === "Agregator") {
    branch = "aggregator";
  }

  const query = `
    UPDATE distribution_fee 
    SET 
      order_invoices = ?, 
      card_qty = ?, 
      fee = ?, 
      date = ?, 
      payment_date = ?, 
      payment_status = ?, 
      branch = ?, 
      user_name = ?, 
      total_fee = (fee * card_qty) * 0.5 * 0.05, 
      tax = fee * 0.11, 
      net_fee = total_fee - tax 
    WHERE distribution_id = ?
  `;
  const values = [order_invoices, card_qty, fee, date, payment_date, payment_status, branch, user_name, id];

  db.query(query, values, (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(200).json({ message: 'Distribution updated successfully' });
  });
});

app.listen(3012, () => console.log('Distribution Service running on port 3012'));
