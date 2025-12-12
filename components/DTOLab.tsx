import React, { useState, useEffect, useRef } from 'react';
import { ObsidianCard, ObsidianSlider, ObsidianSwitch } from './ui/ObsidianElements';
import { Terminal, MoveRight, Sparkles, AlertTriangle, Play, TrendingUp, BarChart3, Activity, Layers } from 'lucide-react';
import { useDTOLab } from '../hooks/useDTOLab';
import { DistributionChart } from './DTOLab/DistributionChart';
import { SensitivityAnalysis } from './DTOLab/SensitivityAnalysis';
import { ScenarioManager } from './DTOLab/ScenarioManager';

const DTOLab: React.FC = () => {
  const {
    params,
    results,
    scenarios,
    isComputing,
    selectedScenario,
    updateParam,
    saveScenario,
    loadScenario,
    deleteScenario,
    loadPreset
  } = useDTOLab();

  const [hoverX, setHoverX] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<'results' | 'distribution' | 'sensitivity' | 'scenarios'>('results');
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

    // Usar las trayectorias reales de la simulación
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
      const scale = height / 100; // Escala para convertir ROI a pixeles

      // Dibujar las trayectorias
      ctx.globalCompositeOperation = 'screen';

      paths.forEach((p, idx) => {
        if (idx > 100) return; // Dibujar solo 100 para rendimiento

        ctx.beginPath();
        ctx.moveTo(0, baseY);

        const path = p.path;
        const segmentWidth = width / (path.length - 1);

        for (let i = 0; i < path.length; i++) {
          const x = i * segmentWidth;
          const roi = path[i] - results.baselineROI;
          const y = baseY - (roi * scale);

          if (i === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }

        ctx.strokeStyle = '#6A4FFB';
        ctx.lineWidth = 0.5;
        ctx.globalAlpha = p.opacity;
        ctx.stroke();
      });

      // Dibujar línea mediana
      ctx.globalCompositeOperation = 'source-over';
      ctx.beginPath();
      ctx.moveTo(0, baseY);

      const median = results.trajectories.median;
      const segmentWidth = width / (median.length - 1);

      for (let i = 0; i < median.length; i++) {
        const x = i * segmentWidth;
        const roi = median[i] - results.baselineROI;
        const y = baseY - (roi * scale);

        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }

      ctx.strokeStyle = '#BEBEC6';
      ctx.lineWidth = 2;
      ctx.globalAlpha = 0.9;
      ctx.stroke();

      // Dibujar punto inicial
      ctx.beginPath();
      ctx.arc(4, baseY, 3, 0, Math.PI * 2);
      ctx.fillStyle = '#FFFFFF';
      ctx.fill();
      ctx.beginPath();
      ctx.arc(4, baseY, 8, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255,255,255,0.3)';
      ctx.fill();

      // Línea de referencia (baseline)
      ctx.beginPath();
      ctx.moveTo(0, baseY);
      ctx.lineTo(width, baseY);
      ctx.setLineDash([5, 10]);
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 1;
      ctx.globalAlpha = 0.1;
      ctx.stroke();
      ctx.setLineDash([]);

      // Hover interaction
      if (hoverX !== null) {
        ctx.beginPath();
        ctx.moveTo(hoverX, 0);
        ctx.lineTo(hoverX, height);
        ctx.strokeStyle = 'rgba(255,255,255,0.2)';
        ctx.lineWidth = 1;
        ctx.globalAlpha = 1;
        ctx.stroke();

        const segmentIndex = Math.floor((hoverX / width) * (median.length - 1));
        if (segmentIndex < median.length) {
          const roi = median[segmentIndex] - results.baselineROI;
          const y = baseY - (roi * scale);

          ctx.beginPath();
          ctx.arc(hoverX, y, 4, 0, Math.PI * 2);
          ctx.fillStyle = '#45FF9A';
          ctx.fill();
        }
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

  const handleMouseLeave = () => {
    setHoverX(null);
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

  return (
    <div className="w-full h-screen bg-[#0B0B0D] text-obsidian-text-primary px-6 py-6 flex gap-6 overflow-hidden relative">

      {/* INDICADOR DE DATOS SIMULADOS */}
      <div className="absolute top-2 right-2 z-50 px-3 py-1 bg-yellow-500/10 border border-yellow-500/30 rounded text-yellow-400 text-[9px] uppercase tracking-wider font-mono">
        ⚠️ Simulación con Datos Falsos
      </div>

      {/* --- PANEL IZQUIERDO: INPUTS (THE LEVERS) --- */}
      <div className="w-[25%] flex flex-col gap-6 animate-[fadeIn_0.5s_ease-out]">
        <ObsidianCard className="flex-1 flex flex-col overflow-y-auto" active={isComputing}>
          <div className="flex items-center gap-2 mb-6 opacity-60">
            <Terminal size={14} />
            <span className="text-[10px] tracking-[0.2em] font-medium uppercase">Parámetros de Simulación</span>
          </div>

          {/* Presets */}
          <div className="mb-6">
            <p className="text-[9px] uppercase tracking-widest text-obsidian-text-muted mb-2">Plantillas</p>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => loadPreset('conservative')}
                className="px-2 py-1.5 border border-blue-400/30 text-blue-400 text-[9px] uppercase tracking-wider hover:bg-blue-400/10 transition-colors rounded"
              >
                Conservador
              </button>
              <button
                onClick={() => loadPreset('moderate')}
                className="px-2 py-1.5 border border-obsidian-accent/30 text-obsidian-accent text-[9px] uppercase tracking-wider hover:bg-obsidian-accent/10 transition-colors rounded"
              >
                Moderado
              </button>
              <button
                onClick={() => loadPreset('aggressive')}
                className="px-2 py-1.5 border border-red-400/30 text-red-400 text-[9px] uppercase tracking-wider hover:bg-red-400/10 transition-colors rounded"
              >
                Agresivo
              </button>
            </div>
          </div>

          {/* Sliders */}
          <div className="space-y-8 mb-10">
            <ObsidianSlider
              label="Ajuste de Precios"
              min={-50}
              max={50}
              value={params.priceAdjustment}
              onChange={(e) => updateParam('priceAdjustment', Number(e.target.value))}
              valueDisplay={`${params.priceAdjustment >= 0 ? '+' : ''}${params.priceAdjustment}%`}
            />
            <ObsidianSlider
              label="Inversión Marketing"
              min={0}
              max={100}
              value={params.marketingInvestment}
              onChange={(e) => updateParam('marketingInvestment', Number(e.target.value))}
              valueDisplay={`$${params.marketingInvestment}k`}
            />
            <ObsidianSlider
              label="Volatilidad Mercado"
              min={10}
              max={90}
              value={params.marketVolatility}
              onChange={(e) => updateParam('marketVolatility', Number(e.target.value))}
              valueDisplay={`${params.marketVolatility}%`}
            />
            <ObsidianSlider
              label="Horizonte Temporal"
              min={30}
              max={365}
              value={params.timeHorizon}
              onChange={(e) => updateParam('timeHorizon', Number(e.target.value))}
              valueDisplay={`${params.timeHorizon} días`}
            />
          </div>

          {/* Switches */}
          <div className="space-y-2 border-t border-white/[0.04] pt-6">
            <p className="text-[10px] uppercase tracking-widest text-obsidian-text-muted mb-2">Variables Externas</p>
            <ObsidianSwitch
              label="Reacción Competencia"
              checked={params.competitorReaction}
              onChange={(val) => updateParam('competitorReaction', val)}
            />
            <ObsidianSwitch
              label="Recesión Económica"
              checked={params.economicRecession}
              onChange={(val) => updateParam('economicRecession', val)}
            />
            <ObsidianSwitch
              label="Tendencia Viral"
              checked={params.viralTrend}
              onChange={(val) => updateParam('viralTrend', val)}
            />
            <ObsidianSwitch
              label="Cambio Regulatorio"
              checked={params.regulatoryChange}
              onChange={(val) => updateParam('regulatoryChange', val)}
            />
          </div>
        </ObsidianCard>
      </div>

      {/* --- PANEL CENTRAL: THE CONE (MULTIVERSE) --- */}
      <div className="w-[50%] flex flex-col animate-[fadeIn_0.5s_ease-out_0.2s_both]">
         <ObsidianCard className="h-full relative overflow-hidden" noPadding active={isComputing}>
            {/* Header Overlay */}
            <div className="absolute top-6 left-6 z-20 pointer-events-none">
               <h2 className="text-white text-lg font-light tracking-wide mb-1">Cono de Incertidumbre</h2>
               <p className="text-[10px] text-obsidian-text-muted uppercase tracking-[0.2em] font-mono">
                  Simulación Monte Carlo: 10,000 Iteraciones (Datos Falsos)
               </p>
            </div>

            {/* The Graph */}
            <div
              className="w-full h-full cursor-crosshair relative"
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
            >
               <canvas ref={canvasRef} className="w-full h-full block" />

               {/* Scanline Effect (Computing State) */}
               {isComputing && (
                 <div className="absolute inset-0 bg-gradient-to-r from-transparent via-obsidian-accent/10 to-transparent w-[20%] h-full animate-[scan_1s_ease-in-out_infinite]" />
               )}

               {/* Hover Tooltip */}
               {hoverX !== null && results && (
                 <div
                   className="absolute top-10 pointer-events-none bg-[#0F0F12]/90 border border-white/10 p-2 rounded backdrop-blur text-xs font-mono z-30"
                   style={{ left: hoverX + 10 }}
                 >
                   <div className="text-obsidian-text-muted mb-1">
                     Día +{Math.floor((hoverX / canvasRef.current!.getBoundingClientRect().width) * params.timeHorizon)}
                   </div>
                   <div className="text-obsidian-success">
                     ROI: {((hoverX / canvasRef.current!.getBoundingClientRect().width) * results.projectedROI).toFixed(1)}%
                   </div>
                 </div>
               )}
            </div>

            {/* Axis Labels */}
            <div className="absolute bottom-4 left-6 right-6 flex justify-between text-[10px] text-obsidian-text-muted font-light pointer-events-none select-none">
               <span>HOY (T-0)</span>
               <span>T+{Math.floor(params.timeHorizon * 0.33)} DÍAS</span>
               <span>T+{Math.floor(params.timeHorizon * 0.67)} DÍAS</span>
               <span>T+{params.timeHorizon} DÍAS</span>
            </div>
         </ObsidianCard>
      </div>

      {/* --- PANEL DERECHO: RESULTADOS Y ANÁLISIS --- */}
      <div className="w-[25%] flex flex-col gap-6 animate-[fadeIn_0.5s_ease-out_0.4s_both]">
        {/* Tabs */}
        <div className="flex gap-1 border-b border-white/10 pb-2">
          <button
            onClick={() => setActiveTab('results')}
            className={`flex items-center gap-1 px-2 py-1 text-[9px] uppercase tracking-wider transition-colors ${
              activeTab === 'results' ? 'text-obsidian-accent border-b-2 border-obsidian-accent' : 'text-obsidian-text-muted hover:text-white'
            }`}
          >
            <TrendingUp size={10} />
            Resultados
          </button>
          <button
            onClick={() => setActiveTab('distribution')}
            className={`flex items-center gap-1 px-2 py-1 text-[9px] uppercase tracking-wider transition-colors ${
              activeTab === 'distribution' ? 'text-obsidian-accent border-b-2 border-obsidian-accent' : 'text-obsidian-text-muted hover:text-white'
            }`}
          >
            <BarChart3 size={10} />
            Distribución
          </button>
          <button
            onClick={() => setActiveTab('sensitivity')}
            className={`flex items-center gap-1 px-2 py-1 text-[9px] uppercase tracking-wider transition-colors ${
              activeTab === 'sensitivity' ? 'text-obsidian-accent border-b-2 border-obsidian-accent' : 'text-obsidian-text-muted hover:text-white'
            }`}
          >
            <Activity size={10} />
            Sensibilidad
          </button>
          <button
            onClick={() => setActiveTab('scenarios')}
            className={`flex items-center gap-1 px-2 py-1 text-[9px] uppercase tracking-wider transition-colors relative ${
              activeTab === 'scenarios' ? 'text-obsidian-accent border-b-2 border-obsidian-accent' : 'text-obsidian-text-muted hover:text-white'
            }`}
          >
            <Layers size={10} />
            Escenarios
            {scenarios.length > 0 && (
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-obsidian-accent rounded-full text-[7px] flex items-center justify-center text-black">
                {scenarios.length}
              </span>
            )}
          </button>
        </div>

        {/* Content based on active tab */}
        <div className="flex-1 overflow-hidden">
          {activeTab === 'results' && (
            <div className="h-full flex flex-col gap-6">
              {/* Confidence Score */}
              <div className="flex-1 flex flex-col justify-center border-l border-white/[0.06] pl-6">
                 <div className="flex items-center gap-2 mb-2">
                    <Sparkles size={14} className="text-obsidian-text-muted" />
                    <span className="text-[10px] text-obsidian-text-muted uppercase tracking-widest">Probabilidad Éxito</span>
                 </div>
                 <div className="text-[72px] leading-[0.9] font-thin text-white tracking-[-2px] tabular-nums bg-gradient-to-b from-white to-white/50 bg-clip-text text-transparent">
                   {results?.successProbability.toFixed(1) || '0.0'}%
                 </div>
                 <div className="mt-4 text-[9px] font-mono text-[#444444]">
                   ID SIMULACIÓN: <span className="text-obsidian-text-muted">FAKE-{selectedScenario ? selectedScenario.slice(-3) : Math.floor(Math.random() * 9999)}</span>
                 </div>
              </div>

              {/* Risk Map */}
              <div className="h-1/3 border-l border-white/[0.06] pl-6 flex flex-col">
                 <span className="text-[10px] text-obsidian-text-muted uppercase tracking-widest mb-4">Mapa de Riesgo</span>
                 <div className="flex items-center gap-4">
                   <div className="flex-1 h-2 bg-gradient-to-r from-obsidian-success via-yellow-400 to-red-500 rounded-full relative">
                      <div
                        className="absolute w-4 h-[2px] bg-white shadow-[0_0_8px_white] top-1/2 -translate-y-1/2 transition-all duration-700"
                        style={{ left: `${results?.riskScore || 0}%` }}
                      />
                   </div>
                   <div className="text-xs" style={{ color: getRiskColor(results?.riskLevel || 'medium') }}>
                     {results?.riskLevel.replace('_', ' ').toUpperCase()}
                   </div>
                 </div>
                 <div className="mt-2 text-[9px] text-obsidian-text-muted">
                   Probabilidad de pérdida: <span className="text-red-400">{results?.lossRisk.toFixed(1)}%</span>
                 </div>
              </div>

              {/* ROI Proyectado */}
              <div className="h-1/4 border-l border-white/[0.06] pl-6 flex flex-col justify-end pb-4">
                 <span className="text-[10px] text-obsidian-text-muted uppercase tracking-widest mb-1">ROI Proyectado</span>
                 <div className="flex items-baseline gap-3">
                    <span className={`text-3xl font-thin tabular-nums ${(results?.projectedROI || 0) >= 0 ? 'text-obsidian-success' : 'text-red-400'}`}>
                      {(results?.projectedROI || 0) >= 0 ? '+' : ''}{results?.projectedROI.toFixed(1) || '0.0'}%
                    </span>
                    <span className="text-sm text-obsidian-text-muted line-through decoration-white/20">
                      {results?.baselineROI.toFixed(1)}%
                    </span>
                 </div>
                 <div className="flex items-center gap-1 mt-1 text-[10px] text-obsidian-text-muted">
                    <MoveRight size={10} />
                    <span>vs. Modelo Base</span>
                 </div>
              </div>
            </div>
          )}

          {activeTab === 'distribution' && (
            <ObsidianCard className="h-full" noPadding>
              <DistributionChart results={results} />
            </ObsidianCard>
          )}

          {activeTab === 'sensitivity' && (
            <ObsidianCard className="h-full" noPadding>
              <SensitivityAnalysis results={results} />
            </ObsidianCard>
          )}

          {activeTab === 'scenarios' && (
            <ObsidianCard className="h-full p-4" noPadding>
              <ScenarioManager
                scenarios={scenarios}
                selectedScenario={selectedScenario}
                onSave={saveScenario}
                onLoad={loadScenario}
                onDelete={deleteScenario}
              />
            </ObsidianCard>
          )}
        </div>
      </div>
    </div>
  );
};

export default DTOLab;
