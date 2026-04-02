const pool = require('./src/db/pool');
const { getReport } = require('./src/controllers/reports.controller');
const { getSuggestions } = require('./src/controllers/suggestions.controller');

async function test() {
  const req = { query: {} };
  const res = { 
    json: (data) => console.log('OK:', Object.keys(data)), 
    status: (code) => ({ json: (data) => console.log('HTTP', code, data) }) 
  };
  const next = (err) => console.error('ERROR:', err);
  
  console.log('Testing reports...');
  await getReport(req, res, next);
  
  console.log('\nTesting suggestions...');
  await getSuggestions(req, res, next);
  
  await pool.end();
}

test();
