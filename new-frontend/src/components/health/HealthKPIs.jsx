import { Footprints, Route, Flame, Timer } from 'lucide-react';
import { ResponsiveContainer, LineChart, Line } from 'recharts';

export default function HealthKPIs({ kpis, chartData }) {
  // Derive tiny chart data from the weekly data for the visual sparklines
  const sparklineData = chartData.map(d => ({
    steps: d.steps,
    distance: d.distance ?? Math.round((d.steps || 0) / 1300 * 10) / 10,
    calories: d.calories ?? Math.round((d.active_minutes || d.active || 0) * 5 + 1200),
    active_minutes: d.active_minutes || d.active || 0,
  }));

  const MetricCard = ({ title, value, unit, icon: Icon, colorClass, strokeColor, dataKey }) => (
    <div className="bg-white rounded-2xl p-5 pb-3 shadow-sm border border-gray-100 flex flex-col justify-between overflow-hidden">
      <div className="flex justify-between items-start mb-1">
        <p className="text-gray-500 text-sm font-medium">{title}</p>
        <div className={`${colorClass}`}>
          <Icon size={22} strokeWidth={2} />
        </div>
      </div>
      <div className="flex items-baseline gap-1">
        <h3 className="text-3xl font-bold text-gray-900 tracking-tight">{value}</h3>
        <span className="text-sm font-medium text-gray-400">{unit}</span>
      </div>
      
      {/* Mini Chart Below Numbers */}
      <div className="w-full h-12 mt-3 opacity-60">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={sparklineData}>
            <Line type="monotone" dataKey={dataKey} stroke={strokeColor} strokeWidth={2.5} dot={false} isAnimationActive={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 h-full">
      <MetricCard title="Steps" value={kpis.steps.current.toLocaleString()} unit={kpis.steps.unit} icon={Footprints} colorClass="text-aura-purple" strokeColor="#774CFF" dataKey="steps" />
      <MetricCard title="Distance" value={kpis.distance.current.toLocaleString()} unit={kpis.distance.unit} icon={Route} colorClass="text-blue-500" strokeColor="#3B82F6" dataKey="distance" />
      <MetricCard title="Calories" value={kpis.calories.current.toLocaleString()} unit={kpis.calories.unit} icon={Flame} colorClass="text-orange-500" strokeColor="#F97316" dataKey="calories" />
      <MetricCard title="Active Time" value={kpis.active_minutes.current.toLocaleString()} unit={kpis.active_minutes.unit} icon={Timer} colorClass="text-emerald-500" strokeColor="#10B981" dataKey="active_minutes" />
    </div>
  );
}