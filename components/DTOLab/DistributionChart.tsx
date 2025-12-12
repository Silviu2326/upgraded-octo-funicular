import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import type { SimulationResults } from '../../hooks/useDTOLab';

interface DistributionChartProps {
  results: SimulationResults | null;
}

export const DistributionChart: React.FC<DistributionChartProps> = ({ results }) => {
  if (!results) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-obsidian-text-muted text-xs">Ejecutando simulación...</div>
      </div>
    );
  }

  const data = results.distribution.map(d => ({
    roi: d.value.toFixed(1),
    frequency: d.frequency
  }));

  return (
    <div className="h-full w-full p-4">
      <div className="mb-3">
        <h3 className="text-xs text-obsidian-text-muted tracking-widest uppercase mb-1">
          Distribución de Probabilidad
        </h3>
        <div className="text-[10px] text-obsidian-text-muted/60">
          Histograma de 10,000 simulaciones
        </div>
      </div>

      <ResponsiveContainer width="100%" height="85%">
        <BarChart data={data} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
          <XAxis
            dataKey="roi"
            stroke="#BEBEC6"
            strokeOpacity={0.2}
            tick={{ fill: '#BEBEC6', fontSize: 9, opacity: 0.5 }}
            axisLine={{ strokeOpacity: 0.1 }}
            tickLine={false}
            label={{ value: 'ROI (%)', position: 'insideBottom', offset: -5, fill: '#BEBEC6', fontSize: 10 }}
          />
          <YAxis
            stroke="#BEBEC6"
            strokeOpacity={0.2}
            tick={{ fill: '#BEBEC6', fontSize: 9, opacity: 0.5 }}
            axisLine={{ strokeOpacity: 0.1 }}
            tickLine={false}
            label={{ value: 'Frecuencia (%)', angle: -90, position: 'insideLeft', fill: '#BEBEC6', fontSize: 10 }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1A1A1F',
              border: '1px solid rgba(190, 190, 198, 0.1)',
              borderRadius: '4px',
              fontSize: '10px'
            }}
            labelStyle={{ color: '#BEBEC6' }}
            formatter={(value: any) => [`${value.toFixed(2)}%`, 'Frecuencia']}
          />
          <ReferenceLine
            x={results.baselineROI.toFixed(1)}
            stroke="#BEBEC6"
            strokeDasharray="3 3"
            label={{ value: 'Base', position: 'top', fill: '#BEBEC6', fontSize: 9 }}
          />
          <Bar dataKey="frequency" fill="#6A4FFB" opacity={0.8} />
        </BarChart>
      </ResponsiveContainer>

      <div className="mt-2 flex justify-between text-[9px] text-obsidian-text-muted">
        <div>
          <span className="opacity-60">Peor caso: </span>
          <span className="text-red-400">{results.worstCase.toFixed(1)}%</span>
        </div>
        <div>
          <span className="opacity-60">Esperado: </span>
          <span className="text-obsidian-success">{results.expectedValue.toFixed(1)}%</span>
        </div>
        <div>
          <span className="opacity-60">Mejor caso: </span>
          <span className="text-obsidian-success">{results.bestCase.toFixed(1)}%</span>
        </div>
      </div>
    </div>
  );
};
