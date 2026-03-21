const bcrypt = require('bcrypt');

async function gen() {
  const hash = await bcrypt.hash('admin123', 10);
  console.log('Password: admin123');
  console.log('Hash:', hash);
}

gen();
