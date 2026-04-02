-- ==========================================================
--  MIGRATION V2 — Gestion de Stocks
--  Ajouts : AJUSTEMENT, loss_reason, loss_comment,
--           location_id produit, vues reconstruites
--  ⚠️  Script 100% additif : aucune donnée supprimée
-- ==========================================================

-- ----------------------------------------------------------
-- 1) Nouveau type de mouvement : AJUSTEMENT
-- ----------------------------------------------------------
DO $$
BEGIN
  -- Ajoute la valeur seulement si elle n'existe pas encore
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum e
    JOIN pg_type t ON t.oid = e.enumtypid
    WHERE t.typname = 'movement_type' AND e.enumlabel = 'AJUSTEMENT'
  ) THEN
    ALTER TYPE movement_type ADD VALUE 'AJUSTEMENT';
  END IF;
END $$;

-- ----------------------------------------------------------
-- 2) Nouvelles colonnes sur inventory_movements
-- ----------------------------------------------------------

-- Motif de perte (expiré, cassé, erreur manipulation, etc.)
ALTER TABLE inventory_movements
  ADD COLUMN IF NOT EXISTS loss_reason VARCHAR(100);

-- Commentaire libre pour les pertes et ajustements
ALTER TABLE inventory_movements
  ADD COLUMN IF NOT EXISTS loss_comment TEXT;

-- ----------------------------------------------------------
-- 3) Zone principale sur les produits (optionnel)
-- ----------------------------------------------------------
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS location_id INTEGER
  REFERENCES locations(id) ON DELETE SET NULL;

-- ----------------------------------------------------------
-- 4) Reconstruction des vues (AJUSTEMENT = neutre pour stock)
-- ----------------------------------------------------------
DROP VIEW IF EXISTS v_dashboard_json CASCADE;
DROP VIEW IF EXISTS v_dashboard_kpis CASCADE;
DROP VIEW IF EXISTS v_alerts_critical_products CASCADE;
DROP VIEW IF EXISTS v_product_stock CASCADE;
DROP VIEW IF EXISTS v_last_movements CASCADE;

-- 4.1 Stock actuel (AJUSTEMENT et TRANSFERT = neutre)
CREATE VIEW v_product_stock AS
SELECT
  p.id            AS product_id,
  p.name          AS product_name,
  p.category,
  p.unit,
  p.min_threshold,
  p.target_stock,
  p.location_id,
  COALESCE(SUM(
    CASE
      WHEN m.type = 'ENTREE' THEN m.quantity
      WHEN m.type IN ('SORTIE', 'PERTE') THEN -m.quantity
      ELSE 0  -- TRANSFERT et AJUSTEMENT ne changent pas le stock global
    END
  ), 0) AS stock_actuel
FROM products p
LEFT JOIN inventory_movements m ON m.product_id = p.id
GROUP BY p.id, p.name, p.category, p.unit, p.min_threshold, p.target_stock, p.location_id;

-- 4.2 Produits critiques
CREATE OR REPLACE VIEW v_alerts_critical_products AS
SELECT
  product_id,
  product_name,
  category,
  unit,
  min_threshold,
  target_stock,
  location_id,
  stock_actuel
FROM v_product_stock
WHERE stock_actuel <= min_threshold
ORDER BY stock_actuel ASC;

-- 4.3 KPIs dashboard
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

-- 4.4 Derniers mouvements enrichis
CREATE OR REPLACE VIEW v_last_movements AS
SELECT
  m.id,
  m.created_at,
  m.type,
  m.quantity,
  m.reason,
  m.loss_reason,
  m.loss_comment,
  p.name AS product_name,
  p.category AS product_category,
  u.full_name AS done_by
FROM inventory_movements m
JOIN products p ON p.id = m.product_id
JOIN users u ON u.id = m.user_id
ORDER BY m.created_at DESC
LIMIT 10;

-- 4.5 Dashboard JSON
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

-- ----------------------------------------------------------
-- 5) Index utiles
-- ----------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_movements_loss_reason
  ON inventory_movements(loss_reason) WHERE loss_reason IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_movements_type_created
  ON inventory_movements(type, created_at);

CREATE INDEX IF NOT EXISTS idx_products_location_id
  ON products(location_id) WHERE location_id IS NOT NULL;

-- ----------------------------------------------------------
-- Fin migration V2
-- SELECT enum_range(NULL::movement_type); -- vérification
-- ----------------------------------------------------------
