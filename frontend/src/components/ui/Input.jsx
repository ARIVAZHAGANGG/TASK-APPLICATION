import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "../../utils/cn";

const Input = ({ label, type = "text", error, className, ...props }) => {
    const [showPassword, setShowPassword] = useState(false);
    const isPassword = type === "password";
    const inputType = isPassword && showPassword ? "text" : type;

    return (
        <div className="w-full space-y-1">
            <div className="floating-label-group">
                <input
                    type={inputType}
                    placeholder=" "
                    className={cn(
                        "floating-input",
                        error && "border-red-500/50 focus:ring-red-500/10",
                        className
                    )}
                    {...props}
                />
                {label && <label className="floating-label">{label}</label>}

                {isPassword && (
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-primary-400 transition-colors z-10"
                    >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                )}
            </div>
            {error && <p className="text-[10px] font-bold uppercase tracking-tight text-red-400 ml-4 mt-1 opacity-80">{error}</p>}
        </div>
    );
};


export default Input;
