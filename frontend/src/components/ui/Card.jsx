import { cn } from "../../utils/cn";

const Card = ({ children, className, glass = false }) => {
    return (
        <div className={cn(
            "rounded-2xl p-6 shadow-sm",
            glass ? "glass" : "bg-white border border-slate-200",
            className
        )}>
            {children}
        </div>
    );
};

export default Card;
