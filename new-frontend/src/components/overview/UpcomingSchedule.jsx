import { Clock, Calendar as CalendarIcon } from 'lucide-react';

export default function UpcomingSchedule({ events }) {
  const formatTime = (dateString) => {
    try {
      return new Date(dateString).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    } catch (e) { return '' }
  };

  const formatDate = (dateString) => {
    try {
      const d = new Date(dateString);
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } catch (e) { return '' }
  };

  const getBadgeColor = (label) => {
    const type = String(label || '').toLowerCase();
    switch(type) {
      case 'work': return 'bg-indigo-100 text-indigo-700';
      case 'personal': return 'bg-emerald-100 text-emerald-700';
      case 'meeting': return 'bg-aura-purple/20 text-aura-purple';
      case 'travel': return 'bg-orange-100 text-orange-700';
      case 'finance': return 'bg-yellow-100 text-yellow-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 h-full">
      <div className="flex justify-between items-start mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gray-50 rounded-lg border border-gray-100 text-gray-400">
            <CalendarIcon size={20} />
          </div>
          <div>
            <h3 className="font-semibold text-lg">Upcoming Events</h3>
            <p className="text-xs text-gray-500 mt-1">Your schedule for the next 24 hours</p>
          </div>
        </div>
        <button className="text-aura-purple text-sm font-medium">Full Calendar</button>
      </div>

      {/* Scrollable events list; shows a few items then scrolls */}
      <div className="space-y-3 pr-2 max-h-64 overflow-y-auto">
        {events.map((event) => (
          <div key={event.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-transparent hover:border-gray-200 transition-colors">
            <div className="flex items-center gap-4">
              <div className="flex flex-col items-center justify-center min-w-[80px] pr-4 border-r border-gray-200">
                <span className="text-sm font-bold text-gray-900">{formatTime(event.start)}</span>
                <span className="text-[10px] font-bold text-gray-500 mt-1">{formatDate(event.start)}</span>
                <span className={`inline-flex items-center text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-md mt-2 ${getBadgeColor(event.type || (event.tags && event.tags[0]) || 'Other')}`}>
                  {event.type ? event.type : (event.tags && event.tags[0] ? event.tags[0] : 'Event')}
                </span>
                <span className="text-[10px] font-medium text-gray-400 mt-2 flex items-center gap-1">
                  <Clock size={10} /> {formatTime(event.end)}
                </span>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-gray-900">{event.summary}</h4>
                <div className="flex flex-wrap gap-2 mt-3">
                  {(event.tags?.length ? event.tags : [event.type || 'Other']).slice(0, 2).map((tag, idx) => (
                    <span key={idx} className={`inline-flex items-center text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-md ${getBadgeColor(tag)}`}>
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
        {events.length === 0 && (
          <div className="text-center py-8 text-gray-400 text-sm font-medium">
            No upcoming events today. Enjoy your free time!
          </div>
        )}
      </div>
    </div>
  );
}