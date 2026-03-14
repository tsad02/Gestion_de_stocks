# ✅ Plan Validation – Semaines 2 à 6

## 📊 État Global

| Semaine | Objectif | Statut | Livrables |
|---------|----------|--------|-----------|
| **2** | Conception technique | ✅ COMPLET | Modèle données, ERD, script SQL, vues |
| **3** | Backend initial | ✅ COMPLET | Serveur Express, health check, pool DB |
| **4** | Authentification/Rôles | ✅ COMPLET | JWT, register, login, middleware RBAC |
| **5** | CRUD produits | ✅ COMPLET | GET/POST/PUT/DELETE /api/products |
| **6** | Gestion stocks | ✅ IMPLÉMENTÉ | POST mouvements, vues stock, alertes |

---

## 🔬 Semaine 2 – Conception Technique

**Document** : `SEMAINE_2_CONCEPTION_TECHNIQUE.md`

### Checkpoints Validation

- [ ] **Fichier** : `database/db_gestion_de_stocks.sql` existe et est complet
- [ ] **Tables** : users, products, inventory_movements crées avec contraintes
- [ ] **Types ENUM** : user_role, movement_type définis
- [ ] **Vues** : v_product_stock, v_alerts_critical_products disponibles
- [ ] **Indices** : idx_movements_product_id, idx_movements_user_id, idx_movements_created_at
- [ ] **Intégrité** : Clés étrangères avec ON DELETE RESTRICT

### Test SQL à Effectuer

```sql
-- Connexion à la base
psql -U postgres -d gestion_stocks

-- Vérifier les tables
\dt

-- Vérifier les types énumérés
SELECT typname FROM pg_type WHERE typname IN ('user_role', 'movement_type');

-- Tester une requête simple
SELECT COUNT(*) FROM products;
```

**Résultat attendu** : Pas d'erreur, tables et vues disponibles.

---

## 🔬 Semaine 3 – Backend Initial

**Document** : `SEMAINE_3_MISE_EN_PLACE_BACKEND.md`

### Checkpoints Validation

- [ ] **Dossier** : `backend/src` structuré (app.js, server.js, db/, routes/, controllers/, middleware/)
- [ ] **npm install** : Les dépendances core installées (`express`, `pg`, `cors`, `dotenv`)
- [ ] **Fichier** : `backend/.env` configuré avec PORT, DB_*, JWT_SECRET
- [ ] **Pool de connexion** : `src/db/pool.js` établit connexion PostgreSQL
- [ ] **Serveur Express** : `src/app.js` initialise middlewares et routes
- [ ] **Lancement** : `npm run dev` démarre sans erreur

### Test Manuel à Effectuer

```bash
cd backend
npm install
npm run dev
```

Puis en parallèle :

```bash
curl http://localhost:3000/api/health
```

**Résultat attendu (200 OK)** :
```json
{
  "status": "✅ OK",
  "timestamp": "2026-03-11T...",
  "message": "Le serveur de gestion de stock est prêt."
}
```

---

## 🔬 Semaine 4 – Authentification et Rôles

**Document** : `SEMAINE_4_AUTHENTIFICATION_ROLES.md`

### Checkpoints Validation

- [ ] **Dépendances** : `jsonwebtoken`, `bcrypt` installés
- [ ] **Controller** : `src/controllers/auth.controllers.js` avec registerUser, loginUser
- [ ] **Routes** : `src/routes/auth.routes.js` expose `/register` et `/login`
- [ ] **Middleware JWT** : `src/middleware/auth.middleware.js` protège les routes
- [ ] **Middleware RBAC** : `src/middleware/role.middleware.js` autorise par rôle
- [ ] **Variables .env** : JWT_SECRET, JWT_EXPIRE définis

### Tests Postman à Effectuer

#### 1️⃣ Register

```http
POST http://localhost:3000/api/auth/register
Content-Type: application/json

{
  "username": "alice",
  "password": "securepassword123",
  "role": "RESPONSABLE"
}
```

**Résultat attendu (201)** : Token JWT retourné ✅

#### 2️⃣ Login

```http
POST http://localhost:3000/api/auth/login
Content-Type: application/json

{
  "username": "alice",
  "password": "securepassword123"
}
```

**Résultat attendu (200)** : Token JWT retourné ✅

#### 3️⃣ Bad Credentials

```http
POST http://localhost:3000/api/auth/login
Content-Type: application/json

{
  "username": "alice",
  "password": "wrongpassword"
}
```

**Résultat attendu (401)** : `"error": "Identifiants invalides"` ✅

---

## 🔬 Semaine 5 – CRUD Produits

**Document** : `SEMAINE_5_GESTION_PRODUITS_CRUD.md`

### Checkpoints Validation

- [ ] **Controller** : `src/controllers/products.controller.js` complet (get, getById, add, update, delete)
- [ ] **Routes** : `src/routes/products.routes.js` protégées par authMiddleware
- [ ] **Autorisation** : GET pour EMPLOYE+RESPONSABLE, POST/PUT/DELETE pour RESPONSABLE seulement
- [ ] **Validation** : Nom obligatoire, seuil ≥ 0
- [ ] **app.js** : Import et enregistrement des productRoutes

### Tests Postman à Effectuer

