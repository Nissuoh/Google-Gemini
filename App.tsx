
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import { UserProgress, LanguageProgress, CategoryProgress, DebuggerState } from './types';
import { LANGUAGES } from './constants';
import { findCategoryForModule } from './utils';
import { useLocalStorage, useGeminiChat } from './hooks';

import ChatMessage from './components/ChatMessage';
import Sidebar from './components/Sidebar';
import CodeEditor from './components/CodeEditor';
import OutputPanel from './components/OutputPanel';
import Toast from './components/Toast';
import DebuggerControls from './components/DebuggerControls';
import DebuggerPanel from './components/DebuggerPanel';
import SettingsModal from './components/SettingsModal';
import { SettingsIcon, ModelIcon } from './components/Icons';

// --- Constants ---
const XP_PER_MODULE = 100;
const XP_PER_LEVEL = 300;
const MAX_LEVEL = 10;
const PROGRESS_STORAGE_KEY = 'professorAcademyProgress_v2';

const App: React.FC = () => {
  // Global State
  const [userProgress, setUserProgress] = useLocalStorage<UserProgress>(PROGRESS_STORAGE_KEY, {});
  const [selectedLanguage, setSelectedLanguage] = useState<string | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'levelup' } | null>(null);

  // Editor & Module State
  const [codeInput, setCodeInput] = useState<string>('');
  const [activeModule, setActiveModule] = useState<number | null>(null);
  const [showContinueButton, setShowContinueButton] = useState<boolean>(false);
  const [taskVersion, setTaskVersion] = useState<number>(0);
  
  // Debugger State
  const [isDebugging, setIsDebugging] = useState(false);
  const [debuggerState, setDebuggerState] = useState<DebuggerState | null>(null);
  const [activeRightPanelTab, setActiveRightPanelTab] = useState<'tutor' | 'debugger'>('tutor');
  
  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const codeFormRef = useRef<HTMLFormElement>(null);
  const justLeveledUpRef = useRef<{category: string, newLevel: number} | null>(null);
  const [chatInput, setChatInput] = useState('');

  // Derived Data
  const langConfig = selectedLanguage ? LANGUAGES[selectedLanguage as keyof typeof LANGUAGES] : null;
  const prismLang = langConfig?.prismLang || 'text';

  // --- Chat Hook ---
  const { 
      messages, 
      sendMessage, 
      isLoading, 
      streamOutput, 
      stopGeneration, 
      clearMessages,
      parsedAction,
      setParsedAction
  } = useGeminiChat({
      systemInstruction: langConfig?.systemPrompt || ''
  });

  // --- Effects ---

  // 1. Auto-scroll to bottom of chat
  useEffect(() => {
    if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, streamOutput]);

  // 2. Handle Actions (Code Write / Debug) from AI
  useEffect(() => {
      if (parsedAction) {
          if (parsedAction.action === 'WRITE_CODE') {
              const newCode = parsedAction.code.trim();
              if (newCode) {
                  // If the code contains a task marker, we replace the editor content and update taskVersion
                  if (newCode.includes('🎯 AUFGABE') || newCode.includes('TASK:')) {
                      setCodeInput(newCode);
                      setTaskVersion(v => v + 1); // Trigger editor focus jump
                  } else {
                      // Otherwise append or smart-merge (no focus jump)
                      setCodeInput(prev => {
                          if (!prev.trim()) return newCode;
                          if (prev.includes(newCode.substring(0, 30))) return prev;
                          return `${prev}\n\n${newCode}`;
                      });
                  }
              }
              setShowContinueButton(false);
          } else if (parsedAction.action === 'DEBUG_STEP') {
              setDebuggerState(parsedAction.state);
              if (parsedAction.state.isFinished) {
                  setIsDebugging(false);
              }
          }
          setParsedAction(null);
      }
  }, [parsedAction, setParsedAction]);

  // 3. Detect "Continue" prompt in text
  useEffect(() => {
      const lastMsg = messages[messages.length - 1];
      if (lastMsg?.role === 'model' && !isLoading) {
          if (lastMsg.content.includes("Bereit für den nächsten kleinen Schritt?") || 
              lastMsg.content.includes("Weiter?")) {
              setShowContinueButton(true);
          }
      }
  }, [messages, isLoading]);

  // --- Handlers ---

  const handleLanguageSelect = (langKey: string) => {
      setSelectedLanguage(langKey);
      clearMessages();
      setCodeInput('');
      setActiveModule(null);
      setDebuggerState(null);
      setIsDebugging(false);
      setTaskVersion(0);
      
      if (!userProgress[langKey]) {
          const langConf = LANGUAGES[langKey as keyof typeof LANGUAGES];
          const initialLangProgress: LanguageProgress = {
              completedModules: [],
              ...langConf.categories.reduce((acc, cat) => {
                  acc[cat.category] = { level: 1, xp: 0 };
                  return acc;
              }, {} as {[key: string]: CategoryProgress})
          };
          setUserProgress(prev => ({ ...prev, [langKey]: initialLangProgress }));
      }
      
      setTimeout(() => {
         sendMessage(LANGUAGES[langKey as keyof typeof LANGUAGES].initialPrompt);
      }, 100);
  };

  const handleModuleSelect = (moduleId: number, moduleTitle: string) => {
      if (isLoading) return;
      setActiveModule(moduleId);
      clearMessages();
      setCodeInput('');
      setDebuggerState(null);
      sendMessage(`Ich möchte mit Modul ${moduleId} beginnen: "${moduleTitle}". Bitte stelle mir die erste Aufgabe direkt im Editor.`);
  };

  const handleRunCode = (e: React.FormEvent) => {
      e.preventDefault();
      if (isLoading || !codeInput.trim()) return;
      sendMessage(codeInput, 'code');
  };

  const handleModuleComplete = (moduleId: number) => {
      if (!selectedLanguage) return;
      setUserProgress(prev => {
          const newProgress = { ...prev };
          const langProg = newProgress[selectedLanguage];
          
          if (!langProg.completedModules.includes(moduleId)) {
              langProg.completedModules.push(moduleId);
              
              const categoryName = findCategoryForModule(selectedLanguage, moduleId);
              if (categoryName) {
                  const catProg = langProg[categoryName] as CategoryProgress;
                  if (catProg.level < MAX_LEVEL) {
                      catProg.xp += XP_PER_MODULE;
                      if (catProg.xp >= XP_PER_LEVEL) {
                          catProg.level++;
                          catProg.xp = 0;
                          justLeveledUpRef.current = { category: categoryName, newLevel: catProg.level };
                      }
                  }
              }
              setToast({ message: "Modul abgeschlossen!", type: 'success' });
          }
          return newProgress;
      });
  };

  const handleContinue = () => {
     if (!activeModule) return;
     handleModuleComplete(activeModule);
     setShowContinueButton(false);
     
     let msg = "Weiter zur nächsten Aufgabe!";
     if (justLeveledUpRef.current) {
         msg += ` (Level-Up: Stufe ${justLeveledUpRef.current.newLevel} erreicht!)`;
         setToast({ message: `Aufstieg auf Stufe ${justLeveledUpRef.current.newLevel}!`, type: 'levelup' });
         justLeveledUpRef.current = null;
     }
     sendMessage(msg);
  };

  const handleChatSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (!chatInput.trim() || isLoading) return;
      sendMessage(chatInput, 'text', codeInput);
      setChatInput('');
  };

  const startDebugging = () => {
      setIsDebugging(true);
      setActiveRightPanelTab('debugger');
      setDebuggerState(null);
      sendMessage(`(System: Debug-Modus für diesen Code:\n\`\`\`${prismLang}\n${codeInput}\n\`\`\`)`);
  };

  const stepDebugger = () => {
      if (!debuggerState) return;
      sendMessage(`(System: DEBUG_STEP. Status: ${JSON.stringify(debuggerState)})`);
  };

  const stopDebugging = () => {
      setIsDebugging(false);
      setDebuggerState(null);
      setActiveRightPanelTab('tutor');
      sendMessage("(System: Debugging beendet.)");
  };

  const currentCategoryName = activeModule && selectedLanguage ? findCategoryForModule(selectedLanguage, activeModule) : null;
  const currentCategoryProgress = (selectedLanguage && currentCategoryName && userProgress[selectedLanguage])
      ? userProgress[selectedLanguage][currentCategoryName] as CategoryProgress
      : null;

  const handleEditorKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        codeFormRef.current?.requestSubmit();
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-900 text-gray-200 font-mono overflow-hidden">
       {toast && <Toast message={toast.message} type={toast.type} onDismiss={() => setToast(null)} />}
       
       <SettingsModal 
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
          onResetLanguage={() => {
              if(selectedLanguage) {
                  const newP = {...userProgress};
                  delete newP[selectedLanguage];
                  setUserProgress(newP);
                  handleLanguageSelect(selectedLanguage);
              }
          }}
          onResetAll={() => {
              setUserProgress({});
              setSelectedLanguage(null);
          }}
          currentLanguage={langConfig?.name || null}
       />

       <header className="h-14 bg-gray-800 border-b border-gray-700 flex items-center justify-between px-4 shadow-sm z-10">
           <div className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">
               Akademie der Professoren
           </div>
           <button onClick={() => setIsSettingsOpen(true)} className="text-gray-400 hover:text-white transition-colors">
               <SettingsIcon />
           </button>
       </header>

       <main className="flex-1 flex overflow-hidden relative main-grid-bg">
          <PanelGroup direction="horizontal" autoSaveId="main-layout">
            <Panel defaultSize={20} minSize={15} maxSize={30} className="min-w-[240px] bg-gray-800/80 backdrop-blur-sm border-r border-gray-700">
                <Sidebar 
                   selectedLanguage={selectedLanguage}
                   onLanguageSelect={handleLanguageSelect}
                   onBackToLanguageSelect={() => setSelectedLanguage(null)}
                   onModuleSelect={handleModuleSelect}
                   activeModule={activeModule}
                   userProgress={userProgress}
                   isLoading={isLoading}
                   xpPerLevel={XP_PER_LEVEL}
                   maxLevel={MAX_LEVEL}
                />
            </Panel>
            
            <PanelResizeHandle className="w-1 bg-gray-700 hover:bg-blue-500 transition-colors resize-handle" />

            {selectedLanguage ? (
                <>
                  <Panel defaultSize={50} minSize={30}>
                      <PanelGroup direction="vertical">
                          <Panel defaultSize={60} minSize={20} className="flex flex-col p-4 pb-0">
                              <form ref={codeFormRef} onSubmit={handleRunCode} className="flex-1 flex flex-col gap-2 h-full min-h-0">
                                  <div className="flex justify-between items-center text-xs text-gray-400 uppercase tracking-widest px-1">
                                      <span>Editor ({langConfig?.name})</span>
                                      <span>Ctrl + Enter to Run</span>
                                  </div>
                                  <CodeEditor 
                                      value={codeInput}
                                      onChange={setCodeInput}
                                      onKeyDown={handleEditorKeyDown}
                                      language={prismLang}
                                      highlightedLine={debuggerState?.line}
                                      disabled={isDebugging && isLoading}
                                      placeholder="// Aufgaben erscheinen hier..."
                                      taskVersion={taskVersion}
                                  />
                                  <div className="flex gap-2 py-2 h-12 flex-shrink-0">
                                      {!isDebugging ? (
                                          <>
                                            <button 
                                                type="submit" 
                                                disabled={isLoading || !codeInput.trim()}
                                                className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-md shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                                            >
                                                {isLoading ? 'Analysiere...' : '▶ Ausführen'}
                                            </button>
                                            <button 
                                                type="button"
                                                onClick={startDebugging}
                                                disabled={isLoading || !codeInput.trim()}
                                                className="px-4 bg-gray-700 hover:bg-blue-600 text-white rounded-md border border-gray-600 transition-all disabled:opacity-50"
                                            >
                                                🐞 Debug
                                            </button>
                                          </>
                                      ) : (
                                          <DebuggerControls 
                                              onStep={stepDebugger} 
                                              onStop={stopDebugging} 
                                              isStepping={isLoading} 
                                          />
                                      )}
                                  </div>
                              </form>
                          </Panel>
                          
                          <PanelResizeHandle className="h-1 bg-gray-700 hover:bg-blue-500 transition-colors resize-handle" />
                          
                          <Panel defaultSize={40} minSize={10} className="p-4 pt-0">
                              <OutputPanel output={
                                  (() => {
                                      const lastModelMsg = [...messages].reverse().find(m => m.role === 'model' && m.content.includes('```text'));
                                      if (lastModelMsg) {
                                          const match = lastModelMsg.content.match(/```text\s*([\s\S]*?)(?:```|$)/);
                                          return match ? match[1] : '';
                                      }
                                      return streamOutput.match(/```text\s*([\s\S]*?)(?:```|$)/)?.[1] || debuggerState?.output || '';
                                  })()
                              } />
                          </Panel>
                      </PanelGroup>
                  </Panel>

                  <PanelResizeHandle className="w-1 bg-gray-700 hover:bg-blue-500 transition-colors resize-handle" />

                  <Panel defaultSize={30} minSize={20} className="bg-gray-800/50 flex flex-col border-l border-gray-700">
                      <div className="flex border-b border-gray-700 bg-gray-800">
                          <button 
                             onClick={() => setActiveRightPanelTab('tutor')}
                             className={`flex-1 py-3 text-sm font-bold border-b-2 transition-colors ${activeRightPanelTab === 'tutor' ? 'border-emerald-500 text-emerald-400' : 'border-transparent text-gray-400 hover:text-gray-200'}`}
                          >
                              KI-Tutor
                          </button>
                          <button 
                             onClick={() => setActiveRightPanelTab('debugger')}
                             className={`flex-1 py-3 text-sm font-bold border-b-2 transition-colors ${activeRightPanelTab === 'debugger' ? 'border-blue-500 text-blue-400' : 'border-transparent text-gray-400 hover:text-gray-200'}`}
                          >
                              Debugger
                          </button>
                      </div>

                      <div className="flex-1 overflow-hidden relative">
                          {activeRightPanelTab === 'tutor' ? (
                              <div className="h-full flex flex-col">
                                  <div className="flex-1 overflow-y-auto p-4 space-y-2">
                                      {messages.map((msg) => (
                                          <ChatMessage 
                                              key={msg.id}
                                              message={msg}
                                              language={prismLang}
                                              currentCategoryProgress={currentCategoryProgress}
                                              xpPerLevel={XP_PER_LEVEL}
                                          />
                                      ))}
                                      {streamOutput && (
                                          <div className="animate-pulse text-emerald-400/70 text-sm p-2 font-mono">
                                              ▋ {streamOutput.slice(-50)}
                                          </div>
                                      )}
                                      <div ref={messagesEndRef} />
                                  </div>
                                  
                                  <div className="p-3 bg-gray-800 border-t border-gray-700">
                                      {showContinueButton && !isLoading && (
                                          <button 
                                              onClick={handleContinue}
                                              className="w-full mb-3 py-2 bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-500 hover:to-emerald-500 text-white font-bold rounded-md shadow-lg transition-all"
                                          >
                                              Nächste Lektion starten ✨
                                          </button>
                                      )}
                                      
                                      <form onSubmit={handleChatSubmit} className="flex gap-2">
                                          <input 
                                              value={chatInput}
                                              onChange={e => setChatInput(e.target.value)}
                                              placeholder="Frage stellen..."
                                              disabled={isLoading}
                                              className="flex-1 bg-gray-900 border border-gray-600 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-emerald-500 transition-all"
                                          />
                                          {isLoading ? (
                                              <button type="button" onClick={stopGeneration} className="p-2 bg-red-500/20 text-red-400 border border-red-500/50 rounded-md">■</button>
                                          ) : (
                                            <button type="submit" disabled={!chatInput.trim()} className="p-2 bg-blue-600 text-white rounded-md">➤</button>
                                          )}
                                      </form>
                                  </div>
                              </div>
                          ) : (
                              <DebuggerPanel debuggerState={debuggerState} />
                          )}
                      </div>
                  </Panel>
                </>
            ) : (
                <Panel className="flex items-center justify-center bg-gray-900">
                    <div className="text-center max-w-lg px-6 animate-fade-in">
                        <div className="w-24 h-24 bg-gray-800 rounded-full mx-auto mb-6 flex items-center justify-center border border-gray-700 shadow-[0_0_30px_rgba(33,150,243,0.2)]">
                            <ModelIcon />
                        </div>
                        <h2 className="text-3xl font-bold text-gray-100 mb-4">Willkommen in der Akademie</h2>
                        <p className="text-gray-400 text-lg mb-8">
                            Wähle eine Programmiersprache aus der linken Leiste, um deine interaktive Lernreise zu beginnen. Alle Aufgaben erscheinen direkt im Editor.
                        </p>
                    </div>
                </Panel>
            )}
          </PanelGroup>
       </main>
    </div>
  );
};

export default App;
