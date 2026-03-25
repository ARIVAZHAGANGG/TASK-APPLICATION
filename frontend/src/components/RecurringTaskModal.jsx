import { useState } from 'react';
import { X, Repeat, Calendar } from 'lucide-react';
import api from '../services/api';
import { toast } from 'sonner';
import Button from './ui/Button';

const RecurringTaskModal = ({ isOpen, onClose, task, onSuccess }) => {
    const [frequency, setFrequency] = useState('daily');
    const [interval, setInterval] = useState(1);
    const [endDate, setEndDate] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const payload = {
                frequency,
                interval: parseInt(interval),
                endDate: endDate || undefined
            };

            await api.post(`/tasks/${task.id}/recurrence`, payload);
            toast.success('Recurring pattern created! ✅');
            onSuccess && onSuccess();
            onClose();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to create recurrence');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full mx-4 p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                        <Repeat className="text-primary-600" size={24} />
                        <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                            Make Task Recurring
                        </h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Task Info */}
                <div className="bg-gradient-to-r from-primary-50 to-blue-50 dark:from-gray-700 dark:to-gray-750 p-4 rounded-xl mb-6">
                    <div className="font-semibold text-gray-800 dark:text-white">{task?.title}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        This task will be automatically recreated based on the schedule below
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Frequency */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                            Frequency
                        </label>
                        <select
                            value={frequency}
                            onChange={(e) => setFrequency(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                        >
                            <option value="daily">Daily</option>
                            <option value="weekly">Weekly</option>
                            <option value="monthly">Monthly</option>
                        </select>
                    </div>

                    {/* Interval */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                            Repeat every
                        </label>
                        <div className="flex items-center gap-3">
                            <input
                                type="number"
                                min="1"
                                max="365"
                                value={interval}
                                onChange={(e) => setInterval(e.target.value)}
                                className="w-24 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                            />
                            <span className="text-gray-600 dark:text-gray-400">
                                {frequency === 'daily' && `day${interval > 1 ? 's' : ''}`}
                                {frequency === 'weekly' && `week${interval > 1 ? 's' : ''}`}
                                {frequency === 'monthly' && `month${interval > 1 ? 's' : ''}`}
                            </span>
                        </div>
                    </div>

                    {/* End Date (Optional) */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                            End Date (Optional)
                        </label>
                        <div className="relative">
                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                min={new Date().toISOString().split('T')[0]}
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                            />
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            Leave blank to repeat indefinitely
                        </p>
                    </div>

                    {/* Preview */}
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl">
                        <div className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-1">
                            📅 Preview
                        </div>
                        <div className="text-sm text-blue-700 dark:text-blue-300">
                            This task will repeat every {interval}{' '}
                            {frequency === 'daily' && `day${interval > 1 ? 's' : ''}`}
                            {frequency === 'weekly' && `week${interval > 1 ? 's' : ''}`}
                            {frequency === 'monthly' && `month${interval > 1 ? 's' : ''}`}
                            {endDate && ` until ${new Date(endDate).toLocaleDateString()}`}
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3">
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={onClose}
                            className="flex-1"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={isSubmitting}
                            className="flex-1 bg-primary-600 hover:bg-primary-700"
                        >
                            {isSubmitting ? 'Creating...' : 'Create Recurrence'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default RecurringTaskModal;
