import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    LineChart,
    Line
} from "recharts";
import { motion } from "framer-motion";

const AnalyticsCharts = ({ weeklyData, priorityData, trendData }) => {
    const COLORS = ["#ef4444", "#f59e0b", "#10b981", "#6366f1", "#8b5cf6"];

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="saas-card p-8"
            >
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white transition-colors">Weekly Velocity</h3>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Output Analysis</p>
                    </div>
                </div>
                <div className="h-72 w-full relative">
                    <ResponsiveContainer width="100%" height="100%" debounce={50}>
                        <BarChart data={weeklyData}>
                            <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="var(--border-color)" opacity={0.5} />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "var(--text-tertiary)", fontWeight: 700 }} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "var(--text-tertiary)", fontWeight: 700 }} />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: "var(--bg-secondary)",
                                    borderRadius: "16px",
                                    border: "1px solid var(--border-color)",
                                    boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1)",
                                    fontWeight: 'bold',
                                    padding: '12px',
                                    color: "var(--text-primary)"
                                }}
                                itemStyle={{ color: "var(--text-primary)" }}
                                cursor={{ fill: "rgba(99, 102, 241, 0.05)" }}
                            />
                            <Bar dataKey="tasks" fill="url(#colorTasks)" radius={[6, 6, 0, 0]} barSize={20} />
                            <defs>
                                <linearGradient id="colorTasks" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#6366f1" stopOpacity={1} />
                                    <stop offset="95%" stopColor="#818cf8" stopOpacity={0.8} />
                                </linearGradient>
                            </defs>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </motion.div>

            {/* Task Trends (Line) */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="saas-card p-8"
            >
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white transition-colors">Completion Trend</h3>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Consistency Metric</p>
                    </div>
                </div>
                <div className="h-72 w-full relative">
                    <ResponsiveContainer width="100%" height="100%" debounce={50}>
                        <LineChart data={trendData}>
                            <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="var(--border-color)" opacity={0.5} />
                            <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "var(--text-tertiary)", fontWeight: 700 }} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "var(--text-tertiary)", fontWeight: 700 }} />
                             <Tooltip
                                 contentStyle={{
                                     backgroundColor: "var(--bg-secondary)",
                                     borderRadius: "16px",
                                     border: "1px solid var(--border-color)",
                                     boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1)",
                                     fontWeight: 'bold',
                                     padding: '12px',
                                     color: "var(--text-primary)"
                                 }}
                                 itemStyle={{ color: "var(--text-primary)" }}
                             />
                            <Line
                                type="monotone"
                                dataKey="completed"
                                stroke="#6366f1"
                                strokeWidth={4}
                                dot={{ r: 4, fill: "#6366f1", strokeWidth: 2, stroke: "#fff" }}
                                activeDot={{ r: 6, strokeWidth: 0, shadow: '0 0 10px rgba(99,102,241,0.5)' }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </motion.div>

            {/* Priority Distribution (Pie) */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="saas-card p-8 lg:col-span-2"
            >
                <div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white transition-colors">Mission Priority Scan</h3>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Resource Allocation</p>
                </div>
                <div className="flex flex-col md:flex-row items-center justify-around mt-6" style={{ height: 320 }}>
                    <div className="h-full w-full md:w-1/2 relative">
                        <ResponsiveContainer width="100%" height="100%" debounce={50}>
                            <PieChart>
                                <Pie
                                    data={priorityData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={80}
                                    outerRadius={110}
                                    paddingAngle={10}
                                    dataKey="value"
                                    stroke="none"
                                >
                                    {priorityData.map((entry, index) => {
                                        let color = COLORS[index % COLORS.length];
                                        if (entry.name === "High") color = "#f43f5e"; // Rose
                                        if (entry.name === "Medium") color = "#f59e0b"; // Amber
                                        if (entry.name === "Low") color = "#10b981"; // Emerald
                                        return <Cell key={`cell-${index}`} fill={color} />;
                                    })}
                                </Pie>
                                 <Tooltip
                                     contentStyle={{
                                         backgroundColor: "var(--bg-secondary)",
                                         borderRadius: "16px",
                                         border: "1px solid var(--border-color)",
                                         boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1)",
                                         fontWeight: 'bold',
                                         padding: '12px',
                                         color: "var(--text-primary)"
                                     }}
                                     itemStyle={{ color: "var(--text-primary)" }}
                                 />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="w-full md:w-1/3 space-y-5">
                        {priorityData.map((item, index) => {
                            let color = COLORS[index % COLORS.length];
                            if (item.name === "High") color = "#f43f5e";
                            if (item.name === "Medium") color = "#f59e0b";
                            if (item.name === "Low") color = "#10b981";

                            return (
                                <div key={item.name} className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800">
                                    <div className="flex items-center gap-3">
                                        <div className="w-2 h-6 rounded-full" style={{ backgroundColor: color }}></div>
                                        <span className="text-xs font-black uppercase text-slate-400 tracking-wider font-inter">{item.name}</span>
                                    </div>
                                    <span className="text-sm font-black text-slate-900 dark:text-white">{item.value} <span className="text-[10px] text-slate-400">UNITS</span></span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </motion.div>
        </div>
    );
};


export default AnalyticsCharts;
