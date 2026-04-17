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

    // 2. Produits Critiques avec consommation sur 30 jours
    const criticalQuery = `
      WITH consumption AS (
        SELECT product_id, COALESCE(SUM(quantity), 0) AS total_out
        FROM inventory_movements
        WHERE type IN ('SORTIE', 'PERTE') AND created_at >= NOW() - INTERVAL '30 days'
        GROUP BY product_id
      )
      SELECT 
        v.product_id,
        v.product_name,
        v.stock_actuel,
        v.min_threshold,
        v.target_stock,
        (v.target_stock - v.stock_actuel) AS quantity_needed,
        v.category,
        v.unit,
        COALESCE(c.total_out, 0) AS monthly_consumption
      FROM v_alerts_critical_products v
      LEFT JOIN consumption c ON v.product_id = c.product_id
      ORDER BY v.stock_actuel ASC
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
        p.category,
        u.full_name AS created_by
      FROM inventory_movements m
      JOIN products p ON m.product_id = p.id
      JOIN users u ON m.user_id = u.id
      ORDER BY m.created_at DESC
      LIMIT 10;
    `;

    // 5. Top Consommation (Produits avec plus de SORTIE)
    const topConsumptionQuery = `
      SELECT
        p.id,
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

    // 6. Mouvements par jour (7 derniers jours) pour graphique
    const movementsByDayQuery = `
      SELECT
        DATE(m.created_at) AS movement_date,
        m.type,
        SUM(m.quantity) AS daily_quantity,
        COUNT(*) AS count
      FROM inventory_movements m
      WHERE m.created_at >= NOW() - INTERVAL '7 days'
      GROUP BY DATE(m.created_at), m.type
      ORDER BY movement_date DESC;
    `;

    // Exécuter toutes les requêtes en parallèle
    const [statsResult, criticalResult, movementsResult, recentResult, consumptionResult, movementsByDayResult] = 
      await Promise.all([
        pool.query(statsQuery),
        pool.query(criticalQuery),
        pool.query(movementsQuery),
        pool.query(recentQuery),
        pool.query(topConsumptionQuery),
        pool.query(movementsByDayQuery)
      ]);

    // Formater les résultats
    const stats = statsResult.rows[0];
    const critical = criticalResult.rows;
    const movements = movementsResult.rows;
    const recent = recentResult.rows;
    const topConsumption = consumptionResult.rows;
    const movementsByDay = movementsByDayResult.rows;

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

        // Produits en alerte avec prévision de rupture
        critical_products: critical.map(p => {
          const cmd = parseInt(p.monthly_consumption) / 30; // Consommation Moyenne Journalière
          const daysToRupture = cmd > 0 ? Math.round(parseInt(p.stock_actuel) / cmd) : null;
          
          return {
            product_id: p.product_id,
            name: p.product_name,
            category: p.category,
            unit: p.unit,
            stock: parseInt(p.stock_actuel),
            threshold: parseInt(p.min_threshold),
            target_stock: parseInt(p.target_stock),
            needed: parseInt(p.quantity_needed) > 0 ? parseInt(p.quantity_needed) : 0,
            alert_level: parseInt(p.stock_actuel) <= parseInt(p.min_threshold) / 2 ? 'CRITIQUE' : 'ALERTE',
            days_to_rupture: daysToRupture
          };
        }),

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

        // Derniers mouvements
        recent_movements: recent.map(m => ({
          id: m.id,
          type: m.type,
          quantity: parseInt(m.quantity),
          product_name: m.product_name,
          category: m.category,
          created_by: m.created_by,
          reason: m.reason,
          created_at: m.created_at
        })),

        // Top consommation
        top_consumption: topConsumption.map(p => ({
          product_id: p.id,
          name: p.product_name,
          category: p.category,
          total_consumption: parseInt(p.total_consumption),
          total_entries: parseInt(p.total_entries),
          total_losses: parseInt(p.total_losses)
        })),

        // Mouvements par jour
        movements_by_day: movementsByDay.map(m => ({
          date: m.movement_date,
          type: m.type,
          quantity: parseInt(m.daily_quantity),
          count: parseInt(m.count)
        }))
      }
    });
  } catch (error) {
    console.error('Erreur getDashboardSummary:', error);
    res.status(500).json({
      status: 'error',
      error: 'Erreur lors de la récupération du dashboard',
      details: error.message
    });
  }
};

/**
 * GET /api/dashboard/stats
 * Récupère les statistiques détaillées
 */
exports.getDashboardStats = async (req, res, next) => {
  try {
    const days = parseInt(req.query.days) || 30;

    const query = `
      SELECT
        DATE(m.created_at) AS stat_date,
        m.type,
        SUM(m.quantity) AS total_quantity,
        COUNT(*) AS count_movements
      FROM inventory_movements m
      WHERE m.created_at >= NOW() - INTERVAL '${days} days'
      GROUP BY DATE(m.created_at), m.type
      ORDER BY stat_date DESC;
    `;

    const result = await pool.query(query);

    res.json({
      status: 'success',
      data: result.rows.map(r => ({
        date: r.stat_date,
        type: r.type,
        quantity: parseInt(r.total_quantity),
        count: parseInt(r.count_movements)
      }))
    });
  } catch (error) {
    console.error('Erreur getDashboardStats:', error);
    res.status(500).json({
      status: 'error',
      error: 'Erreur lors de la récupération des statistiques',
      details: error.message
    });
  }
};
