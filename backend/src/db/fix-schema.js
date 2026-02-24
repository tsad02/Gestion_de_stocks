const pool = require("./pool");

async function fixSchema() {
    try {
        console.log("Checking schema for table 'users'...");

        // Add username column if it doesn't exist
        await pool.query(`
            DO $$ 
            BEGIN 
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='username') THEN
                    ALTER TABLE users ADD COLUMN username VARCHAR(50) UNIQUE NOT NULL;
                END IF;
            END $$;
        `);

        // Add password column if it doesn't exist
        await pool.query(`
            DO $$ 
            BEGIN 
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='password') THEN
                    ALTER TABLE users ADD COLUMN password VARCHAR(255) NOT NULL;
                END IF;
            END $$;
        `);

        // Make full_name nullable if it exists
        await pool.query(`
            DO $$ 
            BEGIN 
                IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='full_name') THEN
                    ALTER TABLE users ALTER COLUMN full_name DROP NOT NULL;
                END IF;
            END $$;
        `);

        console.log("✅ Schema checked and fixed if necessary.");
        process.exit(0);
    } catch (err) {
        console.error("❌ Error fixing schema:", err.message);
        process.exit(1);
    }
}

fixSchema();
