const axios = require('axios');

const API_URL = 'http://localhost:3000';
const timestamp = Date.now();
const email = `testuser_${timestamp}@example.com`;
const password = 'Password123!';

async function runTests() {
    try {
        console.log(`Testing with user: ${email}`);

        // 1. Registration
        console.log('\n--- 1. Testing Registration ---');
        try {
            const regRes = await axios.post(`${API_URL}/register`, {
                email,
                password,
                confirm: password
            });
            console.log('Registration Status:', regRes.status);
            console.log('Registration Data:', regRes.data);
        } catch (error) {
            console.error('Registration Failed:', error.response ? error.response.data : error.message);
            // If registration fails, we might still try login if user exists (unlikely with timestamp)
        }

        // 2. Login
        console.log('\n--- 2. Testing Login ---');
        let cookie;
        try {
            const loginRes = await axios.post(`${API_URL}/login`, {
                email,
                password
            });
            console.log('Login Status:', loginRes.status);
            console.log('Login Data:', loginRes.data);
            if (loginRes.headers['set-cookie']) {
                cookie = loginRes.headers['set-cookie'];
                console.log('Session Cookie received');
            }
        } catch (error) {
            console.error('Login Failed:', error.response ? error.response.data : error.message);
        }

        // 3. Forgot Password
        console.log('\n--- 3. Testing Forgot Password ---');
        try {
            const forgotRes = await axios.post(`${API_URL}/forgot`, {
                email
            });
            console.log('Forgot Password Status:', forgotRes.status);
            console.log('Forgot Password Data:', forgotRes.data);
            if (forgotRes.data.preview) {
                console.log('Email Preview URL:', forgotRes.data.preview);
            }
        } catch (error) {
            console.error('Forgot Password Failed:', error.response ? error.response.data : error.message);
        }

    } catch (error) {
        console.error('Unexpected Error:', error.message);
    }
}

runTests();
