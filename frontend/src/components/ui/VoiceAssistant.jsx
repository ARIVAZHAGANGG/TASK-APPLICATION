import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Loader2, Sparkles, X, Wand2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../services/api';
import { toast } from 'sonner';
import { cn } from '../../utils/cn';

const VoiceAssistant = () => {
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [showPanel, setShowPanel] = useState(false);
    const recognitionRef = useRef(null);
    const isStartedRef = useRef(false);

    useEffect(() => {
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            console.error("Speech recognition not supported in this browser");
            return;
        }

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recog = new SpeechRecognition();
        recog.continuous = false;
        recog.interimResults = true;
        recog.lang = 'en-US';

        recog.onstart = () => {
            setIsListening(true);
            setShowPanel(true);
            isStartedRef.current = true;
        };

        recog.onresult = (event) => {
            const current = event.resultIndex;
            const resultTranscript = event.results[current][0].transcript;
            setTranscript(resultTranscript);
        };

        recog.onend = () => {
            setIsListening(false);
            isStartedRef.current = false;
        };

        recog.onerror = (event) => {
            const error = event.error;
            console.error("Speech recognition error:", error);
            setIsListening(false);
            isStartedRef.current = false;
            
            if (error !== 'aborted' && error !== 'no-speech') {
                toast.error("Voice recognition failed. Try again.");
            }
        };

        recognitionRef.current = recog;

        return () => {
            if (isStartedRef.current) {
                recog.stop();
            }
        };
    }, []);

    // Effect to handle transcript processing after it ends
    useEffect(() => {
        if (!isListening && transcript && showPanel && !isProcessing) {
            processTranscript(transcript);
        }
    }, [isListening, transcript, showPanel, isProcessing]);

    const startListening = () => {
        if (isStartedRef.current) return;
        setTranscript('');
        try {
            recognitionRef.current?.start();
        } catch (e) {
            console.error("Failed to start recognition:", e);
        }
    };

    const stopListening = () => {
        if (!isStartedRef.current) return;
        try {
            recognitionRef.current?.stop();
        } catch (e) {
            console.error("Failed to stop recognition:", e);
        }
    };

    const speak = (text) => {
        if (!('speechSynthesis' in window)) return;
        
        // Cancel any ongoing speech
        window.speechSynthesis.cancel();
        
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 1.1;
        utterance.pitch = 1;
        utterance.lang = 'en-US';
        
        // Find a premium-sounding voice if available
        const voices = window.speechSynthesis.getVoices();
        const preferredVoice = voices.find(v => v.name.includes('Google') || v.name.includes('Premium')) || voices[0];
        if (preferredVoice) utterance.voice = preferredVoice;
        
        window.speechSynthesis.speak(utterance);
    };

    const processTranscript = async (text) => {
        setIsProcessing(true);
        try {
            // 1. Ask AI to parse transcript
            const res = await api.post('/ai/voice-command', { transcript: text });
            const { task: taskData, speechResponse } = res.data;

            if (speechResponse) {
                speak(speechResponse);
                setTranscript(speechResponse);
            }

            if (taskData && taskData.title) {
                // Check if we are on an Assign Task page or similar where we want to fill instead of create
                const isAssignPage = window.location.pathname.includes('assign-task');
                
                if (isAssignPage) {
                    toast.info("Transferring data to form...", { icon: <Wand2 className="text-blue-500" /> });
                    // Dispatch event for the page to listen to
                    window.dispatchEvent(new CustomEvent("voice-data-fill", { detail: taskData }));
                } else {
                    // 2. Automatically create task
                    await api.post('/tasks', taskData);
                    toast.success(`Mission Launched: ${taskData.title}`, {
                        description: `Priority: ${taskData.priority} | Category: ${taskData.category}`,
                        icon: <Sparkles className="text-amber-500" />
                    });
                    // Refresh views
                    window.dispatchEvent(new CustomEvent("refresh-tasks"));
                }
                
                // Close panel after success
                if (!speechResponse) {
                    setTimeout(() => {
                        setShowPanel(false);
                        setTranscript('');
                    }, 2000);
                }
            } else if (speechResponse) {
                // Just a conversational response
                toast.info("Command processed", { icon: <Sparkles className="text-blue-500" /> });
            }
        } catch (error) {
            console.error("Process Transcript Error:", error);
            const errorMsg = "AI couldn't interpret that command. Please try again.";
            speak(errorMsg);
            toast.error(errorMsg);
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <>
            <div className="fixed bottom-8 right-8 z-[100] flex flex-col items-end gap-4">
                <AnimatePresence>
                    {showPanel && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="bg-slate-900/90 backdrop-blur-xl border border-white/10 p-6 rounded-[2rem] shadow-2xl w-80 mb-2 overflow-hidden relative"
                        >
                            <div className="absolute top-0 right-0 p-8 bg-primary-500/10 rounded-full -mr-10 -mt-10 blur-2xl" />
                            
                            <div className="flex items-center justify-between mb-4 relative z-10">
                                <div className="flex items-center gap-2">
                                    <div className={cn(
                                        "w-2 h-2 rounded-full",
                                        isListening ? "bg-rose-500 animate-pulse" : "bg-slate-500"
                                    )} />
                                    <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">
                                        {isListening ? "Listening..." : isProcessing ? "AI Interpreting..." : "Command Recognized"}
                                    </span>
                                </div>
                                <button onClick={() => setShowPanel(false)} className="text-slate-500 hover:text-white transition-colors">
                                    <X size={16} />
                                </button>
                            </div>

                            <div className="min-h-[60px] flex items-center justify-center text-center px-2">
                                {isProcessing ? (
                                    <div className="flex flex-col items-center gap-3">
                                        <Loader2 className="text-primary-400 animate-spin" size={24} />
                                        <p className="text-slate-500 text-xs font-bold italic">Extracting mission data...</p>
                                    </div>
                                ) : (
                                    <p className={cn(
                                        "text-lg font-bold leading-tight",
                                        transcript ? "text-white" : "text-slate-600 italic"
                                    )}>
                                        {transcript || "Speak now..."}
                                    </p>
                                )}
                            </div>

                            {!isListening && !isProcessing && transcript && (
                                <motion.div 
                                    initial={{ opacity: 0 }} 
                                    animate={{ opacity: 1 }}
                                    className="mt-6 pt-4 border-t border-white/5 flex items-center gap-2 text-primary-400"
                                >
                                    <Wand2 size={14} />
                                    <span className="text-[10px] font-black uppercase tracking-widest">Auto-scheduling Mission</span>
                                </motion.div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>

                <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={isListening ? stopListening : startListening}
                    className={cn(
                        "w-16 h-16 rounded-full flex items-center justify-center shadow-2xl transition-all duration-500 relative group",
                        isListening 
                            ? "bg-rose-600 text-white ring-8 ring-rose-600/20" 
                            : "bg-slate-900 border border-white/10 text-primary-400 hover:bg-slate-800"
                    )}
                >
                    {isListening && (
                        <span className="absolute inset-0 rounded-full bg-rose-600 animate-ping opacity-25" />
                    )}
                    {isListening ? <MicOff size={24} /> : <Mic size={24} />}
                    
                    {!isListening && !showPanel && (
                        <div className="absolute right-full mr-4 bg-slate-900 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none border border-white/10">
                            AI Voice Support
                        </div>
                    )}
                </motion.button>
            </div>
        </>
    );
};

export default VoiceAssistant;
