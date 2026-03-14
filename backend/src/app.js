const express = require("express");
const cors = require("cors");
const healthRoutes = require("./routes/health.routes");
const authRoutes = require("./routes/auth.routes");
const productRoutes = require("./routes/products.routes");
const inventoryRoutes = require("./routes/inventory.routes");
const dashboardRoutes = require("./routes/dashboard.routes");
const errorHandler = require("./middleware/errorHandler");

/**
 * Configuration de l'application Express
 */
const app = express();

// --- Middlewares Globaux ---
app.use(cors()); // Autorise les requêtes cross-origin
app.use(express.json()); // Permet de lire le corps des requêtes en format JSON
app.use(express.urlencoded({ extended: true })); // Permet de lire les formulaires URL-encoded

// --- Enregistrement des Routes API ---
app.use("/api/health", healthRoutes);              // Route de vérification d'état
app.use("/api/auth", authRoutes);                  // Routes d'authentification (login, register)
app.use("/api/products", productRoutes);           // Routes de gestion des produits (CRUD)
app.use("/api/inventory-movements", inventoryRoutes); // Routes de gestion des mouvements de stock
app.use("/api/dashboard", dashboardRoutes);        // Routes du dashboard (KPI, statistiques)

// --- Gestionnaire d'Erreurs Centralisé ---
// Doit toujours être placé après les routes
app.use(errorHandler);

module.exports = app;