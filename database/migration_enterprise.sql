-- Migration pour les fonctionnalités d'entreprise (Semaine 9)
-- 1. Ajout de l'enum TRANSFERT
ALTER TYPE movement_type ADD VALUE IF NOT EXISTS 'TRANSFERT';

-- 2. Création de la table locations
CREATE TABLE IF NOT EXISTS locations (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  description VARCHAR(255),
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Insertion de localisations par défaut
INSERT INTO locations (name, description) VALUES
('Réserve Principale', 'Stockage principal des marchandises'),
('Cuisine', 'Zone de préparation'),
('Comptoir', 'Zone de vente et service')
ON CONFLICT (name) DO NOTHING;

-- 3. Mise à jour de la table products
ALTER TABLE products ADD COLUMN IF NOT EXISTS target_stock INTEGER NOT NULL DEFAULT 0 CHECK (target_stock >= 0);

-- 4. Mise à jour de la table inventory_movements
ALTER TABLE inventory_movements ADD COLUMN IF NOT EXISTS source_location_id INTEGER REFERENCES locations(id) ON DELETE SET NULL;
ALTER TABLE inventory_movements ADD COLUMN IF NOT EXISTS destination_location_id INTEGER REFERENCES locations(id) ON DELETE SET NULL;

-- 5. Création de la table audit_logs
CREATE TABLE IF NOT EXISTS audit_logs (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  action VARCHAR(100) NOT NULL,
  entity VARCHAR(100) NOT NULL,
  entity_id INTEGER,
  details JSONB,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);

-- 6. Recréation des vues
-- DROP des vues dans le bon ordre
DROP VIEW IF EXISTS v_dashboard_json CASCADE;
DROP VIEW IF EXISTS v_dashboard_kpis CASCADE;
DROP VIEW IF EXISTS v_alerts_critical_products CASCADE;
DROP VIEW IF EXISTS v_product_stock CASCADE;
DROP VIEW IF EXISTS v_last_movements CASCADE;

-- 6.1 View : Stock actuel (ignorer les TRANSFERT pour le stock global)
CREATE VIEW v_product_stock AS
SELECT
  p.id            AS product_id,
  p.name          AS product_name,
  p.category,
  p.unit,
  p.min_threshold,
  p.target_stock,
  COALESCE(SUM(
    CASE
      WHEN m.type = 'ENTREE' THEN m.quantity
      WHEN m.type IN ('SORTIE', 'PERTE') THEN -m.quantity
      ELSE 0 -- TRANSFERT ne change pas le stock global
    END
  ), 0) AS stock_actuel
FROM products p
LEFT JOIN inventory_movements m ON m.product_id = p.id
GROUP BY p.id, p.name, p.category, p.unit, p.min_threshold, p.target_stock;

-- 6.2 View : Alertes (avec target_stock)
CREATE OR REPLACE VIEW v_alerts_critical_products AS
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

-- 6.3 KPI (avec target_stock possible si besoin, on garde l'existant)
CREATE OR REPLACE VIEW v_dashboard_kpis AS
SELECT
  (SELECT COUNT(*) FROM products) AS total_produits,
  (SELECT COUNT(*) FROM v_alerts_critical_products) AS produits_critiques,
  (SELECT COALESCE(SUM(quantity), 0)
   FROM inventory_movements
   WHERE type = 'ENTREE' AND created_at >= NOW() - INTERVAL '7 days') AS entrees_7j,
  (SELECT COALESCE(SUM(quantity), 0)
   FROM inventory_movements
   WHERE type = 'SORTIE' AND created_at >= NOW() - INTERVAL '7 days') AS sorties_7j,
  (SELECT COALESCE(SUM(quantity), 0)
   FROM inventory_movements
   WHERE type = 'PERTE' AND created_at >= NOW() - INTERVAL '7 days') AS pertes_7j;

-- 6.4 Derniers mouvements
CREATE OR REPLACE VIEW v_last_movements AS
SELECT
  m.id,
  m.created_at,
  m.type,
  m.quantity,
  m.reason,
  p.name AS product_name,
  p.category AS product_category,
  u.full_name AS done_by
FROM inventory_movements m
JOIN products p ON p.id = m.product_id
JOIN users u ON u.id = m.user_id
ORDER BY m.created_at DESC
LIMIT 10;

-- 6.5 JSON Dashboard
CREATE OR REPLACE VIEW v_dashboard_json AS
SELECT jsonb_build_object(
  'kpis', (SELECT to_jsonb(k) FROM v_dashboard_kpis k),
  'derniers_mouvements', (
    SELECT COALESCE(jsonb_agg(to_jsonb(lm)), '[]'::jsonb)
    FROM v_last_movements lm
  ),
  'produits_critiques', (
    SELECT COALESCE(jsonb_agg(to_jsonb(cp)), '[]'::jsonb)
    FROM v_alerts_critical_products cp
  )
) AS dashboard;
