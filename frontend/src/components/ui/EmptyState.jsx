const EmptyState = ({ title, description, actionText, onAction, icon: Icon }) => {
    return (
        <div className="flex flex-col items-center justify-center py-16 px-4">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary-500/20 to-primary-600/10 flex items-center justify-center mb-6">
                {Icon && <Icon className="w-12 h-12 text-primary-500" />}
            </div>
            <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
                {title}
            </h3>
            <p className="text-center mb-6 max-w-md" style={{ color: 'var(--text-secondary)' }}>
                {description}
            </p>
            {actionText && onAction && (
                <button
                    onClick={onAction}
                    className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-semibold transition-all hover:scale-105"
                >
                    {actionText}
                </button>
            )}
        </div>
    );
};

export default EmptyState;
