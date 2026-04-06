const pool = require("../src/db/pool");
const fs = require("fs");
const path = require("path");

async function runCleanup() {
    const filePath = path.join(__dirname, "cleanup_legacy_tables.sql");
    const sql = fs.readFileSync(filePath, "utf8");

    console.log("🚀 Lancement du nettoyage de la base de données...");
    const client = await pool.connect();
    try {
        await client.query("BEGIN");
        
        // Execute each statement separated by semicolon
        const statements = sql
            .split(";")
            .map(s => s.trim())
            .filter(s => s.length > 3 && !s.startsWith("--"));

        for (const statement of statements) {
            console.log(`Executing: ${statement.substring(0, 50)}...`);
            await client.query(statement);
        }

        await client.query("COMMIT");
        console.log("✅ BRAVO ! Les 13 tables Django ont été supprimées.");
    } catch (err) {
        await client.query("ROLLBACK");
        console.error("❌ ERREUR lors du nettoyage :", err.message);
    } finally {
        client.release();
        process.exit(0);
    }
}

runCleanup();
