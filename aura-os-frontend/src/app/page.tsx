"use client";

import { Cpu, Shield, Zap, Sparkles, Navigation } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-neon-cyan/10 rounded-full blur-[100px] -z-10 pointer-events-none"></div>
      
      <div className="max-w-4xl w-full px-6 flex flex-col items-center text-center z-10 relative">
        <div className="mb-6 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-neon-cyan">
          <Sparkles className="w-3 h-3" /> Welcome to the future of productivity
        </div>
        
        <h1 className="text-6xl md:text-8xl font-bold tracking-tighter mb-6">
          Meet <span className="text-neon-cyan drop-shadow-[0_0_15px_rgba(0,240,255,0.4)]">AuraOS</span>
        </h1>
        
        <p className="text-xl md:text-2xl text-muted max-w-2xl mb-12 leading-relaxed">
          The autonomous, AI-driven operating system for your life. Seamlessly connect your finance, health, calendar, and second brain.
        </p>

        <a 
          href="http://localhost:8000/login" 
          className="group relative inline-flex items-center gap-3 px-8 py-4 bg-foreground text-background font-semibold rounded-full hover:scale-105 transition-all duration-300 shadow-[0_0_20px_rgba(255,255,255,0.2)] hover:shadow-[0_0_30px_rgba(255,255,255,0.4)]"
        >
          <svg className="w-5 h-5 text-background" viewBox="0 0 24 24" fill="currentColor">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          <span className="text-lg">Continue with Google</span>
          <div className="absolute inset-0 rounded-full ring-2 ring-white/20 group-hover:ring-white/40 transition-all opacity-0 group-hover:opacity-100 scale-105 group-hover:scale-100"></div>
        </a>

        {/* Feature Grid */}
        <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-6 w-full text-left">
          <div className="bg-card/50 backdrop-blur-md border border-white/5 rounded-2xl p-6 hover:bg-card/80 transition-colors">
            <Zap className="w-8 h-8 text-neon-blue mb-4 drop-shadow-[0_0_8px_currentColor]" />
            <h3 className="text-lg font-semibold mb-2">Automated Ledger</h3>
            <p className="text-sm text-muted">Aura tracks and categorizes your expenses automatically, bringing clarity to your finances.</p>
          </div>
          <div className="bg-card/50 backdrop-blur-md border border-white/5 rounded-2xl p-6 hover:bg-card/80 transition-colors">
            <Navigation className="w-8 h-8 text-neon-green mb-4 drop-shadow-[0_0_8px_currentColor]" />
            <h3 className="text-lg font-semibold mb-2">Health Sync</h3>
            <p className="text-sm text-muted">Sync your biometrics to identify trends linking diet and sleep to productivity.</p>
          </div>
          <div className="bg-card/50 backdrop-blur-md border border-white/5 rounded-2xl p-6 hover:bg-card/80 transition-colors">
            <Cpu className="w-8 h-8 text-neon-pink mb-4 drop-shadow-[0_0_8px_currentColor]" />
            <h3 className="text-lg font-semibold mb-2">Second Brain</h3>
            <p className="text-sm text-muted">A fully autonomous RAG vault that remembers everything, organizing your thoughts structurally.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
