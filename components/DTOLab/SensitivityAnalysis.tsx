import React from 'react';
import type { SimulationResults } from '../../hooks/useDTOLab';

interface SensitivityAnalysisProps {
  results: SimulationResults | null;
}

export const SensitivityAnalysis: React.FC<SensitivityAnalysisProps> = ({ results }) => {
  if (!results) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-obsidian-text-muted text-xs">Calculando sensibilidad...</div>
      </div>
    );
  }

  const maxImpact = Math.max(...results.sensitivity.map(s => Math.abs(s.impact)));

  return (
    <div className="h-full w-full p-4">
      <div className="mb-4">
        <h3 className="text-xs text-obsidian-text-muted tracking-widest uppercase mb-1">
          Análisis de Sensibilidad
        </h3>
        <div className="text-[10px] text-obsidian-text-muted/60">
          Impacto de cada parámetro en el ROI
        </div>
      </div>

      <div className="space-y-3">
        {results.sensitivity.map((item, index) => {
          const percentage = (Math.abs(item.impact) / maxImpact) * 100;
          const isPositive = item.impact >= 0;

          return (
            <div key={index} className="group">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs text-white">{item.parameter}</span>
                <span className={`text-xs font-mono tabular-nums ${isPositive ? 'text-obsidian-success' : 'text-red-400'}`}>
                  {isPositive ? '+' : ''}{item.impact.toFixed(1)}%
                </span>
              </div>

              <div className="relative h-6 bg-white/5 rounded overflow-hidden">
                {/* Línea central */}
                <div className="absolute left-1/2 top-0 bottom-0 w-[1px] bg-white/20" />

                {/* Barra de impacto */}
                <div
                  className={`absolute top-0 bottom-0 transition-all duration-500 group-hover:opacity-100 ${
                    isPositive
                      ? 'bg-obsidian-success left-1/2'
                      : 'bg-red-400 right-1/2'
                  }`}
                  style={{
                    width: `${percentage / 2}%`,
                    opacity: 0.7
                  }}
                />

                {/* Etiqueta de valor */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-[9px] text-white/80 font-mono">
                    {Math.abs(item.impact).toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 pt-3 border-t border-white/10">
        <div className="text-[9px] text-obsidian-text-muted space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-obsidian-success rounded-sm" />
            <span>Impacto positivo en ROI</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-red-400 rounded-sm" />
            <span>Impacto negativo en ROI</span>
          </div>
        </div>
      </div>
    </div>
  );
};
