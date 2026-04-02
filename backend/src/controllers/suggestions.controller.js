const pool = require('../db/pool');

/**
 * Contrôleur pour le moteur de suggestions et d'aide à la décision.
 * Analyse les données historiques pour recommander des actions correctives.
 */

/**
 * GET /api/suggestions
 * Génère des recommandations métier simples basées sur des règles
 */
async function getSuggestions(req, res, next) {
  try {
    const suggestions = [];

    // ---------------------------------------------------------
    // Règle 1 : Flux de Rupture (Stock actuel <= Seuil critique)
    // Identifie les articles nécessitant un réapprovisionnement immédiat.
    // ---------------------------------------------------------
    const ruptureFreqQuery = `
      SELECT
        p.id AS product_id,
        p.name,
        p.category,
        ps.stock_actuel,
        ps.min_threshold,
        ps.target_stock,
        COALESCE(SUM(CASE WHEN m.type = 'SORTIE' THEN m.quantity ELSE 0 END), 0) AS sorties_30j
      FROM products p
      JOIN v_product_stock ps ON p.id = ps.product_id
      LEFT JOIN inventory_movements m ON m.product_id = p.id
        AND m.created_at >= NOW() - INTERVAL '30 days'
      WHERE ps.stock_actuel <= ps.min_threshold
      GROUP BY p.id, p.name, p.category, ps.stock_actuel, ps.min_threshold, ps.target_stock
      ORDER BY ps.stock_actuel ASC
      LIMIT 10
    `;
    const ruptureRes = await pool.query(ruptureFreqQuery);
    for (const row of ruptureRes.rows) {
      suggestions.push({
        type: 'RUPTURE_FREQUENTE',
        severity: parseInt(row.stock_actuel) === 0 ? 'HIGH' : 'MEDIUM',
        product_id: row.product_id,
        product_name: row.name,
        category: row.category,
        message: `⚠️ "${row.name}" est en stock critique (${row.stock_actuel} unités, seuil: ${row.min_threshold}). Envisagez une commande urgente.`,
        data: {
          stock_actuel: parseInt(row.stock_actuel),
          seuil: parseInt(row.min_threshold),
          cible: parseInt(row.target_stock),
          sorties_30j: parseInt(row.sorties_30j),
          quantite_recommandee: Math.max(parseInt(row.target_stock) - parseInt(row.stock_actuel), 0)
        }
      });
    }

    // ---------------------------------------------------------
    // Règle 2 : Analyse de l'efficacité (Taux de perte > 15% sur 30j)
    // Alerte sur les produits dont une part importante du flux finit à la poubelle.
    // ---------------------------------------------------------
    const pertesEleveesQuery = `
      SELECT
        p.id AS product_id,
        p.name,
        p.category,
        COALESCE(SUM(CASE WHEN m.type = 'PERTE'  THEN m.quantity ELSE 0 END), 0) AS pertes,
        COALESCE(SUM(CASE WHEN m.type = 'SORTIE' THEN m.quantity ELSE 0 END), 0) AS sorties,
        STRING_AGG(DISTINCT m.loss_reason, ', ') FILTER (WHERE m.loss_reason IS NOT NULL) AS motifs
      FROM products p
      JOIN inventory_movements m ON m.product_id = p.id
      WHERE m.created_at >= NOW() - INTERVAL '30 days'
        AND m.type IN ('PERTE', 'SORTIE')
      GROUP BY p.id, p.name, p.category
      HAVING 
        COALESCE(SUM(CASE WHEN m.type IN ('SORTIE','PERTE') THEN m.quantity ELSE 0 END), 0) > 5
        AND (
          100.0 * COALESCE(SUM(CASE WHEN m.type = 'PERTE' THEN m.quantity ELSE 0 END), 0) /
          NULLIF(COALESCE(SUM(CASE WHEN m.type IN ('SORTIE','PERTE') THEN m.quantity ELSE 0 END), 0), 0)
        ) > 15
      ORDER BY pertes DESC
      LIMIT 5
    `;
    const pertesRes = await pool.query(pertesEleveesQuery);
    for (const row of pertesRes.rows) {
      const tauxPerte = parseInt(row.sorties) + parseInt(row.pertes) > 0
        ? Math.round((parseInt(row.pertes) / (parseInt(row.sorties) + parseInt(row.pertes))) * 100)
        : 0;
      suggestions.push({
        type: 'PERTES_ELEVEES',
        severity: tauxPerte > 30 ? 'HIGH' : 'MEDIUM',
        product_id: row.product_id,
        product_name: row.name,
        category: row.category,
        message: `🔴 "${row.name}" a un taux de perte de ${tauxPerte}% sur 30 jours. Vérifiez les conditions de stockage.`,
        data: {
          pertes_30j: parseInt(row.pertes),
          sorties_30j: parseInt(row.sorties),
          taux_perte_pct: tauxPerte,
          motifs: row.motifs || 'Non spécifié'
        }
      });
    }

    // ---------------------------------------------------------
    // Règle 3 : Optimisation financière (Stock surdimensionné)
    // Identifie l'argent "dormant" : stock > 2× cible avec très peu de mouvement.
    // ---------------------------------------------------------
    const surdimensionneQuery = `
      SELECT
        p.id AS product_id,
        p.name,
        p.category,
        ps.stock_actuel,
        ps.target_stock,
        COALESCE(SUM(CASE WHEN m.type = 'SORTIE' THEN m.quantity ELSE 0 END), 0) AS sorties_30j
      FROM products p
      JOIN v_product_stock ps ON p.id = ps.product_id
      LEFT JOIN inventory_movements m ON m.product_id = p.id
        AND m.created_at >= NOW() - INTERVAL '30 days'
        AND m.type = 'SORTIE'
      WHERE ps.target_stock > 0
        AND ps.stock_actuel > (ps.target_stock * 2)
      GROUP BY p.id, p.name, p.category, ps.stock_actuel, ps.target_stock
      HAVING COALESCE(SUM(CASE WHEN m.type = 'SORTIE' THEN m.quantity ELSE 0 END), 0) < (ps.target_stock * 0.3)
      ORDER BY (ps.stock_actuel - ps.target_stock) DESC
      LIMIT 5
    `;
    const surdimRes = await pool.query(surdimensionneQuery);
    for (const row of surdimRes.rows) {
      suggestions.push({
        type: 'STOCK_SURDIMENSIONNE',
        severity: 'LOW',
        product_id: row.product_id,
        product_name: row.name,
        category: row.category,
        message: `📦 "${row.name}" a un stock excessif (${row.stock_actuel} vs cible ${row.target_stock}). Réduisez les prochaines commandes.`,
        data: {
          stock_actuel: parseInt(row.stock_actuel),
          stock_cible: parseInt(row.target_stock),
          sorties_30j: parseInt(row.sorties_30j),
          surplus: parseInt(row.stock_actuel) - parseInt(row.target_stock)
        }
      });
    }

    // ---------------------------------------------------------
    // Règle 4 : Ajustement des commandes (Entrées excédentaires)
    // Alerte si on continue de commander plus que ce qu'on consomme.
    // ---------------------------------------------------------
    const reduireCommandeQuery = `
      SELECT
        p.id AS product_id,
        p.name,
        p.category,
        ps.stock_actuel,
        ps.target_stock,
        COALESCE(SUM(CASE WHEN m.type = 'ENTREE' THEN m.quantity ELSE 0 END), 0) AS entrees_30j,
        COALESCE(SUM(CASE WHEN m.type = 'SORTIE' THEN m.quantity ELSE 0 END), 0) AS sorties_30j
      FROM products p
      JOIN v_product_stock ps ON p.id = ps.product_id
      JOIN inventory_movements m ON m.product_id = p.id
        AND m.created_at >= NOW() - INTERVAL '30 days'
      GROUP BY p.id, p.name, p.category, ps.stock_actuel, ps.target_stock
      HAVING 
        COALESCE(SUM(CASE WHEN m.type = 'SORTIE' THEN m.quantity ELSE 0 END), 0) > 0
        AND COALESCE(SUM(CASE WHEN m.type = 'ENTREE' THEN m.quantity ELSE 0 END), 0) > 
            (COALESCE(SUM(CASE WHEN m.type = 'SORTIE' THEN m.quantity ELSE 0 END), 0) * 2)
        AND ps.stock_actuel > ps.target_stock
      ORDER BY (COALESCE(SUM(CASE WHEN m.type = 'ENTREE' THEN m.quantity ELSE 0 END), 0) - COALESCE(SUM(CASE WHEN m.type = 'SORTIE' THEN m.quantity ELSE 0 END), 0)) DESC
      LIMIT 5
    `;
    const reduireRes = await pool.query(reduireCommandeQuery);
    for (const row of reduireRes.rows) {
      suggestions.push({
        type: 'REDUIRE_COMMANDE',
        severity: 'LOW',
        product_id: row.product_id,
        product_name: row.name,
        category: row.category,
        message: `📉 "${row.name}" : les entrées (${row.entrees_30j}) dépassent largement les sorties (${row.sorties_30j}) sur 30j. Réduisez les prochaines quantités commandées.`,
        data: {
          entrees_30j: parseInt(row.entrees_30j),
          sorties_30j: parseInt(row.sorties_30j),
          stock_actuel: parseInt(row.stock_actuel),
          stock_cible: parseInt(row.target_stock)
        }
      });
    }

    // ---------------------------------------------------------
    // Règle 5 : Prévisions intelligentes (Jours avant rupture)
    // Calcule la durée de vie du stock restant basée sur la consommation moyenne journalière.
    // ---------------------------------------------------------
    const previsionQuery = `
      WITH daily_consumption AS (
        SELECT
          product_id,
          SUM(quantity) / 30.0 AS cmd
        FROM inventory_movements
        WHERE type IN ('SORTIE', 'PERTE')
          AND created_at >= NOW() - INTERVAL '30 days'
        GROUP BY product_id
      )
      SELECT
        p.id AS product_id,
        p.name,
        p.category,
        ps.stock_actuel,
        ps.min_threshold,
        dc.cmd AS consommation_jour,
        CASE
          WHEN dc.cmd > 0 THEN ROUND(ps.stock_actuel / dc.cmd)
          ELSE NULL
        END AS jours_avant_rupture
      FROM products p
      JOIN v_product_stock ps ON p.id = ps.product_id
      JOIN daily_consumption dc ON dc.product_id = p.id
      WHERE dc.cmd > 0
        AND ps.stock_actuel > ps.min_threshold
        AND (ps.stock_actuel / dc.cmd) <= 14
      ORDER BY jours_avant_rupture ASC
      LIMIT 5
    `;
    const previsionRes = await pool.query(previsionQuery);
    for (const row of previsionRes.rows) {
      const jours = parseInt(row.jours_avant_rupture);
      suggestions.push({
        type: 'RUPTURE_PREVUE',
        severity: jours <= 3 ? 'HIGH' : jours <= 7 ? 'MEDIUM' : 'LOW',
        product_id: row.product_id,
        product_name: row.name,
        category: row.category,
        message: `📅 "${row.name}" : rupture estimée dans ${jours} jour(s) (consommation ~${Math.round(row.consommation_jour * 10) / 10}/j).`,
        data: {
          stock_actuel: parseInt(row.stock_actuel),
          seuil: parseInt(row.min_threshold),
          consommation_journaliere: Math.round(parseFloat(row.consommation_jour) * 10) / 10,
          jours_avant_rupture: jours
        }
      });
    }

    // Trier les recommandations par niveau d'urgence (HIGH > MEDIUM > LOW)
    const severityOrder = { HIGH: 0, MEDIUM: 1, LOW: 2 };
    suggestions.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);

    res.json({
      status: 'success',
      count: suggestions.length,
      suggestions
    });
  } catch (error) {
    next(error);
  }
}

module.exports = { getSuggestions };
