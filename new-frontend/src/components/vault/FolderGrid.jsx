import { Folder } from 'lucide-react';

export default function FolderGrid({ folders }) {
  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 h-full">
      <div className="flex justify-between items-start mb-4">
        <h3 className="font-semibold text-lg">Quick Access</h3>
        <button className="text-aura-purple text-sm font-medium">View All</button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {folders.map((folder, i) => (
          <div key={i} className="bg-gray-50 rounded-xl p-4 border border-gray-100 hover:border-aura-purple/30 cursor-pointer transition-colors group">
            <Folder size={20} className="text-aura-purple mb-2 group-hover:scale-110 transition-transform" />
            <p className="text-sm font-semibold text-gray-800">{folder.name}</p>
            <p className="text-xs text-gray-400 font-medium mt-1">{folder.count} items</p>
          </div>
        ))}
      </div>
    </div>
  );
}