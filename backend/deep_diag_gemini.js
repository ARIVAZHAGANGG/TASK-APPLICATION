const axios = require('axios');

async function testKey(apiKey) {
    const endpoints = [
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent",
        "https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent"
    ];

    for (const url of endpoints) {
        console.log(`Testing endpoint: ${url}`);
        try {
            const response = await axios.post(`${url}?key=${apiKey}`, {
                contents: [{ role: 'user', parts: [{ text: "Hi" }] }]
            }, {
                headers: { 'Content-Type': 'application/json' }
            });
            console.log("✅ Success!");
            console.log(response.data.candidates[0].content.parts[0].text);
            return;
        } catch (error) {
            console.error(`❌ Failed: ${error.response ? error.response.status : error.message}`);
            if (error.response) {
                console.error(`Error message: ${error.response.data.error.message}`);
            }
        }
    }
}

const key = "AIzaSyCxGyCkH8ZiJtEQt3M9SdzW2xtSSw2r-ds";
testKey(key);
