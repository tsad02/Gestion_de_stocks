# 📋 Semaine 6 – Gestion des Stocks (02/03/2026 - 08/03/2026)

## Objectif
Mettre en place la **gestion complète des mouvements de stock** (ENTREE, SORTIE, PERTE). Créer les routes pour enregistrer les mouvements, implémenter les vues SQL pour calculer le stock dynamique et mettre en place la détection des seuils critiques.

---

## 1. Architecture : Stock Calculé vs Stocké

### Paradigme Adopté : Stock Calculé

Au lieu de stocker directement `quantity` dans la table `products`, nous **calculons** le stock à partir de l'historique des mouvements :

```
STOCK_ACTUEL = Σ(ENTREE) - Σ(SORTIE) - Σ(PERTE)
```

**Avantages** :
✅ Traçabilité complète (historique auditoire des mouvements)  
✅ Pas de divergence entre stock affiché et historique  
✅ Possibilité d'identifier les anomalies  
✅ Corrections faciles à appliquer  

---

## 2. Table Inventory_Movements

### Création de la Table

Le fichier `database/db_gestion_de_stocks.sql` crée la table :

```sql
CREATE TABLE inventory_movements (
  id         SERIAL PRIMARY KEY,
  product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  type       movement_type NOT NULL,  -- ENUM: ENTREE, SORTIE, PERTE
  quantity   INTEGER NOT NULL CHECK (quantity > 0),
  reason     VARCHAR(255),
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Indices pour performance
CREATE INDEX idx_movements_product_id ON inventory_movements(product_id);
CREATE INDEX idx_movements_user_id ON inventory_movements(user_id);
CREATE INDEX idx_movements_created_at ON inventory_movements(created_at);
```

**Contraintes** :
- `quantity > 0` : Toujours positif (le signe vient du type).
- FK `ON DELETE RESTRICT` : Empêcher la suppression d'un produit avec historique.

---

## 3. Vue : Calcul du Stock Actuel

### Fichier: `src/db/views.sql` (extrait de `db_gestion_de_stocks.sql`)

```sql
CREATE OR REPLACE VIEW v_product_stock AS
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

**Logique** :
- Pour chaque produit, on fait la somme algébrique des mouvements.
- `ENTREE` = +quantité
- `SORTIE`, `PERTE` = -quantité
- `COALESCE(..., 0)` : retourne 0 si aucun mouvement.

---

## 4. Vue : Alertes Seuil Critique

```sql
CREATE OR REPLACE VIEW v_alerts_critical_products AS
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

## 5. Controller Mouvements de Stock

### Fichier: `src/controllers/inventory.controller.js`

