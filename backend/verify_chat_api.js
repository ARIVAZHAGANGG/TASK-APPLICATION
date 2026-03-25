const axios = require('axios');

async function testChat() {
    try {
        // Find a task first
        console.log("Fetching tasks...");
        const tasksRes = await axios.get('http://localhost:5005/api/tasks');
        const tasks = tasksRes.data.data || tasksRes.data;
        
        if (!tasks || tasks.length === 0) {
            console.log("No tasks found to test.");
            return;
        }
        
        const taskId = tasks[0]._id || tasks[0].id;
        console.log(`Testing comments for task: ${taskId}`);
        
        const commentsRes = await axios.get(`http://localhost:5005/api/comments/${taskId}`);
        console.log("Comments response:", commentsRes.status);
        console.log("Comments count:", commentsRes.data.length);
        
    } catch (error) {
        console.error("Test failed:", error.message);
        if (error.response) {
            console.error("Response data:", error.response.data);
            console.error("Response status:", error.response.status);
        }
    }
}

testChat();
