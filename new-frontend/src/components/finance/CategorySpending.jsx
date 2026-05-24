export default function CategorySpending({ categories }) {
  const safeCategories = categories || [];

  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 h-full">
      <div className="mb-4">
        <h3 className="font-semibold text-lg">Spending by Category</h3>
        <p className="text-xs text-gray-500 mt-1">Monthly expense distribution</p>
      </div>

      <div className="space-y-3 mt-4 overflow-y-auto max-h-[250px] pr-2">
        {safeCategories.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-8">No expense data yet.</p>
        ) : safeCategories.map((cat, i) => (
          <div key={i} className="flex items-center justify-between relative h-7 group">
            <div
              className={`absolute left-0 top-0 h-full ${cat.color || 'bg-gray-200'} rounded-md transition-all duration-300`}
              style={{ width: `${cat.percentage || 0}%` }}
            />
            <span className={`text-xs font-medium z-10 pl-3 ${i === 0 ? 'text-white' : 'text-gray-700'}`}>
              {cat.name}
            </span>
            <span className="text-xs text-gray-500 z-10 pr-2">{cat.percentage || 0}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}