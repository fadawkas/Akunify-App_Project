const express = require('express');
const { verifyToken, isAdmin } = require('../middleware/auth'); 
const db = require('../db');
const app = express();
const cors = require('cors');

app.use(express.json());
app.use(cors());
app.use(verifyToken);

// Get all operational expenses
app.get('/get-all', async (req, res) => {
  try {
    const [rows] = await db.promise().query('SELECT * FROM operational_expenses');
    res.status(200).json(rows);
  } catch (err) {
    console.error('Error fetching operational expenses:', err.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Add a new operational expense
app.post('/add', isAdmin, async (req, res) => {
  const {
    date,
    description,
    amount,
    category,
    branch,
    bank_name,
    status,
    paid_date,
  } = req.body;

  // Validation to check for required fields
  if (!date || !description || !amount || !category) {
    return res
      .status(400)
      .json({ error: 'Date, Description, Amount, and Category are required fields.' });
  }

  try {
    const query = `
      INSERT INTO operational_expenses (date, description, amount, category, branch, bank_name, status, paid_date)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const values = [
      date,
      description,
      amount,
      category,
      branch || null,
      bank_name || null,
      status || 'Unpaid',
      paid_date || null,
    ];
    const [result] = await db.promise().query(query, values);

    res.status(201).json({
      message: 'Operational expense added successfully',
      id: result.insertId,
    });
  } catch (err) {
    console.error('Error adding operational expense:', err.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Update an operational expense
app.put('/update-expense/:id', isAdmin, (req, res) => {
  const { id } = req.params;
  let { date, description, amount, category, branch, bank_name, status, paid_date } = req.body;

  // Branch name transformation
  if (branch === "Acalapati") {
    branch = "Acalapati";
  } else if (branch === "Agregator") {
    branch = "Aggregator";
  }

  // Update query
  const query = `
    UPDATE operational_expenses 
    SET 
      date = ?, 
      description = ?, 
      amount = ?, 
      category = ?, 
      branch = ?, 
      bank_name = ?, 
      status = ?, 
      paid_date = ?  
    WHERE expense_id = ?
  `;
  const values = [date, description, amount, category, branch, bank_name, status, paid_date, id];

  db.query(query, values, (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(200).json({ message: 'Expense updated successfully' });
  });
});

// Delete an operational expense
app.delete('/delete-expense/:id', isAdmin, (req, res) => {
  const { id } = req.params;
  const query = `DELETE FROM operational_expenses WHERE expense_id = ?`;
  db.query(query, [id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    // Jika data berhasil dihapus, kirim respons sukses
    res.status(200).json({ message: 'Expense deleted successfully' });
  });
});

app.listen(3007, () => console.log('Operational Expense Service running on port 3007'));
