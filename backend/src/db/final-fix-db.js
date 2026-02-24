const pool = require("./pool");

const finalFixQuery = `
-- 1. S'assurer que les colonnes 'username' et 'password' existent
ALTER TABLE users ADD COLUMN IF NOT EXISTS username VARCHAR(50) UNIQUE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS password VARCHAR(255);

-- 2. Rendre toutes les autres colonnes potentielles facultatives (NULL)
DO $$ 
BEGIN 
    -- Liste des colonnes connues pour causer des erreurs
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='full_name') THEN
        ALTER TABLE users ALTER COLUMN full_name DROP NOT NULL;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='email') THEN
        ALTER TABLE users ALTER COLUMN email DROP NOT NULL;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='password_hash') THEN
        ALTER TABLE users ALTER COLUMN password_hash DROP NOT NULL;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='name') THEN
        ALTER TABLE users ALTER COLUMN name DROP NOT NULL;
    END IF;
END $$;

-- 3. S'assurer que nos colonnes obligatoires sont bien NOT NULL
-- (On le fait après pour éviter les erreurs si les lignes existantes étaient vides)
ALTER TABLE users ALTER COLUMN username SET NOT NULL;
ALTER TABLE users ALTER COLUMN password SET NOT NULL;
`;

async function runFinalFix() {
    try {
        console.log("Applying final database fix...");
        await pool.query(finalFixQuery);
        console.log("✅ Database fixed successfully! No more NOT NULL errors should occur.");
        process.exit(0);
    } catch (err) {
        console.error("❌ Critical error during fix:", err.message);
        process.exit(1);
    }
}

runFinalFix();
