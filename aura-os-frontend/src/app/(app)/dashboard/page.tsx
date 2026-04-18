"use client";

import { useApi } from "@/hooks/useApi";
import { Calendar, Activity, Wallet, Sparkles, Navigation, AlertCircle, RefreshCw, Smartphone, Zap, ChevronRight } from "lucide-react";
import { ChatInterface } from "@/components/ChatInterface";

export default function Dashboard() {
  const { data, isLoading, refetch, isValidating } = useApi<any>("/api/dashboard/summary");

  // Background preloading ONLY AFTER dashboard data is secured
  const isLoaded = !!data && !isLoading;
  useApi<any>(isLoaded ? "/api/finance/data?filter=bundled" : null);
  useApi<any>(isLoaded ? "/api/vault/nodes" : null);
  useApi<any>(isLoaded ? "/api/health/metrics" : null);

  if (isLoading || !data) {
    return <div className="h-full flex items-center justify-center text-muted text-xs uppercase tracking-wider">Booting AuraOS...</div>;
  }

  const nextProtocols = data.upcoming_events?.slice(0, 3) || [];

  return (
    <div className="flex flex-col h-full w-full bg-background">
      <div className="flex-1 overflow-y-auto w-full p-8 pt-4 custom-scrollbar">
        <div className="max-w-6xl mx-auto w-full">
          {/* Hero Greeting */}
          <div className="mb-10 mt-4 flex flex-col md:flex-row md:items-start justify-between gap-4">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground mb-4">
                Welcome back, <span className="text-neon-cyan">{data.user_name || "Agent"}</span>
              </h1>
              <p className="text-xl text-muted max-w-2xl leading-relaxed">
                {data.briefing}
              </p>
            </div>
            <button 
              onClick={refetch}
              disabled={isValidating}
              className="px-4 py-2 bg-card border border-border rounded-xl text-sm font-medium hover:bg-black/5 dark:hover:bg-white/5 transition-colors flex items-center gap-2 group shadow-sm text-foreground whitespace-nowrap"
            >
              <RefreshCw className={`w-4 h-4 text-neon-cyan ${isValidating ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'}`} />
              {isValidating ? 'Syncing...' : 'Sync Data'}
            </button>
          </div>

          {/* Glance Widgets (Top Row) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            
            {/* Vertical Timeline Schedule */}
            <div className="bg-card border border-border rounded-xl p-6 shadow-lg md:col-span-1 h-[240px]">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-foreground flex items-center gap-2 text-lg tracking-tight">
                  <Calendar className="text-neon-pink w-5 h-5" /> Next Protocols
                </h3>
              </div>
              <div className="space-y-0 relative pl-4 mt-2">
                {/* The structural vertical line */}
                <div className="absolute top-2 bottom-2 left-[51px] w-[2px] bg-border z-0"></div>
                
                {nextProtocols.length > 0 ? nextProtocols.map((ev: any, index: number) => {
                  return (
                    <div key={index} className="relative flex items-center gap-4 py-3 group">
                      <div className="w-10 text-right shrink-0">
                        <span className="text-xs font-mono text-muted">{ev.time}</span>
                      </div>
                      <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 z-10 shadow-[0_0_8px_currentColor] text-neon-cyan bg-neon-cyan`} />
                      <div className="flex-1 transition-transform group-hover:translate-x-1">
                        <span className="font-semibold text-foreground text-sm leading-none block">{ev.title}</span>
                      </div>
                    </div>
                  );
                }) : (
                  <div className="py-6 text-center text-muted text-sm mt-4 relative z-10 bg-card">No more protocols scheduled today.</div>
                )}
              </div>
            </div>

            {/* Biometrics */}
            <div className="bg-card border border-border rounded-xl p-6 shadow-lg h-[240px] relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-neon-green/0 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:bg-neon-green/20 transition-colors duration-500"></div>
              <Navigation className="w-5 h-5 text-neon-green mb-4" />
              <div className="h-full flex flex-col justify-center pb-8 relative z-10">
                <div className="text-4xl lg:text-5xl font-bold text-foreground mb-1 tracking-tighter">{data.today_steps.toLocaleString()}</div>
                <div className="text-xs text-muted font-medium uppercase tracking-wider">Steps Today</div>
                <div className="mt-8 w-full bg-background rounded-full h-1.5 overflow-hidden border border-border relative">
                  <div className="h-full bg-neon-green relative z-10" style={{ width: `${Math.min(100, (data.today_steps / 10000) * 100)}%` }}></div>
                </div>
              </div>
            </div>

            {/* Finance */}
            <div className="bg-card border border-border rounded-xl p-6 shadow-lg h-[240px] relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-neon-orange/0 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:bg-neon-orange/20 transition-colors duration-500"></div>
              <Wallet className="w-5 h-5 text-neon-orange mb-4" />
              <div className="h-full flex flex-col justify-center pb-8 relative z-10">
                <div className="text-4xl lg:text-5xl font-bold text-foreground mb-1 tracking-tighter">₹{data.mtd_spent.toLocaleString()}</div>
                <div className="text-xs text-muted font-medium uppercase tracking-wider">Month to Date Spent</div>
              </div>
            </div>
          </div>

          {/* AI Action Items & Insights (Middle Row) */}
          <div className="mb-8">
            <h3 className="font-semibold text-foreground flex items-center gap-2 text-lg mb-4 tracking-tight">
              <Sparkles className="text-neon-cyan w-5 h-5 animate-pulse" /> AI Action Items & Insights
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[0, 1, 2].map((idx) => {
                const item = data.insights?.[idx];
                if (!item) {
                   return (
                     <div key={`empty-${idx}`} className="bg-card border border-border border-dashed rounded-xl p-5 shadow-sm opacity-50 flex items-center justify-center text-center h-[120px]">
                        <span className="text-muted text-sm px-4">Awaiting new data correlatives...</span>
                     </div>
                   );
                }
                const Icon = item.icon === 'subscription' ? RefreshCw : item.icon === 'health' ? Activity : AlertCircle;
                const iconColor = item.priority === 'high' ? 'text-neon-pink' : 'text-neon-blue';
                
                return (
                  <div key={item.id} className="bg-card border border-border rounded-xl p-5 shadow-lg relative overflow-hidden group flex flex-col justify-center gap-3 min-h-[120px]">
                     <Icon className={`w-5 h-5 ${iconColor} drop-shadow-[0_0_8px_currentColor]`} />
                     <p className="text-sm font-medium text-foreground leading-relaxed">
                       {item.text}
                     </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Dashboard Notifications / Prompts */}
          {data.telegram_linked === false && (
            <div className="mb-8 p-4 md:p-6 bg-gradient-to-r from-neon-blue/10 to-transparent border border-neon-blue/30 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4 relative overflow-hidden group">
               <div className="absolute inset-0 bg-neon-blue/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
               <div className="flex items-center gap-4 relative z-10">
                 <div className="w-12 h-12 rounded-full bg-neon-blue/20 text-neon-blue flex items-center justify-center border border-neon-blue/30 shrink-0">
                    <Smartphone className="w-6 h-6" />
                 </div>
                 <div>
                   <h3 className="font-bold text-foreground text-lg mb-1">Connect Telegram</h3>
                   <p className="text-sm text-muted">Link your phone to log data and receive notifications directly from AuraOS.</p>
                 </div>
               </div>
               <a href="/settings" className="px-6 py-2.5 bg-neon-blue text-white font-medium rounded-xl hover:bg-neon-blue/90 transition-colors shadow-[0_0_15px_rgba(0,123,255,0.4)] whitespace-nowrap relative z-10">
                 Link Device
               </a>
            </div>
          )}

          {/* Try Features */}
          <div className="mb-8">
            <h3 className="font-semibold text-foreground flex items-center gap-2 text-lg mb-4 tracking-tight">
              <Zap className="text-neon-orange w-5 h-5" /> Discover Features
            </h3>
            <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
               {[
                 { title: "Analyze Spending", prompt: "Summarize my spending patterns this week and categorize anomalies.", color: "text-neon-orange", borderHover: "hover:border-neon-orange/50" },
                 { title: "Log a Meal", prompt: "I just ate a chicken salad for lunch. Add 450 calories.", color: "text-neon-green", borderHover: "hover:border-neon-green/50" },
                 { title: "Save a Concept", prompt: "Store this in my vault: React Server Components fundamentally shift data fetching to the backend.", color: "text-neon-pink", borderHover: "hover:border-neon-pink/50" }
               ].map((feature, i) => (
                 <div key={i} className={`flex-shrink-0 w-64 p-5 rounded-2xl border border-border bg-card ${feature.borderHover} transition-all group cursor-pointer flex flex-col justify-between`}
                      onClick={() => window.dispatchEvent(new CustomEvent('insertAuraPrompt', { detail: feature.prompt }))}
                 >
                    <div>
                      <div className="font-semibold text-foreground mb-2">{feature.title}</div>
                      <div className="text-xs text-muted line-clamp-2">{feature.prompt}</div>
                    </div>
                    <div className={`mt-4 text-xs font-bold ${feature.color} flex items-center gap-1 opacity-70 group-hover:opacity-100 transition-opacity uppercase tracking-wider`}>
                       Try Now <ChevronRight className="w-3 h-3" />
                    </div>
                 </div>
               ))}
            </div>
          </div>

        </div>
      </div>
      
      <ChatInterface placeholder="Start typing a command or ask Aura..." context="global" />
    </div>
  );
}
