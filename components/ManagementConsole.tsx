import React from 'react';
import { AgentConfig, ConnectionStatus, AgentType } from '../types';
import { getIconForAgent } from './Icons';
import { X, ExternalLink, RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface ManagementConsoleProps {
  isOpen: boolean;
  onClose: () => void;
  agents: AgentConfig[];
  statuses: Record<string, ConnectionStatus>;
  onVerify: (id: string) => void;
  onMarkConnected: (id: string, connected: boolean) => void;
}

export const ManagementConsole: React.FC<ManagementConsoleProps> = ({
  isOpen,
  onClose,
  agents,
  statuses,
  onVerify,
  onMarkConnected
}) => {
  const { t } = useLanguage();

  if (!isOpen) return null;

  const handleWebLogin = (agent: AgentConfig) => {
    if (agent.url) {
      window.open(agent.url, '_blank');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl w-full max-w-2xl border border-slate-200 dark:border-zinc-800 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-zinc-800 bg-white dark:bg-zinc-900">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-zinc-100">{t.consoleTitle}</h2>
            <p className="text-sm text-slate-500 dark:text-zinc-500 mt-1">{t.consoleDesc}</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-400 dark:text-zinc-500 hover:text-slate-600 dark:hover:text-zinc-300 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50 dark:bg-zinc-950/50 scrollbar-hide">
          {agents.map((agent) => {
            const status = statuses[agent.id] || 'disconnected';
            const isConnected = status === 'connected';
            const isChecking = status === 'checking';

            return (
              <div 
                key={agent.id}
                className={`
                  flex items-center justify-between p-4 rounded-xl border transition-all shadow-sm
                  ${isConnected 
                    ? 'bg-white dark:bg-zinc-900 border-green-200 dark:border-green-900/30' 
                    : 'bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800'}
                `}
              >
                <div className="flex items-center gap-4">
                   <div className={`
                     w-12 h-12 rounded-xl flex items-center justify-center border
                     ${isConnected 
                        ? 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 border-green-100 dark:border-green-900/30' 
                        : 'bg-slate-50 dark:bg-zinc-800 text-slate-400 dark:text-zinc-500 border-slate-100 dark:border-zinc-700'}
                   `}>
                     {getIconForAgent(agent.id, "w-6 h-6")}
                   </div>
                   
                   <div>
                     <div className="flex items-center gap-2">
                       <h3 className="font-semibold text-slate-900 dark:text-zinc-100">{agent.name}</h3>
                       {agent.type === AgentType.WEB_VIEW && (
                         <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-zinc-800 text-slate-500 dark:text-zinc-500 border border-slate-200 dark:border-zinc-700 font-medium">
                           {t.webView}
                         </span>
                       )}
                     </div>
                     <div className="flex items-center gap-1.5 mt-1.5">
                       <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]' : 'bg-orange-500'}`}></div>
                       <span className={`text-xs font-medium ${isConnected ? 'text-green-600 dark:text-green-400' : 'text-orange-500'}`}>
                         {isChecking ? t.statusChecking : isConnected ? t.statusConnected : t.statusDisconnected}
                       </span>
                     </div>
                   </div>
                </div>

                <div className="flex items-center gap-2">
                  {agent.type === AgentType.GEMINI_API ? (
                    <button
                      onClick={() => onVerify(agent.id)}
                      disabled={isChecking}
                      className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-lg transition-colors border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900"
                    >
                      <RefreshCw size={12} className={isChecking ? 'animate-spin' : ''} />
                      {isChecking ? t.verifying : t.testApi}
                    </button>
                  ) : (
                    <>
                      {!isConnected ? (
                        <button
                          onClick={() => handleWebLogin(agent)}
                          className="flex items-center gap-2 px-4 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors shadow-sm shadow-blue-500/20"
                        >
                          {t.login} <ExternalLink size={12} />
                        </button>
                      ) : (
                        <button
                          onClick={() => handleWebLogin(agent)}
                          className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-lg transition-colors border border-transparent hover:border-slate-200 dark:hover:border-zinc-700"
                        >
                          {t.relogin} <ExternalLink size={12} />
                        </button>
                      )}
                      
                      <button
                        onClick={() => onMarkConnected(agent.id, !isConnected)}
                        className={`
                          flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors border
                          ${isConnected 
                            ? 'bg-transparent border-red-200 dark:border-red-900/30 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10' 
                            : 'bg-white dark:bg-zinc-900 border-green-200 dark:border-green-800 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/10'}
                        `}
                        title={isConnected ? t.disconnect : t.imIn}
                      >
                         {isConnected ? <AlertCircle size={12} /> : <CheckCircle2 size={12} />}
                         {isConnected ? t.disconnect : t.imIn}
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        
        {/* Footer Hint */}
        <div className="p-4 bg-white dark:bg-zinc-900 border-t border-slate-100 dark:border-zinc-800 text-center">
            <p className="text-xs text-slate-400 dark:text-zinc-600 max-w-md mx-auto">
                {t.manualLoginHint}
            </p>
        </div>
      </div>
    </div>
  );
};