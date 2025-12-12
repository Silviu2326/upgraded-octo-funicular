import React, { useState, useEffect, useRef } from 'react';
import { ObsidianCard } from './ui/ObsidianElements';
import { Activity, ShieldCheck, Zap, Server, Power, Wifi, Stethoscope, AlertOctagon } from 'lucide-react';

interface LogEvent {
  id: string;
  title: string;
  action: string;
  status: 'RESOLVED' | 'HEALING';
  timestamp: string;
}

const SystemHealth: React.FC = () => {
  const [healthScore, setHealthScore] = useState(99.98);
  const anatomyCanvasRef = useRef<HTMLCanvasElement>(null);
  const ecgCanvasRef = useRef<HTMLCanvasElement>(null);

  // --- Mock Data ---
  const [logs, setLogs] = useState<LogEvent[]>([
    { id: '1', title: 'Facebook Ad Policy Violation', action: 'Compliance Agent rewrote copy & re-submitted.', status: 'RESOLVED', timestamp: '12s ago' },
    { id: '2', title: 'Payment Gateway Latency (Stripe)', action: 'Rerouting to Backup Processor (PayPal)...', status: 'HEALING', timestamp: 'Now' },
    { id: '3', title: 'High CPU Load - Swarm Node 4', action: 'Auto-scaled +2 containers.', status: 'RESOLVED', timestamp: '4m ago' },
    { id: '4', title: 'Data Drift in Pricing Model', action: 'Retrained weights with last 1h dataset.', status: 'RESOLVED', timestamp: '15m ago' },
  ]);

  const apis = [
    { name: 'OpenAI GPT-4', lat: 245, status: 'ok' },
    { name: 'Stripe Payments', lat: 840, status: 'warn' },
    { name: 'AWS us-east-1', lat: 42, status: 'ok' },
    { name: 'Binance Market', lat: 120, status: 'ok' },
    { name: 'Gmail SMTP', lat: 89, status: 'ok' },
  ];

  // --- ECG Animation (Header) ---
  useEffect(() => {
    const canvas = ecgCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
        const { width, height } = canvas.getBoundingClientRect();
        canvas.width = width;
        canvas.height = height;
    };
    resize();
    window.addEventListener('resize', resize);

    let x = 0;
    let time = 0;
    // Buffer to hold Y values
    const data: number[] = new Array(canvas.width).fill(canvas.height / 2);

    const render = () => {
        const { width, height } = canvas;
        time += 0.05;

        // Shift data
        data.shift();
        
        // Generate new Y point (Heartbeat logic)
        const base = height / 2;
        let y = base;
        
        // Create a beat every ~3 seconds
        const beatPhase = time % 10;
        if (beatPhase > 8 && beatPhase < 9) {
             // QRS complex simulation
             const t = (beatPhase - 8) * 5; // 0 to 5
             if (t < 1) y -= 10 * t;
             else if (t < 2) y += 30 * (t-1);
             else if (t < 3) y -= 40 * (t-2);
             else y = base;
        } else {
             y = base + (Math.random() - 0.5) * 2; // Noise
        }
        
        data.push(y);

        ctx.clearRect(0, 0, width, height);
        ctx.beginPath();
        ctx.strokeStyle = '#45FF9A';
        ctx.lineWidth = 1.5;
        ctx.shadowBlur = 4;
        ctx.shadowColor = '#45FF9A';
        
        for (let i = 0; i < width; i++) {
            if (i === 0) ctx.moveTo(i, data[i]);
            else ctx.lineTo(i, data[i]);
        }
        ctx.stroke();
        
        // Draw trailing fade rect to simulate phosphorus fade? 
        // Or simpler: just standard clear. The moving line is enough.

        // Draw "Current Point"
        const lastY = data[data.length - 1];
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(width - 2, lastY, 2, 0, Math.PI*2);
        ctx.fill();

        requestAnimationFrame(render);
    };
    const animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, []);

  // --- System Anatomy Animation (Center) ---
  useEffect(() => {
    const canvas = anatomyCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      const { width, height } = canvas.getBoundingClientRect();
      canvas.width = width * 2;
      canvas.height = height * 2;
      ctx.scale(2, 2);
    };
    resize();
    window.addEventListener('resize', resize);

    let time = 0;

    const render = () => {
      time += 0.01;
      const { width: w, height: h } = canvas.getBoundingClientRect();
      const cx = w / 2;
      const cy = h / 2;
      
      ctx.clearRect(0, 0, w, h);

      // 1. Outer Shield (Protective Layer)
      ctx.beginPath();
      ctx.arc(cx, cy, 140, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(69, 255, 154, 0.1)';
      ctx.lineWidth = 1;
      ctx.setLineDash([5, 10]);
      ctx.stroke();
      
      // Rotating Shield Part
      ctx.beginPath();
      ctx.arc(cx, cy, 150, time * 0.5, time * 0.5 + Math.PI / 2);
      ctx.strokeStyle = '#45FF9A';
      ctx.lineWidth = 2;
      ctx.setLineDash([]);
      ctx.shadowBlur = 10;
      ctx.shadowColor = '#45FF9A';
      ctx.stroke();
      ctx.shadowBlur = 0;

      // 2. The Core (Concentric Rings)
      const rings = 5;
      for (let i = 0; i < rings; i++) {
          const r = 30 + i * 20;
          const offset = i % 2 === 0 ? 1 : -1;
          const rotation = time * 0.2 * offset + i;
          
          ctx.beginPath();
          // Hexagon shape approx or circle with dash
          const segments = 6;
          for (let j = 0; j <= segments; j++) {
             const angle = rotation + (j / segments) * Math.PI * 2;
             const px = cx + Math.cos(angle) * r;
             const py = cy + Math.sin(angle) * r;
             if (j === 0) ctx.moveTo(px, py);
             else ctx.lineTo(px, py);
          }
          
          ctx.closePath();
          
          // Healing State for one ring (Mock)
          const isHealing = i === 2 && (Math.floor(time) % 5 === 0);
          
          ctx.strokeStyle = isHealing ? '#FFAA00' : 'rgba(255, 255, 255, 0.1)';
          ctx.lineWidth = isHealing ? 2 : 1;
          
          if(isHealing) {
             ctx.setLineDash([2, 4]);
             ctx.shadowColor = '#FFAA00';
             ctx.shadowBlur = 5;
          } else {
             ctx.setLineDash([]);
             ctx.shadowBlur = 0;
          }
          
          ctx.stroke();
      }

      // 3. Central Nucleus (Pulse)
      const pulse = Math.sin(time * 3);
      ctx.beginPath();
      ctx.arc(cx, cy, 10 + pulse * 2, 0, Math.PI * 2);
      ctx.fillStyle = '#45FF9A';
      ctx.fill();
      
      // Rays
      ctx.beginPath();
      ctx.arc(cx, cy, 20 + pulse * 5, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(69, 255, 154, 0.2)';
      ctx.fill();

      requestAnimationFrame(render);
    };

    const animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, []);


  return (
    <div className="w-full h-screen bg-[#0B0B0D] text-obsidian-text-primary px-6 py-6 flex flex-col overflow-hidden relative font-sans">
      
      {/* Ambient Breathing Light */}
      <div className="absolute inset-0 bg-[#45FF9A] opacity-[0.02] animate-[pulse_4s_infinite] pointer-events-none"></div>

      {/* --- HEADER: VITAL SIGNS BAR --- */}
      <div className="h-[15%] flex gap-6 mb-6 animate-[fadeIn_0.5s_ease-out]">
          <ObsidianCard className="flex-[1] flex flex-col justify-center border-l-4 border-l-[#45FF9A]" noPadding>
              <div className="p-6 h-full flex items-center justify-between">
                  <div>
                      <div className="flex items-center gap-2 mb-1">
                          <Activity size={16} className="text-[#45FF9A]" />
                          <span className="text-[10px] uppercase tracking-[0.2em] text-[#45FF9A]">Operational Health</span>
                      </div>
                      <div className="text-[42px] font-thin text-[#45FF9A] tabular-nums leading-none tracking-tighter">
                          {healthScore}%
                      </div>
                  </div>
                  <div className="h-full w-48 relative overflow-hidden opacity-80">
                      <canvas ref={ecgCanvasRef} className="w-full h-full" />
                  </div>
              </div>
          </ObsidianCard>

          <ObsidianCard className="flex-[1] flex items-center justify-between px-8" noPadding>
              <div className="flex flex-col gap-1">
                  <span className="text-[10px] uppercase tracking-[0.2em] text-obsidian-text-muted">Compliance Index</span>
                  <div className="text-2xl font-light text-white flex items-center gap-2">
                      <ShieldCheck size={20} className="text-[#45FF9A]" />
                      100% Legal Safe
                  </div>
              </div>
              <div className="w-[1px] h-10 bg-white/[0.1]"></div>
              <div className="flex flex-col gap-1 text-right">
                  <span className="text-[10px] uppercase tracking-[0.2em] text-obsidian-text-muted">Active Agents</span>
                  <div className="text-2xl font-light text-white">432 / 432</div>
              </div>
          </ObsidianCard>
      </div>

      {/* --- MAIN BODY --- */}
      <div className="flex-1 flex gap-6 min-h-0">
          
          {/* --- COLUMNA IZQUIERDA: THE IMMUNE LOG --- */}
          <div className="w-[30%] flex flex-col gap-6 animate-[fadeIn_0.5s_ease-out_0.2s_both]">
              <ObsidianCard className="flex-1 flex flex-col relative overflow-hidden" noPadding>
                  <div className="p-4 border-b border-white/[0.04] flex justify-between items-center bg-[#0F0F12]/90 backdrop-blur">
                      <div className="flex items-center gap-2">
                          <Stethoscope size={14} className="text-obsidian-accent" />
                          <span className="text-[10px] uppercase tracking-[0.2em] text-white/80 font-medium">Immune Log</span>
                      </div>
                      <div className="flex gap-1">
                          <div className="w-1.5 h-1.5 rounded-full bg-[#45FF9A] animate-pulse"></div>
                          <span className="text-[9px] text-[#45FF9A]">AUTO-HEAL ACTIVE</span>
                      </div>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto p-0">
                      {logs.map((log) => (
                          <div key={log.id} className="group p-4 border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors relative overflow-hidden">
                              <div className="flex justify-between items-start mb-1">
                                  <h4 className={`text-[13px] font-medium ${log.status === 'HEALING' ? 'text-[#FFAA00]' : 'text-[#F5F5F7]'}`}>
                                      {log.title}
                                  </h4>
                                  <span className="text-[9px] text-obsidian-text-muted opacity-50 font-mono">{log.timestamp}</span>
                              </div>
                              <div className="flex items-center gap-2 mb-2">
                                  <div className="w-[1px] h-3 bg-white/[0.1]"></div>
                                  <p className="text-[11px] font-mono text-obsidian-text-muted">{log.action}</p>
                              </div>
                              
                              <div className="flex justify-between items-center mt-2">
                                   {log.status === 'RESOLVED' ? (
                                       <span className="text-[10px] font-bold text-[#45FF9A] tracking-wider flex items-center gap-1">
                                           <ShieldCheck size={10} /> [✔ RESOLVED]
                                       </span>
                                   ) : (
                                       <div className="flex items-center gap-2 w-full">
                                            <span className="text-[10px] font-bold text-[#FFAA00] tracking-wider animate-pulse">
                                                [HEALING...]
                                            </span>
                                            <div className="flex-1 h-1 bg-[#FFAA00]/20 rounded-full overflow-hidden">
                                                <div className="h-full bg-[#FFAA00] animate-[shimmer_1s_infinite]" style={{width: '60%'}}></div>
                                            </div>
                                       </div>
                                   )}
                              </div>

                              {/* Glitch Effect on Healing items */}
                              {log.status === 'HEALING' && (
                                  <div className="absolute top-0 left-0 w-1 h-full bg-[#FFAA00] opacity-50"></div>
                              )}
                          </div>
                      ))}
                  </div>

                  <div className="p-3 bg-[#45FF9A]/5 border-t border-[#45FF9A]/10 text-center">
                      <p className="text-[10px] text-[#45FF9A]/80 tracking-wide">
                          Human Intervention Saved: <span className="font-bold text-[#45FF9A]">14h 32m</span> this week.
                      </p>
                  </div>
              </ObsidianCard>
          </div>

          {/* --- PANEL CENTRAL: SYSTEM ANATOMY --- */}
          <div className="w-[40%] flex flex-col relative animate-[fadeIn_0.5s_ease-out_0.4s_both]">
              <ObsidianCard className="h-full relative overflow-hidden flex flex-col justify-center items-center" noPadding>
                  <div className="absolute top-6 left-6 z-20 pointer-events-none">
                     <h2 className="text-base font-light text-white tracking-wide">System Anatomy</h2>
                     <p className="text-[10px] text-obsidian-text-muted uppercase tracking-[0.2em]">Digital Homeostasis Engine</p>
                  </div>

                  <div className="absolute top-6 right-6 z-20 pointer-events-none text-right">
                      <div className="text-[10px] text-obsidian-text-muted uppercase tracking-widest">Entropy Level</div>
                      <div className="text-xl font-thin text-[#45FF9A]">0.02%</div>
                  </div>

                  <canvas ref={anatomyCanvasRef} className="w-full h-full block" />
                  
                  {/* Floating Label */}
                  <div className="absolute bottom-10 bg-[#0F0F12]/80 backdrop-blur border border-white/[0.1] px-4 py-2 rounded-full flex items-center gap-3">
                      <div className="flex gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#45FF9A] animate-pulse"></span>
                          <span className="w-1.5 h-1.5 rounded-full bg-[#45FF9A] animate-pulse delay-100"></span>
                          <span className="w-1.5 h-1.5 rounded-full bg-[#45FF9A] animate-pulse delay-200"></span>
                      </div>
                      <span className="text-[10px] text-white tracking-widest uppercase">All Systems Nominal</span>
                  </div>
              </ObsidianCard>
          </div>

          {/* --- COLUMNA DERECHA: NERVOUS SYSTEM --- */}
          <div className="w-[15%] flex flex-col gap-6 animate-[fadeIn_0.5s_ease-out_0.6s_both]">
              <ObsidianCard className="flex-1 flex flex-col overflow-hidden relative">
                   <div className="flex items-center gap-2 mb-4">
                      <Wifi size={14} className="text-obsidian-text-muted" />
                      <span className="text-[10px] uppercase tracking-[0.2em] text-white/80 font-medium">Nervous System</span>
                   </div>

                   <div className="flex-1 space-y-4 overflow-y-auto pr-1">
                       {apis.map((api, i) => (
                           <div key={i} className="flex flex-col gap-1 pb-3 border-b border-white/[0.04] last:border-0">
                               <div className="flex justify-between items-center">
                                   <span className="text-[11px] text-[#F5F5F7]">{api.name}</span>
                                   <div className={`w-1.5 h-1.5 rounded-full ${api.status === 'ok' ? 'bg-[#45FF9A]' : 'bg-[#FFAA00] animate-pulse'}`}></div>
                               </div>
                               <div className="flex justify-between items-center">
                                   <span className="text-[9px] text-obsidian-text-muted uppercase tracking-wider">Latency</span>
                                   <span className={`text-[10px] font-mono ${api.lat > 300 ? 'text-[#FFAA00]' : 'text-obsidian-text-secondary'}`}>
                                       {api.lat}ms
                                   </span>
                               </div>
                               {/* Micro bar chart for latency */}
                               <div className="w-full h-[2px] bg-white/[0.05] mt-1 rounded-full overflow-hidden">
                                   <div 
                                      className={`h-full ${api.lat > 300 ? 'bg-[#FFAA00]' : 'bg-[#45FF9A]'}`} 
                                      style={{width: `${Math.min(100, (api.lat / 500) * 100)}%`}}
                                   ></div>
                               </div>
                           </div>
                       ))}
                   </div>
                   
                   {/* Kill Switch */}
                   <div className="mt-auto pt-4 border-t border-white/[0.06]">
                       <button className="w-full py-3 bg-red-500/5 border border-red-500/30 text-red-500 hover:bg-red-500 hover:text-white transition-all duration-300 rounded flex flex-col items-center justify-center gap-1 group">
                           <Power size={14} className="group-hover:scale-110 transition-transform" />
                           <span className="text-[9px] uppercase tracking-widest font-bold">Cut Hardline</span>
                       </button>
                       <div className="text-[8px] text-center text-red-500/40 mt-1 uppercase tracking-widest"> Emergency Only</div>
                   </div>
              </ObsidianCard>
          </div>

      </div>
    </div>
  );
};

export default SystemHealth;