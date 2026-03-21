const pool = require('./db/pool');
async function check() {
  const result = await pool.query("SELECT email, password_hash FROM users WHERE email = 'admin@timhortons.ca'");
  console.log('CHECK_RESULT:' + JSON.stringify(result.rows[0]) + ':CHECK_END');
  pool.end();
}
check();
