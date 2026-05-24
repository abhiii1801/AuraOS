export default function BudgetOverview({ budgets }) {
  const formatCurrency = (amount) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
  const safeBudgets = budgets || [];

  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 h-full">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="font-semibold text-lg">Subscriptions</h3>
          <p className="text-xs text-gray-500 mt-1">Your active recurring payments</p>
        </div>
      </div>

      <div className="space-y-5 overflow-y-auto max-h-[250px] pr-2">
        {safeBudgets.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-8">No subscriptions found.</p>
        ) : safeBudgets.map((budget, i) => {
          const percentage = (budget.spent / budget.limit) * 100;
          return (
            <div key={i} className="relative">
              <div className="flex justify-between items-center mb-2">
                <p className="text-sm font-medium">{budget.name} Budget</p>
                <span className={`text-[10px] px-2 py-0.5 rounded-full ${budget.status === 'Almost reached' ? 'bg-orange-100 text-orange-600' : 'bg-emerald-100 text-emerald-600'}`}>
                  {budget.status}
                </span>
              </div>
              <div className="flex items-end gap-1 mb-3">
                <span className="text-2xl font-bold">{formatCurrency(budget.spent)}</span>
                <span className="text-gray-400 text-sm mb-1 font-medium">/ {formatCurrency(budget.limit)}</span>
              </div>
              <div className="h-2.5 w-full bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`h-full ${budget.color} rounded-full`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-2">{Math.round(percentage)}% of budget used</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}