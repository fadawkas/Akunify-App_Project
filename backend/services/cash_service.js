const express = require('express');
const { verifyToken, isAdmin } = require('../middleware/auth'); 
const db = require('../db'); // Assuming db is your database connection module
const app = express();

app.use(express.json());
app.use(verifyToken);



// Helper function to get the balance for a specific branch and optional bank filter
const getBalance = (branch, bank_name, res) => {
  // Query to calculate total balance (income - payments)
  let query = `
    SELECT
      (SELECT SUM(grand_total) FROM income WHERE branch = ? ${bank_name ? 'AND bank_name = ?' : ''}) AS total_income,
      (SELECT SUM(amount) FROM payment WHERE branch = ? ${bank_name ? 'AND bank_name = ?' : ''}) AS total_payment
  `;

  const params = bank_name ? [branch, bank_name, branch, bank_name] : [branch, branch];

  db.query(query, params, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });

    const totalIncome = results[0].total_income || 0;
    const totalPayment = results[0].total_payment || 0;
    const totalBalance = totalIncome - totalPayment;

    res.status(200).json({ 
      total_balance: totalBalance,
      total_income: totalIncome,
      total_payment: totalPayment 
    });
  });
};

// Get balance for "Acalapati"
app.get('/balance-acalapati', isAdmin, (req, res) => {
  const { bank_name } = req.query; // Optional bank filter
  getBalance('Acalapati', bank_name, res);
});

// Get balance for "Agregator"
app.get('/balance-agregator', isAdmin, (req, res) => {
  const { bank_name } = req.query; // Optional bank filter
  getBalance('Agregator', bank_name, res);
});

// Get balance for all branches
app.get('/balance-all', isAdmin, (req, res) => {
  const { bank_name } = req.query; // Optional bank filter

  // Query to calculate total balance (income - payments) for all branches
  let query = `
    SELECT
      (SELECT SUM(grand_total) FROM income ${bank_name ? 'WHERE bank_name = ?' : ''}) AS total_income,
      (SELECT SUM(amount) FROM payment ${bank_name ? 'WHERE bank_name = ?' : ''}) AS total_payment
  `;

  const params = bank_name ? [bank_name, bank_name] : [];

  db.query(query, params, (err, results) => {
    if (err) {
      console.error("Error fetching balance:", err);
      return res.status(500).json({ error: err.message });
    }

    const totalIncome = results[0].total_income || 0;
    const totalPayment = results[0].total_payment || 0;
    const totalBalance = totalIncome - totalPayment;

    res.status(200).json({
      total_balance: totalBalance,
      total_income: totalIncome,
      total_payment: totalPayment,
    });
  });
});

app.get('/recent-transactions-all', isAdmin, (req, res) => {
  const { bank_name } = req.query;

  const query = `
    SELECT 
      i.invoice_number,
      i.grand_total as income,
      p.grand_total as expense, 
      (i.grand_total - p.grand_total) AS net,  
      p.payment_date
    FROM income i
    JOIN payment p ON i.invoice_number = p.invoice_number
    ${bank_name ? 'WHERE i.bank_name = ? AND p.bank_name = ?' : ''}
    ORDER BY i.payment_date DESC
    LIMIT 5
  `;

  const params = bank_name ? [bank_name, bank_name] : [];

  db.query(query, params, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });

    res.status(200).json(results);
  });
});

app.get('/recent-transactions-acalapati', isAdmin, (req, res) => {
  const { bank_name } = req.query;

  const query = `
    SELECT 
      i.invoice_number,
      i.grand_total as income,
      p.grand_total as expense,  
      (i.grand_total - p.grand_total) AS net, 
      p.payment_date
    FROM income i
    JOIN payment p ON i.invoice_number = p.invoice_number
    WHERE i.branch = 'Acalapati' AND p.branch = 'Acalapati'
    ${bank_name ? 'AND i.bank_name = ? AND p.bank_name = ?' : ''}
    ORDER BY i.payment_date DESC
    LIMIT 5
  `;

  const params = bank_name ? ['Acalapati', 'Acalapati', bank_name, bank_name] : ['Acalapati', 'Acalapati'];

  db.query(query, params, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });

    res.status(200).json(results);
  });
});

app.get('/recent-transactions-agregator', (req, res) => {
  const { bank_name } = req.query;

  const query = `
    SELECT 
      i.invoice_number,
      i.grand_total as income,
      p.grand_total as expense,  
      (i.grand_total - p.grand_total) AS net, 
      p.payment_date
    FROM income i
    JOIN payment p ON i.invoice_number = p.invoice_number
    WHERE i.branch = 'Agregator' AND p.branch = 'Agregator'
    ${bank_name ? 'AND i.bank_name = ? AND p.bank_name = ?' : ''}
    ORDER BY i.payment_date DESC
    LIMIT 5
  `;

  const params = bank_name ? ['Agregator', 'Agregator', bank_name, bank_name] : ['Agregator', 'Agregator'];

  db.query(query, params, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });

    res.status(200).json(results);
  });
});



// Start the service
app.listen(3003, () => console.log('Balance Service running on port 3003'));
