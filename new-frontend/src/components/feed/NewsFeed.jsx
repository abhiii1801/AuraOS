import { Newspaper } from 'lucide-react';

export default function NewsFeed({ news }) {
  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
      <div className="flex justify-between items-start mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gray-50 rounded-lg border border-gray-100 text-gray-400">
            <Newspaper size={20} />
          </div>
          <div>
            <h3 className="font-semibold text-lg">Top Stories</h3>
            <p className="text-xs text-gray-500 mt-1">Based on your interests</p>
          </div>
        </div>
        <button className="text-aura-purple text-sm font-medium">See All</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
        {news.map((item) => (
          <div key={item.id} className="p-4 rounded-2xl bg-gray-50 border border-gray-100 hover:border-aura-purple/30 transition-colors cursor-pointer flex flex-col justify-between h-40">
            <div>
              <span className="text-[10px] font-bold tracking-wider uppercase text-aura-purple mb-2 block">
                {item.category}
              </span>
              <h4 className="text-sm font-semibold text-gray-900 leading-snug mb-3 line-clamp-3">
                {item.title}
              </h4>
            </div>
            <div className="flex justify-between items-center text-[10px] font-medium text-gray-400 mt-2">
              <span>{item.source}</span>
              <span>{item.time}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}