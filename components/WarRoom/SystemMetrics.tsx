import React, { useState } from 'react';
import { Cpu, Globe, Activity, X, AlertTriangle, Zap, HelpCircle } from 'lucide-react';
import type { KPIs } from '../../hooks/useWarRoom';
import { ObsidianCard, ObsidianTooltip } from '../ui/ObsidianElements';

interface SystemMetricsProps {
  kpis: KPIs | null;
}

export const SystemMetrics: React.FC<SystemMetricsProps> = ({ kpis }) => {
  const [showReserveModal, setShowReserveModal] = useState(false);
  const [isDeploying, setIsDeploying] = useState(false);

  if (!kpis) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-obsidian-text-muted text-xs">Cargando métricas...</div>
      </div>
    );
  }

  const { activeClients, systemLoad } = kpis;

  const reserveAgents = Math.floor(activeClients.total * 0.3); // 30% en reserva
  const estimatedCost = reserveAgents * 12; // $12 por agente
  const deploymentTime = Math.ceil(reserveAgents / 50); // 50 agentes por minuto

  const handleDeployReserve = () => {
    setIsDeploying(true);
    // Simulación de despliegue
    setTimeout(() => {
      setIsDeploying(false);
      setShowReserveModal(false);
      // Aquí se actualizarían los agentes activos en producción
    }, 2000);
  };

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
          <p className="text-[10px] uppercase tracking-widest text-obsidian-text-muted mb-3 flex items-center justify-center gap-2">
            {activeClients.current}/{activeClients.total} Agentes Activos
            <ObsidianTooltip content="Número de agentes del enjambre actualmente operativos sobre el total disponible. El porcentaje indica la utilización actual de la capacidad del sistema." position="top">
              <HelpCircle size={10} className="cursor-help opacity-50 hover:opacity-100 transition-opacity" />
            </ObsidianTooltip>
          </p>
          <button
            onClick={() => setShowReserveModal(true)}
            className="px-4 py-1.5 border border-white/20 text-[10px] text-white font-medium tracking-[2px] hover:bg-white hover:text-black hover:border-white transition-all duration-300 uppercase"
          >
            Desplegar Reserva
          </button>
        </div>
      </div>

      {/* Métricas del Sistema */}
      <div className="grid grid-cols-3 gap-3 mt-4">
        <div className="bg-white/[0.02] border border-white/[0.04] rounded px-3 py-2.5 flex flex-col items-center group relative">
          <Globe size={14} className="text-obsidian-text-muted mb-1.5" />
          <div className="text-[9px] text-obsidian-text-muted uppercase tracking-widest mb-0.5 flex items-center gap-1">
            Latencia
            <ObsidianTooltip content="Tiempo promedio de respuesta del sistema en milisegundos. Valores bajos indican mejor rendimiento y velocidad de procesamiento." position="top">
              <HelpCircle size={8} className="cursor-help opacity-0 group-hover:opacity-50 hover:!opacity-100 transition-opacity" />
            </ObsidianTooltip>
          </div>
          <div className="text-base font-thin text-white tabular-nums">{kpis.latency.current}ms</div>
        </div>

        <div className="bg-white/[0.02] border border-white/[0.04] rounded px-3 py-2.5 flex flex-col items-center group relative">
          <Activity size={14} className="text-obsidian-text-muted mb-1.5" />
          <div className="text-[9px] text-obsidian-text-muted uppercase tracking-widest mb-0.5 flex items-center gap-1">
            Carga
            <ObsidianTooltip content="Porcentaje de utilización actual de los recursos computacionales del sistema. Incluye CPU, memoria y procesamiento de agentes." position="top">
              <HelpCircle size={8} className="cursor-help opacity-0 group-hover:opacity-50 hover:!opacity-100 transition-opacity" />
            </ObsidianTooltip>
          </div>
          <div className="text-base font-thin text-white tabular-nums">{systemLoad.current.toFixed(0)}%</div>
        </div>

        <div className="bg-white/[0.02] border border-white/[0.04] rounded px-3 py-2.5 flex flex-col items-center group relative">
          <Cpu size={14} className="text-obsidian-text-muted mb-1.5" />
          <div className="text-[9px] text-obsidian-text-muted uppercase tracking-widest mb-0.5 flex items-center gap-1">
            Uptime
            <ObsidianTooltip content="Porcentaje del tiempo que el sistema ha estado operativo sin interrupciones en el período actual. 99.9% es el objetivo estándar." position="top">
              <HelpCircle size={8} className="cursor-help opacity-0 group-hover:opacity-50 hover:!opacity-100 transition-opacity" />
            </ObsidianTooltip>
          </div>
          <div className="text-base font-thin text-white tabular-nums">{kpis.uptime.current}%</div>
        </div>
      </div>

      {/* Modal de Desplegar Reserva */}
      {showReserveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <ObsidianCard className="w-full max-w-md">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-lg text-white font-light mb-1 flex items-center gap-2">
                  <Zap size={20} className="text-obsidian-accent" />
                  Desplegar Agentes de Reserva
                </h3>
                <p className="text-xs text-obsidian-text-muted">
                  Activación de capacidad adicional del enjambre
                </p>
              </div>
              <button
                onClick={() => setShowReserveModal(false)}
                disabled={isDeploying}
                className="p-2 rounded-lg border border-white/[0.1] hover:bg-white/[0.05] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <X size={18} className="text-white" />
              </button>
            </div>

            <div className="space-y-4 mb-6">
              {/* Explicación */}
              <div className="bg-obsidian-accent/10 border border-obsidian-accent/20 rounded-lg p-4">
                <div className="flex gap-3">
                  <AlertTriangle size={18} className="text-obsidian-accent flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm text-white font-medium mb-1">¿Qué hace esta acción?</h4>
                    <p className="text-xs text-obsidian-text-muted leading-relaxed">
                      Despliega agentes de reserva almacenados en standby para incrementar la capacidad
                      operativa del sistema. Estos agentes se activarán inmediatamente y comenzarán a procesar
                      tareas en cola o distribuir la carga actual.
                    </p>
                  </div>
                </div>
              </div>

              {/* Detalles de Despliegue */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/[0.02] border border-white/[0.04] rounded-lg p-3">
                  <div className="text-[9px] text-obsidian-text-muted uppercase tracking-wider mb-1">
                    Agentes en Reserva
                  </div>
                  <div className="text-2xl font-thin text-white tabular-nums">
                    {reserveAgents}
                  </div>
                  <div className="text-[10px] text-obsidian-text-muted mt-1">
                    Disponibles para despliegue
                  </div>
                </div>

                <div className="bg-white/[0.02] border border-white/[0.04] rounded-lg p-3">
                  <div className="text-[9px] text-obsidian-text-muted uppercase tracking-wider mb-1">
                    Tiempo Estimado
                  </div>
                  <div className="text-2xl font-thin text-white tabular-nums">
                    {deploymentTime}
                    <span className="text-sm text-obsidian-text-muted ml-1">min</span>
                  </div>
                  <div className="text-[10px] text-obsidian-text-muted mt-1">
                    Hasta operación completa
                  </div>
                </div>

                <div className="bg-white/[0.02] border border-white/[0.04] rounded-lg p-3">
                  <div className="text-[9px] text-obsidian-text-muted uppercase tracking-wider mb-1">
                    Coste Estimado
                  </div>
                  <div className="text-2xl font-thin text-white tabular-nums">
                    ${estimatedCost}
                  </div>
                  <div className="text-[10px] text-obsidian-text-muted mt-1">
                    Por hora de operación
                  </div>
                </div>

                <div className="bg-white/[0.02] border border-white/[0.04] rounded-lg p-3">
                  <div className="text-[9px] text-obsidian-text-muted uppercase tracking-wider mb-1">
                    Incremento de Capacidad
                  </div>
                  <div className="text-2xl font-thin text-obsidian-success tabular-nums">
                    +{((reserveAgents / activeClients.total) * 100).toFixed(0)}%
                  </div>
                  <div className="text-[10px] text-obsidian-text-muted mt-1">
                    Sobre capacidad actual
                  </div>
                </div>
              </div>

              {/* Impacto Esperado */}
              <div>
                <h4 className="text-xs text-obsidian-text-muted uppercase mb-2">Impacto Esperado</h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs">
                    <div className="w-1.5 h-1.5 rounded-full bg-obsidian-success"></div>
                    <span className="text-obsidian-text-secondary">Reducción de latencia del sistema</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <div className="w-1.5 h-1.5 rounded-full bg-obsidian-success"></div>
                    <span className="text-obsidian-text-secondary">Mayor throughput de tareas</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <div className="w-1.5 h-1.5 rounded-full bg-obsidian-success"></div>
                    <span className="text-obsidian-text-secondary">Mejor distribución de carga</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <div className="w-1.5 h-1.5 rounded-full bg-obsidian-accent"></div>
                    <span className="text-obsidian-text-secondary">Incremento en costes operativos</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Botones de Acción */}
            <div className="flex gap-3">
              <button
                onClick={() => setShowReserveModal(false)}
                disabled={isDeploying}
                className="flex-1 px-4 py-2.5 bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.1] rounded-md text-sm text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancelar
              </button>
              <button
                onClick={handleDeployReserve}
                disabled={isDeploying}
                className="flex-1 px-4 py-2.5 bg-obsidian-accent hover:bg-obsidian-accent/80 border border-obsidian-accent rounded-md text-sm text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isDeploying ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Desplegando...
                  </>
                ) : (
                  <>
                    <Zap size={16} />
                    Confirmar Despliegue
                  </>
                )}
              </button>
            </div>
          </ObsidianCard>
        </div>
      )}
    </div>
  );
};
