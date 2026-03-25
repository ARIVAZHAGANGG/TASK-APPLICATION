require('dotenv').config();
const aiService = require('./services/ai.service');

async function finalPrint() {
    try {
        const q = "What is productivity score?";
        console.log(`Query: "${q}"`);
        console.log("Current BaseURL:", aiService.baseUrl);
        const response = await aiService.getChatResponse("65f57cc7a69772af206c75df", q);
        console.log("RESPONSE:", response);
        process.exit(0);
    } catch (e) {
        console.error("CRITICAL TEST FAILED:", e.message);
        process.exit(1);
    }
}

finalPrint();
