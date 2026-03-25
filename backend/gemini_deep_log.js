const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require('fs');
require('dotenv').config();

async function deepDebug() {
    let log = "";
    const apiKey = process.env.GEMINI_API_KEY;
    log += "Testing with Key: " + apiKey.substring(0, 10) + "...\n";

    const genAI = new GoogleGenerativeAI(apiKey);
    const modelsToTest = ["gemini-1.5-flash", "gemini-pro", "gemini-1.0-pro"];
    
    for (const m of modelsToTest) {
        log += `\n--- Testing ${m} ---\n`;
        try {
            const model = genAI.getGenerativeModel({ model: m });
            const result = await model.generateContent("hi");
            const response = await result.response;
            log += `✅ ${m} SUCCESS: ${response.text().substring(0, 30)}\n`;
        } catch (e) {
            log += `❌ ${m} FAILED\n`;
            log += `Error Name: ${e.name}\n`;
            log += `Error Message: ${e.message}\n`;
            log += `Full Error: ${JSON.stringify(e, null, 2)}\n`;
        }
    }
    
    fs.writeFileSync('gemini_debug_results.log', log);
    console.log("Logged to gemini_debug_results.log");
}

deepDebug();
