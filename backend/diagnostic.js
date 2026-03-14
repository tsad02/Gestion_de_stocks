#!/usr/bin/env node
/**
 * Diagnostic Complet Semaine 6
 * Vérifie que tous les fichiers et dépendances sont en place
 */

const fs = require("fs");
const path = require("path");

const colors = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  cyan: "\x1b[36m"
};

function log(color, msg) {
  console.log(`${colors[color]}${msg}${colors.reset}`);
}

function checkFile(filePath, description) {
  const exists = fs.existsSync(filePath);
  const status = exists ? "✅" : "❌";
  log(exists ? "green" : "red", `${status} ${description}`);
  return exists;
}

function checkDir(dirPath, description) {
  const exists = fs.existsSync(dirPath);
  const status = exists ? "✅" : "❌";
  log(exists ? "green" : "red", `${status} ${description}`);
  return exists;
}

log("cyan", "\n╔═══════════════════════════════════════════════════════════╗");
log("cyan", "║   DIAGNOSTIC COMPLET – SEMAINE 6 (Gestion Stocks)         ║");
log("cyan", "╚═══════════════════════════════════════════════════════════╝\n");

let passed = 0;
let failed = 0;

// Controllers
log("yellow", "📁 CONTROLLERS:");
if (checkFile("./src/controllers/inventory.controller.js", "  - inventory.controller.js")) passed++; else failed++;
if (checkFile("./src/controllers/products.controller.js", "  - products.controller.js")) passed++; else failed++;
if (checkFile("./src/controllers/auth.controllers.js", "  - auth.controllers.js")) passed++; else failed++;

// Routes
log("yellow", "\n📁 ROUTES:");
if (checkFile("./src/routes/inventory.routes.js", "  - inventory.routes.js")) passed++; else failed++;
if (checkFile("./src/routes/products.routes.js", "  - products.routes.js")) passed++; else failed++;
if (checkFile("./src/routes/auth.routes.js", "  - auth.routes.js")) passed++; else failed++;
if (checkFile("./src/routes/health.routes.js", "  - health.routes.js")) passed++; else failed++;

// Middleware
log("yellow", "\n📁 MIDDLEWARE:");
if (checkFile("./src/middleware/auth.middleware.js", "  - auth.middleware.js")) passed++; else failed++;
if (checkFile("./src/middleware/role.middleware.js", "  - role.middleware.js")) passed++; else failed++;

// Main files
log("yellow", "\n📁 FICHIERS PRINCIPAUX:");
if (checkFile("./.env", "  - .env (configuration)")) passed++; else failed++;
if (checkFile("./src/app.js", "  - app.js")) passed++; else failed++;
if (checkFile("./src/server.js", "  - server.js")) passed++; else failed++;

// Tests et scripts
log("yellow", "\n📁 TESTS & SCRIPTS:");
if (checkFile("./test_semaine_6.js", "  - test_semaine_6.js")) passed++; else failed++;
if (checkFile("./start_server.bat", "  - start_server.bat")) passed++; else failed++;
if (checkFile("./test.bat", "  - test.bat")) passed++; else failed++;
if (checkFile("./check_db_connection.js", "  - check_db_connection.js")) passed++; else failed++;

// Database files
log("yellow", "\n📁 BASE DE DONNÉES:");
if (checkFile("../database/db_gestion_de_stocks.sql", "  - db_gestion_de_stocks.sql")) passed++; else failed++;

// Documentation
log("yellow", "\n📁 DOCUMENTATION:");
if (checkFile("../SEMAINE_2_CONCEPTION_TECHNIQUE.md", "  - SEMAINE_2_...")) passed++; else failed++;
if (checkFile("../SEMAINE_3_MISE_EN_PLACE_BACKEND.md", "  - SEMAINE_3_...")) passed++; else failed++;
if (checkFile("../SEMAINE_4_AUTHENTIFICATION_ROLES.md", "  - SEMAINE_4_...")) passed++; else failed++;
if (checkFile("../SEMAINE_5_GESTION_PRODUITS_CRUD.md", "  - SEMAINE_5_...")) passed++; else failed++;
if (checkFile("../SEMAINE_6_GESTION_STOCKS.md", "  - SEMAINE_6_...")) passed++; else failed++;
if (checkFile("../SEMAINE_6_COMPLETION_100_POURCENT.md", "  - SEMAINE_6_COMPLETION_...")) passed++; else failed++;

// Dépendances Node
log("yellow", "\n📦 DÉPENDANCES NODE:");
const packageJsonPath = "./package.json";
if (fs.existsSync(packageJsonPath)) {
  try {
    const pkg = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));
    const deps = Object.keys(pkg.dependencies || {});
    
    const required = ["express", "pg", "jsonwebtoken", "bcrypt", "cors", "dotenv"];
    required.forEach(dep => {
      if (deps.includes(dep)) {
        log("green", `  ✅ ${dep}`);
        passed++;
      } else {
        log("red", `  ❌ ${dep}`);
        failed++;
      }
    });
  } catch (e) {
    log("red", "  ❌ Erreur lecture package.json");
    failed++;
  }
} else {
  log("red", "  ❌ package.json manquant");
  failed++;
}

// Résumé
log("cyan", "\n╔═══════════════════════════════════════════════════════════╗");
log("cyan", `║  RÉSUMÉ : ${passed} ✅  |  ${failed} ❌                                    ║`);
log("cyan", "╚═══════════════════════════════════════════════════════════╝\n");

if (failed === 0) {
  log("green", "🎉 TOUS LES FICHIERS ET DÉPENDANCES SONT EN PLACE !\n");
  log("green", "Prochaines étapes :");
  log("green", "  1. Double-cliquez sur start_server.bat (ou: node src/server.js)");
  log("green", "  2. Dans un autre terminal, double-cliquez sur test.bat (ou: node test_semaine_6.js)");
  log("green", "  3. Consultez SEMAINE_6_COMPLETION_100_POURCENT.md pour les détails\n");
} else {
  log("yellow", `⚠️  ${failed} fichier(s) manquant(s) ou dépendance(s) non installée(s)\n`);
  log("yellow", "Solutions :");
  log("yellow", "  - npm install (installer les dépendances)");
  log("yellow", "  - Vérifier les chemins des fichiers\n");
}
