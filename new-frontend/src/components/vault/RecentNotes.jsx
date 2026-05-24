import { MoreHorizontal } from 'lucide-react';

export default function RecentNotes({ notes }) {
  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 h-full">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="font-semibold text-lg">Recent Entries</h3>
          <p className="text-xs text-gray-500 mt-1">Latest ideas added to the vault</p>
        </div>
        <button className="text-aura-purple text-sm font-medium">See All</button>
      </div>

      {/* The max-h-[260px] here ensures exactly 4 entries are visible before you have to scroll */}
      <div className="space-y-1 overflow-y-auto max-h-[260px] pr-2">
        {notes.map((note, i) => (
          <div key={i} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-xl transition-colors group cursor-pointer border border-transparent hover:border-gray-100">
            <div className="flex items-center gap-4">
              <div className={`text-[10px] uppercase font-bold tracking-wider px-2 py-1 rounded-md ${note.color} min-w-[70px] text-center`}>
                {note.category}
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-800">{note.title}</p>
                <p className="text-xs text-gray-400 font-medium mt-0.5">{note.date}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
               <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${note.status === 'Linked' ? 'bg-gray-100 text-gray-600' : 'bg-red-50 text-red-500'}`}>
                 {note.status}
               </span>
               <button className="text-gray-300 group-hover:text-aura-purple transition-colors">
                 <MoreHorizontal size={18} />
               </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}