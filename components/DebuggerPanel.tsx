import React from 'react';
import { DebuggerState } from '../types';

const DebuggerPanel: React.FC<{ debuggerState: DebuggerState | null }> = ({ debuggerState }) => {
    if (!debuggerState) {
        return <div className="p-4 text-gray-500">Starte eine Debug-Sitzung, um den Code-Zustand zu sehen.</div>;
    }

    const { variables, callstack, reason } = debuggerState;

    return (
        <div className="flex flex-col h-full overflow-y-auto">
            <div className="p-3">
                <h4 className="text-sm font-bold text-emerald-400 uppercase tracking-wider mb-2">Letzter Schritt</h4>
                <p className="text-sm text-gray-300 bg-gray-900/50 p-2 rounded-md">{reason || 'Keine Aktion.'}</p>
            </div>
            <div className="p-3 border-t border-gray-700">
                <h4 className="text-sm font-bold text-emerald-400 uppercase tracking-wider mb-2">Variablen</h4>
                {variables.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="text-gray-400">
                                <tr>
                                    <th className="p-1.5 font-semibold">Name</th>
                                    <th className="p-1.5 font-semibold">Typ</th>
                                    <th className="p-1.5 font-semibold">Wert</th>
                                </tr>
                            </thead>
                            <tbody>
                                {variables.map((v, i) => (
                                    <tr key={i} className="border-t border-gray-700">
                                        <td className="p-1.5 text-blue-400 font-mono">{v.name}</td>
                                        <td className="p-1.5 text-yellow-400 font-mono">{v.type}</td>
                                        <td className="p-1.5 text-emerald-300 font-mono">{v.value}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <p className="text-sm text-gray-500">Keine Variablen im aktuellen Scope.</p>
                )}
            </div>
             <div className="p-3 border-t border-gray-700">
                <h4 className="text-sm font-bold text-emerald-400 uppercase tracking-wider mb-2">Call Stack</h4>
                {callstack.length > 0 ? (
                   <ul className="space-y-1">
                        {callstack.map((c, i) => (
                            <li key={i} className="text-sm text-gray-300 font-mono bg-gray-900/50 p-1.5 rounded-md">
                                {c}
                            </li>
                        ))}
                   </ul>
                ) : (
                    <p className="text-sm text-gray-500">Call Stack ist leer.</p>
                )}
            </div>
        </div>
    );
};

export default DebuggerPanel;
