import { cn } from "../../utils/cn";

const Button = ({ className, variant = "primary", size = "md", children, ...props }) => {
    const variants = {
        primary: "bg-primary-600 text-white hover:bg-primary-700",
        secondary: "bg-white text-slate-900 border border-slate-200 hover:bg-slate-50",
        ghost: "bg-transparent text-slate-600 hover:bg-slate-100",
        danger: "bg-red-500 text-white hover:bg-red-600",
    };

    const sizes = {
        sm: "px-3 py-1.5 text-sm",
        md: "px-4 py-2",
        lg: "px-6 py-3 text-lg",
    };

    return (
        <button
            className={cn(
                "btn-premium inline-flex items-center justify-center rounded-xl font-medium",
                variants[variant],
                sizes[size],
                className
            )}
            {...props}
        >
            {children}
        </button>
    );
};

export default Button;
