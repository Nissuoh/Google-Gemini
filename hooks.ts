
import { useState, useEffect, useCallback, useRef } from 'react';
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { Message, AIAction } from "./types";
import { withRetry, handleApiError, generateId } from "./utils";

/**
 * Custom hook for type-safe localStorage management.
 * Persists the user's progress and language settings.
 */
export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T | ((val: T) => T)) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return initialValue;
    }
  });

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error('Error writing to localStorage:', error);
    }
  };

  return [storedValue, setValue];
}

interface UseGeminiChatProps {
    systemInstruction: string;
}

/**
 * Hook to manage Gemini 3 Flash interactions with optimized Sequential Thinking.
 * Gemini 3 Flash offers high speed while supporting thinkingConfig for reasoning.
 */
export function useGeminiChat({ systemInstruction }: UseGeminiChatProps) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [streamOutput, setStreamOutput] = useState<string>('');
    const abortControllerRef = useRef<AbortController | null>(null);
    const [parsedAction, setParsedAction] = useState<AIAction | null>(null);

    const stopGeneration = useCallback(() => {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
            abortControllerRef.current = null;
            setIsLoading(false);
            if (streamOutput) {
                 setMessages(prev => [...prev, { 
                    role: 'model', 
                    content: streamOutput + "\n\n*Unterbrochen vom Benutzer.*", 
                    id: generateId(), 
                    timestamp: Date.now() 
                }]);
                setStreamOutput('');
            }
        }
    }, [streamOutput]);

    const clearMessages = useCallback(() => {
        setMessages([]);
        setStreamOutput('');
        setParsedAction(null);
    }, []);

    const sendMessage = useCallback(async (userContent: string, type: 'text' | 'code' = 'text', contextCode: string = '') => {
        // Accessing the API key exclusively from process.env.API_KEY as per instructions
        const apiKey = process.env.API_KEY;
        if (!apiKey) {
            console.error("API Key not found in environment variables.");
            return;
        }

        const userMsg: Message = { 
            role: 'user', 
            content: userContent, 
            type, 
            id: generateId(), 
            timestamp: Date.now() 
        };
        setMessages(prev => [...prev, userMsg]);
        setIsLoading(true);
        setStreamOutput('');
        setParsedAction(null);

        let fullPrompt = userContent;
        if (type === 'code') {
            fullPrompt = `Der Benutzer hat folgenden Code ausgeführt:\n\`\`\`\n${userContent}\n\`\`\`\nBitte gib Feedback und simuliere die Ausgabe.`;
        } else if (contextCode.trim()) {
            fullPrompt = `Benutzer-Kontext (Code im Editor):\n\`\`\`\n${contextCode}\n\`\`\`\n\nFrage des Benutzers: ${userContent}`;
        }

        abortControllerRef.current = new AbortController();
        const ai = new GoogleGenAI({ apiKey });
        
        try {
            // Using gemini-3-flash-preview for maximum speed and efficient reasoning
            const response = await ai.models.generateContentStream({
                model: 'gemini-3-flash-preview',
                contents: [
                    ...messages.map(m => ({
                        role: m.role,
                        parts: [{ text: m.content }]
                    })),
                    { role: 'user', parts: [{ text: fullPrompt }] }
                ],
                config: { 
                    systemInstruction,
                    // Reduced thinking budget to prioritize speed while maintaining pedagogical planning
                    thinkingConfig: { thinkingBudget: 1024 } 
                },
            });

            let accumulatedText = '';
            let lastActionIndex = -1;
            
            for await (const chunk of response) {
                if (abortControllerRef.current?.signal.aborted) break;

                const text = chunk.text;
                if (text) {
                  accumulatedText += text;
                  setStreamOutput(accumulatedText);

                  // Robust Action Extraction (even for partial JSON structures)
                  const actionRegex = /```json:(?:prof-\w+-action|prof-action)\s*({[\s\S]*?})\s*```/g;
                  let match;
                  while ((match = actionRegex.exec(accumulatedText)) !== null) {
                      if (match.index > lastActionIndex) {
                          try {
                              const actionData = JSON.parse(match[1]);
                              setParsedAction(actionData);
                              lastActionIndex = match.index;
                          } catch (e) {
                              // Expected during partial stream parsing
                          }
                      }
                  }
                }
            }

            setMessages(prev => [...prev, { 
                role: 'model', 
                content: accumulatedText, 
                id: generateId(), 
                timestamp: Date.now() 
            }]);
            setStreamOutput('');

        } catch (error: any) {
            if (error.name !== 'AbortError') {
                const errorMsg = handleApiError(error);
                setMessages(prev => [...prev, { 
                    role: 'model', 
                    content: errorMsg, 
                    id: generateId(), 
                    timestamp: Date.now() 
                }]);
            }
        } finally {
            setIsLoading(false);
            abortControllerRef.current = null;
        }

    }, [messages, systemInstruction]);

    return {
        messages,
        isLoading,
        streamOutput,
        sendMessage,
        stopGeneration,
        clearMessages,
        parsedAction,
        setParsedAction
    };
}
