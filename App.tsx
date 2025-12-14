import React, { useState, useEffect } from 'react';
import { AgentConfig, AgentType, ConnectionStatus } from './types';
import { ControlBar } from './components/ControlBar';
import { InputArea } from './components/InputArea';
import { GeminiAgent } from './components/GeminiAgent';
import { IframeAgent } from './components/IframeAgent';
import { ManagementConsole } from './components/ManagementConsole';
import { testConnection } from './services/gemini';
import { LanguageProvider, useLanguage } from './contexts/LanguageContext';

// Predefined agents mixing API and Web views
const INITIAL_AGENTS: AgentConfig[] = [
  {
    id: 'gemini-flash',
    name: 'Gemini Flash',
    type: AgentType.GEMINI_API,
    isActive: true,
    model: 'gemini-2.5-flash',
    systemInstruction: 'You are a helpful, fast, and concise assistant.',
    color: '#3b82f6' // Blue
  },
  {
    id: 'gemini-pro',
    name: 'Gemini Pro',
    type: AgentType.GEMINI_API,
    isActive: true,
    model: 'gemini-3-pro-preview',
    systemInstruction: 'You are a detailed, reasoning-focused assistant.',
    color: '#a855f7' // Purple
  },
  {
    id: 'deepseek-web',
    name: 'DeepSeek',
    type: AgentType.WEB_VIEW,
    isActive: true,
    url: 'https://chat.deepseek.com/',
    color: '#06b6d4' // Cyan
  },
  {
    id: 'kimi-web',
    name: 'Kimi',
    type: AgentType.WEB_VIEW,
    isActive: false,
    url: 'https://kimi.moonshot.cn/',
    color: '#10b981' // Emerald
  },
  {
      id: 'grok-web',
      name: 'Grok',
      type: AgentType.WEB_VIEW,
      isActive: false,
      url: 'https://grok.x.ai/',
      color: '#f97316' // Orange
  }
];

const AppContent = () => {
  const [agents, setAgents] = useState<AgentConfig[]>(INITIAL_AGENTS);
  const [lastPrompt, setLastPrompt] = useState<string | null>(null);
  const [promptTimestamp, setPromptTimestamp] = useState<number>(0);
  // Default to Light Mode (false)
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  // Console State
  const [isConsoleOpen, setIsConsoleOpen] = useState(false);
  const [agentStatuses, setAgentStatuses] = useState<Record<string, ConnectionStatus>>({});

  const { t } = useLanguage();

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Load Statuses from Local Storage
  useEffect(() => {
    const saved = localStorage.getItem('omnichat_statuses');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setAgentStatuses(parsed);
      } catch (e) {
        console.error("Failed to parse saved statuses");
      }
    }
    
    // Auto-check logic removed to prevent "launch" blocking or delays.
    // User can manually verify connections in the console.
  }, []);

  const checkGemini = async () => {
    // Set checking state for Gemini agents
    const geminiAgents = INITIAL_AGENTS.filter(a => a.type === AgentType.GEMINI_API);
    setAgentStatuses(prev => {
      const next = { ...prev };
      geminiAgents.forEach(a => next[a.id] = 'checking');
      return next;
    });

    // Test generic connection
    const isConnected = await testConnection();
    
    setAgentStatuses(prev => {
      const next = { ...prev };
      geminiAgents.forEach(a => next[a.id] = isConnected ? 'connected' : 'disconnected');
      return next;
    });
  };

  const handleUpdateStatus = (id: string, isConnected: boolean) => {
    const newStatuses = {
        ...agentStatuses,
        [id]: isConnected ? 'connected' : 'disconnected'
    };
    setAgentStatuses(newStatuses as Record<string, ConnectionStatus>);
    localStorage.setItem('omnichat_statuses', JSON.stringify(newStatuses));
  };

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  const toggleAgent = (id: string) => {
    setAgents(prev => prev.map(a => 
      a.id === id ? { ...a, isActive: !a.isActive } : a
    ));
  };

  const handleSend = (text: string) => {
    setLastPrompt(text);
    setPromptTimestamp(Date.now());
  };

  const activeAgents = agents.filter(a => a.isActive);

  // Dynamic grid calculation
  const getGridClass = (count: number) => {
    if (count === 1) return 'grid-cols-1';
    if (count === 2) return 'grid-cols-1 md:grid-cols-2';
    if (count === 3) return 'grid-cols-1 md:grid-cols-3';
    return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4';
  };

  return (
    <div className="flex flex-col h-screen bg-slate-50 dark:bg-black text-slate-900 dark:text-zinc-300 font-sans transition-colors duration-200">
      <ControlBar 
        agents={agents} 
        toggleAgent={toggleAgent} 
        isDarkMode={isDarkMode} 
        toggleTheme={toggleTheme} 
        onOpenConsole={() => setIsConsoleOpen(true)}
      />
      
      <div className="flex-1 overflow-hidden relative">
        {activeAgents.length === 0 ? (
          <div className="flex items-center justify-center h-full text-slate-500 dark:text-zinc-500">
            <p>{t.selectAgent}</p>
          </div>
        ) : (
          <div className={`grid h-full w-full divide-x divide-slate-200 dark:divide-zinc-800 ${getGridClass(activeAgents.length)}`}>
            {activeAgents.map(agent => (
              <div key={agent.id} className="h-full overflow-hidden min-w-[300px]">
                {agent.type === AgentType.GEMINI_API ? (
                  <GeminiAgent 
                    agent={agent} 
                    lastPrompt={lastPrompt} 
                    timestamp={promptTimestamp}
                  />
                ) : (
                  <IframeAgent 
                    agent={agent} 
                    lastPrompt={lastPrompt} 
                    timestamp={promptTimestamp}
                  />
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <InputArea onSend={handleSend} activeCount={activeAgents.length} />

      <ManagementConsole 
        isOpen={isConsoleOpen}
        onClose={() => setIsConsoleOpen(false)}
        agents={agents}
        statuses={agentStatuses}
        onVerify={(id) => {
            if (id.includes('gemini')) checkGemini();
        }}
        onMarkConnected={handleUpdateStatus}
      />
    </div>
  );
};

export default function App() {
    return (
        <LanguageProvider>
            <AppContent />
        </LanguageProvider>
    )
}