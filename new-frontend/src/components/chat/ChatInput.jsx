import React, { useState } from 'react';
import { Paperclip, Mic, Send } from 'lucide-react';

export default function ChatInput({ onSend, isLoading }) {
  const [text, setText] = useState('');

  const handleSend = () => {
    if (text.trim() && !isLoading) {
      onSend(text.trim());
      setText('');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-3xl shadow-sm p-2 flex flex-col transition-all focus-within:border-aura-purple/50 focus-within:shadow-md">
      <textarea 
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={isLoading}
        placeholder="Ask Aura about your finances, health, or notes..."
        className="w-full resize-none outline-none p-4 text-gray-800 placeholder-gray-400 text-sm md:text-base min-h-[80px] bg-transparent disabled:opacity-50"
      />
      
      <div className="flex justify-between items-center px-2 pb-2">
        <button className="flex items-center gap-2 px-3 py-1.5 rounded-full hover:bg-gray-50 text-gray-500 text-sm font-medium transition-colors">
          <Paperclip size={16} /> Attach
        </button>
        
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-3 py-1.5 rounded-full hover:bg-gray-50 text-gray-500 text-sm font-medium transition-colors">
            Voice <Mic size={16} />
          </button>
          <button 
            onClick={handleSend}
            disabled={!text.trim() || isLoading}
            className="bg-aura-purple hover:bg-indigo-600 text-white p-2.5 rounded-full transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <Send size={18} />}
          </button>
        </div>
      </div>
    </div>
  );
}