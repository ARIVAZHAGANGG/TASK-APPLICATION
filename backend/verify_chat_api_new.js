const axios = require('axios');

const API_URL = 'http://localhost:5002/api';
let token = '';

async function testChat() {
    console.log('--- Starting Chat API Test ---');
    
    try {
        // 1. Login (Assuming credentials for testing)
        // Note: In a real environment, I'd need valid credentials or a seed script.
        // For this verification, I'll check if the routes exist and return expected 401/404 if not authenticated.
        
        console.log('Testing GET /api/chat/conversations...');
        try {
            await axios.get(`${API_URL}/chat/conversations`);
        } catch (err) {
            if (err.response?.status === 401) {
                console.log('✅ Route exists and is protected (401 Unauthorized as expected)');
            } else {
                console.error('❌ Unexpected error:', err.response?.status || err.message);
            }
        }

        console.log('Testing POST /api/chat/send...');
        try {
            await axios.post(`${API_URL}/chat/send`, { content: 'test' });
        } catch (err) {
             if (err.response?.status === 401) {
                console.log('✅ Route exists and is protected (401 Unauthorized as expected)');
            } else {
                console.error('❌ Unexpected error:', err.response?.status || err.message);
            }
        }

        console.log('--- Chat API Test Complete ---');
    } catch (error) {
        console.error('Test failed:', error.message);
    }
}

testChat();
