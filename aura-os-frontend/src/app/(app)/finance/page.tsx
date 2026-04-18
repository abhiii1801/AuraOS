"use client";

import { useApi } from "@/hooks/useApi";
import { ArrowUpRight, ArrowDownRight, CreditCard, RefreshCw } from "lucide-react";
import { AreaChart, Area, XAxis, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { useTheme } from "next-themes";
import { useState } from "react";
import { ChatInterface } from "@/components/ChatInterface";

const PIE_COLORS = ["#00E5FF", "#FF007F", "#FF9900", "#39FF14"];

export default function FinancePage() {
  const [activeFilter, setActiveFilter] = useState("Current Month");
  const { theme } = useTheme();
  
  const isBundledFilter = ["This Week", "Current Month", "Last Month"].includes(activeFilter);
  const apiPath = isBundledFilter
    ? "/api/finance/data?filter=bundled"
    : `/api/finance/data?filter=${encodeURIComponent(activeFilter)}`;

  const { data: rawData, isLoading, refetch, isValidating } = useApi<any>(apiPath);

  let data = null;
  if (rawData?.is_bundled) {
      data = rawData.bundles?.[activeFilter];
      if (data) {
          data.subscriptions = rawData.subscriptions;
      }
  } else {
      data = rawData;
  }

  if (isLoading || !data) {
    return <div className="h-full flex items-center justify-center text-muted">Loading Ledger Data...</div>;
  }

  const pieData = data.category_breakdown || [];

  const tooltipBg = theme === "light" ? "#FFFFFF" : "#151821";
  const tooltipBorder = theme === "light" ? "rgba(15,23,42,0.1)" : "rgba(255,255,255,0.1)";

  return (
    <div className="flex flex-col h-full w-full bg-background">
      <div className="flex-1 overflow-y-auto w-full p-8 pt-4 custom-scrollbar">
        <div className="max-w-6xl mx-auto w-full">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
            <div className="flex flex-wrap items-center gap-4">
              <h1 className="text-3xl font-bold tracking-tight">The Ledger</h1>
              <button 
                onClick={refetch}
                disabled={isValidating}
                className="px-3 py-1.5 bg-card border border-border rounded-xl text-xs font-medium hover:bg-black/5 dark:hover:bg-white/5 transition-colors flex items-center gap-2 group shadow-sm text-foreground whitespace-nowrap"
              >
                <RefreshCw className={`w-3.5 h-3.5 text-neon-cyan ${isValidating ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'}`} />
                {isValidating ? 'Syncing...' : 'Sync'}
              </button>
            </div>
            
            {/* Semantic Time Filters */}
            <div className="flex p-1 bg-card border border-border rounded-xl items-center overflow-x-auto scrollbar-hide">
              <div className="flex gap-2">
                {["This Week", "Current Month", "Last Month", "All Time"].map((f) => (
                  <button 
                    key={f}
                    onClick={() => setActiveFilter(f)}
                    className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${activeFilter === f ? 'bg-black/5 dark:bg-white/10 text-foreground shadow-sm' : 'text-muted hover:text-foreground'}`}
                  >
                    {f}
                  </button>
                ))}
              </div>
              <div className="border-l border-border ml-2 pl-2 pr-1 py-1 flex items-center shrink-0">
                <input 
                  type="month" 
                  title="Specific Month"
                  onChange={(e) => {
                     if (e.target.value) setActiveFilter(e.target.value);
                  }}
                  className={`bg-transparent text-sm font-medium focus:outline-none transition-colors cursor-pointer ${!["This Week", "Current Month", "Last Month", "All Time"].includes(activeFilter) ? 'text-foreground font-bold' : 'text-muted hover:text-foreground'}`}
                />
              </div>
            </div>
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-card border border-border rounded-xl p-5 shadow-lg group relative overflow-hidden flex flex-col justify-center">
              <div className="absolute top-0 right-0 w-32 h-32 bg-neon-cyan/0 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:bg-neon-cyan/10 transition-colors duration-500"></div>
              <div className="text-3xl font-bold text-foreground flex items-center gap-3 tracking-tighter relative z-10 mb-1">
                ₹{data.kpis.total_spent.toLocaleString()}
                <span className="text-[10px] font-medium text-neon-pink flex items-center px-2 py-0.5 border border-neon-pink/30 rounded-md bg-neon-pink/5">
                  MTD
                </span>
              </div>
              <div className="text-xs font-medium text-muted uppercase tracking-wider relative z-10">Total Spent</div>
            </div>
            
            <div className="bg-card border border-border rounded-xl p-5 shadow-lg group relative overflow-hidden flex flex-col justify-center">
              <div className="absolute top-0 right-0 w-32 h-32 bg-neon-green/0 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:bg-neon-green/10 transition-colors duration-500"></div>
              <div className="text-3xl font-bold text-foreground flex items-center gap-3 tracking-tighter relative z-10 mb-1">
                ₹{data.kpis.total_income.toLocaleString()}
                <span className="text-[10px] font-medium text-neon-green flex items-center px-2 py-0.5 border border-neon-green/30 rounded-md bg-neon-green/5">
                  MTD
                </span>
              </div>
              <div className="text-xs font-medium text-muted uppercase tracking-wider relative z-10">Total Income</div>
            </div>

            <div className="bg-card border border-border rounded-xl p-5 shadow-lg group relative overflow-hidden flex flex-col justify-center">
              <div className="absolute top-0 right-0 w-32 h-32 bg-neon-orange/0 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:bg-neon-orange/10 transition-colors duration-500"></div>
              <div className="text-3xl font-bold text-foreground tracking-tighter relative z-10 mb-1">
                {data.kpis.top_category}
              </div>
              <div className="text-xs font-medium text-muted uppercase tracking-wider relative z-10">Top Category</div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Trend Area Chart */}
            <div className="lg:col-span-2 bg-card border border-border rounded-xl p-5 shadow-lg flex flex-col h-[340px]">
              <h3 className="font-semibold text-foreground mb-4">Spending Trends</h3>
              <div className="flex-1 w-full min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data.chart_data}>
                    <defs>
                      <linearGradient id="colorSpent" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#00E5FF" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#00E5FF" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="date" stroke="#8E95A3" fontSize={12} tickLine={false} axisLine={false} />
                    <RechartsTooltip 
                      contentStyle={{ backgroundColor: tooltipBg, borderColor: tooltipBorder, borderRadius: '8px' }}
                      itemStyle={{ color: '#00E5FF', fontWeight: 'bold' }}
                    />
                    <Area type="monotone" dataKey="spent" stroke="#00E5FF" strokeWidth={3} fillOpacity={1} fill="url(#colorSpent)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Categories Donut Chart with Legend */}
            <div className="bg-card border border-border rounded-xl p-5 shadow-lg flex flex-col items-center justify-between h-[340px]">
              <h3 className="font-semibold text-foreground self-start mb-0">Distribution</h3>
              <div className="w-full flex-1 min-h-[160px] relative pointer-events-none">
                {/* Centered Total Amount inside Donut */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-10">
                  <span className="text-2xl font-bold leading-none tracking-tighter text-foreground">
                    ₹{(data.kpis.total_spent / 1000).toFixed(1)}k
                  </span>
                  <span className="text-[10px] text-muted uppercase mt-1 tracking-wider">Total</span>
                </div>
                {/* Recharts ignores wrapper pointer events for interactions if we make the container none, 
                    Wait, better to make only the absolute text block pointer-events-none so chart tooltips work. */}
                <div className="w-full h-full pointer-events-auto">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        innerRadius={55}
                        outerRadius={75}
                        paddingAngle={5}
                        dataKey="value"
                        stroke="none"
                      >
                        {pieData.map((entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <RechartsTooltip 
                        contentStyle={{ backgroundColor: tooltipBg, borderColor: tooltipBorder, borderRadius: '8px' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div className="w-full grid grid-cols-2 gap-2 mt-2 pointer-events-auto">
                {pieData.map((d: any, i: number) => (
                  <div key={d.name} className="flex items-center gap-2 text-xs">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }}></span>
                    <span className="text-muted truncate" title={d.name}>{d.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 mb-8">
            {/* Transactions - Full Width & Taller */}
            <div className="bg-card border border-border rounded-xl p-5 shadow-lg flex flex-col max-h-[500px]">
              <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2 flex-shrink-0">
                <CreditCard className="w-5 h-5 text-neon-blue" /> Recent Transactions
              </h3>
              <div className="overflow-y-auto pr-2 flex-1">
                {data.transactions.length > 0 ? (
                <table className="w-full text-left text-sm">
                  <thead className="sticky top-0 bg-card z-10">
                    <tr className="text-muted border-b border-border">
                      <th className="pb-3 font-medium">Date</th>
                      <th className="pb-3 font-medium">Merchant</th>
                      <th className="pb-3 font-medium">Category</th>
                      <th className="pb-3 font-medium text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.transactions.map((tx: any) => (
                      <tr key={tx.id} className="border-b border-border/50 hover:bg-black/5 dark:hover:bg-white/5 transition-colors group">
                        <td className="py-3 text-muted/70">{new Date(tx.date).toLocaleDateString(undefined, {month:'short', day:'numeric'})}</td>
                        <td className="py-3 font-medium text-foreground group-hover:text-neon-cyan transition-colors">{tx.merchant}</td>
                        <td className="py-3 text-muted">{tx.category}</td>
                        <td className={`py-3 text-right font-medium ${tx.transaction_type === 'credit' ? 'text-neon-green' : 'text-foreground'}`}>
                          {tx.transaction_type === 'credit' ? '+' : '-'}₹{tx.amount.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                ) : (
                    <div className="py-12 text-center flex flex-col items-center justify-center h-full">
                       <CreditCard className="w-10 h-10 text-muted opacity-30 mb-3" />
                       <div className="text-foreground font-medium mb-1">No Transactions Found</div>
                       <div className="text-muted text-sm max-w-xs">There are no financial records for this period. Upload a statement or log an expense below.</div>
                    </div>
                )}
              </div>
            </div>

            {/* Subscriptions - Placed Below Transactions */}
            <div className="bg-card border border-border rounded-xl p-5 shadow-lg flex flex-col">
              <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2 flex-shrink-0">
                <RefreshCw className="w-5 h-5 text-neon-orange" /> Active Subscriptions
              </h3>
              {data.subscriptions.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {data.subscriptions.map((sub: any, i: number) => (
                  <div key={i} className="flex justify-between items-center p-4 rounded-xl bg-background border border-border shadow-sm hover:border-neon-orange/30 transition-colors">
                    <div>
                      <div className="font-medium text-foreground">{sub.name}</div>
                      <div className="text-xs text-muted mt-1 font-mono">Renews: {new Date(sub.next_billing).toLocaleDateString()}</div>
                    </div>
                    <div className="text-lg font-bold text-foreground">
                      ₹{sub.amount.toLocaleString()}<span className="text-xs text-muted font-normal">/mo</span>
                    </div>
                  </div>
                ))}
              </div>
              ) : (
                  <div className="py-8 text-center flex flex-col items-center justify-center">
                     <div className="text-muted text-sm border-2 border-dashed border-border rounded-xl w-full p-6">You have no active subscriptions tracking right now.</div>
                  </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      <ChatInterface placeholder="Ask about spending or log an expense..." context="finance" />
    </div>
  );
}
