const pool = require('./src/db/pool');

async function fixViews() {
  try {
    console.log("🛠️ Ajout de la colonne target_stock et correction des Vues SQL...");

    await pool.query(`ALTER TABLE products ADD COLUMN IF NOT EXISTS target_stock INTEGER DEFAULT 0;`);

    // Pour CREATE OR REPLACE VIEW, si on modifie la structure, parfois CASCADE n'est pas nécessaire si on met à la fin. 
    // Mais vu  que j'ai eu l'erreur 2BP01 avant, je vais DROP CASCADE et tout recréer.
    await pool.query(`DROP VIEW IF EXISTS v_alerts_critical_products CASCADE;`);
    await pool.query(`DROP VIEW IF EXISTS v_product_stock CASCADE;`);

    await pool.query(`
      CREATE VIEW v_product_stock AS
      SELECT
        p.id AS product_id,
        p.name AS product_name,
        p.category,
        p.unit,
        p.min_threshold,
        p.target_stock,
        COALESCE(SUM(
          CASE
            WHEN m.type = 'ENTREE' THEN m.quantity
            WHEN m.type IN ('SORTIE', 'PERTE') THEN -m.quantity
          END
        ), 0) AS stock_actuel
      FROM products p
      LEFT JOIN inventory_movements m ON m.product_id = p.id
      GROUP BY p.id, p.name, p.category, p.unit, p.min_threshold, p.target_stock;
    `);

    await pool.query(`
      CREATE VIEW v_alerts_critical_products AS
      SELECT
        product_id,
        product_name,
        category,
        unit,
        min_threshold,
        target_stock,
        stock_actuel
      FROM v_product_stock
      WHERE stock_actuel <= min_threshold
      ORDER BY stock_actuel ASC;
    `);

    console.log("✅ Tables et Vues SQL corrigées avec succès !");
  } catch (err) {
    console.error("❌ SQL ERROR:", err);
  } finally {
    pool.end();
  }
}

fixViews();
