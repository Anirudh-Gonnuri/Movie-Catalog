const express = require('express');
const cors = require('cors');
const { Pool } = require('pg'); 

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

const pool = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 5432
});

pool.query(`
CREATE TABLE IF NOT EXISTS movies (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255),
  director VARCHAR(255),
  genre VARCHAR(100),
  release_year INT,
  rating NUMERIC(2,1)
)
`).catch(err => console.error(err));


// GET /movies
app.get('/movies', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM movies ORDER BY id DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /movies
app.post('/movies', async (req, res) => {
  const { title, director, genre, release_year, rating } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO movies (title, director, genre, release_year, rating) VALUES ($1,$2,$3,$4,$5) RETURNING *',
      [title, director, genre, release_year, rating]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /movies/:id
app.put('/movies/:id', async (req, res) => {
  const { id } = req.params;
  const { title, director, genre, release_year, rating } = req.body;
  try {
    const result = await pool.query(
      'UPDATE movies SET title=$1, director=$2, genre=$3, release_year=$4, rating=$5 WHERE id=$6 RETURNING *',
      [title, director, genre, release_year, rating, id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /movies/:id
app.delete('/movies/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM movies WHERE id=$1', [id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
