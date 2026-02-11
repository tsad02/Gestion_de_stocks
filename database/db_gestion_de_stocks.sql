-- ==========================================================
--  DATABASE.SQL  (PostgreSQL)
--  Projet : Application web de gestion des stocks (restaurant)
-- ==========================================================

-- ----------------------------------------------------------
-- 0) Schéma (par défaut : public)
-- ----------------------------------------------------------
SET search_path TO public;

-- ----------------------------------------------------------
-- 1) RESET (script rejouable)
--    ⚠️ Supprime tables / vues / types si déjà existants
-- ----------------------------------------------------------
DROP VIEW IF EXISTS v_product_stock;

DROP TABLE IF EXISTS inventory_movements;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS users;

DROP TYPE IF EXISTS movement_type;
DROP TYPE IF EXISTS user_role;

-- ----------------------------------------------------------
-- 2) TYPES ENUM (sécurise les valeurs)
-- ----------------------------------------------------------
CREATE TYPE user_role AS ENUM ('RESPONSABLE', 'EMPLOYE');
CREATE TYPE movement_type AS ENUM ('ENTREE', 'SORTIE', 'PERTE');

-- ----------------------------------------------------------
-- 3) TABLE users
-- ----------------------------------------------------------
CREATE TABLE users (
  id            SERIAL PRIMARY KEY,
  full_name     VARCHAR(120) NOT NULL,
  email         VARCHAR(180) NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role          user_role NOT NULL DEFAULT 'EMPLOYE',
  created_at    TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ----------------------------------------------------------
-- 4) TABLE products
-- ----------------------------------------------------------
CREATE TABLE products (
  id            SERIAL PRIMARY KEY,
  name          VARCHAR(160) NOT NULL,
  category      VARCHAR(120) NOT NULL,
  unit          VARCHAR(40),
  min_threshold INTEGER NOT NULL DEFAULT 0 CHECK (min_threshold >= 0),
  created_at    TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ----------------------------------------------------------
-- 5) TABLE inventory_movements
-- ----------------------------------------------------------
CREATE TABLE inventory_movements (
  id         SERIAL PRIMARY KEY,
  product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  type       movement_type NOT NULL,
  quantity   INTEGER NOT NULL CHECK (quantity > 0),
  reason     VARCHAR(255),
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ----------------------------------------------------------
-- 6) INDEX (performance)
-- ----------------------------------------------------------
CREATE INDEX idx_movements_product_id ON inventory_movements(product_id);
CREATE INDEX idx_movements_user_id ON inventory_movements(user_id);
CREATE INDEX idx_movements_created_at ON inventory_movements(created_at);

-- ----------------------------------------------------------
-- 7) VIEW : Stock actuel par produit (calculé)
-- ----------------------------------------------------------
CREATE VIEW v_product_stock AS
SELECT
  p.id            AS product_id,
  p.name          AS product_name,
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

-- ----------------------------------------------------------
-- 8) QUERIES UTILES (ALERTES + DASHBOARD)
-- ----------------------------------------------------------

-- 8.1) Produits critiques (alerte seuil)
--      Critique si stock_actuel <= min_threshold
--      Utilisation : SELECT * FROM v_alerts_critical_products;
CREATE OR REPLACE VIEW v_alerts_critical_products AS
SELECT
  product_id,
  product_name,
  min_threshold,
  stock_actuel
FROM v_product_stock
WHERE stock_actuel <= min_threshold
ORDER BY stock_actuel ASC;

-- 8.2) KPI simples pour dashboard (7 derniers jours)
--      Utilisation : SELECT * FROM v_dashboard_kpis;
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

-- 8.3) Derniers mouvements (limité)
--      Utilisation : SELECT * FROM v_last_movements;
CREATE OR REPLACE VIEW v_last_movements AS
SELECT
  m.id,
  m.created_at,
  m.type,
  m.quantity,
  m.reason,
  p.name AS product_name,
  u.full_name AS done_by
FROM inventory_movements m
JOIN products p ON p.id = m.product_id
JOIN users u ON u.id = m.user_id
ORDER BY m.created_at DESC
LIMIT 10;

-- 8.4) Dashboard JSON "API-friendly" (1 seul retour)
--      Utilisation : SELECT * FROM v_dashboard_json;
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
-- 9) DONNÉES DE DÉMO (OPTIONNEL)
--    ✅ Décommente si tu veux des données pour démontrer.
-- ----------------------------------------------------------
/*
INSERT INTO users (full_name, email, password_hash, role)
VALUES
('Responsable Test', 'responsable@test.com', 'hash_demo', 'RESPONSABLE'),
('Employe Test', 'employe@test.com', 'hash_demo', 'EMPLOYE');

INSERT INTO products (name, category, unit, min_threshold)
VALUES
('Poulet', 'Viandes', 'kg', 10),
('Frites', 'Surgelés', 'kg', 5);

-- Mouvements (exemples)
INSERT INTO inventory_movements (product_id, user_id, type, quantity, reason, created_at)
VALUES
(1, 1, 'ENTREE', 20, NULL, NOW() - INTERVAL '2 days'),
(1, 2, 'SORTIE', 11, NULL, NOW() - INTERVAL '1 day'),
(1, 2, 'PERTE',  2, 'Produit expiré', NOW()),
(2, 1, 'ENTREE', 10, NULL, NOW() - INTERVAL '3 days'),
(2, 2, 'SORTIE',  7, NULL, NOW() - INTERVAL '1 day');
*/

-- ----------------------------------------------------------
-- 10) TEST RAPIDE (optionnel)
-- ----------------------------------------------------------
-- SELECT * FROM v_product_stock ORDER BY product_name;
-- SELECT * FROM v_alerts_critical_products;
-- SELECT * FROM v_dashboard_kpis;
-- SELECT * FROM v_last_movements;
-- SELECT * FROM v_dashboard_json;