import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export default function WeeklyActivityChart({ chartData }) {
  const [selectedMetric, setSelectedMetric] = useState('steps');
  const metricConfig = {
    steps: { label: 'Steps', color: '#774CFF', unit: '' },
    distance: { label: 'Distance', color: '#3B82F6', unit: 'km' },
    calories: { label: 'Calories', color: '#F97316', unit: 'kcal' },
    active_minutes: { label: 'Active Min', color: '#10B981', unit: 'min' },
  };
  const selectedConfig = metricConfig[selectedMetric];
  const maxValue = Math.max(...chartData.map(d => d[selectedMetric] || 0), 0);

  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 h-full min-h-[300px] flex flex-col">
      <div className="flex justify-between items-start mb-8 flex-wrap gap-3">
        <div>
          <h3 className="font-semibold text-lg">Weekly Activity</h3>
          <p className="text-xs text-gray-500 mt-1">Track steps, distance, calories, and active minutes over the last 7 days</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-1 border border-gray-100 flex flex-wrap gap-1">
          {Object.entries(metricConfig).map(([key, config]) => (
            <button
              key={key}
              onClick={() => setSelectedMetric(key)}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                selectedMetric === key ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              {config.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 w-full text-xs font-medium text-gray-400">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
            <XAxis dataKey="day" axisLine={false} tickLine={false} dy={10} />
            <YAxis
              axisLine={false}
              tickLine={false}
              tickFormatter={(val) => selectedMetric === 'distance' ? `${val}km` : String(val)}
            />
            <Tooltip 
              cursor={{ fill: '#F3F4F6' }}
              contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', color: '#05020F' }}
              itemStyle={{ fontWeight: 600, color: selectedConfig.color }}
            />
            <Bar dataKey={selectedMetric} radius={[6, 6, 6, 6]} barSize={32} fill={selectedConfig.color}>
              {chartData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry[selectedMetric] === maxValue ? selectedConfig.color : '#E5E7EB'} 
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}