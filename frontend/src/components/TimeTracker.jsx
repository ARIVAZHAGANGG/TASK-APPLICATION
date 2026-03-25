import { useState, useEffect } from 'react';
import { Play, Square, Clock, TrendingUp } from 'lucide-react';
import api from '../services/api';
import { toast } from 'sonner';

const TimeTracker = ({ taskId, taskTitle }) => {
    const [isTracking, setIsTracking] = useState(false);
    const [elapsedTime, setElapsedTime] = useState(0);
    const [timeLogs, setTimeLogs] = useState([]);

    useEffect(() => {
        checkActiveTimer();
        fetchTimeLogs();
    }, [taskId]);

    useEffect(() => {
        let interval = null;

        if (isTracking) {
            interval = setInterval(() => {
                setElapsedTime(prev => prev + 1);
            }, 1000);
        }

        return () => clearInterval(interval);
    }, [isTracking]);

    const checkActiveTimer = async () => {
        try {
            const res = await api.get('/tasks/timelogs');
            const activeLog = res.data.timeLogs.find(log =>
                log.taskId.id === taskId && !log.endTime
            );

            if (activeLog) {
                setIsTracking(true);
                const startTime = new Date(activeLog.startTime);
                const now = new Date();
                setElapsedTime(Math.floor((now - startTime) / 1000));
            }
        } catch (error) {
            console.error('Error checking active timer:', error);
        }
    };

    const fetchTimeLogs = async () => {
        try {
            const res = await api.get(`/tasks/timelogs?taskId=${taskId}`);
            setTimeLogs(res.data.timeLogs.filter(log => log.endTime)); // Only completed logs
        } catch (error) {
            console.error('Error fetching time logs:', error);
        }
    };

    const startTimer = async () => {
        try {
            await api.post(`/tasks/${taskId}/timer/start`);
            setIsTracking(true);
            setElapsedTime(0);
            toast.success('Timer started ⏱️');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to start timer');
        }
    };

    const stopTimer = async () => {
        try {
            const res = await api.post(`/tasks/${taskId}/timer/stop`);
            setIsTracking(false);
            setElapsedTime(0);
            toast.success(`Logged ${res.data.timeLog.durationMinutes} minutes`);
            fetchTimeLogs();
        } catch (error) {
            toast.error('Failed to stop timer');
        }
    };

    const formatTime = (seconds) => {
        const hours = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;

        if (hours > 0) {
            return `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        }
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const totalMinutes = timeLogs.reduce((sum, log) => sum + log.durationMinutes, 0);

    return (
        <div className="space-y-4">
            {/* Timer Controls */}
            <div className="bg-gradient-to-r from-blue-50 to-sky-50 dark:from-gray-800 dark:to-gray-850 p-4 rounded-xl">
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                        <Clock className="text-blue-600" size={20} />
                        <h4 className="font-semibold text-gray-800 dark:text-white">Time Tracker</h4>
                    </div>
                    {totalMinutes > 0 && (
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                            Total: <span className="font-bold">{totalMinutes}min</span>
                        </div>
                    )}
                </div>

                <div className="flex items-center gap-4">
                    <div className="flex-1 bg-white dark:bg-gray-700 p-4 rounded-lg text-center">
                        <div className="text-3xl font-mono font-bold text-gray-800 dark:text-white">
                            {formatTime(elapsedTime)}
                        </div>
                        {isTracking && (
                            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                Tracking in progress...
                            </div>
                        )}
                    </div>

                    <button
                        onClick={isTracking ? stopTimer : startTimer}
                        className={`px-6 py-4 rounded-lg font-semibold flex items-center gap-2 transition-all ${isTracking
                            ? 'bg-red-500 hover:bg-red-600 text-white'
                            : 'bg-blue-600 hover:bg-blue-700 text-white'
                            }`}
                    >
                        {isTracking ? (
                            <>
                                <Square size={18} fill="white" />
                                Stop
                            </>
                        ) : (
                            <>
                                <Play size={18} fill="white" />
                                Start
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Time Logs History */}
            {timeLogs.length > 0 && (
                <div className="bg-white dark:bg-gray-800 p-4 rounded-xl">
                    <div className="flex items-center gap-2 mb-3">
                        <TrendingUp className="text-green-600" size={18} />
                        <h5 className="font-semibold text-gray-800 dark:text-white">Session History</h5>
                    </div>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                        {timeLogs.slice(0, 5).map((log) => (
                            <div
                                key={log.id}
                                className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded-lg"
                            >
                                <div>
                                    <div className="text-sm text-gray-600 dark:text-gray-400">
                                        {new Date(log.startTime).toLocaleDateString()} at{' '}
                                        {new Date(log.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                    {log.type === 'pomodoro' && (
                                        <div className="text-xs text-sky-600 dark:text-sky-400">🍅 Pomodoro</div>
                                    )}
                                </div>
                                <div className="font-semibold text-blue-600">
                                    {log.durationMinutes}min
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default TimeTracker;
