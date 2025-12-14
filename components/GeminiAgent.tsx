import React, { useEffect, useRef, useState, useCallback } from 'react';
import { AgentConfig, Message } from '../types';
import { createChatSession, streamMessage } from '../services/gemini';
import { Bot, User, RefreshCw, AlertCircle } from 'lucide-react';
import { Chat } from '@google/genai';
import ReactMarkdown from 'react-markdown';
import { getIconForAgent } from './Icons';
import { useLanguage } from '../contexts/LanguageContext';

interface GeminiAgentProps {
  agent: AgentConfig;
  lastPrompt: string | null;
  timestamp: number;
}

export const GeminiAgent: React.FC<GeminiAgentProps> = ({ agent, lastPrompt, timestamp }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const chatSessionRef = useRef<Chat | null>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const prevTimestampRef = useRef<number>(0);
  const { t } = useLanguage();

  // Initialize Chat Session
  useEffect(() => {
    try {
      chatSessionRef.current = createChatSession(
        agent.model || 'gemini-2.5-flash',
        agent.systemInstruction
      );
    } catch (e) {
      setError("Failed to initialize Gemini session");
    }
  }, [agent.model, agent.systemInstruction]);

  // Handle New Prompt
  const processPrompt = useCallback(async (text: string) => {
    if (!chatSessionRef.current) return;
    
    setIsTyping(true);
    setError(null);

    // Add User Message
    const userMsg: Message = { role: 'user', text, timestamp: Date.now() };
    setMessages(prev => [...prev, userMsg]);

    // Placeholder for AI Message
    const aiMsgId = Date.now() + 1;
    setMessages(prev => [...prev, { role: 'model', text: '', timestamp: aiMsgId }]);

    try {
      let accumulatedText = '';
      await streamMessage(chatSessionRef.current, text, (chunk) => {
        accumulatedText += chunk;
        setMessages(prev => prev.map(msg => 
          msg.timestamp === aiMsgId ? { ...msg, text: accumulatedText } : msg
        ));
      });
    } catch (err) {
      setError("Failed to generate response. Check API Key or connection.");
    } finally {
      setIsTyping(false);
    }
  }, []);

  // Trigger effect when lastPrompt changes
  useEffect(() => {
    if (lastPrompt && timestamp > prevTimestampRef.current) {
      prevTimestampRef.current = timestamp;
      processPrompt(lastPrompt);
    }
  }, [lastPrompt, timestamp, processPrompt]);

  // Auto-scroll
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  return (
    <div className="flex flex-col h-full bg-white/50 dark:bg-zinc-950/50 backdrop-blur-sm relative transition-colors duration-200">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 h-10 bg-white/95 dark:bg-black/90 border-b border-slate-100 dark:border-zinc-800 flex items-center px-4 z-10 justify-between transition-colors duration-200">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg flex items-center justify-center bg-indigo-50 dark:bg-zinc-900 text-indigo-600 dark:text-zinc-400">
             {getIconForAgent(agent.id)}
          </div>
          <div>
            <div className="font-semibold text-xs text-slate-800 dark:text-zinc-200 leading-tight">{agent.name}</div>
            <div className="text-[10px] text-slate-500 dark:text-zinc-500 leading-tight">{agent.model}</div>
          </div>
        </div>
        <button 
            onClick={() => setMessages([])}
            className="text-slate-400 hover:text-slate-600 dark:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
            title={t.clearChat}
        >
            <RefreshCw size={14} />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 pt-14 space-y-5 scrollbar-hide">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-slate-400 dark:text-zinc-600 opacity-60">
            <div className="mb-3 p-4 bg-slate-50 dark:bg-zinc-900 rounded-2xl">
                {getIconForAgent(agent.id, "w-8 h-8")}
            </div>
            <p className="text-sm font-medium">{t.readyToChat}</p>
          </div>
        )}

        {messages.map((msg, idx) => (
          <div key={idx} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
             {msg.role === 'model' && (
               <div className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-zinc-400 shadow-sm mt-1">
                 {getIconForAgent(agent.id)}
               </div>
             )}
             <div className={`
               max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed shadow-sm
               ${msg.role === 'user' 
                 ? 'bg-blue-600 text-white rounded-br-none' 
                 : 'bg-white dark:bg-zinc-900 text-slate-700 dark:text-zinc-300 rounded-bl-none border border-slate-200 dark:border-zinc-800'}
             `}>
               {msg.role === 'model' ? (
                 <div className="prose prose-sm max-w-none dark:prose-invert prose-slate dark:prose-zinc">
                   <ReactMarkdown>{msg.text}</ReactMarkdown>
                 </div>
               ) : (
                 <div className="whitespace-pre-wrap">{msg.text}</div>
               )}
             </div>
             {msg.role === 'user' && (
               <div className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center bg-blue-50 dark:bg-blue-900/30 border border-blue-100 dark:border-blue-800 text-blue-600 dark:text-blue-400 mt-1">
                 <User size={14} />
               </div>
             )}
          </div>
        ))}
        
        {isTyping && (
          <div className="flex gap-3">
             <div className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-zinc-400 shadow-sm">
                 {getIconForAgent(agent.id)}
             </div>
             <div className="flex gap-1 items-center bg-white dark:bg-zinc-900 px-4 py-3 rounded-2xl rounded-bl-none border border-slate-200 dark:border-zinc-800 shadow-sm">
               <span className="w-1.5 h-1.5 bg-slate-400 dark:bg-zinc-600 rounded-full animate-bounce"></span>
               <span className="w-1.5 h-1.5 bg-slate-400 dark:bg-zinc-600 rounded-full animate-bounce delay-75"></span>
               <span className="w-1.5 h-1.5 bg-slate-400 dark:bg-zinc-600 rounded-full animate-bounce delay-150"></span>
             </div>
          </div>
        )}

        {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/30 rounded-lg text-red-600 dark:text-red-400 text-sm">
                <AlertCircle size={16} />
                {error}
            </div>
        )}
        <div ref={endRef} />
      </div>
    </div>
  );
};