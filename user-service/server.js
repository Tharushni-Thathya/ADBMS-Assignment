const express = require("express");
const cors = require("cors");
const db = require("./db");
const PORT = process.env.PORT || 8080;
const app = express();
app.use(cors());
app.use(express.json());

app.post("/user", (req, res) => {
  const { name, email } = req.body;

  db.query(
    "INSERT INTO users (name, email) VALUES (?, ?)",
    [name, email],
    (err, results) => {
      if (err) {
        console.error("Error inserting user:", err);
        return res.status(500).json({ error: "Error inserting user" });
      }
      console.log("User inserted:", results);
      return res.status(201).json({ message: "User created successfully" });
    }
  );
});

app.get("/users", (req, res) => {
  db.query("SELECT * FROM users", (err, results) => {
    if (err) {
      console.error("Error retrieving users:", err);
      return res.status(500).json({ error: "Error retrieving users" });
    }
    return res.status(200).json({ users: results });
  });
});

app.delete("/user/:id", (req, res) => {
  const userId = req.params.id;

  db.query("DELETE FROM users WHERE id = ?", [userId], (err, result) => {
    if (err) {
      console.error("Error deleting user:", err);
      return res.status(500).json({ error: "Error deleting user" });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({ message: "User deleted successfully" });
  });
});

app.put("/user/:id", (req, res) => {
  const userId = req.params.id;
  const { name, email } = req.body;

  db.query(
    "UPDATE users SET name = ?, email = ? WHERE id = ?",
    [name, email, userId],
    (err, result) => {
      if (err) {
        console.error("Error updating user:", err);
        return res.status(500).json({ error: "Error updating user" });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "User not found" });
      }

      return res.status(200).json({ message: "User updated successfully" });
    }
  );
});

// INTERNAL CALL
app.get("/user/validate/:id", (req, res) => {
  const userId = req.params.id;

  db.query(
    "SELECT COUNT(*) AS count FROM users WHERE id = ?",
    [userId],
    (err, results) => {
      if (err) {
        console.error("Error validating user:", err);
        return res.status(500).json({ error: "Error validating user" });
      }

      const userExists = results[0].count > 0;

      if (userExists) {
        return res
          .status(200)
          .json({ isValid: true, message: "User is valid" });
      } else {
        return res
          .status(200)
          .json({ isValid: false, message: "User is not valid" });
      }
    }
  );
});

app.listen(PORT, () => {
  console.log("Server running on PORT : " + PORT);
});
