const express = require('express');
const { verifyToken, isAdmin } = require('../middleware/auth'); // Assuming you have a middleware for authentication
const db = require('../db');
const app = express();

app.use(express.json());
app.use(verifyToken);

// Get all stock data
app.get('/get-all', (req, res) => {
  db.query('SELECT * FROM stock', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(200).json(results);
  });
});

// Update stock quantity manually
app.put('/update-quantity/:stock_id', isAdmin, (req, res) => {
  const { stock_id } = req.params;
  const { quantity } = req.body;

  if (typeof quantity !== 'number' || quantity < 0) {
    return res.status(400).json({ error: 'Invalid quantity value. Quantity must be a positive number.' });
  }

  const query = `
    UPDATE stock
    SET total_quantity = ?
    WHERE stock_id = ?
  `;
  const values = [quantity, stock_id];

  db.query(query, values, (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Stock item not found' });
    }
    res.status(200).json({ message: 'Stock quantity updated successfully' });
  });
});

app.listen(3005, () => console.log('Stock Service running on port 3005'));
