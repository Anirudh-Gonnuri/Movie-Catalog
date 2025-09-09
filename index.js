const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;


app.use(cors());
app.use(express.json());

// MySQL connection
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "root123",
  database: "movies_db"
});

db.connect(err => {
  if (err) throw err;
  console.log("Connected to MySQL database");
});
app.use(express.static("public"));
// GET all movies
app.get("/movies", (req, res) => {
  db.query("SELECT * FROM movies", (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// POST a new movie
app.post("/movies", (req, res) => {
  const { title, director, genre, release_year, rating } = req.body;
  db.query(
    "INSERT INTO movies (title, director, genre, release_year, rating) VALUES (?, ?, ?, ?, ?)",
    [title, director, genre, release_year, rating],
    (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).json({ id: results.insertId, ...req.body });
    }
  );
});

// PUT update a movie
app.put("/movies/:id", (req, res) => {
  const { id } = req.params;
  const { title, director, genre, release_year, rating } = req.body;
  db.query(
    "UPDATE movies SET title=?, director=?, genre=?, release_year=?, rating=? WHERE id=?",
    [title, director, genre, release_year, rating, id],
    (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id: Number(id), ...req.body });
    }
  );
});

// DELETE a movie
app.delete("/movies/:id", (req, res) => {
  const { id } = req.params;
  db.query("DELETE FROM movies WHERE id=?", [id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "Movie deleted successfully" });
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
