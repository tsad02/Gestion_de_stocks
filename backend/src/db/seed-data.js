const bcrypt = require("bcrypt");
const pool = require("./pool");

/**
 * Script de peuplement de la base de données avec des données de test
 * Crée:
 * - 2 utilisateurs (1 RESPONSABLE, 1 EMPLOYE)
 * - 5 produits de test
 */
async function seedDatabase() {
  try {
    console.log("🌱 Peuplement de la base de données...\n");

    // ===== ÉTAPE 1: Créer les utilisateurs =====
    console.log("1️⃣ Création des utilisateurs...");

    // Utilisateur RESPONSABLE
    const hashedPassword1 = await bcrypt.hash("password123", 10);
    await pool.query(
      `INSERT INTO users (username, password, role) 
       VALUES ($1, $2, $3)
       ON CONFLICT (username) DO NOTHING`,
      ["responsable1", hashedPassword1, "RESPONSABLE"]
    );
    console.log("   ✅ Utilisateur 'responsable1' créé (password: password123)");

    // Utilisateur EMPLOYE
    const hashedPassword2 = await bcrypt.hash("password456", 10);
    await pool.query(
      `INSERT INTO users (username, password, role) 
       VALUES ($1, $2, $3)
       ON CONFLICT (username) DO NOTHING`,
      ["employe1", hashedPassword2, "EMPLOYE"]
    );
    console.log("   ✅ Utilisateur 'employe1' créé (password: password456)\n");

    // ===== ÉTAPE 2: Créer les produits =====
    console.log("2️⃣ Création des produits de test...");

    const products = [
      { name: "Tomate", category: "Légumes", unit: "kg", quantity: 15, min_threshold: 20 },
      { name: "Oeufs", category: "Produits laitiers", unit: "dz", quantity: 45, min_threshold: 50 },
      { name: "Pain", category: "Boulangerie", unit: "pièce", quantity: 30, min_threshold: 20 },
      { name: "Fromage", category: "Produits laitiers", unit: "kg", quantity: 8, min_threshold: 10 },
      { name: "Poulet", category: "Viande", unit: "kg", quantity: 5, min_threshold: 15 },
    ];

    for (const product of products) {
      await pool.query(
        `INSERT INTO products (name, category, unit, quantity, min_threshold) 
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (name) DO NOTHING`,
        [product.name, product.category, product.unit, product.quantity, product.min_threshold]
      );
      console.log(`   ✅ Produit '${product.name}' ajouté`);
    }

    console.log("\n✨ Base de données peuplée avec succès!\n");
    console.log("📊 Données de test créées:");
    console.log("   Utilisateurs: responsable1 / employe1");
    console.log("   Produits: 5 articles (Tomate, Oeufs, Pain, Fromage, Poulet)");
    console.log("\n🚀 Vous pouvez maintenant tester l'API!");

    process.exit(0);
  } catch (error) {
    console.error("❌ Erreur lors du peuplement:", error.message);
    process.exit(1);
  }
}

seedDatabase();
