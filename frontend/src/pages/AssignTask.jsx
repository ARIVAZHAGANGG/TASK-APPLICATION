import { useState, useEffect } from "react";
import { Users, Calendar, Flag, Send, Loader2, User as UserIcon, ListTodo, Mic, MicOff, Sparkles, Plus, X, Trash2, ChevronDown, Layers, Clock, Zap, Eye, BarChart2, CheckSquare, Paperclip, Star, Target, Tag, UserPlus, ToggleLeft, ToggleRight, Hash, RefreshCw, Copy, Share2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../services/api";
import { toast } from "sonner";
import { cn } from "../utils/cn";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import { useAuth } from "../context/AuthContext";


const SelectField = ({ label, icon: Icon, value, onChange, options, className }) => (
    <div className={cn("space-y-2", className)}>
        <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2">
            {Icon && <Icon size={12} />} {label}
        </label>
        <div className="relative">
            <select
                value={value}
                onChange={onChange}
                className="saas-input appearance-none pr-8 w-full"
            >
                {options.map(o => (
                    <option key={o.value || o} value={o.value || o}>{o.label || o}</option>
                ))}
            </select>
            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        </div>
    </div>
);

const AssignTask = () => {
    const { user: currentUser } = useAuth();
    const [recipients, setRecipients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedRecipientIds, setSelectedRecipientIds] = useState([]);
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        dueDate: "",
        targetDate: "",
        targetTime: "",
        assignDate: new Date().toISOString().split('T')[0],
        taskType: "Assignment",
        priority: "medium",
        attachmentUrl: "",
        category: "Development",
        estimatedHours: "",
        complexity: "Medium",
        reviewType: "Mentor Review",
        productivityWeight: 5,
        visibility: "Private",
        clonable: false,
        delegatable: false,
        recurrence: "none",
        tags: [],
        targetType: "Individual", // Individual, Specific Batch, All
        department: "",
        batch: "",
    });
    const [sendIndividual, setSendIndividual] = useState(true);
    const [newTag, setNewTag] = useState("");

    // Checklist items
    const [checklistItems, setChecklistItems] = useState([]);
    const [newChecklistItem, setNewChecklistItem] = useState("");

    const isMentor = currentUser?.role === 'mentor';
    const isAdmin = currentUser?.role === 'admin';

    // Voice States
    const [isListening, setIsListening] = useState(false);
    const [isProcessingVoice, setIsProcessingVoice] = useState(false);
    const [recognition, setRecognition] = useState(null);
    const [voiceTranscript, setVoiceTranscript] = useState("");

    useEffect(() => {
        const handleVoiceFill = (e) => {
            const taskData = e.detail;
            setFormData(prev => ({
                ...prev,
                title: taskData.title || prev.title,
                description: taskData.description || prev.description,
                priority: taskData.priority?.toLowerCase() || prev.priority,
                category: taskData.category || prev.category,
                taskType: taskData.taskType || prev.taskType,
                complexity: taskData.complexity || prev.complexity,
                dueDate: taskData.dueDate ? new Date(taskData.dueDate).toISOString().split('T')[0] : prev.dueDate,
                targetDate: taskData.targetDate ? new Date(taskData.targetDate).toISOString().split('T')[0] : prev.targetDate,
                targetTime: taskData.targetTime || prev.targetTime,
                estimatedHours: taskData.estimatedHours || prev.estimatedHours,
                recurrence: taskData.recurrence?.toLowerCase() || prev.recurrence,
                tags: taskData.tags || prev.tags
            }));
            toast.success("AI Field filling complete!", {
                icon: <Sparkles className="text-emerald-500" size={16} />
            });
        };

        window.addEventListener("voice-data-fill", handleVoiceFill);
        return () => window.removeEventListener("voice-data-fill", handleVoiceFill);
    }, []);

    useEffect(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (typeof window !== 'undefined' && SpeechRecognition) {
            const recog = new SpeechRecognition();
            recog.continuous = true;
            recog.interimResults = true;
            recog.lang = 'en-US';

            recog.onstart = () => {
                setIsListening(true);
            };
            recog.onend = () => {
                setIsListening(false);
            };
            recog.onresult = (event) => {
                let interimTranscript = "";
                for (let i = event.resultIndex; i < event.results.length; ++i) {
                    if (event.results[i].isFinal) {
                        setVoiceTranscript(prev => prev + event.results[i][0].transcript + " ");
                    } else {
                        interimTranscript += event.results[i][0].transcript;
                    }
                }
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
        if (!transcript.trim()) return;
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
                    category: taskData.category || prev.category,
                    taskType: taskData.taskType || prev.taskType,
                    complexity: taskData.complexity || prev.complexity,
                    dueDate: taskData.dueDate ? new Date(taskData.dueDate).toISOString().split('T')[0] : prev.dueDate,
                    targetDate: taskData.targetDate ? new Date(taskData.targetDate).toISOString().split('T')[0] : prev.targetDate,
                    targetTime: taskData.targetTime || prev.targetTime,
                    estimatedHours: taskData.estimatedHours || prev.estimatedHours,
                    recurrence: taskData.recurrence?.toLowerCase() || prev.recurrence,
                    tags: taskData.tags || prev.tags
                }));
                toast.success("AI Assessment complete!", {
                    icon: <Sparkles className="text-amber-500" size={16} />
                });
            }
        } catch (err) {
            toast.error("AI failed to assess voice command");
        } finally {
            setIsProcessingVoice(false);
            setVoiceTranscript("");
        }
    };

    const toggleListening = () => {
        if (!recognition) { toast.error("Speech recognition not supported"); return; }
        if (isListening) { 
            recognition.stop(); 
            // Trigger processing on manual stop
            setTimeout(() => handleVoiceProcess(voiceTranscript), 500);
        } else { 
            setVoiceTranscript("");
            recognition.start(); 
        }
    };

    useEffect(() => {
        const fetchRecipients = async () => {
            try {
                let data = [];
                if (isAdmin) {
                    const staffRes = await api.get("/admin/staff");
                    const mentors = (staffRes.data || []).filter(u => u.role === 'mentor');
                    data = mentors;
                } else if (isMentor) {
                    const res = await api.get("/admin/students");
                    data = res.data || [];
                }
                setRecipients(data);

                // Handle pre-selection from studentId query param
                const urlParams = new URLSearchParams(window.location.search);
                const studentId = urlParams.get('studentId');
                if (studentId && data.some(r => (r.id || r._id) === studentId)) {
                    setSelectedRecipientIds([studentId]);
                }
            } catch (error) {
                console.error("Recipient load failed:", error);
                toast.error(`Failed to load recipients: ${error.response?.data?.message || error.message}`);
            } finally {
                setLoading(false);
            }
        };
        fetchRecipients();
    }, [isAdmin, isMentor]);

    const toggleRecipient = (id) => {
        setSelectedRecipientIds(prev =>
            prev.includes(id) ? prev.filter(rid => rid !== id) : [...prev, id]
        );
    };


    const addChecklistItem = () => {
        if (!newChecklistItem.trim()) return;
        setChecklistItems(prev => [...prev, { title: newChecklistItem.trim(), completed: false }]);
        setNewChecklistItem("");
    };

    const removeChecklistItem = (index) => {
        setChecklistItems(prev => prev.filter((_, i) => i !== index));
    };

    const addTag = () => {
        const tag = newTag.trim().replace(/^#/, '');
        if (!tag || formData.tags.includes(tag)) return;
        setFormData(prev => ({ ...prev, tags: [...prev.tags, tag] }));
        setNewTag("");
    };

    const removeTag = (tag) => {
        setFormData(prev => ({ ...prev, tags: prev.tags.filter(t => t !== tag) }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Validation: If individual, must have recipients. If batch, must have department/batch.
        if (formData.targetType === 'Individual' && selectedRecipientIds.length === 0) {
            return toast.error(`Please select at least one ${isAdmin ? 'mentor' : 'student'} first`);
        }
        if (formData.targetType === 'Specific Batch' && (!formData.department || !formData.batch)) {
            return toast.error("Please specify Department and Batch");
        }

        setIsSubmitting(true);
        try {
            let promises = [];

            if (formData.targetType === 'Individual') {
                // Individual mode: separate task for each recipient
                promises = selectedRecipientIds.map(recipientId => {
                    const recipient = recipients.find(r => r._id === recipientId || r.id === recipientId);
                    const rRole = recipient?.role || (isAdmin ? 'mentor' : 'student');
                    return api.post("/tasks", {
                        ...formData,
                        subtasks: checklistItems,
                        status: rRole === 'mentor' ? 'assigned' : 'todo',
                        assignedToUserId: recipientId,
                        assignedToRole: rRole,
                        createdByRole: currentUser.role
                    });
                });
            } else {
                // Batch or All mode: Single task creation with scope metadata
                promises = [api.post("/tasks", {
                    ...formData,
                    subtasks: checklistItems,
                    status: 'assigned',
                    createdByRole: currentUser.role
                })];
            }

            await Promise.all(promises);
            
            const successMsg = formData.targetType === 'Individual'
                ? `${selectedRecipientIds.length} individual tasks deployed!`
                : `Task deployed to ${formData.targetType === 'All' ? 'all students' : 'the specified batch'}!`;
            
            toast.success(successMsg);
            
            // Reset Form
            setFormData({
                title: "", description: "", dueDate: "", targetDate: "", targetTime: "",
                assignDate: new Date().toISOString().split('T')[0], taskType: "Assignment",
                priority: "medium", attachmentUrl: "",
                category: "Development", estimatedHours: "", complexity: "Medium",
                clonable: false, delegatable: false, recurrence: "none", tags: [],
                targetType: "Individual", department: "", batch: ""
            });
            setChecklistItems([]);
            setSelectedRecipientIds([]);
        } catch (error) {
            console.error("Task assignment error:", error);
            toast.error(error.response?.data?.message || "Failed to assign task");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="max-w-6xl mx-auto p-4 md:p-8">
            <header className="mb-10">
                <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight uppercase">Task Assignment</h1>
                <p className="text-slate-500 font-medium">
                    {isAdmin ? "Direct mentors to achieve institutional goals." : "Empower your students with new objectives."}
                </p>
            </header>

            <div className="grid lg:grid-cols-3 gap-8">
                {/* Recipient Selection */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-xl text-blue-600">
                                <Users size={20} />
                            </div>
                            <h2 className="font-black text-slate-900 dark:text-white uppercase text-sm tracking-widest">Select {isAdmin ? 'Mentor' : 'Student'}</h2>
                        </div>

                        <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                            {loading ? (
                                [1, 2, 3].map(i => <div key={i} className="h-14 bg-slate-50 dark:bg-slate-800 animate-pulse rounded-2xl" />)
                            ) : recipients.length > 0 ? (
                                recipients.map((recipient) => (
                                    <button
                                        key={recipient.id || recipient._id}
                                        onClick={() => toggleRecipient(recipient.id || recipient._id)}
                                        className={cn(
                                            "w-full flex items-center gap-4 p-3 rounded-2xl border transition-all text-left group",
                                            selectedRecipientIds.includes(recipient.id || recipient._id)
                                                ? "bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800"
                                                : "border-transparent hover:bg-slate-50 dark:hover:bg-slate-800"
                                        )}
                                    >
                                        <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 overflow-hidden ring-2 ring-transparent group-hover:ring-blue-500/20 transition-all">
                                            {recipient.avatar ? (
                                                <img src={recipient.avatar} alt="" className="w-full h-full object-cover" />
                                            ) : (
                                                <UserIcon size={20} />
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-bold text-slate-900 dark:text-slate-100 truncate text-sm">{recipient.name}</p>
                                            <p className="text-xs text-slate-500 truncate">{recipient.email}</p>
                                            <p className="text-[10px] font-black uppercase text-slate-400">{recipient.role}</p>
                                        </div>
                                        {selectedRecipientIds.includes(recipient.id || recipient._id) && (
                                            <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">
                                                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                                            </div>
                                        )}
                                    </button>
                                ))
                            ) : (
                                <p className="text-center text-slate-500 py-8 text-sm italic">No {isAdmin ? 'mentors' : 'students'} found.</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Task Form */}
                <div className="lg:col-span-2">
                    <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 p-8 rounded-[32px] border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/5 blur-[80px] rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />

                        {/* Header */}
                        <div className="flex items-center justify-between mb-8 relative z-10">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-amber-50 dark:bg-amber-900/20 rounded-xl text-amber-600">
                                    <ListTodo size={20} />
                                </div>
                                <h2 className="font-black text-slate-900 dark:text-white uppercase text-sm tracking-widest">Task Details</h2>
                            </div>

                            {(isAdmin || isMentor) && (
                                <div className="flex flex-col gap-1 items-end">
                                    <button
                                        type="button"
                                        onClick={toggleListening}
                                        className={cn(
                                            "flex items-center gap-2 px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg",
                                            isListening
                                                ? "bg-gradient-to-r from-rose-500 to-pink-600 text-white animate-pulse shadow-rose-500/20"
                                                : isProcessingVoice
                                                    ? "bg-gradient-to-r from-amber-400 to-orange-500 text-white shadow-amber-500/20"
                                                    : "bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-blue-500/20 hover:scale-105 active:scale-95"
                                        )}
                                    >
                                        {isProcessingVoice ? (
                                            <Loader2 size={12} className="animate-spin" />
                                        ) : isListening ? (
                                            <MicOff size={12} />
                                        ) : (
                                            <Mic size={12} />
                                        )}
                                        {isProcessingVoice ? "AI Assessing..." : isListening ? "Listening..." : "Voice Assistant"}
                                    </button>
                                    {isListening && voiceTranscript && (
                                        <div className="mt-1 px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded text-xs text-slate-700 dark:text-slate-200 max-w-xs truncate">
                                            {voiceTranscript}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                        
                        {/* --- ASSIGNMENT SCOPE --- */}
                        <div className="bg-slate-50 dark:bg-slate-800/30 p-6 rounded-[24px] border border-slate-100 dark:border-slate-800 mb-6 space-y-4">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl text-indigo-600">
                                    <Target size={18} />
                                </div>
                                <h3 className="font-black text-slate-800 dark:text-white uppercase text-xs tracking-widest">Assignment Scope</h3>
                            </div>
                            
                            <div className="grid md:grid-cols-3 gap-3">
                                {[
                                    { id: 'Individual', label: 'Individual', icon: UserIcon },
                                    { id: 'Specific Batch', label: 'Specific Batch', icon: Users },
                                    { id: 'All', label: 'All Students', icon: Layers }
                                ].map(scope => (
                                    <button
                                        key={scope.id}
                                        type="button"
                                        onClick={() => setFormData({ ...formData, targetType: scope.id })}
                                        className={cn(
                                            "flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all gap-2",
                                            formData.targetType === scope.id
                                                ? "bg-white dark:bg-slate-700 border-blue-500 text-blue-600 shadow-md"
                                                : "bg-transparent border-slate-100 dark:border-slate-800 text-slate-400 hover:border-slate-200"
                                        )}
                                    >
                                        <scope.icon size={20} />
                                        <span className="text-[10px] font-black uppercase tracking-widest">{scope.label}</span>
                                    </button>
                                ))}
                            </div>

                            {formData.targetType === 'Specific Batch' && (
                                <motion.div 
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="grid md:grid-cols-2 gap-4 mt-4"
                                >
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Department</label>
                                        <input
                                            type="text"
                                            className="saas-input"
                                            placeholder="e.g. Computer Science"
                                            value={formData.department}
                                            onChange={e => setFormData({ ...formData, department: e.target.value })}
                                            required={formData.targetType === 'Specific Batch'}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Batch Name / Year</label>
                                        <input
                                            type="text"
                                            className="saas-input"
                                            placeholder="e.g. 2022-2026"
                                            value={formData.batch}
                                            onChange={e => setFormData({ ...formData, batch: e.target.value })}
                                            required={formData.targetType === 'Specific Batch'}
                                        />
                                    </div>
                                </motion.div>
                            )}
                        </div>

                        <div className="space-y-6 relative z-10">

                            {/* --- SECTION 1: BASIC INFO --- */}
                            <div className="space-y-2">
                                <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Mission Title</label>
                                <input
                                    type="text"
                                    className="saas-input"
                                    placeholder="e.g., Final Year Project Documentation"
                                    value={formData.title}
                                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Engagement Description</label>
                                <textarea
                                    className="saas-input min-h-[100px] py-4 resize-none"
                                    placeholder="Outline the specific deliverables and expectations..."
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                />
                            </div>

                            {/* --- TASK TYPE & ASSIGN DATE --- */}
                            <div className="grid md:grid-cols-2 gap-4">
                                <SelectField
                                    label="Task Type"
                                    icon={Tag}
                                    value={formData.taskType}
                                    onChange={e => setFormData({ ...formData, taskType: e.target.value })}
                                    options={["Assignment", "Project", "Quiz", "Lab Work", "Presentation", "Review", "Research", "Support"]}
                                />
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                                        <Calendar size={12} /> Assign Date
                                    </label>
                                    <input
                                        type="date"
                                        className="saas-input"
                                        value={formData.assignDate}
                                        onChange={e => setFormData({ ...formData, assignDate: e.target.value })}
                                    />
                                </div>
                            </div>

                            {/* --- TARGET DATE & TARGET TIME --- */}
                            <div className="grid md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                                        <Target size={12} /> Target Date
                                    </label>
                                    <input
                                        type="date"
                                        className="saas-input"
                                        value={formData.targetDate}
                                        onChange={e => setFormData({ ...formData, targetDate: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                                        <Clock size={12} /> Target Time
                                    </label>
                                    <input
                                        type="time"
                                        className="saas-input"
                                        value={formData.targetTime}
                                        onChange={e => setFormData({ ...formData, targetTime: e.target.value })}
                                    />
                                </div>
                            </div>

                            {/* --- SECTION 2: CATEGORY & COMPLEXITY --- */}
                            <div className="grid md:grid-cols-2 gap-4">
                                <SelectField
                                    label="Task Category"
                                    icon={Layers}
                                    value={formData.category}
                                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                                    options={["Development", "Research", "Documentation", "Testing", "Design", "Bug Fix"]}
                                />
                                <SelectField
                                    label="Task Complexity"
                                    icon={Zap}
                                    value={formData.complexity}
                                    onChange={e => setFormData({ ...formData, complexity: e.target.value })}
                                    options={[
                                        { value: "Easy", label: "🟢 Easy" },
                                        { value: "Medium", label: "🟡 Medium" },
                                        { value: "Hard", label: "🟠 Hard" },
                                        { value: "Critical", label: "🔴 Critical" },
                                    ]}
                                />
                            </div>

                            {/* --- SECTION 3: DEADLINE & PRIORITY --- */}
                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                                        <Calendar size={12} /> Deadline
                                    </label>
                                    <input
                                        type="date"
                                        className="saas-input"
                                        value={formData.dueDate}
                                        onChange={e => setFormData({ ...formData, dueDate: e.target.value })}
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                                        <Clock size={12} /> Estimated Hours
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        max="999"
                                        className="saas-input"
                                        placeholder="e.g., 8"
                                        value={formData.estimatedHours}
                                        onChange={e => setFormData({ ...formData, estimatedHours: e.target.value })}
                                    />
                                </div>
                            </div>

                            {/* --- PRIORITY --- */}
                            <div className="space-y-2">
                                <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                                    <Flag size={12} /> Priority Level
                                </label>
                                <div className="flex p-1 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                                    {['low', 'medium', 'high'].map((p) => (
                                        <button
                                            key={p}
                                            type="button"
                                            onClick={() => setFormData({ ...formData, priority: p })}
                                            className={cn(
                                                "flex-1 py-2 text-xs font-black uppercase tracking-widest rounded-xl transition-all",
                                                formData.priority === p
                                                    ? p === 'high' ? "bg-red-500 text-white shadow-lg shadow-red-500/30" :
                                                      p === 'medium' ? "bg-amber-500 text-white shadow-lg shadow-amber-500/30" :
                                                      "bg-blue-500 text-white shadow-lg shadow-blue-500/30"
                                                    : "text-slate-500 hover:text-slate-800 dark:hover:text-white"
                                            )}
                                        >
                                            {p}
                                        </button>
                                    ))}
                                </div>
                            </div>


                            {/* --- SECTION 5: CHECKLIST / SUB TASKS --- */}
                            <div className="space-y-3">
                                <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                                    <CheckSquare size={12} /> Checklist / Sub Tasks
                                </label>
                                <div className="space-y-2">
                                    <AnimatePresence>
                                        {checklistItems.map((item, index) => (
                                            <motion.div
                                                key={index}
                                                initial={{ opacity: 0, y: -8 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, x: -10 }}
                                                className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800 group"
                                            >
                                                <div className="w-4 h-4 rounded border-2 border-slate-300 dark:border-slate-600 flex-shrink-0" />
                                                <span className="flex-1 text-sm text-slate-700 dark:text-slate-300">{item.title}</span>
                                                <button
                                                    type="button"
                                                    onClick={() => removeChecklistItem(index)}
                                                    className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 transition-all"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </motion.div>
                                        ))}
                                    </AnimatePresence>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            className="saas-input flex-1"
                                            placeholder="Add checklist item..."
                                            value={newChecklistItem}
                                            onChange={e => setNewChecklistItem(e.target.value)}
                                            onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addChecklistItem())}
                                        />
                                        <button
                                            type="button"
                                            onClick={addChecklistItem}
                                            className="px-4 py-2 bg-slate-900 dark:bg-slate-700 text-white rounded-xl text-xs font-black flex items-center gap-1 hover:bg-primary-600 transition-colors"
                                        >
                                            <Plus size={14} /> Add
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* --- SECTION 6: ATTACHMENT URL --- */}
                            <div className="space-y-2">
                                <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                                    <Paperclip size={12} /> Resource Link / Attachment URL
                                </label>
                                <input
                                    type="text"
                                    className="saas-input"
                                    placeholder="https://example.com/brief.pdf"
                                    value={formData.attachmentUrl}
                                    onChange={e => setFormData({ ...formData, attachmentUrl: e.target.value })}
                                />
                            </div>

                            {/* --- SECTION 7: ADVANCED SETTINGS (Review, Weight, Visibility) --- */}
                            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 space-y-5">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Advanced Settings</p>

                                <div className="grid md:grid-cols-3 gap-4">
                                    <SelectField
                                        label="Review Type"
                                        icon={BarChart2}
                                        value={formData.reviewType}
                                        onChange={e => setFormData({ ...formData, reviewType: e.target.value })}
                                        options={["Mentor Review", "Admin Review", "Auto Completion"]}
                                    />
                                    <SelectField
                                        label="Visibility"
                                        icon={Eye}
                                        value={formData.visibility}
                                        onChange={e => setFormData({ ...formData, visibility: e.target.value })}
                                        options={[
                                            { value: "Private", label: "🔒 Private" },
                                            { value: "Team Visible", label: "👥 Team Visible" },
                                            { value: "Public", label: "🌐 Public" },
                                        ]}
                                    />
                                    <div className="space-y-2">
                                        <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                                            <Zap size={12} /> Productivity Weight
                                        </label>
                                        <div className="space-y-1">
                                            <input
                                                type="range"
                                                min="1"
                                                max="10"
                                                value={formData.productivityWeight}
                                                onChange={e => setFormData({ ...formData, productivityWeight: parseInt(e.target.value) })}
                                                className="w-full accent-primary-500 cursor-pointer"
                                            />
                                            <div className="flex justify-between text-[10px] text-slate-400 font-black">
                                                <span>Low (1)</span>
                                                <span className="text-primary-500 font-black text-xs">{formData.productivityWeight}</span>
                                                <span>Critical (10)</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* --- REPEAT / RECURRENCE --- */}
                                <SelectField
                                    label="Repeat / Recurrence"
                                    icon={RefreshCw}
                                    value={formData.recurrence}
                                    onChange={e => setFormData({ ...formData, recurrence: e.target.value })}
                                    options={[
                                        { value: "none", label: "🚫 No Repeat" },
                                        { value: "daily", label: "📅 Daily" },
                                        { value: "weekly", label: "🗓️ Weekly" },
                                        { value: "monthly", label: "📆 Monthly" },
                                    ]}
                                />

                                {/* --- CLONABLE & DELEGATABLE TOGGLES --- */}
                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setFormData(prev => ({ ...prev, clonable: !prev.clonable }))}
                                        className={cn(
                                            "flex items-center gap-3 p-3 rounded-xl border transition-all text-left",
                                            formData.clonable
                                                ? "bg-indigo-50 dark:bg-indigo-900/20 border-indigo-300 dark:border-indigo-700 text-indigo-700 dark:text-indigo-300"
                                                : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-500"
                                        )}
                                    >
                                        {formData.clonable ? <ToggleRight size={18} className="text-indigo-500" /> : <ToggleLeft size={18} />}
                                        <div>
                                            <p className="text-xs font-black uppercase tracking-widest flex items-center gap-1">
                                                <Copy size={11} /> Clonable
                                            </p>
                                            <p className="text-[10px] text-slate-400 mt-0.5">Can be duplicated</p>
                                        </div>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setFormData(prev => ({ ...prev, delegatable: !prev.delegatable }))}
                                        className={cn(
                                            "flex items-center gap-3 p-3 rounded-xl border transition-all text-left",
                                            formData.delegatable
                                                ? "bg-orange-50 dark:bg-orange-900/20 border-orange-300 dark:border-orange-700 text-orange-700 dark:text-orange-300"
                                                : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-500"
                                        )}
                                    >
                                        {formData.delegatable ? <ToggleRight size={18} className="text-orange-500" /> : <ToggleLeft size={18} />}
                                        <div>
                                            <p className="text-xs font-black uppercase tracking-widest flex items-center gap-1">
                                                <Share2 size={11} /> Delegatable
                                            </p>
                                            <p className="text-[10px] text-slate-400 mt-0.5">Can re-assign to others</p>
                                        </div>
                                    </button>
                                </div>
                            </div>

                            {/* --- TAGS --- */}
                            <div className="space-y-2">
                                <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                                    <Hash size={12} /> Tags
                                </label>
                                <div className="flex flex-wrap gap-2 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 min-h-[48px]">
                                    <AnimatePresence>
                                        {formData.tags.map(tag => (
                                            <motion.span
                                                key={tag}
                                                initial={{ opacity: 0, scale: 0.8 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                exit={{ opacity: 0, scale: 0.8 }}
                                                className="flex items-center gap-1 px-3 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-full text-xs font-bold"
                                            >
                                                #{tag}
                                                <button type="button" onClick={() => removeTag(tag)} className="ml-1 hover:text-red-500 transition-colors">
                                                    <X size={10} />
                                                </button>
                                            </motion.span>
                                        ))}
                                    </AnimatePresence>
                                </div>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        className="saas-input flex-1"
                                        placeholder="Type a tag and press Enter (e.g. frontend)"
                                        value={newTag}
                                        onChange={e => setNewTag(e.target.value)}
                                        onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addTag())}
                                    />
                                    <button
                                        type="button"
                                        onClick={addTag}
                                        className="px-4 py-2 bg-slate-900 dark:bg-slate-700 text-white rounded-xl text-xs font-black flex items-center gap-1 hover:bg-primary-600 transition-colors"
                                    >
                                        <Plus size={14} /> Add
                                    </button>
                                </div>
                            </div>

                            {/* --- SELECT ASSIGNEES + SEND MODE --- */}
                            {formData.targetType === 'Individual' && (
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                                            <UserPlus size={12} /> Select Assignees
                                        </label>
                                    </div>
                                    <p className="text-[10px] text-slate-400 ml-1">
                                        Each selected person receives their own separate task copy.
                                    </p>
                                    <div className="flex flex-wrap gap-2 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 max-h-[180px] overflow-y-auto custom-scrollbar">
                                        {loading ? (
                                            [1,2,3].map(i => <div key={i} className="h-9 w-28 bg-slate-200 dark:bg-slate-700 animate-pulse rounded-xl" />)
                                        ) : recipients.length > 0 ? (
                                            recipients.map(recipient => (
                                                <button
                                                    key={recipient.id || recipient._id}
                                                    type="button"
                                                    onClick={() => toggleRecipient(recipient.id || recipient._id)}
                                                    className={cn(
                                                        "flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all border",
                                                        selectedRecipientIds.includes(recipient.id || recipient._id)
                                                            ? "bg-blue-500 text-white border-blue-500 shadow-md shadow-blue-500/20"
                                                            : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-blue-400"
                                                    )}
                                                >
                                                    <div className="w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden flex items-center justify-center flex-shrink-0">
                                                        {recipient.avatar
                                                            ? <img src={recipient.avatar} alt="" className="w-full h-full object-cover" />
                                                            : <UserIcon size={12} />}
                                                    </div>
                                                    {recipient.name}
                                                </button>
                                            ))
                                        ) : (
                                            <p className="text-slate-400 text-xs italic">
                                                No {isAdmin ? 'mentors' : 'students'} found.
                                            </p>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* --- SUBMIT --- */}
                            <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                                <div className="flex items-center gap-2 flex-wrap">
                                    {selectedRecipientIds.length > 0 && (
                                        <div className="flex items-center gap-2 px-3 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-full text-[10px] font-black uppercase border border-blue-100 dark:border-blue-800">
                                            {selectedRecipientIds.length} {isAdmin ? 'Mentors' : 'Students'} Selected
                                        </div>
                                    )}
                                    {checklistItems.length > 0 && (
                                        <div className="flex items-center gap-2 px-3 py-1 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-full text-[10px] font-black uppercase border border-green-100 dark:border-green-800">
                                            {checklistItems.length} Subtasks
                                        </div>
                                    )}
                                </div>
                                <Button
                                    type="submit"
                                    disabled={isSubmitting || (formData.targetType === 'Individual' && selectedRecipientIds.length === 0)}
                                    className="px-8 py-4 flex items-center gap-3"
                                >
                                    {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
                                    <span>Deploy Task</span>
                                </Button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AssignTask;
