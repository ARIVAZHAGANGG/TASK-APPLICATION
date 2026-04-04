import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, Eye, EyeOff } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { toast } from "sonner";
import { useGoogleLogin } from "@react-oauth/google";
import { motion, AnimatePresence } from "framer-motion";
import { FaFacebook, FaTwitter } from "react-icons/fa";

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
        <div className="min-h-screen w-full flex flex-col md:flex-row font-['Nunito'] overflow-hidden bg-slate-50 relative">
            
            {/* Full-screen S-Curve Background (Desktop Only) */}
            <div className="hidden md:block absolute inset-0 z-[1] pointer-events-none">
                <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                    <defs>
                        <linearGradient id="leftBg" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#3B82F6" />
                            <stop offset="100%" stopColor="#4338CA" />
                        </linearGradient>
                    </defs>
                    {/* Fill Path Animation */}
                    <motion.path 
                        initial={{ d: "M0,0 L0,0 C0,30 0,70 0,100 L0,100 Z" }}
                        animate={{ d: "M0,0 L50,0 C40,30 60,70 50,100 L0,100 Z" }}
                        transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
                        fill="url(#leftBg)" 
                    />
                    {/* Primary Glow Line Animation */}
                    <motion.path 
                        initial={{ d: "M0,0 C0,30 0,70 0,100" }}
                        animate={{ d: "M50,0 C40,30 60,70 50,100" }}
                        transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
                        fill="none" 
                        stroke="#818CF8" 
                        strokeWidth="0.15" 
                        style={{ filter: "drop-shadow(0px 0px 5px rgba(99,102,241,0.8))" }}
                    />
                </svg>
            </div>

            {/* Left Side: Welcome Text */}
            <div className="w-full md:w-1/2 bg-gradient-to-br from-blue-500 to-indigo-700 md:bg-none flex items-center justify-center p-4 sm:p-8 md:p-12 relative min-h-[300px] md:min-h-0 z-10">
                <motion.div 
                    initial={{ opacity: 0, x: -100 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="w-full flex justify-center"
                >
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tighter text-center leading-tight text-white drop-shadow-md relative">
                        Welcome Back !
                    </h1>
                </motion.div>
            </div>

            {/* Right Side: Form */}
            <div className="w-full md:w-1/2 p-6 sm:p-8 md:p-16 flex flex-col justify-center bg-slate-50 md:bg-transparent relative z-10 md:rounded-none rounded-t-[40px] -mt-10 md:mt-0 shadow-[0_-10px_40px_rgba(0,0,0,0.1)] md:shadow-none">
                <motion.div 
                    initial={{ opacity: 0, x: 100 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                    className="max-w-[380px] mx-auto w-full"
                >
                        <div className="mb-5 text-center">
                            <h2 className="text-xl font-bold text-slate-800 tracking-tight">Sign in to your account</h2>
                        </div>

                        <button
                            type="button"
                            onClick={() => handleGoogleLogin()}
                            className="w-full h-10 bg-white border border-slate-300 hover:bg-slate-50 hover:border-slate-400 text-slate-700 text-sm rounded flex items-center shadow-sm relative mb-5 transition-all group duration-300"
                        >
                            <div className="absolute left-4">
                                <svg className="w-5 h-5 group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
                                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                </svg>
                            </div>
                            <span className="w-full text-center font-medium tracking-wide flex-1">Continue with Google</span>
                        </button>

                        <div className="relative flex items-center justify-center mb-5">
                            <div className="w-full h-px bg-slate-200"></div>
                            <span className="absolute px-4 bg-slate-50 text-[13px] text-slate-500">Or</span>
                        </div>

                        <AnimatePresence>
                            {emailError && (
                                <motion.div 
                                    initial={{ opacity: 0, height: 0, mb: 0 }}
                                    animate={{ opacity: 1, height: "auto", mb: 20 }}
                                    exit={{ opacity: 0, height: 0, mb: 0 }}
                                    className="overflow-hidden"
                                >
                                    <div role="alert" className="alert py-2 rounded bg-red-50 border border-red-200 text-red-600">
                                        <span>Invalid email address!</span>
                                    </div>
                                </motion.div>
                            )}

                            {notRegisteredError && (
                                <motion.div 
                                    initial={{ opacity: 0, height: 0, mb: 0 }}
                                    animate={{ opacity: 1, height: "auto", mb: 20 }}
                                    exit={{ opacity: 0, height: 0, mb: 0 }}
                                    className="overflow-hidden"
                                >
                                    <div role="alert" className="alert py-2 rounded bg-amber-50 border border-amber-200 text-amber-700">
                                        <span>Email is not registered.</span>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="flex flex-col gap-1">
                                <label className="text-[13px] font-bold text-slate-700">Username</label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => {
                                        setEmail(e.target.value);
                                        if (emailError) setEmailError(false);
                                        if (notRegisteredError) setNotRegisteredError(false);
                                    }}
                                    className="w-full h-10 px-4 bg-white border border-slate-300 rounded-md text-slate-900 text-sm placeholder:text-slate-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all outline-none shadow-sm"
                                    placeholder="Enter your email"
                                />
                            </div>

                            <div className="flex flex-col gap-1">
                                <label className="text-[13px] font-bold text-slate-700">Password</label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full h-10 px-4 pr-12 bg-white border border-slate-300 rounded-md text-slate-900 text-sm placeholder:text-slate-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all outline-none shadow-sm"
                                        placeholder="Enter your password"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-slate-400 hover:text-slate-600 transition-colors"
                                    >
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>

                            <div className="flex justify-end pt-1">
                                <div className="relative">
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
                                        className="px-8 h-11 bg-indigo-600 hover:bg-indigo-700 text-white rounded font-bold transition-all flex items-center justify-center gap-2 shadow-md active:scale-[0.98]"
                                    >
                                        {isLoading ? (
                                            <Loader2 className="h-4 w-4 animate-spin text-white" />
                                        ) : (
                                            "Sign in"
                                        )}
                                    </motion.button>
                                </div>
                            </div>
                        </form>

                    </motion.div>
            </div>
        </div>
    );
};

export default Login;
