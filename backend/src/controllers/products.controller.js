const pool = require("../db/pool");

/**
 * Contrôleur pour la gestion du catalogue de produits.
 * Gère le CRUD des produits et l'association aux zones de stockage.
 */

/**
 * Récupère la liste de tous les produits AVEC le stock actuel calculé
 * Utilise la vue v_product_stock pour obtenir le stock réel
 */
async function getProducts(req, res, next) {
  try {
    // On récupère les colonnes de base + le stock calculé via la vue v_product_stock
    // + le nom de la zone (location_name) via une jointure sur locations
    const result = await pool.query(`
      SELECT 
        p.id, p.name, p.category, p.unit, p.min_threshold, p.target_stock, p.location_id, l.name AS location_name, p.created_at,
        COALESCE(ps.stock_actuel, 0) AS stock_actuel
      FROM products p
      LEFT JOIN v_product_stock ps ON p.id = ps.product_id
      LEFT JOIN locations l ON p.location_id = l.id
      ORDER BY p.name ASC
    `);
    res.json(result.rows);
  } catch (error) {
    next(error);
  }
}

/**
 * Récupère un seul produit par son ID avec stock calculé
 */
async function getProductById(req, res, next) {
  try {
    const { id } = req.params;
    const result = await pool.query(`
      SELECT 
        p.id, p.name, p.category, p.unit, p.min_threshold, p.target_stock, p.location_id, l.name AS location_name, p.created_at,
        COALESCE(ps.stock_actuel, 0) AS stock_actuel
      FROM products p
      LEFT JOIN v_product_stock ps ON p.id = ps.product_id
      LEFT JOIN locations l ON p.location_id = l.id
      WHERE p.id = $1
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
 * Note: Le stock initial est 0. Utiliser un mouvement ENTREE pour ajouter du stock.
 */
async function addProduct(req, res, next) {
  try {
    // location_id est optionnel (permet d'assigner une zone par défaut au produit)
    const { name, category, unit, min_threshold, target_stock, location_id } = req.body;

    // --- Validation ---
    if (!name || name.trim() === "") {
      return res.status(400).json({ error: "Le nom du produit est obligatoire" });
    }

    if (!category || category.trim() === "") {
      return res.status(400).json({ error: "La catégorie est obligatoire" });
    }

    if (min_threshold !== undefined && min_threshold < 0) {
      return res.status(400).json({ error: "Le seuil minimal (min_threshold) ne peut pas être négatif" });
    }

    if (target_stock !== undefined && target_stock < 0) {
      return res.status(400).json({ error: "Le stock cible (target_stock) ne peut pas être négatif" });
    }

    // Insertion incluant location_id pour le suivi par zone
    const result = await pool.query(`
      INSERT INTO products (name, category, unit, min_threshold, target_stock, location_id)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id, name, category, unit, min_threshold, target_stock, location_id, created_at
    `, [name.trim(), category.trim(), unit || 'unité', min_threshold || 0, target_stock || 0, location_id || null]);

    // Return product with stock_actuel = 0 (new product)
    const product = result.rows[0];
    product.stock_actuel = 0;

    res.status(201).json(product);
  } catch (error) {
    next(error);
  }
}

/**
 * Modifie un produit existant (Réservé au RESPONSABLE)
 */
async function updateProduct(req, res, next) {
  try {
    const { id } = req.params;
    const { name, category, unit, min_threshold, target_stock, location_id } = req.body;

    // --- Validation ---
    if (name !== undefined && name.trim() === "") {
      return res.status(400).json({ error: "Le nom du produit ne peut pas être vide" });
    }

    if (min_threshold !== undefined && min_threshold < 0) {
      return res.status(400).json({ error: "Le seuil minimal (min_threshold) ne peut pas être négatif" });
    }

    if (target_stock !== undefined && target_stock < 0) {
      return res.status(400).json({ error: "Le stock cible (target_stock) ne peut pas être négatif" });
    }

    // Mise à jour de la zone (location_id) supportée
    const result = await pool.query(`
      UPDATE products
      SET name = COALESCE($1, name),
          category = COALESCE($2, category),
          unit = COALESCE($3, unit),
          min_threshold = COALESCE($4, min_threshold),
          target_stock = COALESCE($5, target_stock),
          location_id = COALESCE($6, location_id)
      WHERE id = $7
      RETURNING id, name, category, unit, min_threshold, target_stock, location_id, created_at
    `, [name, category, unit, min_threshold, target_stock, location_id, id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Produit non trouvé" });
    }

    // Fetch stock_actuel for the updated product
    const stockResult = await pool.query(
      `SELECT COALESCE(stock_actuel, 0) AS stock_actuel FROM v_product_stock WHERE product_id = $1`,
      [id]
    );
    const product = result.rows[0];
    product.stock_actuel = stockResult.rows[0]?.stock_actuel || 0;

    res.json(product);
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
    if (error.code === '23503') {
      return res.status(400).json({ 
        error: "Ce produit ne peut pas être supprimé car il possède déjà un historique de mouvements. Vous pouvez le modifier pour l'ajuster." 
      });
    }
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