const pool = require("./pool");

/**
 * Automigration pour les fonctionnalités d'entreprise
 * Restaure les tables et colonnes manquantes
 */
async function autoMigrate() {
    try {
        console.log("🛠️ Vérification du schéma (Enterprise Features)...");
        
        // 1. movement_type ENUM
        await pool.query(`
            DO $$ 
            BEGIN 
                IF NOT EXISTS (SELECT 1 FROM pg_type t JOIN pg_enum e ON t.oid = e.enumtypid WHERE t.typname = 'movement_type' AND e.enumlabel = 'TRANSFERT') THEN
                    ALTER TYPE movement_type ADD VALUE 'TRANSFERT';
                END IF;
            END $$;
        `);

        // 2. locations
        await pool.query(`
            CREATE TABLE IF NOT EXISTS locations (
                id SERIAL PRIMARY KEY,
                name VARCHAR(100) UNIQUE NOT NULL,
                description TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // 3. products columns
        await pool.query(`
            ALTER TABLE products ADD COLUMN IF NOT EXISTS target_stock INTEGER DEFAULT 0;
        `);

        // 4. inventory_movements columns
        await pool.query(`
            ALTER TABLE inventory_movements ADD COLUMN IF NOT EXISTS source_location_id INTEGER REFERENCES locations(id) ON DELETE SET NULL;
            ALTER TABLE inventory_movements ADD COLUMN IF NOT EXISTS destination_location_id INTEGER REFERENCES locations(id) ON DELETE SET NULL;
        `);

        // 5. Views
        console.log("🔹 Mise à jour des vues de stock...");
        
        // On supprime d'abord les vues existantes car Postgres ne permet pas de changer 
        // les colonnes d'une vue avec CREATE OR REPLACE VIEW
        await pool.query("DROP VIEW IF EXISTS v_alerts_critical_products CASCADE");
        await pool.query("DROP VIEW IF EXISTS v_product_stock CASCADE");

        // v_product_stock: On ignore les TRANSFERTs car ils ne changent pas le volume total, juste la localisation
        await pool.query(`
            CREATE VIEW v_product_stock AS
            SELECT
                p.id AS product_id,
                p.id AS id, -- Alias explicite pour DataTable
                p.name AS product_name,
                p.name AS name, -- Alias explicite pour DataTable
                p.category,
                p.unit,
                p.min_threshold,
                p.target_stock,
                COALESCE(SUM(
                    CASE
                        WHEN m.type = 'ENTREE' THEN m.quantity
                        WHEN m.type IN ('SORTIE', 'PERTE') THEN -m.quantity
                        ELSE 0
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

        // 6. purchase_orders
        await pool.query(`
            CREATE TABLE IF NOT EXISTS purchase_orders (
                id SERIAL PRIMARY KEY,
                user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
                description TEXT,
                status VARCHAR(50) DEFAULT 'BROUILLON',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // 7. purchase_order_items
        await pool.query(`
            CREATE TABLE IF NOT EXISTS purchase_order_items (
                id SERIAL PRIMARY KEY,
                purchase_order_id INTEGER NOT NULL REFERENCES purchase_orders(id) ON DELETE CASCADE,
                product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
                quantity INTEGER NOT NULL CHECK (quantity > 0),
                price_estimated DECIMAL(10, 2) DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // 8. audit_logs
        await pool.query(`
            CREATE TABLE IF NOT EXISTS audit_logs (
                id SERIAL PRIMARY KEY,
                user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
                action VARCHAR(50) NOT NULL,
                entity VARCHAR(50) NOT NULL,
                entity_id INTEGER,
                details JSONB,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        console.log("✅ Schéma Enterprise à jour.");
    } catch (err) {
        console.error("❌ Erreur autoMigrate:", err.message);
    }
}

module.exports = autoMigrate;
