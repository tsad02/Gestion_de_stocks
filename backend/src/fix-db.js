const pool = require('./db/pool');
const bcrypt = require('bcrypt');

async function fix() {
  try {
    const hash = await bcrypt.hash('admin123', 10);
    const result = await pool.query(
      "UPDATE users SET password_hash = $1 WHERE email = 'admin@timhortons.ca' RETURNING id",
      [hash]
    );
    
    if (result.rows.length > 0) {
      console.log("✅ Success! Password for admin@timhortons.ca updated to: admin123");
    } else {
      console.log("❌ Admin user not found. Did you run run_seed.js first?");
    }
  } catch (err) {
    console.error("❌ Error:", err.message);
  } finally {
    pool.end();
  }
}

fix();
