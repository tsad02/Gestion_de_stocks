# 📋 Semaine 5 – Gestion des Produits (23/02/2026 - 01/03/2026)

## Objectif
Développer un CRUD complet pour les produits. Les endpoints permettront de lister, créer, modifier et supprimer des produits, avec validation des données et contrôle d'accès basé sur les rôles (RESPONSABLE écrit, EMPLOYE lit).

---

## 1. Architecture des Routes Produits

### Endpoints Prévus

| Méthode | Endpoint | Rôles Autorisés | Description |
|---------|----------|-----------------|---|
| `GET` | `/api/products` | EMPLOYE, RESPONSABLE | Lister tous les produits |
| `GET` | `/api/products/:id` | EMPLOYE, RESPONSABLE | Détails d'un produit |
| `POST` | `/api/products` | RESPONSABLE | Créer un produit |
| `PUT` | `/api/products/:id` | RESPONSABLE | Modifier un produit |
| `DELETE` | `/api/products/:id` | RESPONSABLE | Supprimer un produit |

---

## 2. Controller Produits

### Fichier: `src/controllers/products.controller.js`

```javascript
const pool = require("../db/pool");

/**
 * GET /api/products
 * Récupère la liste de tous les produits
 */
async function getProducts(req, res, next) {
  try {
    const result = await pool.query(`
      SELECT id, name, category, unit, min_threshold, quantity, created_at
      FROM products
      ORDER BY id DESC
    `);
    res.json(result.rows);
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/products/:id
 * Récupère un seul produit par son ID
 */
async function getProductById(req, res, next) {
  try {
    const { id } = req.params;
    const result = await pool.query(`
      SELECT id, name, category, unit, min_threshold, quantity, created_at
      FROM products
      WHERE id = $1
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: "Produit non trouvé"
      });
    }

    res.json(result.rows[0]);
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/products
 * Ajoute un nouveau produit (Réservé au RESPONSABLE)
 */
async function addProduct(req, res, next) {
  try {
    const { name, category, unit, min_threshold, quantity } = req.body;

    // --- Validation ---
    if (!name || name.trim() === "") {
      return res.status(400).json({
        error: "Le nom du produit est obligatoire"
      });
    }

    if (min_threshold !== undefined && min_threshold < 0) {
      return res.status(400).json({
        error: "Le seuil minimal ne peut pas être négatif"
      });
    }

    // --- Insertion ---
    const result = await pool.query(`
      INSERT INTO products (name, category, unit, min_threshold, quantity)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `, [name, category, unit, min_threshold || 0, quantity || 0]);

    res.status(201).json(result.rows[0]);
  } catch (error) {
    next(error);
  }
}

/**
 * PUT /api/products/:id
 * Modifie un produit existant (Réservé au RESPONSABLE)
 */
async function updateProduct(req, res, next) {
  try {
    const { id } = req.params;
    const { name, category, unit, min_threshold, quantity } = req.body;

    // --- Validation ---
    if (name !== undefined && name.trim() === "") {
      return res.status(400).json({
        error: "Le nom du produit ne peut pas être vide"
      });
    }

    if (min_threshold !== undefined && min_threshold < 0) {
      return res.status(400).json({
        error: "Le seuil minimal ne peut pas être négatif"
      });
    }

    // --- Update (COALESCE pour champs optionnels) ---
    const result = await pool.query(`
      UPDATE products
      SET name = COALESCE($1, name),
          category = COALESCE($2, category),
          unit = COALESCE($3, unit),
          min_threshold = COALESCE($4, min_threshold),
          quantity = COALESCE($5, quantity)
      WHERE id = $6
      RETURNING *
    `, [name, category, unit, min_threshold, quantity, id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: "Produit non trouvé"
      });
    }

    res.json(result.rows[0]);
  } catch (error) {
    next(error);
  }
}

/**
 * DELETE /api/products/:id
 * Supprime un produit (Réservé au RESPONSABLE)
 */
