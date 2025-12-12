import React from 'react';
import { AlertCircle, Info, AlertTriangle, CheckCircle, X } from 'lucide-react';
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
  const unreadAlerts = alerts.filter(a => !a.read);

  if (alerts.length === 0) {
    return (
      <div className="text-center py-8 text-obsidian-text-muted text-xs">
        <CheckCircle size={32} className="mx-auto mb-2 opacity-30" />
        <div>No hay alertas activas</div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {unreadAlerts.length > 0 && (
        <div className="flex items-center justify-between">
          <div className="text-[10px] text-obsidian-text-muted uppercase tracking-wider">
            Alertas sin leer ({unreadAlerts.length})
          </div>
        </div>
      )}

      {alerts.map(alert => (
        <div
          key={alert.id}
          className={`border rounded p-4 transition-all ${getSeverityColor(alert.severity)} ${alert.read ? 'opacity-50' : ''}`}
        >
          <div className="flex items-start gap-3">
            <div className="mt-0.5">
              {getAlertIcon(alert.type, alert.severity)}
            </div>

            <div className="flex-1">
              <div className="flex items-start justify-between mb-1">
                <h4 className="text-white text-sm font-medium">{alert.title}</h4>
                {onMarkAsRead && !alert.read && (
                  <button
                    onClick={() => onMarkAsRead(alert.id)}
                    className="text-obsidian-text-muted hover:text-white transition-colors"
                    title="Marcar como leída"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>

              <p className="text-xs text-obsidian-text-secondary leading-relaxed mb-2">
                {alert.description}
              </p>

              <div className="flex items-center justify-between">
                {alert.action && (
                  <div className="text-[10px] text-obsidian-accent">
                    → {alert.action}
                  </div>
                )}
                <div className="text-[9px] text-obsidian-text-muted uppercase tracking-wider">
                  {alert.severity}
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
