import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

export default function ActivityRings({ kpis }) {
  const stepsPercent = Math.min((kpis.steps.current / kpis.steps.goal) * 100, 100);
  const data = [
    { name: 'Completed', value: kpis.steps.current, color: '#774CFF' },
    { name: 'Remaining', value: Math.max(kpis.steps.goal - kpis.steps.current, 0), color: '#F3F4F6' }
  ];

  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 h-full flex flex-col">
      <div className="mb-2">
        <h3 className="font-semibold text-lg">Goal Progression</h3>
        <p className="text-xs text-gray-500 mt-1">Steps against daily target</p>
      </div>

      <div className="flex-1 relative min-h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius="70%"
              outerRadius="90%"
              stroke="none"
              cornerRadius={8}
              startAngle={90}
              endAngle={-270}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
          </PieChart>
        </ResponsiveContainer>
        
        {/* Center Text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-3xl font-bold text-gray-900">{Math.round(stepsPercent)}%</span>
          <span className="text-xs text-gray-500 font-medium">of Goal</span>
        </div>
      </div>

      {/* Mini Legend */}
      <div className="mt-4 pt-4 border-t border-gray-50 flex justify-between px-2">
        <div>
          <p className="text-xs text-gray-400 font-medium">Target</p>
          <p className="text-sm font-semibold">{kpis.steps.goal.toLocaleString()}</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-400 font-medium">Current</p>
          <p className="text-sm font-semibold text-aura-purple">{kpis.steps.current.toLocaleString()}</p>
        </div>
      </div>
    </div>
  );
}