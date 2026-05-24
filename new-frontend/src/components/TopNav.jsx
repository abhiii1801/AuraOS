import { Settings, Bell, Sparkles } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function TopNav() {
  const navigate = useNavigate();
  const location = useLocation();

  // We map the tabs to their actual routes in the app
  const navItems = [
    { name: 'Overview', path: '/overview' },
    { name: 'Finance', path: '/finance' },
    { name: 'Vault', path: '/vault' },
    { name: 'Health', path: '/health' },
    { name: 'Feed', path: '/feed' }
  ];

  return (
    <div className="relative flex flex-col md:flex-row items-center justify-between gap-4 bg-white px-6 py-4 w-full shadow-sm border border-gray-100 rounded-2xl">
      <div className="flex items-center gap-8 w-full md:w-auto">
        <div 
          className="flex items-center gap-2 font-bold text-xl text-aura-purple cursor-pointer"
          onClick={() => navigate('/overview')}
        >
          <div className="w-8 h-8 rounded-full bg-aura-purple text-white flex items-center justify-center">A</div>
          AuraOS
        </div>
      </div>

      <div className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-gray-50 rounded-full p-1 border border-gray-200">
        {navItems.map((tab) => {
          const isActive = location.pathname === tab.path;
          return (
            <button 
              key={tab.name} 
              onClick={() => navigate(tab.path)}
              className={`relative px-5 py-1.5 rounded-full text-sm font-medium transition-colors ${
                isActive 
                  ? 'text-white' 
                  : 'text-gray-500 hover:text-aura-dark hover:bg-gray-100'
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="activeTopNavTab"
                  className="absolute inset-0 bg-aura-dark rounded-full shadow-sm"
                  transition={{ type: "spring", stiffness: 350, damping: 30 }}
                />
              )}
              <span className="relative z-10">{tab.name}</span>
            </button>
          );
        })}
      </div>

      <div className="flex items-center gap-5 w-full md:w-auto justify-end">
        <div className="hidden md:flex items-center gap-4 text-gray-400">
          <Settings size={20} className="cursor-pointer hover:text-aura-dark transition-colors" />
          <div className="relative">
             <Bell size={20} className="cursor-pointer hover:text-aura-dark transition-colors" />
             <div className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border border-white"></div>
          </div>
        </div>
        
        <button 
          onClick={() => navigate('/chat')}
          className={`px-5 py-2 rounded-full text-sm font-medium flex items-center gap-2 shadow-md transition-all ${
            location.pathname === '/chat'
              ? 'bg-aura-dark text-white ring-2 ring-aura-purple ring-offset-2'
              : 'bg-gradient-to-r from-aura-purple to-pink-500 text-white hover:opacity-90'
          }`}
        >
          <Sparkles size={16} fill={location.pathname === '/chat' ? "none" : "currentColor"} />
          Ask Aura
        </button>
      </div>
    </div>
  );
}