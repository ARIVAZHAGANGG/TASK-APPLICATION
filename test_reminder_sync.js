const axios = require('axios');
require('dotenv').config();

const API_URL = 'http://localhost:5000/api';

async function testReminderFlow() {
    try {
        console.log("🧪 Testing Reminder Sync Flow...");

        // 1. Mock Login (using existing test credentials if available or skip if manually tested)
        // For this test, user should have a task with reminderEnabled: true, reminderSent: false

        // We'll just test the PUT endpoint directly if we have a Task ID and Token
        // But since I don't want to hardcode IDs, I'll fetch a task first.

        // NOTE: This script assumes you have a valid token in .env or hardcoded for a quick check
        const token = process.env.TEST_TOKEN;
        if (!token) {
            console.warn("⚠️ No TEST_TOKEN found. Skipping automated test. Please verify manually by setting a reminder in the UI.");
            return;
        }

        const headers = { Authorization: `Bearer ${token}` };

        // Find a task
        const tasksRes = await axios.get(`${API_URL}/tasks`, { headers });
        const targetTask = tasksRes.data.find(t => t.reminderEnabled && !t.reminderSent);

        if (!targetTask) {
            console.log("ℹ️ No pending reminders found to test. Create one in the UI first.");
            return;
        }

        console.log(`📡 Found target task: ${targetTask.title} (${targetTask.id})`);

        // Simulate Frontend Update
        console.log("🔄 Simulating frontend sync...");
        const syncRes = await axios.put(`${API_URL}/tasks/${targetTask.id}/reminder-sent`, {}, { headers });

        if (syncRes.data.task.reminderSent === true) {
            console.log("✅ Success: Task marked as reminderSent on backend.");
        } else {
            console.error("❌ Failed: task.reminderSent is still false.");
        }

    } catch (error) {
        console.error("❌ Test Failed:", error.response?.data || error.message);
    }
}

testReminderFlow();
