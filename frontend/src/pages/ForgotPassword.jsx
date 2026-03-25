import { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, ArrowLeft, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import api from "../services/api";

const ForgotPassword = () => {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        setSuccess(false);

        try {
            await api.post('/auth/forgotpassword', { email });
            setSuccess(true);
            toast.success("Reset link sent to your email");
        } catch (err) {
            setError(err.response?.data?.message || "Something went wrong");
            toast.error(err.response?.data?.message || "Failed to send email");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="h-screen w-full flex flex-col lg:flex-row bg-white overflow-hidden font-inter">
            {/* Left Side - Branding (Compact) */}
            <div className="hidden lg:flex w-[42%] bg-[#582c8b] relative flex-col items-center justify-center p-8 text-white overflow-hidden">
                {/* Premium Background Pattern */}
                <div className="absolute inset-0 z-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>
                <div className="absolute inset-0 z-0 bg-gradient-to-br from-purple-900/50 via-transparent to-black/20"></div>
                
                {/* Floating Decorative Elements */}
                <div className="absolute top-[15%] left-[10%] w-32 h-32 bg-white/5 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-[20%] right-[10%] w-48 h-48 bg-purple-400/10 rounded-full blur-3xl animate-pulse delay-700"></div>

                {/* Glassmorphism Floating Cards */}
                <div className="absolute top-[20%] right-[-20px] w-40 h-40 bg-white/5 backdrop-blur-md rounded-3xl border border-white/10 rotate-12 animate-float"></div>
                <div className="absolute bottom-[15%] left-[-30px] w-56 h-56 bg-white/5 backdrop-blur-sm rounded-[3rem] border border-white/10 -rotate-6 animate-float-delayed"></div>

                {/* Content Container - Centered to match 2nd example */}
                <div className="relative z-10 flex flex-col items-center justify-center space-y-12 max-w-sm animate-in fade-in zoom-in duration-1000">
                    <div className="relative group flex flex-col items-center">
                        {/* Featured Illustration with Ultra-Soft Edge Blending */}
                        <div className="relative z-20 w-80 h-80 transition-all duration-1000 group-hover:scale-105"
                             style={{ 
                                 maskImage: 'radial-gradient(circle at center, black 30%, rgba(0,0,0,0.8) 50%, transparent 75%)', 
                                 WebkitMaskImage: 'radial-gradient(circle at center, black 30%, rgba(0,0,0,0.8) 50%, transparent 75%)' 
                             }}>
                             <img 
                                src="/assets/team_tasks.png" 
                                alt="Bit-task Team" 
                                className="w-full h-full object-contain mix-blend-lighten contrast-125 brightness-110" 
                             />
                        </div>
                        {/* Soft Brand Glow */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150%] h-[150%] bg-purple-400/20 rounded-full blur-[100px] -z-10"></div>
                    </div>

                    <div className="text-center w-full mt-auto relative">
                        <div className="inline-block relative">
                            <h1 className="text-6xl font-black tracking-tight font-serif text-white drop-shadow-sm">Recover</h1>
                            <div className="absolute -bottom-2 left-0 w-full h-1.5 bg-gradient-to-r from-transparent via-purple-300/40 to-transparent rounded-full"></div>
                        </div>
                        <p className="mt-8 text-white/50 font-medium tracking-[0.3em] text-[10px] uppercase flex items-center justify-center gap-3">
                            <span className="w-8 h-px bg-white/10"></span>
                            Access Restored
                            <span className="w-8 h-px bg-white/10"></span>
                        </p>
                    </div>
                </div>
            </div>

            {/* Right Side - Form */}
            {/* Right Side - Form area (Compact) */}
            <div className="w-full lg:w-[60%] flex items-center justify-center p-4 sm:p-12 relative bg-white">
                <div className="absolute left-0 top-0 bottom-0 w-[400px] overflow-hidden hidden lg:block -translate-x-full pointer-events-none">
                    <svg className="h-full w-full fill-white" preserveAspectRatio="none" viewBox="0 0 100 1000">
                        {/* S-Pinch Curve (White area flows into Blue) */}
                        <path d="M0,0 C0,300 80,400 80,500 S0,700 0,1000 L100,1000 L100,0 Z" />
                    </svg>
                </div>

                <div className="w-full max-w-[400px] relative z-10">
                    <div className="mb-6">
                        <div className="flex items-center gap-3 mb-2">
                            <Link to="/login" className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all border border-slate-100 shadow-sm active:scale-90">
                                <ArrowLeft size={18} />
                            </Link>
                            <h2 className="text-2xl font-black text-[#1e1b4b] tracking-tight">Forgot Password</h2>
                        </div>
                        <div className="flex gap-1 ml-13">
                            <div className="w-6 h-1 bg-[#1a365d] rounded-full"></div>
                            <div className="w-1 h-1 bg-[#1a365d]/20 rounded-full"></div>
                        </div>
                    </div>

                    {success ? (
                        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-8 text-center shadow-lg shadow-blue-500/5">
                            <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-6 text-blue-600 shadow-inner">
                                <CheckCircle size={32} />
                            </div>
                            <h3 className="text-xl font-black text-slate-900 mb-2">Link Sent!</h3>
                            <p className="text-slate-500 text-sm mb-8 font-medium">Check your inbox for the reset link.</p>
                            <Link
                                to="/login"
                                className="w-full py-4 bg-[#1a365d] text-white font-black text-xs uppercase tracking-[0.2em] rounded-2xl inline-flex items-center justify-center hover:bg-blue-900 shadow-lg shadow-blue-900/20 transition-all active:scale-[0.98]"
                            >
                                Back to Login
                            </Link>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {error && (
                                <div className="p-4 rounded-xl bg-red-50 border border-red-100 flex items-start gap-3">
                                    <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 shrink-0" />
                                    <p className="text-sm text-red-600">{error}</p>
                                </div>
                            )}

                            <div className="space-y-1.5 group">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 group-focus-within:text-blue-600 transition-colors">Email Address</label>
                                <div className="relative">
                                    <Input
                                        type="email"
                                        required
                                        className="bg-slate-50 border-slate-100 focus:bg-white focus:border-blue-600 focus:ring-blue-600/5 text-slate-800 h-11 rounded-2xl placeholder:text-slate-300 transition-all font-medium text-sm pl-11"
                                        placeholder="Enter your email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                    />
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                                </div>
                            </div>

                            <Button
                                type="submit"
                                disabled={loading}
                                className="w-full py-4 bg-[#1a365d] hover:bg-blue-900 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-lg shadow-blue-900/20 transform transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                            >
                                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Recover Password"}
                            </Button>

                            <div className="text-center">
                                <Link to="/login" className="inline-flex items-center text-sm font-semibold text-stone-500 hover:text-stone-800 transition-colors">
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

export default ForgotPassword;
