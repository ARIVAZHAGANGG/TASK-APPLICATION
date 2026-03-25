import React, { useState, useEffect } from 'react';
import { Mic, MicOff, Loader2, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../services/api';
import { toast } from 'sonner';

const VoiceTaskTrigger = ({ onTaskCreated }) => {
    const [isListening, setIsListening] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [recognition, setRecognition] = useState(null);

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
                handleVoiceCommand(transcript);
            };

            recog.onerror = (event) => {
                console.error("Speech recognition error", event.error);
                setIsListening(false);
                toast.error("Voice recognition failed. Try again.");
            };

            setRecognition(recog);
        }
    }, []);

    const handleVoiceCommand = async (transcript) => {
        setIsProcessing(true);
        try {
            const res = await api.post('/tasks/ai/voice', { transcript });
            if (res.data.success) {
                toast.success(res.data.message || "Task created!", {
                    icon: <Sparkles className="text-amber-500" size={16} />
                });
                if (onTaskCreated) onTaskCreated(res.data.data);
                // Refresh tasks list if global event is used
                window.dispatchEvent(new CustomEvent('refresh-tasks'));
            }
        } catch (err) {
            toast.error("Failed to parse voice command");
        } finally {
            setIsProcessing(false);
        }
    };

    const toggleListening = () => {
        if (!recognition) {
            toast.error("Speech recognition is not supported in this browser.");
            return;
        }

        if (isListening) {
            recognition.stop();
        } else {
            recognition.start();
        }
    };

    return (
        <div className="fixed bottom-8 right-8 z-50">
            <AnimatePresence>
                {isListening && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.8, y: 20 }}
                        className="absolute bottom-20 right-0 bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-2xl border border-blue-100 dark:border-slate-700 w-64"
                    >
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <div className="w-3 h-3 bg-red-500 rounded-full animate-ping absolute inset-0" />
                                <div className="w-3 h-3 bg-red-500 rounded-full relative" />
                            </div>
                            <p className="text-sm font-bold text-slate-700 dark:text-slate-200 uppercase tracking-tighter">Listening...</p>
                        </div>
                        <p className="text-xs text-slate-500 mt-2 font-medium italic">"Create a meeting for tomorrow at 10am"</p>
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={toggleListening}
                disabled={isProcessing}
                className={`w-16 h-16 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 ${isListening
                        ? 'bg-red-500 text-white animate-pulse'
                        : 'saas-gradient text-white hover:shadow-blue-500/40'
                    }`}
            >
                {isProcessing ? (
                    <Loader2 className="animate-spin" size={28} />
                ) : isListening ? (
                    <MicOff size={28} strokeWidth={2.5} />
                ) : (
                    <Mic size={28} strokeWidth={2.5} />
                )}
            </motion.button>
        </div>
    );
};

export default VoiceTaskTrigger;
