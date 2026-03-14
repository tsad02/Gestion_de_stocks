const pool = require("./src/db/pool");

/**
 * Script de diagnostic postgre
 * Vérifie la connexion à la base de données
 */
async function diagnosticDB() {
  try {
    console.log("🔍 Vérification de la connexion PostgreSQL...\n");
    
    const result = await pool.query("SELECT NOW(), version();");
    
    console.log("✅ Connexion réussie !");
    console.log("\nInfos serveur :");
    console.log(`  - Timestamp : ${result.rows[0].now}`);
    console.log(`  - Version   : ${result.rows[0].version}`);
    
    // Vérifier les tables
    const tables = await pool.query(`
      SELECT table_name FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    
    console.log(`\n📊 Tables existantes : ${tables.rowCount}`);
    tables.rows.forEach(row => {
      console.log(`   - ${row.table_name}`);
    });
    
    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error("❌ Erreur de connexion:");
    console.error(`   ${error.message}`);
    console.error("\n💡 Solutions possibles:");
    console.error("   1. Vérifier que PostgreSQL est lancé");
    console.error("   2. Vérifier les paramètres de connexion dans .env");
    console.error("   3. Vérifier que l'utilisateur PostgreSQL existe");
    console.error("   4. Vérifier que la base de données existe");
    await pool.end();
    process.exit(1);
  }
}

diagnosticDB();
