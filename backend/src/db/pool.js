const { Pool } = require("pg");

/**
 * Configuration de la connexion PostgreSQL
 * Utilise les variables d'environnement spécifiées dans le fichier .env
 */
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Événement déclenché lors de la connexion réussie au pool
pool.on("connect", () => {
  console.log("🐘 Connexion établie avec la base de données PostgreSQL");
});

// Événement déclenché en cas d'erreur de connexion au pool
pool.on("error", (err) => {
  console.error("❌ Erreur inattendue sur le client PostgreSQL", err);
  process.exit(-1);
});

module.exports = pool;