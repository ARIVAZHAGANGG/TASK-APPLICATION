const axios = require('axios');

async function hardcodeTest() {
    const apiKey = "AIzaSyA8u_VUN9wTAxgNuaBkbJ-z3TJh2pe_B08";
    const url = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    
    try {
        const res = await axios.post(url, {
            contents: [{ parts: [{ text: "hi" }] }]
        });
        console.log("✅ SUCCESS:", res.data.candidates[0].content.parts[0].text);
    } catch (e) {
        console.log("❌ FAILED:", e.response?.status, e.response?.data?.error?.message || e.message);
    }
}

hardcodeTest();
