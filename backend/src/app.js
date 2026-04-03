const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");
const rateLimit = require("express-rate-limit");
const healthRoutes = require("./routes/health.routes");
const authRoutes = require("./routes/auth.routes");
const productRoutes = require("./routes/products.routes");
const inventoryRoutes = require("./routes/inventory.routes");
const dashboardRoutes = require("./routes/dashboard.routes");
const purchaseOrderRoutes = require("./routes/purchaseOrder.routes");
const locationsRoutes = require("./routes/locations.routes");
const auditRoutes = require("./routes/audit.routes");
const reportsRoutes = require("./routes/reports.routes");
const suggestionsRoutes = require("./routes/suggestions.routes");
const auditLog = require("./middleware/audit.middleware");
const errorHandler = require("./middleware/errorHandler");

/**
 * Configuration de l'application Express
 */
const app = express();

// --- Middlewares Globaux ---
// --- Middlewares de Production & Sécurité ---
app.use(helmet()); // Sécurise les en-têtes HTTP
app.use(compression()); // Compresse les réponses pour la performance

// Restriction CORS (Production vs Développement)
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.FRONTEND_URL 
    : true, // Autorise tout en dev, ou l'URL Vercel en prod
  credentials: true
};
app.use(cors(corsOptions));

// Limiteur de requêtes pour protéger l'API (Anti brute-force léger)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limite à 100 requêtes par IP
  message: { error: "Trop de requêtes, veuillez réessayer plus tard." }
});
app.use("/api/auth/login", limiter); 

app.use(express.json()); 
app.use(express.urlencoded({ extended: true }));

// --- Enregistrement des Routes API ---
app.use("/api/health", healthRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/products", auditLog('PRODUCT'), productRoutes);
app.use("/api/inventory-movements", auditLog('INVENTORY'), inventoryRoutes); // Suivi des flux (Entrée/Sortie/Perte/...)
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/purchase-orders", auditLog('PURCHASE_ORDER'), purchaseOrderRoutes);
app.use("/api/locations", auditLog('LOCATION'), locationsRoutes);
app.use("/api/audit", auditRoutes); // Consultation des logs d'audit
app.use("/api/reports", reportsRoutes); 
app.use("/api/suggestions", suggestionsRoutes); 

// --- Handler 404 (Route non trouvée) ---
app.use((req, res) => {
  res.status(404).json({ error: "Route non trouvée ou API endpoint inexistant." });
});

// --- Gestionnaire d'Erreurs Centralisé ---
// Doit toujours être placé après les routes
app.use(errorHandler);

module.exports = app;