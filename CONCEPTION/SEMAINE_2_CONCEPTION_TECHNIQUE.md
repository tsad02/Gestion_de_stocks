# 📋 Semaine 2 – Conception Technique (09/02/2026 - 15/02/2026)

## Objectif
Produire la conception technique du système, en particulier le modèle de données de la base PostgreSQL, incluant tables, clés, contraintes, types énumérés et logique métier de calcul du stock.

---

## 1. Architecture Fonctionnelle

### Architecture en Couches

```
┌──────────────────────────────────────────────┐
│     CLIENT (Frontend React / Postman)        │
└──────────────────┬───────────────────────────┘
                   │ HTTP/REST (Port 3000)
┌──────────────────▼───────────────────────────┐
│  Express.js Application Server (Node.js)     │
│  ├─ Routes (auth, products, inventory)       │
│  ├─ Middleware (JWT, Error Handler, RBAC)   │
│  └─ Controllers (logique métier)             │
└──────────────────┬───────────────────────────┘
                   │
┌──────────────────▼───────────────────────────┐
│     PostgreSQL Database Module                │
│     (pg/pool connection management)           │
└──────────────────┬───────────────────────────┘
                   │
┌──────────────────▼───────────────────────────┐
│   PostgreSQL Database & Views                 │
│   (v_product_stock, v_alerts, v_dashboard)  │
└──────────────────────────────────────────────┘
```

---

## 2. Modèle de Données (Entités et Relations)

### Diagramme Entité-Relation (ERD)

```
┌──────────────────┐                    ┌──────────────────┐
│      USERS       │                    │    PRODUCTS      │
├──────────────────┤                    ├──────────────────┤
│ id (PK)          │                    │ id (PK)          │
│ username         │                    │ name             │
│ password         │                    │ category         │
│ role             │◄────────────────────┤ unit             │
│ created_at       │    1:N              │ min_threshold    │
└──────────────────┘                    │ created_at       │
        ▲                               └────────┬─────────┘
        │                                        │
        │                                        │ 1:N
        │                                        │
        │               ┌──────────────────────────┘
        │               │
        │               ▼
        │      ┌─────────────────────────────┐
        └──────┤ INVENTORY_MOVEMENTS         │
               ├─────────────────────────────┤
               │ id (PK)                     │
               │ product_id (FK)             │
               │ user_id (FK)                │
               │ type (ENUM)                 │
               │ quantity                    │
               │ reason                      │
               │ created_at                  │
               └─────────────────────────────┘
```

### Détail des Tables

#### 📌 Table: `users`
Gère l'authentification et les rôles utilisateurs.

| Colonne | Type | Contrainte | Description |
|---------|------|-----------|---|
| `id` | `SERIAL` | PRIMARY KEY | Identifiant unique auto-incrémenté |
| `username` | `VARCHAR(50)` | UNIQUE, NOT NULL | Nom d'utilisateur unique |
| `password` | `VARCHAR(255)` | NOT NULL | Mot de passe hashé (bcrypt) |
| `role` | `VARCHAR(20)` | NOT NULL, DEFAULT 'EMPLOYE' | Rôle : RESPONSABLE ou EMPLOYE |
| `created_at` | `TIMESTAMP` | DEFAULT NOW() | Date de création |

**Indicateurs et Contraintes** :
- Clé unique sur `username` pour éviter les doublons.
- Rôles limités à 2 valeurs : `RESPONSABLE` (accès complet) ou `EMPLOYE` (lecture seule).

---

#### 📦 Table: `products`
Catalogue des produits disponibles en stock.

| Colonne | Type | Contrainte | Description |
|---------|------|-----------|---|
| `id` | `SERIAL` | PRIMARY KEY | Identifiant unique |
| `name` | `VARCHAR(160)` | NOT NULL | Nom du produit |
| `category` | `VARCHAR(120)` | NOT NULL | Catégorie (Burger, Boisson, etc.) |
| `unit` | `VARCHAR(40)` | - | Unité de mesure (L, kg, pièce, etc.) |
| `min_threshold` | `INTEGER` | DEFAULT 0, CHECK ≥ 0 | Seuil minimal (déclenche alerte) |
| `quantity` | `INTEGER` | DEFAULT 0 | Quantité actuelle (stockée pour rapidité) |
| `created_at` | `TIMESTAMP` | DEFAULT NOW() | Date de création |

