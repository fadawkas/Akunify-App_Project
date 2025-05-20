const express = require('express');
const db = require('../db');
const { verifyToken, isAdmin } = require('../middleware/auth'); 
const app = express();

app.use(express.json());
app.use(verifyToken);

// Get all income data
app.get('/get-all', (req, res) => {
  db.query('SELECT * FROM income', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(200).json(results);
  });
});

// Get income by branch
app.get('/branch/:branch', (req, res) => {
  let { branch } = req.params;

  // Map frontend branch names to enum values in the database
  const branchMapping = {
    "Acalapati": "acalapati",
    "Agregator": "aggregator",
  };

  // Transform branch name
  branch = branchMapping[branch] || branch;

  db.query('SELECT * FROM income WHERE branch = ?', [branch], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(200).json(results);
  });
});

// Get income by bank_name
app.get('/bank/:bank_name', (req, res) => {
  const { bank_name } = req.params;
  db.query('SELECT * FROM income WHERE bank_name = ?', [bank_name], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(200).json(results);
  });
});

// Add income
app.post('/add', isAdmin, (req, res) => {
  let { order_date, payment_date, invoice_number, customer, item, quantity, unit_price, branch, bank_name } = req.body;

  // Branch name transformation
  if (branch === "Acalapati") {
    branch = "acalapati";
  } else if (branch === "Agregator") {
    branch = "agregator";
  }

  // Calculate total_price, tax, and grand_total
  const total_price = quantity * unit_price;
  const tax = total_price * 0.11;
  const grand_total = total_price + tax;

  // Insert data into the database
  const query = `
    INSERT INTO income (order_date, payment_date, invoice_number, customer, item, quantity, unit_price, total_price, tax, grand_total, branch, bank_name)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;
  const values = [order_date, payment_date, invoice_number, customer, item, quantity, unit_price, total_price, tax, grand_total, branch, bank_name];

  db.query(query, values, (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json({ message: 'Income added successfully' });
  });
});

// UPDATE income data
app.put('/update/:id', isAdmin, (req, res) => {
  const { id } = req.params;
  let { order_date, payment_date, invoice_number, customer, item, quantity, unit_price, branch, bank_name } = req.body;

  // Branch name transformation
  if (branch === "Acalapati") {
    branch = "acalapti";
  } else if (branch === "Agregator") {
    branch = "aggregator";
  }

  // Calculate total_price, tax, and grand_total
  const total_price = quantity * unit_price;
  const tax = total_price * 0.11;
  const grand_total = total_price + tax;

  const query = `
    UPDATE income 
    SET order_date = ?, payment_date = ?, invoice_number = ?, customer = ?, item = ?, quantity = ?, unit_price = ?, 
        total_price = ?, tax = ?, grand_total = ?, branch = ?, bank_name = ? 
    WHERE income_id = ?
  `;
  const values = [order_date, payment_date, invoice_number, customer, item, quantity, unit_price, total_price, tax, grand_total, branch, bank_name, id];

  db.query(query, values, (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(200).json({ message: 'Income updated successfully' });
  });
});

// DELETE income data
app.delete('/delete/:id', isAdmin, (req, res) => {
  const { id } = req.params;

  db.query('DELETE FROM income WHERE income_id = ?', [id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(200).json({ message: 'Income deleted successfully' });
  });
});

app.listen(3001, () => console.log('Income Service running on port 3001'));
