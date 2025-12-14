import React, { createContext, useContext, useState, ReactNode } from 'react';

type Language = 'zh' | 'en';

interface Translations {
  appTitle: string;
  selectAgent: string;
  askPlaceholder: string;
  send: string;
  voiceInput: string;
  stopListening: string;
  addAttachment: string;
  settings: string;
  themeLight: string;
  themeDark: string;
  manageConnections: string;
  statusChecking: string;
  statusConnected: string;
  statusDisconnected: string;
  testApi: string;
  verifying: string;
  login: string;
  relogin: string;
  disconnect: string;
  imIn: string;
  manualLoginHint: string;
  consoleTitle: string;
  consoleDesc: string;
  readyToChat: string;
  webView: string;
  open: string;
  promptCopied: string;
  securityNotice: string;
  ctrlEnterHint: string;
  clearChat: string;
  models: string;
}

const translations: Record<Language, Translations> = {
  zh: {
    appTitle: 'OmniChat 智控中心',
    selectAgent: '请选择至少一个模型开始对话。',
    askPlaceholder: '同时询问 {count} 个模型...',
    send: '发送',
    voiceInput: '语音输入',
    stopListening: '停止收听',
    addAttachment: '添加附件',
    settings: '设置',
    themeLight: '切换到亮色模式',
    themeDark: '切换到暗色模式',
    manageConnections: '连接管理',
    statusChecking: '检查中...',
    statusConnected: '已连接',
    statusDisconnected: '未连接',
    testApi: '测试连接',
    verifying: '验证中',
    login: '去登录',
    relogin: '重新登录',
    disconnect: '断开',
    imIn: '我已登录',
    manualLoginHint: '对于网页版模型，登录状态需要手动确认。请点击登录按钮在弹窗中完成操作。',
    consoleTitle: '平台连接控制台',
    consoleDesc: '管理各个AI平台的连接状态和登录信息。',
    readyToChat: '准备对话',
    webView: '网页版',
    open: '打开',
    promptCopied: '提示词已复制！请在下方粘贴。',
    securityNotice: '浏览器安全限制阻止自动发送文本。提示词已复制到剪贴板，请在输入框中 Ctrl+V 粘贴。',
    ctrlEnterHint: 'Ctrl+Enter 发送',
    clearChat: '清空对话',
    models: '模型'
  },
  en: {
    appTitle: 'OmniChat Command',
    selectAgent: 'Select at least one agent to begin.',
    askPlaceholder: 'Ask {count} models simultaneously...',
    send: 'Send',
    voiceInput: 'Voice Input',
    stopListening: 'Stop Listening',
    addAttachment: 'Add Attachment',
    settings: 'Settings',
    themeLight: 'Switch to Light Mode',
    themeDark: 'Switch to Dark Mode',
    manageConnections: 'Manage Connections',
    statusChecking: 'Checking...',
    statusConnected: 'Connected',
    statusDisconnected: 'Not Connected',
    testApi: 'Test API',
    verifying: 'Verifying',
    login: 'Login',
    relogin: 'Re-login',
    disconnect: 'Disconnect',
    imIn: "I'm In",
    manualLoginHint: 'For web agents, login status is manually tracked. Please verify your login in the popup window.',
    consoleTitle: 'Platform Command Center',
    consoleDesc: 'Manage connection status and logins for your AI agents.',
    readyToChat: 'Ready to chat',
    webView: 'Web View',
    open: 'Open',
    promptCopied: 'Prompt copied! Please paste below.',
    securityNotice: 'Browser security prevents auto-sending text to external websites. Your prompt is copied to the clipboard. Please Ctrl+V.',
    ctrlEnterHint: 'Ctrl+Enter to send',
    clearChat: 'Clear Chat',
    models: 'models'
  }
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Translations;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('zh');

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t: translations[language] }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};