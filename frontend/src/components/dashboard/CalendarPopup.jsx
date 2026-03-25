import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { 
  format, 
  addMonths, 
  subMonths, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  isSameMonth, 
  isSameDay, 
  addDays, 
  isToday 
} from 'date-fns';

const CalendarPopup = ({ isOpen, onClose }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const popupRef = useRef(null);

  // Handle click outside to close
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isOpen && popupRef.current && !popupRef.current.contains(event.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  // Handle scroll wheel to change month
  const handleWheel = (e) => {
    if (e.deltaY < 0) {
      setCurrentMonth(subMonths(currentMonth, 1));
    } else {
      setCurrentMonth(addMonths(currentMonth, 1));
    }
  };

  const renderHeader = () => {
    return (
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-white/10 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md cursor-grab active:cursor-grabbing">
        <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-500/20 transform -rotate-3 group-hover:rotate-0 transition-transform">
                <CalendarIcon size={20} />
            </div>
            <div>
                <h2 className="text-xl font-black text-slate-800 dark:text-white leading-none tracking-tight">
                    {format(currentMonth, 'MMMM')}
                </h2>
                <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest mt-1">
                    {format(currentMonth, 'yyyy')}
                </p>
            </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex bg-slate-100 dark:bg-white/5 p-1 rounded-xl border border-slate-200 dark:border-white/5 mx-1">
            <button 
                onClick={(e) => { e.stopPropagation(); setCurrentMonth(subMonths(currentMonth, 1)); }}
                className="p-1.5 hover:bg-white dark:hover:bg-slate-800 rounded-lg transition-all text-slate-600 dark:text-slate-300 hover:shadow-sm"
            >
                <ChevronLeft size={16} />
            </button>
            <button 
                onClick={(e) => { e.stopPropagation(); setCurrentMonth(addMonths(currentMonth, 1)); }}
                className="p-1.5 hover:bg-white dark:hover:bg-slate-800 rounded-lg transition-all text-slate-600 dark:text-slate-300 hover:shadow-sm"
            >
                <ChevronRight size={16} />
            </button>
          </div>
          <button 
            onClick={(e) => { e.stopPropagation(); onClose(); }}
            className="w-8 h-8 flex items-center justify-center bg-rose-50 dark:bg-rose-500/10 text-rose-500 rounded-full hover:bg-rose-500 hover:text-white transition-all shadow-sm"
          >
            <X size={16} />
          </button>
        </div>
      </div>
    );
  };

  const renderDays = () => {
    const days = [];
    const dateNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    for (let i = 0; i < 7; i++) {
      days.push(
        <div key={i} className="text-center text-[10px] font-black uppercase text-slate-400 tracking-widest py-3 border-b border-slate-50 dark:border-white/5 bg-slate-50/30 dark:bg-white/5">
          {dateNames[i]}
        </div>
      );
    }

    return <div className="grid grid-cols-7">{days}</div>;
  };

  const renderCells = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const rows = [];
    let days = [];
    let day = startDate;
    let formattedDate = "";

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        formattedDate = format(day, "d");
        const isCurrentMonth = isSameMonth(day, monthStart);
        const isActiveDay = isToday(day);
        
        days.push(
          <div
            key={day.toString()}
            className={`relative h-12 flex flex-col items-center justify-center transition-all duration-300 border-r border-b border-slate-50 dark:border-white/5 group/day
              ${!isCurrentMonth ? "bg-slate-50/50 dark:bg-black/20 text-slate-300 dark:text-slate-700" : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200"}
              ${isActiveDay ? "bg-indigo-50/50 dark:bg-indigo-500/5 text-indigo-600 dark:text-indigo-400" : "hover:bg-indigo-50/30 dark:hover:bg-white/[0.02]"}
            `}
          >
            {isActiveDay && (
                <div className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-indigo-500 shadow-[0_0_5px_rgba(79,70,229,0.8)]" />
            )}
            <span className={`relative z-10 text-sm font-black tracking-tighter ${isActiveDay ? 'scale-110' : 'group-hover/day:scale-110'} transition-transform`}>
                {formattedDate}
            </span>
          </div>
        );
        day = addDays(day, 1);
      }
      rows.push(
        <div className="grid grid-cols-7" key={day.toString()}>
          {days}
        </div>
      );
      days = [];
    }
    return <div className="bg-slate-50/20 dark:bg-black/10">{rows}</div>;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-transparent z-[150]"
          />
          <motion.div
            ref={popupRef}
            drag
            dragMomentum={false}
            onWheel={handleWheel}
            initial={{ opacity: 0, scale: 0.95, x: "70%", y: "20%" }}
            animate={{ opacity: 1, scale: 1, x: "70%", y: "20%" }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed z-[160] w-full max-w-[340px] bg-white dark:bg-slate-900 rounded-[2rem] shadow-[0_48px_100px_-20px_rgba(0,0,0,0.5)] overflow-hidden border border-white/20 dark:border-indigo-500/20 flex flex-col"
            style={{ 
                maxHeight: 'calc(100vh - 40px)',
                right: '40px',
                top: '100px',
                transform: 'none'
            }}
          >
            {renderHeader()}
            
            <div className="flex-1 overflow-y-auto custom-scrollbar-hide">
                <div className="bg-white dark:bg-slate-900">
                    {renderDays()}
                    {renderCells()}
                </div>
            </div>
            
            {/* Compact Static Footer */}
            <div className="px-6 py-3 border-t border-slate-100 dark:border-white/5 flex items-center justify-between bg-slate-50/50 dark:bg-white/[0.02]">
                <div className="flex flex-col">
                    <span className="text-[8px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-widest whitespace-nowrap">MISSION DATE</span>
                    <span className="text-[10px] font-black text-slate-700 dark:text-white uppercase tracking-tight">{format(new Date(), 'MMM do, yyyy')}</span>
                </div>
                <button 
                    onClick={(e) => { e.stopPropagation(); setCurrentMonth(new Date()); }}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-[9px] font-black uppercase tracking-widest transition-all duration-300 shadow-lg shadow-indigo-600/20 active:scale-95"
                >
                    RESET
                </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CalendarPopup;
