import React, { useState, KeyboardEvent, useRef, useEffect } from 'react';
import { Send, Mic, MicOff, Paperclip, X } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface InputAreaProps {
  onSend: (text: string) => void;
  activeCount: number;
}

export const InputArea: React.FC<InputAreaProps> = ({ onSend, activeCount }) => {
  const [text, setText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [attachment, setAttachment] = useState<File | null>(null);
  const [speechError, setSpeechError] = useState<string | null>(null);
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);
  
  const { t, language } = useLanguage();

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [text]);

  // Initialize Speech Recognition
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        // Continuous mode allows dictating multiple sentences without stopping
        recognition.continuous = true;
        // Interim results can be enabled for real-time feedback, but false is safer for simple appending
        recognition.interimResults = false;
        
        // Update language based on context
        recognition.lang = language === 'zh' ? 'zh-CN' : 'en-US';

        recognition.onstart = () => {
            setIsListening(true);
            setSpeechError(null);
        };
        
        recognition.onend = () => {
            setIsListening(false);
        };
        
        recognition.onerror = (event: any) => {
          console.error("Speech recognition error", event.error);
          setIsListening(false);
          setSpeechError(event.error);
          if (event.error === 'not-allowed') {
              alert(language === 'zh' ? '无法访问麦克风，请检查浏览器权限设置。' : 'Microphone access denied. Please check permission settings.');
          }
        };

        recognition.onresult = (event: any) => {
          let newTranscript = '';
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
              newTranscript += event.results[i][0].transcript;
            }
          }

          if (newTranscript) {
             setText((prev) => {
                 // Smart separator: add space for English if not present, no space for Chinese
                 const needsSpace = language === 'en' && prev.length > 0 && !prev.endsWith(' ') && !newTranscript.startsWith(' ');
                 const separator = needsSpace ? ' ' : '';
                 return prev + separator + newTranscript;
             });
          }
        };

        recognitionRef.current = recognition;
        
        // Cleanup old instance on unmount or when language changes
        return () => {
            if (recognitionRef.current) {
                try {
                    recognitionRef.current.abort();
                } catch (e) {
                    // Ignore abort errors
                }
            }
        };
      }
    }
  }, [language]); // Re-run when language changes

  const toggleListening = () => {
    if (!recognitionRef.current) {
        alert(language === 'zh' ? "您的浏览器不支持语音输入。" : "Speech recognition is not supported in this browser.");
        return;
    }

    if (isListening) {
        recognitionRef.current.stop();
    } else {
        try {
            recognitionRef.current.start();
        } catch (e) {
            console.error("Failed to start speech recognition:", e);
            // Sometimes restarting requires re-initializing or waiting a bit
        }
    }
  };

  const handleSend = () => {
    if (!text.trim() && !attachment) return;
    onSend(text);
    // Auto-copy to clipboard for the iframe agents
    if (text.trim()) {
        navigator.clipboard.writeText(text);
    }
    setText('');
    setAttachment(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    
    // Reset height
    if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      handleSend();
    }
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
          setAttachment(e.target.files[0]);
      }
  };

  return (
    <div className="bg-white dark:bg-black border-t border-slate-200 dark:border-zinc-800 p-4 transition-colors duration-200">
      <div className="max-w-7xl mx-auto">
        
        {/* Input Container */}
        <div className={`bg-slate-50 dark:bg-zinc-900 rounded-2xl border shadow-sm focus-within:ring-2 focus-within:ring-blue-500/50 focus-within:border-blue-500 transition-all overflow-hidden ${speechError ? 'border-red-300 dark:border-red-900' : 'border-slate-200 dark:border-zinc-800'}`}>
            
            {/* Attachment Preview */}
            {attachment && (
                <div className="px-4 pt-3 flex">
                    <div className="bg-white dark:bg-zinc-800 text-xs px-2 py-1 rounded-lg border border-slate-200 dark:border-zinc-700 flex items-center gap-2 text-slate-600 dark:text-zinc-300">
                        <Paperclip size={12} />
                        <span className="max-w-[150px] truncate">{attachment.name}</span>
                        <button onClick={() => setAttachment(null)} className="hover:text-red-500">
                            <X size={12} />
                        </button>
                    </div>
                </div>
            )}

            {/* Text Area */}
            <textarea
                ref={textareaRef}
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={isListening ? (language === 'zh' ? '正在聆听...' : 'Listening...') : t.askPlaceholder.replace('{count}', activeCount.toString())}
                className="w-full bg-transparent text-slate-900 dark:text-zinc-100 p-4 max-h-[200px] min-h-[50px] resize-none outline-none placeholder-slate-400 dark:placeholder-zinc-600 text-sm sm:text-base leading-relaxed"
                rows={1}
                style={{ height: 'auto', minHeight: '50px' }} 
            />

            {/* Function Bar */}
            <div className="flex items-center justify-between px-2 pb-2">
                <div className="flex items-center gap-1">
                     {/* Attachment Button */}
                     <input 
                        type="file" 
                        ref={fileInputRef} 
                        className="hidden" 
                        onChange={handleFileChange} 
                     />
                     <button 
                        onClick={() => fileInputRef.current?.click()}
                        className="p-2 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:text-zinc-500 dark:hover:text-zinc-300 dark:hover:bg-zinc-800 transition-colors"
                        title={t.addAttachment}
                     >
                         <Paperclip size={18} />
                     </button>

                     {/* Voice Button */}
                     <button
                        onClick={toggleListening}
                        className={`p-2 rounded-lg transition-all ${
                            isListening 
                            ? 'bg-red-50 text-red-500 animate-pulse dark:bg-red-900/20 shadow-inner' 
                            : 'text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:text-zinc-500 dark:hover:text-zinc-300 dark:hover:bg-zinc-800'
                        }`}
                        title={isListening ? t.stopListening : t.voiceInput}
                    >
                        {isListening ? <MicOff size={18} /> : <Mic size={18} />}
                    </button>
                </div>

                <div className="flex items-center gap-3">
                    <span className="text-[10px] text-slate-400 dark:text-zinc-600 hidden sm:inline-block">
                        {t.ctrlEnterHint}
                    </span>
                    <button
                        onClick={handleSend}
                        disabled={(!text.trim() && !attachment)}
                        className={`
                            px-4 py-1.5 rounded-lg flex items-center gap-2 text-sm font-medium transition-all shadow-sm
                            ${(text.trim() || attachment)
                                ? 'bg-blue-600 hover:bg-blue-500 text-white' 
                                : 'bg-slate-200 dark:bg-zinc-800 text-slate-400 dark:text-zinc-600 cursor-not-allowed'}
                        `}
                    >
                        <span>{t.send}</span>
                        <Send size={14} />
                    </button>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};