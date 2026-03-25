const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

async function testWorkingKey() {
    try {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" }, { apiVersion: "v1" });
        const result = await model.generateContent("Say 'Hello' if you are working.");
        const response = await result.response;
        console.log("✅ GEMINI WORKING:", response.text());
    } catch (e) {
        console.error("❌ GEMINI STILL FAILING:", e.message);
    }
}

testWorkingKey();
