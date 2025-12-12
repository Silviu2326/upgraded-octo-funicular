import React, { useState, useEffect, useRef } from 'react';
import { ObsidianCard, ObsidianSlider, ObsidianSwitch } from './ui/ObsidianElements';
import { Terminal, MoveRight, Sparkles, AlertTriangle, Play } from 'lucide-react';

const DTOLab: React.FC = () => {
  const [isComputing, setIsComputing] = useState(false);
  const [hoverX, setHoverX] = useState<number | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Simulation Parameters (The Levers)
  const [priceImpact, setPriceImpact] = useState(20);
  const [adSpend, setAdSpend] = useState(50);
  const [marketVolatility, setMarketVolatility] = useState(30);
  
  // Environment Switches
  const [envCompetitor, setEnvCompetitor] = useState(false);
  const [envEconomy, setEnvEconomy] = useState(false);
  const [envViral, setEnvViral] = useState(false);

  // Verdict Stats (Computed)
  const [confidence, setConfidence] = useState(94.2);
  const [projectedRoi, setProjectedRoi] = useState(14.5);
  
  // --- Canvas Rendering for "The Cone" ---
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Resize canvas to match display size
    const resizeCanvas = () => {
      const { width, height } = canvas.getBoundingClientRect();
      canvas.width = width * 2; // Retina scaling
      canvas.height = height * 2;
      ctx.scale(2, 2);
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    let animationFrameId: number;
    let time = 0;

    // Generate static paths (The Multiverse) - stored in closure
    const numPaths = 400; // Performance optimization: 400 lines drawing bezier curves looks like thousands with blur
    const paths = Array.from({ length: numPaths }).map(() => ({
      yOffset: (Math.random() - 0.5) * 2, // -1 to 1
      freq: Math.random() * 0.02 + 0.005,
      speed: Math.random() * 0.002 + 0.0005,
      opacity: Math.random() * 0.08 + 0.01
    }));

    const render = () => {
      const { width, height } = canvas.getBoundingClientRect();
      time += 0.5;

      // Clear
      ctx.clearRect(0, 0, width, height);
      
      // Calculate "Spread" based on user inputs
      const volatilityFactor = (marketVolatility / 100) * (height * 0.4);
      const trendY = (height / 2) - ((priceImpact - 20) * 2); // Simple trend logic

      // 1. Draw The Cloud (Monte Carlo)
      ctx.globalCompositeOperation = 'screen'; // Additive blending for "light" feel
      
      paths.forEach(p => {
        ctx.beginPath();
        const startY = height / 2;
        ctx.moveTo(0, startY);

        // Bezier Control Points
        const cp1x = width * 0.3;
        const cp1y = startY + (Math.sin(time * p.speed) * 10);
        const cp2x = width * 0.7;
        // The end point fans out based on volatility
        const endY = trendY + (p.yOffset * volatilityFactor) + (Math.sin(time * p.speed + p.yOffset) * 20);

        ctx.bezierCurveTo(cp1x, cp1y, cp2x, endY, width, endY);
        
        ctx.strokeStyle = '#6A4FFB';
        ctx.lineWidth = 1;
        ctx.globalAlpha = p.opacity; // Very low opacity
        ctx.stroke();
      });

      // 2. Draw Median Line (The most probable future)
      ctx.beginPath();
      ctx.moveTo(0, height / 2);
      ctx.bezierCurveTo(width * 0.3, height/2, width * 0.7, trendY, width, trendY);
      ctx.strokeStyle = '#BEBEC6';
      ctx.lineWidth = 2;
      ctx.globalAlpha = 0.9;
      ctx.globalCompositeOperation = 'source-over';
      ctx.stroke();

      // 3. Draw Zero Point (NOW)
      ctx.beginPath();
      ctx.arc(4, height / 2, 3, 0, Math.PI * 2);
      ctx.fillStyle = '#FFFFFF';
      ctx.fill();
      // Glow
      ctx.beginPath();
      ctx.arc(4, height / 2, 8, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255,255,255,0.3)';
      ctx.fill();

      // 4. Ghost Comparison (If computing or just changed)
      // (Simplified: Drawing a dashed line representing "previous" state)
      if (priceImpact !== 20) {
        ctx.beginPath();
        ctx.moveTo(0, height / 2);
        ctx.bezierCurveTo(width * 0.3, height/2, width * 0.7, height/2, width, height/2);
        ctx.setLineDash([5, 10]);
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 1;
        ctx.globalAlpha = 0.1;
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // 5. "The Slice" (Hover Interaction)
      if (hoverX !== null) {
        ctx.beginPath();
        ctx.moveTo(hoverX, 0);
        ctx.lineTo(hoverX, height);
        ctx.strokeStyle = 'rgba(255,255,255,0.2)';
        ctx.lineWidth = 1;
        ctx.globalAlpha = 1;
        ctx.stroke();

        // Slice Intersection Points (visual flair)
        const t = hoverX / width; // approx t for bezier
        // Note: Exact bezier Y at X is complex math, approximating linear interp for visual demo
        const approxY = (height/2) * (1-t) + trendY * t;
        
        ctx.beginPath();
        ctx.arc(hoverX, approxY, 4, 0, Math.PI * 2);
        ctx.fillStyle = '#45FF9A';
        ctx.fill();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();
    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, [priceImpact, marketVolatility, hoverX]);

  // Logic to simulate "Computing" state when inputs change
  useEffect(() => {
    setIsComputing(true);
    // Scramble numbers
    const timer = setTimeout(() => {
      setIsComputing(false);
      // Update fake stats based on inputs
      setConfidence(90 + (Math.random() * 8) - (marketVolatility / 10));
      setProjectedRoi((priceImpact * 0.5) + (adSpend * 0.1) - (envCompetitor ? 5 : 0));
    }, 800);
    return () => clearTimeout(timer);
  }, [priceImpact, adSpend, marketVolatility, envCompetitor, envEconomy, envViral]);


  // Mouse handler for "The Slice"
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setHoverX(e.clientX - rect.left);
  };

  const handleMouseLeave = () => {
    setHoverX(null);
  };

  return (
    <div className="w-full h-screen bg-[#0B0B0D] text-obsidian-text-primary px-6 py-6 flex gap-6 overflow-hidden relative">
      
      {/* --- PANEL IZQUIERDO: INPUTS (THE LEVERS) --- */}
      <div className="w-[25%] flex flex-col gap-6 animate-[fadeIn_0.5s_ease-out]">
        <ObsidianCard className="flex-1 flex flex-col" active={isComputing}>
          <div className="flex items-center gap-2 mb-6 opacity-60">
            <Terminal size={14} />
            <span className="text-[10px] tracking-[0.2em] font-medium uppercase">Parámetros de Simulación</span>
          </div>

          {/* Natural Language Input */}
          <div className="relative mb-10 group">
             <div className="absolute left-0 top-3 text-obsidian-accent">{'>'}</div>
             <input 
               type="text" 
               className="w-full bg-transparent border-b border-[#333] text-[13px] font-mono py-3 pl-5 focus:outline-none focus:border-white/40 transition-colors text-white placeholder-obsidian-text-muted/40"
               placeholder="Escribe escenario (ej: +20% Precio...)"
             />
             <div className="absolute right-0 top-3 opacity-0 group-hover:opacity-100 transition-opacity">
                <Play size={12} className="text-obsidian-accent" fill="currentColor" />
             </div>
          </div>

          {/* Sliders */}
          <div className="space-y-8 mb-10">
            <ObsidianSlider 
              label="Ajuste de Precios" 
              min={0} max={50} 
              value={priceImpact} 
              onChange={(e) => setPriceImpact(Number(e.target.value))}
              valueDisplay={`+${priceImpact}%`}
            />
            <ObsidianSlider 
              label="Inversión Ads" 
              min={0} max={100} 
              value={adSpend} 
              onChange={(e) => setAdSpend(Number(e.target.value))}
              valueDisplay={`$${adSpend}k`}
            />
            <ObsidianSlider 
              label="Volatilidad Mercado" 
              min={10} max={90} 
              value={marketVolatility} 
              onChange={(e) => setMarketVolatility(Number(e.target.value))}
              valueDisplay={`${marketVolatility}%`}
            />
          </div>

          {/* Switches */}
          <div className="space-y-2 border-t border-white/[0.04] pt-6">
            <p className="text-[10px] uppercase tracking-widest text-obsidian-text-muted mb-2">Variables Externas</p>
            <ObsidianSwitch label="Reacción Competencia" checked={envCompetitor} onChange={setEnvCompetitor} />
            <ObsidianSwitch label="Recesión Económica" checked={envEconomy} onChange={setEnvEconomy} />
            <ObsidianSwitch label="Tendencia Viral" checked={envViral} onChange={setEnvViral} />
          </div>
        </ObsidianCard>
      </div>

      {/* --- PANEL CENTRAL: THE CONE (MULTIVERSE) --- */}
      <div className="w-[55%] flex flex-col animate-[fadeIn_0.5s_ease-out_0.2s_both]">
         <ObsidianCard className="h-full relative overflow-hidden" noPadding active={isComputing}>
            {/* Header Overlay */}
            <div className="absolute top-6 left-6 z-20 pointer-events-none">
               <h2 className="text-white text-lg font-light tracking-wide mb-1">Cono de Incertidumbre</h2>
               <p className="text-[10px] text-obsidian-text-muted uppercase tracking-[0.2em] font-mono">
                  Simulación Monte Carlo: 10,000 Iteraciones
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

               {/* Black Swan Anomaly */}
               <div className="absolute top-[30%] right-[20%] group">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-ping opacity-50"></div>
                  <div className="w-1.5 h-1.5 bg-red-500 rounded-full absolute top-[1px] left-[1px]"></div>
                  
                  {/* Tooltip */}
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-48 bg-[#16161A] border border-red-500/30 p-3 rounded shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none backdrop-blur-md z-50">
                     <div className="flex items-center gap-2 mb-1 text-red-400">
                        <AlertTriangle size={12} />
                        <span className="text-[9px] uppercase font-bold tracking-widest">Alerta Cisne Negro</span>
                     </div>
                     <p className="text-[10px] text-gray-300 leading-tight">
                        0.4% probabilidad de ruptura de stock por crisis en cadena de suministro.
                     </p>
                  </div>
               </div>

               {/* Hover Tooltip (The Slice Info) */}
               {hoverX !== null && (
                 <div 
                   className="absolute top-10 pointer-events-none bg-[#0F0F12]/90 border border-white/10 p-2 rounded backdrop-blur text-xs font-mono z-30"
                   style={{ left: hoverX + 10 }}
                 >
                   <div className="text-obsidian-text-muted mb-1">Día +{Math.floor(hoverX / 5)}</div>
                   <div className="text-obsidian-success">ROI: {(projectedRoi + (Math.random()*2)).toFixed(1)}%</div>
                 </div>
               )}
            </div>
            
            {/* Axis Labels */}
            <div className="absolute bottom-4 left-6 right-6 flex justify-between text-[10px] text-obsidian-text-muted font-light pointer-events-none select-none">
               <span>HOY (T-0)</span>
               <span>T+30 DÍAS</span>
               <span>T+60 DÍAS</span>
               <span>T+90 DÍAS</span>
            </div>
         </ObsidianCard>
      </div>

      {/* --- PANEL DERECHO: EL VEREDICTO --- */}
      <div className="w-[20%] flex flex-col gap-6 animate-[fadeIn_0.5s_ease-out_0.4s_both]">
        {/* Confidence Score */}
        <div className="flex-1 flex flex-col justify-center border-l border-white/[0.06] pl-6">
           <div className="flex items-center gap-2 mb-2">
              <Sparkles size={14} className="text-obsidian-text-muted" />
              <span className="text-[10px] text-obsidian-text-muted uppercase tracking-widest">Probabilidad Éxito</span>
           </div>
           <div className="text-[72px] leading-[0.9] font-thin text-white tracking-[-2px] tabular-nums bg-gradient-to-b from-white to-white/50 bg-clip-text text-transparent">
             {confidence.toFixed(1)}%
           </div>
           <div className="mt-4 text-[9px] font-mono text-[#444444]">
             ID SIMULACIÓN: <span className="text-obsidian-text-muted">DTO-{Math.floor(Math.random() * 9999)}</span>
           </div>
        </div>

        {/* Risk Map */}
        <div className="h-1/3 border-l border-white/[0.06] pl-6 flex flex-col">
           <span className="text-[10px] text-obsidian-text-muted uppercase tracking-widest mb-4">Mapa de Riesgo</span>
           <div className="flex-1 w-2 bg-gradient-to-t from-gray-800 via-gray-700 to-red-500/40 rounded-full relative">
              {/* Marker */}
              <div 
                className="absolute w-4 h-[2px] bg-white shadow-[0_0_8px_white] left-[-4px] transition-all duration-700"
                style={{ bottom: `${100 - confidence}%` }} // Inverse of confidence roughly maps to risk here
              />
           </div>
        </div>

        {/* ROI Proyectado */}
        <div className="h-1/4 border-l border-white/[0.06] pl-6 flex flex-col justify-end pb-4">
           <span className="text-[10px] text-obsidian-text-muted uppercase tracking-widest mb-1">ROI Proyectado</span>
           <div className="flex items-baseline gap-3">
              <span className="text-3xl font-thin text-obsidian-success tabular-nums">+{projectedRoi.toFixed(1)}%</span>
              <span className="text-sm text-obsidian-text-muted line-through decoration-white/20">12.0%</span>
           </div>
           <div className="flex items-center gap-1 mt-1 text-[10px] text-obsidian-text-muted">
              <MoveRight size={10} />
              <span>vs. Modelo Base</span>
           </div>
        </div>
      </div>
    </div>
  );
};

export default DTOLab;