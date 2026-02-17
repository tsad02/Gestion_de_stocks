const pool = require("./db");

async function testConnection() {
  try {
    const result = await pool.query("SELECT NOW() as now;");
    console.log("✅ DB OK - Server time:", result.rows[0].now);
    process.exit(0);
  } catch (err) {
    console.error("❌ DB ERROR:", err.message);
    process.exit(1);
  }
}

testConnection();
