const OpenAI = require('openai');
const { differenceInDays, differenceInHours, isAfter, isBefore, parseISO } = require('date-fns');
const Task = require('../models/Task');

class AIService {
    constructor() {
        this.openai = null;
        this.initializeOpenAI();
    }

    initializeOpenAI() {
        if (process.env.OPENAI_API_KEY) {
            this.openai = new OpenAI({
                apiKey: process.env.OPENAI_API_KEY,
            });
        }
    }

    isConfigured() {
        const key = process.env.OPENAI_API_KEY;
        return !!(key && key.trim() !== "" && key !== "placeholder" && key.length > 20);
    }

    async _callAI(prompt, history = []) {
        if (!this.openai) {
            this.initializeOpenAI();
        }
        
        if (!this.isConfigured()) {
            console.error("❌ AI Service: OPENAI_API_KEY is not configured.");
            throw new Error("AI not configured. Please add OPENAI_API_KEY to your .env file.");
        }

        const messages = history.map(h => ({
            role: h.role === 'user' ? 'user' : 'assistant',
            content: h.parts && h.parts[0] ? h.parts[0].text : (typeof h.content === 'string' ? h.content : JSON.stringify(h))
        }));

        messages.push({
            role: 'user',
            content: prompt
        });

        try {
            const response = await this.openai.chat.completions.create({
                model: "gpt-4o-mini", // Efficient and high-performance default
                messages: messages,
            });

            if (response.choices && response.choices[0].message) {
                return response.choices[0].message.content;
            }
            throw new Error("Invalid AI response format from OpenAI");
        } catch (error) {
            if (error.status === 429) {
                console.error("❌ OpenAI Quota Exhausted (429)");
                throw new Error("AI quota exceeded. Please check your OpenAI billing.");
            }
            console.error("❌ OpenAI API Error:", error.message);
            throw error;
        }
    }

    async generateTaskBreakdown(title, description = "") {
        try {
            const prompt = `Break down the following task into 3-5 actionable subtasks:
                Task: ${title}
                Description: ${description}
                Respond ONLY with a JSON array of strings. Example: ["Step 1", "Step 2"]`;

            const text = await this._callAI(prompt);
            const jsonMatch = text.match(/\[.*\]/s);
            if (jsonMatch) return JSON.parse(jsonMatch[0]);
            return text.split('\n').filter(line => line.trim()).map(line => line.replace(/^[-*0-9.]+\s*/, '').trim()).slice(0, 5);
        } catch (error) {
            return ["Analyze requirements", "Implement core logic", "Final testing"];
        }
    }

    async suggestSmartPriority(title, dueDate) {
        try {
            const prompt = `Based on the task name and its due date, suggest a priority (high, medium, or low).
                Task: ${title}
                Due Date: ${dueDate || "No deadline"}
                Current Time: ${new Date().toISOString()}
                Respond ONLY with the single word: high, medium, or low.`;

            const text = (await this._callAI(prompt)).toLowerCase().trim();
            if (['high', 'medium', 'low'].includes(text)) return text;
            return this.suggestPriority({ dueDate });
        } catch (error) {
            return this.suggestPriority({ dueDate });
        }
    }

    async generateDashboardSummary(stats) {
        try {
            const prompt = `Generate a very short (1 sentence), motivating productivity insight for a user based on these stats:
                - Total Tasks: ${stats.totalTasks}
                - Completed: ${stats.completedTasks}
                - Pending: ${stats.pendingTasks}
                - Productivity Score: ${stats.productivityScore}%
                Be encouraging and concise.`;

            return await this._callAI(prompt);
        } catch (error) {
            return `Focus. Execute. Dominate. You have ${stats.pendingTasks} missions remaining. You've got this!`;
        }
    }

    suggestPriority(task) {
        if (!task.dueDate) return 'medium';
        const now = new Date();
        const dueDate = typeof task.dueDate === 'string' ? parseISO(task.dueDate) : task.dueDate;
        if (isAfter(now, dueDate)) return 'high';
        const hoursUntilDue = differenceInHours(dueDate, now);
        if (hoursUntilDue < 24) return 'high';
        if (hoursUntilDue <= 72) return 'medium';
        return 'low';
    }

