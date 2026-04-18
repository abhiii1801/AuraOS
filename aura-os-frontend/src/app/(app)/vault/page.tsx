"use client";

import { useApi } from "@/hooks/useApi";
import { useRef, useEffect, useState, useMemo } from "react";
import { Search, Filter, RefreshCw } from "lucide-react";
import dynamic from "next/dynamic";
import { useTheme } from "next-themes";
import { ChatInterface } from "@/components/ChatInterface";

const ForceGraph2D = dynamic(() => import("react-force-graph-2d"), { ssr: false, loading: () => <div className="text-muted tracking-widest font-mono text-sm">INITIALIZING FORCE GRAPH...</div> });

export default function VaultPage() {
  const { data, isLoading, refetch, isValidating } = useApi<any>("/api/vault/nodes");
  const [dimensions, setDimensions] = useState({ width: 800, height: 350 });
  const containerRef = useRef<HTMLDivElement>(null);
  const { theme } = useTheme();

  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        setDimensions({ 
          width: containerRef.current.offsetWidth, 
          height: containerRef.current.offsetHeight 
        });
      }
    };
    
    // Initial size
    handleResize();
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isLoading]);

  const [activeFilter, setActiveFilter] = useState("All");

  const { filters, displayGraph } = useMemo(() => {
    if (!data) return { filters: ["All"], displayGraph: { nodes: [], links: [] } };
    
    const uniqueCategories = Array.from(new Set(data.nodes.map((n: any) => n.category))) as string[];
    const filters = ["All", ...uniqueCategories];
    
    const displayNodes = activeFilter === "All" ? data.nodes : data.nodes.filter((n: any) => n.category === activeFilter);
    const displayNodeIds = new Set(displayNodes.map((n: any) => n.id));
    
    const displayLinks = data.links.filter((l: any) => {
       const sourceId = typeof l.source === 'object' ? l.source.id : l.source;
       const targetId = typeof l.target === 'object' ? l.target.id : l.target;
       return displayNodeIds.has(sourceId) && displayNodeIds.has(targetId);
    });
    
    return { filters, displayGraph: { nodes: displayNodes, links: displayLinks } };
  }, [data, activeFilter]);

  const fgRef = useRef<any>(null);

  useEffect(() => {
    if (fgRef.current && displayGraph.nodes.length > 0) {
      fgRef.current.d3Force('link').distance((link: any) => {
        return 100 / Math.max(0.1, link.value || 0.5);
      });
      // Ensure particles match value intensity if we use any
      fgRef.current.d3ReheatSimulation();
    }
  }, [displayGraph]);

  if (isLoading || !data) {
    return <div className="h-full flex items-center justify-center text-muted">Loading the Brain...</div>;
  }

  const linkColor = theme === "light" ? "rgba(15,23,42,0.15)" : "rgba(255,255,255,0.15)";
  const getCategoryColor = (category: string) => {
    if (category === 'Idea') return '#FF9900';
    if (category === 'People') return '#FF007F';
    if (category === 'Resource') return '#007BFF';
    if (category === 'Media') return '#39FF14';
    if (category === 'Journal') return '#00E5FF';
    return '#8E95A3';
  };

  return (
    <div className="flex flex-col h-full w-full bg-background">
      <div className="flex-1 overflow-y-auto w-full p-8 pt-4 custom-scrollbar">
        <div className="max-w-6xl mx-auto w-full">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold tracking-tight">The Vault</h1>
            <button 
              onClick={refetch}
              disabled={isValidating}
              className="px-4 py-2 bg-card border border-border rounded-xl text-sm font-medium hover:bg-black/5 dark:hover:bg-white/5 transition-colors flex items-center gap-2 group shadow-sm text-foreground whitespace-nowrap"
            >
              <RefreshCw className={`w-4 h-4 text-neon-blue ${isValidating ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'}`} />
              {isValidating ? 'Syncing...' : 'Sync Data'}
            </button>
          </div>

          {/* Semantic Search Base - Full Width */}
          <div className="mb-8 relative w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neon-blue w-6 h-6 pointer-events-none" />
            <input 
              type="text" 
              placeholder="Search your brain..." 
              className="w-full bg-card border border-neon-blue/30 rounded-2xl py-4 pl-14 pr-4 text-lg text-foreground focus:outline-none focus:ring-1 focus:ring-neon-blue transition-all shadow-[0_0_20px_rgba(0,123,255,0.1)]"
            />
          </div>

          {/* Interactive 2D Graph */}
          {displayGraph.nodes.length > 0 && (
          <div ref={containerRef} className="mb-8 h-[350px] w-full bg-card border border-border rounded-xl relative overflow-hidden flex items-center justify-center shadow-lg group">
            <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-neon-blue/5 dark:bg-neon-blue/10 rounded-full blur-[100px] pointer-events-none"></div>
            
            <div className="absolute inset-0 z-10 cursor-grab active:cursor-grabbing flex items-center justify-center">
               <ForceGraph2D
                  ref={fgRef}
                  width={dimensions.width}
                  height={dimensions.height}
                  graphData={displayGraph}
                  nodeLabel="label"
                  linkColor={() => linkColor}
                  backgroundColor="transparent"
                  linkWidth={1.5}
                  nodeCanvasObject={(node: any, ctx, globalScale) => {
                    const color = getCategoryColor(node.category);
                    const size = 4.5;
                    
                    // Draw hollow Hexagon
                    ctx.beginPath();
                    for (let i = 0; i < 6; i++) {
                      const angle = (Math.PI / 3) * i - Math.PI / 6;
                      const px = node.x + size * Math.cos(angle);
                      const py = node.y + size * Math.sin(angle);
                      if (i === 0) ctx.moveTo(px, py);
                      else ctx.lineTo(px, py);
                    }
                    ctx.closePath();
                    
                    ctx.lineWidth = 1.2 / globalScale;
                    ctx.strokeStyle = color;
                    ctx.stroke();

                    // Inner bright core
                    ctx.beginPath();
                    ctx.arc(node.x, node.y, 1.5, 0, 2 * Math.PI, false);
                    ctx.fillStyle = color;
                    ctx.fill();

                    // Floating text label
                    const fontSize = Math.max(10 / globalScale, 2); 
                    ctx.font = `${fontSize}px sans-serif`;
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'top';
                    ctx.fillStyle = theme === 'dark' ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.6)';
                    ctx.fillText(node.label, node.x, node.y + size + 2);
                  }}
                  onNodeClick={(node) => console.log(node)}
               />
            </div>
          </div>
          )}

          {/* Filters */}
          <div className="flex gap-3 mb-8 overflow-x-auto pb-2 scrollbar-hide">
            <div className="flex items-center gap-2 mr-2 text-muted">
              <Filter className="w-5 h-5" />
            </div>
            {filters.map(filter => (
              <button 
                key={filter} 
                onClick={() => setActiveFilter(filter)}
                className={`px-5 py-2 rounded-full font-medium border transition-colors whitespace-nowrap cursor-pointer ${activeFilter === filter ? 'bg-neon-pink/10 border-neon-pink/50 text-neon-pink shadow-sm' : 'bg-card border-border text-muted hover:border-black/20 dark:hover:border-white/20 hover:text-foreground'}`}
              >
                {filter}
              </button>
            ))}
          </div>

          {/* Masonry Grid representing nodes */}
          {displayGraph.nodes.length > 0 ? (
          <div className="columns-1 md:columns-2 lg:columns-3 xl:columns-4 gap-6 mb-8 mt-4">
            {displayGraph.nodes.map((node: any) => {
              const isIdea = node.category === 'Idea';
              const isPeople = node.category === 'People';
              const isResource = node.category === 'Resource';
              const isMedia = node.category === 'Media';
              const isJournal = node.category === 'Journal';
              
              return (
                <div key={node.id} className="break-inside-avoid mb-6 bg-card border border-border p-6 rounded-xl shadow-lg hover:border-neon-cyan/30 dark:hover:border-neon-cyan/50 hover:shadow-[0_0_20px_rgba(0,229,255,0.1)] transition-all cursor-pointer group/card">
                  <div className="flex items-center justify-between mb-4">
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-md uppercase tracking-wider
                      ${isIdea ? 'bg-neon-orange/10 text-neon-orange border border-neon-orange/30' : ''}
                      ${isPeople ? 'bg-neon-pink/10 text-neon-pink border border-neon-pink/30' : ''}
                      ${isResource ? 'bg-neon-blue/10 text-neon-blue border border-neon-blue/30' : ''}
                      ${isMedia ? 'bg-neon-green/10 text-neon-green border border-neon-green/30' : ''}
                      ${isJournal ? 'bg-neon-cyan/10 text-neon-cyan border border-neon-cyan/30' : ''}
                      ${(!isIdea && !isPeople && !isResource && !isMedia && !isJournal) ? 'bg-muted/10 text-muted border border-muted/30' : ''}
                    `}>
                      {node.category}
                    </span>
                  </div>
                  <h3 className="font-bold text-foreground mb-3 text-lg group-hover/card:text-neon-cyan transition-colors">{node.label}</h3>
                  <p className="text-muted leading-relaxed">{node.content}</p>
                </div>
              );
            })}
          </div>
          ) : (
            <div className="col-span-full text-center py-24 px-4 bg-card border border-border rounded-xl">
               <div className="w-16 h-16 rounded-full bg-black/5 dark:bg-white/5 flex items-center justify-center mx-auto mb-4">
                 <Search className="w-8 h-8 text-muted" />
               </div>
               <h3 className="text-xl font-bold text-foreground mb-2">No concepts found</h3>
               <p className="text-muted max-w-md mx-auto">Your vault is missing connections for this parameter. Feed AuraOS new insights via the chat below.</p>
            </div>
          )}
        </div>
      </div>
      
      <ChatInterface placeholder="Ask your brain or save a thought..." context="vault" />
    </div>
  );
}
