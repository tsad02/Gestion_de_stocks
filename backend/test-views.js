const fs = require('fs');
const pool = require('./src/db/pool');

async function testViews() {
  let log = '';
  try {
    const res1 = await pool.query('SELECT * FROM v_product_stock LIMIT 1');
    log += 'v_product_stock OK\n';
    
    const res2 = await pool.query('SELECT * FROM v_alerts_critical_products LIMIT 1');
    log += 'v_alerts_critical_products OK\n';

  } catch (err) {
    log += 'ERROR: ' + err.message + '\n';
  } finally {
    fs.writeFileSync('test.log', log);
    pool.end();
  }
}

testViews();
