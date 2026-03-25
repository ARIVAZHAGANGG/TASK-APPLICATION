const simpleAI = require('./backend/utils/simpleAI');

console.log("🧪 Testing Rule-Based AI Logic...");

// 1. Priority Suggestion
console.log("\n1. Testing Priority Suggestion:");
const now = new Date();
const in5Hours = new Date(now.getTime() + 5 * 60 * 60 * 1000);
const in2Days = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000);
const in5Days = new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000);

console.log(`- Due in 5 hours: ${simpleAI.suggestPriority(in5Hours)} (Expected: high)`);
console.log(`- Due in 2 days: ${simpleAI.suggestPriority(in2Days)} (Expected: medium)`);
console.log(`- Due in 5 days: ${simpleAI.suggestPriority(in5Days)} (Expected: low)`);

// 2. Overdue Risk
console.log("\n2. Testing Overdue Risk:");
console.log(`- 3 pending tasks, due in 1 day: ${simpleAI.checkOverdueRisk(3, in5Hours)} (Expected: false)`);
console.log(`- 6 pending tasks, due in 1 day: ${simpleAI.checkOverdueRisk(6, in5Hours)} (Expected: true)`);
console.log(`- 6 pending tasks, due in 5 days: ${simpleAI.checkOverdueRisk(6, in5Days)} (Expected: false)`);

// 3. Productivity Score
console.log("\n3. Testing Productivity Score:");
console.log(`- 5 completed out of 10: ${simpleAI.calculateProductivityScore(5, 10)}% (Expected: 50%)`);
console.log(`- 8 completed out of 10: ${simpleAI.calculateProductivityScore(8, 10)}% (Expected: 80%)`);
console.log(`- 0 completed out of 0: ${simpleAI.calculateProductivityScore(0, 0)}% (Expected: 0%)`);

// 4. AI Insight Message
console.log("\n4. Testing AI Insight Messages (New Array Format):");
const testStats = [
    { label: "Perfect Score", stats: { total: 5, completed: 5, pending: 0, highPriorityPending: 0 } },
    { label: "High Productivity", stats: { total: 10, completed: 8, pending: 2, highPriorityPending: 0 } },
    { label: "High Priority Warning", stats: { total: 10, completed: 3, pending: 7, highPriorityPending: 2 } },
    { label: "Many Pending (> 5)", stats: { total: 12, completed: 0, pending: 12, highPriorityPending: 0 } },
    { label: "Low Productivity", stats: { total: 10, completed: 2, pending: 8, highPriorityPending: 0 } }
];

testStats.forEach(t => {
    const results = simpleAI.generateAIInsight(t.stats);
    console.log(`- ${t.label}:`);
    results.forEach(r => console.log(`  [${r.type.toUpperCase()}] ${r.message}`));
});

console.log("\n✅ AI Logic Refinement Verification Complete!");
