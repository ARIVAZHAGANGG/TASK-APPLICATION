import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Delete, CornerDownLeft, Space, ArrowUp, X, GripHorizontal, Keyboard as KeyboardIcon } from "lucide-react";
import { cn } from "../../utils/cn";

const KEYBOARD_LAYOUT = [
    ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0", "-", "=", "BACKSPACE"],
    ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p", "[", "]", "\\"],
    ["a", "s", "d", "f", "g", "h", "j", "k", "l", ";", "'", "ENTER"],
    ["SHIFT", "z", "x", "c", "v", "b", "n", "m", ",", ".", "/", "SHIFT"],
    ["CLOSE", "SPACE"]
];

const HolographicKeyboard = ({ isOpen, onClose }) => {
    const [isShift, setIsShift] = useState(false);
    const [lastPosition, setLastPosition] = useState({ x: 0, y: 0 });

    const handleKeyClick = (key) => {
        const activeElement = document.activeElement;
        const isInput = activeElement.tagName === "INPUT" || activeElement.tagName === "TEXTAREA";

        if (key === "SHIFT") {
            setIsShift(!isShift);
            return;
        }

        if (key === "CLOSE") {
            onClose();
            return;
        }

        if (!isInput) return;

        const start = activeElement.selectionStart;
        const end = activeElement.selectionEnd;
        const value = activeElement.value;

        let char = key;
        if (key === "SPACE") char = " ";
        if (key === "BACKSPACE") {
            if (start === end) {
                activeElement.value = value.substring(0, start - 1) + value.substring(end);
                activeElement.setSelectionRange(start - 1, start - 1);
            } else {
                activeElement.value = value.substring(0, start) + value.substring(end);
                activeElement.setSelectionRange(start, start);
            }
        } else if (key === "ENTER") {
            if (activeElement.tagName === "TEXTAREA") {
                char = "\n";
            } else {
                const form = activeElement.closest("form");
                if (form) form.requestSubmit();
                return;
            }
        } else {
            char = isShift ? key.toUpperCase() : key.toLowerCase();
            activeElement.value = value.substring(0, start) + char + value.substring(end);
            activeElement.setSelectionRange(start + 1, start + 1);
            if (isShift) setIsShift(false);
        }

        // Trigger input event to notify React/Angular state
        activeElement.dispatchEvent(new Event("input", { bubbles: true }));
        activeElement.focus();
    };

    const renderKey = (key, index) => {
        let content = isShift ? key.toUpperCase() : key.toLowerCase();
        let width = "w-10 sm:w-12 h-10 sm:h-12";
        let color = "bg-white/10 dark:bg-white/5";

        if (key === "BACKSPACE") {
            content = <Delete size={18} />;
            width = "w-20 sm:w-24";
            color = "bg-red-500/10 text-red-500 hover:bg-red-500/20";
        } else if (key === "ENTER") {
            content = <CornerDownLeft size={18} />;
            width = "w-20 sm:w-24";
            color = "bg-blue-600 text-white hover:bg-blue-700";
        } else if (key === "SHIFT") {
            content = <ArrowUp size={18} className={cn(isShift && "text-blue-500 animate-pulse")} />;
            width = "w-14 sm:w-16";
            color = isShift ? "bg-blue-500/20 text-blue-500" : "bg-white/10 dark:bg-white/5";
        } else if (key === "SPACE") {
            content = <Space size={18} />;
            width = "flex-1 min-w-[200px]";
            color = "bg-white/10 dark:bg-white/5";
        } else if (key === "CLOSE") {
            content = <X size={18} />;
            width = "w-14 sm:w-16";
            color = "bg-red-500/10 text-red-500 hover:bg-red-500/20";
        }

        return (
            <motion.button
                key={index}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleKeyClick(key)}
                className={cn(
                    "flex items-center justify-center rounded-xl border border-white/20 dark:border-white/10 backdrop-blur-md transition-all font-black text-xs sm:text-sm uppercase tracking-tight shadow-lg",
                    width,
                    color
                )}
            >
                {content}
            </motion.button>
        );
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0, y: 100, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 100, scale: 0.9 }}
                    drag
                    dragMomentum={false}
                    className="fixed bottom-10 right-10 z-[100] cursor-default bg-white/70 dark:bg-slate-900/60 backdrop-blur-2xl border border-white/50 dark:border-slate-800/60 rounded-[40px] p-6 shadow-[0_32px_64px_-12px_rgba(0,0,0,0.5)] flex flex-col gap-4 select-none touch-none"
                    style={{ 
                        filter: "drop-shadow(0 0 20px rgba(59, 130, 246, 0.2))",
                        maxWidth: "calc(100vw - 80px)"
                    }}
                >
                    {/* Drag Handle */}
                    <div className="flex items-center justify-between px-2 mb-2">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-lg">
                                <KeyboardIcon size={20} />
                            </div>
                            <div>
                                <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest leading-none">V-Keyboard</h3>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mt-1">Holographic Input</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 drag-handle p-2 text-slate-400 cursor-move hover:text-slate-600 transition-colors">
                            <GripHorizontal size={24} />
                        </div>
                    </div>

                    {/* Keys Grid */}
                    <div className="flex flex-col gap-2">
                        {KEYBOARD_LAYOUT.map((row, rIdx) => (
                            <div key={rIdx} className="flex gap-2 justify-center">
                                {row.map((key, kIdx) => renderKey(key, `${rIdx}-${kIdx}`))}
                            </div>
                        ))}
                    </div>

                    {/* Bottom Indicator */}
                    <div className="mt-2 flex justify-center">
                        <div className="w-16 h-1.5 bg-slate-300 dark:bg-slate-700/50 rounded-full opacity-50" />
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default HolographicKeyboard;
