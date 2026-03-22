-- ==========================================================
--  Addition: Purchase Orders (Bons de Commande)
-- ==========================================================

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'po_status') THEN
        CREATE TYPE po_status AS ENUM ('BROUILLON', 'VALIDEE', 'RECUE', 'ANNULEE');
    END IF;
END $$;

-- Table : purchase_orders
CREATE TABLE IF NOT EXISTS purchase_orders (
  id            SERIAL PRIMARY KEY,
  user_id       INTEGER NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  status        po_status NOT NULL DEFAULT 'BROUILLON',
  description   VARCHAR(255),
  created_at    TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Table : purchase_order_items
CREATE TABLE IF NOT EXISTS purchase_order_items (
  id                SERIAL PRIMARY KEY,
  purchase_order_id INTEGER NOT NULL REFERENCES purchase_orders(id) ON DELETE CASCADE,
  product_id        INTEGER NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  quantity          INTEGER NOT NULL CHECK (quantity > 0),
  price_estimated   DECIMAL(10,2) DEFAULT 0,
  created_at        TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS tr_update_po_updated_at ON purchase_orders;
CREATE TRIGGER tr_update_po_updated_at
BEFORE UPDATE ON purchase_orders
FOR EACH ROW
EXECUTE PROCEDURE update_updated_at_column();
