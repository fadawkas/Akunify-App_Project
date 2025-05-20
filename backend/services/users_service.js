const express = require('express');
const { verifyToken, isAdmin } = require('../middleware/auth'); // Assuming you have a middleware for authentication
const db = require('../db'); // Your database connection file
const app = express();

app.use(express.json());
app.use(verifyToken);

// Fetch all users (No admin check)
app.get("/get-all", (req, res) => {
  const query = "SELECT * FROM users"; // Adjust based on your database schema

  db.query(query, (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.status(200).json(results);
  });
});

// Update user role and branch (No admin check)
app.put("/update/:userId", isAdmin, (req, res) => {
  const { userId } = req.params;
  const { role, branch } = req.body;

  if (!role || !branch) {
    return res.status(400).json({ error: "Role and Branch are required" });
  }

  const query = `
    UPDATE users 
    SET role = ?, branch = ? 
    WHERE user_id = ?
  `;

  db.query(query, [role, branch, userId], (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (results.affectedRows === 0) {
      return res.status(404).json({ error: "User not found" });
    }
    res.status(200).json({ message: "User updated successfully" });
  });
});

app.listen(3002, () => {
  console.log("User service running on port 3002");
});
