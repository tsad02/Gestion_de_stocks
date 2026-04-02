const fs = require('fs');
const path = require('path');
const pool = require('./src/db/pool');

/**
 * Script utilitaire pour appliquer la migration de base de données V2.
 * Cette migration ajoute les fonctionnalités métier restaurant :
 * - Suivi des pertes (loss_reason, loss_comment)
 * - Zones de stockage (location_id)
 * - Vues SQL pour les KPIs et rapports
 */
async function runMigration() {
  // Chemin vers le fichier SQL de migration
  const migrationPath = path.join(__dirname, '..', 'database', 'migration_v2.sql');
  
  try {
    console.log(`🚀 Chargement du fichier SQL: ${migrationPath}`);
    const sql = fs.readFileSync(migrationPath, 'utf8');
    
    console.log('⚡ Exécution des requêtes SQL...');
    // Exécution du script SQL complet dans la base PostgreSQL
    await pool.query(sql);
    
    console.log('✅ Migration V2 (Enterprise & Business Logic) appliquée avec succès !');
    
    // --- Vérification Post-Migration ---
    // On s'assure qu'une des colonnes critiques a bien été ajoutée
    const res = await pool.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'inventory_movements' AND column_name = 'loss_reason'");
    if (res.rows.length > 0) {
      console.log('🔍 Vérification : Colonne loss_reason présente.');
    } else {
      console.warn('⚠️ Vérification : La colonne loss_reason semble absente !');
    }
  } catch (err) {
    console.error('❌ ERREUR migration:', err.message);
    if (err.detail) console.error('DÉTAIL:', err.detail);
    process.exit(1);
  } finally {
    // Fermeture propre de la connexion au pool
    await pool.end();
    process.exit(0);
  }
}

// Lancement de la migration
runMigration();