#### 1️⃣ List Products (EMPLOYE peut lire)

```http
GET http://localhost:3000/api/products
Authorization: Bearer <TOKEN_EMPLOYE>
```

**Résultat attendu (200)** : Tableau de produits ✅

#### 2️⃣ Create Product (RESPONSABLE seulement)

```http
POST http://localhost:3000/api/products
Authorization: Bearer <TOKEN_RESPONSABLE>
Content-Type: application/json

{
  "name": "Farine blanche",
  "category": "Ingrédients",
  "unit": "kg",
  "min_threshold": 10,
  "quantity": 50
}
```

**Résultat attendu (201)** : Produit créé ✅

#### 3️⃣ Update Product

```http
PUT http://localhost:3000/api/products/1
Authorization: Bearer <TOKEN_RESPONSABLE>
Content-Type: application/json

{
  "quantity": 45
}
```

**Résultat attendu (200)** : Produit mis à jour ✅

#### 4️⃣ Delete Product

```http
DELETE http://localhost:3000/api/products/1
Authorization: Bearer <TOKEN_RESPONSABLE>
```

**Résultat attendu (200)** : Produit supprimé ✅

#### 5️⃣ EMPLOYE ne peut pas créer (403)

```http
POST http://localhost:3000/api/products
Authorization: Bearer <TOKEN_EMPLOYE>
Content-Type: application/json

{
  "name": "Produit Test"
}
```

**Résultat attendu (403)** : `"error": "Accès interdit..."` ✅

---

## 🔬 Semaine 6 – Gestion des Stocks

**Document** : `SEMAINE_6_GESTION_STOCKS.md`

### Checkpoints Validation

- [ ] **Controller** : `src/controllers/inventory.controller.js` créé (addMovement, listMovements, getMovementById, getMovementsByProduct)
- [ ] **Routes** : `src/routes/inventory.routes.js` créé
- [ ] **app.js** : Import et enregistrement des inventoryRoutes
- [ ] **init-db.js** : Création table inventory_movements + vues v_product_stock, v_alerts_critical_products
- [ ] **Validation** : Type dans ENTREE/SORTIE/PERTE, quantity > 0

### Tests Postman à Effectuer

#### 1️⃣ Ajouter Mouvement ENTREE

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

**Résultat attendu (201)** : Mouvement enregistré ✅

#### 2️⃣ Ajouter Mouvement SORTIE

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

**Résultat attendu (201)** : Mouvement enregistré ✅

#### 3️⃣ Lister les Mouvements

```http
GET http://localhost:3000/api/inventory-movements
Authorization: Bearer <TOKEN_EMPLOYE>
```

**Résultat attendu (200)** : Tableau des mouvements ✅

#### 4️⃣ Historique d'un Produit

```http
GET http://localhost:3000/api/inventory-movements/product/1
Authorization: Bearer <TOKEN_EMPLOYE>
```

**Résultat attendu (200)** : Mouvements du produit 1 ✅

#### 5️⃣ Validation – Type invalide

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

**Résultat attendu (400)** : `"error": "Type invalide..."` ✅

### Tests SQL à Effectuer

```sql
-- Vérifier la vue de stock
SELECT * FROM v_product_stock WHERE product_id = 1;

-- Résult attendu : stock_actuel = 50 - 15 = 35

-- Vérifier les alertes critiques
INSERT INTO inventory_movements (product_id, user_id, type, quantity)
VALUES (2, 1, 'ENTREE', 5);

SELECT * FROM v_alerts_critical_products;
-- (si produit 2 a min_threshold = 100, le stock 5 devrait y apparaître)
```

---

## 🚀 Commandes d'Exécution Globales

### Initialisation Complète

```bash
# 1. Initialiser la base PostgreSQL depuis le script SQL
psql -U postgres -f database/db_gestion_de_stocks.sql

# 2. Installer les dépendances Node.js
cd backend
npm install

# 3. Configurer les variables d'environnement
cp .env.example .env
# Éditer .env avec vos paramètres

# 4. Lancer le serveur
npm run dev
```

### Tests Automatisés (Optionnel)

Si vous utilisez Postman, exportez les scénarios de test en **Collections** pour réutiliser automatiquement les tokens et enchaîner les requêtes.

---

## 📋 Checklist Synthétique pour Rapport

- [ ] Semaine 2 : Script SQL validé, tables crées, vues fonctionnelles
- [ ] Semaine 3 : Serveur Express démarre, health check OK
- [ ] Semaine 4 : Register, login fonctionnent, tokens signés, rôles vérifiés
- [ ] Semaine 5 : CRUD produits complet, RBAC appliqué (EMPLOYE lit, RESPONSABLE écrit)
- [ ] Semaine 6 : Mouvements enregistrés, vues de stock et alertes générées, endpoint API complet

---

## 📸 Captures à Inclure dans Rapport

Pour chaque semaine, prenez une capture Postman montrant :

1. **Semaine 3** : Réponse 200 de `/api/health`
2. **Semaine 4** : Token retourné par `/api/auth/login`
3. **Semaine 5** : Produit créé via `POST /api/products`
4. **Semaine 6** : Mouvement enregistré et vue SQL avec stock calculé

---

**Mise à jour : 11/03/2026**  
**Statut : PRÊT POUR VALIDATION** ✅
