import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Image as ImageIcon } from 'lucide-react';

export default function HeroSection() {
  const navigate = useNavigate();

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-start text-center pt-32 pb-20 px-6 bg-[#F8F9FA] overflow-hidden">
      
      {/* Background Texture - Top left to bottom right mask */}
      <div 
        className="absolute inset-0 pointer-events-none z-0"
        style={{
          backgroundImage: 'radial-gradient(#d1d5db 1.5px, transparent 1.5px)',
          backgroundSize: '32px 32px',
          maskImage: 'linear-gradient(135deg, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0) 35%, rgba(0,0,0,0) 65%, rgba(0,0,0,0.5) 100%)',
          WebkitMaskImage: 'linear-gradient(135deg, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0) 35%, rgba(0,0,0,0) 65%, rgba(0,0,0,0.5) 100%)',
        }}
      />

      <div className="relative z-10 w-full max-w-5xl mx-auto flex flex-col items-center mt-12">
        
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white border border-gray-200 rounded-full text-[13px] font-medium text-gray-600 shadow-sm mb-8 tracking-wide">
          ✦ Your AI-Powered Personal OS
        </div>

        {/* Headline */}
        <h1 className="text-[clamp(36px,6vw,68px)] font-extrabold tracking-[-0.03em] text-aura-dark max-w-[900px] mb-6 leading-[1.08]">
          Your Entire Life,{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-aura-purple to-purple-400">
            Managed By AI
          </span>
        </h1>

        {/* Sub-headline */}
        <p className="text-[17px] text-gray-500 max-w-[640px] mb-10 leading-[1.65] font-normal">
          From finances and health to knowledge and tasks — AuraOS unifies your world into one intelligent dashboard, powered by a personal AI that knows you.
        </p>

        {/* CTA Button */}
        <button
          onClick={() => window.location.href = 'http://localhost:8000/login'}
          className="px-8 py-3.5 rounded-full text-[15px] font-semibold border border-gray-200 bg-white text-gray-700 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.08)] hover:-translate-y-[1px] transition-all duration-200 mb-20"
        >
          Book a Demo
        </button>

        {/* App Dashboard Preview — Placeholder */}
        <div className="w-full rounded-[20px] overflow-hidden shadow-[0_24px_80px_rgba(0,0,0,0.08),_0_4px_16px_rgba(0,0,0,0.04)] border border-gray-200 bg-white">
          {/* Browser chrome */}
          <div className="bg-[#f8f9fa] px-4 py-3.5 flex items-center gap-2 border-b border-gray-200">
            <div className="w-3 h-3 rounded-full bg-[#ff5f56]" />
            <div className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
            <div className="w-3 h-3 rounded-full bg-[#27c93f]" />
            <div className="flex-1 ml-4 bg-white rounded-md py-1.5 px-3 text-[12px] text-gray-400 border border-gray-200 max-w-[280px] mx-auto flex items-center justify-center gap-1.5 font-medium shadow-sm">
              <Lock size={12} /> auraos.app
            </div>
          </div>

          {/* Dashboard placeholder */}
          <div className="h-[500px] md:h-[640px] bg-gradient-to-br from-[#fafafa] to-[#f3f0ff] flex flex-col items-center justify-center gap-4 text-gray-400">
            <div className="w-16 h-16 rounded-[18px] bg-aura-purple/10 flex items-center justify-center text-aura-purple shadow-inner">
              <ImageIcon size={32} strokeWidth={1.5} />
            </div>
            <p className="text-[15px] font-medium text-[#c4b5fd]">Dashboard screenshot coming soon</p>
          </div>
        </div>

      </div>
    </section>
  );
}
