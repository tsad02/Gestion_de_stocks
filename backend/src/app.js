const express = require("express");
const cors = require("cors");
const healthRoutes = require("./routes/health.routes");
const authRoutes = require("./routes/auth.routes");
const productRoutes = require("./routes/products.routes");
const inventoryRoutes = require("./routes/inventory.routes");
const dashboardRoutes = require("./routes/dashboard.routes");
const purchaseOrderRoutes = require("./routes/purchaseOrder.routes");
const locationsRoutes = require("./routes/locations.routes");
const auditRoutes = require("./routes/audit.routes");
const auditLog = require("./middleware/audit.middleware");
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
app.use("/api/health", healthRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/products", auditLog('PRODUCT'), productRoutes);
app.use("/api/inventory-movements", auditLog('INVENTORY'), inventoryRoutes); 
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/purchase-orders", auditLog('PURCHASE_ORDER'), purchaseOrderRoutes);
app.use("/api/locations", auditLog('LOCATION'), locationsRoutes);
app.use("/api/audit", auditRoutes); // Routes d'audit en lecture

// --- Gestionnaire d'Erreurs Centralisé ---
// Doit toujours être placé après les routes
app.use(errorHandler);

module.exports = app;