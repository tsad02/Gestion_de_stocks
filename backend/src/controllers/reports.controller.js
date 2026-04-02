const pool = require('../db/pool');

/**
 * Contrôleur de reporting pour le suivi des performances de l'inventaire.
 * Génère des statistiques sur les mouvements, les pertes et les ajustements.
 */

/**
 * GET /api/reports
 * Génère un rapport périodique sur les mouvements d'inventaire
 * Query param: period = daily | weekly | monthly | annual
 */
async function getReport(req, res, next) {
  try {
    const { period = 'monthly' } = req.query;

    // Calculer l'intervalle de temps (PostgreSQL INTERVAL)
    // Permet de filtrer les mouvements sur la période glissante souhaitée
    const intervals = {
      daily:   '1 day',
      weekly:  '7 days',
      monthly: '30 days',
      annual:  '365 days'
    };

    const interval = intervals[period];
    if (!interval) {
      return res.status(400).json({
        error: "Période invalide. Valeurs: daily, weekly, monthly, annual"
      });
    }

    // --- Section 1 : Totaux globaux des mouvements ---
    // Calcule la somme des quantités pour chaque type de flux sur la période
    const totalsQuery = `
      SELECT
        COALESCE(SUM(CASE WHEN type = 'ENTREE'   THEN quantity ELSE 0 END), 0) AS total_entrees,
        COALESCE(SUM(CASE WHEN type = 'SORTIE'   THEN quantity ELSE 0 END), 0) AS total_sorties,
        COALESCE(SUM(CASE WHEN type = 'PERTE'    THEN quantity ELSE 0 END), 0) AS total_pertes,
        COALESCE(SUM(CASE WHEN type = 'TRANSFERT'    THEN quantity ELSE 0 END), 0) AS total_transferts,
        COALESCE(SUM(CASE WHEN type = 'AJUSTEMENT'   THEN quantity ELSE 0 END), 0) AS total_ajustements,
        COUNT(*) AS total_mouvements
      FROM inventory_movements
      WHERE created_at >= NOW() - INTERVAL '${interval}'
    `;

    // --- Section 2 : Top produits les plus consommés (Sorties) ---
    // Identifie les articles à fort roulement
    const topSortisQuery = `
      SELECT
        p.id AS product_id,
        p.name AS product_name,
        p.category,
        p.unit,
        COALESCE(SUM(m.quantity), 0) AS total_sorties
      FROM products p
      JOIN inventory_movements m ON m.product_id = p.id
      WHERE m.type = 'SORTIE' AND m.created_at >= NOW() - INTERVAL '${interval}'
      GROUP BY p.id, p.name, p.category, p.unit
      ORDER BY total_sorties DESC
      LIMIT 5
    `;

    // --- Section 3 : Top produits les plus perdus (Gaspillage) ---
    // Aide à identifier les produits avec des problèmes de stock/expiration
    const topPertesQuery = `
      SELECT
        p.id AS product_id,
        p.name AS product_name,
        p.category,
        p.unit,
        COALESCE(SUM(m.quantity), 0) AS total_pertes,
        STRING_AGG(DISTINCT m.loss_reason, ', ') FILTER (WHERE m.loss_reason IS NOT NULL) AS motifs
      FROM products p
      JOIN inventory_movements m ON m.product_id = p.id
      WHERE m.type = 'PERTE' AND m.created_at >= NOW() - INTERVAL '${interval}'
      GROUP BY p.id, p.name, p.category, p.unit
      ORDER BY total_pertes DESC
      LIMIT 5
    `;

    // --- Section 4 : Causes de pertes les plus fréquentes ---
    // Permet d'agir sur la source du gaspillage (ex: si 'expiré' est en haut, revoir les rotations)
    const causesQuery = `
      SELECT
        loss_reason,
        COUNT(*) AS nb_occurrences,
        SUM(quantity) AS quantite_totale
      FROM inventory_movements
      WHERE type = 'PERTE'
        AND loss_reason IS NOT NULL
        AND created_at >= NOW() - INTERVAL '${interval}'
      GROUP BY loss_reason
      ORDER BY nb_occurrences DESC
    `;

    // 5. Mouvements (par jour) sur la période
    const byDayQuery = `
      SELECT
        DATE(created_at) AS date,
        type,
        SUM(quantity) AS quantite,
        COUNT(*) AS nb_mouvements
      FROM inventory_movements
      WHERE created_at >= NOW() - INTERVAL '${interval}'
      GROUP BY DATE(created_at), type
      ORDER BY date DESC
    `;

    // --- Section 6 : Fréquence des ajustements ---
    // Un nombre élevé d'ajustements peut indiquer des erreurs de saisie ou des vols/écarts non tracés
    const adjustmentsQuery = `
      SELECT
        p.id AS product_id,
        p.name AS product_name,
        p.category,
        COUNT(*) AS nb_ajustements,
        SUM(m.quantity) AS quantite_totale
      FROM inventory_movements m
      JOIN products p ON p.id = m.product_id
      WHERE m.type = 'AJUSTEMENT' AND m.created_at >= NOW() - INTERVAL '${interval}'
      GROUP BY p.id, p.name, p.category
      ORDER BY nb_ajustements DESC
      LIMIT 10
    `;

    // --- Section 7 : Taux de perte par produit (pertes / flux sortant total) ---
    // Met en évidence les produits les plus problématiques Proportionnellement à leur volume
    const lossRateQuery = `
      SELECT
        p.id AS product_id,
        p.name AS product_name,
        p.category,
        COALESCE(SUM(CASE WHEN m.type = 'PERTE'  THEN m.quantity ELSE 0 END), 0) AS pertes,
        COALESCE(SUM(CASE WHEN m.type = 'SORTIE' THEN m.quantity ELSE 0 END), 0) AS sorties,
        CASE
          WHEN COALESCE(SUM(CASE WHEN m.type IN ('SORTIE','PERTE') THEN m.quantity ELSE 0 END), 0) > 0
          THEN ROUND(
            100.0 * COALESCE(SUM(CASE WHEN m.type = 'PERTE' THEN m.quantity ELSE 0 END), 0) /
            COALESCE(SUM(CASE WHEN m.type IN ('SORTIE','PERTE') THEN m.quantity ELSE 0 END), 1),
            1)
          ELSE 0
        END AS taux_perte_pct
      FROM products p
      LEFT JOIN inventory_movements m ON m.product_id = p.id
        AND m.created_at >= NOW() - INTERVAL '${interval}'
      GROUP BY p.id, p.name, p.category
      HAVING COALESCE(SUM(CASE WHEN m.type IN ('SORTIE','PERTE') THEN m.quantity ELSE 0 END), 0) > 0
      ORDER BY taux_perte_pct DESC
      LIMIT 10
    `;

    // Exécuter toutes les requêtes en parallèle
    const [totalsRes, topSortisRes, topPertesRes, causesRes, byDayRes, adjustmentsRes, lossRateRes] =
      await Promise.all([
        pool.query(totalsQuery),
        pool.query(topSortisQuery),
        pool.query(topPertesQuery),
        pool.query(causesQuery),
        pool.query(byDayQuery),
        pool.query(adjustmentsQuery),
        pool.query(lossRateQuery)
      ]);

    const totals = totalsRes.rows[0];
    const totalSortiesPlusPertes = parseInt(totals.total_sorties) + parseInt(totals.total_pertes);
    const tauxPerte = totalSortiesPlusPertes > 0
      ? Math.round((parseInt(totals.total_pertes) / totalSortiesPlusPertes) * 1000) / 10
      : 0;

    res.json({
      status: 'success',
      period,
      generated_at: new Date().toISOString(),
      data: {
        totaux: {
          entrees:     parseInt(totals.total_entrees),
          sorties:     parseInt(totals.total_sorties),
          pertes:      parseInt(totals.total_pertes),
          transferts:  parseInt(totals.total_transferts),
          ajustements: parseInt(totals.total_ajustements),
          total_mouvements: parseInt(totals.total_mouvements),
          taux_perte_pct: tauxPerte
        },
        top_produits_sortis: topSortisRes.rows.map(r => ({
          ...r,
          total_sorties: parseInt(r.total_sorties)
        })),
        top_produits_perdus: topPertesRes.rows.map(r => ({
          ...r,
          total_pertes: parseInt(r.total_pertes)
        })),
        causes_pertes: causesRes.rows.map(r => ({
          motif: r.loss_reason,
          occurrences: parseInt(r.nb_occurrences),
          quantite: parseInt(r.quantite_totale)
        })),
        mouvements_par_jour: byDayRes.rows.map(r => ({
          date: r.date,
          type: r.type,
          quantite: parseInt(r.quantite),
          nb: parseInt(r.nb_mouvements)
        })),
        ajustements_frequents: adjustmentsRes.rows.map(r => ({
          ...r,
          nb_ajustements: parseInt(r.nb_ajustements),
          quantite_totale: parseInt(r.quantite_totale)
        })),
        taux_perte_par_produit: lossRateRes.rows.map(r => ({
          product_id: r.product_id,
          nom: r.product_name,
          categorie: r.category,
          pertes: parseInt(r.pertes),
          sorties: parseInt(r.sorties),
          taux_perte_pct: parseFloat(r.taux_perte_pct)
        }))
      }
    });
  } catch (error) {
    next(error);
  }
}

module.exports = { getReport };
