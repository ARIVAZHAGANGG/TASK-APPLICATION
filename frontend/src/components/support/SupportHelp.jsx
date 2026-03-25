import React from 'react';
import { CircleHelp, ChevronRight } from 'lucide-react';

const SupportHelp = ({ onSelectQuestion }) => {
    const faqs = [
        {
            q: "How to create a task?",
            a: "Click the '+ New Task' button in the Sidebar or Tasks page."
        },
        {
            q: "How to edit a task?",
            a: "Click on any task card to open the edit modal."
        },
        {
            q: "How to enable reminders?",
            a: "Go to Settings > Notifications to toggle reminders."
        },
        {
            q: "How streak works?",
            a: "Complete at least one task every day to maintain your streak!"
        },
        {
            q: "How team mode works?",
            a: "Workspaces allow you to invite members and collaborate on tasks."
        }
    ];

    return (
        <div className="p-4 space-y-4">
            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Frequently Asked Questions
            </h3>
            <div className="space-y-2">
                {faqs.map((faq, idx) => (
                    <button
                        key={idx}
                        onClick={() => onSelectQuestion(faq.q)}
                        className="w-full text-left p-4 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-800 rounded-xl hover:border-primary-500 transition-all group shadow-sm"
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <CircleHelp size={18} className="text-primary-500" />
                                <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
                                    {faq.q}
                                </span>
                            </div>
                            <ChevronRight size={16} className="text-slate-300 group-hover:text-primary-500 group-hover:translate-x-1 transition-all" />
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
};

export default SupportHelp;
