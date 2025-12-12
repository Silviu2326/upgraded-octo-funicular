import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import type { KPIs } from '../../hooks/useWarRoom';

interface KPIPanelProps {
  kpis: KPIs | null;
}

const TrendIcon = ({ trend }: { trend: 'up' | 'down' | 'stable' }) => {
  if (trend === 'up') return <TrendingUp size={14} className="text-obsidian-success" />;
  if (trend === 'down') return <TrendingDown size={14} className="text-red-400" />;
  return <Minus size={14} className="text-obsidian-text-muted" />;
};

export const KPIPanel: React.FC<KPIPanelProps> = ({ kpis }) => {
  if (!kpis) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-obsidian-text-muted">Cargando KPIs...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 h-full">
      {/* Ingresos */}
      <div className="flex-1 flex flex-col justify-center border-l border-white/[0.06] pl-6 group hover:border-obsidian-accent/30 transition-colors">
        <span className="text-xs text-obsidian-text-muted tracking-widest uppercase mb-2">
          Ingresos Totales
        </span>
        <div className="flex items-start gap-2">
          <h2 className="text-[56px] leading-[0.9] font-thin text-white tracking-[-1px] tabular-nums">
            ${kpis.revenue.current.toLocaleString()}
          </h2>
          <div className="mt-4">
            <TrendIcon trend={kpis.revenue.trend} />
          </div>
        </div>
        <p className="text-[11px] text-obsidian-text-muted mt-2 font-mono">
          <span className={kpis.revenue.change >= 0 ? 'text-obsidian-success' : 'text-red-400'}>
            {kpis.revenue.change >= 0 ? '+' : ''}{kpis.revenue.change}%
          </span> vs mes anterior <span className="opacity-30">|</span> Target: ${kpis.revenue.target.toLocaleString()}
        </p>
      </div>

      {/* Rentabilidad */}
      <div className="flex-1 flex flex-col justify-center border-l border-white/[0.06] pl-6 group hover:border-obsidian-accent/30 transition-colors">
        <span className="text-xs text-obsidian-text-muted tracking-widest uppercase mb-2">
          Rentabilidad Operativa
        </span>
        <div className="flex items-start gap-2">
          <h2 className="text-[42px] leading-[0.9] font-thin text-white tracking-[-1px] tabular-nums">
            {kpis.profitability.current.toFixed(1)}%
          </h2>
          <div className="mt-3">
            <TrendIcon trend={kpis.profitability.trend} />
          </div>
        </div>
        <p className="text-[11px] text-obsidian-text-muted mt-2 font-mono">
          <span className={kpis.profitability.change >= 0 ? 'text-obsidian-success' : 'text-red-400'}>
            {kpis.profitability.change >= 0 ? '+' : ''}{kpis.profitability.change.toFixed(1)}%
          </span> vs objetivo
        </p>
      </div>

      {/* Eficiencia */}
      <div className="flex-1 flex flex-col justify-center border-l border-white/[0.06] pl-6 group hover:border-obsidian-accent/30 transition-colors">
        <span className="text-xs text-obsidian-text-muted tracking-widest uppercase mb-2">
          Eficiencia de Agentes
        </span>
        <div className="flex items-start gap-2">
          <h2 className="text-[42px] leading-[0.9] font-thin text-white tracking-[-1px] tabular-nums">
            {kpis.efficiency.current.toFixed(1)}%
          </h2>
          <div className="mt-3">
            <TrendIcon trend={kpis.efficiency.trend} />
          </div>
        </div>
        <p className="text-[11px] text-obsidian-text-muted mt-2 font-mono">
          <span className="text-obsidian-success">
            +{kpis.efficiency.change.toFixed(1)}%
          </span> vs mes anterior
        </p>
      </div>

      {/* Métricas de Sistema */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white/[0.02] border border-white/[0.04] rounded px-4 py-3">
          <div className="text-[10px] text-obsidian-text-muted uppercase tracking-widest mb-1">Uptime</div>
          <div className="text-xl font-thin text-white tabular-nums">{kpis.uptime.current}%</div>
        </div>
        <div className="bg-white/[0.02] border border-white/[0.04] rounded px-4 py-3">
          <div className="text-[10px] text-obsidian-text-muted uppercase tracking-widest mb-1">Latencia</div>
          <div className="text-xl font-thin text-white tabular-nums">{kpis.latency.current}ms</div>
        </div>
      </div>
    </div>
  );
};
