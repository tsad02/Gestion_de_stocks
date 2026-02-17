const http = require('http');

console.log('Checking health...');
const req = http.get('http://localhost:3000/api/health', (res) => {
    console.log('Status:', res.statusCode);
    res.on('data', (d) => {
        process.stdout.write(d);
    });
    res.on('end', () => {
        console.log('\nDone.');
        process.exit(0);
    });
});

req.on('error', (e) => {
    console.error('Error:', e.message);
    process.exit(1);
});

req.end();
