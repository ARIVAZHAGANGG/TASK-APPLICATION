import { useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { Lock, ArrowLeft, Loader2, CheckCircle, AlertCircle, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import api from "../services/api";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";

const ResetPassword = () => {
    const { token } = useParams();
    const navigate = useNavigate();

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (password !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        if (password.length < 6) {
            setError("Password must be at least 6 characters");
            return;
        }

        setLoading(true);

        try {
            await api.put(`/auth/resetpassword/${token}`, { password });
            setSuccess(true);
            toast.success("Password reset successfully!");
            setTimeout(() => {
                navigate("/login");
            }, 3000);
        } catch (err) {
            setError(err.response?.data?.message || "Invalid or expired token");
            toast.error(err.response?.data?.message || "Reset failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="h-screen w-full flex flex-col lg:flex-row bg-white overflow-hidden font-inter">
            {/* Left Side - Branding (Compact) */}
            <div className="hidden lg:flex w-[40%] bg-[#582c8b] relative flex-col items-center justify-center p-8 text-white overflow-hidden">
                {/* Dynamic Floating Background Elements */}
                <div className="absolute top-10 left-10 w-24 h-24 bg-white/5 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-10 right-10 w-32 h-32 bg-blue-400/10 rounded-full blur-3xl animate-pulse delay-700"></div>

                {/* Content Container - Ensure it fits and is centered */}
                <div className="relative z-10 flex flex-col items-center justify-between h-full max-w-sm py-12 animate-in fade-in zoom-in duration-1000">
                    <div className="flex-1 flex flex-col items-center justify-center group">
                        {/* Featured Illustration */}
                        <div className="relative z-20 w-80 h-80 transition-all duration-700 group-hover:scale-105">
                             <img 
                                src="/assets/team_tasks.png" 
                                alt="Bit-task Team" 
                                className="w-full h-full object-contain drop-shadow-3xl" 
                             />
                        </div>
                        {/* Soft Brand Glow */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150%] h-[150%] bg-blue-400/5 rounded-full blur-[120px] -z-10"></div>
                    </div>

                    <div className="text-center w-full">
                        <div className="space-y-1">
                            <h1 className="text-5xl font-black tracking-tight font-serif text-white">Secure</h1>
                            <div className="h-1.5 w-12 bg-blue-400/30 rounded-full mx-auto"></div>
                        </div>
                        <p className="mt-4 text-blue-200/50 font-medium tracking-[0.2em] text-[10px] uppercase">Account Protection</p>
                    </div>
                </div>
            </div>

            {/* Right Side - Form */}
            {/* Right Side - Form area (Compact) */}
            <div className="w-full lg:w-[60%] flex items-center justify-center p-4 sm:p-12 relative bg-white">
                <div className="absolute left-0 top-0 bottom-0 w-[450px] overflow-hidden hidden lg:block -translate-x-full pointer-events-none">
                    <svg className="h-full w-full fill-[#582c8b]" preserveAspectRatio="none" viewBox="0 0 100 1000">
                        {/* Purple Bulge-Out Wave (Matches Latest Ref) */}
                        <path d="M0,0 C0,0 100,250 100,500 S0,1000 0,1000 L0,1000 L0,0 Z" />
                    </svg>
                </div>

                <div className="w-full max-w-md space-y-8 animate-in fade-in slide-in-from-bottom duration-1000">
                    <div className="text-center">
                        <h2 className="text-3xl font-black tracking-tight text-[#1a365d] mb-2 font-serif">Setup new password</h2>
                        <div className="flex items-center justify-center gap-2">
                             <div className="h-px w-8 bg-gray-200"></div>
                             <p className="text-gray-400 text-xs font-medium uppercase tracking-widest">Update Security</p>
                             <div className="h-px w-8 bg-gray-200"></div>
                        </div>
                    </div>
                    {success ? (
                        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-8 text-center shadow-lg shadow-blue-500/5">
                            <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-6 text-blue-600 shadow-inner">
                                <CheckCircle size={32} />
                            </div>
                            <h3 className="text-xl font-black text-slate-900 mb-2">Success!</h3>
                            <p className="text-slate-500 text-sm mb-8 font-medium">Password updated. Redirecting to login...</p>
                            <Link
                                to="/login"
                                className="w-full py-4 bg-[#1a365d] text-white font-black text-xs uppercase tracking-[0.2em] rounded-2xl inline-flex items-center justify-center hover:bg-blue-900 shadow-lg shadow-blue-900/20 transition-all active:scale-[0.98]"
                            >
                                Login Now
                            </Link>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {error && (
                                <div className="p-4 rounded-xl bg-red-50 border border-red-100 flex items-start gap-3">
                                    <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 shrink-0" />
                                    <p className="text-sm text-red-600 font-bold">{error}</p>
                                </div>
                            )}

                            <div className="space-y-1.5 group">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 group-focus-within:text-blue-600 transition-colors">New Password</label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        required
                                        className="w-full pl-11 pr-12 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-600/5 outline-none transition-all font-medium text-slate-800 placeholder-slate-300"
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                    />
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                                    >
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-1.5 group">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 group-focus-within:text-blue-600 transition-colors">Confirm Password</label>
                                <div className="relative">
                                    <Input
                                        type="password"
                                        required
                                        className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-600/5 outline-none transition-all font-medium text-slate-800 placeholder-slate-300"
                                        placeholder="••••••••"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                    />
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                                </div>
                            </div>

                            <Button
                                type="submit"
                                disabled={loading}
                                className="w-full py-4 bg-[#1a365d] hover:bg-blue-900 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-lg shadow-blue-900/20 transform transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                            >
                                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                                {loading ? "Updating..." : "Reset Password"}
                            </Button>

                            <div className="text-center">
                                <Link to="/login" className="inline-flex items-center text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-blue-600 transition-all">
                                    <ArrowLeft size={16} className="mr-2" /> Back to Login
                                </Link>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ResetPassword;
