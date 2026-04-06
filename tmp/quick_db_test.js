const { Client } = require('pg');
require('dotenv').config({ path: 'c:/Users/PC/Documents/Hiver 2026/Gestion_de_stocks/backend/.env' });

async function quickTest() {
    console.log("Starting quick test...");
    const client = new Client({
        connectionString: process.env.DATABASE_URL,
        ssl: {
            rejectUnauthorized: false
        },
        connectionTimeoutMillis: 5000 // 5 seconds timeout
    });

    try {
        await client.connect();
        console.log("Connected successfully!");
        const res = await client.query('SELECT current_database(), current_user, version()');
        console.log("DB info:", res.rows[0]);
    } catch (err) {
        console.error("Connection failed within 5s:", err.message);
    } finally {
        await client.end();
        process.exit(0);
    }
}

quickTest();
