const axios = require('axios');

async function autoFix() {
    const apiKey = "AIzaSyA8u_VUN9wTAxgNuaBkbJ-z3TJh2pe_B08";
    
    try {
        console.log("Listing models...");
        const listRes = await axios.get(`https://generativelanguage.googleapis.com/v1/models?key=${apiKey}`);
        const models = listRes.data.models;
        
        // Find first model that supports generateContent
        const workingModel = models.find(m => m.supportedMethods && m.supportedMethods.includes('generateContent'));
        
        if (!workingModel) {
            console.log("❌ No models support generateContent");
            return;
        }
        
        console.log(`Testing model: ${workingModel.name}`);
        const url = `https://generativelanguage.googleapis.com/v1/${workingModel.name}:generateContent?key=${apiKey}`;
        
        const res = await axios.post(url, {
            contents: [{ parts: [{ text: "hi" }] }]
        });
        
        console.log("✅ SUCCESS with model:", workingModel.name);
        console.log("Response:", res.data.candidates[0].content.parts[0].text);
        
    } catch (e) {
        console.log("❌ FAILED:", e.response?.status, e.response?.data?.error?.message || e.message);
    }
}

autoFix();
