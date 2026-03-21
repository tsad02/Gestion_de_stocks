// Create a test admin user with a proper bcrypt password
require('dotenv').config();
const bcrypt = require('bcrypt');
const pool = require('./src/db');

async function createAdmin() {
  try {
    const email = 'admin@timhortons.ca';
    const password = 'admin123';
    const fullName = 'Admin Tim Hortons';

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log('Hashed password created');

    // Update the existing user or insert new
    const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    
    if (existing.rows.length > 0) {
      await pool.query(
        'UPDATE users SET password_hash = $1, role = $2 WHERE email = $3',
        [hashedPassword, 'RESPONSABLE', email]
      );
      console.log(`✅ Utilisateur "${email}" mis à jour avec le bon hash`);
    } else {
      await pool.query(
        'INSERT INTO users (full_name, email, password_hash, role) VALUES ($1, $2, $3, $4)',
        [fullName, email, hashedPassword, 'RESPONSABLE']
      );
      console.log(`✅ Utilisateur "${email}" créé`);
    }

    console.log(`\n📧 Email: ${email}`);
    console.log(`🔑 Mot de passe: ${password}`);
    console.log(`👑 Rôle: RESPONSABLE`);
  } catch (err) {
    console.error('❌ Erreur:', err.message);
  }
  process.exit(0);
}

createAdmin();
