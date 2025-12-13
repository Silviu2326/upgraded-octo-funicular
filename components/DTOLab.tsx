import React, { useState, useEffect, useRef } from 'react';
import { ObsidianCard, ObsidianButton, ObsidianSlider, ObsidianSwitch } from './ui/ObsidianElements';
import { Terminal, MoveRight, Sparkles, AlertTriangle, Play, TrendingUp, BarChart3, Activity, Layers, ArrowRight, Zap, Target, History, RotateCcw, HelpCircle, Download, Save, X, Trash2, Info } from 'lucide-react';
import { useDTOLab } from '../hooks/useDTOLab';

// Componente Tooltip
const Tooltip: React.FC<{ text: string; children: React.ReactNode }> = ({ text, children }) => {
  const [show, setShow] = useState(false);

  return (
    <span className="relative inline-block">
      <span onMouseEnter={() => setShow(true)} onMouseLeave={() => setShow(false)}>
        {children}
      </span>
      {show && (
        <div className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-[#1A1A1E] border border-white/20 rounded text-xs text-obsidian-text-primary w-64 shadow-xl">
          {text}
          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-[#1A1A1E]"></div>
        </div>
      )}
    </span>
  );
};

const DTOLab: React.FC = () => {
  const {
    params,
    results,
    isComputing,
    updateParam,
    loadPreset,
    scenarios,
    saveScenario,
    loadScenario,
    deleteScenario,
    selectedScenario,
  } = useDTOLab();

  const [hoverX, setHoverX] = useState<number | null>(null);
  const [scenarioName, setScenarioName] = useState('');
  const [showHistoryPanel, setShowHistoryPanel] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // --- Canvas Rendering for "The Cone" ---
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !results) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      const { width, height } = canvas.getBoundingClientRect();
      canvas.width = width * 2;
      canvas.height = height * 2;
      ctx.scale(2, 2);
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    let animationFrameId: number;
    let time = 0;

    const paths = results.trajectories.paths.map((path, i) => ({
      path,
      opacity: Math.random() * 0.08 + 0.01,
      speed: Math.random() * 0.002 + 0.0005
    }));

    const render = () => {
      const { width, height } = canvas.getBoundingClientRect();
      time += 0.5;

      ctx.clearRect(0, 0, width, height);

      const baseY = height / 2;
      const scale = height / 100;

      // Draw Trajectories
      paths.forEach((p, idx) => {
        if (idx > 100) return;

        ctx.beginPath();
        ctx.moveTo(0, baseY);

        const path = p.path;
        const segmentWidth = width / (path.length - 1);

        for (let i = 0; i < path.length; i++) {
          const x = i * segmentWidth;
          const roi = path[i] - results.baselineROI;
          const y = baseY - (roi * scale);
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }

        ctx.strokeStyle = '#6A4FFB';
        ctx.lineWidth = 0.5;
        ctx.globalAlpha = p.opacity;
        ctx.stroke();
      });

      // Draw Median Line
      ctx.globalCompositeOperation = 'source-over';
      ctx.beginPath();
      ctx.moveTo(0, baseY);
      const median = results.trajectories.median;
      const segmentWidth = width / (median.length - 1);
      for (let i = 0; i < median.length; i++) {
        const x = i * segmentWidth;
        const roi = median[i] - results.baselineROI;
        const y = baseY - (roi * scale);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.strokeStyle = '#BEBEC6';
      ctx.lineWidth = 2;
      ctx.globalAlpha = 0.9;
      ctx.stroke();

      // Start Point
      ctx.beginPath();
      ctx.arc(4, baseY, 3, 0, Math.PI * 2);
      ctx.fillStyle = '#FFFFFF';
      ctx.fill();

      // Baseline
      ctx.beginPath();
      ctx.moveTo(0, baseY);
      ctx.lineTo(width, baseY);
      ctx.setLineDash([5, 10]);
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 1;
      ctx.globalAlpha = 0.1;
      ctx.stroke();
      ctx.setLineDash([]);

      // Interaction
      if (hoverX !== null) {
        ctx.beginPath();
        ctx.moveTo(hoverX, 0);
        ctx.lineTo(hoverX, height);
        ctx.strokeStyle = 'rgba(255,255,255,0.2)';
        ctx.lineWidth = 1;
        ctx.globalAlpha = 1;
        ctx.stroke();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();
    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, [results, hoverX]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setHoverX(e.clientX - rect.left);
  };

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'very_low': return '#45FF9A';
      case 'low': return '#6A4FFB';
      case 'medium': return '#FFA500';
      case 'high': return '#FF6B6B';
      case 'very_high': return '#FF0000';
      default: return '#BEBEC6';
    }
  };

  // Función para exportar resultados como CSV
  const exportToCSV = () => {
    if (!results) return;

    const csvData = [
      ['Métrica', 'Valor'],
      ['Probabilidad de Éxito', `${results.successProbability.toFixed(1)}%`],
      ['ROI Proyectado', `${results.projectedROI.toFixed(1)}%`],
      ['ROI Base', `${results.baselineROI.toFixed(1)}%`],
      ['Nivel de Riesgo', results.riskLevel],
      ['Puntuación de Riesgo', `${results.riskScore}`],
      ['Mejor Caso', `${results.bestCase.toFixed(1)}%`],
      ['Peor Caso', `${results.worstCase.toFixed(1)}%`],
      ['Varianza', `${results.variance.toFixed(2)}`],
      [],
      ['Parámetros'],
      ['Ajuste de Precios', `${params.priceAdjustment}%`],
      ['Inversión Marketing', `$${params.marketingInvestment}K`],
      ['Volatilidad Mercado', `${params.marketVolatility}%`],
      ['Reacción Competencia', params.competitorReaction ? 'Sí' : 'No'],
      ['Recesión Económica', params.economicRecession ? 'Sí' : 'No'],
      ['Tendencia Viral', params.viralTrend ? 'Sí' : 'No'],
    ];

    const csv = csvData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `simulacion-${Date.now()}.csv`;
    a.click();
  };

  // Función para guardar escenario con diálogo
  const handleSaveScenario = () => {
    if (scenarioName.trim()) {
      saveScenario(scenarioName);
      setScenarioName('');
      setShowSaveDialog(false);
    }
  };

  return (
    <div className="w-full h-screen bg-[#0B0B0D] text-obsidian-text-primary px-6 py-6 flex flex-col gap-6 overflow-hidden relative font-sans">
      
      {/* Header */}
      <div className="flex justify-between items-center h-16 border-b border-white/5 pb-4">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-xl font-light text-white tracking-widest flex items-center gap-2">
              <Target className="text-obsidian-accent" size={20} />
              DTO LAB <span className="text-obsidian-text-muted text-sm font-normal">GEMELO DIGITAL</span>
            </h1>
            <p className="text-xs text-obsidian-text-muted mt-1">Simulación Monte Carlo y Escenarios Futuros</p>
          </div>
          <Tooltip text="El DTO Lab te permite simular escenarios futuros usando Monte Carlo con 10,000 iteraciones. Ajusta los parámetros y visualiza el 'Cono de Incertidumbre' para tomar decisiones informadas.">
            <button className="text-obsidian-text-muted hover:text-obsidian-accent transition-colors">
              <HelpCircle size={18} />
            </button>
          </Tooltip>
        </div>
        <div className="flex gap-2">
           <ObsidianButton variant="secondary" className="text-xs" onClick={() => setShowHelp(!showHelp)}>
             <Info size={14} className="mr-2"/> Ayuda
           </ObsidianButton>
           <ObsidianButton variant="secondary" className="text-xs" onClick={exportToCSV} disabled={!results}>
             <Download size={14} className="mr-2"/> Exportar CSV
           </ObsidianButton>
           <ObsidianButton variant="secondary" className="text-xs" onClick={() => setShowSaveDialog(true)} disabled={!results}>
             <Save size={14} className="mr-2"/> Guardar Escenario
           </ObsidianButton>
           <ObsidianButton variant="secondary" className="text-xs border-dashed border-white/20" onClick={() => setShowHistoryPanel(!showHistoryPanel)}>
             <History size={14} className="mr-2"/> Historial ({scenarios.length})
           </ObsidianButton>
           <ObsidianButton variant="primary" className="text-xs px-6" isLoading={isComputing} onClick={() => updateParam('timeHorizon', params.timeHorizon)}>
             <Zap size={14} className="mr-2"/> EJECUTAR SIMULACIÓN
           </ObsidianButton>
        </div>
      </div>

      <div className="flex-1 flex gap-6 overflow-hidden">
        
        {/* --- PANEL IZQUIERDO: PARÁMETROS --- */}
        <div className="w-[25%] flex flex-col gap-4">
          <ObsidianCard className="flex-1 flex flex-col overflow-y-auto">
            <div className="flex items-center gap-2 mb-6 border-b border-white/5 pb-2">
              <Terminal size={14} className="text-obsidian-text-muted" />
              <span className="text-[10px] tracking-[0.2em] font-bold text-obsidian-text-muted uppercase">PARÁMETROS DE SIMULACIÓN</span>
            </div>

            {/* Scenario Name */}
            <div className="mb-6">
               <Tooltip text="Escribe un nombre descriptivo para tu escenario. Ejemplo: 'Aumento de precio 20% con marketing agresivo' o 'Escenario conservador sin cambios'">
                 <input
                   className="w-full bg-[#16161A] border border-white/10 rounded px-3 py-2 text-xs text-white focus:border-obsidian-accent outline-none transition-colors placeholder-white/20"
                   placeholder="Nombre del escenario (ej: +20% Precio con marketing alto)"
                   value={scenarioName}
                   onChange={(e) => setScenarioName(e.target.value)}
                 />
               </Tooltip>
            </div>

            {/* Presets */}
            <div className="grid grid-cols-3 gap-2 mb-8">
              <button onClick={() => loadPreset('conservative')} className="py-1.5 border border-white/10 rounded text-[9px] text-white/60 hover:bg-white/5 hover:text-white uppercase tracking-wider transition-all">Conservador</button>
              <button onClick={() => loadPreset('moderate')} className="py-1.5 border border-obsidian-accent/30 bg-obsidian-accent/5 rounded text-[9px] text-obsidian-accent hover:bg-obsidian-accent/10 uppercase tracking-wider transition-all">Moderado</button>
              <button onClick={() => loadPreset('aggressive')} className="py-1.5 border border-white/10 rounded text-[9px] text-white/60 hover:bg-white/5 hover:text-white uppercase tracking-wider transition-all">Agresivo</button>
            </div>

            {/* Variables */}
            <div className="space-y-8 mb-8">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[10px] text-obsidian-text-muted uppercase tracking-wider">AJUSTE DE PRECIOS</span>
                  <Tooltip text="Porcentaje de cambio en precios. Valores positivos incrementan precios, negativos los reducen. Impacta directamente el ROI.">
                    <Info size={12} className="text-obsidian-text-muted cursor-help" />
                  </Tooltip>
                </div>
                <ObsidianSlider label="" min={-50} max={50} value={params.priceAdjustment} onChange={(e) => updateParam('priceAdjustment', Number(e.target.value))} valueDisplay={`${params.priceAdjustment > 0 ? '+' : ''}${params.priceAdjustment}%`} />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[10px] text-obsidian-text-muted uppercase tracking-wider">INVERSIÓN ADS</span>
                  <Tooltip text="Presupuesto en marketing digital (en miles de dólares). Mayor inversión aumenta potencial de retorno pero también el riesgo.">
                    <Info size={12} className="text-obsidian-text-muted cursor-help" />
                  </Tooltip>
                </div>
                <ObsidianSlider label="" min={0} max={100} value={params.marketingInvestment} onChange={(e) => updateParam('marketingInvestment', Number(e.target.value))} valueDisplay={`$${params.marketingInvestment}K`} />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[10px] text-obsidian-text-muted uppercase tracking-wider">VOLATILIDAD MERCADO</span>
                  <Tooltip text="Nivel de incertidumbre del mercado. Mayor volatilidad amplía el cono de resultados posibles.">
                    <Info size={12} className="text-obsidian-text-muted cursor-help" />
                  </Tooltip>
                </div>
                <ObsidianSlider label="" min={10} max={90} value={params.marketVolatility} onChange={(e) => updateParam('marketVolatility', Number(e.target.value))} valueDisplay={`${params.marketVolatility}%`} />
              </div>
            </div>

            {/* External Variables */}
            <div className="space-y-3 pt-6 border-t border-white/5">
              <p className="text-[9px] uppercase tracking-widest text-obsidian-text-muted mb-2">VARIABLES EXTERNAS</p>
              {[
                { id: 'competitorReaction', label: 'Reacción Competencia' },
                { id: 'economicRecession', label: 'Recesión Económica' },
                { id: 'viralTrend', label: 'Tendencia Viral' }
              ].map(v => (
                <div key={v.id} className="flex items-center justify-between group cursor-pointer" onClick={() => updateParam(v.id as any, !params[v.id as keyof typeof params])}>
                   <div className="flex items-center gap-2">
                      <div className={`w-1.5 h-1.5 rounded-full ${params[v.id as keyof typeof params] ? 'bg-red-500 shadow-[0_0_5px_red]' : 'bg-white/20'}`}></div>
                      <span className={`text-xs ${params[v.id as keyof typeof params] ? 'text-white' : 'text-obsidian-text-muted group-hover:text-white'}`}>{v.label}</span>
                   </div>
                   <div className={`w-3 h-3 border border-white/20 rounded flex items-center justify-center ${params[v.id as keyof typeof params] ? 'bg-red-500/20 border-red-500' : ''}`}>
                      {params[v.id as keyof typeof params] && <div className="w-1.5 h-1.5 bg-red-500 rounded-sm"></div>}
                   </div>
                </div>
              ))}
            </div>
          </ObsidianCard>
        </div>

        {/* --- PANEL CENTRAL: CONO DE INCERTIDUMBRE --- */}
        <div className="w-[50%] flex flex-col">
           <ObsidianCard className="h-full relative overflow-hidden" noPadding active={isComputing}>
              <div className="absolute top-6 left-6 z-20 pointer-events-none">
                 <div className="flex items-center gap-3">
                   <div>
                     <h2 className="text-white text-lg font-light tracking-wide mb-1">Cono de Incertidumbre</h2>
                     <p className="text-[10px] text-obsidian-text-muted uppercase tracking-[0.2em] font-mono">
                        SIMULACIÓN MONTE CARLO: 10,000 ITERACIONES
                     </p>
                   </div>
                   <Tooltip text="El cono de incertidumbre muestra múltiples trayectorias posibles basadas en simulación Monte Carlo. Las líneas azules representan diferentes escenarios, la línea gris es la mediana, y el cono se amplía con el tiempo reflejando mayor incertidumbre.">
                     <Info size={14} className="text-obsidian-text-muted cursor-help pointer-events-auto" />
                   </Tooltip>
                 </div>
              </div>

              {/* Leyenda */}
              <div className="absolute top-6 right-6 z-20 bg-[#0F0F12]/80 backdrop-blur border border-white/10 rounded p-3 pointer-events-none">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-0.5 bg-[#6A4FFB]"></div>
                    <span className="text-[9px] text-obsidian-text-primary">Trayectorias simuladas</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-0.5 bg-[#BEBEC6]"></div>
                    <span className="text-[9px] text-obsidian-text-primary">Mediana esperada</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-red-500"></div>
                    <span className="text-[9px] text-obsidian-text-primary">Punto crítico</span>
                  </div>
                </div>
              </div>

              {/* Red Critical Point */}
              <div className="absolute top-1/4 left-1/2 w-2 h-2 rounded-full bg-red-500 shadow-[0_0_10px_red] z-20 animate-pulse"></div>

              <div className="w-full h-full cursor-crosshair relative" onMouseMove={handleMouseMove} onMouseLeave={() => setHoverX(null)}>
                 <canvas ref={canvasRef} className="w-full h-full block" />
                 {isComputing && <div className="absolute inset-0 bg-gradient-to-r from-transparent via-obsidian-accent/10 to-transparent w-[20%] h-full animate-[scan_1s_ease-in-out_infinite]" />}
                 
                 {/* Tooltip */}
                 {hoverX !== null && results && (
                   <div className="absolute top-20 pointer-events-none bg-[#0F0F12]/90 border border-white/10 p-2 rounded backdrop-blur text-xs font-mono z-30" style={{ left: hoverX + 10 }}>
                     <div className="text-obsidian-text-muted mb-1">T+{(hoverX / canvasRef.current!.getBoundingClientRect().width * 90).toFixed(0)} DÍAS</div>
                     <div className="text-obsidian-success">VALOR: {((hoverX / canvasRef.current!.getBoundingClientRect().width) * results.projectedROI * 10).toFixed(0)}k</div>
                   </div>
                 )}
              </div>

              <div className="absolute bottom-4 left-6 right-6 flex justify-between text-[10px] text-obsidian-text-muted font-light pointer-events-none select-none border-t border-white/5 pt-2">
                 <span>HOY (T-0)</span>
                 <span>T+30 DÍAS</span>
                 <span>T+60 DÍAS</span>
                 <span>T+90 DÍAS</span>
              </div>
           </ObsidianCard>
        </div>

        {/* --- PANEL DERECHO: KPI & RIESGO --- */}
        <div className="w-[25%] flex flex-col gap-4">
           
           {/* Probabilidad Éxito */}
           <ObsidianCard className="flex flex-col justify-center items-center py-8">
              <span className="text-[10px] text-obsidian-text-muted uppercase tracking-widest mb-2">PROBABILIDAD ÉXITO</span>
              <div className="text-5xl font-thin text-obsidian-success tracking-tighter mb-2">
                 {results?.successProbability.toFixed(1)}%
              </div>
              <p className="text-[10px] text-obsidian-text-muted">Si ejecutas BTC-7981</p>
           </ObsidianCard>

           {/* Mapa de Riesgo */}
           <ObsidianCard className="flex flex-col justify-center py-6">
              <div className="flex justify-between items-center mb-4">
                 <span className="text-[10px] text-obsidian-text-muted uppercase tracking-widest">MAPA DE RIESGO</span>
                 <AlertTriangle size={12} className={results?.riskLevel === 'high' ? 'text-red-500' : 'text-yellow-500'} />
              </div>
              <div className="h-24 w-full flex gap-1 items-end relative">
                 {/* Simulated vertical gradient bar */}
                 <div className="w-full h-full bg-gradient-to-t from-green-500/20 via-yellow-500/20 to-red-500/20 rounded relative overflow-hidden">
                    <div className="absolute bottom-0 w-full bg-gradient-to-t from-green-500 via-yellow-500 to-red-500 opacity-50" style={{ height: `${results?.riskScore}%` }}></div>
                    <div className="absolute w-full h-[1px] bg-white shadow-[0_0_5px_white]" style={{ bottom: `${results?.riskScore}%` }}></div>
                 </div>
              </div>
              <div className="flex justify-between text-[9px] text-obsidian-text-muted mt-2">
                 <span>BAJO</span>
                 <span>ALTO</span>
              </div>
           </ObsidianCard>

           {/* ROI Proyectado */}
           <ObsidianCard className="flex-1 flex flex-col justify-end">
              <span className="text-[10px] text-obsidian-text-muted uppercase tracking-widest mb-2">ROI PROYECTADO</span>
              <div className="flex items-baseline gap-2 mb-1">
                 <span className="text-2xl font-light text-white">+{results?.projectedROI.toFixed(1)}%</span>
                 <span className="text-xs text-green-400 flex items-center"><TrendingUp size={10} className="mr-0.5"/> Optimal</span>
              </div>
              <div className="flex items-center justify-between text-[10px] border-t border-white/5 pt-2 mt-2">
                 <span className="text-obsidian-text-muted">Valor Base: 12.0%</span>
                 <span className="text-white">vs. Modelo Base</span>
              </div>
           </ObsidianCard>

        </div>

      </div>

      {/* Panel de Ayuda */}
      {showHelp && (
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center" onClick={() => setShowHelp(false)}>
          <div className="bg-[#16161A] border border-white/10 rounded-lg p-6 max-w-2xl m-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-light text-white">Guía de Uso - DTO Lab</h2>
              <button onClick={() => setShowHelp(false)} className="text-obsidian-text-muted hover:text-white">
                <X size={20} />
              </button>
            </div>
            <div className="space-y-4 text-sm text-obsidian-text-primary">
              <div>
                <h3 className="text-obsidian-accent font-medium mb-2">¿Qué es el DTO Lab?</h3>
                <p className="text-xs">El Laboratorio de Gemelo Digital te permite simular escenarios futuros usando la metodología Monte Carlo con 10,000 iteraciones. Visualiza el "Cono de Incertidumbre" para entender los posibles resultados de tus decisiones.</p>
              </div>
              <div>
                <h3 className="text-obsidian-accent font-medium mb-2">Cómo usar</h3>
                <ol className="list-decimal list-inside space-y-1 text-xs">
                  <li>Ajusta los parámetros de simulación (precios, inversión, volatilidad)</li>
                  <li>Activa/desactiva variables externas (competencia, recesión, viral)</li>
                  <li>Haz clic en "EJECUTAR SIMULACIÓN" para ver resultados</li>
                  <li>Analiza la probabilidad de éxito, ROI proyectado y mapa de riesgo</li>
                  <li>Guarda escenarios interesantes para comparar después</li>
                </ol>
              </div>
              <div>
                <h3 className="text-obsidian-accent font-medium mb-2">Interpretar resultados</h3>
                <ul className="list-disc list-inside space-y-1 text-xs">
                  <li><strong>Cono de Incertidumbre:</strong> Muestra el rango de resultados posibles a lo largo del tiempo</li>
                  <li><strong>Probabilidad de Éxito:</strong> Porcentaje de escenarios donde superas el ROI base</li>
                  <li><strong>Mapa de Riesgo:</strong> Visualiza el nivel de riesgo de tu estrategia</li>
                  <li><strong>ROI Proyectado:</strong> Valor esperado promedio de todos los escenarios</li>
                </ul>
              </div>
              <div>
                <h3 className="text-obsidian-accent font-medium mb-2">Presets disponibles</h3>
                <p className="text-xs"><strong>Conservador:</strong> Bajo riesgo, retornos moderados<br/>
                <strong>Moderado:</strong> Balance riesgo/retorno<br/>
                <strong>Agresivo:</strong> Alto riesgo, alto retorno potencial</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Panel de Historial */}
      {showHistoryPanel && (
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center" onClick={() => setShowHistoryPanel(false)}>
          <div className="bg-[#16161A] border border-white/10 rounded-lg p-6 max-w-3xl w-full m-6 max-h-[80vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-light text-white">Historial de Escenarios</h2>
              <button onClick={() => setShowHistoryPanel(false)} className="text-obsidian-text-muted hover:text-white">
                <X size={20} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              {scenarios.length === 0 ? (
                <div className="text-center py-12 text-obsidian-text-muted">
                  <History size={48} className="mx-auto mb-4 opacity-20" />
                  <p>No hay escenarios guardados</p>
                  <p className="text-xs mt-2">Ejecuta una simulación y guárdala para empezar</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {scenarios.map((scenario) => (
                    <div key={scenario.id} className={`border rounded p-4 transition-all ${selectedScenario === scenario.id ? 'border-obsidian-accent bg-obsidian-accent/5' : 'border-white/10 bg-white/[0.02] hover:border-white/20'}`}>
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="text-white font-medium">{scenario.name}</h3>
                          <p className="text-xs text-obsidian-text-muted">{new Date(scenario.createdAt).toLocaleString()}</p>
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => { loadScenario(scenario.id); setShowHistoryPanel(false); }} className="text-xs px-3 py-1 bg-obsidian-accent/20 text-obsidian-accent rounded hover:bg-obsidian-accent/30">
                            Cargar
                          </button>
                          <button onClick={() => deleteScenario(scenario.id)} className="text-xs px-2 py-1 text-red-400 hover:bg-red-500/10 rounded">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-xs">
                        <div>
                          <p className="text-obsidian-text-muted">Probabilidad Éxito</p>
                          <p className="text-white font-mono">{scenario.results.successProbability.toFixed(1)}%</p>
                        </div>
                        <div>
                          <p className="text-obsidian-text-muted">ROI Proyectado</p>
                          <p className="text-white font-mono">{scenario.results.projectedROI.toFixed(1)}%</p>
                        </div>
                        <div>
                          <p className="text-obsidian-text-muted">Nivel de Riesgo</p>
                          <p className="text-white uppercase">{scenario.results.riskLevel.replace('_', ' ')}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Diálogo Guardar Escenario */}
      {showSaveDialog && (
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center" onClick={() => setShowSaveDialog(false)}>
          <div className="bg-[#16161A] border border-white/10 rounded-lg p-6 max-w-md w-full m-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-light text-white">Guardar Escenario</h2>
              <button onClick={() => setShowSaveDialog(false)} className="text-obsidian-text-muted hover:text-white">
                <X size={20} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-xs text-obsidian-text-muted mb-2 block">Nombre del Escenario</label>
                <input
                  type="text"
                  value={scenarioName}
                  onChange={(e) => setScenarioName(e.target.value)}
                  placeholder="Ej: Estrategia agresiva Q1 2025"
                  className="w-full bg-[#0B0B0D] border border-white/10 rounded px-3 py-2 text-sm text-white focus:border-obsidian-accent outline-none"
                  onKeyPress={(e) => e.key === 'Enter' && handleSaveScenario()}
                />
              </div>
              <div className="flex gap-2">
                <ObsidianButton variant="secondary" className="flex-1" onClick={() => setShowSaveDialog(false)}>
                  Cancelar
                </ObsidianButton>
                <ObsidianButton variant="primary" className="flex-1" onClick={handleSaveScenario} disabled={!scenarioName.trim()}>
                  <Save size={14} className="mr-2"/> Guardar
                </ObsidianButton>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DTOLab;