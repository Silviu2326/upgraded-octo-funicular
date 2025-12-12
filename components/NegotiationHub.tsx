import React, { useState, useEffect, useRef } from 'react';
import { ObsidianCard, ObsidianButton, ObsidianSlider } from './ui/ObsidianElements';
import { ShieldCheck, Lock, CheckCircle2, FileCode, Play, AlertTriangle, ArrowRightLeft } from 'lucide-react';

// --- Types ---
type DealStatus = 'NEGOTIATING' | 'CLOSED' | 'AUCTION';

interface Deal {
  id: string;
  counterparty: string;
  type: 'BUY' | 'SELL';
  value: number;
  status: DealStatus;
  probability: number;
}

const DEALS: Deal[] = [
  { id: '1', counterparty: 'Acme Corp Supply', type: 'BUY', value: 12450, status: 'NEGOTIATING', probability: 88 },
  { id: '2', counterparty: 'Globex Logistics', type: 'BUY', value: 45000, status: 'AUCTION', probability: 64 },
  { id: '3', counterparty: 'Sovereign Systems', type: 'SELL', value: 120000, status: 'CLOSED', probability: 100 },
  { id: '4', counterparty: 'Massive Dynamic', type: 'BUY', value: 8900, status: 'NEGOTIATING', probability: 45 },
];

