const pool = require("./pool");

/**
 * Script d'initialisation de la base de données
 * Crée les tables nécessaires si elles n'existent pas encore
 */
async function initializeDatabase() {
  try {
    console.log("🛠️ Initialisation des tables...");

    // 1. Création des ENUMS
    await pool.query(`
      CREATE TYPE IF NOT EXISTS user_role AS ENUM ('RESPONSABLE', 'EMPLOYE');
    `);

    await pool.query(`
      CREATE TYPE IF NOT EXISTS movement_type AS ENUM ('ENTREE', 'SORTIE', 'PERTE');
    `);

    // 2. Création de la table 'users'
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role user_role DEFAULT 'EMPLOYE',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 3. Création de la table 'products'
    await pool.query(`
      CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        category VARCHAR(50),
        unit VARCHAR(20),
        quantity INTEGER DEFAULT 0,
        min_threshold INTEGER DEFAULT 5,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 4. Création de la table 'inventory_movements'
    await pool.query(`
      CREATE TABLE IF NOT EXISTS inventory_movements (
        id SERIAL PRIMARY KEY,
        product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
        type movement_type NOT NULL,
        quantity INTEGER NOT NULL CHECK (quantity > 0),
        reason VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 5. Créer les indices pour les performances
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_movements_product_id ON inventory_movements(product_id);
    `);

    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_movements_user_id ON inventory_movements(user_id);
    `);

    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_movements_created_at ON inventory_movements(created_at);
    `);

    // 6. Créer la vue v_product_stock (calcul dynamique du stock)
    await pool.query(`
      CREATE OR REPLACE VIEW v_product_stock AS
      SELECT
        p.id AS product_id,
        p.name AS product_name,
        p.category,
        p.unit,
        p.min_threshold,
        COALESCE(SUM(
          CASE
            WHEN m.type = 'ENTREE' THEN m.quantity
            WHEN m.type IN ('SORTIE', 'PERTE') THEN -m.quantity
          END
        ), 0) AS stock_actuel
      FROM products p
      LEFT JOIN inventory_movements m ON m.product_id = p.id
      GROUP BY p.id, p.name, p.category, p.unit, p.min_threshold;
    `);

    // 7. Créer la vue v_alerts_critical_products (alertes seuil)
    await pool.query(`
      CREATE OR REPLACE VIEW v_alerts_critical_products AS
      SELECT
        product_id,
        product_name,
        min_threshold,
        stock_actuel
      FROM v_product_stock
      WHERE stock_actuel <= min_threshold
      ORDER BY stock_actuel ASC;
    `);

    console.log("✅ Initialisation terminée avec succès.");
    process.exit(0);
  } catch (error) {
    console.error("❌ Erreur lors de l'initialisation :", error.message);
    process.exit(1);
  }
}

initializeDatabase();
