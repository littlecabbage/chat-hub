import React from 'react';

export const GeminiIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path d="M12 2C13.5 6 16 9 19 10.5C16 12 13.5 15 12 19C10.5 15 8 12 5 10.5C8 9 10.5 6 12 2Z" fill="currentColor" stroke="currentColor" strokeWidth="1" strokeLinejoin="round"/>
    <path d="M18 16C18.5 17.5 19.5 18.5 21 19C19.5 19.5 18.5 20.5 18 22C17.5 20.5 16.5 19.5 15 19C16.5 18.5 17.5 17.5 18 16Z" fill="currentColor" stroke="currentColor" strokeWidth="1" strokeLinejoin="round"/>
  </svg>
);

export const DeepSeekIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M12 2L2 7V17L12 22L22 17V7L12 2M12 4.5L19.5 8.25V15.75L12 19.5L4.5 15.75V8.25L12 4.5Z" />
    <path d="M12 10C10.9 10 10 10.9 10 12C10 13.1 10.9 14 12 14C13.1 14 14 13.1 14 12C14 10.9 13.1 10 12 10Z" />
  </svg>
);

export const KimiIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
    <path d="M12 16L12 16.01" strokeWidth="3"></path>
  </svg>
);

export const GrokIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect x="2" y="2" width="20" height="20" rx="4" />
    <path d="M8 8L16 16" />
    <path d="M16 8L8 16" />
  </svg>
);

export const getIconForAgent = (id: string, className?: string) => {
  if (id.includes('gemini')) return <GeminiIcon className={className} />;
  if (id.includes('deepseek')) return <DeepSeekIcon className={className} />;
  if (id.includes('kimi')) return <KimiIcon className={className} />;
  if (id.includes('grok')) return <GrokIcon className={className} />;
  return null;
};