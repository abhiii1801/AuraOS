export default function RecentTransactions({ transactions }) {
  const safeTx = transactions || [];
  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 h-full">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="font-semibold text-lg">Recent Transactions</h3>
          <p className="text-xs text-gray-500 mt-1">Latest income and expenses</p>
        </div>
        <button className="text-aura-purple text-sm font-medium">See All</button>
      </div>

      <div className="overflow-x-auto overflow-y-auto max-h-[400px] pr-2">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-gray-400 font-medium border-b border-gray-100">
            <tr>
              <th className="pb-3 font-medium">Description</th>
              <th className="pb-3 font-medium">Category</th>
              <th className="pb-3 font-medium">Date</th>
              <th className="pb-3 font-medium text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            {safeTx.length === 0 ? (
              <tr><td colSpan={4} className="py-8 text-center text-sm text-gray-400">No transactions found.</td></tr>
            ) : safeTx.map((tx, i) => (
              <tr key={i} className="border-b border-gray-50 last:border-0">
                <td className="py-4 font-medium text-gray-800">{tx.description || tx.merchant || 'Transaction'}</td>
                <td className="py-4">
                  <span className={`text-[10px] px-2.5 py-1 rounded-full font-medium ${tx.color}`}>
                    {tx.category}
                  </span>
                </td>
                <td className="py-4 text-gray-500">{tx.date}</td>
                <td className={`py-4 text-right font-semibold ${tx.amount > 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                  {tx.amount > 0 ? '+' : ''}{new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(tx.amount)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}