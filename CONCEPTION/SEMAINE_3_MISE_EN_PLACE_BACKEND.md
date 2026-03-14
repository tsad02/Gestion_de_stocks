# 📋 Semaine 3 – Mise en place du Back-end (09/02/2026 - 15/02/2026)

## Objectif
Mettre en place l'infrastructure back-end : serveur Express, connexion PostgreSQL, routes initiales et health check. Produire une API fonctionnelle capable de répondre aux requêtes HTTP.

---

## 1. Initialisation du Projet Node.js

### Structure du Projet

```
backend/
├── src/
│   ├── app.js                  # Configuration Express
│   ├── server.js               # Lancement du serveur
│   ├── config/
│   │   └── db.js               # Configuration DB
│   ├── db/
│   │   ├── pool.js             # Pool de connexion
│   │   ├── init-db.js          # Script initialisation
│   │   └── ...
│   ├── middleware/
│   │   ├── errorHandler.js     # Middleware d'erreur
│   │   └── notFound.js         # 404
│   └── routes/
│       └── health.routes.js    # Routes santé
├── package.json
├── .env
└── check_health.js             # Script de vérification
```

### Package.json - Dépendances Essentielles

```json
{
  "name": "gestion-stocks-api",
  "version": "1.0.0",
  "description": "API REST pour gestion des stocks",
  "main": "src/server.js",
  "scripts": {
    "start": "node src/server.js",
    "dev": "nodemon src/server.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "pg": "^8.8.0",
    "dotenv": "^16.0.3",
    "cors": "^2.8.5"
  },
  "devDependencies": {
    "nodemon": "^2.0.20"
  }
}
```

---

## 2. Configuration du Serveur Express

### Fichier: `src/app.js`

```javascript
const express = require("express");
const cors = require("cors");
const healthRoutes = require("./routes/health.routes");
const errorHandler = require("./middleware/errorHandler");

const app = express();

// --- Middlewares Globaux ---
app.use(cors());                          // Autorise les requêtes cross-origin
app.use(express.json());                  // Parse JSON
app.use(express.urlencoded({ extended: true })); // Parse formulaires

// --- Enregistrement des Routes ---
app.use("/api/health", healthRoutes);    // Route de santé (check serveur)

// --- Gestionnaire d'Erreurs ---
app.use(errorHandler);                    // Toujours en dernier

module.exports = app;
```

### Fichier: `src/server.js`

```javascript
require("dotenv").config();
const app = require("./app");

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Serveur démarré sur LE PORT : ${PORT}`);
  console.log(`📍 URL : http://localhost:${PORT}`);
  console.log(`📚 MODE : ${process.env.NODE_ENV || 'Développement'}`);
});
```

---

## 3. Configuration de la Base de Données

### Fichier: `src/db/pool.js`

```javascript
const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
  user: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD || "password",
  host: process.env.DB_HOST || "localhost",
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || "gestion_stocks"
});

pool.on("error", (err) => {
  console.error("❌ Erreur inattendue du pool:", err);
});

pool.on("connect", () => {
  console.log("✅ Connecté à PostgreSQL");
});

module.exports = pool;
```

### Fichier: `src/db/init-db.js`

```javascript
const pool = require("./pool");

async function initializeDatabase() {
  try {
    console.log("🛠️ Initialisation des tables...");

    // Création des tables si elles n'existent pas
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(20) DEFAULT 'EMPLOYE',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        category VARCHAR(50),
        unit VARCHAR(20),
        quantity INTEGER DEFAULT 0,
        min_threshold INTEGER DEFAULT 5,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log("✅ Initialisation terminée.");
    process.exit(0);
  } catch (error) {
    console.error("❌ Erreur:", error.message);
    process.exit(1);
  }
}

initializeDatabase();
```

### Variables d'Environnement (`.env`)

```env
# Serveur
PORT=3000
NODE_ENV=development

# Base de données
DB_USER=postgres
DB_PASSWORD=motdepasse
DB_HOST=localhost
DB_PORT=5432
DB_NAME=gestion_stocks

# JWT (pour semaine 4)
JWT_SECRET=votre_cle_secrete_super_longue
JWT_EXPIRE=8h
```

---

## 4. Routes et Endpoints Initiaux

### Fichier: `src/routes/health.routes.js`

```javascript
const router = require("express").Router();
const pool = require("../db/pool");

/**
 * GET /api/health
 * Vérifier que le serveur est en ligne
 */
router.get("/", async (req, res, next) => {
  try {
    const result = await pool.query("SELECT NOW()");
    res.json({
      status: "✅ OK",
      timestamp: result.rows[0].now,
      message: "Le serveur de gestion de stock est prêt."
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
```

### Fichier: `src/middleware/errorHandler.js`

```javascript
/**
 * Gestionnaire d'erreurs centralisé
 * Doit être enregistré en dernier
 */
module.exports = (err, req, res, next) => {
  console.error("❌ Erreur:", err.message);

  const statusCode = err.statusCode || 500;
  const message = err.message || "Erreur serveur interne";

  res.status(statusCode).json({
    error: message,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack })
  });
};
```

---

## 5. Démarrage et Test

### Commandes

```bash
# Installation des dépendances
cd backend
npm install

# Initialiser la base (optionnel, si besoin)
node src/db/init-db.js

# Lancement en développement (avec nodemon)
npm run dev

# Lancement simple
npm start
```

### Test avec Postman ou cURL

#### 1️⃣ Health Check (santé du serveur)

```http
GET http://localhost:3000/api/health
```

**Réponse attendue (200 OK)** :
```json
{
  "status": "✅ OK",
  "timestamp": "2026-02-15T10:30:00.000Z",
  "message": "Le serveur de gestion de stock est prêt."
}
```

#### 2️⃣ Route inexistante (404)

```http
GET http://localhost:3000/api/inexistant
```

**Réponse attendue (404)** :
```json
{
  "error": "Route non trouvée"
}
```

---

## 6. Validation Fonctionnelle

### Checklist Semaine 3

- [ ] Serveur démarre sans erreur (port 3000 disponible).
- [ ] `GET /api/health` retourne 200 avec timestamp PostgreSQL.
- [ ] La connexion à PostgreSQL est établie.
- [ ] CORS autorise les requêtes du client.
- [ ] Erreurs sont loggées et catchées correctement.
- [ ] Le fichier `.env` est copié de `.env.example` et configuré.
- [ ] Les dépendances Node.js sont installées (`npm install`).

### Tests Manuels

**Terminal 1 : Lancer le serveur**
```bash
npm run dev
```

**Terminal 2 : Tester la santé**
```bash
curl http://localhost:3000/api/health
```

**Démonstration pour le rapport** :
> À cette étape, capturer une screenshot du serveur démarré et une réponse POST de `/api/health` depuis Postman.

---

## 7. Points de Transition vers Semaine 4

La semaine 4 (Authentification et Rôles) débutera avec :
- Routes `/api/auth/register` et `/api/auth/login`.
- Middleware JWT pour protéger les routes.
- Middleware RBAC pour vérifier les rôles.
- Hachage des mots de passe avec `bcrypt`.

---

**Document rédigé le : 11/03/2026**  
**Statut : COMPLET ✅**
