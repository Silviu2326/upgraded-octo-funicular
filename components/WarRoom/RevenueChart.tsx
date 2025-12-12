import React from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import type { KPIs } from '../../hooks/useWarRoom';

interface RevenueChartProps {
  kpis: KPIs | null;
}

export const RevenueChart: React.FC<RevenueChartProps> = ({ kpis }) => {
  if (!kpis || !kpis.revenue.history || kpis.revenue.history.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-obsidian-text-muted text-xs">Cargando datos históricos...</div>
      </div>
    );
  }

  const data = kpis.revenue.history.map(item => ({
    date: new Date(item.date).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' }),
    value: item.value
  }));

  return (
    <div className="h-full w-full">
      <div className="mb-4">
        <h3 className="text-xs text-obsidian-text-muted tracking-widest uppercase mb-1">
          Evolución de Ingresos (30 días)
        </h3>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-thin text-white tabular-nums">
            ${kpis.revenue.current.toLocaleString()}
          </span>
          <span className={`text-sm ${kpis.revenue.change >= 0 ? 'text-obsidian-success' : 'text-red-400'}`}>
            {kpis.revenue.change >= 0 ? '+' : ''}{kpis.revenue.change}%
          </span>
        </div>
      </div>

      <ResponsiveContainer width="100%" height="85%">
        <LineChart data={data} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
          <defs>
            <linearGradient id="lineGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#6A4FFB" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#6A4FFB" stopOpacity={0.1}/>
            </linearGradient>
          </defs>
          <XAxis
            dataKey="date"
            stroke="#BEBEC6"
            strokeOpacity={0.2}
            tick={{ fill: '#BEBEC6', fontSize: 10, opacity: 0.5 }}
            axisLine={{ strokeOpacity: 0.1 }}
            tickLine={false}
          />
          <YAxis
            stroke="#BEBEC6"
            strokeOpacity={0.2}
            tick={{ fill: '#BEBEC6', fontSize: 10, opacity: 0.5 }}
            axisLine={{ strokeOpacity: 0.1 }}
            tickLine={false}
            tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1A1A1F',
              border: '1px solid rgba(190, 190, 198, 0.1)',
              borderRadius: '4px',
              fontSize: '11px'
            }}
            labelStyle={{ color: '#BEBEC6' }}
            itemStyle={{ color: '#6A4FFB' }}
            formatter={(value: any) => [`$${value.toLocaleString()}`, 'Ingresos']}
          />
          <Line
            type="monotone"
            dataKey="value"
            stroke="#6A4FFB"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, fill: '#6A4FFB', stroke: '#fff', strokeWidth: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
