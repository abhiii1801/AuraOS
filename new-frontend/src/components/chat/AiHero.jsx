import { Sparkles } from 'lucide-react';

export default function AiHero({ greeting }) {
  return (
    <div className="text-center flex flex-col items-center">
      {/* The Glowing AI Orb */}
      <div className="relative w-20 h-20 mb-6 flex items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-tr from-blue-500 via-aura-purple to-pink-500 rounded-full blur-xl opacity-60 animate-pulse"></div>
        <div className="absolute inset-2 bg-gradient-to-tr from-indigo-500 via-aura-purple to-pink-500 rounded-full shadow-inner"></div>
        <Sparkles className="relative z-10 text-white" size={28} />
      </div>

      <h1 className="text-3xl md:text-4xl font-semibold text-gray-600 mb-2">
        {greeting}
      </h1>
      <h2 className="text-4xl md:text-5xl font-bold text-gray-900 tracking-tight">
        How Can I <span className="text-aura-purple">Assist You Today?</span>
      </h2>
    </div>
  );
}