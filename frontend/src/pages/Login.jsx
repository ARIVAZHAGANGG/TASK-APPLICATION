import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Loader2, Mail, Lock, Eye, EyeOff } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { toast } from "sonner";
import { useGoogleLogin } from "@react-oauth/google";
import { motion, AnimatePresence } from "framer-motion";
import { FaFacebook, FaTwitter } from "react-icons/fa";
import loginIllustration from "../assets/login_illustration_desk.png";

const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [rememberMe, setRememberMe] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [btnOffset, setBtnOffset] = useState({ x: 0, y: 0 });
    const [isShaking, setIsShaking] = useState(false);
    const [feedback, setFeedback] = useState("");
    const [emailError, setEmailError] = useState(false);
    const [notRegisteredError, setNotRegisteredError] = useState(false);
    const { login, googleLogin } = useAuth();
    const navigate = useNavigate();
    const btnRef = useRef(null);

    const moveButton = () => {
        if (email && !password) {
            const isMobile = window.innerWidth < 768;
            const randomX = (Math.random() - 0.5) * (isMobile ? 150 : 300); 
            const randomY = (Math.random() - 0.5) * (isMobile ? 100 : 200); 
            setBtnOffset({ x: randomX, y: randomY });
            
            setIsShaking(true);
            setFeedback("Enter password first 😄");
            setTimeout(() => {
                setIsShaking(false);
            }, 400);
        }
    };

    const handleProximity = (e) => {
        if (email && !password) {
            moveButton();
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!email) {
            toast.error("Enter email");
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setEmailError(true);
            return;
        }
        setEmailError(false);
        
        if (!password) {
            moveButton();
            return;
        }

        setIsLoading(true);
        setBtnOffset({ x: 0, y: 0 }); 
        setFeedback("");
        setNotRegisteredError(false);
        try {
            await login({ email, password, rememberMe });
            toast.success("Welcome back!");
            navigate("/");
        } catch (error) {
            if (error.response?.data?.message === "Email not registered") {
                setNotRegisteredError(true);
            } else {
                toast.error(error.response?.data?.message || "Invalid credentials.");
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleLogin = useGoogleLogin({
        onSuccess: async (tokenResponse) => {
            setIsLoading(true);
            try {
                await googleLogin(tokenResponse.access_token, rememberMe);
                toast.success("Signed in with Google.");
                navigate("/");
            } catch (error) {
                toast.error("Google login failed.");
            } finally {
                setIsLoading(false);
            }
        },
    });

    return (
        <div className="min-h-screen w-full flex flex-col md:flex-row font-['Nunito'] overflow-hidden bg-white">
            {/* Left Side: Illustration */}
            <div className="w-full md:w-1/2 bg-[#b5e5e0] flex items-center justify-center p-4 sm:p-8 md:p-12 relative min-h-[250px] md:min-h-0">
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 1 }}
                    className="w-full flex justify-center"
                >
                    <img 
                        src={loginIllustration} 
                        alt="Welcome Illustration" 
                        className="w-[70%] md:w-full h-auto max-w-[500px] object-contain"
                    />
                </motion.div>
            </div>

            {/* Right Side: Form */}
            <div className="w-full md:w-1/2 p-6 sm:p-8 md:p-16 flex flex-col justify-center bg-white relative z-10 md:shadow-[-20px_0_40px_rgba(0,0,0,0.02)]">
                
                {/* Desktop Vertical Wave Divider */}
                <div className="hidden md:block absolute top-0 -left-[140px] w-[141px] h-full text-white pointer-events-none drop-shadow-[-10px_0_15px_rgba(0,0,0,0.03)] focus:border-0 outline-none">
                    <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full" fill="currentColor">
                        <path d="M 100,0 C 100,30 0,30 0,50 C 0,70 100,70 100,100 Z" />
                    </svg>
                </div>

                {/* Mobile Horizontal Wave Divider */}
                <div className="md:hidden absolute -top-[50px] left-0 w-full h-[51px] text-white pointer-events-none drop-shadow-[0_-10px_15px_rgba(0,0,0,0.03)] focus:border-0 outline-none">
                    <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full" fill="currentColor">
                        <path d="M 0,100 C 30,100 30,0 50,0 C 70,0 70,100 100,100 Z" />
                    </svg>
                </div>
                <motion.div 
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                    className="max-w-[460px] mx-auto w-full"
                >
                        <div className="mb-6 sm:mb-10 text-center md:text-left">
                            <h1 className="text-3xl sm:text-4xl font-bold text-slate-800 mb-2 sm:mb-4 tracking-tight">Welcome Back :)</h1>
                            <p className="text-slate-500 text-[13px] sm:text-sm leading-relaxed">
                                To keep connected with us please login with your personal information 🔔
                            </p>
                        </div>

                        <AnimatePresence>
                            {emailError && (
                                <motion.div 
                                    initial={{ opacity: 0, height: 0, mb: 0 }}
                                    animate={{ opacity: 1, height: "auto", mb: 24 }}
                                    exit={{ opacity: 0, height: 0, mb: 0 }}
                                    className="overflow-hidden"
                                >
                                    <div role="alert" className="alert alert-warning">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 shrink-0 stroke-current" fill="none" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                        </svg>
                                        <span>Warning: Invalid email address!</span>
                                    </div>
                                </motion.div>
                            )}

                            {notRegisteredError && (
                                <motion.div 
                                    initial={{ opacity: 0, height: 0, mb: 0 }}
                                    animate={{ opacity: 1, height: "auto", mb: 24 }}
                                    exit={{ opacity: 0, height: 0, mb: 0 }}
                                    className="overflow-hidden"
                                >
                                    <div role="alert" className="alert alert-warning">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 shrink-0 stroke-current" fill="none" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                        </svg>
                                        <span>This email is not registered. Please use a registered email 🔔</span>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                            <div className="space-y-3 sm:space-y-4">
                                <div className="relative group">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors">
                                        <Mail size={18} className="sm:size-5" />
                                    </div>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => {
                                            setEmail(e.target.value);
                                            if (emailError) setEmailError(false);
                                            if (notRegisteredError) setNotRegisteredError(false);
                                        }}
                                        className="w-full h-14 sm:h-[60px] pl-12 pr-4 bg-slate-50 border border-transparent rounded-2xl sm:rounded-[20px] text-slate-700 placeholder:text-slate-400 focus:bg-white focus:border-blue-100 focus:ring-4 focus:ring-blue-500/5 transition-all outline-none text-sm font-medium"
                                        placeholder="Email Address"
                                    />
                                    {email && (
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-green-500 animate-in fade-in zoom-in duration-300">
                                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                    )}
                                </div>

                                <div className="relative group">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors">
                                        <Lock size={18} className="sm:size-5" />
                                    </div>
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full h-14 sm:h-[60px] pl-12 pr-12 bg-slate-50 border border-transparent rounded-2xl sm:rounded-[20px] text-slate-700 placeholder:text-slate-400 focus:bg-white focus:border-blue-100 focus:ring-4 focus:ring-blue-500/5 transition-all outline-none text-sm font-medium"
                                        placeholder="Password"
                                    />
                                    <button 
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-2"
                                    >
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>

                            <div className="flex items-center justify-between text-[11px] sm:text-xs font-bold px-1">
                                <label className="flex items-center gap-2 cursor-pointer group text-slate-500 hover:text-slate-800 transition-colors">
                                    <div className="relative">
                                        <input
                                            type="checkbox"
                                            checked={rememberMe}
                                            onChange={(e) => setRememberMe(e.target.checked)}
                                            className="peer sr-only"
                                        />
                                        <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-slate-200 rounded-md sm:rounded-lg peer-checked:bg-green-500 peer-checked:border-green-500 transition-all flex items-center justify-center">
                                            <svg className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-white opacity-0 peer-checked:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4}>
                                                <path d="M5 13l4 4L19 7" />
                                            </svg>
                                        </div>
                                    </div>
                                    Remember Me
                                </label>
                                <Link to="/forgot-password" size="sm" className="text-slate-400 hover:text-slate-600 transition-colors">
                                    Forgot Password?
                                </Link>
                            </div>

                            <div className="relative pt-1 sm:pt-2">
                                    <div className="relative w-full">
                                        <motion.button
                                            ref={btnRef}
                                            type="submit"
                                            disabled={isLoading}
                                            onMouseEnter={handleProximity}
                                            onTouchStart={handleProximity}
                                            animate={{ 
                                                x: btnOffset.x, 
                                                y: btnOffset.y,
                                                rotate: isShaking ? [0, -5, 5, -5, 5, 0] : 0
                                            }}
                                            transition={{ 
                                                type: "spring", 
                                                stiffness: 400, 
                                                damping: 15,
                                                rotate: { duration: 0.4 }
                                            }}
                                            className="w-full h-[50px] sm:h-[54px] bg-blue-500 hover:bg-blue-600 text-white rounded-xl sm:rounded-[20px] font-bold text-sm shadow-lg shadow-blue-500/20 active:scale-[0.98] transition-colors flex items-center justify-center gap-2 group whitespace-nowrap"
                                        >
                                            {isLoading ? (
                                                <Loader2 className="h-5 w-5 animate-spin" />
                                            ) : (
                                                "Login Now"
                                            )}
                                        </motion.button>

                                        <AnimatePresence>
                                            {feedback && (
                                                <motion.div
                                                    initial={{ opacity: 0, scale: 0.8, y: 10 }}
                                                    animate={{ opacity: 1, scale: 1, y: -25 }}
                                                    exit={{ opacity: 0, scale: 0.8, y: 10 }}
                                                    className="absolute -top-12 left-1/2 -translate-x-1/2 px-4 py-2 bg-slate-800 text-white text-[11px] font-bold rounded-xl shadow-2xl border border-white/10 whitespace-nowrap z-50 pointer-events-none"
                                                    style={{ left: `calc(50% + ${btnOffset.x}px)`, top: `calc(-48px + ${btnOffset.y}px)` }}
                                                >
                                                    {feedback}
                                                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-800 rotate-45" />
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                            </div>

                            <div className="relative flex items-center justify-center my-5 sm:my-6">
                                <div className="w-full h-px bg-slate-100" />
                                <span className="absolute px-4 bg-white text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-slate-400">Or continue with</span>
                            </div>

                            <button
                                type="button"
                                onClick={() => handleGoogleLogin()}
                                className="w-full h-[50px] sm:h-[54px] bg-white border border-slate-200 sm:border-2 sm:border-slate-100 hover:border-blue-100 hover:bg-blue-50/30 text-slate-700 rounded-xl sm:rounded-[20px] font-bold text-sm transition-all flex items-center justify-center gap-3 group active:scale-[0.98]"
                            >
                                <svg className="w-5 h-5 group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
                                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                </svg>
                                Sign in with Google
                            </button>

                            <p className="text-center text-[11px] sm:text-xs font-bold text-slate-400 mt-6 sm:mt-8 px-4">
                                Need an account? Contact your administrator 🔔
                            </p>
                        </form>

                    </motion.div>
            </div>
        </div>
    );
};

export default Login;
