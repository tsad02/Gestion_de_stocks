const { Pool } = require("pg");
require("dotenv").config();

// Option A : DATABASE_URL
const pool = process.env.DATABASE_URL
  ? new Pool({ connectionString: process.env.DATABASE_URL })
  : // Option B : variables séparées
    new Pool({
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT || 5432),
      database: process.env.DB_NAME,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
    });

pool.on("error", (err) => {
  console.error("Unexpected PG error:", err);
});

module.exports = pool;
