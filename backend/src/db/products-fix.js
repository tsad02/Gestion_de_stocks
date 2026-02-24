const pool = require("./pool");

async function updateProductsTable() {
    try {
        console.log("Updating products table schema...");

        // Add quantity column if it doesn't exist
        await pool.query(`
            ALTER TABLE products 
            ADD COLUMN IF NOT EXISTS quantity INTEGER DEFAULT 0;
        `);

        // Check columns
        const res = await pool.query(`
            SELECT column_name FROM information_schema.columns 
            WHERE table_name = 'products';
        `);

        console.log("✅ Columns in 'products':", res.rows.map(r => r.column_name).join(", "));
        process.exit(0);
    } catch (err) {
        console.error("❌ Error updating products table:", err.message);
        process.exit(1);
    }
}

updateProductsTable();
