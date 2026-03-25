require('dotenv').config();
const axios = require('axios');

async function testModels() {
    const models = [
        "gemini-1.5-flash-latest",
        "gemini-1.5-flash",
        "gemini-pro",
        "gemini-1.5-pro",
        "gemini-1.5-flash-001",
        "gemini-2.0-flash-exp"
    ];
    
    console.log("Testing Gemini Models...");
    const apiKey = process.env.GEMINI_API_KEY;
    
    for (const model of models) {
        console.log(`\n--- Testing ${model} ---`);
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
        try {
            const response = await axios.post(url, {
                contents: [{ role: 'user', parts: [{ text: "Hi" }] }]
            });
            console.log(`✅ ${model} works!`);
            return model;
        } catch (error) {
            if (error.response) {
                console.log(`❌ ${model} failed: ${error.response.status} - ${error.response.data.error.message}`);
                if (error.response.status === 429) {
                    console.log("   (Quota exceeded for this specific model)");
                }
            } else {
                console.log(`❌ ${model} error: ${error.message}`);
            }
        }
    }
}

testModels();
