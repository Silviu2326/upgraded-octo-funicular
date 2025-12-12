import React, { useState } from 'react';
import { Save, Trash2, Check, X, Folder } from 'lucide-react';
import type { Scenario } from '../../hooks/useDTOLab';

interface ScenarioManagerProps {
  scenarios: Scenario[];
  selectedScenario: string | null;
  onSave: (name: string) => void;
  onLoad: (scenarioId: string) => void;
  onDelete: (scenarioId: string) => void;
}

export const ScenarioManager: React.FC<ScenarioManagerProps> = ({
  scenarios,
  selectedScenario,
  onSave,
  onLoad,
  onDelete
}) => {
  const [isCreating, setIsCreating] = useState(false);
  const [scenarioName, setScenarioName] = useState('');

  const handleSave = () => {
    if (scenarioName.trim()) {
      onSave(scenarioName.trim());
      setScenarioName('');
      setIsCreating(false);
    }
  };

  const handleCancel = () => {
    setScenarioName('');
    setIsCreating(false);
  };

  return (
    <div className="h-full w-full flex flex-col">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/10">
        <div>
          <h3 className="text-xs text-obsidian-text-muted tracking-widest uppercase">
            Escenarios Guardados
          </h3>
          <div className="text-[9px] text-obsidian-text-muted/60 mt-0.5">
            {scenarios.length} escenario{scenarios.length !== 1 ? 's' : ''}
          </div>
        </div>

        {!isCreating && (
          <button
            onClick={() => setIsCreating(true)}
            className="flex items-center gap-1.5 px-2 py-1 border border-obsidian-accent/30 text-obsidian-accent text-[10px] uppercase tracking-wider hover:bg-obsidian-accent/10 transition-colors rounded"
          >
            <Save size={10} />
            Guardar Actual
          </button>
        )}
      </div>

      {/* Formulario de creación */}
      {isCreating && (
        <div className="mb-3 p-3 bg-white/5 border border-obsidian-accent/30 rounded animate-[fadeIn_0.2s_ease-out]">
          <input
            type="text"
            value={scenarioName}
            onChange={(e) => setScenarioName(e.target.value)}
            placeholder="Nombre del escenario..."
            className="w-full bg-transparent border-b border-white/20 text-xs text-white py-1 px-1 focus:outline-none focus:border-obsidian-accent mb-2"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSave();
              if (e.key === 'Escape') handleCancel();
            }}
          />
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              disabled={!scenarioName.trim()}
              className="flex-1 flex items-center justify-center gap-1 px-2 py-1 bg-obsidian-success text-black text-[9px] uppercase tracking-wider hover:bg-obsidian-success/90 transition-colors rounded disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Check size={10} />
              Guardar
            </button>
            <button
              onClick={handleCancel}
              className="flex-1 flex items-center justify-center gap-1 px-2 py-1 border border-white/20 text-white text-[9px] uppercase tracking-wider hover:bg-white/5 transition-colors rounded"
            >
              <X size={10} />
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Lista de escenarios */}
      <div className="flex-1 overflow-y-auto space-y-2 pr-2">
        {scenarios.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Folder size={32} className="text-obsidian-text-muted/30 mb-2" />
            <div className="text-xs text-obsidian-text-muted/60">
              No hay escenarios guardados
            </div>
            <div className="text-[10px] text-obsidian-text-muted/40 mt-1">
              Guarda tu simulación actual
            </div>
          </div>
        ) : (
          scenarios.map((scenario) => (
            <div
              key={scenario.id}
              className={`group relative p-3 border rounded transition-all cursor-pointer ${
                selectedScenario === scenario.id
                  ? 'border-obsidian-accent bg-obsidian-accent/5'
                  : 'border-white/10 hover:border-white/20 hover:bg-white/5'
              }`}
              onClick={() => onLoad(scenario.id)}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1 pr-2">
                  <h4 className="text-xs text-white font-medium truncate">{scenario.name}</h4>
                  <div className="text-[9px] text-obsidian-text-muted mt-0.5">
                    {new Date(scenario.createdAt).toLocaleDateString('es-ES', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric'
                    })}
                  </div>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(scenario.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 transition-opacity text-red-400 hover:text-red-300"
                >
                  <Trash2 size={12} />
                </button>
              </div>

              <div className="flex items-center gap-3 text-[9px]">
                <div>
                  <span className="text-obsidian-text-muted">ROI: </span>
                  <span className={scenario.results.projectedROI >= scenario.results.baselineROI ? 'text-obsidian-success' : 'text-red-400'}>
                    {scenario.results.projectedROI.toFixed(1)}%
                  </span>
                </div>
                <div>
                  <span className="text-obsidian-text-muted">Prob: </span>
                  <span className="text-white">{scenario.results.successProbability.toFixed(0)}%</span>
                </div>
              </div>

              {selectedScenario === scenario.id && (
                <div className="absolute top-2 right-2">
                  <div className="w-1.5 h-1.5 bg-obsidian-accent rounded-full animate-pulse" />
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
