import { motion, AnimatePresence } from "framer-motion";
import { X, Plus, Bell, Sparkles, BrainCircuit, Loader2, ListPlus, Mic, MicOff, ExternalLink, MessageSquare, Info } from "lucide-react";
import { cn } from "../../utils/cn";
import Input from "./Input";
import AttachmentZone from "../tasks/AttachmentZone";
import TaskChat from "../tasks/TaskChat";
import { useState, useEffect, useRef } from "react";
import api from "../../services/api";
import { toast } from "sonner";
import Textarea from "./Textarea";

import { useAuth } from "../../context/AuthContext";

const TaskModal = ({ isOpen, onClose, onSave, task = null, initialTab = "details", initialBulkMode = false }) => {
    const { user } = useAuth();
    const isAdmin = user?.role === 'admin';
    const isStudent = user?.role === 'student';
    const isReadOnly = task && isStudent; // Students cannot edit existing tasks

    const cleanData = (data) => {
        const cleaned = { ...data };
        ['dueDate', 'reminderDate', 'phoneNumber', 'targetDate', 'targetTime', 'assignDate'].forEach(key => {
            if (cleaned[key] === "") delete cleaned[key];
        });
        return cleaned;
    };

    const [formData, setFormData] = useState({
        title: "",
        description: "",
        priority: "medium",
        dueDate: "",
        reminderEnabled: false,
        reminderDate: "",
        subtasks: [],
        recurrence: "none",
        smsEnabled: false,
        phoneNumber: "",
        status: "todo",
        estimatedTime: 60,
        documentationUrl: "",
        assignedToRole: "none",
        targetDate: "",
        targetTime: "",
        assignDate: new Date().toISOString().split('T')[0],
        taskType: "Assignment"
    });
    const [assignees, setAssignees] = useState([]);
    const [isLoadingAssignees, setIsLoadingAssignees] = useState(false);

    const [isGeneratingBreakdown, setIsGeneratingBreakdown] = useState(false);
    const [isSuggesting, setIsSuggesting] = useState(false);
    const [isSuggestingReminder, setIsSuggestingReminder] = useState(false);
    const [isBulkMode, setIsBulkMode] = useState(initialBulkMode);
    const [isListening, setIsListening] = useState(false);
    const [isProcessingVoice, setIsProcessingVoice] = useState(false);
    const [recognition, setRecognition] = useState(null);
    const [activeTab, setActiveTab] = useState(initialTab);

    useEffect(() => {
        setIsBulkMode(initialBulkMode);
    }, [initialBulkMode, isOpen]);

    useEffect(() => {
        if (task) {
            setFormData({
                title: task.title,
                description: task.description || "",
                priority: task.priority || "medium",
                dueDate: task.dueDate ? new Date(task.dueDate).toISOString().slice(0, 16) : "",
                reminderEnabled: task.reminderEnabled || false,
                reminderDate: task.reminderDate ? new Date(task.reminderDate).toISOString().slice(0, 16) : "",
                subtasks: task.subtasks || [],
                recurrence: task.recurrence || "none",
                smsEnabled: task.smsEnabled || false,
                phoneNumber: task.phoneNumber || "",
                status: task.status || "todo",
                estimatedTime: task.estimatedTime || 60,
                documentationUrl: task.documentationUrl || "",
                assignedToRole: task.assignedToRole || "none",
                targetDate: task.targetDate ? new Date(task.targetDate).toISOString().split('T')[0] : "",
                targetTime: task.targetTime || "",
                assignDate: task.assignDate ? new Date(task.assignDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
                taskType: task.taskType || "Assignment",
                createdAt: task.createdAt
            });
        } else {
            setFormData({
                title: "",
                description: "",
                priority: "medium",
                dueDate: "",
                reminderEnabled: false,
                reminderDate: "",
                subtasks: [],
                recurrence: "none",
                smsEnabled: false,
                phoneNumber: "",
                status: "todo",
                estimatedTime: 60,
                documentationUrl: "",
                assignedToUserId: "",
                assignedToRole: "none",
                targetDate: "",
                targetTime: "",
                assignDate: new Date().toISOString().split('T')[0],
                taskType: "Assignment"
            });
        }
        if (isOpen) {
            setActiveTab(initialTab || "details");
            if (task) fetchSubmissions();
        }
    }, [isOpen, initialTab, task]);

     const [submissions, setSubmissions] = useState([]);
    const [isSubmittingWork, setIsSubmittingWork] = useState(false);
    const [submissionLink, setSubmissionLink] = useState("");
    const [submissionAnswer, setSubmissionAnswer] = useState("");
    const [reviewNote, setReviewNote] = useState("");

    const fetchSubmissions = async () => {
        if (!task) return;
        try {
            const res = await api.get(`/submissions/task/${task.id || task._id}`);
            const data = res.data.data || res.data; // Handle both wrapped and unwrapped responses
            setSubmissions(Array.isArray(data) ? data : []);
            
            // If student, pre-fill link if already submitted
            if (isStudent && Array.isArray(data)) {
                const mySub = data.find(s => s.studentId === user.id || s.studentId?._id === user.id);
                if (mySub) {
                    setSubmissionLink(mySub.uploadedFileLink || "");
                    setSubmissionAnswer(mySub.answer || "");
                }
            }
        } catch (err) {
            console.error("Failed to fetch submissions", err);
        }
    };

    const handleSubmitWork = async () => {
        if (!submissionLink.trim() && !submissionAnswer.trim()) {
            toast.error("Please provide either a link or an answer");
            return;
        }
        setIsSubmittingWork(true);
        try {
            await api.post(`/submissions/task/${task.id || task._id}`, { 
                uploadedFileLink: submissionLink,
                answer: submissionAnswer
            });
            toast.success("Work submitted successfully!");
            fetchSubmissions();
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to submit work");
        } finally {
            setIsSubmittingWork(false);
        }
    };

    const handleReviewSubmission = async (submissionId, status, reviewNote) => {
        try {
            await api.patch(`/submissions/${submissionId}/review`, { status, reviewNote });
            toast.success(`Submission ${status} successfully`);
            fetchSubmissions();
        } catch (err) {
            toast.error("Failed to update status");
        }
    };

    useEffect(() => {
        const fetchAssignees = async () => {
            if (!isOpen) return;
            if (user?.role !== 'admin' && user?.role !== 'mentor') return;

            setIsLoadingAssignees(true);
            try {
                let res;
                if (user.role === 'admin') {
                    const [staffRes, studentRes] = await Promise.all([
                        api.get("/admin/staff"),
                        api.get("/admin/students")
                    ]);
                    const mentors = (staffRes.data || []).filter(u => u.role === 'mentor');
                    const students = studentRes.data || [];
                    setAssignees([...mentors, ...students]);
                } else {
                    const res = await api.get("/admin/students");
                    setAssignees(res.data || []);
                }
            } catch (error) {
                console.error("Failed to fetch assignees:", error);
                toast.error(`Failed to load assignees: ${error.response?.data?.message || error.message}`);
            } finally {
                setIsLoadingAssignees(false);
            }
        };
        fetchAssignees();
    }, [isOpen, user?.role]);


    const handleAIBreakdown = async () => {
        if (!formData.title) return;
        setIsGeneratingBreakdown(true);
        try {
            const res = await api.post("/tasks/breakdown", {
                title: formData.title,
                description: formData.description
            });
            const newSubtasks = res.data.breakdown.map(title => ({ title, completed: false }));
            setFormData(prev => ({
                ...prev,
                subtasks: [...prev.subtasks, ...newSubtasks]
            }));
            toast.success("AI breakdown successful!");
        } catch (error) {
            toast.error("AI breakdown failed");
        } finally {
            setIsGeneratingBreakdown(false);
        }
    };

    const handleAISuggestReminder = async () => {
        if (!formData.title) return;
        setIsSuggestingReminder(true);
        try {
            const res = await api.post("/ai/suggest-reminder", {
                title: formData.title,
                priority: formData.priority,
                dueDate: formData.dueDate
            });
            if (res.data.reminderDate) {
                setFormData(prev => ({
                    ...prev,
                    reminderEnabled: true,
                    reminderDate: new Date(res.data.reminderDate).toISOString().slice(0, 16)
                }));
                toast.success("AI suggested an optimal reminder!");
            }
        } catch (error) {
            toast.error("AI failed to suggest reminder");
        } finally {
            setIsSuggestingReminder(false);
        }
    };

    useEffect(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRecognition) {
            const recog = new SpeechRecognition();
            recog.continuous = false;
            recog.interimResults = false;
            recog.lang = 'en-US';

            recog.onstart = () => setIsListening(true);
            recog.onend = () => setIsListening(false);

            recog.onresult = async (event) => {
                const transcript = event.results[0][0].transcript;
                await handleVoiceProcess(transcript);
            };

            recog.onerror = (event) => {
                const error = event.error;
                console.error("Speech recognition error", error);
                setIsListening(false);
                if (error !== 'aborted' && error !== 'no-speech') {
                    toast.error("Voice recognition failed.");
                }
            };

            setRecognition(recog);
            return () => {
                recog.stop();
            };
        }
    }, []);

    const handleVoiceProcess = async (transcript) => {
        setIsProcessingVoice(true);
        try {
            const res = await api.post('/ai/voice-command', { transcript });
            if (res.data.success && res.data.task) {
                const taskData = res.data.task;
                setFormData(prev => ({
                    ...prev,
                    title: taskData.title || prev.title,
                    description: taskData.description || prev.description,
                    priority: taskData.priority?.toLowerCase() || prev.priority,
                    dueDate: taskData.dueDate ? new Date(taskData.dueDate).toISOString().slice(0, 16) : prev.dueDate
                }));
                toast.success("AI Assessment complete!", {
                    icon: <Sparkles className="text-amber-500" size={16} />
                });
            }
        } catch (err) {
            toast.error("AI failed to assess voice command");
        } finally {
            setIsProcessingVoice(false);
        }
    };

    const toggleListening = () => {
        if (!recognition) {
            toast.error("Speech recognition not supported");
            return;
        }
        if (isListening) {
            try {
                recognition.stop();
            } catch (e) {
                console.warn("Stop error", e);
            }
        } else {
            try {
                recognition.start();
            } catch (e) {
                console.error("Start error", e);
                // If it's already started, we just catch it
            }
        }
    };


    useEffect(() => {
        const getSuggestion = async () => {
            if (!formData.dueDate || task) return; // Only suggest for new tasks with due date

            setIsSuggesting(true);
            try {
                const res = await api.get(`/tasks/priority-suggestion?dueDate=${formData.dueDate}`);
                if (res.data.suggestedPriority) {
                    setFormData(prev => ({ ...prev, priority: res.data.suggestedPriority }));
                }
            } catch (err) {
                console.error("Failed to get priority suggestion:", err);
            } finally {
                setIsSuggesting(false);
            }
        };

        const timeoutId = setTimeout(getSuggestion, 500); // Debounce
        return () => clearTimeout(timeoutId);
    }, [formData.dueDate, task]);

    if (!isOpen) return null;

    const priorities = [
        { id: "low", label: "Low", color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-100" },
        { id: "medium", label: "Medium", color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-100" },
        { id: "high", label: "High", color: "text-red-600", bg: "bg-red-50", border: "border-red-100" },
    ];

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[60] flex items-center justify-center p-2 sm:p-4">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-slate-950/40 backdrop-blur-[6px]"
                />

                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 30 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 30 }}
                    transition={{ type: "spring", damping: 25, stiffness: 300 }}
                    className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-[28px] sm:rounded-[2.5rem] shadow-[0_32px_64px_-15px_rgba(0,0,0,0.15)] overflow-hidden border border-slate-100 dark:border-slate-800 flex flex-col h-[90vh] sm:h-[85vh] max-h-[900px]"
                >
                    <div className="px-5 py-4 sm:px-8 sm:py-6 border-b border-slate-50 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 z-10 shrink-0">
                        <div className="flex items-center justify-between w-full sm:w-auto">
                            <div className="flex items-center gap-2 sm:gap-3">
                                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-primary-50 dark:bg-primary-900/20 text-primary-600 flex items-center justify-center">
                                    <Plus size={20} className="sm:hidden" />
                                    <Plus size={24} className="hidden sm:block" />
                                </div>
                                <h2 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">
                                    {task ? "Update Task" : "New Task"}
                                </h2>
                            </div>
                            <button onClick={onClose} className="p-2 sm:hidden text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-all">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="flex items-center gap-2 sm:gap-3 overflow-x-auto pb-1 sm:pb-0 custom-scrollbar no-scrollbar">
                            {task && (
                                <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl sm:rounded-2xl shrink-0">
                                    <button
                                        type="button"
                                        onClick={() => setActiveTab("details")}
                                        className={cn(
                                            "px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg sm:rounded-xl text-[9px] sm:text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-1.5 sm:gap-2 whitespace-nowrap",
                                            activeTab === "details" ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm" : "text-slate-400 hover:text-slate-600"
                                        )}
                                    >
                                        <Info size={12} className="sm:size-[14px]" /> Details
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setActiveTab("submission")}
                                        className={cn(
                                            "px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg sm:rounded-xl text-[9px] sm:text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-1.5 sm:gap-2 whitespace-nowrap",
                                            activeTab === "submission" ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm" : "text-slate-400 hover:text-slate-600"
                                        )}
                                    >
                                        <ExternalLink size={12} className="sm:size-[14px]" /> {isStudent ? "Submit" : "Review"}
                                    </button>
                                    <button
                                        type="button"
                                        disabled={!task}
                                        onClick={() => setActiveTab("chat")}
                                        className={cn(
                                            "px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg sm:rounded-xl text-[9px] sm:text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-1.5 sm:gap-2 disabled:opacity-30 disabled:cursor-not-allowed whitespace-nowrap",
                                            activeTab === "chat" ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm" : "text-slate-400 hover:text-slate-600"
                                        )}
                                    >
                                        <MessageSquare size={12} className="sm:size-[14px]" /> Chat
                                    </button>
                                </div>
                            )}
                            <button
                                type="button"
                                onClick={() => setIsBulkMode(!isBulkMode)}
                                className={cn(
                                    "p-1.5 sm:p-2 rounded-xl transition-all flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs font-bold uppercase tracking-wider whitespace-nowrap shrink-0",
                                    isBulkMode
                                        ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20"
                                        : "bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-blue-500"
                                )}
                                title="Bulk Mode - Add multiple tasks list-wise"
                            >
                                <ListPlus size={16} className="sm:size-[18px]" />
                                {!isBulkMode ? "" : "Bulk Mode"}
                            </button>
                            <button onClick={onClose} className="hidden sm:block p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-all">
                                <X size={20} />
                            </button>
                        </div>
                    </div>
                     <form onSubmit={async (e) => {
                        e.preventDefault();
                        if (isBulkMode && !task) {
                            const titles = formData.title.split('\n').filter(t => t.trim() !== '');
                            if (titles.length === 0) return;

                            const bulkData = titles.map(title => cleanData({
                                ...formData,
                                title: title.trim()
                            }));
                            onSave(bulkData);
                        } else {
                            onSave(cleanData(formData));
                        }
                    }} className="flex flex-col h-full overflow-hidden">
                        <div className="flex-1 overflow-hidden relative">
                            <AnimatePresence mode="wait">
                                {activeTab === "details" ? (
                                    <motion.div
                                        key="details"
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 20 }}
                                        className="absolute inset-0 p-5 sm:p-8 space-y-5 sm:space-y-6 overflow-y-auto custom-scrollbar"
                                    >
                            {formData.createdAt && (
                                <div className="mb-4 flex items-center justify-between px-1">
                                    <div className="flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                                        <span className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Registered</span>
                                    </div>
                                    <span className="text-[9px] sm:text-[10px] font-black text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 sm:px-3 py-1 rounded-full uppercase tracking-widest">
                                        {new Date(formData.createdAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                                    </span>
                                </div>
                            )}

                            {task && (task.assignedToUserId || task.assignedByUserId || task.targetType !== 'Individual') && (
                                <div className="p-4 bg-indigo-50/50 dark:bg-indigo-900/10 rounded-2xl border border-indigo-100 dark:border-indigo-800/30 space-y-2">
                                    <p className="text-[9px] sm:text-[10px] font-black text-indigo-400 uppercase tracking-widest">Assignment Scope</p>
                                    <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
                                        {task.assignedByUserId && (
                                            <div className="flex flex-col">
                                                <span className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase">From</span>
                                                <span className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200">{task.assignedByUserId?.name}</span>
                                            </div>
                                        )}
                                        {(task.assignedByUserId && (task.assignedToUserId || task.targetType !== 'Individual')) && <div className="h-4 w-px bg-slate-200 dark:bg-slate-700 mx-1" />}
                                        <div className="flex flex-col">
                                            <span className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase">Target</span>
                                            <span className="text-xs sm:text-sm font-bold text-indigo-600 dark:text-indigo-400">
                                                {task.targetType === 'All' ? 'All Students' : 
                                                 task.targetType === 'Specific Batch' ? `${task.department} (${task.batch})` :
                                                 task.assignedToUserId?.name || task.assignedTo?.name || 'Personal'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="space-y-5 sm:space-y-6">
                                <div className="space-y-2">
                                    <div className="flex flex-col xs:flex-row xs:items-center justify-between gap-2 ml-1">
                                        <label className="text-sm font-bold text-slate-700 dark:text-slate-300">
                                            {isBulkMode ? "Task List (one per line)" : "Task Name"}
                                        </label>
                                        {!isBulkMode && isAdmin && (
                                            <button
                                                type="button"
                                                onClick={toggleListening}
                                                className={cn(
                                                    "w-fit flex items-center gap-2 px-3 py-1.5 rounded-full text-[9px] sm:text-[10px] font-black uppercase tracking-widest transition-all",
                                                    isListening 
                                                        ? "bg-rose-500 text-white animate-pulse" 
                                                        : isProcessingVoice 
                                                            ? "bg-amber-500 text-white" 
                                                            : "bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-primary-600"
                                                )}
                                            >
                                                {isProcessingVoice ? (
                                                    <Loader2 size={10} className="animate-spin" />
                                                ) : isListening ? (
                                                    <MicOff size={10} />
                                                ) : (
                                                    <Mic size={10} />
                                                )}
                                                {isProcessingVoice ? "AI Assessing..." : isListening ? "Listening..." : "Voice Assessment"}
                                            </button>
                                        )}
                                    </div>
                                    {isBulkMode ? (
                                        <textarea
                                            value={formData.title}
                                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                            required
                                            disabled={isReadOnly}
                                            placeholder="Task 1&#10;Task 2&#10;Task 3"
                                            className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl outline-none transition-all duration-300 focus:ring-4 focus:ring-primary-100 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 min-h-[100px] sm:min-h-[120px] font-medium disabled:opacity-70"
                                        />
                                    ) : (
                                        <Input
                                            value={formData.title}
                                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                            required
                                            disabled={isReadOnly}
                                            className="bg-slate-50 dark:bg-slate-800 border-none text-slate-800 dark:text-slate-100 py-3 sm:py-4"
                                        />
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <div className="flex items-center justify-between ml-1">
                                        <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Priority Level</label>
                                        {isSuggesting && (
                                            <span className="text-[9px] sm:text-[10px] text-primary-600 font-bold uppercase animate-pulse">
                                                AI Suggesting...
                                            </span>
                                        )}
                                    </div>
                                    <div className="grid grid-cols-3 gap-2 sm:gap-3">
                                        {priorities.map((p) => (
                                            <button
                                                key={p.id}
                                                type="button"
                                                disabled={isReadOnly}
                                                onClick={() => setFormData({ ...formData, priority: p.id })}
                                                className={cn(
                                                    "py-2 sm:py-2.5 rounded-xl sm:rounded-2xl border-2 transition-all duration-300 text-xs sm:text-sm font-bold",
                                                    formData.priority === p.id
                                                        ? `${p.bg} ${p.color} border-current ring-4 ring-current/10 dark:bg-opacity-20`
                                                        : "bg-white dark:bg-slate-800 text-slate-400 border-slate-100 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600",
                                                    isReadOnly && "opacity-60 cursor-not-allowed"
                                                )}
                                            >
                                                {p.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Task Type</label>
                                        <select
                                            value={formData.taskType}
                                            disabled={isReadOnly}
                                            onChange={(e) => setFormData({ ...formData, taskType: e.target.value })}
                                            className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl outline-none transition-all duration-300 focus:ring-4 focus:ring-primary-100 text-slate-800 dark:text-slate-100 disabled:opacity-70"
                                        >
                                            {["Assignment", "Project", "Quiz", "Lab Work", "Presentation", "Review", "Research", "Support"].map(type => (
                                                <option key={type} value={type}>{type}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <Input
                                            type="date"
                                            label="Assign Date"
                                            disabled={isReadOnly}
                                            value={formData.assignDate}
                                            onChange={(e) => setFormData({ ...formData, assignDate: e.target.value })}
                                            className="border-none bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 disabled:opacity-70"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Input
                                            type="date"
                                            label="Target Date"
                                            disabled={isReadOnly}
                                            value={formData.targetDate}
                                            onChange={(e) => setFormData({ ...formData, targetDate: e.target.value })}
                                            className="border-none bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 disabled:opacity-70"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Input
                                            type="time"
                                            label="Target Time"
                                            disabled={isReadOnly}
                                            value={formData.targetTime}
                                            onChange={(e) => setFormData({ ...formData, targetTime: e.target.value })}
                                            className="border-none bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 disabled:opacity-70"
                                        />
                                    </div>
                                </div>


                                <div className="space-y-2">
                                    <Input
                                        type="datetime-local"
                                        label="Due Date & Time"
                                        disabled={isReadOnly}
                                        value={formData.dueDate}
                                        onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                                        className="border-none bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 disabled:opacity-70"
                                    />
                                </div>

                                {(isAdmin || user?.role === 'mentor') && (
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">
                                            Assign To ({user.role === 'admin' ? 'Mentor' : 'Student'})
                                        </label>
                                        <select
                                            value={formData.assignedToUserId}
                                            onChange={(e) => {
                                                const userId = e.target.value;
                                                const selectedUser = assignees.find(a => a._id === userId || a.id === userId);
                                                const rRole = selectedUser?.role || (user.role === 'admin' ? 'mentor' : 'student');
                                                setFormData({
                                                    ...formData,
                                                    assignedToUserId: userId,
                                                    assignedToRole: userId ? rRole : 'none',
                                                    status: userId ? (rRole === 'mentor' ? 'assigned' : 'todo') : 'todo'
                                                });
                                            }}
                                            className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl outline-none transition-all duration-300 focus:ring-4 focus:ring-primary-100 text-slate-800 dark:text-slate-100"
                                        >
                                            <option value="">Personal Task (No Assignee)</option>
                                            {assignees.map(a => (
                                                <option key={a._id} value={a._id}>{a.name} ({a.email})</option>
                                            ))}
                                        </select>
                                    </div>
                                )}

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Est. Duration</label>
                                        <div className="flex flex-wrap sm:flex-nowrap gap-2">
                                            {[
                                                { label: '30m', value: 30 },
                                                { label: '1h', value: 60 },
                                                { label: '2h', value: 120 },
                                                { label: '3h', value: 180 }
                                            ].map(d => (
                                                <button
                                                    key={d.value}
                                                    type="button"
                                                    disabled={isReadOnly}
                                                    onClick={() => setFormData({ ...formData, estimatedTime: d.value })}
                                                    className={cn(
                                                        "flex-1 min-w-[50px] py-2 sm:py-3 px-1 rounded-xl sm:rounded-2xl border-2 text-[9px] sm:text-[10px] font-black uppercase tracking-widest transition-all",
                                                        formData.estimatedTime === d.value
                                                            ? "bg-primary-600 text-white border-primary-600 shadow-md"
                                                            : "bg-white dark:bg-slate-800 text-slate-400 border-slate-100 dark:border-slate-800",
                                                        isReadOnly && "opacity-60 cursor-not-allowed"
                                                    )}
                                                >
                                                    {d.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Expected Finish</label>
                                        <div className="px-4 py-2.5 sm:px-5 sm:py-3.5 bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-800/30 rounded-2xl flex items-center justify-between">
                                            <span className="text-[10px] sm:text-xs font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest italic">Target</span>
                                            <span className="text-sm font-black text-emerald-700 dark:text-emerald-300 font-mono">
                                                {formData.dueDate ? (
                                                    new Date(new Date(formData.dueDate).getTime() + formData.estimatedTime * 60000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                                                ) : "--:--"}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Recurrence Cycle</label>
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                        {[
                                            { id: "none", label: "None" },
                                            { id: "daily", label: "Daily" },
                                            { id: "weekly", label: "Weekly" },
                                            { id: "monthly", label: "Monthly" }
                                        ].map((r) => (
                                            <button
                                                key={r.id}
                                                type="button"
                                                disabled={isReadOnly}
                                                onClick={() => setFormData({ ...formData, recurrence: r.id })}
                                                className={cn(
                                                    "py-2 sm:py-2.5 rounded-xl border-2 text-[10px] sm:text-xs font-bold transition-all",
                                                    formData.recurrence === r.id
                                                        ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border-blue-200"
                                                        : "bg-white dark:bg-slate-800 text-slate-400 border-slate-100 dark:border-slate-700",
                                                    isReadOnly && "opacity-60 cursor-not-allowed"
                                                )}
                                            >
                                                {r.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Reminder Section */}
                                <div className="p-4 bg-slate-50/50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700 space-y-3">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-bold">
                                            <Bell size={16} />
                                            <span>Set Reminder</span>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                className="sr-only peer"
                                                disabled={isReadOnly}
                                                checked={formData.reminderEnabled}
                                                onChange={(e) => setFormData({ ...formData, reminderEnabled: e.target.checked })}
                                            />
                                            <div className={cn("w-11 h-6 bg-slate-200 dark:bg-slate-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-slate-900 dark:peer-checked:bg-primary-600",
                                             isReadOnly && "opacity-50 cursor-not-allowed")}></div>
                                        </label>
                                    </div>

                                    {formData.reminderEnabled && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: "auto", opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            className="overflow-hidden space-y-3"
                                        >
                                            <div className="flex items-center gap-2">
                                                <Input
                                                    type="datetime-local"
                                                    disabled={isReadOnly}
                                                    value={formData.reminderDate}
                                                    onChange={(e) => setFormData({ ...formData, reminderDate: e.target.value })}
                                                    className="border-none bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 flex-1 disabled:opacity-70"
                                                    placeholder="Reminder Time"
                                                />
                                                {!isReadOnly && (
                                                    <button
                                                        type="button"
                                                        onClick={handleAISuggestReminder}
                                                        disabled={isSuggestingReminder}
                                                        className="p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-xl hover:bg-blue-100 transition-all shadow-sm flex items-center justify-center shrink-0"
                                                        title="AI Suggest Optimal Time"
                                                    >
                                                        {isSuggestingReminder ? <Loader2 className="animate-spin" size={16} /> : <BrainCircuit size={16} />}
                                                    </button>
                                                )}
                                            </div>
                                        </motion.div>
                                    )}
                                </div>

                                {task && (
                                    <div className="p-6 bg-slate-50/50 dark:bg-slate-800/50 rounded-3xl border border-slate-100 dark:border-slate-700">
                                        <AttachmentZone
                                            taskId={task.id || task._id}
                                            attachments={task.attachments || []}
                                            onUpdate={(updatedTask) => {
                                                // We don't necessarily update parent form data here 
                                                // because onSave will refetch from parent Tasks.jsx
                                                // but we can refresh the view if needed.
                                            }}
                                        />
                                    </div>
                                )}

                                <div className="space-y-4">
                                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Description</label>
                                    <textarea
                                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl outline-none transition-all duration-300 focus:ring-4 focus:ring-primary-100 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 min-h-[120px] disabled:opacity-70"
                                        placeholder="Briefly describe the objective..."
                                        disabled={isReadOnly}
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    />
                                    {!isReadOnly && (
                                        <div className="flex justify-end">
                                            <button
                                                type="button"
                                                onClick={handleAIBreakdown}
                                                disabled={isGeneratingBreakdown || !formData.title}
                                                className="flex items-center gap-2 text-xs font-bold text-sky-600 hover:text-sky-700 disabled:opacity-50 transition-colors"
                                            >
                                                <Sparkles size={14} className={isGeneratingBreakdown ? "animate-spin" : ""} />
                                                {isGeneratingBreakdown ? "Generating..." : "AI Auto-Breakdown"}
                                            </button>
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-4">
                                    <div className="flex items-center justify-between ml-1">
                                        <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Documentation (URL)</label>
                                        {formData.documentationUrl && (
                                            <a 
                                                href={formData.documentationUrl.startsWith('http') ? formData.documentationUrl : `https://${formData.documentationUrl}`} 
                                                target="_blank" 
                                                rel="noopener noreferrer"
                                                className="text-[10px] font-black text-primary-600 uppercase tracking-widest hover:underline flex items-center gap-1"
                                            >
                                                Verify Link <ExternalLink size={10} />
                                            </a>
                                        )}
                                    </div>
                                    <Input
                                        placeholder="Add documentation link (Google Doc, GitHub, etc.)"
                                        disabled={isReadOnly}
                                        value={formData.documentationUrl}
                                        onChange={(e) => setFormData({ ...formData, documentationUrl: e.target.value })}
                                        className="bg-slate-50 dark:bg-slate-800 border-none text-slate-800 dark:text-slate-100 disabled:opacity-70"
                                    />
                                </div>
                            </div>
                        </motion.div>
                                ) : activeTab === "chat" ? (
                                    <motion.div
                                        key="chat"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        className="absolute inset-0 p-5 sm:p-8"
                                    >
                                        <TaskChat taskId={(task?.id || task?._id)?.toString()} />
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        key="submission"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        className="absolute inset-0 p-5 sm:p-8 space-y-5 sm:space-y-6 overflow-y-auto custom-scrollbar"
                                    >
                                        {isStudent ? (
                                            <div className="space-y-5 sm:space-y-6">
                                                 <div className="p-5 sm:p-6 bg-slate-50 dark:bg-slate-800/30 rounded-[28px] sm:rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-4">
                                                    <h3 className="text-base sm:text-lg font-black text-slate-800 dark:text-white mb-2 uppercase tracking-tighter">Submit Your Work</h3>
                                                    <p className="text-[11px] sm:text-xs font-bold text-slate-500 mb-4 leading-relaxed">Provide a link to your completed task or type your answer below.</p>
                                                    <div className="space-y-4">
                                                        <Input
                                                            label="Submission Link (URL)"
                                                            placeholder="https://your-submission-link.com"
                                                            value={submissionLink}
                                                            onChange={e => setSubmissionLink(e.target.value)}
                                                            className="bg-white dark:bg-slate-900 border-none"
                                                        />
                                                        <Textarea
                                                            label="Your Answer / Notes"
                                                            placeholder="Type your response here..."
                                                            value={submissionAnswer}
                                                            onChange={e => setSubmissionAnswer(e.target.value)}
                                                            className="bg-white dark:bg-slate-900 border-none"
                                                        />
                                                        <button 
                                                            type="button"
                                                            onClick={handleSubmitWork}
                                                            disabled={isSubmittingWork || (!submissionLink.trim() && !submissionAnswer.trim())}
                                                            className="w-full py-3.5 sm:py-4 bg-primary-600 text-white font-black text-[10px] sm:text-xs uppercase tracking-[0.2em] rounded-xl sm:rounded-2xl shadow-lg shadow-primary-500/20 hover:bg-primary-700 disabled:opacity-50 transition-all active:scale-[0.98]"
                                                        >
                                                            {isSubmittingWork ? "Uploading..." : "Publish Submission"}
                                                        </button>
                                                    </div>
                                                </div>

                                                <div className="space-y-4">
                                                    <h4 className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Submission Status</h4>
                                                    {submissions.length > 0 ? (
                                                        submissions.filter(s => s.studentId === user.id || s.studentId?._id === user.id).map(s => (
                                                             <div key={s._id} className="p-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 flex flex-col gap-3">
                                                                <div className="flex items-center justify-between">
                                                                    <div className="flex flex-col gap-1">
                                                                        {s.uploadedFileLink && (
                                                                            <a href={s.uploadedFileLink.startsWith('http') ? s.uploadedFileLink : `https://${s.uploadedFileLink}`} target="_blank" rel="noreferrer" className="text-xs sm:text-sm font-bold text-blue-500 hover:underline flex items-center gap-2">View Link <ExternalLink size={12}/></a>
                                                                        )}
                                                                        <span className="text-[9px] sm:text-[10px] font-bold text-slate-400">{new Date(s.submissionDate || s.createdAt).toLocaleString()}</span>
                                                                    </div>
                                                                    <span className={cn(
                                                                        "badge text-[9px]",
                                                                        s.status === 'approved' ? "badge-success" : s.status === 'rejected' ? "badge-danger" : "badge-warning"
                                                                    )}>{s.status}</span>
                                                                </div>
                                                                {s.answer && (
                                                                    <div className="p-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl text-xs text-slate-600 dark:text-slate-300 border border-slate-100 dark:border-slate-800 italic">
                                                                        {s.answer}
                                                                    </div>
                                                                )}
                                                                {s.reviewNote && (
                                                                    <div className="mt-2 p-3 bg-indigo-50/50 dark:bg-indigo-900/20 rounded-xl border border-indigo-100 dark:border-indigo-800/30">
                                                                        <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-1">Mentor Feedback</p>
                                                                        <p className="text-xs font-bold text-slate-700 dark:text-slate-200">{s.reviewNote}</p>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        ))
                                                    ) : (
                                                        <div className="p-6 bg-slate-50 dark:bg-slate-800/20 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700 text-center">
                                                            <p className="text-xs font-bold text-slate-400">No submissions yet.</p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="space-y-6">
                                                <div className="flex items-center justify-between px-2">
                                                    <h3 className="text-lg font-black text-slate-800 dark:text-white uppercase tracking-tighter">Student Submissions</h3>
                                                    <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-[10px] font-black text-slate-500 uppercase tracking-widest">{submissions.length} Total</span>
                                                </div>

                                                {submissions.length > 0 ? (
                                                    <div className="space-y-4">
                                                        {submissions.map(s => (
                                                            <div key={s._id} className="p-6 bg-white dark:bg-slate-800/50 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-4 transform hover:scale-[1.01] transition-transform">
                                                                <div className="flex items-center justify-between">
                                                                    <div className="flex items-center gap-3">
                                                                        <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center font-black text-slate-500">
                                                                            {s.studentId?.name?.charAt(0) || "S"}
                                                                        </div>
                                                                        <div>
                                                                            <p className="text-sm font-black text-slate-800 dark:text-white">{s.studentId?.name || "Student"}</p>
                                                                            <p className="text-[10px] font-bold text-slate-400">{s.studentId?.email}</p>
                                                                        </div>
                                                                    </div>
                                                                    <span className={cn(
                                                                        "badge",
                                                                        s.status === 'approved' ? "badge-success" : s.status === 'rejected' ? "badge-danger" : "badge-warning"
                                                                    )}>{s.status}</span>
                                                                </div>

                                                                 <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-3">
                                                                    {s.uploadedFileLink && (
                                                                        <a href={s.uploadedFileLink.startsWith('http') ? s.uploadedFileLink : `https://${s.uploadedFileLink}`} target="_blank" rel="noreferrer" className="text-xs font-bold text-blue-500 hover:underline flex items-center justify-center gap-2 py-4 border-2 border-dashed border-blue-100 dark:border-blue-900/30 rounded-xl bg-blue-50/30 dark:bg-blue-900/10 transition-colors hover:bg-blue-100/50">
                                                                            Open Submission URL <ExternalLink size={14}/>
                                                                        </a>
                                                                    )}
                                                                    {s.answer && (
                                                                        <div className="p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700">
                                                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Student Answer</p>
                                                                            <p className="text-sm font-bold text-slate-700 dark:text-slate-200 whitespace-pre-wrap">{s.answer}</p>
                                                                        </div>
                                                                    )}
                                                                </div>

                                                                {s.status === 'pending' ? (
                                                                    <div className="space-y-4">
                                                                        <Textarea
                                                                            label="Review Note (Feedback)"
                                                                            placeholder="Explain why you are approving/rejecting..."
                                                                            value={reviewNote}
                                                                            onChange={(e) => setReviewNote(e.target.value)}
                                                                            className="bg-white dark:bg-slate-800"
                                                                        />
                                                                        <div className="grid grid-cols-2 gap-3">
                                                                            <button 
                                                                                onClick={() => { handleReviewSubmission(s._id, 'approved', reviewNote); setReviewNote(""); }}
                                                                                className="py-3 bg-emerald-500 text-white font-black text-[10px] uppercase tracking-widest rounded-xl shadow-lg shadow-emerald-500/20 hover:bg-emerald-600 transition-all border-none"
                                                                            >Approve Work</button>
                                                                            <button 
                                                                                onClick={() => { handleReviewSubmission(s._id, 'rejected', reviewNote); setReviewNote(""); }}
                                                                                className="py-3 bg-rose-500 text-white font-black text-[10px] uppercase tracking-widest rounded-xl shadow-lg shadow-rose-500/20 hover:bg-rose-600 transition-all border-none"
                                                                            >Reject Work</button>
                                                                        </div>
                                                                    </div>
                                                                ) : s.reviewNote && (
                                                                    <div className="p-4 bg-indigo-50/50 dark:bg-indigo-900/10 rounded-2xl border border-indigo-100 dark:border-indigo-800/30">
                                                                        <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-1">Your Feedback</p>
                                                                        <p className="text-xs font-bold text-slate-700 dark:text-slate-200">{s.reviewNote}</p>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <div className="p-20 bg-slate-50 dark:bg-slate-800/20 rounded-[40px] border-2 border-dashed border-slate-200 dark:border-slate-700 text-center">
                                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Waiting for responses...</p>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        <div className="flex items-center gap-3 p-5 sm:p-8 pt-4 border-t border-slate-50 dark:border-slate-800 bg-white dark:bg-slate-900">
                            <button
                                type="button"
                                onClick={onClose}
                                className={cn(
                                    "py-3 sm:py-4 rounded-xl sm:rounded-2xl font-bold transition-all",
                                    isReadOnly 
                                        ? "flex-1 bg-slate-900 dark:bg-primary-600 text-white shadow-xl shadow-slate-900/10 hover:shadow-2xl hover:bg-black dark:hover:bg-primary-700" 
                                        : "flex-1 px-4 sm:px-6 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 text-sm sm:text-base"
                                )}
                            >
                                {isReadOnly ? "Close View" : "Cancel"}
                            </button>
                            {!isReadOnly && (
                                <button
                                    type="submit"
                                    className="flex-[2] py-3 sm:py-4 px-4 sm:px-6 rounded-xl sm:rounded-2xl bg-slate-900 dark:bg-primary-600 text-white font-bold shadow-xl shadow-slate-900/10 hover:shadow-2xl hover:bg-black dark:hover:bg-primary-700 transition-all text-sm sm:text-base"
                                >
                                    {isBulkMode ? "Launch" : task ? "Update" : "Launch"}
                                </button>
                            )}
                        </div>
                    </form>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default TaskModal;
