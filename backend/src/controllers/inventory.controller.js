const pool = require("../db/pool");

/**
 * POST /api/inventory-movements
 * Enregistrer un nouveau mouvement de stock
 * (Réservé au RESPONSABLE)
 */
async function addMovement(req, res, next) {
  try {
    const { product_id, type, quantity, reason } = req.body;
    const user_id = req.user.id;  // Utilisateur authentifié

    // --- Validation ---
    if (!product_id || !type || !quantity) {
      return res.status(400).json({
        error: "product_id, type et quantity sont obligatoires"
      });
    }

    // Vérifier que le type est valide
    if (!['ENTREE', 'SORTIE', 'PERTE'].includes(type.toUpperCase())) {
      return res.status(400).json({
        error: "Type invalide. Doit être : ENTREE, SORTIE ou PERTE"
      });
    }

    // Vérifier que la quantité est positive
    if (quantity <= 0) {
      return res.status(400).json({
        error: "La quantité doit être > 0"
      });
    }

    // Vérifier que le produit existe
    const productExists = await pool.query(
      "SELECT id FROM products WHERE id = $1",
      [product_id]
    );
    if (productExists.rows.length === 0) {
      return res.status(404).json({
        error: "Produit non trouvé"
      });
    }

    // --- Insertion du mouvement ---
    const result = await pool.query(`
      INSERT INTO inventory_movements (product_id, user_id, type, quantity, reason)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, product_id, user_id, type, quantity, reason, created_at
    `, [product_id, user_id, type.toUpperCase(), quantity, reason || null]);

    res.status(201).json({
      message: "Mouvement enregistré avec succès",
      movement: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/inventory-movements
 * Lister tous les mouvements (avec filtrage optionnel)
 */
async function listMovements(req, res, next) {
  try {
    const { product_id, type, limit = 50, offset = 0 } = req.query;

    let query = `
      SELECT m.id, m.product_id, p.name AS product_name, m.user_id, u.username,
             m.type, m.quantity, m.reason, m.created_at
      FROM inventory_movements m
      JOIN products p ON m.product_id = p.id
      JOIN users u ON m.user_id = u.id
      WHERE 1=1
    `;
    const params = [];

    if (product_id) {
      query += ` AND m.product_id = $${params.length + 1}`;
      params.push(product_id);
    }

    if (type) {
      query += ` AND m.type = $${params.length + 1}`;
      params.push(type.toUpperCase());
    }

    query += ` ORDER BY m.created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);

    const result = await pool.query(query, params);
    res.json({
      total: result.rowCount,
      movements: result.rows
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/inventory-movements/:id
 * Détails d'un mouvement
 */
async function getMovementById(req, res, next) {
  try {
    const { id } = req.params;

    const result = await pool.query(`
      SELECT m.id, m.product_id, p.name AS product_name, m.user_id, u.username,
             m.type, m.quantity, m.reason, m.created_at
      FROM inventory_movements m
      JOIN products p ON m.product_id = p.id
      JOIN users u ON m.user_id = u.id
      WHERE m.id = $1
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: "Mouvement non trouvé"
      });
    }

    res.json(result.rows[0]);
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/inventory-movements/product/:product_id
 * Historique des mouvements pour un produit
 */
async function getMovementsByProduct(req, res, next) {
  try {
    const { product_id } = req.params;

    // Vérifier que le produit existe
    const product = await pool.query(
      "SELECT id, name FROM products WHERE id = $1",
      [product_id]
    );

    if (product.rows.length === 0) {
      return res.status(404).json({
        error: "Produit non trouvé"
      });
    }

    // Récupérer les mouvements
    const result = await pool.query(`
      SELECT m.id, m.product_id, m.user_id, u.username, m.type, m.quantity, 
             m.reason, m.created_at
      FROM inventory_movements m
      JOIN users u ON m.user_id = u.id
      WHERE m.product_id = $1
      ORDER BY m.created_at DESC
    `, [product_id]);

    res.json({
      product: product.rows[0],
      movements: result.rows
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  addMovement,
  listMovements,
  getMovementById,
  getMovementsByProduct
};
