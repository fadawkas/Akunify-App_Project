const express = require('express');
const { verifyToken, isAdmin } = require('../middleware/auth'); // Assuming you have a middleware for authentication
const db = require('../db');
const app = express();
const cors = require('cors');

app.use(cors());
app.use(verifyToken);
app.use(express.json());

// Get all order data
app.get('/get-order', (req, res) => {
  db.query('SELECT * FROM orders', (err, results) => {
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

  db.query('SELECT * FROM orders WHERE branch = ?', [branch], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(200).json(results);
  });
});


// Get income by bank_name
app.get('/bank/:bank_name', (req, res) => {
  const { bank_name } = req.params;
  db.query('SELECT * FROM orders WHERE bank_name = ?', [bank_name], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(200).json(results);
  });
});

// Add order
app.post('/add-order', isAdmin, (req, res) => {
  let { po_number, invoice_number, order_date, supplier, item, description, quantity, unit_price, branch, bank_name, bank_account, account_number } = req.body;

  // Branch name transformation
  if (branch === "Acalapati") {
    branch = "Acalapati";
  } else if (branch === "Agregator") {
    branch = "Aggregator";
  }

    // Calculate total_price, tax, and grand_total
  const total_price = quantity * unit_price;

  // Insert data into the database
  const query = `
    INSERT INTO orders (po_number, invoice_number, order_date, supplier, item, description, quantity, unit_price, total_price, branch, bank_name, bank_account, account_number)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;
  const values = [po_number, invoice_number, order_date, supplier, item, description, quantity, unit_price, total_price, branch, bank_name, bank_account, account_number];
    
  db.query(query, values, (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json({ message: 'Orders added successfully' });
  });
});

app.put('/update-order/:id', isAdmin, (req, res) => {
  const { id } = req.params;
  let { po_number, invoice_number, order_date, supplier, item, description, quantity, unit_price, branch, bank_name, bank_account, account_number } = req.body;

  // Branch name transformation
  if (branch === "Acalapati") {
    branch = "Acalapati";
  } else if (branch === "Agregator") {
    branch = "Aggregator";
  }

  // Update query
  const query = `
    UPDATE orders 
    SET 
      po_number = ?, 
      invoice_number = ?, 
      order_date = ?, 
      supplier = ?, 
      item = ?, 
      description = ?, 
      quantity = ?, 
      unit_price = ?, 
      total_price = quantity * unit_price, 
      branch = ?, 
      bank_name = ?, 
      bank_account = ?, 
      account_number = ? 
    WHERE order_id = ?
  `;
  const values = [po_number, invoice_number, order_date, supplier, item, description, quantity, unit_price, branch, bank_name, bank_account, account_number, id];

  db.query(query, values, (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(200).json({ message: 'Order updated successfully' });
  });
});

app.delete('/delete-order/:id', isAdmin, (req, res) => {
  const { id } = req.params;
  const query = `DELETE FROM orders WHERE order_id = ?`;
  db.query(query, [id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    // Jika data berhasil dihapus, kirim respons sukses
    res.status(200).json({ message: 'Order deleted successfully' });
  });
});


app.listen(3010, () => console.log('Orders Service running on port 3010'));
