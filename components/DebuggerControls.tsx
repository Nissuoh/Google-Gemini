import React from 'react';

const DebuggerControls: React.FC<{
    onStep: () => void;
    onStop: () => void;
    isStepping: boolean;
}> = ({ onStep, onStop, isStepping }) => (
    <div className="flex items-center gap-2">
        <button
            onClick={onStep}
            disabled={isStepping}
            className="p-2 w-auto h-auto flex-shrink-0 flex items-center justify-center bg-blue-600 text-white font-bold rounded-md transition-all shadow-lg shadow-blue-500/20 hover:shadow-glow-blue disabled:opacity-50 disabled:cursor-not-allowed px-4"
        >
            {isStepping ? 'Analysiere...' : 'Nächster Schritt'}
        </button>
        <button
            onClick={onStop}
            disabled={isStepping}
            className="p-2 w-auto h-auto flex-shrink-0 flex items-center justify-center bg-gray-600 text-white font-bold rounded-md transition-all hover:bg-red-500 disabled:opacity-50 disabled:cursor-not-allowed px-4"
        >
            Stopp
        </button>
    </div>
);

export default DebuggerControls;
