import { Sparkles, MailWarning } from 'lucide-react';

export default function AiBriefingCard({ summary }) {
  return (
    <div className="bg-gradient-to-br from-aura-purple to-indigo-600 rounded-3xl p-6 shadow-md text-white relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-3xl -mr-10 -mt-10"></div>
      
      <div className="flex justify-between items-start mb-4 relative z-10">
        <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full border border-white/20">
          <Sparkles size={14} />
          <span className="text-xs font-semibold tracking-wide">AURA SYNTHESIS</span>
        </div>
        {summary.urgent_count > 0 && (
          <div className="flex items-center gap-1.5 text-xs font-medium bg-red-500/20 px-2.5 py-1 rounded-md text-red-50 border border-red-500/30">
            <MailWarning size={14} />
            {summary.urgent_count} Priority
          </div>
        )}
      </div>

      <div className="relative z-10 mt-6">
        <h2 className="text-2xl font-bold mb-3">{summary.greeting}</h2>
        <p className="text-white/90 text-sm leading-relaxed font-medium">
          {summary.brief}
        </p>
      </div>
    </div>
  );
}