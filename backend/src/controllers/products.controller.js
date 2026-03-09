const pool = require("../db/pool");

/**
 * Récupère la liste de tous les produits
 */
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

/**
 * Récupère un seul produit par son ID
 */
async function getProductById(req, res, next) {
  try {
    const { id } = req.params;
    const result = await pool.query(`
            SELECT id, name, category, unit, min_threshold, quantity, created_at
            FROM products
            WHERE id = $1
        `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Produit non trouvé" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    next(error);
  }
}

/**
 * Ajoute un nouveau produit (Réservé au RESPONSABLE)
 */
async function addProduct(req, res, next) {
  try {
    const { name, category, unit, min_threshold, quantity } = req.body;

    // --- Validation Académique (Semaine 6) ---
    if (!name || name.trim() === "") {
      return res.status(400).json({ error: "Le nom du produit est obligatoire" });
    }

    if (min_threshold !== undefined && min_threshold < 0) {
      return res.status(400).json({ error: "Le seuil minimal (min_threshold) ne peut pas être négatif" });
    }
    // ----------------------------

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

/**
 * Modifie un produit existant ou met à jour le stock (Réservé au RESPONSABLE)
 */
async function updateProduct(req, res, next) {
  try {
    const { id } = req.params;
    const { name, category, unit, min_threshold, quantity } = req.body;

    // --- Validation ---
    if (name !== undefined && name.trim() === "") {
      return res.status(400).json({ error: "Le nom du produit ne peut pas être vide" });
    }

    if (min_threshold !== undefined && min_threshold < 0) {
      return res.status(400).json({ error: "Le seuil minimal (min_threshold) ne peut pas être négatif" });
    }
    // ------------------

    // Utilise COALESCE pour ne mettre à jour que les champs fournis dans le body
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
      return res.status(404).json({ error: "Produit non trouvé" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    next(error);
  }
}

/**
 * Supprime un produit (Réservé au RESPONSABLE)
 */
async function deleteProduct(req, res, next) {
  try {
    const { id } = req.params;
    const result = await pool.query("DELETE FROM products WHERE id = $1 RETURNING id", [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Produit non trouvé" });
    }

    res.json({ message: "Produit supprimé avec succès", id });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getProducts,
  getProductById,
  addProduct,
  updateProduct,
  deleteProduct
};