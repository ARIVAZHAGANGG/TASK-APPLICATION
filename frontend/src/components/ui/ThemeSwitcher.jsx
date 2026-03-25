import { useTheme } from "../../context/ThemeContext";
import { Sun, MoonStar } from "lucide-react";
import { cn } from "../../utils/cn";

const ThemeSwitcher = () => {
    const { theme, toggleTheme } = useTheme();
    const isDark = theme === 'dark' || theme === 'amoled';

    const handleToggle = (e) => {
        if (!document.startViewTransition) {
            toggleTheme();
            return;
        }

        const x = e.clientX;
        const y = e.clientY;
        const endRadius = Math.hypot(
            Math.max(x, window.innerWidth - x),
            Math.max(y, window.innerHeight - y)
        );

        const transition = document.startViewTransition(() => {
            toggleTheme();
        });

        transition.ready.then(() => {
            document.documentElement.animate(
                {
                    clipPath: [
                        `circle(0px at ${x}px ${y}px)`,
                        `circle(${endRadius}px at ${x}px ${y}px)`,
                    ],
                },
                {
                    duration: 500,
                    easing: "ease-in-out",
                    pseudoElement: "::view-transition-new(root)",
                }
            );
        });
    };

    return (
        <button
            onClick={handleToggle}
            className={cn(
                "relative flex items-center justify-center transition-all duration-300 outline-none",
                "w-11 h-11 rounded-full",
                "shadow-[0_4px_16px_rgba(0,0,0,0.1)] hover:shadow-[0_6px_24px_rgba(0,0,0,0.15)] focus:ring-2 focus:ring-blue-500/50 focus:ring-offset-2",
                isDark 
                    ? "bg-slate-800 text-amber-400 border border-slate-700" 
                    : "bg-white text-slate-800 border border-slate-100 dark:focus:ring-offset-slate-900"
            )}
            title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
        >
            <div className={cn(
                "transition-transform duration-500",
                isDark ? "rotate-0 scale-100" : "-rotate-[15deg] scale-100"
            )}>
                {isDark ? (
                    <Sun size={22} strokeWidth={2.5} />
                ) : (
                    <MoonStar size={22} strokeWidth={2.5} />
                )}
            </div>
        </button>
    );
};

export default ThemeSwitcher;
