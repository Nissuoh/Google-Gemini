
import React from 'react';

interface OutputPanelProps {
  output: string;
}

const OutputPanel: React.FC<OutputPanelProps> = ({ output }) => {
  return (
    <div className="flex flex-col h-full bg-[#0c0c0c] border border-gray-700 rounded-lg shadow-inner overflow-hidden">
       <div className="flex items-center gap-2 px-3 py-1.5 bg-[#1a1a1a] border-b border-gray-700">
        <div className="flex gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-red-500/50"></div>
          <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/50"></div>
          <div className="w-2.5 h-2.5 rounded-full bg-green-500/50"></div>
        </div>
        <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest ml-2">Terminal Output</span>
       </div>
       <div className="flex-1 p-4 font-mono text-sm overflow-y-auto custom-scrollbar">
        {output ? (
          <div className="animate-in fade-in slide-in-from-bottom-1 duration-300">
             <pre className="text-blue-300/90 whitespace-pre-wrap leading-relaxed selection:bg-blue-500/30">
               {output}
             </pre>
             <span className="inline-block w-2 h-4 bg-emerald-500 animate-pulse ml-1 align-middle"></span>
          </div>
        ) : (
          <div className="flex flex-col gap-1 text-gray-600">
             <p className="flex items-center gap-2">
               <span className="text-emerald-500">➜</span>
               <span className="text-blue-400">~/akademie</span>
               <span className="text-gray-500">git:(master)</span>
             </p>
             <p className="flex items-center gap-2">
               <span className="text-gray-500">System bereit. Warte auf Code-Ausführung...</span>
             </p>
          </div>
        )}
       </div>
    </div>
  );
};

export default OutputPanel;
