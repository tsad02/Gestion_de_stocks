const pool = require("../src/db/pool");

async function restoreSchema() {
    const client = await pool.connect();
    try {
        console.log("🚀 Démarrage de la restauration du schéma de base de données...");
        await client.query("BEGIN");

        // 1. Ajouter le type TRANSFERT à l'ENUM movement_type
        console.log("🔹 Mise à jour de l'ENUM movement_type...");
        await client.query(`
            DO $$ 
            BEGIN 
                IF NOT EXISTS (SELECT 1 FROM pg_type t JOIN pg_enum e ON t.oid = e.enumtypid WHERE t.typname = 'movement_type' AND e.enumlabel = 'TRANSFERT') THEN
                    ALTER TYPE movement_type ADD VALUE 'TRANSFERT';
                END IF;
            END $$;
        `);

        // 2. Créer la table 'locations'
        console.log("🔹 Création de la table 'locations'...");
        await client.query(`
            CREATE TABLE IF NOT EXISTS locations (
                id SERIAL PRIMARY KEY,
                name VARCHAR(100) UNIQUE NOT NULL,
                description TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // 3. Mettre à jour la table 'products'
        console.log("🔹 Mise à jour de la table 'products'...");
        await client.query(`
            ALTER TABLE products ADD COLUMN IF NOT EXISTS target_stock INTEGER DEFAULT 0;
        `);

        // 4. Mettre à jour la table 'inventory_movements'
        console.log("🔹 Mise à jour de la table 'inventory_movements'...");
        await client.query(`
            ALTER TABLE inventory_movements ADD COLUMN IF NOT EXISTS source_location_id INTEGER REFERENCES locations(id) ON DELETE SET NULL;
            ALTER TABLE inventory_movements ADD COLUMN IF NOT EXISTS destination_location_id INTEGER REFERENCES locations(id) ON DELETE SET NULL;
        `);

        // 5. Recréer les vues (v_product_stock et v_alerts_critical_products)
        console.log("🔹 Mise à jour des vues de stock...");
        
        // v_product_stock: On ignore les TRANSFERTs car ils ne changent pas le volume total, juste la localisation
        await client.query(`
            CREATE OR REPLACE VIEW v_product_stock AS
            SELECT
                p.id AS product_id,
                p.id, -- Alias pour DataTable
                p.name AS product_name,
                p.name, -- Alias pour DataTable
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

        await client.query(`
            CREATE OR REPLACE VIEW v_alerts_critical_products AS
            SELECT
                product_id,
                product_name,
                min_threshold,
                target_stock,
                stock_actuel
            FROM v_product_stock
            WHERE stock_actuel <= min_threshold
            ORDER BY stock_actuel ASC;
        `);

        // 6. Créer la table 'purchase_orders'
        console.log("🔹 Création de la table 'purchase_orders'...");
        await client.query(`
            CREATE TABLE IF NOT EXISTS purchase_orders (
                id SERIAL PRIMARY KEY,
                user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
                description TEXT,
                status VARCHAR(50) DEFAULT 'BROUILLON',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // 7. Créer la table 'purchase_order_items'
        console.log("🔹 Création de la table 'purchase_order_items'...");
        await client.query(`
            CREATE TABLE IF NOT EXISTS purchase_order_items (
                id SERIAL PRIMARY KEY,
                purchase_order_id INTEGER NOT NULL REFERENCES purchase_orders(id) ON DELETE CASCADE,
                product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
                quantity INTEGER NOT NULL CHECK (quantity > 0),
                price_estimated DECIMAL(10, 2) DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // 8. Créer la table 'audit_logs'
        console.log("🔹 Création de la table 'audit_logs'...");
        await client.query(`
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

        await client.query("COMMIT");
        console.log("✅ BRAVO ! Le schéma de la base de données a été restauré avec succès.");
        process.exit(0);
    } catch (err) {
        await client.query("ROLLBACK");
        console.error("❌ ERREUR CRITIQUE lors de la restauration :", err.message);
        process.exit(1);
    } finally {
        client.release();
    }
}

restoreSchema();
