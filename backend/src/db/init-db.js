const pool = require("./pool");

const createTablesQuery = `
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS products (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  category VARCHAR(50),
  unit VARCHAR(20),
  min_threshold INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
`;

async function initDb() {
    try {
        console.log("Initializing database...");
        await pool.query(createTablesQuery);
        console.log("✅ Tables created or already exist.");
        process.exit(0);
    } catch (err) {
        console.error("❌ Error initializing database:", err.message);
        process.exit(1);
    }
}

initDb();
