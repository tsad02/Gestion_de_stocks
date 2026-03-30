const pool = require("../db/pool");

/**
 * POST /api/inventory-movements
 * Enregistrer un nouveau mouvement de stock
 */
async function addMovement(req, res, next) {
  try {
    const { product_id, type, quantity, reason, source_location_id, destination_location_id } = req.body;
    const user_id = req.user.id;  // Utilisateur authentifié

    // --- Validation ---
    if (!product_id || !type || !quantity) {
      return res.status(400).json({
        error: "product_id, type et quantity sont obligatoires"
      });
    }

    // Vérifier que le type est valide
    const movementType = type.toUpperCase();
    if (!['ENTREE', 'SORTIE', 'PERTE', 'TRANSFERT'].includes(movementType)) {
      return res.status(400).json({
        error: "Type invalide. Doit être : ENTREE, SORTIE, PERTE ou TRANSFERT"
      });
    }

    // Validation spécifique PERTE
    if (movementType === 'PERTE' && (!reason || reason.trim() === '')) {
      return res.status(400).json({
        error: "Un motif (reason) est obligatoire pour enregistrer une PERTE."
      });
    }

    // Validation spécifique TRANSFERT
    if (movementType === 'TRANSFERT') {
      if (!source_location_id || !destination_location_id) {
        return res.status(400).json({
          error: "Un transfert nécessite une source_location_id et une destination_location_id."
        });
      }
      if (source_location_id === destination_location_id) {
        return res.status(400).json({
          error: "La source et la destination d'un transfert ne peuvent pas être identiques."
        });
      }
    }

    // Vérifier que la quantité est positive
    if (quantity <= 0) {
      return res.status(400).json({
        error: "La quantité doit être > 0"
      });
    }

    // Vérifier que le produit existe
    const productExists = await pool.query(
      "SELECT id, name FROM products WHERE id = $1",
      [product_id]
    );
    if (productExists.rows.length === 0) {
      return res.status(404).json({
        error: "Produit non trouvé"
      });
    }

    // --- Validation spécifique SORTIE, PERTE et TRANSFERT : Vérifier le stock disponible ---
    if (movementType === 'SORTIE' || movementType === 'PERTE' || movementType === 'TRANSFERT') {
      const stockCheck = await pool.query(`
        SELECT COALESCE(ps.stock_actuel, 0) AS stock_actuel 
        FROM products p
        LEFT JOIN v_product_stock ps ON p.id = ps.product_id
        WHERE p.id = $1
      `, [product_id]);

      const availableStock = stockCheck.rows[0]?.stock_actuel || 0;

      // ❌ Rejeter si la quantité dépasse le stock disponible
      if (quantity > availableStock) {
        return res.status(400).json({
          error: `❌ Stock insuffisant. Disponible: ${availableStock}, Demandé: ${quantity}`
        });
      }
    }

    // --- Insertion du mouvement ---
    const result = await pool.query(`
      INSERT INTO inventory_movements (product_id, user_id, type, quantity, reason, source_location_id, destination_location_id)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id, product_id, user_id, type, quantity, reason, source_location_id, destination_location_id, created_at
    `, [product_id, user_id, movementType, quantity, reason || null, source_location_id || null, destination_location_id || null]);

    const movement = result.rows[0];
    movement.product_name = productExists.rows[0].name;

    res.status(201).json({
      message: "Mouvement enregistré avec succès",
      movement
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
      SELECT m.id, m.product_id, p.name AS product_name, p.category,
             m.user_id, u.full_name,
             m.type, m.quantity, m.reason, 
             m.source_location_id, ls.name as source_location_name,
             m.destination_location_id, ld.name as destination_location_name,
             m.created_at
      FROM inventory_movements m
      JOIN products p ON m.product_id = p.id
      JOIN users u ON m.user_id = u.id
      LEFT JOIN locations ls ON m.source_location_id = ls.id
      LEFT JOIN locations ld ON m.destination_location_id = ld.id
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

    // Also get total count for pagination
    let countQuery = `SELECT COUNT(*) AS total FROM inventory_movements m WHERE 1=1`;
    const countParams = [];
    if (product_id) {
      countQuery += ` AND m.product_id = $${countParams.length + 1}`;
      countParams.push(product_id);
    }
    if (type) {
      countQuery += ` AND m.type = $${countParams.length + 1}`;
      countParams.push(type.toUpperCase());
    }
    const countResult = await pool.query(countQuery, countParams);

    res.json({
      total: parseInt(countResult.rows[0].total),
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
      SELECT m.id, m.product_id, p.name AS product_name, p.category,
             m.user_id, u.full_name,
             m.type, m.quantity, m.reason,
             m.source_location_id, ls.name as source_location_name,
             m.destination_location_id, ld.name as destination_location_name,
             m.created_at
      FROM inventory_movements m
      JOIN products p ON m.product_id = p.id
      JOIN users u ON m.user_id = u.id
      LEFT JOIN locations ls ON m.source_location_id = ls.id
      LEFT JOIN locations ld ON m.destination_location_id = ld.id
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
      SELECT m.id, m.product_id, m.user_id, u.full_name, m.type, m.quantity, 
             m.reason, m.source_location_id, m.destination_location_id, m.created_at
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
