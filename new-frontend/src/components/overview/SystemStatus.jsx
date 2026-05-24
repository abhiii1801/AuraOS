import { MessageSquare, DatabaseZap, CheckCircle2, TrendingUp } from 'lucide-react';

export default function SystemStatus({ system, insights }) {
  return (
    <>
      {/* AI Insight Mini-Card */}
      <div className="bg-gradient-to-br from-gray-900 to-black rounded-3xl p-6 shadow-sm text-white">
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp size={16} className="text-emerald-400" />
          <h3 className="font-semibold text-sm">Weekly Insight</h3>
        </div>
        <p className="text-sm text-gray-300 leading-relaxed font-medium">
          {insights}
        </p>
      </div>

      {/* System Status Card */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex-1">
        <h3 className="font-semibold text-lg mb-4">System Status</h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 rounded-xl border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="bg-[#0088cc]/10 p-2 rounded-lg text-[#0088cc]">
                <MessageSquare size={18} />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">Telegram Bot</p>
                <p className="text-[10px] font-medium text-gray-400">Webhook Active</p>
              </div>
            </div>
            {system.telegram_linked ? (
              <CheckCircle2 size={18} className="text-emerald-500" />
            ) : (
              <span className="text-xs text-red-500 font-medium">Offline</span>
            )}
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="bg-emerald-500/10 p-2 rounded-lg text-emerald-500">
                <DatabaseZap size={18} />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">Supabase DB</p>
                <p className="text-[10px] font-medium text-gray-400">Last sync: {system.last_sync}</p>
              </div>
            </div>
            <span className="text-xs font-semibold text-emerald-500 bg-emerald-50 px-2 py-1 rounded-md">
              {system.database}
            </span>
          </div>
        </div>
      </div>
    </>
  );
}