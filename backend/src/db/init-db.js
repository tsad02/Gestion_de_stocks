const pool = require("./pool");

/**
 * Script d'initialisation de la base de données
 * Crée les tables nécessaires si elles n'existent pas encore
 */
async function initializeDatabase() {
  try {
    console.log("🛠️ Initialisation des tables...");

    // 1. Création de la table 'users'
    // Contient les informations d'authentification et les rôles
    await pool.query(`
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                username VARCHAR(50) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                role VARCHAR(20) DEFAULT 'EMPLOYE',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

    // 2. Création de la table 'products'
    // Contient le catalogue des produits et les niveaux de stock
    await pool.query(`
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

    console.log("✅ Initialisation terminée avec succès.");
    process.exit(0);
  } catch (error) {
    console.error("❌ Erreur lors de l'initialisation :", error.message);
    process.exit(1);
  }
}

initializeDatabase();
