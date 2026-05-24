import React, { useState, useEffect } from 'react';
import { Sparkles } from 'lucide-react';

export default function WelcomeHero({ name, briefing }) {
  const [displayedText, setDisplayedText] = useState('');
  
  // Calculate dynamic greeting based on time
  const hour = new Date().getHours();
  let greeting = 'Good evening';
  if (hour < 12) greeting = 'Good morning';
  else if (hour < 18) greeting = 'Good afternoon';

  // Typewriter effect for briefing
  useEffect(() => {
    if (!briefing) return;
    setDisplayedText('');
    let i = 0;
    const interval = setInterval(() => {
      setDisplayedText(briefing.substring(0, i + 1));
      i++;
      if (i >= briefing.length) clearInterval(interval);
    }, 20); // 20ms per character for a fast, streaming feel
    return () => clearInterval(interval);
  }, [briefing]);

  return (
    <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8">
      {/* Decorative gradient blur in the background */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-aura-purple/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
      
      <div className="relative z-10 flex-1">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 tracking-tight">
          {greeting}, {name}!
        </h1>
        <div className="flex items-start gap-3 bg-gray-50/80 p-4 rounded-2xl border border-gray-100 max-w-3xl min-h-[80px]">
          <div className="mt-0.5 text-aura-purple shrink-0">
            <Sparkles size={20} />
          </div>
          <p className="text-sm md:text-base text-gray-600 font-medium leading-relaxed">
            {displayedText}
            {displayedText.length < (briefing?.length || 0) && (
              <span className="inline-block w-1.5 h-4 ml-1 bg-aura-purple animate-pulse align-middle"></span>
            )}
          </p>
        </div>
      </div>
      
      <div className="relative z-10 hidden lg:block text-right">
        <p className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-1">Today</p>
        <p className="text-2xl font-bold text-gray-900">
          {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
        </p>
      </div>
    </div>
  );
}