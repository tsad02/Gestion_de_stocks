const pool = require("../db/pool");

async function getProducts(req, res, next) {
  try {
    const result = await pool.query(`
      SELECT id, name, category, unit, min_threshold, created_at
      FROM products
      ORDER BY id DESC
    `);
    res.json(result.rows);
  } catch (error) {
    next(error);
  }
}

module.exports = { getProducts };