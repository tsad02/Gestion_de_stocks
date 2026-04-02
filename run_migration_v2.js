const fs = require('fs');
const path = require('path');
require('dotenv').config();
const { Pool } = require('pg');

// Setup pool using existing env vars
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`
});

async function runMigration() {
  const migrationPath = path.join(__dirname, 'database', 'migration_v2.sql');
  try {
    console.log(`🚀 Lecture de la migration: ${migrationPath}`);
    const sql = fs.readFileSync(migrationPath, 'utf8');
    
    console.log('⚡ Exécution SQL...');
    await pool.query(sql);
    
    console.log('✅ Migration V2 appliquée avec succès !');
  } catch (err) {
    console.error('❌ Erreur lors de la migration:', err.message);
    if (err.detail) console.error('Détail:', err.detail);
  } finally {
    await pool.end();
  }
}

runMigration();
