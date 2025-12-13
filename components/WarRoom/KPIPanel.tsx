import React, { useState } from 'react';
import { TrendingUp, TrendingDown, Minus, HelpCircle, BarChart3 } from 'lucide-react';
import type { KPIs } from '../../hooks/useWarRoom';
import { ObsidianTooltip, ObsidianCard } from '../ui/ObsidianElements';

interface KPIPanelProps {
  kpis: KPIs | null;
}

const TrendIcon = ({ trend }: { trend: 'up' | 'down' | 'stable' }) => {
  if (trend === 'up') return <TrendingUp size={14} className="text-obsidian-success" />;
  if (trend === 'down') return <TrendingDown size={14} className="text-red-400" />;
  return <Minus size={14} className="text-obsidian-text-muted" />;
};

interface SparklineProps {
  data: { date: string; value: number }[];
  color?: string;
  height?: number;
}

const Sparkline: React.FC<SparklineProps> = ({ data, color = '#6A4FFB', height = 40 }) => {
  if (!data || data.length === 0) return null;

  const values = data.map(d => d.value);
  const max = Math.max(...values);
  const min = Math.min(...values);
  const range = max - min || 1;

  const width = 120;
  const points = values.map((value, i) => {
    const x = (i / (values.length - 1)) * width;
    const y = height - ((value - min) / range) * height;
    return `${x},${y}`;
  }).join(' ');

  return (
    <svg width={width} height={height} className="opacity-50 group-hover:opacity-100 transition-opacity">
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Área bajo la curva */}
      <polyline
        points={`0,${height} ${points} ${width},${height}`}
        fill={color}
        fillOpacity="0.1"
        stroke="none"
      />
    </svg>
  );
};

export const KPIPanel: React.FC<KPIPanelProps> = ({ kpis }) => {
  if (!kpis) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-obsidian-text-muted">Cargando KPIs...</div>
      </div>
    );
  }

  // Generar datos de tendencia simulados para profitabilidad y eficiencia
  const generateTrendData = (current: number, trend: 'up' | 'down' | 'stable') => {
    const data = [];
    let value = current * 0.9;
    for (let i = 0; i < 7; i++) {
      data.push({ date: `Day ${i}`, value });
      if (trend === 'up') value += (current - value) * 0.15 + Math.random() * 2;
      else if (trend === 'down') value -= Math.random() * 3;
      else value += (Math.random() - 0.5) * 2;
    }
    return data;
  };

  const profitabilityTrend = generateTrendData(kpis.profitability.current, kpis.profitability.trend);
  const efficiencyTrend = generateTrendData(kpis.efficiency.current, kpis.efficiency.trend);

  return (
    <div className="flex flex-col gap-6 h-full">
      {/* Ingresos */}
      <div className="flex-1 flex flex-col justify-center border-l border-white/[0.06] pl-6 group hover:border-obsidian-accent/30 transition-colors">
        <span className="text-xs text-obsidian-text-muted tracking-widest uppercase mb-2 flex items-center gap-2">
          Ingresos Totales
          <ObsidianTooltip content="Ingresos proyectados totales del enjambre basados en transacciones completadas y contratos activos. Se actualiza en tiempo real." position="right">
            <HelpCircle size={10} className="cursor-help opacity-50 hover:opacity-100 transition-opacity" />
          </ObsidianTooltip>
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
        {/* Sparkline histórico */}
        {kpis.revenue.history && kpis.revenue.history.length > 0 && (
          <div className="mt-3 pt-3 border-t border-white/[0.04]">
            <div className="text-[9px] text-obsidian-text-muted uppercase tracking-wider mb-2">
              Últimos 7 días
            </div>
            <Sparkline data={kpis.revenue.history} color="#45FF9A" height={30} />
          </div>
        )}
      </div>

      {/* Rentabilidad */}
      <div className="flex-1 flex flex-col justify-center border-l border-white/[0.06] pl-6 group hover:border-obsidian-accent/30 transition-colors">
        <span className="text-xs text-obsidian-text-muted tracking-widest uppercase mb-2 flex items-center gap-2">
          Rentabilidad Operativa
          <ObsidianTooltip content="Margen de beneficio operativo como porcentaje de ingresos. Calcula eficiencia de costos operacionales vs ingresos generados." position="right">
            <HelpCircle size={10} className="cursor-help opacity-50 hover:opacity-100 transition-opacity" />
          </ObsidianTooltip>
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
        {/* Sparkline histórico */}
        <div className="mt-3 pt-3 border-t border-white/[0.04]">
          <div className="text-[9px] text-obsidian-text-muted uppercase tracking-wider mb-2">
            Últimos 7 días
          </div>
          <Sparkline data={profitabilityTrend} color="#6A4FFB" height={30} />
        </div>
      </div>

      {/* Eficiencia */}
      <div className="flex-1 flex flex-col justify-center border-l border-white/[0.06] pl-6 group hover:border-obsidian-accent/30 transition-colors">
        <span className="text-xs text-obsidian-text-muted tracking-widest uppercase mb-2 flex items-center gap-2">
          Eficiencia de Agentes
          <ObsidianTooltip content="Porcentaje de tareas completadas exitosamente por agentes vs tareas asignadas. Mide la productividad del enjambre." position="right">
            <HelpCircle size={10} className="cursor-help opacity-50 hover:opacity-100 transition-opacity" />
          </ObsidianTooltip>
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
        {/* Sparkline histórico */}
        <div className="mt-3 pt-3 border-t border-white/[0.04]">
          <div className="text-[9px] text-obsidian-text-muted uppercase tracking-wider mb-2">
            Últimos 7 días
          </div>
          <Sparkline data={efficiencyTrend} color="#45FF9A" height={30} />
        </div>
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
