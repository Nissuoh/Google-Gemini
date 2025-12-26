
export type Role = 'user' | 'model';
export type MessageType = 'text' | 'code';

export interface Message {
  role: Role;
  content: string;
  type?: MessageType;
  id: string; // Added ID for React keys
  timestamp: number;
}

export interface CategoryProgress {
  level: number;
  xp: number;
}

export interface LanguageProgress {
  completedModules: number[];
  [category: string]: CategoryProgress | number[]; 
}

export interface UserProgress {
  [languageKey: string]: LanguageProgress;
}

// Debugger Types
export interface DebuggerVariable {
  name: string;
  value: string;
  type: string;
}

export interface DebuggerState {
  line: number;
  variables: DebuggerVariable[];
  callstack: string[];
  output: string;
  reason: string;
  isFinished: boolean;
}

// Action Types from LLM
export interface EditorAction {
  action: 'WRITE_CODE';
  code: string;
}

export interface DebugAction {
  action: 'DEBUG_STEP';
  state: DebuggerState;
}

export type AIAction = EditorAction | DebugAction;
