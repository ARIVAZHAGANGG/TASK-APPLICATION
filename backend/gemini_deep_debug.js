const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

async function deepDebug() {
    const apiKey = process.env.GEMINI_API_KEY;
    console.log("Testing with Key:", apiKey.substring(0, 5) + "...");

    // Test v1 explicitly if possible via headers or different model naming
    // The node SDK doesn't easily let you switch v1/v1beta without changing the whole SDK version or internals,
    // but we can try different model permutations.
    
    const genAI = new GoogleGenerativeAI(apiKey);
    
    const modelsToTest = ["gemini-1.5-flash", "gemini-pro", "gemini-1.0-pro"];
    
    for (const m of modelsToTest) {
        console.log(`\n--- Testing ${m} ---`);
        try {
            const model = genAI.getGenerativeModel({ model: m });
            const result = await model.generateContent("hi");
            const response = await result.response;
            console.log(`✅ ${m} SUCCESS:`, response.text().substring(0, 30));
        } catch (e) {
            console.log(`❌ ${m} FAILED`);
            console.log("Error Name:", e.name);
            console.log("Error Message:", e.message);
            if (e.stack) console.log("Stack Trace Snippet:", e.stack.split('\n').slice(0, 3).join('\n'));
        }
    }
}

deepDebug();
