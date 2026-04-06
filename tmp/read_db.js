const { Client } = require('pg');
require('dotenv').config({ path: 'c:/Users/PC/Documents/Hiver 2026/Gestion_de_stocks/backend/.env' });

async function readDb() {
    const client = new Client({
        connectionString: process.env.DATABASE_URL,
        ssl: {
            rejectUnauthorized: false
        }
    });

    try {
        await client.connect();
        console.log("Connected to database.");

        const tablesResult = await client.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
        `);
        console.log("Tables in database:");
        console.table(tablesResult.rows);

        for (const row of tablesResult.rows) {
            const tableName = row.table_name;
            const countResult = await client.query(`SELECT COUNT(*) FROM ${tableName}`);
            console.log(`${tableName}: ${countResult.rows[0].count} rows`);
        }

        // Sample products
        if (tablesResult.rows.some(r => r.table_name === 'products')) {
            console.log("\nSample Products:");
            const products = await client.query("SELECT * FROM products LIMIT 5");
            console.table(products.rows);
        }

    } catch (err) {
        console.error("Error reading database:", err);
    } finally {
        await client.end();
    }
}

readDb();
