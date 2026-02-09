const axios = require('axios');

const API_URL = 'https://password-app-adkb.onrender.com';
const TEST_EMAIL = `test_${Date.now()}@example.com`;
const TEST_PASSWORD = 'password123';

async function testLiveBackend() {
    console.log('--- Testing Live Backend ---');
    console.log('API URL:', API_URL);

    try {
        console.log('\n1. Registering Test User...');
        try {
            await axios.post(`${API_URL}/register`, {
                email: TEST_EMAIL,
                password: TEST_PASSWORD,
                confirm: TEST_PASSWORD
            });
            console.log('   ✅ Registration Success');
        } catch (err) {
            console.log('   (Registration skipped or failed - might already exist)', err.message);
        }

        console.log('\n2. Testing Forgot Password (SMTP Check)...');
        try {
            const res = await axios.post(`${API_URL}/forgot`, {
                email: TEST_EMAIL
            });
            console.log('   ✅ Success! Email sent.', res.data);
        } catch (err) {
            console.error('\n   ❌ FAILED with Status:', err.response?.status);
            if (err.response?.data) {
                console.error('   ❌ ERROR BODY:', JSON.stringify(err.response.data, null, 2));
            } else {
                console.error('   ❌ ERROR MESSAGE:', err.message);
            }
        }

    } catch (err) {
        console.error('Unexpected Script Error:', err);
    }
}

testLiveBackend();
