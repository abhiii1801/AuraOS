"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Wallet, BrainCircuit, Activity, Settings, Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import { useApi } from "@/hooks/useApi";

export function Sidebar() {
  const pathname = usePathname();
  const { data } = useApi<any>("/api/user/profile");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const navItems = [
    { href: "/dashboard", icon: LayoutDashboard, label: "Command Center", color: "text-neon-cyan" },
    { href: "/finance", icon: Wallet, label: "The Ledger", color: "text-neon-orange" },
    { href: "/vault", icon: BrainCircuit, label: "The Vault", color: "text-neon-blue" },
    { href: "/health", icon: Activity, label: "Biometrics", color: "text-neon-green" }
  ];

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-20 hover:w-64 bg-card border-r border-border py-6 px-4 flex flex-col justify-between z-50 transition-[width] duration-300 ease-in-out group overflow-x-hidden whitespace-nowrap shadow-2xl">
      <div>
        {/* Logo */}
        <div className="flex items-center gap-4 mb-10 px-2 h-10">
          <div className="w-8 h-8 rounded-full flex-shrink-0 bg-gradient-to-br from-neon-cyan to-neon-blue flex items-center justify-center">
            <span className="font-bold text-white tracking-widest pl-0.5">A</span>
          </div>
          <span className="font-bold text-xl tracking-tight text-foreground opacity-0 group-hover:opacity-100 transition-opacity">
            Aura<span className="text-neon-cyan">OS</span>
          </span>
        </div>
        
        {/* Main Nav */}
        <nav className="space-y-3">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link 
                key={item.href} 
                href={item.href} 
                className={`flex items-center gap-4 px-2 py-3 rounded-xl transition-colors ${
                  isActive 
                    ? "bg-black/5 dark:bg-white/10 text-foreground" 
                    : "text-muted hover:text-foreground hover:bg-black/5 dark:hover:bg-white/5"
                }`}
              >
                <div className="w-8 h-8 flex items-center justify-center flex-shrink-0">
                  <Icon size={22} className={isActive ? item.color : ""} />
                </div>
                <span className={`font-semibold opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap ${isActive ? "" : "font-medium"}`}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="space-y-4 pb-2">
        {/* Settings Button */}
        <Link href="/settings" className={`flex items-center gap-4 px-2 py-3 rounded-xl transition-colors ${
          pathname === "/settings" 
            ? "bg-black/5 dark:bg-white/10 text-foreground" 
            : "text-muted hover:text-foreground hover:bg-black/5 dark:hover:bg-white/5"
        }`}>
          <div className="w-8 h-8 flex items-center justify-center flex-shrink-0">
            <Settings size={22} />
          </div>
          <span className="font-medium opacity-0 group-hover:opacity-100 transition-opacity">Settings</span>
        </Link>

        {/* User Profile */}
        <div className="mt-6 p-2 rounded-xl border border-transparent group-hover:border-border group-hover:bg-background flex items-center gap-3 transition-colors overflow-hidden">
          {data?.picture ? (
             <img src={data.picture} alt="Profile" referrerPolicy="no-referrer" className="w-8 h-8 rounded-full flex-shrink-0 object-cover shadow-lg ml-1" />
          ) : (
             <div className="w-8 h-8 rounded-full flex-shrink-0 bg-gradient-to-r from-neon-pink to-neon-orange flex items-center justify-center text-white font-bold shadow-lg text-sm ml-1">
               {data?.name ? data.name.charAt(0).toUpperCase() : "A"}
             </div>
          )}
          <div className="opacity-0 group-hover:opacity-100 transition-opacity min-w-0">
            <p className="text-sm font-semibold truncate text-foreground leading-tight">{data?.name || "Agent"}</p>
            <p className="text-xs text-muted truncate leading-tight">{data?.email || "Loading..."}</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
