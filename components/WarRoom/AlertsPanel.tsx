import React, { useState } from 'react';
import { AlertCircle, Info, AlertTriangle, CheckCircle, X, Bell, BellOff, Filter } from 'lucide-react';
import type { Alert } from '../../hooks/useWarRoom';

interface AlertsPanelProps {
  alerts: Alert[];
  onMarkAsRead?: (alertId: string) => void;
}

const getAlertIcon = (type: string, severity: string) => {
  switch (type) {
    case 'error':
      return <AlertCircle size={16} className="text-red-400" />;
    case 'warning':
      return <AlertTriangle size={16} className="text-yellow-400" />;
    case 'success':
      return <CheckCircle size={16} className="text-obsidian-success" />;
    default:
      return <Info size={16} className="text-blue-400" />;
  }
};

const getSeverityColor = (severity: string) => {
  switch (severity) {
    case 'critical': return 'border-red-400/30 bg-red-400/5';
    case 'high': return 'border-yellow-400/30 bg-yellow-400/5';
    case 'medium': return 'border-blue-400/30 bg-blue-400/5';
    default: return 'border-white/10 bg-white/[0.02]';
  }
};

export const AlertsPanel: React.FC<AlertsPanelProps> = ({ alerts, onMarkAsRead }) => {
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  const unreadAlerts = alerts.filter(a => !a.read);

  const filteredAlerts = alerts.filter(alert => {
    const matchesSeverity = severityFilter === 'all' || alert.severity === severityFilter;
    const matchesType = typeFilter === 'all' || alert.type === typeFilter;
    return matchesSeverity && matchesType;
  });

  if (alerts.length === 0) {
    return (
      <div className="text-center py-8 text-obsidian-text-muted text-xs">
        <CheckCircle size={32} className="mx-auto mb-2 opacity-30" />
        <div>No hay alertas activas</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header con controles */}
      <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
        <div className="flex items-center gap-3">
          <div className="text-[10px] text-obsidian-text-muted uppercase tracking-wider">
            Alertas {unreadAlerts.length > 0 && `(${unreadAlerts.length} sin leer)`}
          </div>
          {unreadAlerts.length > 0 && (
            <div className="w-2 h-2 rounded-full bg-red-400 animate-pulse"></div>
          )}
        </div>

        {/* Controles */}
        <div className="flex items-center gap-2">
          {/* Filtro de severidad */}
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="px-2 py-1 bg-white/[0.02] border border-white/[0.04] rounded text-[10px] text-white focus:outline-none focus:border-obsidian-accent/30 appearance-none cursor-pointer"
          >
            <option value="all">Todas</option>
            <option value="critical">Críticas</option>
            <option value="high">Altas</option>
            <option value="medium">Medias</option>
            <option value="low">Bajas</option>
          </select>

          {/* Filtro de tipo */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-2 py-1 bg-white/[0.02] border border-white/[0.04] rounded text-[10px] text-white focus:outline-none focus:border-obsidian-accent/30 appearance-none cursor-pointer"
          >
            <option value="all">Todos los tipos</option>
            <option value="error">Errores</option>
            <option value="warning">Avisos</option>
            <option value="success">Éxito</option>
            <option value="info">Información</option>
          </select>

          {/* Toggle de sonido */}
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`p-1.5 rounded border transition-all ${
              soundEnabled
                ? 'border-obsidian-accent/30 bg-obsidian-accent/10 text-obsidian-accent'
                : 'border-white/[0.04] bg-white/[0.02] text-obsidian-text-muted'
            }`}
            title={soundEnabled ? 'Silenciar notificaciones' : 'Activar notificaciones'}
          >
            {soundEnabled ? <Bell size={14} /> : <BellOff size={14} />}
          </button>
        </div>
      </div>

      {filteredAlerts.length === 0 ? (
        <div className="text-center py-8 text-obsidian-text-muted text-xs">
          <Filter size={32} className="mx-auto mb-2 opacity-30" />
          <div>No hay alertas que coincidan con los filtros</div>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredAlerts.map(alert => (
            <div
              key={alert.id}
              className={`
                border rounded p-4 transition-all relative overflow-hidden
                ${getSeverityColor(alert.severity)}
                ${alert.read ? 'opacity-50' : ''}
                ${!alert.read && alert.severity === 'critical' ? 'animate-pulse' : ''}
                ${!alert.read ? 'animate-[slideIn_0.3s_ease-out]' : ''}
              `}
            >
              {/* Barra de severidad lateral */}
              {!alert.read && (
                <div
                  className={`absolute left-0 top-0 bottom-0 w-1 ${
                    alert.severity === 'critical' ? 'bg-red-400' :
                    alert.severity === 'high' ? 'bg-yellow-400' :
                    alert.severity === 'medium' ? 'bg-blue-400' :
                    'bg-obsidian-text-muted'
                  }`}
                />
              )}

              <div className="flex items-start gap-3">
                <div className={`mt-0.5 ${!alert.read && alert.severity === 'critical' ? 'animate-pulse' : ''}`}>
                  {getAlertIcon(alert.type, alert.severity)}
                </div>

                <div className="flex-1">
                  <div className="flex items-start justify-between mb-1">
                    <div className="flex-1">
                      <h4 className="text-white text-sm font-medium mb-0.5">{alert.title}</h4>
                      <div className="flex items-center gap-2">
                        <div className={`text-[9px] uppercase tracking-wider px-2 py-0.5 rounded ${
                          alert.severity === 'critical' ? 'bg-red-400/20 text-red-400' :
                          alert.severity === 'high' ? 'bg-yellow-400/20 text-yellow-400' :
                          alert.severity === 'medium' ? 'bg-blue-400/20 text-blue-400' :
                          'bg-white/5 text-obsidian-text-muted'
                        }`}>
                          {alert.severity}
                        </div>
                        <div className="text-[9px] text-obsidian-text-muted font-mono">
                          {new Date(alert.timestamp).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </div>
                    {onMarkAsRead && !alert.read && (
                      <button
                        onClick={() => onMarkAsRead(alert.id)}
                        className="text-obsidian-text-muted hover:text-white transition-colors ml-2"
                        title="Marcar como leída"
                      >
                        <X size={16} />
                      </button>
                    )}
                  </div>

                  <p className="text-xs text-obsidian-text-secondary leading-relaxed mb-2 mt-2">
                    {alert.description}
                  </p>

                  {alert.action && (
                    <button className="text-[10px] text-obsidian-accent hover:text-white transition-colors border-b border-obsidian-accent/30 hover:border-white pb-0.5">
                      → {alert.action}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
