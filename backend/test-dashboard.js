const http = require('http');
const app = require('./src/app');
const port = 3005; // Use different port just in case

const server = app.listen(port, async () => {
    try {
        // Authenticate as Admin
        const authData = JSON.stringify({ email: 'admin@admin.com', password: 'password123' }) || JSON.stringify({ email: 'admin@admin.com', password: 'admin123' });
        
        const loginReq = http.request({
            hostname: 'localhost',
            port: port,
            path: '/api/auth/login',
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        }, res => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                const response = JSON.parse(data);
                if (!response.token) {
                    console.error('TEST ERROR: No token returned. Auth failed.', response);
                    server.close();
                    return;
                }
                
                const getReq = http.request({
                    hostname: 'localhost',
                    port: port,
                    path: '/api/dashboard/summary',
                    method: 'GET',
                    headers: { 'Authorization': `Bearer ${response.token}` }
                }, res2 => {
                    let data2 = '';
                    res2.on('data', chunk => data2 += chunk);
                    res2.on('end', () => {
                        console.log('DASHBOARD RESULT:', data2);
                        server.close();
                        process.exit(0);
                    });
                });
                getReq.end();
            });
        });
        loginReq.write(JSON.stringify({ email: 'admin@timhortons.ca', password: 'admin' })); // Tim Hortons user from check-db
        loginReq.end();
    } catch(err) {
        console.error('TEST ERROR:', err);
        server.close();
    }
});
