# 📋 Semaine 4 – Authentification et Rôles (16/02/2026 - 22/02/2026)

## Objectif
Mettre en place un système d'authentification sécurisé basé sur JWT et un contrôle d'accès basé sur les rôles (RBAC). Les endpoints de login/register doivent être fonctionnels, les rôles `RESPONSABLE` et `EMPLOYE` doivent être appliqués.

---

## 1. Architecture d'Authentification

### Flux Authentification JWT

```
┌────────────────────────────────────────────────────────────────┐
│                         CLIENT (Frontend)                       │
└────────────┬─────────────────────────────────────────────────┬─┘
             │                                                 │
    1. REGISTER/LOGIN                              5. Utilise token
          │                                                 │
          ▼                                                 ▼
┌──────────────────────────────────────────────────────────────┐
│  Backend Express - Routes Auth                               │
│  ├─ POST /api/auth/register (crée user, retourne JWT)       │
│  └─ POST /api/auth/login (vérifie credentials, JWT)         │
└────────────┬──────────────────────────────────────────────┬──┘
             │ 2. Hash password (bcrypt)                   │
             │ 3. Génère token JWT                          │
             │                                              │
             ▼                                              ▼
┌──────────────────────────────┐   ┌──────────────────────────┐
│  PostgreSQL                  │   │  Middleware JWT          │
│  ├─ users (id, username,     │   │  ├─ Extrait token        │
│  │         password_hash,    │   │  ├─ Décode (vérif sig)   │
│  │         role)             │   │  └─ Attache req.user     │
│  └─ products, movements      │   │                          │
└──────────────────────────────┘   └──────┬───────────────────┘
                                          │
                                   4. Protège routes
                                   6. Middleware RBAC
                                   (vérifie rôle)
```

---

## 2. Implémentation : JWT et Bcrypt

### Dépendances Additionnelles

```json
{
  "dependencies": {
    "jsonwebtoken": "^9.0.0",
    "bcrypt": "^5.1.0"
  }
}
```

**Installation** :
```bash
npm install jsonwebtoken bcrypt
```

---

## 3. Controllers d'Authentification

### Fichier: `src/controllers/auth.controllers.js`

```javascript
const pool = require("../db/pool");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

/**
 * POST /api/auth/register
 * Créer un nouvel utilisateur
 */
async function registerUser(req, res, next) {
  try {
    const { username, password, role } = req.body;

    // --- Validation ---
    if (!username || !password) {
      return res.status(400).json({
        error: "Nom d'utilisateur et mot de passe obligatoires"
      });
    }

    // Vérifier l'existence
    const exists = await pool.query(
      "SELECT * FROM users WHERE username = $1",
      [username]
    );
    if (exists.rows.length > 0) {
      return res.status(400).json({
        error: "Cet utilisateur existe déjà"
      });
    }

    // --- Hash password ---
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // --- Standardiser rôle ---
    const userRole = (role && role.toUpperCase() === 'RESPONSABLE')
      ? 'RESPONSABLE'
      : 'EMPLOYE';

    // --- Insertion ---
    const result = await pool.query(
      "INSERT INTO users (username, password, role) VALUES ($1, $2, $3) RETURNING id, username, role, created_at",
      [username, hashedPassword, userRole]
    );

    const user = result.rows[0];

    // --- Générer JWT ---
    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || "8h" }
    );

    res.status(201).json({
      message: "Utilisateur créé avec succès",
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        created_at: user.created_at
      },
      token
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/auth/login
 * Connexion utilisateur
 */
async function loginUser(req, res, next) {
  try {
    const { username, password } = req.body;

    // --- Validation ---
    if (!username || !password) {
      return res.status(400).json({
        error: "Nom d'utilisateur et mot de passe requis"
      });
    }

    // --- Chercher utilisateur ---
    const result = await pool.query(
      "SELECT * FROM users WHERE username = $1",
      [username]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        error: "Identifiants invalides"
      });
    }

    const user = result.rows[0];

    // --- Vérifier password ---
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        error: "Identifiants invalides"
      });
    }

    // --- Générer JWT ---
    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || "8h" }
    );

    res.json({
      message: "Connexion réussie",
      token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role
      }
    });
  } catch (error) {
    next(error);
  }
}

module.exports = { registerUser, loginUser };
```

---

## 4. Middleware de Protection JWT

### Fichier: `src/middleware/auth.middleware.js`

```javascript
const jwt = require("jsonwebtoken");

/**
 * Middleware de protection des routes
 * Vérifie la présence et la validité du JWT
 */
module.exports = (req, res, next) => {
  try {
    // Récupère l'en-tête Authorization
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        error: "Accès refusé. Aucun jeton fourni."
      });
    }

    // Extrait le token
    const token = authHeader.split(" ")[1];

    // Vérifie la signature
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attache les infos utilisateur à la requête
    req.user = decoded;

    next();
  } catch (error) {
    return res.status(401).json({
      error: "Jeton invalide ou expiré."
    });
  }
};
```

---

