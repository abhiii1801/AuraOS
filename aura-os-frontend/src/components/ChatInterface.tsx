"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Sparkles, History, X } from "lucide-react";
import { chatApi } from "@/hooks/useApi";

interface Message {
  id: string;
  role: "user" | "ai";
  content: string;
}

interface ChatInterfaceProps {
  placeholder: string;
  context: string;
}

export function ChatInterface({ placeholder, context }: ChatInterfaceProps) {
  const [chatInput, setChatInput] = useState("");
  const [isChatting, setIsChatting] = useState(false);
  const [chatHistory, setChatHistory] = useState<Message[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [activePopup, setActivePopup] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const popupTimer = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const handleInsertPrompt = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail) {
        setChatInput(customEvent.detail);
        inputRef.current?.focus();
      }
    };
    window.addEventListener('insertAuraPrompt', handleInsertPrompt);
    return () => window.removeEventListener('insertAuraPrompt', handleInsertPrompt);
  }, []);

  useEffect(() => {
    if (showHistory && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chatHistory, showHistory]);

  const handleChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userMessage = chatInput;
    setChatInput("");
    setIsChatting(true);
    
    // Clear any existing active popup
    setActivePopup(null);
    if (popupTimer.current) clearTimeout(popupTimer.current);
    
    setChatHistory(prev => [...prev, { id: Date.now().toString(), role: "user", content: userMessage }]);

    // Only show processing indicator if history is closed
    if (!showHistory) {
      setActivePopup("Processing...");
    }

    const res = await chatApi(userMessage, context);
    
    if (res) {
      setChatHistory(prev => [...prev, { id: (Date.now() + 1).toString(), role: "ai", content: res.reply }]);
      
      // Show auto-dismissing popup if history is closed
      if (!showHistory) {
        setActivePopup(res.reply);
        popupTimer.current = setTimeout(() => {
          setActivePopup(null);
        }, 5000);
      }
    }
    
    setIsChatting(false);
  };

  return (
    <div className="w-full bg-background relative z-40 pt-2">
      {/* Soft gradient fade for the scroll boundary above */}
      <div className="absolute bottom-full left-0 right-0 h-20 bg-gradient-to-t from-background via-background/80 to-transparent pointer-events-none z-0"></div>
      
      <div className="w-full flex justify-center pb-6 px-8 flex-shrink-0 relative z-10">
        <div className="w-full max-w-6xl mx-auto pointer-events-auto flex flex-col relative">
        
        {/* Full Chat History Dialog overlay */}
        {showHistory && (
          <div className="absolute bottom-full left-0 right-0 mb-4 bg-card/95 backdrop-blur-xl border border-border shadow-[0_10px_40px_rgba(0,0,0,0.3)] rounded-2xl overflow-hidden flex flex-col transition-all border-neon-cyan/20">
            {/* Header controls */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border/50 bg-background/50">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted">
                <History className="w-4 h-4 text-neon-cyan" />
                Chat History
              </div>
              <button 
                onClick={() => setShowHistory(false)}
                className="text-xs font-medium text-muted hover:text-white flex items-center gap-1 transition-colors"
                type="button"
              >
                <X className="w-4 h-4" /> Close
              </button>
            </div>

            {/* Content pane */}
            <div ref={scrollRef} className="p-4 overflow-y-auto max-h-72 space-y-4 shadow-inner">
              {chatHistory.length === 0 && (
                <div className="text-center text-muted text-sm py-4">No history yet.</div>
              )}
              {chatHistory.map(msg => (
                <div key={msg.id} className={`flex gap-3 text-sm md:text-base ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {msg.role === 'ai' && <Sparkles className="w-5 h-5 text-neon-cyan shrink-0 mt-0.5" />}
                  
                  <div className={`px-4 py-3 rounded-2xl max-w-[85%] ${
                    msg.role === 'user' 
                      ? 'bg-black/10 dark:bg-white/10 text-foreground' 
                      : 'bg-background border border-border text-foreground shadow-sm'
                  }`}>
                    {msg.content}
                  </div>

                  {msg.role === 'user' && <div className="w-6 h-6 rounded-full bg-gradient-to-r from-neon-pink to-neon-orange flex-shrink-0 flex items-center justify-center text-[10px] text-white font-bold mt-1">AB</div>}
                </div>
              ))}
              {isChatting && (
                <div className="flex gap-3 justify-start text-sm md:text-base">
                  <Sparkles className="w-5 h-5 text-neon-cyan shrink-0 mt-0.5" />
                  <div className="px-5 py-4 rounded-2xl bg-background border border-border flex items-center gap-2">
                     <span className="w-2 h-2 rounded-full bg-neon-cyan animate-pulse"></span>
                     <span className="w-2 h-2 rounded-full bg-neon-cyan animate-pulse delay-75"></span>
                     <span className="w-2 h-2 rounded-full bg-neon-cyan animate-pulse delay-150"></span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Temporary Popup */}
        {!showHistory && activePopup && (
          <div className="absolute bottom-full left-0 right-0 mb-4 w-full bg-card/95 backdrop-blur-xl border border-neon-cyan/30 text-foreground px-6 py-4 rounded-2xl shadow-[0_10px_40px_rgba(0,229,255,0.15)] flex gap-3 animate-in fade-in slide-in-from-bottom-2">
            <Sparkles className="w-5 h-5 text-neon-cyan shrink-0 mt-0.5" />
            <div className="w-full text-base leading-relaxed">
              {activePopup}
            </div>
          </div>
        )}

        {/* Input Bar */}
        <div className="w-full relative z-10 shadow-[0_4px_20px_rgba(0,0,0,0.05)] dark:shadow-[0_4px_30px_rgba(0,0,0,0.8)] rounded-2xl bg-card/90 backdrop-blur-xl border border-black/10 dark:border-white/10 flex items-center focus-within:ring-1 focus-within:ring-neon-cyan/50 focus-within:border-neon-cyan/50 transition-all">
          {/* History Toggle Button */}
          <button 
            onClick={() => {
               setShowHistory(!showHistory);
               if (!showHistory) setActivePopup(null);
            }}
            type="button"
            className="w-[60px] h-[60px] flex items-center justify-center text-muted hover:text-neon-cyan transition-all flex-shrink-0 relative group"
            title="Chat History"
          >
            <History className="w-6 h-6 transition-transform group-hover:scale-110" />
            {chatHistory.length > 0 && <span className="absolute top-3 right-3 w-2 h-2 rounded-full bg-neon-cyan shadow-[0_0_8px_#00E5FF]"></span>}
          </button>

          <form onSubmit={handleChat} className="flex-1 relative h-[60px]">
            <input 
              ref={inputRef}
              type="text" 
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder={placeholder} 
              className="w-full h-full bg-transparent pl-2 pr-16 text-lg text-foreground focus:outline-none placeholder:text-muted"
              disabled={isChatting}
            />
            <button 
              type="submit" 
              disabled={isChatting || !chatInput.trim()}
              className="absolute right-3 top-2 bottom-2 aspect-square bg-neon-cyan hover:bg-neon-cyan/80 text-white rounded-xl flex items-center justify-center transition-colors disabled:opacity-50 cursor-pointer"
            >
              {isChatting ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <Send className="w-5 h-5" />}
            </button>
          </form>
        </div>
      </div>
    </div>
  </div>
  );
}
