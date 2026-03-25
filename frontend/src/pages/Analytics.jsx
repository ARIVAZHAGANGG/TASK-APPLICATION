import { useState, useEffect } from 'react';
import { LineChart, Line, PieChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { useNavigate } from 'react-router-dom';
import { getTaskStats, getGraphData } from '../services/taskService';
import { toast } from 'sonner';
import { ListTodo, CheckCircle2, Clock, AlertCircle, TrendingUp, ArrowLeft } from 'lucide-react';

const StatCard = ({ title, value, icon: Icon, color, subtext }) => {
    return (
        <div
            className="rounded-xl p-6 border transition-all hover:shadow-lg"
            style={{
                backgroundColor: 'var(--card-bg)',
                borderColor: 'var(--border-color)',
            }}
        >
            <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${color}`}>
                    <Icon className="w-6 h-6 text-white" />
                </div>
            </div>
            <div>
                <p className="text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
                    {title}
                </p>
                <p className="text-3xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
                    {value}
                </p>
                {subtext && (
                    <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                        {subtext}
                    </p>
                )}
            </div>
        </div>
    );
};

const Analytics = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState(null);
    const [graphData, setGraphData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAnalytics();
    }, []);

    const fetchAnalytics = async () => {
        try {
            const [statsRes, graphRes] = await Promise.all([
                getTaskStats(),
                getGraphData()
            ]);
            setStats(statsRes.data);
            setGraphData(graphRes.data);
        } catch (error) {
            toast.error('Failed to load analytics');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    const completionRate = stats?.totalTasks > 0
        ? Math.round((stats.completedTasks / stats.totalTasks) * 100)
        : 0;

    const priorityData = [
        { name: 'High', value: stats?.priorityStats?.high || 0, color: '#ef4444' },
        { name: 'Medium', value: stats?.priorityStats?.medium || 0, color: '#f59e0b' },
        { name: 'Low', value: stats?.priorityStats?.low || 0, color: '#10b981' },
    ];

    const weeklyData = stats?.weeklyCompleted?.map(item => ({
        date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        completed: item.count
    })) || [];

    return (
        <div className="p-6 max-w-7xl mx-auto animate-slide-up">
            <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 text-slate-500 hover:text-primary-600 font-bold text-sm mb-4 transition-colors group"
                    >
                        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                        BACK TO REPORT
                    </button>
                    <h1 className="text-4xl font-black mb-2 text-slate-800 dark:text-white tracking-tight">
                        Deep <span className="text-primary-600">Analytics</span>
                    </h1>
                    <p className="text-slate-500 font-bold">
                        Detailed breakdown of your productivity trends
                    </p>
                </div>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard
                    title="Total Tasks"
                    value={stats?.totalTasks || 0}
                    icon={ListTodo}
                    color="bg-gradient-to-br from-blue-500 to-blue-600 shadow-blue-500/20 shadow-lg"
                />
                <StatCard
                    title="Completed"
                    value={stats?.completedTasks || 0}
                    icon={CheckCircle2}
                    color="bg-gradient-to-br from-emerald-500 to-teal-600 shadow-emerald-500/20 shadow-lg"
                    subtext={`${completionRate}% completion rate`}
                />
                <StatCard
                    title="Pending"
                    value={stats?.pendingTasks || 0}
                    icon={Clock}
                    color="bg-gradient-to-br from-amber-400 to-orange-500 shadow-amber-500/20 shadow-lg"
                />
                <StatCard
                    title="High Priority"
                    value={stats?.priorityStats?.high || 0}
                    icon={AlertCircle}
                    color="bg-gradient-to-br from-rose-500 to-red-600 shadow-rose-500/20 shadow-lg"
                />
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Weekly Productivity */}
                <div
                    className="rounded-xl p-6 border h-[400px]"
                    style={{
                        backgroundColor: 'var(--card-bg)',
                        borderColor: 'var(--border-color)',
                    }}
                >
                    <div className="flex items-center gap-2 mb-6">
                        <TrendingUp className="w-5 h-5 text-primary-500" />
                        <h3 className="font-bold text-lg" style={{ color: 'var(--text-primary)' }}>
                            Weekly Productivity
                        </h3>
                    </div>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={weeklyData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                                <XAxis
                                    dataKey="date"
                                    stroke="var(--text-tertiary)"
                                    style={{ fontSize: '12px' }}
                                />
                                <YAxis stroke="var(--text-tertiary)" style={{ fontSize: '12px' }} />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: 'var(--card-bg)',
                                        border: '1px solid var(--border-color)',
                                        borderRadius: '8px',
                                    }}
                                />
                                <Legend />
                                <Line
                                    type="monotone"
                                    dataKey="completed"
                                    stroke="#3b82f6"
                                    strokeWidth={2}
                                    dot={{ fill: '#3b82f6', r: 4 }}
                                    activeDot={{ r: 6 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Priority Distribution */}
                <div
                    className="rounded-xl p-6 border h-[400px]"
                    style={{
                        backgroundColor: 'var(--card-bg)',
                        borderColor: 'var(--border-color)',
                    }}
                >
                    <h3 className="font-bold text-lg mb-6" style={{ color: 'var(--text-primary)' }}>
                        Priority Distribution
                    </h3>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={priorityData}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={({ name, percent }) =>
                                        `${name} ${(percent * 100).toFixed(0)}%`
                                    }
                                    outerRadius={100}
                                    fill="#8884d8"
                                    dataKey="value"
                                >
                                    {priorityData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: 'var(--card-bg)',
                                        border: '1px solid var(--border-color)',
                                        borderRadius: '8px',
                                    }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Completion Percentage Visual */}
            <div
                className="rounded-xl p-6 border mt-6"
                style={{
                    backgroundColor: 'var(--card-bg)',
                    borderColor: 'var(--border-color)',
                }}
            >
                <h3 className="font-bold text-lg mb-4" style={{ color: 'var(--text-primary)' }}>
                    Overall Completion Rate
                </h3>
                <div className="flex items-center gap-4">
                    <div className="flex-1">
                        <div className="h-6 rounded-full bg-gray-200 overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-primary-500 to-primary-600 transition-all duration-500"
                                style={{ width: `${completionRate}%` }}
                            />
                        </div>
                    </div>
                    <div className="text-2xl font-bold text-primary-600">
                        {completionRate}%
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Analytics;