**Indicateurs et Contraintes** :
- `min_threshold` ≥ 0 pour éviter les seuils négatifs.
- `quantity` peut être synchronisé via vue `v_product_stock` (calculé à partir des mouvements).

---

#### 🔄 Table: `inventory_movements`
Historique détaillé de tous les mouvements de stock.

| Colonne | Type | Contrainte | Description |
|---------|------|-----------|---|
| `id` | `SERIAL` | PRIMARY KEY | Identifiant unique |
| `product_id` | `INTEGER` | NOT NULL, FK | Référence produit (ON DELETE RESTRICT) |
| `user_id` | `INTEGER` | NOT NULL, FK | Référence utilisateur responsable (ON DELETE RESTRICT) |
| `type` | `movement_type ENUM` | NOT NULL | Type : ENTREE, SORTIE, PERTE |
| `quantity` | `INTEGER` | NOT NULL, CHECK > 0 | Quantité du mouvement (toujours positive) |
| `reason` | `VARCHAR(255)` | - | Motif du mouvement (livraison, vente, dégât, etc.) |
| `created_at` | `TIMESTAMP` | DEFAULT NOW() | Timestamp précis |

**Indicateurs et Contraintes** :
- Clés étrangères `product_id` et `user_id` réstreignent la suppression (intégrité référentielle).
- `quantity` > 0 car le signe (+ ou -) est déterminé par le champ `type`.
- Enum `movement_type` limité à 3 valeurs : `ENTREE`, `SORTIE`, `PERTE`.

---

### Types Énumérés

```sql
CREATE TYPE user_role AS ENUM ('RESPONSABLE', 'EMPLOYE');
CREATE TYPE movement_type AS ENUM ('ENTREE', 'SORTIE', 'PERTE');
```

---

## 3. Logique Métier : Calcul du Stock

### Prémisse
Le stock actuel d'un produit est **calculé dynamiquement** à partir de l'historique des mouvements, jamais stocké directement.

### Formule de Calcul

```
STOCK_ACTUEL = Σ(ENTREE) - Σ(SORTIE) - Σ(PERTE)
```

