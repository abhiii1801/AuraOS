import React, { useState, useEffect } from 'react';

import VaultKPIs from '../components/vault/VaultKPIs';
import KnowledgeGraph from '../components/vault/KnowledgeGraph';
import RecentNotes from '../components/vault/RecentNotes';
import FolderGrid from '../components/vault/FolderGrid';

const defaultVaultData = {
  nodes: [],
  links: [],
  recent_notes: [],
  kpis: {
    total_notes: 0,
    total_connections: 0,
    projects: 0,
    new_this_week: 0,
    storage_used: 0,
  },
  folders: [],
};

export default function VaultDashboard() {
  const [data, setData] = useState(defaultVaultData);
  const [isLoading, setIsLoading] = useState(true);
  const [lastSynced, setLastSynced] = useState(null);

  const formatLastSynced = (value) => {
    if (!value) return 'Not synced yet';
    return new Date(value).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' });
  };

  const fetchVault = async (force = false) => {
    const { hasVisitedAll, markVisited } = await import('../utils/sessionCache');
    if (!force && hasVisitedAll() && localStorage.getItem('vault_summary')) {
      markVisited('vault');
      setIsLoading(false);
      return;
    }
    try {
      setIsLoading(true);
      const res = await fetch('/api/vault/summary');
      const json = await res.json();
      if (!json.error) {
        setData(json);
        localStorage.setItem('vault_summary', JSON.stringify(json));
        const now = new Date().toISOString();
        localStorage.setItem('vault_last_synced', now);
        setLastSynced(now);
        markVisited('vault');
      }
    } catch (e) {
      console.error('Failed to fetch vault data:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // 1. Load from localStorage
    const cachedSummary = localStorage.getItem('vault_summary');
    if (cachedSummary) {
      try { setData(JSON.parse(cachedSummary)); } catch (_) {}
    }
    const saved = localStorage.getItem('vault_last_synced');
    if (saved) setLastSynced(saved);

    fetchVault();
  }, []);

  if (isLoading && data.projects?.length === 0) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-8 w-8 rounded-full border-t-2 border-b-2 border-indigo-500 animate-spin mb-2"></div>
          <p className="text-gray-400">Loading Vault Data...</p>
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen w-full">


      <div className="mb-4 mt-14 flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-semibold mb-2 text-gray-900">The Vault</h1>
          <p className="text-gray-500 text-sm">Your Second Brain: Ideas, memory, and interconnected knowledge.</p>
        </div>
        <div className="hidden md:flex items-end gap-3">
          <div className="flex flex-col items-end text-right">
            <button
              onClick={() => fetchVault(true)}
              disabled={isLoading}
              className="px-5 py-2.5 bg-gradient-to-r from-aura-purple to-indigo-600 text-white rounded-xl text-sm font-medium shadow-md hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {isLoading ? 'Syncing...' : 'Sync Now'}
            </button>
            <p className="text-xs text-gray-400 mt-2">Last synced {formatLastSynced(lastSynced)}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Top Row: The Graph and Recent Notes */}
        <div className="lg:col-span-8">
          <KnowledgeGraph nodes={data.nodes} links={data.links} />
        </div>
        <div className="lg:col-span-4">
          <RecentNotes notes={data.recent_notes} />
        </div>

        {/* Bottom Row: KPIs and Quick Folders */}
        <div className="lg:col-span-8">
          <VaultKPIs kpis={data.kpis} />
        </div>
        <div className="lg:col-span-4">
          <FolderGrid folders={data.folders} />
        </div>
      </div>
    </div>
  );
}