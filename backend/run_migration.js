// Quick script to run the phone column migration
require('dotenv').config();
const pool = require('./src/db');

async function migrate() {
  try {
    await pool.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS phone VARCHAR(30)');
    console.log('✅ Migration réussie: colonne phone ajoutée');
    const result = await pool.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'users' ORDER BY ordinal_position");
    console.log('Colonnes users:', result.rows.map(r => r.column_name).join(', '));
  } catch (err) {
    console.error('❌ Erreur:', err.message);
  }
  process.exit(0);
}
migrate();