const NegotiationHub: React.FC = () => {
  const [selectedDealId, setSelectedDealId] = useState<string>('1');
  const [protocolLogs, setProtocolLogs] = useState<string[]>([]);
  const [aggressiveness, setAggressiveness] = useState(50);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const selectedDeal = DEALS.find(d => d.id === selectedDealId) || DEALS[0];

  // --- Protocol Log Simulation ---
  useEffect(() => {
    setProtocolLogs([
        `[MNP-OUT] > Offer sent: $${(selectedDeal.value * 0.9).toLocaleString()} + Net30.`,
        `[MNP-IN]  < Counter-party rejects. Sentiment: Hesitant (0.6).`,
        `[AI-CORE] ! Calculating Nash Equilibrium...`
    ]);

    const interval = setInterval(() => {
        const actions = [
            `[AI-CORE] ! Adjusting Strategy. Triggering "Anchoring Bias".`,
            `[MNP-OUT] > New Offer: $${(selectedDeal.value * 0.95).toLocaleString()} + Priority Shipping.`,
            `[MNP-IN]  < Counter-party counter-offers: $${(selectedDeal.value * 0.98).toLocaleString()}.`,
            `[AI-CORE] ZOPA Detected. Converging...`,
            `[MNP-OUT] > Finalizing terms. Generating Smart Contract hash.`
        ];
        const randomAction = actions[Math.floor(Math.random() * actions.length)];
        setProtocolLogs(prev => [...prev.slice(-6), randomAction]);
    }, 3000);

    return () => clearInterval(interval);
  }, [selectedDealId]);

  // --- Nash Equilibrium Canvas ---
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

    let time = 0;
    let animationId: number;

    const render = () => {
        time += 0.02;
        const width = canvas.width / 2;
        const height = canvas.height / 2;
        
        ctx.clearRect(0, 0, width, height);

        // Grid
        ctx.strokeStyle = '#1A1A1D';
        ctx.lineWidth = 1;
        for(let i=0; i<width; i+=40) { ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, height); ctx.stroke(); }
        for(let i=0; i<height; i+=40) { ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(width, i); ctx.stroke(); }

        // Axes
        ctx.strokeStyle = '#BEBEC6';
        ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(40, height-40); ctx.lineTo(width-40, height-40); ctx.stroke(); // X (Price)
        ctx.beginPath(); ctx.moveTo(40, height-40); ctx.lineTo(40, 40); ctx.stroke(); // Y (Conditions)
        
        // Labels
        ctx.fillStyle = '#8C8C97';
        ctx.font = '10px Inter';
        ctx.fillText('PRICE UTILITY', width-90, height-25);
        ctx.save();
        ctx.translate(25, 100);
        ctx.rotate(-Math.PI/2);
        ctx.fillText('CONDITIONS', 0, 0);
        ctx.restore();

        // 1. Own Curve (Green) - "Our Utility"
        // Shape changes slightly with aggressiveness
        const aggFactor = aggressiveness / 100; 
        ctx.beginPath();
        ctx.moveTo(40, 40);
        ctx.bezierCurveTo(width * 0.5, 40, width * (0.5 + aggFactor * 0.2), height * 0.5, width - 40, height - 40);
        ctx.strokeStyle = '#45FF9A';
        ctx.lineWidth = 2;
        ctx.stroke();

        // 2. Opponent Curve (Grey) - "Estimated Utility"
        // Moves based on time (simulating negotiation)
        const oppShift = Math.sin(time) * 20;
        ctx.beginPath();
        ctx.moveTo(40, height - 40);
        ctx.bezierCurveTo(width * 0.3, height - 40, width * 0.6, height * 0.6 + oppShift, width - 40, 40);
        ctx.strokeStyle = '#BEBEC6';
        ctx.setLineDash([5, 5]);
        ctx.lineWidth = 1.5;
        ctx.stroke();
        ctx.setLineDash([]);

        // 3. ZOPA (Zone of Possible Agreement) - The intersection area
        // Simplified visual approximation
        ctx.globalCompositeOperation = 'screen';
        ctx.fillStyle = 'rgba(69, 255, 154, 0.05)';
        ctx.beginPath();
        ctx.moveTo(width/2, height/2);
        ctx.arc(width/2, height/2, 60 + Math.sin(time*2)*5, 0, Math.PI*2);
        ctx.fill();
        ctx.globalCompositeOperation = 'source-over';

        // 4. The Deal Point (Converging)
        const dealX = (width / 2) + Math.cos(time * 0.5) * 20;
        const dealY = (height / 2) + Math.sin(time * 0.8) * 20;
        
        // Flash "Target"
        ctx.beginPath();
        ctx.arc(dealX, dealY, 4, 0, Math.PI * 2);
        ctx.fillStyle = '#FFFFFF';
        ctx.fill();
        // Ring
        ctx.beginPath();
        ctx.arc(dealX, dealY, 12, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(255,255,255,0.3)';
        ctx.stroke();

        // Connecting lines to axes
        ctx.strokeStyle = 'rgba(255,255,255,0.1)';
        ctx.beginPath(); ctx.moveTo(dealX, dealY); ctx.lineTo(dealX, height-40); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(dealX, dealY); ctx.lineTo(40, dealY); ctx.stroke();

        animationId = requestAnimationFrame(render);
    };

    render();
    return () => {
        window.removeEventListener('resize', resizeCanvas);
        cancelAnimationFrame(animationId);
    };
  }, [aggressiveness]);

  return (
    <div className={`w-full h-screen bg-[#0B0B0D] text-obsidian-text-primary px-6 py-6 flex gap-6 overflow-hidden relative font-sans transition-colors duration-1000 ${selectedDeal.status === 'AUCTION' ? 'shadow-[inset_0_0_100px_rgba(255,170,0,0.05)]' : ''}`}>
      
      {/* --- COLUMNA IZQUIERDA: ACTIVE DEAL FLOW --- */}
      <div className="w-[20%] flex flex-col animate-[fadeIn_0.5s_ease-out]">
         <div className="flex justify-between items-center mb-4 px-1">
             <span className="text-[11px] font-medium text-white tracking-widest border-b border-white">COMPRAS</span>
             <span className="text-[11px] font-medium text-obsidian-text-muted tracking-widest hover:text-white cursor-pointer transition-colors">VENTAS</span>
         </div>
         
         <div className="flex-1 flex flex-col gap-3 overflow-y-auto pr-1">
             {DEALS.filter(d => d.type === 'BUY').map(deal => (
                 <button 
                    key={deal.id}
                    onClick={() => setSelectedDealId(deal.id)}
                    className={`
                        group relative w-full text-left p-4 rounded-lg border backdrop-blur-sm transition-all duration-300
                        ${selectedDealId === deal.id ? 'bg-white/[0.04] border-white/[0.1] shadow-lg' : 'bg-[#0F0F12]/40 border-transparent hover:bg-white/[0.02]'}
                    `}
                 >
                    {/* Status Line */}
                    <div className={`absolute left-0 top-3 bottom-3 w-[2px] rounded-r-full transition-colors ${
                        deal.status === 'CLOSED' ? 'bg-obsidian-success shadow-[0_0_8px_#45FF9A]' : 
                        deal.status === 'AUCTION' ? 'bg-[#FFD700] shadow-[0_0_8px_#FFD700]' : 
                        'bg-obsidian-accent shadow-[0_0_8px_#6A4FFB]'
                    }`}></div>

                    <div className="pl-3">
                        <div className="flex justify-between items-start mb-1">
                            <span className="text-[13px] font-light text-white">{deal.counterparty}</span>
                            {deal.status === 'AUCTION' && <AlertTriangle size={12} className="text-[#FFD700] animate-pulse" />}
                        </div>
                        <div className="flex justify-between items-end">
                            <span className="text-xl font-thin text-[#F5F5F7] tracking-tight">${deal.value.toLocaleString()}</span>
                            <div className="flex items-center gap-1">
                                <div className={`w-1.5 h-1.5 rounded-full ${deal.probability > 70 ? 'bg-obsidian-success' : 'bg-obsidian-accent'}`}></div>
                                <span className="text-[10px] font-mono text-obsidian-text-muted">{deal.probability}%</span>
                            </div>
                        </div>
                    </div>
                 </button>
             ))}
              <div className="mt-4 pt-4 border-t border-white/[0.04]">
                <span className="text-[9px] text-obsidian-text-muted uppercase tracking-widest mb-2 block">Ventas (Revenue)</span>
                {DEALS.filter(d => d.type === 'SELL').map(deal => (
                     <div key={deal.id} className="opacity-50 p-4 border border-white/[0.04] rounded-lg bg-[#0F0F12]/20 pl-6">
                         <span className="text-xs text-white block">{deal.counterparty}</span>
                         <span className="text-sm font-thin block mt-1">${deal.value.toLocaleString()}</span>
                         <div className="mt-2 text-[9px] text-obsidian-success uppercase tracking-wider flex items-center gap-1">
                             <CheckCircle2 size={10} /> Cerrado
                         </div>
                     </div>
                ))}
             </div>
         </div>
      </div>

      {/* --- COLUMNA CENTRAL: EQUILIBRIUM ENGINE --- */}
      <div className="w-[55%] flex flex-col gap-4 animate-[fadeIn_0.5s_ease-out_0.2s_both]">
         {/* Top: Chart */}
         <ObsidianCard className="flex-[3] relative flex flex-col" noPadding>
             {/* Dynamic Ambient Glow based on state */}
             <div className={`absolute inset-0 z-0 opacity-10 pointer-events-none transition-colors duration-1000 ${
                 selectedDeal.status === 'AUCTION' ? 'bg-amber-500/20' : 'bg-cyan-500/5'
             }`}></div>

             <div className="absolute top-4 left-4 z-10 flex items-center justify-between w-[calc(100%-32px)]">
                 <div className="flex items-center gap-2">
                     <ArrowRightLeft size={14} className="text-obsidian-text-muted" />
                     <span className="text-[10px] uppercase tracking-[0.2em] text-obsidian-text-muted font-medium">Motor de Equilibrio Nash</span>
                 </div>
                 {selectedDeal.status === 'AUCTION' && (
                     <span className="text-[10px] text-[#FFD700] font-mono animate-pulse">⚠️ SUBASTA INVERSA ACTIVA</span>
                 )}
             </div>

             <canvas ref={canvasRef} className="w-full h-full relative z-10" />

             {/* Auction Countdown Background */}
             {selectedDeal.status === 'AUCTION' && (
                 <div className="absolute inset-0 flex items-center justify-center z-0 pointer-events-none opacity-[0.03]">
                     <span className="text-[150px] font-thin text-[#FFD700] tabular-nums tracking-tighter">04:59</span>
                 </div>
             )}
         </ObsidianCard>

         {/* Bottom: Protocol Log */}
         <ObsidianCard className="flex-[2] flex flex-col overflow-hidden" noPadding>
             <div className="p-3 border-b border-white/[0.04] bg-[#0F0F12]/90 flex justify-between items-center">
                 <div className="flex items-center gap-2">
                     <div className="w-1.5 h-1.5 rounded-full bg-obsidian-accent animate-pulse"></div>
                     <span className="text-[9px] font-mono text-obsidian-text-muted">PROTOCOL STREAM // PORT: 443</span>
                 </div>
                 <div className="flex gap-1">
                    <div className="w-1 h-1 bg-white/20 rounded-full"></div>
                    <div className="w-1 h-1 bg-white/20 rounded-full"></div>
                    <div className="w-1 h-1 bg-white/20 rounded-full"></div>
                 </div>
             </div>
             <div className="flex-1 p-4 overflow-y-auto font-mono text-[10px] space-y-1.5 bg-black/40">
                 {protocolLogs.map((log, i) => {
                     let colorClass = 'text-obsidian-text-muted';
                     if(log.includes('[MNP-OUT]')) colorClass = 'text-obsidian-success';
                     if(log.includes('[AI-CORE]')) colorClass = 'text-obsidian-accent';
                     return (
                        <div key={i} className={`flex gap-2 opacity-90 animate-[fadeIn_0.2s_ease-out]`}>
                            <span className="opacity-30 select-none">{(1000 + i).toString(16).toUpperCase()}</span>
                            <span className={colorClass}>{log}</span>
                        </div>
                     )
                 })}
                 <div className="animate-pulse text-obsidian-accent">_</div>
             </div>
             {/* Aggressiveness Control */}
             <div className="p-4 border-t border-white/[0.04] bg-[#0F0F12]">
                 <ObsidianSlider 
                    label="Nivel de Agresividad (IA)" 
                    min={0} max={100} value={aggressiveness} 
                    onChange={(e) => setAggressiveness(Number(e.target.value))}
                    valueDisplay={`${aggressiveness}%`}
                 />
             </div>
         </ObsidianCard>
      </div>

      {/* --- COLUMNA DERECHA: SMART CONTRACT --- */}
      <div className="w-[25%] flex flex-col gap-6 animate-[fadeIn_0.5s_ease-out_0.4s_both]">
          <ObsidianCard className="flex-1 flex flex-col relative overflow-visible">
              <div className="flex items-center gap-2 mb-6">
                  <FileCode size={14} className="text-obsidian-accent" />
                  <span className="text-[10px] uppercase tracking-[0.2em] text-white/80 font-medium">Contrato Inteligente</span>
              </div>

              {/* 3D Abstract Icon Placeholder */}
              <div className="flex justify-center mb-8 relative">
                  <div className="w-24 h-24 border border-obsidian-accent/30 rounded-lg transform rotate-45 flex items-center justify-center bg-obsidian-accent/[0.02]">
                      <div className="w-16 h-16 border border-white/10 rounded transform -rotate-45 flex items-center justify-center">
                          <Lock size={24} className="text-obsidian-text-muted" />
                      </div>
                  </div>
                  <div className="absolute -bottom-4 bg-[#0F0F12] px-2 text-[9px] font-mono text-obsidian-accent animate-pulse">
                      VERIFICANDO CLÁUSULAS...
                  </div>
              </div>

              {/* Clauses */}
              <div className="space-y-3 flex-1">
                  {[
                      { label: 'Bloqueo de Precio: Fijo', checked: true },
                      { label: 'Penalización SLA: 5%', checked: true },
                      { label: 'Jurisdicción: Tribunal DAO', checked: true },
                      { label: 'Seguro de Envío', checked: false }
                  ].map((item, i) => (
                      <div key={i} className="flex items-center justify-between text-[10px] border-b border-white/[0.02] pb-2 last:border-0">
                          <span className="text-obsidian-text-secondary">{item.label}</span>
                          {item.checked ? (
                              <CheckCircle2 size={12} className="text-obsidian-success" />
                          ) : (
                              <div className="w-3 h-3 rounded-full border border-white/20"></div>
                          )}
                      </div>
                  ))}
              </div>

              {/* Escrow Vault */}
              <div className="mt-6 border border-red-500/20 bg-red-500/5 rounded p-4 relative overflow-hidden">
                  <div className="flex justify-between items-start mb-2 relative z-10">
                      <span className="text-[9px] text-red-400 uppercase tracking-widest font-medium flex items-center gap-1">
                          <Lock size={8} /> Bóveda Escrow
                      </span>
                      <span className="text-[9px] text-red-400/70 bg-red-500/10 px-1.5 py-0.5 rounded">BLOQUEADO</span>
                  </div>
                  <div className="text-2xl font-thin text-white tracking-tight relative z-10">
                      {selectedDeal.value.toLocaleString()} <span className="text-xs font-normal text-obsidian-text-muted">USDC</span>
                  </div>
                  
                  {/* Override Button */}
                  <button className="w-full mt-4 py-2 border border-red-500/30 text-[9px] text-red-400 hover:bg-red-500/10 hover:text-white transition-colors uppercase tracking-widest rounded relative z-10">
                      Anular & Firmar
                  </button>

                  {/* Stripe pattern */}
                  <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'repeating-linear-gradient(45deg, #000 0, #000 10px, #fff 10px, #fff 12px)' }}></div>
              </div>

              <div className="mt-4 pt-2 text-right">
                  <span className="text-[8px] font-mono text-obsidian-accent/50 block">HASH: 0x8f...2a9c</span>
              </div>
          </ObsidianCard>
      </div>

    </div>
  );
};

export default NegotiationHub;