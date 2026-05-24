import React, { useState, useEffect } from 'react';
import WelcomeHero from '../components/overview/WelcomeHero';
import PulseKPIs from '../components/overview/PulseKPIs';
import UpcomingSchedule from '../components/overview/UpcomingSchedule';
import RecentNotes from '../components/vault/RecentNotes';
import { RefreshCw } from 'lucide-react';

// Transform /api/dashboard/summary → what each component needs
function transformOverviewData(raw) {
  return {
    user_name: raw.user_name || 'There',
    briefing: raw.briefing || '',
    upcoming_events: raw.upcoming_events || [],
    kpis: {
      today_steps: raw.today_steps || 0,
      today_spent: raw.today_spent || 0,
      active_projects: raw.active_projects || 0,
    },
    recent_notes: raw.recent_notes?.length > 0 ? raw.recent_notes : [],
  };
}

export default function OverviewDashboard() {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 1. Instantly load mock/cached data
    const cached = localStorage.getItem('overview_data');
    if (cached) {
      try { setData(JSON.parse(cached)); } catch (_) {}
    }

    // 2. Fetch real data from backend
    const fetchOverview = async () => {
      const { hasVisitedAll, markVisited } = await import('../utils/sessionCache');
      if (hasVisitedAll() && localStorage.getItem('overview_data')) {
        markVisited('overview');
        setIsLoading(false);
        return;
      }
      try {
        const res = await fetch('/api/dashboard/summary');
        const json = await res.json();
        if (!json.error) {
          const transformed = transformOverviewData(json);
          setData(transformed);
          localStorage.setItem('overview_data', JSON.stringify(transformed));
          markVisited('overview');
        }
      } catch (e) {
        console.error('[OverviewDashboard] fetch failed:', e);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOverview();
  }, []);

  const displayData = data || transformOverviewData({});

  return (
    <div className="min-h-screen w-full">
      <div className="flex flex-col items-end gap-2 mb-4 mt-6 md:mt-2 px-2">
        <button 
          onClick={() => {
            setIsLoading(true);
            fetch('/api/dashboard/summary')
              .then(res => res.json())
              .then(json => {
                if (!json.error) {
                  const transformed = transformOverviewData(json);
                  setData(transformed);
                  localStorage.setItem('overview_data', JSON.stringify(transformed));
                }
              })
              .finally(() => setIsLoading(false));
          }}
          disabled={isLoading}
          className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors shadow-sm text-sm font-medium disabled:opacity-50"
        >
          <RefreshCw size={16} className={isLoading ? 'animate-spin text-aura-purple' : ''} />
          {isLoading ? 'Syncing...' : 'Sync'}
        </button>
      </div>

      <div className="mb-4">
        <WelcomeHero name={displayData.user_name} briefing={displayData.briefing} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-12">
          <PulseKPIs kpis={displayData.kpis} />
        </div>

        <div className="lg:col-span-7">
          <UpcomingSchedule events={displayData.upcoming_events} />
        </div>
        <div className="lg:col-span-5 flex flex-col gap-6">
          <RecentNotes notes={displayData.recent_notes} />
        </div>
      </div>
    </div>
  );
}