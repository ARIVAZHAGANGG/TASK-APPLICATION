const OpenAI = require('openai');
require('dotenv').config();

async function checkKey() {
    const openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
    });

    try {
        console.log("Checking OpenAI Models...");
        const models = await openai.models.list();
        console.log("✅ Key is valid! Found " + models.data.length + " models.");
        console.log("First model: " + models.data[0].id);
    } catch (error) {
        console.error("❌ API Error:");
        console.error(error.message);
        if (error.status === 401) console.error("Invalid API Key.");
        if (error.status === 429) console.error("Quota exceeded or Rate limit hit.");
    }
}

checkKey();
