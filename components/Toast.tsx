import React, { useEffect } from 'react';

const Toast: React.FC<{ message: string; type: 'success' | 'levelup'; onDismiss: () => void }> = ({ message, type, onDismiss }) => {
    useEffect(() => {
        const timer = setTimeout(onDismiss, 4000);
        return () => clearTimeout(timer);
    }, [onDismiss]);

    const colors = {
        success: 'from-blue-500 to-emerald-500',
        levelup: 'from-yellow-500 to-orange-500',
    };
    const icon = type === 'levelup' ? '⭐' : '✅';

    return (
        <div className={`fixed top-5 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 p-3 px-4 rounded-lg shadow-2xl bg-gray-800 border border-gray-600 animate-fade-in`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-lg bg-gradient-to-br ${colors[type]}`}>
                {icon}
            </div>
            <p className="text-white font-semibold">{message}</p>
        </div>
    );
};

export default Toast;
