import React from 'react';
import { Zap, TrendingUp, DollarSign, HelpCircle } from 'lucide-react';
import type { Opportunity } from '../../hooks/useWarRoom';
import { ObsidianCard, ObsidianTooltip } from '../ui/ObsidianElements';

interface OpportunitiesPanelProps {
  opportunities: Opportunity[];
}

const getTypeIcon = (type: string) => {
  switch (type) {
    case 'arbitrage': return <Zap size={16} className="text-obsidian-accent" fill="currentColor" fillOpacity={0.2} />;
    case 'market': return <TrendingUp size={16} className="text-blue-400" />;
    case 'expansion': return <DollarSign size={16} className="text-obsidian-success" />;
    default: return <Zap size={16} className="text-obsidian-text-muted" />;
  }
};

const getRiskColor = (risk: string) => {
  switch (risk) {
    case 'validated': return 'text-obsidian-success';
    case 'low': return 'text-blue-400';
    case 'medium': return 'text-yellow-400';
    case 'high': return 'text-red-400';
    default: return 'text-obsidian-text-muted';
  }
};

export const OpportunitiesPanel: React.FC<OpportunitiesPanelProps> = ({ opportunities }) => {
  const topOpportunity = opportunities[0];

  if (!topOpportunity) {
    return (
      <ObsidianCard className="p-5">
        <div className="text-xs text-obsidian-text-muted text-center">
          No hay oportunidades disponibles
        </div>
      </ObsidianCard>
    );
  }

  return (
    <div className="space-y-3">
      {/* Oportunidad destacada */}
      <ObsidianCard className="p-5 border-t border-obsidian-accent/20 hover:border-obsidian-accent/40 transition-colors">
        <div className="flex items-start gap-3">
          <div className="mt-1">
            {getTypeIcon(topOpportunity.type)}
          </div>
          <div className="flex-1">
            <div className="flex items-start justify-between mb-2">
              <div>
                <h4 className="text-white text-sm font-light leading-tight mb-1">
                  {topOpportunity.description}
                </h4>
                <p className="text-[10px] text-obsidian-text-muted uppercase tracking-wider">
                  Sector: {topOpportunity.sector}
                </p>
              </div>
              <div className="text-right">
                <div className="text-xs text-obsidian-text-muted flex items-center justify-end gap-1">
                  Valor Estimado
                  <ObsidianTooltip content="Valor monetario estimado de la oportunidad basado en análisis predictivo y datos históricos del mercado." position="left">
                    <HelpCircle size={10} className="cursor-help opacity-50 hover:opacity-100 transition-opacity" />
                  </ObsidianTooltip>
                </div>
                <div className="text-lg font-thin text-obsidian-success tabular-nums">
                  ${topOpportunity.value.toLocaleString()}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4 mb-3">
              <div className="flex items-center gap-1">
                <span className="text-[10px] text-obsidian-text-muted">Probabilidad: </span>
                <span className="text-sm text-white font-medium">{topOpportunity.probability}%</span>
                <ObsidianTooltip content="Probabilidad de éxito calculada por el modelo predictivo del enjambre basándose en múltiples variables del mercado." position="top">
                  <HelpCircle size={9} className="cursor-help opacity-40 hover:opacity-100 transition-opacity" />
                </ObsidianTooltip>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-[10px] text-obsidian-text-muted">Riesgo: </span>
                <span className={`text-sm font-medium uppercase ${getRiskColor(topOpportunity.risk)}`}>
                  {topOpportunity.risk}
                </span>
                <ObsidianTooltip content="Nivel de riesgo evaluado: validated (validado), low (bajo), medium (medio), high (alto). Basado en volatilidad y factores externos." position="top">
                  <HelpCircle size={9} className="cursor-help opacity-40 hover:opacity-100 transition-opacity" />
                </ObsidianTooltip>
              </div>
            </div>

            <div className="w-full bg-white/5 rounded-full h-1.5 mb-3 overflow-hidden">
              <div
                className="bg-obsidian-accent h-full"
                style={{ width: `${topOpportunity.probability}%` }}
              />
            </div>

            <a
              href="#"
              className="text-[10px] text-obsidian-accent border-b border-obsidian-accent/30 pb-0.5 hover:text-white hover:border-white transition-colors"
            >
              Simular en DTO Lab →
            </a>
          </div>
        </div>
      </ObsidianCard>

      {/* Lista de otras oportunidades */}
      {opportunities.length > 1 && (
        <div className="space-y-2">
          <div className="text-[10px] text-obsidian-text-muted uppercase tracking-wider px-1">
            Otras Oportunidades
          </div>
          {opportunities.slice(1, 4).map(opp => (
            <div
              key={opp.id}
              className="bg-white/[0.02] border border-white/[0.04] rounded p-3 hover:border-white/10 transition-colors cursor-pointer"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  {getTypeIcon(opp.type)}
                  <span className="text-xs text-white">{opp.sector}</span>
                </div>
                <span className="text-xs text-obsidian-success tabular-nums">
                  ${(opp.value / 1000).toFixed(0)}k
                </span>
              </div>
              <div className="flex items-center gap-3 text-[10px]">
                <span className="text-obsidian-text-muted">
                  Prob: <span className="text-white">{opp.probability}%</span>
                </span>
                <span className={getRiskColor(opp.risk)}>
                  {opp.risk}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
