import React, { useState, useEffect } from 'react';

import HealthKPIs from '../components/health/HealthKPIs';
import ActivityRings from '../components/health/ActivityRings';
import WeeklyActivityChart from '../components/health/WeeklyActivityChart';
import AiDiagnosticCard from '../components/health/AiDiagnosticCard';
import { hasVisitedAll, markVisited } from '../utils/sessionCache';

// Transform flat backend response → nested shape that components expect
function transformHealthData(raw) {
  const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Weekly chart: backend gives [{date, steps}], components need [{day, steps, active}]
  const weekly_chart = (raw.weekly_chart || []).map((item) => {
    const d = item.date ? new Date(item.date) : null;
    const steps = item.steps || 0;
    const active = item.active_minutes || item.active || 0;
    return {
      day: d ? DAYS[d.getDay()] : item.day || '?',
      steps,
      distance: item.distance ?? Math.round((steps / 1300) * 10) / 10,
      calories: item.calories ?? Math.round(active * 5 + 1200),
      active_minutes: active,
    };
  });

  // If no weekly chart data, provide a default so charts don't crash
  const chart = weekly_chart.length > 0 ? weekly_chart : [
    { day: 'Mon', steps: 0, active: 0 },
    { day: 'Tue', steps: 0, active: 0 },
    { day: 'Wed', steps: 0, active: 0 },
    { day: 'Thu', steps: 0, active: 0 },
    { day: 'Fri', steps: 0, active: 0 },
    { day: 'Sat', steps: 0, active: 0 },
    { day: 'Sun', steps: 0, active: 0 },
  ];

  // KPIs: backend gives flat {steps, calories, ...}, components need nested objects
  const kpis = {
    steps:          { current: raw.steps || 0,          goal: 10000, unit: 'steps' },
    calories:       { current: raw.calories || 0,       goal: 2400,  unit: 'kcal'  },
    active_minutes: { current: raw.active_minutes || 0, goal: 60,    unit: 'min'   },
    distance:       { current: raw.distance || 0,       goal: 8.0,   unit: 'km'    },
    sleep_hours:    { current: raw.sleep_hours || 0,    target: 8.0, unit: 'hrs'   },
    heart_rate:     { current: raw.heart_rate || 0,     resting: 65, unit: 'bpm'   },
  };

  // AI Diagnostic: backend may give {radar,insights} or {title,status,message,trend}
  let ai_diagnostic = {
    title: 'Daily Wellness Briefing',
    status: 'Awaiting Sync',
    message: 'Click "Sync Devices" to connect your Google Fit data and generate AI-powered health insights.',
    trend: 'No data yet',
  };
  if (raw.ai_diagnostic) {
    const diag = raw.ai_diagnostic;
    if (diag.title) {
      ai_diagnostic = diag;
    } else if (diag.insights && diag.insights.length > 0) {
      const insight = diag.insights[0];
      ai_diagnostic = {
        title: 'Daily Wellness Briefing',
        status: insight.title || 'Analysis Ready',
        message: insight.desc || 'No insights available.',
        trend: 'Powered by Gemini AI',
      };
    }
  }

  return { kpis, weekly_chart: chart, ai_diagnostic };
}

export default function HealthDashboard() {
  const [data, setData] = useState(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSynced, setLastSynced] = useState(null);

  const formatLastSynced = (value) => {
    if (!value) return 'Not synced yet';
    return new Date(value).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' });
  };

  useEffect(() => {
    const saved = localStorage.getItem('health_last_synced');
    if (saved) setLastSynced(saved);
    // 1. Instantly load from localStorage
    const cached = localStorage.getItem('health_data');
    if (cached) {
      try { setData(transformHealthData(JSON.parse(cached))); } catch (_) {}
    }

    // 2. Fetch from DB cache, then sync from Google if stale
    const fetchHealth = async () => {
      const { hasVisitedAll, markVisited } = await import('../utils/sessionCache');
      if (hasVisitedAll() && localStorage.getItem('health_data')) {
        markVisited('health');
        setIsSyncing(false);
        return;
      }
      try {
        setIsSyncing(true);
        const res = await fetch('/api/health/metrics');
        const json = await res.json();

        if (json.needs_sync) {
          const syncRes = await fetch('/api/health/sync', { method: 'POST' });
          const syncJson = await syncRes.json();
          localStorage.setItem('health_data', JSON.stringify(syncJson));
          setData(transformHealthData(syncJson));
        } else {
          localStorage.setItem('health_data', JSON.stringify(json));
          setData(transformHealthData(json));
        }
        const now = new Date().toISOString();
        localStorage.setItem('health_last_synced', now);
        setLastSynced(now);
        markVisited('health');
      } catch (e) {
        console.error('[HealthDashboard] fetch failed:', e);
        // If fetch fails and we have no data yet, use safe defaults
        if (!data) setData(transformHealthData({}));
      } finally {
        setIsSyncing(false);
      }
    };

    fetchHealth();
  }, []);

  if (!data) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="h-8 w-8 rounded-full border-t-2 border-b-2 border-indigo-500 animate-spin mb-2"></div>
          <p className="text-gray-400">Loading Health Data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full">
      <div className="mb-4 mt-14 flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-semibold mb-2 text-gray-900 flex items-center gap-3">
            Health & Fitness
            {isSyncing && (
              <span className="text-xs bg-indigo-100 text-indigo-600 px-2 py-1 rounded-full font-medium flex items-center gap-1">
                <div className="w-3 h-3 border-2 border-indigo-500/30 border-t-indigo-600 rounded-full animate-spin"></div>
                Syncing...
              </span>
            )}
          </h1>
          <p className="text-gray-500 text-sm">Monitor your daily activity, sleep, and AI wellness insights.</p>
        </div>
        <div className="hidden md:flex flex-col items-end gap-2">
          <button
            disabled={isSyncing}
            onClick={async () => {
              setIsSyncing(true);
              try {
                const syncRes = await fetch('/api/health/sync', { method: 'POST' });
                const syncJson = await syncRes.json();
                localStorage.setItem('health_data', JSON.stringify(syncJson));
                setData(transformHealthData(syncJson));
                const now = new Date().toISOString();
                localStorage.setItem('health_last_synced', now);
                setLastSynced(now);
              } finally { setIsSyncing(false); }
            }}
            className="px-5 py-2.5 bg-gradient-to-r from-aura-purple to-indigo-600 text-white rounded-xl text-sm font-medium shadow-md hover:opacity-90 transition-opacity disabled:opacity-50">
            {isSyncing ? 'Syncing...' : 'Sync Now'}
          </button>
          <p className="text-xs text-gray-400">Last synced {formatLastSynced(lastSynced)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="lg:col-span-8">
          <HealthKPIs kpis={data.kpis} chartData={data.weekly_chart} />
        </div>
        <div className="lg:col-span-4">
          <AiDiagnosticCard diagnostic={data.ai_diagnostic} />
        </div>
        <div className="lg:col-span-4">
          <ActivityRings kpis={data.kpis} />
        </div>
        <div className="lg:col-span-8">
          <WeeklyActivityChart chartData={data.weekly_chart} />
        </div>
      </div>
    </div>
  );
}