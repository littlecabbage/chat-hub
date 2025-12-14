import React from 'react';
import { AgentConfig } from '../types';
import { Eye, EyeOff, Monitor, Moon, Sun, Settings, Languages } from 'lucide-react';
import { getIconForAgent } from './Icons';
import { useLanguage } from '../contexts/LanguageContext';

interface ControlBarProps {
  agents: AgentConfig[];
  toggleAgent: (id: string) => void;
  isDarkMode: boolean;
  toggleTheme: () => void;
  onOpenConsole: () => void;
}

export const ControlBar: React.FC<ControlBarProps> = ({ agents, toggleAgent, isDarkMode, toggleTheme, onOpenConsole }) => {
  const { t, language, setLanguage } = useLanguage();

  const toggleLanguage = () => {
      setLanguage(language === 'zh' ? 'en' : 'zh');
  };

  return (
    <div className="h-16 bg-white dark:bg-black border-b border-slate-200 dark:border-zinc-800 flex items-center px-4 justify-between select-none transition-colors duration-200 shadow-sm dark:shadow-none z-20 relative">
      <div className="flex items-center gap-3">
        <div className="bg-gradient-to-br from-indigo-500 to-violet-600 w-8 h-8 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/20">
          <Monitor size={18} className="text-white" />
        </div>
        <h1 className="text-lg font-bold text-slate-800 dark:text-zinc-200 hidden sm:block tracking-tight">
          {t.appTitle}
        </h1>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-hide px-4 mask-fade-sides">
        {agents.map((agent) => (
          <button
            key={agent.id}
            onClick={() => toggleAgent(agent.id)}
            className={`
              flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200
              ${agent.isActive 
                ? 'bg-indigo-50 dark:bg-zinc-800 text-indigo-700 dark:text-zinc-100 shadow-sm border border-indigo-100 dark:border-zinc-700 ring-1 ring-indigo-200 dark:ring-0' 
                : 'bg-transparent text-slate-500 dark:text-zinc-500 hover:text-slate-700 dark:hover:text-zinc-300 border border-transparent opacity-70 hover:opacity-100'}
            `}
          >
            {getIconForAgent(agent.id, "w-3.5 h-3.5")}
            <span className="whitespace-nowrap">{agent.name}</span>
            {agent.isActive ? <Eye size={13} /> : <EyeOff size={13} />}
          </button>
        ))}
      </div>
      
      <div className="flex items-center gap-2">
        <button
          onClick={toggleLanguage}
          className="p-2 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-600 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-200 transition-colors border border-slate-200 dark:border-zinc-800"
          title={language === 'zh' ? 'Switch to English' : '切换到中文'}
        >
          <div className="flex items-center gap-1">
             <Languages size={16} />
             <span className="text-xs font-semibold">{language.toUpperCase()}</span>
          </div>
        </button>

        <div className="w-px h-6 bg-slate-200 dark:bg-zinc-800 mx-1"></div>

        <button
          onClick={onOpenConsole}
          className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-700 dark:text-zinc-500 dark:hover:text-zinc-300 dark:hover:bg-zinc-800 transition-colors"
          title={t.manageConnections}
        >
          <Settings size={18} />
        </button>
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg hover:bg-amber-50 text-slate-500 hover:text-amber-600 dark:text-zinc-500 dark:hover:text-zinc-300 dark:hover:bg-zinc-800 transition-colors"
          title={isDarkMode ? t.themeLight : t.themeDark}
        >
          {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </div>
    </div>
  );
};