```javascript
const pool = require("../db/pool");

/**
 * POST /api/inventory-movements
 * Enregistrer un nouveau mouvement de stock
 * (Réservé au RESPONSABLE)
 */
async function addMovement(req, res, next) {
  try {
    const { product_id, type, quantity, reason } = req.body;
    const user_id = req.user.id;  // Utilisateur authentifié

    // --- Validation ---
    if (!product_id || !type || !quantity) {
      return res.status(400).json({
        error: "product_id, type et quantity sont obligatoires"
      });
    }

    // Vérifier que le type est valide
    if (!['ENTREE', 'SORTIE', 'PERTE'].includes(type.toUpperCase())) {
      return res.status(400).json({
        error: "Type invalide. Doit être : ENTREE, SORTIE ou PERTE"
      });
    }

    // Vérifier que la quantité est positive
    if (quantity <= 0) {
      return res.status(400).json({
        error: "La quantité doit être > 0"
      });
    }

    // Vérifier que le produit existe
    const productExists = await pool.query(
      "SELECT id FROM products WHERE id = $1",
      [product_id]
    );
    if (productExists.rows.length === 0) {
      return res.status(404).json({
        error: "Produit non trouvé"
      });
    }

    // --- Insertion du mouvement ---
    const result = await pool.query(`
      INSERT INTO inventory_movements (product_id, user_id, type, quantity, reason)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, product_id, user_id, type, quantity, reason, created_at
    `, [product_id, user_id, type.toUpperCase(), quantity, reason || null]);

    res.status(201).json({
      message: "Mouvement enregistré avec succès",
      movement: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/inventory-movements
 * Lister tous les mouvements (avec filtrage optionnel)
 */
async function listMovements(req, res, next) {
  try {
    const { product_id, type, limit = 50, offset = 0 } = req.query;

    let query = `
      SELECT m.id, m.product_id, p.name AS product_name, m.user_id, u.username,
             m.type, m.quantity, m.reason, m.created_at
      FROM inventory_movements m
      JOIN products p ON m.product_id = p.id
      JOIN users u ON m.user_id = u.id
      WHERE 1=1
    `;
    const params = [];

    if (product_id) {
      query += ` AND m.product_id = $${params.length + 1}`;
      params.push(product_id);
    }

    if (type) {
      query += ` AND m.type = $${params.length + 1}`;
      params.push(type.toUpperCase());
    }

    query += ` ORDER BY m.created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);

    const result = await pool.query(query, params);
    res.json({
      total: result.rowCount,
      movements: result.rows
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/inventory-movements/:id
 * Détails d'un mouvement
 */
async function getMovementById(req, res, next) {
  try {
    const { id } = req.params;

    const result = await pool.query(`
      SELECT m.id, m.product_id, p.name AS product_name, m.user_id, u.username,
             m.type, m.quantity, m.reason, m.created_at
      FROM inventory_movements m
      JOIN products p ON m.product_id = p.id
      JOIN users u ON m.user_id = u.id
      WHERE m.id = $1
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: "Mouvement non trouvé"
      });
    }

    res.json(result.rows[0]);
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/inventory-movements/product/:product_id
 * Historique des mouvements pour un produit
 */
async function getMovementsByProduct(req, res, next) {
  try {
    const { product_id } = req.params;

    // Vérifier que le produit existe
    const product = await pool.query(
      "SELECT id, name FROM products WHERE id = $1",
      [product_id]
    );

    if (product.rows.length === 0) {
      return res.status(404).json({
        error: "Produit non trouvé"
      });
    }

    // Récupérer les mouvements
    const result = await pool.query(`
      SELECT m.id, m.product_id, m.user_id, u.username, m.type, m.quantity, 
             m.reason, m.created_at
      FROM inventory_movements m
      JOIN users u ON m.user_id = u.id
      WHERE m.product_id = $1
      ORDER BY m.created_at DESC
    `, [product_id]);

    res.json({
      product: product.rows[0],
      movements: result.rows
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  addMovement,
  listMovements,
  getMovementById,
  getMovementsByProduct
};
```

---

## 6. Routes Mouvements de Stock

### Fichier: `src/routes/inventory.routes.js`

```javascript
const router = require("express").Router();
const {
  addMovement,
  listMovements,
  getMovementById,
  getMovementsByProduct
} = require("../controllers/inventory.controller");
const authMiddleware = require("../middleware/auth.middleware");
const authorize = require("../middleware/role.middleware");

/**
 * Routes de gestion des mouvements de stock
 * Préfixe : /api/inventory-movements
 */

// --- Protection globale (require JWT) ---
router.use(authMiddleware);

// --- GET : Lecture autorisée à EMPLOYE et RESPONSABLE ---
router.get("/", authorize("EMPLOYE", "RESPONSABLE"), listMovements);
router.get("/:id", authorize("EMPLOYE", "RESPONSABLE"), getMovementById);
router.get("/product/:product_id", authorize("EMPLOYE", "RESPONSABLE"), getMovementsByProduct);

// --- POST : Réservé au RESPONSABLE ---
router.post("/", authorize("RESPONSABLE"), addMovement);

module.exports = router;
```

### Mise à Jour `src/app.js`

```javascript
const express = require("express");
const cors = require("cors");
const healthRoutes = require("./routes/health.routes");
const authRoutes = require("./routes/auth.routes");
const productRoutes = require("./routes/products.routes");
const inventoryRoutes = require("./routes/inventory.routes");
const errorHandler = require("./middleware/errorHandler");

const app = express();

// --- Middlewares globaux ---
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- Routes ---
app.use("/api/health", healthRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/inventory-movements", inventoryRoutes);

// --- Gestionnaire d'erreurs ---
app.use(errorHandler);

module.exports = app;
```

---

## 7. Tests Postman – Mouvements

### ✅ `Test 1 : Ajouter un Mouvement (ENTREE)`

**Préalable** : Créer un produit « Farine » (id=1) si pas existant.

```http
POST http://localhost:3000/api/inventory-movements
Authorization: Bearer <TOKEN_RESPONSABLE>
Content-Type: application/json

{
  "product_id": 1,
  "type": "ENTREE",
  "quantity": 50,
  "reason": "Livraison fournisseur"
}
```

**Réponse attendue (201 Created)** :
```json
{
  "message": "Mouvement enregistré avec succès",
  "movement": {
    "id": 1,
    "product_id": 1,
    "user_id": 1,
    "type": "ENTREE",
    "quantity": 50,
    "reason": "Livraison fournisseur",
    "created_at": "2026-03-02T08:00:00.000Z"
  }
}
```

---

### ✅ `Test 2 : Ajouter un Mouvement (SORTIE)`

```http
POST http://localhost:3000/api/inventory-movements
Authorization: Bearer <TOKEN_RESPONSABLE>
Content-Type: application/json

{
  "product_id": 1,
  "type": "SORTIE",
  "quantity": 15,
  "reason": "Vente jour 1"
}
```

**Réponse attendue (201 Created)** :
```json
{
  "message": "Mouvement enregistré avec succès",
  "movement": {
    "id": 2,
    "product_id": 1,
    "user_id": 1,
    "type": "SORTIE",
    "quantity": 15,
    "reason": "Vente jour 1",
    "created_at": "2026-03-02T09:30:00.000Z"
  }
}
```

---

### ✅ `Test 3 : Validation – Quantité Négative`

```http
POST http://localhost:3000/api/inventory-movements
Authorization: Bearer <TOKEN_RESPONSABLE>
Content-Type: application/json

{
  "product_id": 1,
  "type": "SORTIE",
  "quantity": -5
}
```

**Réponse attendue (400 Bad Request)** :
```json
{
  "error": "La quantité doit être > 0"
}
```

---

### ✅ `Test 4 : Validation – Type Invalide`

```http
POST http://localhost:3000/api/inventory-movements
Authorization: Bearer <TOKEN_RESPONSABLE>
Content-Type: application/json

{
  "product_id": 1,
  "type": "DONATION",
  "quantity": 10
}
```

**Réponse attendue (400 Bad Request)** :
```json
{
  "error": "Type invalide. Doit être : ENTREE, SORTIE ou PERTE"
}
```

---

### ✅ `Test 5 : Lister les Mouvements`

```http
GET http://localhost:3000/api/inventory-movements
Authorization: Bearer <TOKEN_EMPLOYE>
```

**Réponse attendue (200 OK)** :
```json
{
  "total": 2,
  "movements": [
    {
      "id": 2,
      "product_id": 1,
      "product_name": "Farine blanche",
      "user_id": 1,
      "username": "alice",
      "type": "SORTIE",
      "quantity": 15,
      "reason": "Vente jour 1",
      "created_at": "2026-03-02T09:30:00.000Z"
    },
    {
      "id": 1,
      "product_id": 1,
      "product_name": "Farine blanche",
      "user_id": 1,
      "username": "alice",
      "type": "ENTREE",
      "quantity": 50,
      "reason": "Livraison",
      "created_at": "2026-03-02T08:00:00.000Z"
    }
  ]
}
```

---

### ✅ `Test 6 : Historique d'un Produit`

```http
GET http://localhost:3000/api/inventory-movements/product/1
Authorization: Bearer <TOKEN_EMPLOYE>
```

**Réponse attendue (200 OK)** :
```json
{
  "product": {
    "id": 1,
    "name": "Farine blanche"
  },
  "movements": [...]
}
```

---

## 8. Vue : Stock Actuel (Test SQL)

Après avoir enregistré les mouvements précédents :

```sql
SELECT * FROM v_product_stock WHERE product_id = 1;
```

**Résultat attendu** :
```
product_id | product_name  | category | unit | min_threshold | stock_actuel
-----------+---------------+----------+------+---------------+-------------
1          | Farine blanche| Ingredient | kg | 10            | 35
```

Calcul : 50 (ENTREE) - 15 (SORTIE) = **35** ✅

---

## 9. Vue : Alertes Critiques

```sql
INSERT INTO products (name, min_threshold) VALUES ('Test Alerte', 100);
INSERT INTO inventory_movements (product_id, user_id, type, quantity) 
  VALUES ((SELECT id FROM products WHERE name='Test Alerte'), 1, 'ENTREE', 10);

SELECT * FROM v_alerts_critical_products;
```

**Résultat attendu** :
```
product_id | product_name | min_threshold | stock_actuel
-----------+--------------+---------------+-------------
2          | Test Alerte  | 100           | 10
```

Stock (10) ≤ seuil min (100) → **ALERTE** ✅

---

## 10. Checklist Semaine 6

- [ ] Table `inventory_movements` est créée.
- [ ] `POST /api/inventory-movements` enregistre un mouvement (RESPONSABLE).
- [ ] Validation : type dans ENTREE/SORTIE/PERTE, quantity > 0.
- [ ] `GET /api/inventory-movements` liste tous les mouvements.
- [ ] `GET /api/inventory-movements/product/:id` liste l'historique d'un produit.
- [ ] Vue `v_product_stock` calcule le stock correctement.
- [ ] Vue `v_alerts_critical_products` identifie les seuils critiques.
- [ ] EMPLOYE peut lire les mouvements, `RESPONSABLE` peut créer.
- [ ] Produit inexistant → 404.
- [ ] Sans token → 401.

---

## 11. Intégration avec les Produits (Important)

### ⚠️ Modification Importante

Le champ `quantity` dans la table `products` était utilisé pour stocker le stock. **À partir de la semaine 6, il doit être déconsidéré** :

**Option A : Garder `quantity` pour compatibilité rétroactive**
- Laisser le champ, mais le synchroniser via trigger :
```sql
CREATE TRIGGER sync_product_stock
AFTER INSERT ON inventory_movements
FOR EACH ROW
UPDATE products SET quantity = (
  SELECT COALESCE(SUM(...), 0) FROM v_product_stock
) WHERE id = NEW.product_id;
```

**Option B : Supprimer `quantity` et utiliser uniquement `v_product_stock`**
- Plus propre, mais nécessite mise à jour du frontend.

---

## 12. Points de Transition vers Semaine 7

Semaine 7 (Tableau de bord - Dashboard) débutera avec :
- Nouveau endpoint : `GET /api/dashboard`
- Retourne les KPI (total produits, critiques, entrées/sorties 7j, etc.)
- Vue `v_dashboard_json` prête en base.
- Frontend React pour afficher le dashboard.

---

**Document rédigé le : 11/03/2026**  
**Statut : COMPLET ✅**
