import React, { useState } from 'react';
import { Play, Pause, StopCircle, ChevronDown, ChevronUp } from 'lucide-react';
import type { Swarm } from '../../hooks/useWarRoom';
import { ObsidianCard } from '../ui/ObsidianElements';

interface SwarmStatusPanelProps {
  swarms: Swarm[];
  onControlSwarm?: (swarmId: string, action: 'pause' | 'resume' | 'stop') => void;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'active': return 'text-obsidian-success';
    case 'paused': return 'text-yellow-400';
    case 'stopped': return 'text-red-400';
    default: return 'text-obsidian-text-muted';
  }
};

const getPerformanceColor = (performance: string) => {
  switch (performance) {
    case 'excellent': return 'text-obsidian-success';
    case 'good': return 'text-blue-400';
    case 'average': return 'text-yellow-400';
    case 'poor': return 'text-red-400';
    default: return 'text-obsidian-text-muted';
  }
};

const SwarmCard: React.FC<{ swarm: Swarm; onControl?: (action: 'pause' | 'resume' | 'stop') => void }> = ({
  swarm,
  onControl
}) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <ObsidianCard className="p-4 hover:border-obsidian-accent/30 transition-colors">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <div className={`w-2 h-2 rounded-full ${swarm.status === 'active' ? 'bg-obsidian-success animate-pulse' : swarm.status === 'paused' ? 'bg-yellow-400' : 'bg-red-400'}`} />
            <h4 className="text-white text-sm font-medium">{swarm.name}</h4>
          </div>
          <p className="text-[10px] text-obsidian-text-muted uppercase tracking-wider">
            {swarm.id} <span className="opacity-50">|</span> {swarm.type}
          </p>
        </div>
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-obsidian-text-muted hover:text-white transition-colors"
        >
          {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
      </div>

      <div className="space-y-2 mb-3">
        <div className="flex justify-between text-xs">
          <span className="text-obsidian-text-muted">Progreso</span>
          <span className="text-white font-mono">{Math.round(swarm.progress)}%</span>
        </div>
        <div className="w-full bg-white/5 rounded-full h-1.5 overflow-hidden">
          <div
            className="bg-obsidian-accent h-full transition-all duration-500"
            style={{ width: `${swarm.progress}%` }}
          />
        </div>
      </div>

      <div className="flex items-center justify-between text-xs mb-3">
        <div>
          <span className="text-obsidian-text-muted">Agentes: </span>
          <span className="text-white font-mono">{swarm.agents.active}/{swarm.agents.total}</span>
        </div>
        <div>
          <span className="text-obsidian-text-muted">Estado: </span>
          <span className={`font-medium uppercase ${getStatusColor(swarm.status)}`}>
            {swarm.status}
          </span>
        </div>
      </div>

      {expanded && (
        <div className="border-t border-white/10 pt-3 mt-3 space-y-3 animate-[fadeIn_0.3s_ease-out]">
          <div>
            <div className="text-[10px] text-obsidian-text-muted uppercase tracking-wider mb-2">Tareas Activas</div>
            <div className="space-y-2">
              {swarm.tasks.map(task => (
                <div key={task.id} className="text-xs">
                  <div className="flex justify-between mb-1">
                    <span className="text-white">{task.name}</span>
                    <span className="text-obsidian-text-muted font-mono">{task.completion}%</span>
                  </div>
                  <div className="w-full bg-white/5 rounded-full h-1 overflow-hidden">
                    <div
                      className="bg-obsidian-accent/60 h-full"
                      style={{ width: `${task.completion}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="text-[10px] text-obsidian-text-muted uppercase tracking-wider mb-2">Rendimiento</div>
            <div className={`text-sm font-medium uppercase ${getPerformanceColor(swarm.performance)}`}>
              {swarm.performance.replace('_', ' ')}
            </div>
          </div>

          {onControl && (
            <div className="flex gap-2 pt-2">
              {swarm.status === 'active' ? (
                <button
                  onClick={() => onControl('pause')}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-1.5 border border-yellow-400/30 text-yellow-400 text-[10px] uppercase tracking-wider hover:bg-yellow-400/10 transition-colors rounded"
                >
                  <Pause size={12} />
                  Pausar
                </button>
              ) : swarm.status === 'paused' ? (
                <button
                  onClick={() => onControl('resume')}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-1.5 border border-obsidian-success/30 text-obsidian-success text-[10px] uppercase tracking-wider hover:bg-obsidian-success/10 transition-colors rounded"
                >
                  <Play size={12} />
                  Reanudar
                </button>
              ) : null}
              <button
                onClick={() => onControl('stop')}
                className="flex-1 flex items-center justify-center gap-2 px-3 py-1.5 border border-red-400/30 text-red-400 text-[10px] uppercase tracking-wider hover:bg-red-400/10 transition-colors rounded"
              >
                <StopCircle size={12} />
                Detener
              </button>
            </div>
          )}
        </div>
      )}
    </ObsidianCard>
  );
};

export const SwarmStatusPanel: React.FC<SwarmStatusPanelProps> = ({ swarms, onControlSwarm }) => {
  return (
    <div className="space-y-4 h-full overflow-y-auto pr-2">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-xs text-obsidian-text-muted tracking-widest uppercase">
          Enjambres Activos ({swarms.length})
        </h3>
      </div>

      {swarms.map(swarm => (
        <SwarmCard
          key={swarm.id}
          swarm={swarm}
          onControl={onControlSwarm ? (action) => onControlSwarm(swarm.id, action) : undefined}
        />
      ))}
    </div>
  );
};
