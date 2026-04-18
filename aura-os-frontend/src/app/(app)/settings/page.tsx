"use client";

import { useApi } from "@/hooks/useApi";
import { User, Bell, Shield, Smartphone, Moon, Database, RefreshCw } from "lucide-react";
import { useTheme } from "next-themes";
import { useState } from "react";

export default function SettingsPage() {
  const { data, isLoading, refetch, isValidating } = useApi<any>("/api/user/profile");
  const { theme, setTheme } = useTheme();
  const [activeTab, setActiveTab] = useState("Account");

  if (isLoading || !data) {
    return <div className="h-full flex items-center justify-center text-muted">Loading Preferences...</div>;
  }

  const TABS = ["Account", "Integrations", "Appearance"];

  return (
    <div className="flex flex-col h-full w-full bg-background">
      <div className="flex-1 overflow-y-auto w-full p-8 pt-4 custom-scrollbar">
        <div className="max-w-6xl mx-auto w-full">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
            <button 
              onClick={refetch}
              disabled={isValidating}
              className="px-4 py-2 bg-card border border-border rounded-xl text-sm font-medium hover:bg-black/5 dark:hover:bg-white/5 transition-colors flex items-center gap-2 group shadow-sm text-foreground whitespace-nowrap"
            >
              <RefreshCw className={`w-4 h-4 text-foreground ${isValidating ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'}`} />
              {isValidating ? 'Syncing...' : 'Sync Data'}
            </button>
          </div>

          <div className="flex flex-col gap-8 w-full">
            {/* Top settings nav */}
            <div className="flex flex-row overflow-x-auto gap-2 pb-4 mb-2 scrollbar-hide border-b border-border/50">
              {TABS.map(tab => (
                <button 
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`text-left px-5 py-2.5 rounded-lg font-medium transition-colors whitespace-nowrap ${activeTab === tab ? "bg-black/5 dark:bg-white/10 text-foreground shadow-sm" : "text-muted hover:bg-black/5 dark:hover:bg-white/5"}`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Settings Content */}
            <div className="w-full space-y-8">
              
              {activeTab === "Account" && (
            <section className="animate-in fade-in slide-in-from-bottom-2 duration-300">
              <h2 className="text-xl font-semibold mb-4 text-foreground flex items-center gap-2"><User className="w-5 h-5 text-neon-blue" /> Account</h2>
              <div className="bg-card border border-border rounded-xl p-5 shadow-lg">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between py-3 border-b border-border/50 gap-4">
                  <div>
                    <div className="font-medium text-foreground">Email Address</div>
                    <div className="text-sm text-muted">{data.email}</div>
                  </div>
                  <button className="text-sm text-neon-blue font-medium hover:underline">Change Email</button>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between py-3 pt-4 gap-4 mt-2">
                  <div>
                    <div className="font-medium text-red-500">Sign Out</div>
                    <div className="text-sm text-muted">Disconnect this session from AuraOS</div>
                  </div>
                  <a href="http://localhost:8000/api/auth/logout" className="px-4 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 rounded-lg text-sm transition-colors font-medium cursor-pointer text-center">Logout</a>
                </div>
              </div>
            </section>
          )}

          {activeTab === "Integrations" && (
            <section className="animate-in fade-in slide-in-from-bottom-2 duration-300">
              <h2 className="text-xl font-semibold mb-4 text-foreground flex items-center gap-2"><Smartphone className="w-5 h-5 text-neon-pink" /> Integrations</h2>
              <div className="bg-card border border-border rounded-xl p-5 shadow-lg">
                <div className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center border border-blue-500/20">
                      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.33-.01-.98-.19-1.46-.35-.59-.19-.1-.29.21-.52 2.45-1.78 5.48-3.04 6.94-3.66 3.19-1.35 3.86-1.59 4.31-1.6.1 0 .32.02.43.12.09.08.12.2.13.31.02.13.02.27.01.38z"/></svg>
                    </div>
                    <div>
                      <div className="font-medium text-foreground">Telegram Bot</div>
                      <div className="text-xs text-muted mt-1">Chat with AuraOS via Telegram</div>
                      <div className="text-xs text-neon-blue border border-neon-blue/30 bg-neon-blue/10 px-2 mt-2 rounded-md inline-block">
                        {data.telegram_linked ? "Active & Linked" : "Not Linked"}
                      </div>
                    </div>
                  </div>
                  <div className={`w-12 h-6 rounded-full relative cursor-pointer transition-colors ${data.telegram_linked ? "bg-neon-blue" : "bg-black/10 dark:bg-white/10"}`}>
                    <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all ${data.telegram_linked ? "right-1" : "left-1"}`}></div>
                  </div>
                </div>
                {!data.telegram_linked && (
                  <div className="mt-4 p-4 rounded-xl border border-neon-blue/30 bg-neon-blue/5 flex flex-col md:flex-row items-center justify-between gap-4 animate-in fade-in slide-in-from-top-2">
                     <div>
                       <div className="text-sm font-medium text-foreground">Link your Device</div>
                       <div className="text-xs text-muted mt-1">Open the bot and send this code to connect.</div>
                     </div>
                     <div className="flex items-center gap-3">
                       <span className="font-mono text-neon-blue bg-black/10 dark:bg-white/10 px-3 py-1.5 rounded-lg tracking-widest font-bold text-sm">/link {data.link_code}</span>
                       <a href="https://t.me/your_bot_username_here" target="_blank" rel="noopener noreferrer" className="px-4 py-1.5 bg-neon-blue hover:bg-neon-blue/90 text-white rounded-lg text-sm font-medium transition-colors whitespace-nowrap">
                         Open Telegram
                       </a>
                     </div>
                  </div>
                )}
              </div>
            </section>
          )}

          {activeTab === "Appearance" && (
            <section className="animate-in fade-in slide-in-from-bottom-2 duration-300">
              <h2 className="text-xl font-semibold mb-4 text-foreground flex items-center gap-2"><Moon className="w-5 h-5 text-neon-orange" /> Appearance</h2>
              <div className="bg-card border border-border rounded-xl p-5 shadow-lg">
                <div className="flex items-center justify-between py-2">
                  <div>
                    <div className="font-medium text-foreground">Theme Option</div>
                    <div className="text-sm text-muted mt-1">Switch between Clean Light and Deep Dark.</div>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => setTheme('light')}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer ${theme === 'light' ? 'bg-background border-border shadow-sm text-foreground' : 'text-muted hover:text-foreground hover:bg-black/5 dark:hover:bg-white/5'}`}
                    >
                      Light
                    </button>
                    <button 
                      onClick={() => setTheme('dark')}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer ${theme === 'dark' ? 'bg-background border-border shadow-sm text-foreground' : 'text-muted hover:text-foreground hover:bg-black/5 dark:hover:bg-white/5'}`}
                    >
                      Dark
                    </button>
                  </div>
                </div>

              </div>
            </section>
          )}

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
