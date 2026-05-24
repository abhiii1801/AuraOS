import React, { useState, useRef, useEffect } from 'react';

import AiHero from '../components/chat/AiHero';
import SuggestionGrid from '../components/chat/SuggestionGrid';
import ChatInput from '../components/chat/ChatInput';

const initialChatData = {
  greeting: 'Ask Aura anything about your dashboard, health, finances, or vault.',
  suggestions: [
    'Show my finance summary',
    'What is my health status today?',
    'Open the vault for recent notes',
    'Give me my daily digest',
  ],
};

export default function ChatDashboard() {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSend = async (text) => {
    if (!text.trim()) return;
    
    // Add user message to UI immediately
    const userMsg = { role: 'user', content: text };
    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, context: 'global' })
      });
      const resData = await res.json();
      
      const botMsg = { 
        role: 'assistant', 
        content: resData.reply || 'Sorry, I encountered an error.',
        action: resData.action_taken
      };
      
      setMessages((prev) => [...prev, botMsg]);
    } catch (e) {
      console.error('[ChatDashboard]', e);
      setMessages((prev) => [...prev, { role: 'assistant', content: 'Network error communicating with Aura.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-full min-h-[calc(100vh-120px)] w-full flex flex-col pt-8 md:pt-4">
      
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full mb-4 px-2">
        {messages.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center w-full mt-12 md:mt-0">
            <AiHero greeting={initialChatData.greeting} />
            <div className="w-full mt-12 mb-8">
              <p className="text-sm font-semibold text-gray-500 mb-4 ml-2">Try Asking Aura</p>
              <SuggestionGrid suggestions={initialChatData.suggestions} onSelect={handleSend} />
            </div>
          </div>
        ) : (
          <div className="flex flex-col space-y-6 pb-20 pt-4 w-full">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] md:max-w-[75%] rounded-3xl p-4 ${msg.role === 'user' ? 'bg-aura-purple text-white rounded-br-sm shadow-sm' : 'bg-white border border-gray-100 text-gray-800 rounded-bl-sm shadow-sm'}`}>
                  {msg.role === 'assistant' && msg.action && msg.action !== 'none' && msg.action !== 'error' && (
                    <div className="text-[10px] font-bold uppercase tracking-wider text-aura-purple mb-2 flex items-center gap-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-400"></div>
                      Action Taken: {msg.action.replace(/_/g, ' ')}
                    </div>
                  )}
                  <div className="text-sm md:text-base whitespace-pre-wrap leading-relaxed">{msg.content}</div>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start w-full">
                <div className="bg-white border border-gray-100 text-gray-800 rounded-3xl rounded-bl-sm shadow-sm p-5 flex items-center gap-2">
                  <div className="w-2 h-2 bg-aura-purple/50 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 bg-aura-purple/50 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 bg-aura-purple/50 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} className="h-4" />
          </div>
        )}
      </div>
      
      {/* Pinned to bottom of the content area */}
      <div className="w-full max-w-4xl mx-auto mb-4 px-2 sticky bottom-0">
         <ChatInput onSend={handleSend} isLoading={isLoading} />
      </div>
    </div>
  );
}