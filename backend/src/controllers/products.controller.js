const pool = require("../db/pool");

async function getProducts(req, res, next) {
  try {
    const result = await pool.query(`
            SELECT id, name, category, unit, min_threshold, quantity, created_at
            FROM products
            ORDER BY id DESC
        `);
    res.json(result.rows);
  } catch (error) {
    next(error);
  }
}

async function addProduct(req, res, next) {
  try {
    const { name, category, unit, min_threshold, quantity } = req.body;

    if (!name) {
      return res.status(400).json({ error: "Product name is required" });
    }

    const result = await pool.query(`
            INSERT INTO products (name, category, unit, min_threshold, quantity)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *
        `, [name, category, unit, min_threshold || 0, quantity || 0]);

    res.status(201).json(result.rows[0]);
  } catch (error) {
    next(error);
  }
}

async function updateProduct(req, res, next) {
  try {
    const { id } = req.params;
    const { name, category, unit, min_threshold, quantity } = req.body;

    const result = await pool.query(`
            UPDATE products
            SET name = COALESCE($1, name),
                category = COALESCE($2, category),
                unit = COALESCE($3, unit),
                min_threshold = COALESCE($4, min_threshold),
                quantity = COALESCE($5, quantity)
            WHERE id = $6
            RETURNING *
        `, [name, category, unit, min_threshold, quantity, id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Product not found" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    next(error);
  }
}

async function deleteProduct(req, res, next) {
  try {
    const { id } = req.params;
    const result = await pool.query("DELETE FROM products WHERE id = $1 RETURNING id", [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Product not found" });
    }

    res.json({ message: "Product deleted successfully", id });
  } catch (error) {
    next(error);
  }
}

module.exports = { getProducts, addProduct, updateProduct, deleteProduct };