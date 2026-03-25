/**
 * Support AI utility for Task BitSathy.
 * Rule-based response logic.
 */

const RESPONSES = [
    {
        keywords: ['hello', 'hi', 'hey', 'greetings', 'hii'],
        response: "Hey there! I'm your Zen Assistant. I'm here to help you stay productive and organized. How can I assist you today? 😊"
    },
    {
        keywords: ['your name', 'who are you', 'identify'],
        response: "I'm the Zen Support AI! Think of me as your personal productivity guide within this application. I don't have a human name, but I'm always here to help. 🤖"
    },
    {
        keywords: ['how are you', 'hows it going', 'doing'],
        response: "I'm doing great! Processing data and helping users like you always keeps my circuits happy. How about you? Ready to crush some tasks? 🚀"
    },
    {
        keywords: ['create', 'add', 'new', 'task', 'make'],
        response: "Creating a task is easy! Just look for the 'Add Task' button in the sidebar or on your dashboard. You can set a title, pick a due date, and even set a priority level. Want me to explain how priorities work? ✨"
    },
    {
        keywords: ['priority', 'high', 'medium', 'low', 'urgent'],
        response: "Priorities help you focus on what matters most. \n\n🔴 **High**: Immediate attention needed.\n🟡 **Medium**: Important but not urgent.\n🟢 **Low**: Can be done anytime.\n\nOur AI can even suggest a priority based on your deadline! 📊"
    },
    {
        keywords: ['due date', 'deadline', 'reminder', 'time'],
        response: "Deadlines keep you on track! When creating or editing a task, click the date picker to set a due date. You can also enable reminders so you don't miss a beat. ⏰"
    },
    {
        keywords: ['kanban', 'board', 'visualize', 'progress'],
        response: "The Kanban board is a fantastic way to see your workflow. Just drag tasks from 'To Do' to 'In Progress' or 'Done'. It's super satisfying! 🏗️"
    },
    {
        keywords: ['analytics', 'stats', 'progress', 'chart', 'score'],
        response: "I love tracking progress! Head over to the Analytics page to see your productivity score and completion trends. It's a great way to stay motivated. 📈"
    },
    {
        keywords: ['theme', 'dark', 'light', 'mode', 'color'],
        response: "Eyes feeling tired? Use the sun/moon icon in the top header to switch between Light and Dark mode. I look good in both! 🌓"
    },
    {
        keywords: ['search', 'find', 'filter'],
        response: "Finding tasks is a breeze! You can use the search bar at the very top of the page. Also, don't forget the sidebar filters like 'Important' or 'Planned' to see specific groups of tasks. Need more help with filtering? 🔍"
    },
    {
        keywords: ['thank', 'thanks', 'cool', 'awesome', 'great', 'wow', 'good'],
        response: "You're very welcome! I'm thrilled I could help. Is there anything else on your mind, or are you ready to get back to your tasks? I'm here if you need me! 🌟"
    }
];

const DEFAULT_RESPONSE = "I'm not exactly sure about that, but I'm here to help you master Task BitSathy! You can ask me how to create tasks, how to use the Kanban board, or how to check your analytics. What would you like to explore? 💡";

/**
 * Gets a support response based on query.
 * @param {string} query 
 * @returns {string} Response message
 */
const getSupportResponse = (query) => {
    if (!query || typeof query !== 'string') return DEFAULT_RESPONSE;

    const lowerQuery = query.toLowerCase().trim();

    if (lowerQuery.length < 2) return "I'm listening! Feel free to type a bit more so I can understand how to help you better. 😊";

    // Check for keyword matches
    for (const item of RESPONSES) {
        if (item.keywords.some(keyword => lowerQuery.includes(keyword))) {
            return item.response;
        }
    }

    return DEFAULT_RESPONSE;
};

module.exports = {
    getSupportResponse
};
