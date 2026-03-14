const pool = require('../db/pool');

/**
 * GET /api/dashboard/summary
 * Récupère toutes les données du dashboard
 */
exports.getDashboardSummary = async (req, res, next) => {
  try {
    // 1. Total Produits & En Alerte
    const statsQuery = `
      SELECT
        COUNT(DISTINCT p.id) AS total_produits,
        COUNT(DISTINCT CASE WHEN ps.stock_actuel <= p.min_threshold THEN p.id END) AS produits_en_alerte,
        COUNT(DISTINCT CASE WHEN ps.stock_actuel = 0 THEN p.id END) AS produits_rupture,
        COALESCE(SUM(ps.stock_actuel), 0) AS stock_total,
        COALESCE(AVG(ps.stock_actuel), 0)::NUMERIC(10,2) AS stock_moyen
      FROM products p
      LEFT JOIN v_product_stock ps ON p.id = ps.product_id;
    `;

    // 2. Produits Critiques
    const criticalQuery = `
      SELECT 
        product_id,
        product_name,
        stock_actuel,
        min_threshold,
        (min_threshold - stock_actuel) AS quantity_needed,
        category
      FROM v_alerts_critical_products
      ORDER BY stock_actuel ASC
      LIMIT 10;
    `;

    // 3. Statistiques Mouvements (7 derniers jours)
    const movementsQuery = `
      SELECT
        m.type,
        COUNT(*) AS count_movements,
        SUM(m.quantity) AS total_quantity,
        COUNT(DISTINCT m.product_id) AS distinct_products
      FROM inventory_movements m
      WHERE m.created_at >= NOW() - INTERVAL '7 days'
      GROUP BY m.type
      ORDER BY m.type;
    `;

    // 4. Derniers Mouvements (10)
    const recentQuery = `
      SELECT
        m.id,
        m.type,
        m.quantity,
        m.reason,
        m.created_at,
        p.name AS product_name,
        u.username
      FROM inventory_movements m
      JOIN products p ON m.product_id = p.id
      JOIN users u ON m.user_id = u.id
      ORDER BY m.created_at DESC
      LIMIT 10;
    `;

    // 5. Top Consommation (Produits avec plus de SORTIE)
    const topConsumptionQuery = `
      SELECT
        p.name AS product_name,
        p.category,
        COALESCE(SUM(
          CASE WHEN m.type = 'SORTIE' THEN m.quantity ELSE 0 END
        ), 0) AS total_consumption,
        COALESCE(SUM(
          CASE WHEN m.type = 'ENTREE' THEN m.quantity ELSE 0 END
        ), 0) AS total_entries,
        COALESCE(SUM(
          CASE WHEN m.type = 'PERTE' THEN m.quantity ELSE 0 END
        ), 0) AS total_losses
      FROM products p
      LEFT JOIN inventory_movements m ON p.id = m.product_id
      WHERE m.created_at >= NOW() - INTERVAL '30 days' OR m.id IS NULL
      GROUP BY p.id, p.name, p.category
      ORDER BY total_consumption DESC
      LIMIT 5;
    `;

    // Exécuter toutes les requêtes en parallèle
    const [statsResult, criticalResult, movementsResult, recentResult, consumptionResult] = 
      await Promise.all([
        pool.query(statsQuery),
        pool.query(criticalQuery),
        pool.query(movementsQuery),
        pool.query(recentQuery),
        pool.query(topConsumptionQuery)
      ]);

    // Formater les résultats
    const stats = statsResult.rows[0];
    const critical = criticalResult.rows;
    const movements = movementsResult.rows;
    const recent = recentResult.rows;
    const topConsumption = consumptionResult.rows;

    // Calculer statistiques mouvements
    const movementStats = {
      ENTREE: movements.find(m => m.type === 'ENTREE') || { count_movements: 0, total_quantity: 0 },
      SORTIE: movements.find(m => m.type === 'SORTIE') || { count_movements: 0, total_quantity: 0 },
      PERTE: movements.find(m => m.type === 'PERTE') || { count_movements: 0, total_quantity: 0 }
    };

    res.json({
      status: 'success',
      timestamp: new Date().toISOString(),
      data: {
        // Stats globales
        summary: {
          total_produits: parseInt(stats.total_produits),
          produits_en_alerte: parseInt(stats.produits_en_alerte),
          produits_rupture: parseInt(stats.produits_rupture),
          stock_total: parseInt(stats.stock_total),
          stock_moyen: parseFloat(stats.stock_moyen)
        },

        // Produits en alerte
        critical_products: critical.map(p => ({
          product_id: p.product_id,
          name: p.product_name,
          category: p.category,
          stock: parseInt(p.stock_actuel),
          threshold: parseInt(p.min_threshold),
          needed: parseInt(p.quantity_needed),
          alert_level: parseInt(p.stock_actuel) <= parseInt(p.min_threshold) / 2 ? 'CRITICAL' : 'WARNING'
        })),

        // Statistiques 7 jours
        movements_7days: {
          entries: {
            count: parseInt(movementStats.ENTREE.count_movements || 0),
            quantity: parseInt(movementStats.ENTREE.total_quantity || 0)
          },
          exits: {
            count: parseInt(movementStats.SORTIE.count_movements || 0),
            quantity: parseInt(movementStats.SORTIE.total_quantity || 0)
          },
          losses: {
            count: parseInt(movementStats.PERTE.count_movements || 0),
            quantity: parseInt(movementStats.PERTE.total_quantity || 0)
          }
        },

        // Top consommation
        top_consumption: topConsumption.map(p => ({
          name: p.product_name,
          category: p.category,
          consumption: parseInt(p.total_consumption),
          entries: parseInt(p.total_entries),
          losses: parseInt(p.total_losses)
        })),

        // Derniers mouvements
        recent_movements: recent.map(m => ({
          id: m.id,
          product_name: m.product_name,
          type: m.type,
          quantity: parseInt(m.quantity),
          reason: m.reason,
          username: m.username,
          timestamp: m.created_at
        }))
      }
    });

  } catch (error) {
    console.error('Dashboard error:', error);
    next(error);
  }
};

/**
 * GET /api/dashboard/stats
 * Alternative endpoint pour statistiques détaillées
 */
exports.getDashboardStats = async (req, res, next) => {
  try {
    const { days = 30 } = req.query;

    const query = `
      SELECT
        DATE_TRUNC('day', m.created_at)::DATE AS date,
        m.type,
        COUNT(*) AS count,
        SUM(m.quantity) AS total_quantity
      FROM inventory_movements m
      WHERE m.created_at >= NOW() - INTERVAL '${parseInt(days)} days'
      GROUP BY DATE_TRUNC('day', m.created_at), m.type
      ORDER BY date DESC, m.type;
    `;

    const result = await pool.query(query);

    res.json({
      status: 'success',
      period_days: parseInt(days),
      data: result.rows.map(row => ({
        date: row.date,
        type: row.type,
        count: parseInt(row.count),
        quantity: parseInt(row.total_quantity)
      }))
    });

  } catch (error) {
    console.error('Stats error:', error);
    next(error);
  }
};
