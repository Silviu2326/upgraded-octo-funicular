import React, { useState, useEffect, useRef } from 'react';
import { ObsidianCard, ObsidianButton, ObsidianSlider, ObsidianInput } from './ui/ObsidianElements';
import { Camera, Mic, Play, Box, Layers, User, Wand2, RefreshCw, PenTool } from 'lucide-react';

const AvatarStudio: React.FC = () => {
  const [personality, setPersonality] = useState('Formal Executive');
  const [voicePitch, setVoicePitch] = useState(50);
  const [renderProgress, setRenderProgress] = useState(0);
  const [isRendering, setIsRendering] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // --- Volumetric Hologram Animation ---
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

    // 3D Points Generation (Simplified Head/Bust Wireframe)
    const points: {x: number, y: number, z: number}[] = [];
    const layers = 15;
    for (let i = 0; i < layers; i++) {
        const y = -1 + (i / (layers - 1)) * 2;
        const radius = Math.sqrt(1 - y * y); // Sphere equation approx
        const segments = 12;
        for (let j = 0; j < segments; j++) {
            const angle = (j / segments) * Math.PI * 2;
            points.push({
                x: Math.cos(angle) * radius * 0.6,
                y: y * 0.8 - 0.2, // Offset Y
                z: Math.sin(angle) * radius * 0.6
            });
        }
    }
    // Shoulders
    for(let i=0; i<20; i++) {
        const angle = (i/20) * Math.PI;
        points.push({
            x: Math.cos(angle) * 1.2,
            y: 1.2,
            z: Math.sin(angle) * 0.5
        });
    }

    let time = 0;
    let animationId: number;

    const render = () => {
      const { width, height } = canvas.getBoundingClientRect();
      time += 0.01;
      
      ctx.clearRect(0, 0, width, height);

      const cx = width / 2;
      const cy = height / 2;
      const fov = 300;

      // 1. Draw Floor Grid
      ctx.strokeStyle = 'rgba(255,255,255,0.05)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      for(let i=-5; i<=5; i++) {
          // Perspective projection for floor
          // Simplified horizontal lines
          const z = i * 50 + (time * 20) % 50;
          // Not true 3D floor, just aesthetic lines
          const y = cy + 150 + i * 10;
          ctx.moveTo(cx - 200, y);
          ctx.lineTo(cx + 200, y);
      }
      ctx.stroke();

      // 2. Render Avatar Points (Rotation)
      points.forEach(p => {
          // Rotate Y
          const rx = p.x * Math.cos(time) - p.z * Math.sin(time);
          const rz = p.x * Math.sin(time) + p.z * Math.cos(time);
          
          // Project
          const scale = fov / (fov + rz + 4); // +4 to push back
          const x2d = rx * scale * 150 + cx;
          const y2d = p.y * scale * 150 + cy;
          
          // Draw Point
          const alpha = (rz + 2) / 3; // Fade back points
          ctx.fillStyle = `rgba(245, 245, 247, ${Math.max(0.1, alpha * 0.8)})`;
          
          // Energy/Data pulse on eyes area (approx)
          let isEye = false;
          if (Math.abs(p.y + 0.2) < 0.1 && p.z > 0) {
              ctx.fillStyle = '#6A4FFB';
              isEye = true;
          }

          ctx.beginPath();
          ctx.arc(x2d, y2d, isEye ? 2 : 1.5 * scale, 0, Math.PI * 2);
          ctx.fill();

          // Connect to random neighbor for wireframe feel
          if (Math.random() > 0.95) {
              ctx.strokeStyle = 'rgba(106, 79, 251, 0.2)';
              ctx.beginPath();
              ctx.moveTo(x2d, y2d);
              ctx.lineTo(x2d + (Math.random()-0.5)*20, y2d + (Math.random()-0.5)*20);
              ctx.stroke();
          }
      });

      // 3. Volumetric Lighting / Scanline
      const scanY = cy + Math.sin(time * 2) * 150;
      const gradient = ctx.createLinearGradient(0, scanY, 0, scanY + 20);
      gradient.addColorStop(0, 'rgba(106, 79, 251, 0.0)');
      gradient.addColorStop(0.5, 'rgba(106, 79, 251, 0.1)');
      gradient.addColorStop(1, 'rgba(106, 79, 251, 0.0)');
      ctx.fillStyle = gradient;
      ctx.fillRect(cx - 150, scanY - 10, 300, 20);

      // Render Glow (When Rendering)
      if (isRendering) {
          ctx.shadowBlur = 20;
          ctx.shadowColor = '#6A4FFB';
          ctx.strokeStyle = '#6A4FFB';
          ctx.strokeRect(cx - 160, cy - 200, 320, 400);
          ctx.shadowBlur = 0;
      }

      animationId = requestAnimationFrame(render);
    };
    render();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationId);
    };
  }, [isRendering]);

  // Render Simulation
  const handleRender = () => {
      setIsRendering(true);
      setRenderProgress(0);
      const interval = setInterval(() => {
          setRenderProgress(prev => {
              if (prev >= 100) {
                  clearInterval(interval);
                  setIsRendering(false);
                  return 100;
              }
              return prev + 1;
          });
      }, 50);
  };

  return (
    <div className="w-full h-screen bg-[#0B0B0D] text-obsidian-text-primary px-6 py-6 flex gap-6 overflow-hidden relative font-sans">
      {/* Background Radial Gradient */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-white/[0.02] blur-[100px] rounded-full pointer-events-none"></div>

      {/* --- COLUMNA IZQUIERDA: AVATAR CORE --- */}
      <div className="w-[20%] flex flex-col gap-6 animate-[fadeIn_0.5s_ease-out]">
         <ObsidianCard className="flex-1 flex flex-col overflow-y-auto">
             <div className="flex items-center gap-2 mb-6">
                 <User size={14} className="text-obsidian-accent" />
                 <span className="text-[10px] uppercase tracking-[0.2em] text-white/80 font-medium">Avatar Core</span>
             </div>

             {/* Sovereign Avatar Scan */}
             <div className="mb-8 flex flex-col items-center group">
                 <div className="w-24 h-24 rounded-full border border-white/10 p-1 relative mb-3 cursor-pointer overflow-hidden">
                     <div className="w-full h-full bg-[#16161A] rounded-full flex items-center justify-center relative overflow-hidden group-hover:border-obsidian-accent/50 transition-colors">
                        <User size={40} className="text-obsidian-text-muted opacity-50" />
                        {/* Fake scan line */}
                        <div className="absolute top-0 w-full h-[1px] bg-obsidian-accent shadow-[0_0_5px_#6A4FFB] animate-[scan_2s_linear_infinite]"></div>
                     </div>
                     <div className="absolute bottom-0 right-0 p-1.5 bg-obsidian-accent rounded-full text-white shadow-lg">
                         <Camera size={12} />
                     </div>
                 </div>
                 <h3 className="text-xs font-light text-white">Mi Avatar Soberano</h3>
                 <button className="mt-2 text-[9px] text-obsidian-text-muted uppercase tracking-wider hover:text-white flex items-center gap-1 border border-white/10 px-2 py-1 rounded hover:bg-white/5 transition-all">
                     <RefreshCw size={8} /> Nuevo Escaneo
                 </button>
             </div>

             {/* Controls */}
             <div className="space-y-6">
                 <div>
                     <label className="text-[10px] uppercase tracking-widest text-obsidian-text-muted mb-2 block">Personalidad</label>
                     <div className="flex flex-wrap gap-2">
                         {['Formal Executive', 'Friendly Advisor', 'Aggressive Sales'].map(p => (
                             <button 
                                key={p}
                                onClick={() => setPersonality(p)}
                                className={`px-2 py-1.5 rounded text-[10px] border transition-all duration-300 w-full text-left
                                    ${personality === p ? 'bg-white/[0.06] border-obsidian-accent text-white shadow-[inset_0_0_10px_rgba(106,79,251,0.2)]' : 'bg-transparent border-white/[0.06] text-obsidian-text-muted hover:text-white'}
                                `}
                             >
                                 {p}
                             </button>
                         ))}
                     </div>
                 </div>

                 <div>
                    <label className="text-[10px] uppercase tracking-widest text-obsidian-text-muted mb-2 block flex justify-between">
                        <span>Modelo de Voz</span>
                        <span className="text-white">{voicePitch}%</span>
                    </label>
                    <ObsidianSlider 
                        label="" 
                        min={0} max={100} 
                        value={voicePitch} 
                        onChange={(e) => setVoicePitch(Number(e.target.value))}
                    />
                    <button className="mt-2 w-full py-2 border border-white/[0.08] rounded text-[10px] text-obsidian-text-muted flex items-center justify-center gap-2 hover:bg-white/[0.02] hover:text-white transition-colors">
                        <Mic size={10} /> Test de Voz (Audio)
                    </button>
                 </div>
                 
                 <div>
                    <ObsidianInput label="Skill Injection" placeholder="Ej: Leyes fiscales..." icon={<Wand2 size={12} />} />
                    <div className="flex gap-1 mt-2 flex-wrap">
                        <span className="px-1.5 py-0.5 bg-white/5 border border-white/10 rounded text-[9px] text-obsidian-text-muted">Finanzas</span>
                        <span className="px-1.5 py-0.5 bg-white/5 border border-white/10 rounded text-[9px] text-obsidian-text-muted">Legal</span>
                    </div>
                 </div>
             </div>
         </ObsidianCard>
      </div>

      {/* --- PANEL CENTRAL: VIEWPORT VOLUMÉTRICO --- */}
      <div className="w-[60%] flex flex-col relative animate-[fadeIn_0.5s_ease-out_0.2s_both]">
          <ObsidianCard className="h-full relative overflow-hidden flex flex-col justify-center items-center" noPadding active={isRendering}>
              {/* Camera Controls Overlay */}
              <div className="absolute top-6 right-6 flex flex-col gap-3 z-20">
                  {['Órbita', 'Zoom', 'Pan'].map(c => (
                      <button key={c} className="w-8 h-8 rounded border border-white/[0.1] bg-[#0F0F12]/50 backdrop-blur flex items-center justify-center text-white/50 hover:text-white hover:border-white transition-all" title={c}>
                          <Box size={14} />
                      </button>
                  ))}
              </div>

              {/* Title Overlay */}
              <div className="absolute top-6 left-6 z-20">
                  <h2 className="text-base font-light text-white tracking-wide">Viewport Volumétrico</h2>
                  <div className="flex items-center gap-2 mt-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#45FF9A] animate-pulse"></div>
                      <span className="text-[10px] text-obsidian-text-muted font-mono uppercase">Live Preview • {personality}</span>
                  </div>
              </div>

              <canvas ref={canvasRef} className="w-full h-full block" />
              
              {/* Render Pulse Effect Overlay */}
              {isRendering && (
                  <div className="absolute inset-0 bg-obsidian-accent/[0.02] animate-pulse pointer-events-none"></div>
              )}
          </ObsidianCard>
      </div>

      {/* --- COLUMNA DERECHA: ASSET FORGE --- */}
      <div className="w-[20%] flex flex-col gap-6 animate-[fadeIn_0.5s_ease-out_0.4s_both]">
         <ObsidianCard className="flex-1 flex flex-col overflow-y-auto">
             <div className="flex items-center gap-2 mb-6">
                 <Layers size={14} className="text-obsidian-accent" />
                 <span className="text-[10px] uppercase tracking-[0.2em] text-white/80 font-medium">Asset Forge</span>
             </div>

             <div className="space-y-8">
                 {/* Volumetric Video */}
                 <div className="space-y-3">
                     <div className="flex justify-between items-center">
                        <label className="text-[10px] uppercase tracking-widest text-obsidian-text-muted">Video Volumétrico</label>
                        <PenTool size={10} className="text-obsidian-text-muted" />
                     </div>
                     
                     <textarea 
                        className="w-full h-24 bg-[#0B0B0D]/50 border border-white/[0.08] rounded p-3 text-[11px] text-obsidian-text-primary placeholder-obsidian-text-muted/30 focus:outline-none focus:border-white/20 resize-none font-light leading-relaxed"
                        placeholder="Escribe el guion para el avatar (ej: 'Hola, soy tu asistente virtual...')"
                     />
                     
                     <div className="flex gap-2">
                         {['Demo', 'Sales', 'Pitch'].map(tag => (
                             <span key={tag} className="px-2 py-1 bg-white/[0.03] border border-white/[0.06] rounded text-[9px] text-obsidian-text-muted cursor-pointer hover:bg-white/[0.08] hover:text-white transition-colors">{tag}</span>
                         ))}
                     </div>

                     {isRendering ? (
                         <div className="space-y-2">
                             <div className="flex justify-between text-[10px] text-white">
                                 <span className="animate-pulse">RENDERING...</span>
                                 <span className="font-thin text-xl leading-none">{renderProgress}%</span>
                             </div>
                             <div className="w-full h-[2px] bg-white/[0.1] rounded-full overflow-hidden">
                                 <div className="h-full bg-obsidian-accent transition-all duration-75" style={{ width: `${renderProgress}%` }}></div>
                             </div>
                         </div>
                     ) : (
                         <ObsidianButton onClick={handleRender}>
                             <Play size={12} className="mr-2 fill-current" />
                             RENDER VIDEO
                         </ObsidianButton>
                     )}
                 </div>

                 <div className="w-full h-[1px] bg-white/[0.06]"></div>

                 {/* 3D Scenes */}
                 <div className="space-y-3">
                     <label className="text-[10px] uppercase tracking-widest text-obsidian-text-muted">Escenas & Props 3D</label>
                     <ObsidianInput placeholder="Desc: escritorio minimalista..." icon={<Box size={12} />} />
                     <button className="w-full py-2 border border-white/[0.1] text-white text-[10px] uppercase tracking-widest hover:bg-white/[0.05] transition-colors rounded">
                         Generate 3D Scene
                     </button>
                     <div className="grid grid-cols-3 gap-2 mt-2 opacity-50">
                         {[1,2,3].map(i => (
                             <div key={i} className="aspect-square bg-white/[0.05] rounded border border-white/[0.05]"></div>
                         ))}
                     </div>
                 </div>

                 <div className="w-full h-[1px] bg-white/[0.06]"></div>

                 {/* CTA */}
                 <div className="space-y-3">
                     <label className="text-[10px] uppercase tracking-widest text-obsidian-text-muted">Holographic CTA (AR)</label>
                     <ObsidianInput placeholder="Texto: Haz clic aquí..." />
                     <button className="w-full py-2 bg-obsidian-accent/10 border border-obsidian-accent/40 text-obsidian-accent text-[10px] uppercase tracking-widest hover:bg-obsidian-accent/20 transition-colors rounded">
                         Generate CTA
                     </button>
                 </div>
             </div>
         </ObsidianCard>
      </div>

    </div>
  );
};

export default AvatarStudio;