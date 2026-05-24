import { Maximize2, Share2, Filter } from 'lucide-react';
import { motion } from 'framer-motion';

export default function KnowledgeGraph() {
  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 h-full min-h-[400px] flex flex-col relative overflow-hidden">
      <div className="flex justify-between items-start mb-2 relative z-10">
        <div>
          <h3 className="font-semibold text-lg">Knowledge Graph</h3>
          <p className="text-xs text-gray-500 mt-1">Visualization temporarily disabled</p>
        </div>
      </div>

      <div className="flex-1 w-full bg-[#FAFAFC] rounded-2xl border border-gray-100 mt-4 relative flex items-center justify-center overflow-hidden">
        <div className="text-gray-400 text-sm">Graph visualization is disabled for now.</div>
      </div>
    </div>
  );
}