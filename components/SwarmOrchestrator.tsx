import React, { useState, useEffect, useRef } from 'react';
import { ObsidianCard, ObsidianButton, ObsidianSlider, ObsidianSwitch } from './ui/ObsidianElements';
import { Search, Mic, ArrowLeftRight, Play, Activity, AlertCircle, Radio } from 'lucide-react';

// --- Types ---
type SwarmType = 'research' | 'sentiment' | 'negotiation';

interface SwarmConfig {
  id: SwarmType;
  name: string;
  desc: string;
  icon: React.ReactNode;
}

const SWARMS: SwarmConfig[] = [
  { id: 'research', name: 'Research Extremo', desc: 'Escanea 500 fuentes, simula 50 embudos.', icon: <Search size={18} /> },
  { id: 'sentiment', name: 'Análisis de Sentimiento', desc: 'Procesamiento NLP en tiempo real de RRSS.', icon: <Mic size={18} /> },
  { id: 'negotiation', name: 'Negociación B2B', desc: 'Agentes autónomos para cierre de tratos.', icon: <ArrowLeftRight size={18} /> },
];

const SwarmOrchestrator: React.FC = () => {
  const [activeSwarm, setActiveSwarm] = useState<SwarmType | null>('research');
  const [status, setStatus] = useState<'IDLE' | 'DEPLOYING' | 'OPERATIONAL'>('OPERATIONAL');
  const [progress, setProgress] = useState(45);
  const [agentCount, setAgentCount] = useState(250);
  const [alertsEnabled, setAlertsEnabled] = useState(true);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // --- Animation Logic (The Hive) ---
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
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

    // Particle System Setup
    const particles: { x: number; y: number; tx: number; ty: number; speed: number; phase: number }[] = [];
    const numParticles = 300; // Visual density
    
    // Initialize Particles
    for(let i=0; i<numParticles; i++) {
        particles.push({
            x: canvas.width / 4, // Start at center (approx)
            y: canvas.height / 4,
            tx: Math.random() * (canvas.width / 2),
            ty: Math.random() * (canvas.height / 2),
            speed: Math.random() * 2 + 0.5,
            phase: Math.random() * Math.PI * 2
        });
    }

    let time = 0;
    let animationId: number;

    const render = () => {
        time += 0.05;
        const width = canvas.width / 2; // logical width
        const height = canvas.height / 2; // logical height
        
        ctx.clearRect(0, 0, width, height);
        
        // 1. Draw Target Zones (Dynamic based on swarm type)
        ctx.strokeStyle = '#45FF9A';
        ctx.lineWidth = 1;
        ctx.fillStyle = 'rgba(69, 255, 154, 0.02)';
        
        // Example zones logic
        const zones = [];
        if (activeSwarm === 'research') {
            zones.push({ x: width * 0.2, y: height * 0.2, r: 60 });
            zones.push({ x: width * 0.8, y: height * 0.3, r: 80 });
            zones.push({ x: width * 0.5, y: height * 0.8, r: 70 });
        } else if (activeSwarm === 'sentiment') {
             zones.push({ x: width * 0.5, y: height * 0.5, r: 120 });
        } else {
             zones.push({ x: width * 0.2, y: height * 0.5, r: 50 });
             zones.push({ x: width * 0.8, y: height * 0.5, r: 50 });
        }

        zones.forEach(z => {
            ctx.beginPath();
            ctx.arc(z.x, z.y, z.r, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
            // Zone Pulse
            ctx.beginPath();
            ctx.arc(z.x, z.y, z.r + Math.sin(time) * 5, 0, Math.PI * 2);
            ctx.strokeStyle = 'rgba(69, 255, 154, 0.1)';
            ctx.stroke();
        });

        // 2. Draw The Core (Pulsing Center)
        const centerX = width / 2;
        const centerY = height / 2;
        
        // Energy Pulse
        const pulseSize = 20 + Math.sin(time * 2) * 5;
        const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, pulseSize * 2);
        gradient.addColorStop(0, 'rgba(106, 79, 251, 0.8)');
        gradient.addColorStop(1, 'rgba(106, 79, 251, 0)');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(centerX, centerY, pulseSize * 2, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#6A4FFB';
        ctx.beginPath();
        ctx.arc(centerX, centerY, 6, 0, Math.PI * 2);
        ctx.fill();

        // 3. Update & Draw Particles (Micro-Agents)
        ctx.globalCompositeOperation = 'screen';
        
        particles.forEach(p => {
            // Logic: Move towards a random zone or return to center
            const currentZone = zones[Math.floor(Math.abs(Math.sin(p.phase)) * zones.length)];
            
            if (currentZone) {
                // Move towards zone
                const dx = currentZone.x + Math.cos(time + p.phase)*currentZone.r*0.8 - p.x;
                const dy = currentZone.y + Math.sin(time + p.phase)*currentZone.r*0.8 - p.y;
                const dist = Math.sqrt(dx*dx + dy*dy);
                
                if (dist > 5) {
                    p.x += (dx / dist) * p.speed;
                    p.y += (dy / dist) * p.speed;
                } else {
                   // Jitter inside zone
                   p.x += (Math.random() - 0.5) * 2;
                   p.y += (Math.random() - 0.5) * 2;
                }
            } else {
                // Idle orbit
                p.x = centerX + Math.cos(time * 0.5 + p.phase) * 100;
                p.y = centerY + Math.sin(time * 0.5 + p.phase) * 100;
            }

            // Draw Trail
            ctx.beginPath();
            ctx.moveTo(p.x - (Math.cos(time)*5), p.y - (Math.sin(time)*5));
            ctx.lineTo(p.x, p.y);
            ctx.strokeStyle = 'rgba(106, 79, 251, 0.2)';
            ctx.lineWidth = 1;
            ctx.stroke();

            // Draw Head
            ctx.fillStyle = activeSwarm ? '#6A4FFB' : '#BEBEC6';
            if (Math.random() > 0.95) ctx.fillStyle = '#45FF9A'; // Data packet flash
            
            ctx.fillRect(p.x, p.y, 1.5, 1.5);
        });
        
        ctx.globalCompositeOperation = 'source-over';

        // 4. "Barrido" Effect (Scanline)
        const scanY = (time * 50) % (height + 100) - 50;
        ctx.fillStyle = 'rgba(245, 245, 247, 0.03)';
        ctx.fillRect(0, scanY, width, 2);

        animationId = requestAnimationFrame(render);
    };

    render();
    return () => {
        window.removeEventListener('resize', resizeCanvas);
        cancelAnimationFrame(animationId);
    };
  }, [activeSwarm]);

  // Simulación de progreso
  useEffect(() => {
     if(status === 'OPERATIONAL') {
         const interval = setInterval(() => {
             setProgress(prev => prev >= 100 ? 0 : prev + 0.5);
         }, 200);
         return () => clearInterval(interval);
     }
  }, [status]);

  const handleDeploy = (id: SwarmType) => {
      setActiveSwarm(id);
      setStatus('DEPLOYING');
      setProgress(0);
      setTimeout(() => setStatus('OPERATIONAL'), 2000);
  };

  return (
    <div className="w-full h-screen bg-[#0B0B0D] text-obsidian-text-primary px-6 py-6 flex flex-col overflow-hidden relative font-sans">
      
      {/* --- SECCIÓN SUPERIOR: MISIÓN ACTIVA --- */}
      <div className="h-[15%] mb-6 animate-[fadeIn_0.5s_ease-out]">
         <ObsidianCard className="h-full flex flex-col justify-center relative overflow-visible">
            <div className="flex justify-between items-center mb-4 relative z-10">
                <div>
                    <h2 className="text-lg font-light text-[#F5F5F7] tracking-wide flex items-center gap-3">
                        Misión Activa: {SWARMS.find(s => s.id === activeSwarm)?.name || 'Sin Asignar'}
                        <span className="text-[10px] text-obsidian-text-muted font-mono tracking-normal opacity-60">[ID: MX-{Math.floor(Math.random()*1000)}]</span>
                    </h2>
                </div>
                <div className="flex items-center gap-4">
                     <div className={`px-3 py-1 rounded-full text-[10px] font-medium tracking-widest uppercase flex items-center gap-2 border ${status === 'OPERATIONAL' ? 'border-[#45FF9A]/30 bg-[#45FF9A]/10 text-[#45FF9A]' : 'border-[#6A4FFB]/30 bg-[#6A4FFB]/10 text-[#6A4FFB]'}`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${status === 'OPERATIONAL' ? 'bg-[#45FF9A] animate-pulse' : 'bg-[#6A4FFB] animate-bounce'}`}></div>
                        {status}
                     </div>
                     <div className="text-right">
                         <span className="text-2xl font-thin text-white">{progress.toFixed(0)}%</span>
                     </div>
                </div>
            </div>
            
            {/* Barra de Progreso Fina */}
            <div className="w-full h-[1px] bg-white/[0.05] relative">
                <div 
                    className="absolute left-0 top-0 h-full bg-[#6A4FFB] shadow-[0_0_10px_#6A4FFB] transition-all duration-300 ease-linear"
                    style={{ width: `${progress}%` }}
                ></div>
            </div>
         </ObsidianCard>
      </div>

      {/* --- CUERPO PRINCIPAL --- */}
      <div className="flex-1 flex gap-6 min-h-0">
          
          {/* --- COLUMNA IZQUIERDA: CATÁLOGO DE ENJAMBRES (ARMORY) --- */}
          <div className="w-[25%] flex flex-col gap-4 overflow-y-auto pr-1 animate-[fadeIn_0.6s_ease-out_0.2s_both]">
             <div className="flex items-center gap-2 mb-2 px-1">
                 <Radio size={14} className="text-obsidian-text-muted" />
                 <span className="text-[10px] text-obsidian-text-muted uppercase tracking-[0.2em] font-medium">Catálogo de Enjambres</span>
             </div>
             
             {SWARMS.map((swarm) => (
                 <button
                    key={swarm.id}
                    onClick={() => handleDeploy(swarm.id)}
                    className={`
                        w-full text-left p-5 rounded-lg border transition-all duration-300 group relative overflow-hidden
                        ${activeSwarm === swarm.id 
                            ? 'bg-white/[0.04] border-obsidian-accent/50 shadow-[inset_0_0_20px_rgba(106,79,251,0.1)]' 
                            : 'bg-[#0F0F12]/60 border-white/[0.04] hover:bg-white/[0.02] hover:border-white/[0.1]'}
                    `}
                 >
                    <div className="flex justify-between items-start mb-2">
                        <div className={`p-2 rounded-md ${activeSwarm === swarm.id ? 'bg-obsidian-accent text-white' : 'bg-white/[0.05] text-obsidian-text-muted group-hover:text-white'}`}>
                            {swarm.icon}
                        </div>
                        {activeSwarm === swarm.id && <div className="w-1.5 h-1.5 rounded-full bg-obsidian-accent shadow-[0_0_5px_#6A4FFB]"></div>}
                    </div>
                    <h3 className="text-[13px] text-[#F5F5F7] font-normal mb-1 tracking-wide">{swarm.name}</h3>
                    <p className="text-[10px] text-[#8C8C97] leading-relaxed line-clamp-2">{swarm.desc}</p>
                    
                    {/* Hover Action */}
                    <div className={`absolute bottom-4 right-4 opacity-0 transform translate-x-2 transition-all duration-300 ${activeSwarm !== swarm.id && 'group-hover:opacity-100 group-hover:translate-x-0'}`}>
                        <Play size={12} className="text-white" fill="currentColor" />
                    </div>
                 </button>
             ))}
          </div>

          {/* --- ÁREA CENTRAL: CAMPO DE DESPLIEGUE (THE HIVE) --- */}
          <div className="w-[55%] flex flex-col relative animate-[fadeIn_0.8s_ease-out_0.4s_both]">
              <ObsidianCard className="flex-1 relative overflow-hidden flex flex-col" noPadding>
                  {/* Overlay Data Labels */}
                  <div className="absolute top-4 left-4 z-10 pointer-events-none">
                      <div className="flex items-center gap-2 mb-1">
                          <Activity size={14} className="text-obsidian-text-muted" />
                          <span className="text-[10px] text-obsidian-text-muted uppercase tracking-widest">Visualización en Vivo</span>
                      </div>
                  </div>
                  
                  {/* Dynamic Tooltips (Simulated) */}
                  <div className="absolute top-[30%] left-[20%] z-10 pointer-events-none animate-pulse">
                      <div className="bg-[#0F0F12]/80 backdrop-blur border border-white/[0.1] px-2 py-1 rounded text-[9px] font-mono text-[#BEBEC6]">
                          234 DATA POINTS
                      </div>
                  </div>
                   <div className="absolute bottom-[40%] right-[25%] z-10 pointer-events-none animate-pulse delay-700">
                      <div className="bg-[#0F0F12]/80 backdrop-blur border border-[#45FF9A]/30 px-2 py-1 rounded text-[9px] font-mono text-[#45FF9A]">
                          SENTIMENT: +78%
                      </div>
                  </div>

                  {/* Canvas Layer */}
                  <canvas ref={canvasRef} className="w-full h-full block cursor-crosshair" />
              </ObsidianCard>
          </div>

          {/* --- COLUMNA DERECHA: CONTROL TÁCTICO (THE FINER GRAIN) --- */}
          <div className="w-[20%] flex flex-col gap-6 animate-[fadeIn_0.6s_ease-out_0.6s_both]">
             <ObsidianCard className="h-[40%] flex flex-col">
                 <div className="flex items-center gap-2 mb-4">
                     <Activity size={14} className="text-obsidian-text-muted" />
                     <span className="text-[10px] text-obsidian-text-muted uppercase tracking-[0.2em] font-medium">Carga de Trabajo</span>
                 </div>
                 {/* CSS Only Mini Chart */}
                 <div className="flex-1 flex items-end gap-1 opacity-80">
                     {[30, 45, 35, 60, 50, 75, 65, 80, 55, 70, 90, 85].map((h, i) => (
                         <div 
                            key={i} 
                            style={{ height: `${h}%` }} 
                            className="flex-1 bg-gradient-to-t from-obsidian-accent/20 to-obsidian-accent rounded-t-[1px]"
                         ></div>
                     ))}
                 </div>
                 <div className="mt-2 text-right">
                     <span className="text-xl font-thin text-white">4.2 TB</span>
                     <span className="text-[9px] text-obsidian-text-muted ml-2">PROCESADOS</span>
                 </div>
             </ObsidianCard>

             <ObsidianCard className="flex-1 flex flex-col gap-6">
                 <div>
                     <span className="text-[10px] text-obsidian-text-muted uppercase tracking-[0.2em] font-medium block mb-4">Configuración Agentes</span>
                     <ObsidianSlider 
                        label="Max. Agentes" 
                        min={50} max={1000} 
                        value={agentCount} 
                        onChange={(e) => setAgentCount(Number(e.target.value))} 
                        valueDisplay={agentCount}
                     />
                 </div>
                 
                 <div>
                     <span className="text-[10px] text-obsidian-text-muted uppercase tracking-[0.2em] font-medium block mb-4">Prioridad Objetivo</span>
                     <div className="flex gap-2">
                         {['Velocidad', 'Precisión'].map(p => (
                             <button key={p} className="flex-1 py-2 border border-white/[0.1] rounded text-[10px] uppercase text-white hover:bg-white/[0.05] transition-colors focus:border-obsidian-accent focus:text-obsidian-accent">
                                 {p}
                             </button>
                         ))}
                     </div>
                 </div>

                 <div className="mt-auto border-t border-white/[0.04] pt-4">
                     <ObsidianSwitch label="Alertas Críticas" checked={alertsEnabled} onChange={setAlertsEnabled} />
                     <div className="mt-4 p-2 bg-[#45FF9A]/5 border border-[#45FF9A]/10 rounded flex gap-2 items-start">
                         <div className="w-1 h-1 rounded-full bg-[#45FF9A] mt-1.5 shadow-[0_0_5px_#45FF9A]"></div>
                         <div>
                             <p className="text-[10px] text-[#45FF9A] font-medium leading-tight mb-0.5">Competitor Price Delta</p>
                             <p className="text-[9px] text-[#45FF9A]/70 font-mono">-3.4%</p>
                         </div>
                     </div>
                 </div>
             </ObsidianCard>
          </div>

      </div>
    </div>
  );
};

export default SwarmOrchestrator;