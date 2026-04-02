const fetch = require('node-fetch');

async function testMovements() {
  try {
    const res = await fetch('http://localhost:3000/api/inventory-movements', {
      headers: {
        'Authorization': 'Bearer YOUR_TOKEN' // Need a real token or mock
      }
    });
    const data = await res.json();
    console.log(data);
  } catch (err) {
    console.error(err);
  }
}
// testMovements();