    async getChatResponse(userId, message) {
        try {
            const User = require('../models/user.model');
            const user = await User.findById(userId);
            const tasks = await Task.find({ createdBy: userId });
            const stats = this._calculateStats(tasks);
            const productivityScore = this._calculateProductivityScore(stats);

            const contextPrompt = `System Prompt: You are Task BitSathy AI Assistant. Use this context: 
                User: ${user?.name || "User"}, Streak: ${user?.streak || 0} days, 
                Tasks: ${stats.totalTasks}, Completed: ${stats.completedTasks}, Score: ${productivityScore}%. 
                Be short, clear, actionable.`;

            return await this._callAI(message, [{ role: 'user', parts: [{ text: contextPrompt }] }]);
        } catch (error) {
            console.error("AI CHAT ERROR:", error.message, error.stack);
            if (error.message.includes("quota exceeded")) {
                return "The OpenAI API quota has been reached. Please check your billing or add credits.";
            }
            return "AI assistant is temporarily unavailable. Please try again.";
        }
    }

    _calculateStats(tasks) {
        const stats = { totalTasks: tasks.length, completedTasks: 0, pendingTasks: 0, overdueTasks: 0 };
        const now = new Date();
        tasks.forEach(t => {
            if (t.completed) stats.completedTasks++;
            else {
                stats.pendingTasks++;
                if (t.dueDate && isBefore(new Date(t.dueDate), now)) stats.overdueTasks++;
            }
        });
        return stats;
    }

    _calculateProductivityScore(stats) {
        if (stats.totalTasks === 0) return 100;
        let score = (stats.completedTasks / stats.totalTasks) * 100;
        score -= (stats.overdueTasks * 5);
        return Math.max(0, Math.min(100, Math.round(score)));
    }

    async parseVoiceCommand(transcript) {
        try {
            const prompt = `Convert this voice command into a structured task JSON object: "${transcript}".
                Fields: title, description, priority (low, medium, high), category, tags.
                Respond ONLY with JSON.`;
            const text = await this._callAI(prompt);
            const jsonMatch = text.match(/\{.*\}/s);
            return jsonMatch ? JSON.parse(jsonMatch[0]) : { title: transcript, priority: 'medium', category: 'Other' };
        } catch (error) {
            return { title: transcript, priority: 'medium', category: 'Other' };
        }
    }

    async suggestReminderTime(taskContext) {
        try {
            const prompt = `Suggest one ISO reminder date for: "${taskContext.title}", Due: ${taskContext.dueDate || 'None'}. Current: ${new Date().toISOString()}. Respond ONLY with ISO date.`;
            const text = await this._callAI(prompt);
            const dateMatch = text.match(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z/);
            return dateMatch ? dateMatch[0] : new Date().toISOString();
        } catch (error) {
            return new Date().toISOString();
        }
    }

    async getTaskIntelligenceResponse(userId, userRole, message) {
        let tasks = [];
        try {
            const User = require('../models/user.model');
            const query = userRole === 'admin' ? {} : { $or: [{ createdBy: userId }, { assignedByUserId: userId }] };
            tasks = await Task.find(query).populate('createdBy assignedTo assignedToUserId').sort({ createdAt: -1 }).limit(50);
            
            const summary = tasks.map(t => ({ title: t.title, status: t.status, priority: t.priority }));
            const systemPrompt = `System Prompt: You are BitTask Intelligence Assistant for ${userRole}. Recent tasks: ${JSON.stringify(summary)}.`;

            return await this._callAI(message, [{ role: 'user', parts: [{ text: systemPrompt }] }]);
        } catch (error) {
            console.error("AI INTELLIGENCE ERROR:", error.message, error.stack);
            if (error.message.includes("quota exceeded")) {
                return "The OpenAI API quota has been reached. Please check your billing or add credits.";
            }
            return "AI assistant is temporarily unavailable. Please try again.";
        }
    }
}

module.exports = new AIService();
