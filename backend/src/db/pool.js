const { Pool } = require("pg");
require("dotenv").config();

/**
 * Configuration de la connexion PostgreSQL
 * Utilise les variables d'environnement spécifiées dans le fichier .env
 */
const poolConfig = process.env.DATABASE_URL 
  ? {
      connectionString: process.env.DATABASE_URL,
      ssl: {
        rejectUnauthorized: false // Requis pour Render / Managed DBs
      }
    }
  : {
      user: process.env.DB_USER || "postgres",
      password: process.env.DB_PASSWORD || "postgres",
      host: process.env.DB_HOST || "localhost",
      port: process.env.DB_PORT || 5432,
      database: process.env.DB_NAME || "gestion_stocks"
    };

const pool = new Pool(poolConfig);

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