## 5. Middleware de Contrôle d'Accès par Rôles (RBAC)

### Fichier: `src/middleware/role.middleware.js`

```javascript
/**
 * Middleware RBAC : Autorise l'accès selon les rôles
 * @param {...string} allowedRoles - Rôles autorisés (ex: "RESPONSABLE", "EMPLOYE")
 */
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    // Vérifier que l'utilisateur est authentifié
    if (!req.user) {
      return res.status(401).json({
        error: "Non autorisé. Veuillez vous connecter."
      });
    }

    // Vérifier que le rôle est dans la liste autorisée
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        error: `Accès interdit. Vous n'avez pas les permissions nécessaires (${allowedRoles.join(' ou ')})`
      });
    }

    next();
  };
};

module.exports = authorize;
```

---

## 6. Routes d'Authentification

### Fichier: `src/routes/auth.routes.js`

```javascript
const router = require("express").Router();
const { registerUser, loginUser } = require("../controllers/auth.controllers");

/**
 * Routes d'authentification
 * Préfixe : /api/auth
 */

// Inscription (public)
router.post("/register", registerUser);

// Connexion (public)
router.post("/login", loginUser);

module.exports = router;
```

### Mise à Jour `src/app.js`

```javascript
const express = require("express");
const cors = require("cors");
const healthRoutes = require("./routes/health.routes");
const authRoutes = require("./routes/auth.routes");
const errorHandler = require("./middleware/errorHandler");

const app = express();

// --- Middlewares Globaux ---
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- Enregistrement des Routes ---
app.use("/api/health", healthRoutes);
app.use("/api/auth", authRoutes);

// --- Gestionnaire d'Erreurs ---
app.use(errorHandler);

module.exports = app;
```

---

## 7. Tests avec Postman

### Test 1️⃣ : Inscription (REGISTER)

```http
POST http://localhost:3000/api/auth/register
Content-Type: application/json

{
  "username": "alice",
  "password": "securepassword123",
  "role": "RESPONSABLE"
}
```

**Réponse attendue (201 Created)** :
```json
{
  "message": "Utilisateur créé avec succès",
  "user": {
    "id": 1,
    "username": "alice",
    "role": "RESPONSABLE",
    "created_at": "2026-02-16T10:00:00.000Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

### Test 2️⃣ : Connexion (LOGIN)

```http
POST http://localhost:3000/api/auth/login
Content-Type: application/json

{
  "username": "alice",
  "password": "securepassword123"
}
```

**Réponse attendue (200 OK)** :
```json
{
  "message": "Connexion réussie",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "alice",
    "role": "RESPONSABLE"
  }
}
```

---

### Test 3️⃣ : Bad Credentials

```http
POST http://localhost:3000/api/auth/login
Content-Type: application/json

{
  "username": "alice",
  "password": "wrongpassword"
}
```

**Réponse attendue (401 Unauthorized)** :
```json
{
  "error": "Identifiants invalides"
}
```

---

### Test 4️⃣ : Duplicate User

```http
POST http://localhost:3000/api/auth/register
Content-Type: application/json

{
  "username": "alice",
  "password": "anotherpassword"
}
```

**Réponse attendue (400 Bad Request)** :
```json
{
  "error": "Cet utilisateur existe déjà"
}
```

---

## 8. Protection de Routes (Test d'Intégration)

### Exemple pour la Semaine 5

Vous allez protéger les routes produits ainsi :

```javascript
app.use("/api/products", authMiddleware); // Exige JWT
app.get("/api/products", authorize("EMPLOYE", "RESPONSABLE"), getProducts);
app.post("/api/products", authorize("RESPONSABLE"), addProduct);
app.put("/api/products/:id", authorize("RESPONSABLE"), updateProduct);
app.delete("/api/products/:id", authorize("RESPONSABLE"), deleteProduct);
```

**Résumé** :
- `GET` (lecture) : `EMPLOYE` ET `RESPONSABLE` ✅
- `POST`, `PUT`, `DELETE` (écriture) : `RESPONSABLE` uniquement ✅

---

## 9. Checklist Semaine 4

- [ ] `POST /api/auth/register` crée un utilisateur avec JWT.
- [ ] `POST /api/auth/login` retourne JWT pour identifiants valides.
- [ ] Mot de passe est hashé (bycrypt) en base.
- [ ] Token JWT est signé avec la clé secrète du `.env`.
- [ ] Accès d'un endpoint protégé sans token → 401.
- [ ] Token invalide → 401.
- [ ] Rôle non autorisé → 403.
- [ ] Rôle par défaut : `EMPLOYE` si non spécifié.

---

## 10. Points de Transition vers Semaine 5

Semaine 5 (Gestion des produits - CRUD) débutera avec :
- Routes produits protégées par JWT.
- Contrôle d'accès : `EMPLOYE` lit, `RESPONSABLE` écrit.
- Endpoints GET, POST, PUT, DELETE fonctionnels.
- Validation des données (nom, seuil, etc.).

---

**Document rédigé le : 11/03/2026**  
**Statut : COMPLET ✅**
