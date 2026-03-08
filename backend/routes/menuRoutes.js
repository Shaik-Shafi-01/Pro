const express = require('express');
const pool = require('../config/db');

const router = express.Router();

router.get('/categories', async (_req, res, next) => {
  try {
    const [rows] = await pool.query(
      'SELECT DISTINCT category FROM menu_items WHERE is_available = 1 ORDER BY category ASC'
    );
    return res.json(rows.map((row) => row.category));
  } catch (error) {
    return next(error);
  }
});

router.get('/', async (req, res, next) => {
  try {
    const { category } = req.query;

    const query = category
      ? 'SELECT * FROM menu_items WHERE is_available = 1 AND category = ? ORDER BY id DESC'
      : 'SELECT * FROM menu_items WHERE is_available = 1 ORDER BY id DESC';
    const params = category ? [category] : [];

    const [rows] = await pool.query(query, params);
    return res.json(rows);
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
