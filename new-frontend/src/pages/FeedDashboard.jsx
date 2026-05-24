import React, { useState, useEffect } from 'react';

import AiBriefingCard from '../components/feed/AiBriefingCard';
import EmailInbox from '../components/feed/EmailInbox';
import NewsFeed from '../components/feed/NewsFeed';
import YouTubeFeed from '../components/feed/YouTubeFeed';

function normalizeFeedData(raw) {
  return {
    news: (raw.news || []).map((item, index) => ({
      id: item.id || item.url || `news-${index}`,
      category: item.category || item.topic || 'News',
      title: item.title || '',
      source: item.source || '',
      time: item.time || item.published_at || '',
      description: item.description || '',
      url: item.url || '',
      image: item.image || '',
    })),
    emails: (raw.emails || []).map((item, index) => ({
      id: item.id || `email-${index}`,
      from: item.from || item.sender_name || item.sender_email || 'Unknown',
      subject: item.subject || '',
      snippet: item.snippet || '',
      time: item.time || item.date || '',
      unread: item.unread ?? item.is_unread ?? false,
    })),
    youtube_feed: (raw.youtube_feed || []).map((item, index) => ({
      id: item.id || item.video_id || `video-${index}`,
      title: item.title || '',
      channel: item.channel || item.channel_name || 'Unknown Channel',
      thumbnail: item.thumbnail || item.channel_thumb || '',
      url: item.url || '',
      duration: item.duration || '--',
      views: item.views || '--',
      time: item.time || item.published_at || '',
    })),
    // Ensure email_summary is an object with expected fields for AiBriefingCard
    email_summary: (function() {
      try {
        if (!raw.email_summary) return { greeting: 'Inbox', brief: '', urgent_count: 0 };
        if (typeof raw.email_summary === 'string') return JSON.parse(raw.email_summary);
        return raw.email_summary;
      } catch (e) {
        return { greeting: 'Inbox', brief: String(raw.email_summary || ''), urgent_count: 0 };
      }
    })(),
  };
}

export default function FeedDashboard() {
  const [data, setData] = useState(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSynced, setLastSynced] = useState(null);

  const formatLastSynced = (value) => {
    if (!value) return 'Not synced yet';
    return new Date(value).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' });
  };

  useEffect(() => {
    // 1. Load from localStorage
    const cached = localStorage.getItem('feed_data');
    if (cached) {
      setData(JSON.parse(cached));
    }
    const saved = localStorage.getItem('feed_last_synced');
    if (saved) setLastSynced(saved);

    // 2. Fetch from cache endpoint unless the session indicates we've visited all pages
    const fetchFeed = async () => {
      const { hasVisitedAll, markVisited } = await import('../utils/sessionCache');
      if (hasVisitedAll() && localStorage.getItem('feed_data')) {
        // Already visited all pages this session; use cached feed only
        markVisited('feed');
        return;
      }
      try {
        setIsSyncing(true);
        const res = await fetch('/api/info/daily_digest');
        const json = await res.json();
        const normalized = normalizeFeedData(json);

        if (json.needs_sync) {
          // Trigger Google API sync
          const syncRes = await fetch('/api/info/sync', { method: 'POST' });
          const syncJson = await syncRes.json();
          const normalizedSync = normalizeFeedData(syncJson);
          setData(normalizedSync);
          localStorage.setItem('feed_data', JSON.stringify(normalizedSync));
        } else {
          setData(normalized);
          localStorage.setItem('feed_data', JSON.stringify(normalized));
          markVisited('feed');
        }
      } catch (e) {
        console.error(e);
      } finally {
        setIsSyncing(false);
      }
    };

    fetchFeed();
  }, []);

  if (!data) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-8 w-8 rounded-full border-t-2 border-b-2 border-indigo-500 animate-spin mb-2"></div>
          <p className="text-gray-400">Loading Daily Digest...</p>
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen w-full">


      <div className="mb-4 mt-14 flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-semibold mb-2 text-gray-900 flex items-center gap-3">
            Daily Digest
            {isSyncing && (
              <span className="text-xs bg-indigo-100 text-indigo-600 px-2 py-1 rounded-full font-medium flex items-center gap-1">
                <div className="w-3 h-3 border-2 border-indigo-500/30 border-t-indigo-600 rounded-full animate-spin"></div>
                Syncing...
              </span>
            )}
          </h1>
          <p className="text-gray-500 text-sm">Your AI-curated feed of emails, news, and subscriptions.</p>
        </div>
        <div className="hidden md:flex flex-col items-end gap-2">
          <button 
            disabled={isSyncing}
            onClick={async () => {
              setIsSyncing(true);
              const syncRes = await fetch('/api/info/sync', { method: 'POST' });
              const syncJson = await syncRes.json();
              const normalizedSync = normalizeFeedData(syncJson);
              setData(normalizedSync);
              const now = new Date().toISOString();
              localStorage.setItem('feed_data', JSON.stringify(normalizedSync));
              localStorage.setItem('feed_last_synced', now);
              setLastSynced(now);
              setIsSyncing(false);
            }}
            className="px-5 py-2.5 bg-gradient-to-r from-aura-purple to-indigo-600 text-white rounded-xl text-sm font-medium shadow-md hover:opacity-90 transition-opacity disabled:opacity-50">
            {isSyncing ? 'Syncing...' : 'Sync Now'}
          </button>
          <p className="text-xs text-gray-400">Last synced {formatLastSynced(lastSynced)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Column: Comms & AI (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <AiBriefingCard summary={data.email_summary} />
          <EmailInbox emails={data.emails} />
        </div>

        {/* Right Column: Media & Content (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <YouTubeFeed videos={data.youtube_feed} />
          <NewsFeed news={data.news} />
        </div>
      </div>
    </div>
  );
}