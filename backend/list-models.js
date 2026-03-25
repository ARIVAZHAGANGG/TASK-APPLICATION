require('dotenv').config();
const axios = require('axios');

async function listModels() {
    console.log("Listing Gemini Models...");
    const apiKey = process.env.GEMINI_API_KEY;
    try {
        const response = await axios.get(`https://generativelanguage.googleapis.com/v1/models?key=${apiKey}`);
        console.log("✅ Available Models:");
        response.data.models.forEach(m => console.log(`- ${m.name} (${m.displayName})`));
    } catch (error) {
        console.error("❌ List Models Failed:", error.response?.data || error.message);
    }
}

listModels();
