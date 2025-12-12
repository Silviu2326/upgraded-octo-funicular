import React from 'react';
import { Cpu, Globe, Activity } from 'lucide-react';
import type { KPIs } from '../../hooks/useWarRoom';

interface SystemMetricsProps {
  kpis: KPIs | null;
}

export const SystemMetrics: React.FC<SystemMetricsProps> = ({ kpis }) => {
  if (!kpis) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-obsidian-text-muted text-xs">Cargando métricas...</div>
      </div>
    );
  }

  const { activeClients, systemLoad } = kpis;

  return (
    <div className="h-full flex flex-col justify-between">
      {/* Clientes Activos */}
      <div className="flex flex-col items-center justify-center flex-1">
        <div className="relative w-32 h-32 flex items-center justify-center mb-4">
          <svg className="absolute inset-0 w-full h-full rotate-[-90deg]">
            <circle
              cx="64"
              cy="64"
              r="62"
              stroke="#FFFFFF"
              strokeOpacity="0.1"
              strokeWidth="0.5"
              fill="none"
            />
            <circle
              cx="64"
              cy="64"
              r="62"
              stroke="#6A4FFB"
              strokeWidth="0.5"
              fill="none"
              strokeDasharray="390"
              strokeDashoffset="100"
              strokeLinecap="round"
              className="animate-[spin_10s_linear_infinite]"
            />
          </svg>
          <svg className="absolute inset-0 w-full h-full rotate-[-90deg] p-4">
            <circle
              cx="64"
              cy="64"
              r="45"
              stroke="#FFFFFF"
              strokeOpacity="0.05"
              strokeWidth="2"
              fill="none"
            />
            <circle
              cx="64"
              cy="64"
              r="45"
              stroke="#FFFFFF"
              strokeOpacity="0.8"
              strokeWidth="2"
              fill="none"
              strokeDasharray={`${2 * Math.PI * 45}`}
              strokeDashoffset={`${2 * Math.PI * 45 * (1 - activeClients.percentage / 100)}`}
            />
          </svg>
          <div className="text-center z-10">
            <div className="text-2xl font-thin text-white tracking-tighter">
              {activeClients.percentage.toFixed(0)}
              <span className="text-sm text-obsidian-text-muted">%</span>
            </div>
          </div>
        </div>

        <div className="text-center">
          <p className="text-[10px] uppercase tracking-widest text-obsidian-text-muted mb-3">
            {activeClients.current}/{activeClients.total} Agentes Activos
          </p>
          <button className="px-4 py-1.5 border border-white/20 text-[10px] text-white font-medium tracking-[2px] hover:bg-white hover:text-black hover:border-white transition-all duration-300 uppercase">
            Desplegar Reserva
          </button>
        </div>
      </div>

      {/* Métricas del Sistema */}
      <div className="grid grid-cols-3 gap-3 mt-4">
        <div className="bg-white/[0.02] border border-white/[0.04] rounded px-3 py-2.5 flex flex-col items-center">
          <Globe size={14} className="text-obsidian-text-muted mb-1.5" />
          <div className="text-[9px] text-obsidian-text-muted uppercase tracking-widest mb-0.5">Latencia</div>
          <div className="text-base font-thin text-white tabular-nums">{kpis.latency.current}ms</div>
        </div>

        <div className="bg-white/[0.02] border border-white/[0.04] rounded px-3 py-2.5 flex flex-col items-center">
          <Activity size={14} className="text-obsidian-text-muted mb-1.5" />
          <div className="text-[9px] text-obsidian-text-muted uppercase tracking-widest mb-0.5">Carga</div>
          <div className="text-base font-thin text-white tabular-nums">{systemLoad.current.toFixed(0)}%</div>
        </div>

        <div className="bg-white/[0.02] border border-white/[0.04] rounded px-3 py-2.5 flex flex-col items-center">
          <Cpu size={14} className="text-obsidian-text-muted mb-1.5" />
          <div className="text-[9px] text-obsidian-text-muted uppercase tracking-widest mb-0.5">Uptime</div>
          <div className="text-base font-thin text-white tabular-nums">{kpis.uptime.current}%</div>
        </div>
      </div>
    </div>
  );
};
