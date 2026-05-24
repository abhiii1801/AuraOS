import { Wallet, Activity, CalendarCheck } from 'lucide-react';

export default function PulseKPIs({ kpis }) {
  const formatCurrency = (amount) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);

  const Card = ({ title, value, subtext, icon: Icon, iconColor }) => (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex items-center justify-between group cursor-pointer hover:border-gray-200 transition-colors">
      <div>
        <p className="text-gray-500 text-sm font-medium mb-1">{title}</p>
        <h3 className="text-3xl font-bold text-gray-900 mb-1">{value}</h3>
        <p className="text-xs text-gray-400 font-medium">{subtext}</p>
      </div>
      <div className={`transition-transform group-hover:scale-110 ${iconColor}`}>
        <Icon size={42} strokeWidth={1.5} />
      </div>
    </div>
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card 
        title="Today's Spend" 
        value={formatCurrency(kpis.today_spent)} 
        subtext="Tracking normal vs yesterday"
        icon={Wallet} 
        iconColor="text-aura-purple" 
      />
      <Card 
        title="Daily Steps" 
        value={kpis.today_steps.toLocaleString()} 
        subtext="45% of daily goal reached"
        icon={Activity} 
        iconColor="text-emerald-500" 
      />
      <Card 
        title="Active Projects" 
        value={kpis.active_projects} 
        subtext="AuraOS, Bot Detector & Kolam"
        icon={CalendarCheck} 
        iconColor="text-blue-500" 
      />
    </div>
  );
}