Pour chaque produit :
1. **ENTREE** : Quantité ajoutée (réception, correction d'inventaire positive).
2. **SORTIE** : Quantité prélevée (vente, utilisation).
3. **PERTE** : Quantité perdue (dégâts, expiration, vol).

### Implémentation SQL (Vue)

```sql
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
```

### Exemple Appliqué

**Produit : "Farine 1kg"** (product_id = 5, min_threshold = 10)

| Mouvement | Type | Quantité | Calcul | Stock Cumulé |
|-----------|------|----------|--------|--------------|
| Inventaire initial | ENTREE | 50 | +50 | **50** |
| Livraison jour 1 | ENTREE | 30 | +30 | **80** |
| Vente jour 1 | SORTIE | 15 | -15 | **65** |
| Vente jour 2 | SORTIE | 22 | -22 | **43** |
| Dégât | PERTE | 3 | -3 | **40** |
| Livraison jour 3 | ENTREE | 20 | +20 | **60** |

**Stock final = 60 kg** (pas d'alerte, car 60 > min_threshold 10)

---

## 4. Vues Utilitaires

### Vue 1 : `v_product_stock`
Affiche le stock actuel pour tous les produits.

```sql
SELECT * FROM v_product_stock ORDER BY product_name;
```

**Sortie** : `product_id, product_name, category, unit, min_threshold, stock_actuel`

---

### Vue 2 : `v_alerts_critical_products`
Identifie les produits en seuil critique (stock ≤ min_threshold).

```sql
CREATE VIEW v_alerts_critical_products AS
SELECT
  product_id,
  product_name,
  min_threshold,
  stock_actuel
FROM v_product_stock
WHERE stock_actuel <= min_threshold
ORDER BY stock_actuel ASC;
```

**Cas d'usage** : Alerter le responsable pour réapprovisionner.

---

## 5. Script SQL Fonctionnel

Le fichier [`database/db_gestion_de_stocks.sql`](../database/db_gestion_de_stocks.sql) contient :

✅ Création des types énumérés (`user_role`, `movement_type`)  
✅ Création des tables (`users`, `products`, `inventory_movements`)  
✅ Indices pour optimiser les requêtes  
✅ Vues utilitaires (stock, alertes, KPI)  
✅ Données de test (INSERT par défaut)

### Validation du Script

**Prérequis** :
- PostgreSQL 10+ installé et accessible
- Variable d'environnement `DATABASE_URL` configurée

**Exécution** :
```bash
psql -U username -d database_name -f database/db_gestion_de_stocks.sql
```

**Vérification** :
```sql
-- Lister les tables créées
\dt

-- Compter les produits
SELECT COUNT(*) AS total_produits FROM products;

-- Vérifier une vue
SELECT * FROM v_product_stock LIMIT 5;
```

---

## 6. Intégrité Référentielle et Contraintes

### Clés Étrangères

| Relation | Colonne FK | Table Cible | Action |
|----------|-----------|------------|---------|
| `inventory_movements` → `products` | `product_id` | `products.id` | ON DELETE RESTRICT |
| `inventory_movements` → `users` | `user_id` | `users.id` | ON DELETE RESTRICT |

**Explication** : On empêche la suppression d'un produit ou d'un utilisateur s'il existe des mouvements associés. Cela préserve l'historique.

### Contraintes de Domaine

```sql
-- Table products
CHECK (min_threshold >= 0)

-- Table inventory_movements
CHECK (quantity > 0)
```

---

## 7. Données de Test

Le script `database/db_gestion_de_stocks.sql` inclut des INSERT initiaux :

```sql
-- Insertion de test
INSERT INTO users (username, password, role) VALUES 
  ('alice', 'hashed_pwd', 'RESPONSABLE'),
  ('bob', 'hashed_pwd', 'EMPLOYE');

INSERT INTO products (name, category, unit, min_threshold, quantity) VALUES
  ('Farine blanche', 'Ingrédients', 'kg', 10, 50),
  ('Huile de tournesol', 'Ingrédients', 'L', 5, 20),
  ('Pain complet', 'Produits', 'pièce', 3, 12);

INSERT INTO inventory_movements (product_id, user_id, type, quantity, reason) VALUES
  (1, 1, 'ENTREE', 30, 'Livraison fournisseur'),
  (1, 2, 'SORTIE', 5, 'Vente du jour'),
  (2, 1, 'PERTE', 2, 'Fuite détectée');
```

---

## 8. Livrables de la Semaine 2

- ✅ **Modèle de données** : Tables, colonnes, types, contraintes documentés.
- ✅ **Diagramme ERD** : Représentation visuelle des entités et relations.
- ✅ **Logique métier** : Calcul du stock via mouvements et vues.
- ✅ **Script SQL** : Fonctionnel et rejouable (`database/db_gestion_de_stocks.sql`).
- ✅ **Vues utilitaires** : Stock actuel, alertes critiques, KPI.
- ✅ **Documentation technique** : Ce document.

---

## 9. Checkpoints de Validation

Pour confirmer la complétude de la semaine 2 :

- [ ] Script SQL s'exécute sans erreur.
- [ ] Toutes les tables sont créées (via `\dt`).
- [ ] Les énums sont disponibles (via `SELECT typname FROM pg_type`).
- [ ] Les vues se consultent sans erreur.
- [ ] Les contraintes FK et CHECK sont respectées (test d'insertion invalide).
- [ ] Les indices sont créés pour les performances.

---

## 10. Points de Transition vers Semaine 3

La semaine 3 (Mise en place du back-end) débutera avec :
- Création du projet Node.js/Express.
- Configuration du pool de connexions PostgreSQL.
- Implémentation des premières routes de santé (health check).
- Intégration du script SQL dans le pipeline d'initialisation.

---

**Document rédigé le : 11/03/2026**  
**Statut : COMPLET ✅**
