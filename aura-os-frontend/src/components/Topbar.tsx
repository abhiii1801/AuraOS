"use client";

import { Search, Command } from "lucide-react";
import { useEffect, useState } from "react";

export function Topbar() {
  const [hide, setHide] = useState(false);

  useEffect(() => {
    const checkSettings = () => {
      const val = localStorage.getItem("hideTopbar");
      setHide(val === "true");
    };
    checkSettings();
    window.addEventListener("settingsChange", checkSettings);
    return () => window.removeEventListener("settingsChange", checkSettings);
  }, []);

  if (hide) return null;

  return (
    <header className="h-16 flex-shrink-0 bg-background/80 backdrop-blur border-b border-border z-40 flex items-center justify-center px-8 transition-all">
      <div className="w-full max-w-2xl relative flex items-center">
        <Search className="absolute left-4 text-muted w-5 h-5 pointer-events-none" />
        <input 
          type="text" 
          placeholder="Global Quick Command..." 
          className="w-full bg-card border border-border rounded-xl py-2.5 pl-12 pr-12 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-neon-cyan/50 focus:border-neon-cyan/50 transition-all placeholder:text-muted"
        />
        <div className="absolute right-4 flex items-center gap-1 opacity-50 pointer-events-none">
          <Command className="w-3 h-3 text-muted" />
          <span className="text-xs text-muted font-medium">K</span>
        </div>
      </div>
    </header>
  );
}
