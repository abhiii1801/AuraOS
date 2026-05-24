import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function CashFlowChart({ chartData }) {
  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 h-full min-h-[450px] flex flex-col">
      <div className="flex justify-between items-start mb-6">
        <h3 className="font-semibold text-lg">Cash Flow Trend</h3>
        <div className="flex items-center gap-2 bg-gray-50 rounded-full p-1 border border-gray-100">
          <button className="bg-aura-dark text-white px-3 py-1 rounded-full text-xs font-medium">1Y</button>
          <button className="text-gray-500 px-3 py-1 rounded-full text-xs font-medium hover:text-aura-dark">6M</button>
          <button className="text-gray-500 px-3 py-1 rounded-full text-xs font-medium hover:text-aura-dark">1M</button>
        </div>
      </div>
      
      <div className="flex items-center gap-6 text-xs font-medium text-gray-500 justify-center mb-4">
        <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-gray-300"></div>Income</div>
        <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-aura-purple"></div>Expense</div>
      </div>
      
      <div className="flex-1 w-full text-xs font-medium text-gray-400">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#774CFF" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#774CFF" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#C4C3C6" stopOpacity={0.5}/>
                <stop offset="95%" stopColor="#C4C3C6" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <XAxis dataKey="month" axisLine={false} tickLine={false} dy={10} />
            <YAxis axisLine={false} tickLine={false} tickFormatter={(value) => `₹${value/1000}k`} />
            <Tooltip 
              contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              itemStyle={{ fontWeight: 600 }}
            />
            <Area type="monotone" dataKey="income" stroke="#C4C3C6" strokeWidth={0} fillOpacity={1} fill="url(#colorIncome)" />
            <Area type="monotone" dataKey="expense" stroke="#774CFF" strokeWidth={0} fillOpacity={1} fill="url(#colorExpense)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}