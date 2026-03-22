const pool = require('./src/db/pool');

async function testDB() {
  try {
    let res = await pool.query('SELECT * FROM v_alerts_critical_products LIMIT 1');
    console.log('v_alerts_critical_products OK');
    
    res = await pool.query('SELECT * FROM v_product_stock LIMIT 1');
    console.log('v_product_stock OK');
    
    res = await pool.query('SELECT * FROM inventory_movements LIMIT 1');
    console.log('inventory_movements OK');
  } catch (err) {
    console.error('DB ERROR:', err);
  } finally {
    pool.end();
  }
}

testDB();
