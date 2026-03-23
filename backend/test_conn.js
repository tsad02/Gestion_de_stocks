const pool = require("./src/db/pool");

async function testConnection() {
    try {
        console.log("Testing connection and tables...");
        const res = await pool.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'");
        const tables = res.rows.map(r => r.table_name);
        console.log("Current tables:", tables.join(", "));
        
        const required = ['locations', 'purchase_orders', 'audit_logs', 'purchase_order_items'];
        const missing = required.filter(t => !tables.includes(t));
        
        if (missing.length === 0) {
            console.log("✅ All tables are present!");
        } else {
            console.log("❌ Missing tables:", missing.join(", "));
        }
        process.exit(0);
    } catch (err) {
        console.error("Connection failed:", err.message);
        process.exit(1);
    }
}

testConnection();
