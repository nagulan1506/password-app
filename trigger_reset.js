const http = require('http');

async function post(path, data) {
    return new Promise((resolve, reject) => {
        const req = http.request({
            hostname: 'localhost',
            port: 3000,
            path: path,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': data.length
            }
        }, (res) => {
            let body = '';
            res.on('data', chunk => body += chunk);
            res.on('end', () => resolve({ status: res.statusCode, body }));
        });
        req.on('error', reject);
        req.write(data);
        req.end();
    });
}

async function run() {
    const email = 'test_user_' + Date.now() + '@example.com';
    console.log('Registering', email);
    await post('/register', JSON.stringify({ email, password: 'password', confirm: 'password' }));

    console.log('Requesting reset for', email);
    const res = await post('/forgot', JSON.stringify({ email }));
    console.log('Forgot response:', res.body);
}

run().catch(console.error);
