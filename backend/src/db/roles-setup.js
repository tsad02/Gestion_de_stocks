const pool = require("./pool");

async function setupRoles() {
    try {
        console.log("Setting up roles in database...");

        // 1. Add role column if it doesn't exist
        await pool.query(`
            ALTER TABLE users 
            ADD COLUMN IF NOT EXISTS role VARCHAR(20) DEFAULT 'user';
        `);

        // 2. Ensure existing users have 'user' role if they were NULL
        await pool.query(`
            UPDATE users SET role = 'user' WHERE role IS NULL;
        `);

        console.log("✅ Roles column set up successfully.");
        process.exit(0);
    } catch (err) {
        console.error("❌ Error setting up roles:", err.message);
        process.exit(1);
    }
}

setupRoles();
