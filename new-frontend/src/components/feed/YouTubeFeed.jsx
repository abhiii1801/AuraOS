import { PlayCircle } from 'lucide-react';

export default function YouTubeFeed({ videos }) {
  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="font-semibold text-lg">New from Subscriptions</h3>
          <p className="text-xs text-gray-500 mt-1">Latest video uploads</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 overflow-y-auto max-h-[300px] pr-2 pb-2">
        {videos.map((video) => (
          <div key={video.id} className="group cursor-pointer">
            {/* Thumbnail Placeholder */}
            <div className="w-full aspect-video bg-gray-100 rounded-xl mb-3 relative overflow-hidden border border-gray-200">
                <img src={video.thumbnail} alt={video.title} className="absolute inset-0 w-full h-full object-cover" />
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/10 backdrop-blur-[2px]">
                  <PlayCircle size={40} className="text-white drop-shadow-md" />
                </div>
              <div className="absolute bottom-2 right-2 bg-black/70 text-white text-[10px] font-medium px-1.5 py-0.5 rounded">
                {video.duration}
              </div>
            </div>
            
            <h4 className="text-sm font-semibold text-gray-900 line-clamp-2 leading-snug mb-1 group-hover:text-aura-purple transition-colors">
              {video.title}
            </h4>
            <p className="text-xs text-gray-500 font-medium">{video.channel}</p>
            <p className="text-[10px] text-gray-400 mt-0.5">{video.views} views • {video.time}</p>
          </div>
        ))}
      </div>
    </div>
  );
}