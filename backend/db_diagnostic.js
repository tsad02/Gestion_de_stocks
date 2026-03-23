const pool = require("./src/db/pool");
const fs = require("fs");

async function diagnose() {
    let report = "=== DIAGNOSTIC DASHBOARD QUERIES ===\n\n";
    try {
        // 1. Check v_product_stock
        report += "Checking v_product_stock...\n";
        const v1 = await pool.query("SELECT * FROM v_product_stock LIMIT 1");
        report += "✅ v_product_stock columns: " + Object.keys(v1.rows[0] || {}).join(", ") + "\n\n";

        // 2. Check v_alerts_critical_products
        report += "Checking v_alerts_critical_products...\n";
        const v2 = await pool.query("SELECT * FROM v_alerts_critical_products LIMIT 1");
        report += "✅ v_alerts_critical_products columns: " + Object.keys(v2.rows[0] || {}).join(", ") + "\n\n";

        // 3. Run movementsByDayQuery (Potential point of failure)
        report += "Running movementsByDayQuery...\n";
        await pool.query(`
            SELECT
                DATE(m.created_at) AS movement_date,
                m.type,
                SUM(m.quantity) AS daily_quantity,
                COUNT(*) AS count
            FROM inventory_movements m
            WHERE m.created_at >= NOW() - INTERVAL '7 days'
            GROUP BY DATE(m.created_at), m.type
            ORDER BY movement_date DESC;
        `);
        report += "✅ movementsByDayQuery: OK\n\n";

        // 4. Run topConsumptionQuery
        report += "Running topConsumptionQuery...\n";
        await pool.query(`
            SELECT
                p.id,
                p.name AS product_name,
                p.category,
                COALESCE(SUM(
                CASE WHEN m.type = 'SORTIE' THEN m.quantity ELSE 0 END
                ), 0) AS total_consumption
            FROM products p
            LEFT JOIN inventory_movements m ON p.id = m.product_id
            WHERE m.created_at >= NOW() - INTERVAL '30 days' OR m.id IS NULL
            GROUP BY p.id, p.name, p.category
        `);
        report += "✅ topConsumptionQuery: OK\n\n";

        report += "🎉 ALL QUERIES PASSED!";
    } catch (err) {
        report += "❌ ERROR: " + err.message + "\n";
        report += "STACK: " + err.stack + "\n";
    }

    fs.writeFileSync("diag_report.txt", report);
    console.log("Diagnostic complete. Report saved to diag_report.txt");
    process.exit(0);
}

diagnose();