async function deleteProduct(req, res, next) {
  try {
    const { id } = req.params;
    const result = await pool.query(
      "DELETE FROM products WHERE id = $1 RETURNING id",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: "Produit non trouvé"
      });
    }

    res.json({
      message: "Produit supprimé avec succès",
      id
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getProducts,
  getProductById,
  addProduct,
  updateProduct,
  deleteProduct
};
```

---

## 3. Routes Produits

### Fichier: `src/routes/products.routes.js`

```javascript
const router = require("express").Router();
const {
  getProducts,
  getProductById,
  addProduct,
  updateProduct,
  deleteProduct
} = require("../controllers/products.controller");
const authMiddleware = require("../middleware/auth.middleware");
const authorize = require("../middleware/role.middleware");

/**
 * Routes de gestion des produits
 * Préfixe : /api/products
 */

// --- Protection globale (require JWT) ---
router.use(authMiddleware);

// --- Routes de Consultation (EMPLOYE + RESPONSABLE) ---
router.get("/", authorize("EMPLOYE", "RESPONSABLE"), getProducts);
router.get("/:id", authorize("EMPLOYE", "RESPONSABLE"), getProductById);

// --- Routes de Gestion (RESPONSABLE uniquement) ---
router.post("/", authorize("RESPONSABLE"), addProduct);
router.put("/:id", authorize("RESPONSABLE"), updateProduct);
router.delete("/:id", authorize("RESPONSABLE"), deleteProduct);

module.exports = router;
```

### Mise à Jour `src/app.js`

```javascript
const express = require("express");
const cors = require("cors");
const healthRoutes = require("./routes/health.routes");
const authRoutes = require("./routes/auth.routes");
const productRoutes = require("./routes/products.routes");
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

// --- Gestionnaire d'erreurs ---
app.use(errorHandler);

module.exports = app;
```

---

## 4. Tests Postman – Scénarios Complets

### ✅ `Scénario 1 : Accès Non Autorisé (pas de token)`

**Requête** :
```http
GET http://localhost:3000/api/products
```

**Réponse attendue (401)** :
```json
{
  "error": "Accès refusé. Aucun jeton fourni."
}
```

---

### ✅ `Scénario 2 : Lister les Produits (READ - EMPLOYE)`

#### Étape 1 : Créer un employé

```http
POST http://localhost:3000/api/auth/register
Content-Type: application/json

{
  "username": "bob",
  "password": "employeepass123",
  "role": "EMPLOYE"
}
```

Réponse :
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  ...
}
```

#### Étape 2 : Utiliser le token pour lire

```http
GET http://localhost:3000/api/products
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Réponse attendue (200 OK)** :
```json
[
  {
    "id": 1,
    "name": "Farine blanche",
    "category": "Ingrédients",
    "unit": "kg",
    "min_threshold": 10,
    "quantity": 50,
    "created_at": "2026-02-23T08:00:00.000Z"
  }
]
```

---

### ✅ `Scénario 3 : Créer un Produit (CREATE - RESPONSABLE uniquement)`

#### Test Positif : RESPONSABLE peut créer

```http
POST http://localhost:3000/api/products
Authorization: Bearer <TOKEN_RESPONSABLE>
Content-Type: application/json

{
  "name": "Tomates fraîches",
  "category": "Légumes",
  "unit": "kg",
  "min_threshold": 5,
  "quantity": 20
}
```

**Réponse attendue (201 Created)** :
```json
{
  "id": 2,
  "name": "Tomates fraîches",
  "category": "Légumes",
  "unit": "kg",
  "min_threshold": 5,
  "quantity": 20,
  "created_at": "2026-02-23T09:15:00.000Z"
}
```

#### Test Négatif : EMPLOYE ne peut pas créer

```http
POST http://localhost:3000/api/products
Authorization: Bearer <TOKEN_EMPLOYE>
Content-Type: application/json

{
  "name": "Oignons",
  "category": "Légumes",
  "unit": "kg"
}
```

**Réponse attendue (403 Forbidden)** :
```json
{
  "error": "Accès interdit. Vous n'avez pas les permissions nécessaires (RESPONSABLE)"
}
```

---

### ✅ `Scénario 4 : Validation des Données`

#### Test : Produit sans nom

```http
POST http://localhost:3000/api/products
Authorization: Bearer <TOKEN_RESPONSABLE>
Content-Type: application/json

{
  "category": "Fruit",
  "unit": "kg"
}
```

**Réponse attendue (400 Bad Request)** :
```json
{
  "error": "Le nom du produit est obligatoire"
}
```

#### Test : Seuil négatif

```http
POST http://localhost:3000/api/products
Authorization: Bearer <TOKEN_RESPONSABLE>
Content-Type: application/json

{
  "name": "Bananes",
  "category": "Fruits",
  "min_threshold": -5
}
```

**Réponse attendue (400 Bad Request)** :
```json
{
  "error": "Le seuil minimal ne peut pas être négatif"
}
```

---

### ✅ `Scénario 5 : Modifier un Produit (UPDATE)`

```http
PUT http://localhost:3000/api/products/2
Authorization: Bearer <TOKEN_RESPONSABLE>
Content-Type: application/json

{
  "quantity": 15,
  "min_threshold": 3
}
```

**Réponse attendue (200 OK)** :
```json
{
  "id": 2,
  "name": "Tomates fraîches",
  "category": "Légumes",
  "unit": "kg",
  "min_threshold": 3,
  "quantity": 15,
  "created_at": "2026-02-23T09:15:00.000Z"
}
```

---

### ✅ `Scénario 6 : Supprimer un Produit (DELETE)`

#### Test Positif : RESPONSABLE peut supprimer

```http
DELETE http://localhost:3000/api/products/2
Authorization: Bearer <TOKEN_RESPONSABLE>
```

**Réponse attendue (200 OK)** :
```json
{
  "message": "Produit supprimé avec succès",
  "id": 2
}
```

#### Test Négatif : Produit inexistant

```http
DELETE http://localhost:3000/api/products/999
Authorization: Bearer <TOKEN_RESPONSABLE>
```

**Réponse attendue (404 Not Found)** :
```json
{
  "error": "Produit non trouvé"
}
```

---

## 5. Checklist Semaine 5

- [ ] `GET /api/products` retourne la liste de tous les produits.
- [ ] `GET /api/products/:id` retourne un produit spécifique.
- [ ] `GET` est accessible à EMPLOYE et RESPONSABLE.
- [ ] `POST /api/products` crée un produit avec `RESPONSABLE` uniquement.
- [ ] Validation : nom obligatoire, seuil ≥ 0.
- [ ] `PUT /api/products/:id` modifie partiellement (COALESCE).
- [ ] `DELETE /api/products/:id` supprime un produit.
- [ ] EMPLOYE ne peut pas modifier/supprimer → 403.
- [ ] Produit inexistant → 404.
- [ ] Sans token → 401.

---

## 6. Modèle de Données Produits (Rappel)

```
TABLE products
├── id (PK, SERIAL)
├── name (VARCHAR(100), NOT NULL)
├── category (VARCHAR(50))
├── unit (VARCHAR(20))
├── quantity (INTEGER, DEFAULT 0)
├── min_threshold (INTEGER, DEFAULT 5, CHECK >= 0)
└── created_at (TIMESTAMP, DEFAULT NOW())
```

---

## 7. Points de Transition vers Semaine 6

Semaine 6 (Gestion des stocks - Mouvements) débutera avec :
- Nouvelle table : `inventory_movements` (ENTREE, SORTIE, PERTE).
- Controller stocks : endpoints pour ajouter mouvements.
- Vue `v_product_stock` : calcul dynamique du stock.
- Alertes : détection des seuils critiques.

---

**Document rédigé le : 11/03/2026**  
**Statut : COMPLET ✅**
