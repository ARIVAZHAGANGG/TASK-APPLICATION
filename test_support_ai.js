const { getSupportResponse } = require("./backend/utils/supportAI");

const testQueries = [
    "Hello",
    "How to create a task?",
    "Tell me about priority",
    "What is the Kanban board?",
    "How to change themes?",
    "Search for a task",
    "Where are the analytics?",
    "Thank you",
    "random gibberish"
];

console.log("--- Support AI Logic Test ---\n");

testQueries.forEach(query => {
    console.log(`Query: "${query}"`);
    console.log(`Response: "${getSupportResponse(query)}"`);
    console.log("-".repeat(30));
});
