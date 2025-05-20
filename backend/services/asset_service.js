const express = require('express');
const { verifyToken, isAdmin } = require('../middleware/auth'); 
const db = require('../db');
const app = express();

app.use(express.json());
app.use(verifyToken);

// Get all assets
app.get('/get-all', async (req, res) => {
  try {
    const [rows] = await db.promise().query('SELECT * FROM assets');
    res.status(200).json(rows);
  } catch (err) {
    console.error('Error fetching assets:', err.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Add a new asset
app.post('/add', isAdmin, async (req, res) => {
  const {
    asset_name,
    purchase_price,
    purchase_date,
    expected_usage_years,
    category,
  } = req.body;

  // Validation to check for required fields
  if (!asset_name || !purchase_price || !purchase_date || !expected_usage_years || !category) {
    return res
      .status(400)
      .json({ error: 'Asset name, Purchase price, Purchase date, Expected usage years, and Category are required fields.' });
  }

  // Calculate amortization
  const annual_amortization = purchase_price / expected_usage_years;
  const monthly_amortization = annual_amortization / 12;

  try {
    const query = `
      INSERT INTO assets (asset_name, purchase_price, purchase_date, expected_usage_years, category, annual_amortization, monthly_amortization)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    const values = [
      asset_name,
      purchase_price,
      purchase_date,
      expected_usage_years,
      category,
      annual_amortization,
      monthly_amortization,
    ];
    const [result] = await db.promise().query(query, values);

    res.status(201).json({
      message: 'Asset added successfully',
      id: result.insertId,
    });
  } catch (err) {
    console.error('Error adding asset:', err.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Update an asset
app.put('/:id', isAdmin, async (req, res) => {
  const { id } = req.params;
  const {
    asset_name,
    purchase_price,
    purchase_date,
    expected_usage_years,
    category,
  } = req.body;

  // Calculate amortization
  const annual_amortization = purchase_price / expected_usage_years;
  const monthly_amortization = annual_amortization / 12;

  try {
    const query = `
      UPDATE assets
      SET asset_name = ?, purchase_price = ?, purchase_date = ?, expected_usage_years = ?, category = ?, annual_amortization = ?, monthly_amortization = ?
      WHERE asset_id = ?
    `;
    const values = [
      asset_name,
      purchase_price,
      purchase_date,
      expected_usage_years,
      category,
      annual_amortization,
      monthly_amortization,
      id,
    ];
    const [result] = await db.promise().query(query, values);

    res.status(200).json({ message: 'Asset updated successfully' });
  } catch (err) {
    console.error('Error updating asset:', err.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Delete an asset
app.delete('/:id', isAdmin, async (req, res) => {
  const { id } = req.params;

  try {
    await db.promise().query('DELETE FROM assets WHERE asset_id = ?', [id]);
    res.status(200).json({ message: 'Asset deleted successfully' });
  } catch (err) {
    console.error('Error deleting asset:', err.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.listen(3008, () => console.log('Asset Service running on port 3008'));
