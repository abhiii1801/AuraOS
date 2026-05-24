import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Navbar() {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <nav className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-300 ${scrolled ? 'bg-gray-50/90 backdrop-blur-md' : 'bg-transparent'}`}>
      <div className="w-full px-4 md:px-8 py-4">
        <div className={`relative flex flex-col md:flex-row items-center justify-between gap-4 px-6 py-4 w-full transition-all duration-300 ${scrolled ? 'bg-white rounded-2xl' : ''}`}>
          
          {/* Logo */}
          <div className="flex items-center gap-2 font-bold text-xl text-aura-purple cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="w-8 h-8 rounded-full bg-aura-purple text-white flex items-center justify-center">A</div>
            AuraOS
          </div>

          {/* Nav Links */}
          <div className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-gray-50/50 rounded-full p-1 border border-gray-200 backdrop-blur-sm">
            {[
              { label: 'Features', id: 'features' },
              { label: 'Pricing', id: 'pricing' },
              { label: 'Testimonials', id: 'testimonials' },
              { label: 'Integrations', id: 'integrations' },
            ].map(({ label, id }) => (
              <button
                key={id}
                onClick={() => scrollTo(id)}
                className="relative px-5 py-1.5 rounded-full text-sm font-medium transition-colors text-gray-500 hover:text-aura-dark hover:bg-gray-100"
              >
                {label}
              </button>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => window.location.href = 'http://localhost:8000/login'}
              className="px-4 py-1.5 rounded-full text-sm font-medium border-1.5 border-gray-300 bg-transparent text-gray-700 hover:text-aura-purple hover:border-aura-purple transition-colors"
            >
              Sign In
            </button>
            <button
              onClick={() => window.location.href = 'http://localhost:8000/login'}
              className="px-5 py-2 rounded-full text-sm font-medium border-none bg-gradient-to-r from-aura-purple to-purple-400 text-white shadow-md hover:-translate-y-0.5 hover:shadow-lg transition-all"
            >
              Get Started Free
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
