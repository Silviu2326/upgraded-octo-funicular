import React, { useState, useEffect, useRef } from 'react';
import { ObsidianCard, ObsidianButton, ObsidianSlider } from './ui/ObsidianElements';
import { Shield, Key, Cpu, QrCode, Eye, EyeOff, Wifi, Radio, Lock, RefreshCw, Trash2, Fingerprint, AlertTriangle } from 'lucide-react';

const CYAN_ACCENT = '#00F0FF';

interface AgentIdentity {
  id: string;
  name: string;
  role: string;
  did: string;
  reputation: number;
}

const AGENTS: AgentIdentity[] = [
  { id: '1', name: 'Agent-07', role: 'Negotiator', did: 'did:sov:28f...92x', reputation: 98 },
  { id: '2', name: 'Agent-12', role: 'Market Analyst', did: 'did:eth:0x4...a91', reputation: 94 },
  { id: '3', name: 'Agent-99', role: 'Compliance Bot', did: 'did:web:obs.../leg', reputation: 100 },
];

const SSIVault: React.FC = () => {
  const [privacyBudget, setPrivacyBudget] = useState(25);
  const [revealingKey, setRevealingKey] = useState<string | null>(null);
  const [hardwareStatus, setHardwareStatus] = useState<'DISCONNECTED' | 'SEARCHING' | 'CONNECTED'>('CONNECTED');
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // --- Canvas Animation: Differential Privacy Core ---
  useEffect(() => {
    const canvas = canvasRef.current;
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

    // Particle System
    const particles: {x: number, y: number, angle: number, radius: number, speed: number, size: number}[] = [];
    const numParticles = 400;
    const cx = canvas.width / 4;
    const cy = canvas.height / 4;

    for(let i=0; i<numParticles; i++) {
        particles.push({
            x: cx, 
            y: cy,
            angle: Math.random() * Math.PI * 2,
            radius: 50 + Math.random() * 100,
            speed: (Math.random() - 0.5) * 0.02,
            size: Math.random() * 1.5
        });
    }

    let time = 0;
    let frameId: number;

    const render = () => {
        time += 0.05;
        const width = canvas.width / 2;
        const height = canvas.height / 2;
        
        // Glitch Effect (Random Shift)
        const glitch = Math.random() > 0.98 ? (Math.random() - 0.5) * 5 : 0;
        
        ctx.clearRect(0, 0, width, height);
        ctx.save();
        ctx.translate(glitch, 0);

        // 1. Federated Uplink (Beam)
        const beamOpacity = 0.1 + Math.sin(time * 5) * 0.05;
        const grad = ctx.createLinearGradient(cx, cy, cx, 0);
        grad.addColorStop(0, `rgba(0, 240, 255, ${beamOpacity})`);
        grad.addColorStop(1, 'rgba(0, 240, 255, 0)');
        ctx.fillStyle = grad;
        ctx.fillRect(cx - 20, 0, 40, cy);

        // 2. The Core (Data Orb)
        ctx.beginPath();
        ctx.arc(cx, cy, 40, 0, Math.PI * 2);
        ctx.fillStyle = '#FFFFFF';
        ctx.shadowBlur = 30;
        ctx.shadowColor = 'rgba(255, 255, 255, 0.5)';
        ctx.fill();
        ctx.shadowBlur = 0;

        // 3. Noise Shield (Particles)
        // Privacy Budget controls how "tight" the cloud is.
        // Low Budget (Left) = Dense Cloud (High Privacy)
        // High Budget (Right) = Dispersed Cloud (Low Privacy)
        
        // Invert slider for calculation: 0 slider = Max Noise (Radius small, Density high)
        // Actually visual metaphor: 
        // Max Privacy = Cloud covers the Orb fully (Opaque).
        // Max Utility = Cloud expands/dissipates revealing the Orb.
        
        const expansionFactor = (privacyBudget / 100) * 150; 
        
        particles.forEach(p => {
            p.angle += p.speed;
            
            // Orbit radius breathing
            const r = 50 + expansionFactor + Math.sin(time + p.angle*5) * 10 + (Math.random() * (100 - privacyBudget));
            
            const px = cx + Math.cos(p.angle) * r;
            const py = cy + Math.sin(p.angle) * r;
            
            const alpha = Math.max(0.1, 1 - (privacyBudget / 100)); // Disappear as budget increases
            
            ctx.fillStyle = `rgba(0, 240, 255, ${alpha})`;
            ctx.beginPath();
            ctx.rect(px, py, p.size, p.size); // Square particles for "Digital" feel
            ctx.fill();

            // Random connecting lines for "Static" look
            if (Math.random() > 0.95 && alpha > 0.2) {
                ctx.strokeStyle = `rgba(0, 240, 255, ${alpha * 0.5})`;
                ctx.lineWidth = 0.5;
                ctx.beginPath();
                ctx.moveTo(px, py);
                ctx.lineTo(cx, cy); // Connect to core
                ctx.stroke();
            }
        });

        // 4. Rings
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(cx, cy, 100 + Math.sin(time)*5, 0, Math.PI*2);
        ctx.stroke();
        
        ctx.strokeStyle = `rgba(0, 240, 255, 0.2)`;
        ctx.setLineDash([2, 10]);
        ctx.beginPath();
        ctx.arc(cx, cy, 120 + Math.cos(time*0.5)*5, time, time + Math.PI);
        ctx.stroke();
        ctx.setLineDash([]);

        ctx.restore();
        frameId = requestAnimationFrame(render);
    };
    render();
    return () => {
        window.removeEventListener('resize', resize);
        cancelAnimationFrame(frameId);
    };
  }, [privacyBudget]);


  // --- Key Reveal Logic ---
  const handleRevealStart = (keyId: string) => setRevealingKey(keyId);
  const handleRevealEnd = () => setRevealingKey(null);

  // Helper for "Matrix" text effect
  const SecretKeyDisplay: React.FC<{ secret: string, isRevealing: boolean }> = ({ secret, isRevealing }) => {
      const [display, setDisplay] = useState('************************');
      
      useEffect(() => {
          if (!isRevealing) {
              setDisplay('************************');
              return;
          }
          
          let iterations = 0;
          const interval = setInterval(() => {
              setDisplay(prev => secret.split('').map((char, index) => {
                  if (index < iterations) return char;
                  return String.fromCharCode(33 + Math.random() * 90); // Random glyphs
              }).join(''));
              
              iterations += 1/2; // Speed
              if (iterations >= secret.length) clearInterval(interval);
          }, 30);
          
          return () => clearInterval(interval);
      }, [isRevealing, secret]);

      return <span className={`font-mono text-[11px] ${isRevealing ? 'text-white' : 'text-obsidian-text-muted'}`}>{display}</span>;
  };


  return (
    <div className="w-full h-screen bg-[#0B0B0D] text-obsidian-text-primary px-6 py-6 flex gap-6 overflow-hidden relative font-sans">
      
      {/* --- GLOBAL STYLES --- */}
      {/* Scanline Overlay */}
      <div className="absolute inset-0 z-50 pointer-events-none opacity-[0.02]" 
           style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 1px, #fff 1px, #fff 2px)' }}>
      </div>

      {/* --- COLUMNA IZQUIERDA: IDENTITY SOVEREIGNTY --- */}
      <div className="w-[30%] flex flex-col gap-6 animate-[fadeIn_0.5s_ease-out]">
          
          {/* Master DID Card */}
          <ObsidianCard className="p-0 overflow-hidden relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-[#0F0F12] to-[#000000]"></div>
              
              {/* Cyan Glow Border */}
              <div className="absolute inset-0 border border-white/5 group-hover:border-[#00F0FF]/30 transition-colors duration-500 rounded-lg"></div>

              <div className="relative p-6 z-10">
                  <div className="flex justify-between items-start mb-6">
                      <div className="flex flex-col">
                           <span className="text-[10px] text-obsidian-text-muted uppercase tracking-[0.2em] mb-1">Master Identity</span>
                           <h2 className="text-xl text-white font-light">Sovereign Corp.</h2>
                      </div>
                      <div className="px-2 py-1 border border-[#00F0FF]/30 bg-[#00F0FF]/5 rounded flex items-center gap-2 shadow-[0_0_10px_rgba(0,240,255,0.1)]">
                          <div className="w-1.5 h-1.5 bg-[#00F0FF] rounded-full animate-pulse"></div>
                          <span className="text-[9px] font-bold text-[#00F0FF] tracking-widest">VERIFIED</span>
                      </div>
                  </div>

                  <div className="flex gap-4 items-center">
                      {/* Generative QR Placeholder */}
                      <div className="w-24 h-24 bg-white/5 border border-white/10 rounded p-1 flex items-center justify-center relative overflow-hidden">
                          <QrCode size={60} className="text-[#00F0FF] opacity-80" />
                          {/* Scanning line */}
                          <div className="absolute top-0 left-0 w-full h-[2px] bg-[#00F0FF] animate-[scan_2s_linear_infinite] shadow-[0_0_8px_#00F0FF]"></div>
                      </div>
                      <div className="flex-1 space-y-3">
                          <div>
                              <span className="text-[9px] text-obsidian-text-muted block uppercase tracking-wider">DID String</span>
                              <code className="text-[10px] font-mono text-[#00F0FF] break-all">did:sov:28f9s8...x92</code>
                          </div>
                          <div>
                              <span className="text-[9px] text-obsidian-text-muted block uppercase tracking-wider">Last Sync</span>
                              <span className="text-[10px] text-white">Block #18,294,002</span>
                          </div>
                      </div>
                  </div>
              </div>
          </ObsidianCard>

          {/* Agent Identity List */}
          <div className="flex-1 flex flex-col gap-3 overflow-y-auto pr-1">
              <div className="flex items-center gap-2 mb-2 px-1">
                  <Fingerprint size={14} className="text-obsidian-text-muted" />
                  <span className="text-[10px] text-obsidian-text-muted uppercase tracking-[0.2em] font-medium">Agent Passports</span>
              </div>
              
              {AGENTS.map((agent) => (
                  <div key={agent.id} className="bg-[#0F0F12]/60 border border-white/[0.04] p-4 rounded-lg hover:bg-white/[0.02] transition-colors group relative overflow-hidden">
                      <div className="flex justify-between items-start mb-2">
                          <div>
                              <h3 className="text-sm text-white font-medium">{agent.name}</h3>
                              <span className="text-[10px] text-obsidian-text-muted">{agent.role}</span>
                          </div>
                          {/* Revoke Button (Hidden until hover) */}
                          <button className="text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-red-500/10 rounded">
                              <Trash2 size={12} />
                          </button>
                      </div>
                      
                      <div className="flex items-end justify-between mt-3">
                          <code className="text-[9px] text-obsidian-text-secondary font-mono">{agent.did}</code>
                          <div className="flex items-center gap-2">
                              <span className="text-[9px] text-obsidian-text-muted uppercase">Reputation</span>
                              <div className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center text-[10px] text-[#00F0FF]">
                                  {agent.reputation}
                              </div>
                          </div>
                      </div>
                  </div>
              ))}
          </div>
      </div>

      {/* --- PANEL CENTRAL: DIFFERENTIAL PRIVACY CORE --- */}
      <div className="w-[40%] flex flex-col relative animate-[fadeIn_0.5s_ease-out_0.2s_both]">
          <ObsidianCard className="h-full relative overflow-hidden flex flex-col items-center justify-center" noPadding>
              {/* Header */}
              <div className="absolute top-6 left-6 z-20">
                  <h2 className="text-2xl font-thin text-white tracking-tight">Differential Privacy</h2>
                  <p className="text-[10px] text-obsidian-text-muted uppercase tracking-[0.2em] mt-1">Noise Injection Protocol • Epsilon {privacyBudget/100}</p>
              </div>

              {/* Status Indicator */}
              <div className="absolute top-6 right-6 z-20 flex flex-col items-end">
                  <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-[#00F0FF] rounded-full animate-pulse"></div>
                      <span className="text-[10px] text-[#00F0FF] tracking-widest uppercase">Federated Uplink Active</span>
                  </div>
                  <span className="text-[9px] text-obsidian-text-muted mt-1">Sending Gradients Only</span>
              </div>

              {/* Canvas */}
              <canvas ref={canvasRef} className="w-full h-full block" />
              
              {/* Controls Footer */}
              <div className="absolute bottom-0 w-full p-8 bg-gradient-to-t from-[#0B0B0D] to-transparent z-20">
                  <div className="flex justify-between items-end mb-4 text-[10px] uppercase tracking-widest font-medium">
                      <span className={`transition-colors ${privacyBudget < 30 ? 'text-[#00F0FF]' : 'text-obsidian-text-muted'}`}>Total Obfuscation</span>
                      <span className={`transition-colors ${privacyBudget > 70 ? 'text-red-400' : 'text-obsidian-text-muted'}`}>Max Utility</span>
                  </div>
                  
                  <ObsidianSlider 
                    label="Privacy Budget (ε)" 
                    min={0} max={100} 
                    value={privacyBudget} 
                    onChange={(e) => setPrivacyBudget(Number(e.target.value))}
                    valueDisplay={`${privacyBudget}%`}
                  />
                  
                  <div className="mt-4 text-center">
                      <p className="text-[10px] text-obsidian-text-muted font-mono bg-black/40 inline-block px-3 py-1 rounded border border-white/5">
                          {privacyBudget < 30 ? "MODE: FORTRESS. External agents perceive pure noise." : 
                           privacyBudget > 70 ? "MODE: GLASS HOUSE. High precision, reduced anonymity." : 
                           "MODE: BALANCED. Standard operational security."}
                      </p>
                  </div>
              </div>
          </ObsidianCard>
      </div>

      {/* --- COLUMNA DERECHA: KEY MANAGEMENT --- */}
      <div className="w-[30%] flex flex-col gap-6 animate-[fadeIn_0.5s_ease-out_0.4s_both]">
          
          {/* Hardware Wallet Bridge */}
          <ObsidianCard className="p-5 border border-[#00F0FF]/20 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-2 opacity-20">
                  <Cpu size={60} />
              </div>
              <div className="flex items-center gap-2 mb-4 relative z-10">
                   <div className={`w-2 h-2 rounded-full ${hardwareStatus === 'CONNECTED' ? 'bg-[#00F0FF] shadow-[0_0_8px_#00F0FF]' : 'bg-red-500'}`}></div>
                   <span className="text-[10px] uppercase tracking-[0.2em] text-white font-medium">Hardware Bridge</span>
              </div>
              
              <div className="space-y-4 relative z-10">
                  <div className="flex justify-between items-center bg-white/[0.03] p-3 rounded border border-white/[0.06]">
                      <div className="flex items-center gap-3">
                          <Wifi size={16} className="text-[#00F0FF]" />
                          <div>
                              <div className="text-xs text-white">Ledger Nano X</div>
                              <div className="text-[9px] text-obsidian-text-muted">Firmware v2.2.1</div>
                          </div>
                      </div>
                      <span className="text-[9px] font-bold text-[#00F0FF]">CONNECTED</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                      <span className="text-[10px] text-obsidian-text-secondary">Sign Tx via Hardware</span>
                      <div className="w-8 h-4 bg-[#00F0FF]/20 rounded-full relative cursor-pointer border border-[#00F0FF]/50">
                          <div className="absolute right-0.5 top-0.5 w-2.5 h-2.5 bg-[#00F0FF] rounded-full shadow-sm"></div>
                      </div>
                  </div>
              </div>
          </ObsidianCard>

          {/* Key Slots */}
          <ObsidianCard className="flex-1 flex flex-col overflow-hidden">
               <div className="flex items-center gap-2 mb-4">
                   <Key size={14} className="text-obsidian-text-muted" />
                   <span className="text-[10px] uppercase tracking-[0.2em] text-white/80 font-medium">Cold Storage Slots</span>
               </div>

               <div className="space-y-3">
                   {[
                       { id: 'k1', label: 'Root Seed Phrase', type: 'SEED' },
                       { id: 'k2', label: 'API Master Secret', type: 'KEY' },
                       { id: 'k3', label: 'Treasury Multi-Sig', type: 'KEY' }
                   ].map(key => (
                       <div key={key.id} className="bg-[#16161A] p-3 rounded border border-white/[0.04] flex flex-col gap-2">
                           <div className="flex justify-between items-center">
                               <span className="text-[10px] text-white font-medium">{key.label}</span>
                               <span className="text-[8px] bg-white/10 px-1 rounded text-obsidian-text-muted">{key.type}</span>
                           </div>
                           <div className="flex justify-between items-center bg-black/40 p-2 rounded inner-shadow">
                               <SecretKeyDisplay secret="x8s9-f9s8-d8f9-s8d9" isRevealing={revealingKey === key.id} />
                               
                               <button 
                                  className="text-obsidian-text-muted hover:text-[#00F0FF] transition-colors"
                                  onMouseDown={() => handleRevealStart(key.id)}
                                  onMouseUp={handleRevealEnd}
                                  onMouseLeave={handleRevealEnd}
                               >
                                   {revealingKey === key.id ? <Eye size={14} /> : <EyeOff size={14} />}
                               </button>
                           </div>
                       </div>
                   ))}
               </div>

               {/* Panic Button */}
               <div className="mt-auto pt-4 border-t border-white/[0.06]">
                   <button className="w-full py-3 bg-[repeating-linear-gradient(45deg,#16161A,#16161A_10px,#1A1A1D_10px,#1A1A1D_20px)] border border-[#FFAA00]/30 text-[#FFAA00] hover:bg-[#FFAA00] hover:text-black transition-all duration-300 rounded flex items-center justify-center gap-2 group uppercase tracking-widest text-[10px] font-bold">
                       <AlertTriangle size={12} />
                       Emergency Key Rotation
                   </button>
               </div>
          </ObsidianCard>
      </div>

    </div>
  );
};

export default SSIVault;