
import React, { useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Message, CategoryProgress } from '../types';
import { UserIcon, ModelIcon } from './Icons';
import CodeBlock from './CodeBlock';
import MasteryRing from './MasteryRing';

interface ChatMessageProps {
  message: Message;
  language: string;
  currentCategoryProgress: CategoryProgress | null;
  xpPerLevel: number;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message, language, currentCategoryProgress, xpPerLevel }) => {
  const { role, content, type } = message;
  const isModel = role === 'model';

  const displayContent = useMemo(() => {
      return content.replace(/```json:(?:prof-\w+-action|prof-action)\s*({[\s\S]*?})\s*```/g, '').trim();
  }, [content]);

  const markdownComponents = useMemo(() => ({
    h1: (props: any) => <h1 className="text-lg font-bold text-emerald-400 mt-4 mb-2 border-b border-emerald-900/30 pb-1" {...props} />,
    h2: (props: any) => <h2 className="text-md font-semibold text-emerald-400/90 mt-3 mb-2" {...props} />,
    p: (props: any) => <p className="mb-3 last:mb-0 leading-relaxed text-gray-300" {...props} />,
    ul: (props: any) => <ul className="list-disc list-outside ml-4 mb-3 space-y-1.5 text-gray-300" {...props} />,
    ol: (props: any) => <ol className="list-decimal list-outside ml-4 mb-3 space-y-1.5 text-gray-300" {...props} />,
    li: (props: any) => <li className="pl-1" {...props} />,
    strong: (props: any) => <strong className="text-emerald-300 font-bold" {...props} />,
    em: (props: any) => <em className="text-blue-300 italic" {...props} />,
    blockquote: (props: any) => <blockquote className="border-l-4 border-blue-500/50 bg-blue-500/5 pl-4 py-2 my-3 rounded-r text-gray-400 italic" {...props} />,
    code({node, className, children, ...props}: any) {
      const match = /language-(\w+)/.exec(className || '')
      return match ? (
        <CodeBlock code={String(children).replace(/\n$/, '')} language={match[1]} />
      ) : (
        <code className="bg-gray-900 text-blue-300 px-1.5 py-0.5 rounded text-xs font-mono border border-gray-700" {...props}>
          {children}
        </code>
      )
    }
  }), []);

  return (
     <div className={`flex items-start gap-3 animate-fade-in ${isModel ? 'justify-start' : 'justify-end'} mb-8`}>
      {isModel && (
        <div className="flex-shrink-0 mt-1">
          {currentCategoryProgress ? (
              <MasteryRing progress={(currentCategoryProgress.xp / xpPerLevel) * 100} level={currentCategoryProgress.level}>
                  <ModelIcon size={20} />
              </MasteryRing>
          ) : (
              <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center border border-gray-700 shadow-xl">
                <ModelIcon size={24} />
              </div>
          )}
        </div>
      )}
      
      <div className={`max-w-[88%] rounded-2xl px-6 py-4 shadow-2xl transition-all duration-300 ${
          isModel 
          ? 'bg-[#1e1e1e] border border-gray-700/50 rounded-tl-none' 
          : 'bg-blue-600 text-white rounded-tr-none shadow-blue-900/20'
      }`}>
          {isModel ? (
            <div className="prose prose-invert max-w-none">
                {displayContent ? (
                   <ReactMarkdown 
                      remarkPlugins={[remarkGfm]}
                      components={markdownComponents}
                    >
                      {displayContent}
                    </ReactMarkdown>
                ) : (
                    <div className="flex items-center gap-3 text-gray-500 py-2">
                        <div className="flex gap-1">
                           <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce" style={{animationDelay: '0ms'}}></span>
                           <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce" style={{animationDelay: '150ms'}}></span>
                           <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce" style={{animationDelay: '300ms'}}></span>
                        </div>
                        <span className="text-xs uppercase tracking-widest font-bold">Professor denkt nach...</span>
                    </div>
                )}
            </div>
          ) : (
            <div className="font-sans leading-relaxed">
              {type === 'code' ? (
                 <div className="mt-2">
                    <CodeBlock code={content} language={language} title="Dein Code" />
                 </div>
              ) : (
                <p className="whitespace-pre-wrap">{content}</p>
              )}
            </div>
          )}
        </div>

      {!isModel && (
         <div className="flex-shrink-0 mt-1 w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center border border-gray-600 shadow-lg">
          <UserIcon />
        </div>
      )}
    </div>
  );
};

export default React.memo(ChatMessage);
