import { ArrowUpRight, ArrowDownRight, Wallet } from 'lucide-react';

export default function BalanceCard({ kpis }) {
  const formatCurrency = (amount) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);

  const SubCard = ({ title, amount, growth, isPositive, subtext }) => (
    <div className="bg-gray-50/50 rounded-xl p-4 border border-gray-100 flex-1">
      <p className="text-gray-500 text-xs mb-1 font-medium">{title}</p>
      <p className="text-xl font-bold mb-2">{formatCurrency(amount)}</p>
      <div className={`flex items-center text-xs font-medium ${isPositive ? 'text-emerald-500' : 'text-red-500'}`}>
        {isPositive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
        <span className="ml-1">{Math.abs(growth)}% vs last period</span>
      </div>
      <p className="text-[10px] text-gray-400 mt-2">{subtext}</p>
    </div>
  );

  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 h-full flex flex-col justify-between">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-gray-500 text-sm mb-2 font-medium">{kpis.main_label || 'Expenses'}</p>
          <h2 className="text-4xl md:text-5xl font-bold mb-3 tracking-tight">{formatCurrency(kpis.main_amount || 0)}</h2>
          <div className="flex items-center text-gray-500 text-sm font-medium">
            <span className="ml-1 text-sm text-gray-400">Net: {formatCurrency(kpis.total_balance || 0)}</span>
          </div>
        </div>
        <div className="p-2 border border-gray-100 rounded-lg text-gray-400">
           <Wallet size={20} />
        </div>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-3 mt-4">
        <SubCard title={kpis.income_label || 'Income'} amount={kpis.monthly_income} growth={kpis.income_growth} isPositive={kpis.income_growth > 0} subtext="Updated in real time" />
        <SubCard title={kpis.expenses_label || 'Expenses'} amount={kpis.monthly_expenses} growth={kpis.expenses_growth} isPositive={kpis.expenses_growth > 0} subtext="Categorized automatically" />
      </div>
    </div>
  );
}