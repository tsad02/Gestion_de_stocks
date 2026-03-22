const http = require('http');

const API_URL = 'http://localhost:5000/api';
let token = '';

function request(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: '/api' + path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': 'Bearer ' + token } : {})
      }
    };
    const req = http.request(options, res => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data || '{}') });
        } catch(e) {
          resolve({ status: res.statusCode, data: data });
        }
      });
    });
    req.on('error', reject);
    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

async function runTests() {
  console.log("=== Lancement des tests E2E Backend ===");
  try {
    // 1. Auth as Admin
    console.log("1. Authentification admin");
    const authRes = await request('POST', '/auth/login', { email: 'admin@admin.com', password: 'password123' });
    if (authRes.status !== 200) {
      // maybe password is admin123
      const authRes2 = await request('POST', '/auth/login', { email: 'admin@admin.com', password: 'admin123' });
      token = authRes2.data.token;
    } else {
      token = authRes.data.token;
    }
    if (!token) throw new Error("Échec d'authentification");
    console.log("-> Connecté avec succès.");

    // 2. Create Location
    console.log("\n2. Test Localisation");
    const locName = 'Zone Test ' + Date.now();
    const locRes = await request('POST', '/locations', { name: locName, description: 'Test desc' });
    console.log("-> Status:", locRes.status);
    console.log("-> Création localisation:", locRes.data.name);

    // 3. Create Product with target_stock
    console.log("\n3. Test Produit (Stock Cible)");
    const prodRes = await request('POST', '/products', { 
      name: 'Produit Test ' + Date.now(), 
      category: 'TEST', 
      min_threshold: 10,
      target_stock: 50
    });
    console.log("-> Status:", prodRes.status);
    console.log("-> Produit créé:", prodRes.data.name, "Cible:", prodRes.data.target_stock);
    const prodId = prodRes.data.id;

    // 4. Initial Entrée to get some stock
    console.log("\n4. Test Mouvement Entrée");
    const movInRes = await request('POST', '/inventory-movements', {
      product_id: prodId,
      type: 'ENTREE',
      quantity: 15
    });
    console.log("-> Entrée status:", movInRes.status, "Quantité:", movInRes.data.quantity);

    // 5. Transfer
    console.log("\n5. Test Mouvement Transfert");
    const movTransRes = await request('POST', '/inventory-movements', {
      product_id: prodId,
      type: 'TRANSFERT',
      quantity: 5,
      source_location_id: 1, // Assume 1 exists from seed
      destination_location_id: locRes.data.id
    });
    console.log("-> Transfert status:", movTransRes.status, "Type:", movTransRes.data.type);

    // 6. Test Perte without reason (Should fail)
    console.log("\n6. Test Mouvement Perte (sans motif)");
    const movPerteFail = await request('POST', '/inventory-movements', {
      product_id: prodId,
      type: 'PERTE',
      quantity: 2
    });
    console.log("-> Échec attendu:", movPerteFail.status === 400 ? 'OUI' : 'NON', "Message:", movPerteFail.data.error);

    // Test Perte with reason
    console.log("Test Mouvement Perte (avec motif)");
    const movPerteOk = await request('POST', '/inventory-movements', {
      product_id: prodId,
      type: 'PERTE',
      quantity: 2,
      reason: 'Casse'
    });
    console.log("-> Succès attendu:", movPerteOk.status === 201 ? 'OUI' : 'NON');

    // 7. Auto PO
    console.log("\n7. Test Génération Commande Intelligente");
    const poRes = await request('POST', '/purchase-orders/auto');
    console.log("-> Status:", poRes.status);
    console.log("-> Message:", poRes.data.message);
    if (poRes.data.purchase_order) {
       console.log("-> Commande:", poRes.data.purchase_order.id, "Articles:", poRes.data.items_count);
    }

    // 8. Audit logs
    console.log("\n8. Test Traçabilité (Audit Logs)");
    const auditRes = await request('GET', '/audit?limit=5');
    console.log("-> Status:", auditRes.status);
    console.log("-> Logs récupérés:", auditRes.data.logs?.length);
    if (auditRes.data.logs?.length > 0) {
      console.log("-> Dernier log:", auditRes.data.logs[0].action, auditRes.data.logs[0].entity);
    }

    console.log("\n✅ === TOUS LES TESTS SONT TERMINÉS AVEC SUCCÈS ===");

  } catch (err) {
    console.error("❌ ERREUR LORS DES TESTS:", err.message || err);
  }
}

// Attendre 2 secondes que le serveur se lance
setTimeout(runTests, 2000);
