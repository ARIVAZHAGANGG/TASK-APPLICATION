import { cn } from "../../utils/cn";

const Textarea = ({ label, error, className, ...props }) => {
    return (
        <div className="w-full space-y-1">
            <div className="floating-label-group relative">
                <textarea
                    placeholder=" "
                    className={cn(
                        "floating-input min-h-[120px] py-4 resize-none",
                        error && "border-red-500/50 focus:ring-red-500/10",
                        className
                    )}
                    {...props}
                />
                {label && <label className="floating-label !top-4 peer-focus:!top-[-10px] peer-[:not(:placeholder-shown)]:!top-[-10px]">{label}</label>}
            </div>
            {error && <p className="text-[10px] font-black uppercase tracking-tight text-red-400 ml-4 mt-1 opacity-80">{error}</p>}
        </div>
    );
};

export default Textarea;
