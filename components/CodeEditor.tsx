
import React, { useRef, useEffect, useState } from 'react';
import Editor from 'react-simple-code-editor';
import Prism from 'prismjs';

// Import languages
import 'prismjs/components/prism-clike';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-java';
import 'prismjs/components/prism-c';
import 'prismjs/components/prism-cpp';
import 'prismjs/components/prism-csharp';
import 'prismjs/components/prism-css';
import 'prismjs/components/prism-markup';
import 'prismjs/components/prism-bash';
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-sql';
import 'prismjs/components/prism-rust';
import 'prismjs/components/prism-go';
import 'prismjs/components/prism-lua';
import 'prismjs/components/prism-swift';
import 'prismjs/components/prism-ruby';

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  language: string;
  placeholder?: string;
  disabled?: boolean;
  highlightedLine?: number | null;
  taskVersion?: number;
}

const CodeEditor: React.FC<CodeEditorProps> = ({ 
    value, onChange, onKeyDown, language, placeholder, disabled, highlightedLine, taskVersion = 0
}) => {
  const editorRef = useRef<any>(null);
  const lineNumbersRef = useRef<HTMLDivElement>(null);
  const [isFocused, setIsFocused] = useState(false);

  const pairs: Record<string, string> = {
    '(': ')',
    '[': ']',
    '{': '}',
    '"': '"',
    "'": "'",
  };

  const handleScroll = (e: React.UIEvent<HTMLTextAreaElement>) => {
      if (lineNumbersRef.current) {
          lineNumbersRef.current.scrollTop = e.currentTarget.scrollTop;
      }
  };

  // Improved focus logic to jump into the empty line below the marker
  useEffect(() => {
    if (taskVersion > 0 && value.includes('🎯 AUFGABE')) {
        const anchors = ['# DEIN CODE HIER:', '// DEIN CODE HIER:', '/* DEIN CODE HIER: */'];
        let foundAnchor = null;
        let index = -1;

        for (const anchor of anchors) {
            index = value.indexOf(anchor);
            if (index !== -1) {
                foundAnchor = anchor;
                break;
            }
        }

        if (foundAnchor && editorRef.current?._input) {
            const textarea = editorRef.current._input;
            
            // We want to land on the next line. 
            // We look for the first newline after the anchor.
            const searchSlice = value.substring(index);
            const firstNewlineAfterAnchor = searchSlice.indexOf('\n');
            
            let targetPos;
            if (firstNewlineAfterAnchor !== -1) {
                // Pos is index + offset to newline + 1 (start of next line)
                targetPos = index + firstNewlineAfterAnchor + 1;
            } else {
                // Fallback: end of anchor
                targetPos = index + foundAnchor.length;
            }
            
            setTimeout(() => {
                textarea.focus();
                textarea.setSelectionRange(targetPos, targetPos);
                
                // Scroll to the bottom to make sure the "DEIN CODE" part is visible
                textarea.scrollTop = textarea.scrollHeight;
            }, 100);
        }
    }
  }, [taskVersion]);

  const highlight = (code: string) => {
      const grammar = Prism.languages[language] || Prism.languages.clike;
      return Prism.highlight(code, grammar, language);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
      onKeyDown(e as React.KeyboardEvent<HTMLTextAreaElement>);
      if (e.defaultPrevented) return;

      const textarea = e.currentTarget as HTMLTextAreaElement;
      const { selectionStart, selectionEnd, value: textareaValue } = textarea;
      
      // Auto-Closing Pairs and Selection Wrapping
      if (pairs[e.key]) {
          e.preventDefault();
          const open = e.key;
          const close = pairs[open];
          const selectedText = textareaValue.substring(selectionStart, selectionEnd);
          
          const newValue = textareaValue.substring(0, selectionStart) + 
                           open + selectedText + close + 
                           textareaValue.substring(selectionEnd);
          
          onChange(newValue);
          
          requestAnimationFrame(() => {
              if (editorRef.current?._input) {
                  const newStart = selectionStart + 1;
                  const newEnd = selectionStart + 1 + selectedText.length;
                  editorRef.current._input.setSelectionRange(newStart, newEnd);
              }
          });
          return;
      }

      // Smart Overwrite for closing characters
      const closingChars = Object.values(pairs);
      if (closingChars.includes(e.key) && selectionStart === selectionEnd) {
          const nextChar = textareaValue.charAt(selectionStart);
          if (nextChar === e.key) {
              e.preventDefault();
              const newPos = selectionStart + 1;
              textarea.setSelectionRange(newPos, newPos);
              return;
          }
      }

      // Smart Backspace
      if (e.key === 'Backspace' && selectionStart === selectionEnd && selectionStart > 0) {
          const charBefore = textareaValue.charAt(selectionStart - 1);
          const charAfter = textareaValue.charAt(selectionStart);
          
          if (pairs[charBefore] && pairs[charBefore] === charAfter) {
              e.preventDefault();
              const newValue = textareaValue.substring(0, selectionStart - 1) + 
                               textareaValue.substring(selectionStart + 1);
              onChange(newValue);
              requestAnimationFrame(() => {
                  const newPos = selectionStart - 1;
                  editorRef.current?._input?.setSelectionRange(newPos, newPos);
              });
              return;
          }
      }

      // Enter & Auto-Indent
      if (e.key === 'Enter') {
          e.preventDefault();
          const beforeCursor = textareaValue.substring(0, selectionStart);
          const linesBefore = beforeCursor.split('\n');
          const currentLine = linesBefore[linesBefore.length - 1] || '';
          const trimmedLine = currentLine.trim();
          
          const indentMatch = currentLine.match(/^(\s*)/);
          let indent = indentMatch ? indentMatch[1] : '';
          
          // Only add extra indent if the line is NOT a comment and ends in a block character
          const isComment = trimmedLine.startsWith('#') || trimmedLine.startsWith('//') || trimmedLine.startsWith('/*');
          
          if (!isComment && (trimmedLine.endsWith('{') || trimmedLine.endsWith(':'))) {
              indent += '    ';
          }

          const newValue = textareaValue.substring(0, selectionStart) + '\n' + indent + textareaValue.substring(selectionEnd);
          onChange(newValue);
          
          requestAnimationFrame(() => {
             if (editorRef.current?._input) {
                 const newPos = selectionStart + 1 + indent.length;
                 editorRef.current._input.setSelectionRange(newPos, newPos);
             }
          });
      }

      // Tab handling
      if (e.key === 'Tab') {
          e.preventDefault();
          const newValue = textareaValue.substring(0, selectionStart) + '    ' + textareaValue.substring(selectionEnd);
          onChange(newValue);
          requestAnimationFrame(() => {
              if (editorRef.current?._input) {
                  const newPos = selectionStart + 4;
                  editorRef.current._input.setSelectionRange(newPos, newPos);
              }
           });
      }
  };

  const lineCount = value.split('\n').length;
  const lines = Array.from({ length: Math.max(lineCount, 1) }, (_, i) => i + 1);

  return (
    <div className={`relative code-editor-wrapper bg-gray-800 rounded-lg border transition-all duration-300 flex-grow flex overflow-hidden min-h-0 ${isFocused ? 'border-emerald-500 shadow-glow-emerald' : 'border-gray-600'}`}>
      
      {highlightedLine && (
        <div
          className="absolute bg-yellow-500/10 border-l-2 border-yellow-500 pointer-events-none transition-all duration-200"
          style={{
            top: `${16 + (highlightedLine - 1) * 24}px`, 
            left: '3rem',
            right: 0,
            height: '24px',
            zIndex: 5
          }}
        />
      )}

      <div 
        ref={lineNumbersRef}
        className="flex-shrink-0 w-12 bg-gray-900 text-right text-gray-500 select-none font-mono text-sm line-numbers border-r border-gray-700 overflow-hidden z-10"
        aria-hidden="true"
      >
        {lines.map(line => (
            <div key={line} className={`px-2 h-[24px] flex items-center justify-end ${highlightedLine === line ? 'text-yellow-400 font-bold' : ''}`}>
                {line}
            </div>
        ))}
      </div>

      <div className="flex-grow relative overflow-auto custom-scrollbar">
          <Editor
            ref={editorRef}
            value={value}
            onValueChange={onChange}
            highlight={highlight}
            padding={16}
            placeholder={placeholder}
            disabled={disabled}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            textareaProps={{
                onScroll: handleScroll,
                spellCheck: false,
                autoCapitalize: 'none',
                autoCorrect: 'off',
            }}
            style={{
                fontFamily: '"Fira Code", monospace',
                fontSize: 14,
                lineHeight: '24px',
                minHeight: '100%',
                minWidth: '100%',
                backgroundColor: 'transparent',
            }}
          />
      </div>
    </div>
  );
};

export default CodeEditor;
