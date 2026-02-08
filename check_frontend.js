const http = require('http');

const options = {
    hostname: '127.0.0.1',
    port: 5173,
    path: '/',
    method: 'GET',
    timeout: 2000
};

const req = http.request(options, (res) => {
    console.log(`STATUS: ${res.statusCode}`);
    res.on('data', (chunk) => { console.log(`BODY: ${chunk.toString().substring(0, 50)}...`) });
});

req.on('error', (e) => {
    console.error(`problem with request: ${e.message}`);
});

req.end();
