import { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, Coffee, Flame } from 'lucide-react';
import api from '../services/api';
import { toast } from 'sonner';

const Pomodoro = ({ taskId = null }) => {
    const [isActive, setIsActive] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [time, setTime] = useState(1500); // 25 minutes in seconds
    const [mode, setMode] = useState('focus'); // 'focus', 'short_break', 'long_break'
    const [sessionId, setSessionId] = useState(null);
    const [todayStats, setTodayStats] = useState({ todaySessions: 0, todayMinutes: 0 });

    const TIME_PRESETS = {
        focus: 1500,        // 25 min
        short_break: 300,   // 5 min
        long_break: 900     // 15 min
    };

    useEffect(() => {
        fetchTodayStats();
    }, []);

    useEffect(() => {
        let interval = null;

        if (isActive && !isPaused) {
            interval = setInterval(() => {
                setTime((prevTime) => {
                    if (prevTime <= 0) {
                        handleSessionComplete();
                        return 0;
                    }
                    return prevTime - 1;
                });
            }, 1000);
        } else {
            clearInterval(interval);
        }

        return () => clearInterval(interval);
    }, [isActive, isPaused]);

    const fetchTodayStats = async () => {
        try {
            const res = await api.get('/tasks/pomodoro/stats');
            setTodayStats(res.data);
        } catch (error) {
            console.error('Error fetching pomodoro stats:', error);
        }
    };

    const startSession = async () => {
        try {
            const res = await api.post('/tasks/pomodoro/start', {
                taskId,
                duration: TIME_PRESETS[mode]
            });
            setSessionId(res.data.id);
            setIsActive(true);
            setIsPaused(false);
            toast.success('Pomodoro session started! 🍅');
        } catch (error) {
            toast.error('Failed to start session');
        }
    };

    const handleSessionComplete = async () => {
        setIsActive(false);

        if (sessionId) {
            try {
                await api.post(`/tasks/pomodoro/${sessionId}/complete`);
                toast.success(mode === 'focus' ? '🎉 Focus session complete!' : '✅ Break complete!');

                // Auto-switch mode
                if (mode === 'focus') {
                    const sessionsToday = todayStats.todaySessions + 1;
                    const isLongBreak = sessionsToday % 4 === 0;
                    setMode(isLongBreak ? 'long_break' : 'short_break');
                } else {
                    setMode('focus');
                }

                fetchTodayStats();
            } catch (error) {
                console.error('Error completing session:', error);
            }
        }

        setSessionId(null);
        setTime(TIME_PRESETS[mode === 'focus' ? 'short_break' : 'focus']);
    };

    const togglePause = () => {
        setIsPaused(!isPaused);
    };

    const resetTimer = () => {
        setIsActive(false);
        setIsPaused(false);
        setTime(TIME_PRESETS[mode]);
        setSessionId(null);
    };

    const switchMode = (newMode) => {
        if (!isActive) {
            setMode(newMode);
            setTime(TIME_PRESETS[newMode]);
        }
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const progressPercentage = ((TIME_PRESETS[mode] - time) / TIME_PRESETS[mode]) * 100;

    return (
        <div className="bg-gradient-to-br from-primary-50 to-blue-50 dark:from-gray-800 dark:to-gray-900 p-8 rounded-3xl shadow-xl">
            <div className="max-w-md mx-auto">
                {/* Header */}
                <div className="text-center mb-6">
                    <div className="flex items-center justify-center gap-2 mb-2">
                        <Flame className="text-orange-500" size={24} />
                        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                            Pomodoro Focus
                        </h2>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        {todayStats.todaySessions} sessions completed today • {todayStats.todayMinutes} min
                    </p>
                </div>

                {/* Mode Selector */}
                <div className="flex gap-2 mb-6">
                    <button
                        onClick={() => switchMode('focus')}
                        disabled={isActive}
                        className={`flex-1 py-2 px-4 rounded-xl font-semibold transition-all ${mode === 'focus'
                                ? 'bg-primary-600 text-white shadow-lg'
                                : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                            } ${isActive ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'}`}
                    >
                        Focus
                    </button>
                    <button
                        onClick={() => switchMode('short_break')}
                        disabled={isActive}
                        className={`flex-1 py-2 px-4 rounded-xl font-semibold transition-all ${mode === 'short_break'
                                ? 'bg-green-600 text-white shadow-lg'
                                : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                            } ${isActive ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'}`}
                    >
                        Short Break
                    </button>
                    <button
                        onClick={() => switchMode('long_break')}
                        disabled={isActive}
                        className={`flex-1 py-2 px-4 rounded-xl font-semibold transition-all ${mode === 'long_break'
                                ? 'bg-blue-600 text-white shadow-lg'
                                : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                            } ${isActive ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'}`}
                    >
                        Long Break
                    </button>
                </div>

                {/* Timer Display */}
                <div className="relative mb-8">
                    <svg className="w-full h-64" viewBox="0 0 200 200">
                        {/* Background Circle */}
                        <circle
                            cx="100"
                            cy="100"
                            r="80"
                            fill="none"
                            stroke="rgba(0,0,0,0.1)"
                            strokeWidth="8"
                        />
                        {/* Progress Circle */}
                        <circle
                            cx="100"
                            cy="100"
                            r="80"
                            fill="none"
                            stroke={mode === 'focus' ? '#6366f1' : mode === 'short_break' ? '#10b981' : '#3b82f6'}
                            strokeWidth="8"
                            strokeDasharray={`${2 * Math.PI * 80}`}
                            strokeDashoffset={`${2 * Math.PI * 80 * (1 - progressPercentage / 100)}`}
                            transform="rotate(-90 100 100)"
                            className="transition-all duration-1000"
                        />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center">
                            <div className="text-6xl font-bold text-gray-800 dark:text-white mb-2">
                                {formatTime(time)}
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                                {mode.replace('_', ' ')}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Controls */}
                <div className="flex gap-4 justify-center">
                    {!isActive ? (
                        <button
                            onClick={startSession}
                            className="flex items-center gap-2 px-8 py-4 bg-primary-600 hover:bg-primary-700 text-white rounded-2xl font-bold shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
                        >
                            <Play size={20} fill="white" />
                            Start
                        </button>
                    ) : (
                        <>
                            <button
                                onClick={togglePause}
                                className="flex items-center gap-2 px-6 py-4 bg-yellow-500 hover:bg-yellow-600 text-white rounded-2xl font-bold shadow-lg transition-all"
                            >
                                <Pause size={20} fill="white" />
                                {isPaused ? 'Resume' : 'Pause'}
                            </button>
                            <button
                                onClick={resetTimer}
                                className="flex items-center gap-2 px-6 py-4 bg-gray-500 hover:bg-gray-600 text-white rounded-2xl font-bold shadow-lg transition-all"
                            >
                                <RotateCcw size={20} />
                                Reset
                            </button>
                        </>
                    )}
                </div>

                {/* Tips */}
                {!isActive && (
                    <div className="mt-6 p-4 bg-white dark:bg-gray-800 rounded-xl">
                        <div className="flex items-start gap-3">
                            <Coffee className="text-primary-600 mt-1" size={20} />
                            <div>
                                <h4 className="font-semibold text-gray-800 dark:text-white mb-1">
                                    Pro Tips:
                                </h4>
                                <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                                    <li>• Eliminate all distractions before starting</li>
                                    <li>• Take breaks seriously - rest is productive</li>
                                    <li>• After 4 focus sessions, take a long break</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Pomodoro;
