import React, { useState } from 'react';
import { AgentConfig } from '../types';
import { ExternalLink, Check, Lock } from 'lucide-react';
import { getIconForAgent } from './Icons';
import { useLanguage } from '../contexts/LanguageContext';

interface IframeAgentProps {
  agent: AgentConfig;
  lastPrompt: string | null;
  timestamp: number;
}

export const IframeAgent: React.FC<IframeAgentProps> = ({ agent, lastPrompt, timestamp }) => {
  const [copied, setCopied] = useState(false);
  const { t } = useLanguage();

  // When a new prompt arrives (timestamp changes), we trigger the copy visual cue
  React.useEffect(() => {
    if (lastPrompt && timestamp > 0) {
      setCopied(true);
      const timer = setTimeout(() => setCopied(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [lastPrompt, timestamp]);

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-black relative border-l border-slate-200 dark:border-zinc-800 transition-colors duration-200">
       {/* Header */}
       <div className="absolute top-0 left-0 right-0 h-10 bg-white/95 dark:bg-black/90 border-b border-slate-200 dark:border-zinc-800 flex items-center px-4 z-10 justify-between transition-colors duration-200">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg flex items-center justify-center bg-indigo-50 dark:bg-zinc-900 text-indigo-600 dark:text-zinc-400">
            {getIconForAgent(agent.id)}
          </div>
          <div>
            <div className="font-semibold text-xs text-slate-800 dark:text-zinc-200 leading-tight">{agent.name}</div>
            <div className="text-[10px] text-slate-500 dark:text-zinc-500 leading-tight">{t.webView}</div>
          </div>
        </div>
        <a 
            href={agent.url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-slate-400 hover:text-slate-600 dark:text-zinc-600 dark:hover:text-zinc-300 transition-colors flex items-center gap-1 text-xs"
        >
            {t.open} <ExternalLink size={12} />
        </a>
      </div>

      <div className="flex-1 pt-10 relative">
        <div className="absolute inset-0 z-0">
             {/* Note: Many AI sites block iframes via X-Frame-Options. This is a best-effort implementation. */}
             <iframe 
                src={agent.url} 
                className="w-full h-full border-0 bg-white"
                title={agent.name}
                sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
             />
        </div>

        {/* Overlay Helper for "Simulated" sending */}
        {copied && (
            <div className="absolute top-12 left-1/2 -translate-x-1/2 z-20 bg-emerald-500 text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2 animate-fade-in-down">
                <Check size={16} />
                <span className="text-sm font-medium">{t.promptCopied}</span>
            </div>
        )}

        {/* Security / Limitation Notice Overlay if it fails to load */}
        <div className="absolute bottom-4 left-4 right-4 bg-white/90 dark:bg-black/80 backdrop-blur text-xs text-slate-600 dark:text-zinc-400 p-3 rounded-lg border border-slate-200 dark:border-zinc-800 z-10 flex gap-3 pointer-events-none shadow-sm">
            <Lock size={16} className="flex-shrink-0 text-amber-500" />
            <p>
                {t.securityNotice}
            </p>
        </div>
      </div>
    </div>
  );
};