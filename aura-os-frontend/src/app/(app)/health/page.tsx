"use client";

import { useApi } from "@/hooks/useApi";
import { Heart, Flame, Navigation, Clock, RefreshCw, ActivitySquare } from "lucide-react";
import { LineChart, Line, XAxis, Tooltip as RechartsTooltip, ResponsiveContainer, YAxis, RadarChart, PolarGrid, PolarAngleAxis, Radar } from "recharts";
import { useTheme } from "next-themes";
import { useState, useMemo } from "react";
import { ChatInterface } from "@/components/ChatInterface";

export default function HealthPage() {
  const { data, isLoading, refetch, isValidating } = useApi<any>("/api/health/metrics");
  const { theme } = useTheme();
  const [activeMetric, setActiveMetric] = useState("steps");

  const METRICS = [
    { id: "steps", label: "Steps", color: "#39FF14", unit: "k", div: 1000 },
    { id: "distance", label: "Distance", color: "#00E5FF", unit: "km", div: 1000 },
    { id: "calories", label: "Calories", color: "#FF9900", unit: "k", div: 1000 },
    { id: "active_minutes", label: "Active Time", color: "#007BFF", unit: "m", div: 1 },
  ];
  
  const currentMetric = METRICS.find(m => m.id === activeMetric) || METRICS[0];

  const formattedChartData = useMemo(() => {
    if (!data?.weekly_chart) return [];
    return data.weekly_chart.map((day: any) => ({
       ...day,
       steps: day.steps || 0,
       distance: day.distance || Math.floor((day.steps || 0) * 0.75), // rough meters
       calories: day.calories || Math.floor((day.steps || 0) * 0.04), // rough kcal
       active_minutes: day.active_minutes || Math.floor((day.steps || 0) * 0.01) // rough mins
    }));
  }, [data?.weekly_chart]);

  if (isLoading || !data) {
    return <div className="h-full flex items-center justify-center text-muted">Scanning Biometrics...</div>;
  }

  return (
    <div className="flex flex-col h-full w-full bg-background">
      <div className="flex-1 overflow-y-auto w-full p-8 pt-4 custom-scrollbar">
        <div className="max-w-6xl mx-auto w-full">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
              Biometrics <Heart className="text-neon-pink w-6 h-6 animate-pulse" />
            </h1>
            <button 
              onClick={refetch}
              disabled={isValidating}
              className="px-4 py-2 bg-card border border-border rounded-xl text-sm font-medium hover:bg-black/5 dark:hover:bg-white/5 transition-colors flex items-center gap-2 group shadow-sm text-foreground whitespace-nowrap"
            >
              <RefreshCw className={`w-4 h-4 text-neon-pink ${isValidating ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'}`} />
              {isValidating ? 'Syncing...' : 'Sync Data'}
            </button>
          </div>

          {/* Typographic KPI Numbers */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-card border border-border p-6 rounded-2xl shadow-lg relative overflow-hidden group flex flex-col justify-center">
              <div className="absolute top-0 right-0 w-32 h-32 bg-neon-green/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:bg-neon-green/20 transition-colors"></div>
              <Navigation className="w-6 h-6 text-neon-green mb-3" />
              <div className="text-4xl lg:text-5xl font-bold text-foreground mb-1 tracking-tighter relative z-10">{data.steps.toLocaleString()}</div>
              <div className="text-xs font-medium text-muted uppercase tracking-wider relative z-10">Steps</div>
            </div>
            
            <div className="bg-card border border-border p-6 rounded-2xl shadow-lg relative overflow-hidden group flex flex-col justify-center">
              <div className="absolute top-0 right-0 w-32 h-32 bg-neon-cyan/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:bg-neon-cyan/20 transition-colors"></div>
              <div className="w-6 h-6 text-neon-cyan mb-3 font-bold text-xl leading-none italic">km</div>
              <div className="text-4xl lg:text-5xl font-bold text-foreground mb-1 tracking-tighter relative z-10">{data.distance.toFixed(1)}</div>
              <div className="text-xs font-medium text-muted uppercase tracking-wider relative z-10">Distance</div>
            </div>

            <div className="bg-card border border-border p-6 rounded-2xl shadow-lg relative overflow-hidden group flex flex-col justify-center">
              <div className="absolute top-0 right-0 w-32 h-32 bg-neon-orange/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:bg-neon-orange/20 transition-colors"></div>
              <Flame className="w-6 h-6 text-neon-orange mb-3" />
              <div className="text-4xl lg:text-5xl font-bold text-foreground mb-1 tracking-tighter relative z-10">{data.calories.toLocaleString()}</div>
              <div className="text-xs font-medium text-muted uppercase tracking-wider relative z-10">Calories</div>
            </div>

            <div className="bg-card border border-border p-6 rounded-2xl shadow-lg relative overflow-hidden group flex flex-col justify-center">
              <div className="absolute top-0 right-0 w-32 h-32 bg-neon-blue/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:bg-neon-blue/20 transition-colors"></div>
              <Clock className="w-6 h-6 text-neon-blue mb-3" />
              <div className="text-4xl lg:text-5xl font-bold text-foreground mb-1 tracking-tighter relative z-10">{data.active_minutes}</div>
              <div className="text-xs font-medium text-muted uppercase tracking-wider relative z-10">Active Min</div>
            </div>
          </div>

          {/* 7-day movement trend multi-line chart */}
          <div className="bg-card border border-border rounded-xl p-6 shadow-lg flex flex-col mb-8">
            <h3 className="font-semibold text-foreground mb-6">Movement Trends (7 Days)</h3>
            <div className="h-80 w-full min-h-0 mb-4">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={formattedChartData}>
                  <XAxis dataKey="day" stroke="#8E95A3" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#8E95A3" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `${val/currentMetric.div}${currentMetric.unit}`} />
                  <RechartsTooltip 
                    contentStyle={{ backgroundColor: theme === 'light' ? '#FFFFFF' : '#151821', borderColor: `${currentMetric.color}40`, borderRadius: '8px' }}
                    itemStyle={{ color: currentMetric.color }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey={activeMetric} 
                    stroke={currentMetric.color} 
                    strokeWidth={4} 
                    dot={{ fill: 'var(--background)', stroke: currentMetric.color, strokeWidth: 2, r: 4 }} 
                    activeDot={{ r: 6, fill: currentMetric.color, stroke: 'var(--background)', strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            
            <div className="flex flex-wrap gap-2 justify-center">
              {METRICS.map(m => (
                <button 
                  key={m.id}
                  onClick={() => setActiveMetric(m.id)}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all border ${activeMetric === m.id ? 'shadow-sm' : 'border-transparent text-muted hover:text-foreground hover:bg-black/5 dark:hover:bg-white/5'}`}
                  style={activeMetric === m.id ? { backgroundColor: `${m.color}15`, borderColor: `${m.color}50`, color: m.color } : {}}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          {/* AI DIAGNOSTIC CHART */}
          <div className="bg-card border border-border rounded-xl p-6 shadow-lg mb-8 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-neon-pink/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-neon-pink/10 transition-colors"></div>
            <h3 className="font-semibold text-foreground mb-6 flex items-center gap-2">
              <ActivitySquare className="w-5 h-5 text-neon-pink" /> 
              AI Diagnostic Correlatives
              <span className="text-xs font-normal text-muted bg-black/10 dark:bg-white/10 px-2 py-0.5 rounded-md ml-2 border border-border">AI Simulated</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center relative z-10">
               <div className="h-64">
                 <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="70%" data={[
                      { subject: 'Sleep', A: 85, fullMark: 100 },
                      { subject: 'Focus', A: 65, fullMark: 100 },
                      { subject: 'Diet', A: 90, fullMark: 100 },
                      { subject: 'Activity', A: 70, fullMark: 100 },
                      { subject: 'Stress', A: 45, fullMark: 100 },
                      { subject: 'Recovery', A: 80, fullMark: 100 },
                    ]}>
                      <PolarGrid stroke="var(--color-border)" />
                      <PolarAngleAxis dataKey="subject" tick={{ fill: '#8E95A3', fontSize: 12 }} />
                      <Radar name="Aura AI" dataKey="A" stroke="#FF007F" fill="#FF007F" fillOpacity={0.2} />
                      <RechartsTooltip contentStyle={{ backgroundColor: theme === 'light' ? '#FFFFFF' : '#151821', borderColor: 'rgba(255,0,127,0.3)', borderRadius: '8px' }} itemStyle={{ color: '#FF007F' }}/>
                    </RadarChart>
                 </ResponsiveContainer>
               </div>
               <div>
                 <div className="space-y-4">
                   <div className="p-4 rounded-xl bg-neon-pink/5 border border-neon-pink/20">
                     <div className="font-medium text-foreground mb-1">Optimal Recovery State</div>
                     <div className="text-sm text-muted">Your diet and sleep quality are correlating strongly with an 80% recovery score today. This suggests peak cognitive performance for deep work.</div>
                   </div>
                   <div className="p-4 rounded-xl bg-black/5 dark:bg-white/5 border border-border">
                     <div className="font-medium text-foreground mb-1">Stress vs Activity</div>
                     <div className="text-sm text-muted">Mild elevation in stress markers detected when daily active minutes fall below 30m. Consider a 15 min protocol this evening.</div>
                   </div>
                 </div>
               </div>
            </div>
          </div>
        </div>
      </div>
      
      <ChatInterface placeholder="Log health data or ask for insights..." context="health" />
    </div>
  );
}
