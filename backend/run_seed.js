const fs = require('fs');
const { Pool } = require('pg');
require('dotenv').config({ path: './.env' }); // Charge le .env backend

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'db_gestion_de_stocks',
  password: process.env.DB_PASSWORD || 'TTDJ',
  port: process.env.DB_PORT || 5432,
});

async function runSQL() {
  const client = await pool.connect();
  try {
    console.log('Connecté à la base de données.');
    
    // 1. Lire et exécuter le schéma principal
    const schemaSql = fs.readFileSync('../database/db_gestion_de_stocks.sql', 'utf8');
    console.log('Exécution de db_gestion_de_stocks.sql...');
    await client.query(schemaSql);
    
    // 2. Lire et exécuter les données de seed Tim Hortons
    const bcrypt = require('bcrypt');
    const defaultHash = await bcrypt.hash('admin123', 10);
    let seedSql = fs.readFileSync('../database/tim_hortons_seed.sql', 'utf8');
    
    // Remplacer le placeholder par le vrai hash
    seedSql = seedSql.replace(/'dummy_hash'/g, `'${defaultHash}'`);
    
    console.log('Exécution de tim_hortons_seed.sql (avec password hashé)...');
    await client.query(seedSql);

    console.log('✅ Base de données mise à jour avec succès avec le catalogue Tim Hortons !');
  } catch (err) {
    console.error('❌ Erreur lors de l\'exécution SQL :', err);
  } finally {
    client.release();
    pool.end();
  }
}

runSQL();
