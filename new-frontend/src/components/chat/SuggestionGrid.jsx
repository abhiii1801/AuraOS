import { Wallet, Code, Calendar, Utensils, TrendingUp, Activity } from 'lucide-react';

const iconMap = {
  Wallet, Code, Calendar, Utensils, TrendingUp, Activity
};

export default function SuggestionGrid({ suggestions, onSelect }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {suggestions.map((item) => {
        const Icon = iconMap[item.icon] || Wallet; // fallback icon
        return (
          <button 
            key={item.id}
            onClick={() => onSelect && onSelect(item.text)}
            className="flex items-center gap-3 bg-white border border-gray-100 p-4 rounded-2xl hover:border-aura-purple/40 hover:shadow-sm transition-all text-left group"
          >
            <div className="text-gray-400 group-hover:text-aura-purple transition-colors">
              <Icon size={18} />
            </div>
            <span className="text-sm font-medium text-gray-600 group-hover:text-gray-900">
              {item.text}
            </span>
          </button>
        );
      })}
    </div>
  );
}