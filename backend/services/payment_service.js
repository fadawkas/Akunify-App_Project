const express = require('express');
const { verifyToken, isAdmin } = require('../middleware/auth'); // Assuming you have a middleware for authentication
const db = require('../db');
const app = express();
const cors = require('cors');

app.use(cors());
app.use(verifyToken);
app.use(express.json());

// Get all payment data
app.get('/get-payment', (req, res) => {
  db.query('SELECT * FROM payment', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(200).json(results);
  });
});

// Get order by branch
app.get('/branch/:branch', (req, res) => {
  let { branch } = req.params;

  // Map frontend branch names to enum values in the database
  const branchMapping = {
    "Acalapati": "acalapati",
    "Agregator": "aggregator",
  };

  // Transform branch name
  branch = branchMapping[branch] || branch;

  db.query('SELECT * FROM payment WHERE branch = ?', [branch], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(200).json(results);
  });
});


// Get income by bank_name
app.get('/bank/:bank_name', (req, res) => {
  const { bank_name } = req.params;
  db.query('SELECT * FROM payment WHERE bank_name = ?', [bank_name], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(200).json(results);
  });
});

// Add order
app.post('/add-payment', isAdmin, (req, res) => {
  let { order_id, payment_date, payment_status, amount, branch, bank_name } = req.body;

  // Konversi amount ke decimal
  amount = parseFloat(amount).toFixed(2);

  // Transformasi nama branch
  if (branch === "Acalapati") {
    branch = "Acalapati";
  } else if (branch === "Agregator") {
    branch = "Aggregator";
  }

  // Hitung tax dan grand_total dengan tipe decimal
  const tax = parseFloat((amount * 0.11).toFixed(2));
  const grand_total = parseFloat((parseFloat(amount) + tax).toFixed(2));

  // Query untuk memasukkan data ke database
  const query = `
    INSERT INTO payment (order_id, payment_date, payment_status, amount, tax, grand_total, branch, bank_name)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;
  const values = [order_id, payment_date, payment_status, amount, tax, grand_total, branch, bank_name];
            
  db.query(query, values, (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json({ message: 'Payment added successfully' });
  });
});

app.put('/update-payment/:id', isAdmin, (req, res) => {
  const { id } = req.params;
  let { order_id, payment_date, payment_status, amount, branch, bank_name } = req.body;

  // Branch name transformation
  if (branch === "Acalapati") {
    branch = "Acalapati";
  } else if (branch === "Agregator") {
    branch = "Aggregator";
  }

  // Update query
  const query = `
    UPDATE payment 
    SET 
      order_id = ?, 
      payment_date = ?, 
      payment_status = ?, 
      amount = ?, 
      tax = amount * 0.11, 
      grand_total = amount + (amount * 0.11), 
      branch = ?, 
      bank_name = ?
    WHERE payment_id = ?
  `;
  const values = [order_id, payment_date, payment_status, amount, branch, bank_name, id];

  db.query(query, values, (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(200).json({ message: 'Payment updated successfully' });
  });
});

app.delete('/delete-payment/:id', isAdmin, (req, res) => {
  const { id } = req.params;
  const query = `DELETE FROM payment WHERE payment_id = ?`;
  db.query(query, [id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(200).json({ message: 'Payment deleted successfully' });
  });
});

app.listen(3011, () => console.log('payment Service running on port 3011'));
