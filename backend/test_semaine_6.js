#!/usr/bin/env node
/**
 * Test Automatisé Semaine 6 – Gestion des Stocks
 * Lance une test suite complète de l'API
 * Usage: node test_semaine_6.js
 */

const http = require("http");

const BASE_URL = "http://localhost:3000/api";

// Couleurs pour le terminal
const colors = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m"
};

function log(color, message) {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

/**
 * Effectue une requête HTTP
 */
function makeRequest(method, path, body = null, token = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(BASE_URL + path);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: method,
      headers: {
        "Content-Type": "application/json",
        ...(token && { "Authorization": `Bearer ${token}` })
      }
    };

    const req = http.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, data: data });
        }
      });
    });

    req.on("error", reject);

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

/**
 * Test Suite
 */
async function runTests() {
  log("blue", "\n╔════════════════════════════════════════════════════════════╗");
  log("blue", "║        TEST AUTOMATISÉ – SEMAINE 6 (Gestion Stocks)        ║");
  log("blue", "╚════════════════════════════════════════════════════════════╝\n");

  let testsPassed = 0;
  let testsFailed = 0;
  let tokenResponsable = null;
  let tokenEmploye = null;
  let productId = null;

  try {
    // ===== ÉTAPE 1 : Health Check =====
    log("cyan", "📍 ÉTAPE 1 : Health Check");
    try {
      const res = await makeRequest("GET", "/health");
      if (res.status === 200) {
        log("green", "✅ Health check OK");
        testsPassed++;
      } else {
        log("red", `❌ Health check échoué (${res.status})`);
        testsFailed++;
      }
    } catch (e) {
      log("red", `❌ Serveur non accessible (${e.message})`);
      log("yellow", "💡 Assurez-vous que 'npm run dev' est lancé");
      testsFailed++;
      return;
    }

    // ===== ÉTAPE 2 : Register Responsable =====
    log("cyan", "\n📍 ÉTAPE 2 : Créer un utilisateur RESPONSABLE");
    try {
      const res = await makeRequest("POST", "/auth/register", {
        username: `responsable_${Date.now()}`,
        password: "SecurePassword123!",
        role: "RESPONSABLE"
      });

      if (res.status === 201 && res.data.token) {
        tokenResponsable = res.data.token;
        log("green", `✅ Responsable créé (ID: ${res.data.user.id})`);
        testsPassed++;
      } else {
        log("red", `❌ Création échouée (${res.status})`);
        testsFailed++;
      }
    } catch (e) {
      log("red", `❌ Erreur: ${e.message}`);
      testsFailed++;
    }

    // ===== ÉTAPE 3 : Register Employé =====
    log("cyan", "\n📍 ÉTAPE 3 : Créer un utilisateur EMPLOYÉ");
    try {
      const res = await makeRequest("POST", "/auth/register", {
        username: `employe_${Date.now()}`,
        password: "EmployeePass123!",
        role: "EMPLOYE"
      });

      if (res.status === 201 && res.data.token) {
        tokenEmploye = res.data.token;
        log("green", `✅ Employé créé (ID: ${res.data.user.id})`);
        testsPassed++;
      } else {
        log("red", `❌ Création échouée (${res.status})`);
        testsFailed++;
      }
    } catch (e) {
      log("red", `❌ Erreur: ${e.message}`);
      testsFailed++;
    }

    // ===== ÉTAPE 4 : Créer un produit =====
    log("cyan", "\n📍 ÉTAPE 4 : Créer un produit (RESPONSABLE)");
    try {
      const res = await makeRequest("POST", "/products", {
        name: `Farine Test ${Date.now()}`,
        category: "Ingrédients",
        unit: "kg",
        min_threshold: 10,
        quantity: 0
      }, tokenResponsable);

      if (res.status === 201 && res.data.id) {
        productId = res.data.id;
        log("green", `✅ Produit créé (ID: ${productId})`);
        testsPassed++;
      } else {
        log("red", `❌ Création échouée (${res.status})`);
        testsFailed++;
      }
    } catch (e) {
      log("red", `❌ Erreur: ${e.message}`);
      testsFailed++;
    }

    if (!productId) {
      log("red", "❌ Impossible de continuer sans produit");
      return;
    }

    // ===== ÉTAPE 5 : Ajouter un mouvement ENTREE =====
    log("cyan", "\n📍 ÉTAPE 5 : Ajouter mouvement ENTREE (RESPONSABLE)");
    try {
      const res = await makeRequest("POST", "/inventory-movements", {
        product_id: productId,
        type: "ENTREE",
        quantity: 50,
        reason: "Livraison fournisseur"
      }, tokenResponsable);

      if (res.status === 201 && res.data.movement) {
        log("green", `✅ Mouvement ENTREE créé (ID: ${res.data.movement.id})`);
        testsPassed++;
      } else {
        log("red", `❌ Création échouée (${res.status})`);
        testsFailed++;
      }
    } catch (e) {
      log("red", `❌ Erreur: ${e.message}`);
      testsFailed++;
    }

    // ===== ÉTAPE 6 : Ajouter un mouvement SORTIE =====
    log("cyan", "\n📍 ÉTAPE 6 : Ajouter mouvement SORTIE (RESPONSABLE)");
    try {
      const res = await makeRequest("POST", "/inventory-movements", {
        product_id: productId,
        type: "SORTIE",
        quantity: 15,
        reason: "Vente du jour"
      }, tokenResponsable);

      if (res.status === 201 && res.data.movement) {
        log("green", `✅ Mouvement SORTIE créé (ID: ${res.data.movement.id})`);
        testsPassed++;
      } else {
        log("red", `❌ Création échouée (${res.status})`);
        testsFailed++;
      }
    } catch (e) {
      log("red", `❌ Erreur: ${e.message}`);
      testsFailed++;
    }

    // ===== ÉTAPE 7 : Lister les mouvements (EMPLOYÉ peut lire) =====
    log("cyan", "\n📍 ÉTAPE 7 : Lister les mouvements (EMPLOYÉ)");
    try {
      const res = await makeRequest("GET", "/inventory-movements", null, tokenEmploye);

      if (res.status === 200 && Array.isArray(res.data.movements)) {
        log("green", `✅ Mouvements récupérés (${res.data.movements.length})`);
        testsPassed++;
      } else {
        log("red", `❌ Requête échouée (${res.status})`);
        testsFailed++;
      }
    } catch (e) {
      log("red", `❌ Erreur: ${e.message}`);
      testsFailed++;
    }

    // ===== ÉTAPE 8 : Historique d'un produit =====
    log("cyan", "\n📍 ÉTAPE 8 : Récupérer historique (EMPLOYÉ)");
    try {
      const res = await makeRequest("GET", `/inventory-movements/product/${productId}`, null, tokenEmploye);

      if (res.status === 200 && res.data.movements) {
        log("green", `✅ Historique récupéré (${res.data.movements.length} mouvements)`);
        testsPassed++;
      } else {
        log("red", `❌ Requête échouée (${res.status})`);
        testsFailed++;
      }
    } catch (e) {
      log("red", `❌ Erreur: ${e.message}`);
      testsFailed++;
    }

    // ===== ÉTAPE 9 : Validation – Type invalide =====
    log("cyan", "\n📍 ÉTAPE 9 : Validation – Type mouvement invalide");
    try {
      const res = await makeRequest("POST", "/inventory-movements", {
        product_id: productId,
        type: "INVALIDE",
        quantity: 10
      }, tokenResponsable);

      if (res.status === 400) {
        log("green", `✅ Validation correcte (erreur 400 attendue)`);
        testsPassed++;
      } else {
        log("red", `❌ Validation échouée (status ${res.status}, attendu 400)`);
        testsFailed++;
      }
    } catch (e) {
      log("red", `❌ Erreur: ${e.message}`);
      testsFailed++;
    }

    // ===== ÉTAPE 10 : Validation – Quantité invalide =====
    log("cyan", "\n📍 ÉTAPE 10 : Validation – Quantité négative");
    try {
      const res = await makeRequest("POST", "/inventory-movements", {
        product_id: productId,
        type: "ENTREE",
        quantity: -10
      }, tokenResponsable);

      if (res.status === 400) {
        log("green", `✅ Validation correcte (erreur 400 attendue)`);
        testsPassed++;
      } else {
        log("red", `❌ Validation échouée (status ${res.status}, attendu 400)`);
        testsFailed++;
      }
    } catch (e) {
      log("red", `❌ Erreur: ${e.message}`);
      testsFailed++;
    }

    // ===== ÉTAPE 11 : Contrôle d'accès – EMPLOYÉ ne peut pas créer =====
    log("cyan", "\n📍 ÉTAPE 11 : Contrôle d'accès – EMPLOYÉ ne peut pas créer");
    try {
      const res = await makeRequest("POST", "/inventory-movements", {
        product_id: productId,
        type: "ENTREE",
        quantity: 25
      }, tokenEmploye);

      if (res.status === 403) {
        log("green", `✅ Accès refusé correctement (403)`);
        testsPassed++;
      } else {
        log("red", `❌ Contrôle d'accès échoué (status ${res.status}, attendu 403)`);
        testsFailed++;
      }
    } catch (e) {
      log("red", `❌ Erreur: ${e.message}`);
      testsFailed++;
    }

    // ===== Résumé =====
    log("blue", "\n╔════════════════════════════════════════════════════════════╗");
    log("blue", `║  RÉSUMÉ : ${testsPassed} ✅  |  ${testsFailed} ❌                                 ║`);
    log("blue", "╚════════════════════════════════════════════════════════════╝");

    if (testsFailed === 0) {
      log("green", "\n🎉 TOUS LES TESTS SONT PASSÉS ! Semaine 6 est 100% terminée !\n");
    } else {
      log("yellow", `\n⚠️  ${testsFailed} test(s) ont échoué. Vérifiez les erreurs ci-dessus.\n`);
    }
  } catch (error) {
    log("red", `\n❌ Erreur fatale: ${error.message}\n`);
  }
}

// Lancer les tests
runTests();
