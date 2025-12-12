import React, { useState, useEffect, useRef } from 'react';
import { ObsidianCard, ObsidianButton } from './ui/ObsidianElements';
import { BrainCircuit, Mic, PhoneOff, Zap, User, AlertTriangle, Fingerprint, Activity, MousePointer2 } from 'lucide-react';

const BionicSales: React.FC = () => {
  const [sentiment, setSentiment] = useState<'NEUTRAL' | 'BUYING' | 'HOSTILE'>('NEUTRAL');
  const [teleprompterText, setTeleprompterText] = useState("Explícale cómo nuestra arquitectura reduce costos operativos en un 40%.");
  const [isAlert, setIsAlert] = useState(false);
  const [closingProb, setClosingProb] = useState(62);
  const [voiceTremor, setVoiceTremor] = useState(false);

  // --- Simulation Logic ---
  useEffect(() => {
    // Sequence of conversation events
    const timeline = [
      { t: 0, s: 'NEUTRAL', txt: "Explícale cómo nuestra arquitectura reduce costos operativos en un 40%.", alert: false, prob: 62 },
      { t: 4000, s: 'NEUTRAL', txt: "Menciona el caso de éxito de 'Global Tech' como validación social.", alert: false, prob: 65 },
      { t: 8000, s: 'HOSTILE', txt: "¡ALTO! No menciones el precio aún. Validar su preocupación sobre la seguridad primero.", alert: true, prob: 45 },
      { t: 14000, s: 'NEUTRAL', txt: "Bien recuperado. Ahora presenta el Certificado ISO 27001.", alert: false, prob: 58 },
      { t: 19000, s: 'BUYING', txt: "Señal de compra detectada. Cierra el trato ahora. No sigas vendiendo.", alert: false, prob: 89 },
    ];

    let timeouts: ReturnType<typeof setTimeout>[] = [];

    timeline.forEach(event => {
      const timeout = setTimeout(() => {
        setSentiment(event.s as any);
        setTeleprompterText(event.txt);
        setIsAlert(event.alert);
        setClosingProb(event.prob);
        if(event.alert) {
            setVoiceTremor(true);
            setTimeout(() => setVoiceTremor(false), 2000);
        }
      }, event.t);
      timeouts.push(timeout);
    });

    return () => timeouts.forEach(clearTimeout);
  }, []);

  // --- Visual Halo Color ---
  const getHaloColor = () => {
      switch(sentiment) {
          case 'BUYING': return 'shadow-[inset_0_0_80px_rgba(69,255,154,0.15)] border-[#45FF9A]/30';
          case 'HOSTILE': return 'shadow-[inset_0_0_80px_rgba(255,107,107,0.15)] border-[#FF6B6B]/30';
          default: return 'shadow-[inset_0_0_80px_rgba(106,79,251,0.05)] border-white/[0.04]';
      }
  };

  return (
    <div className="w-full h-screen bg-[#0B0B0D] text-obsidian-text-primary px-6 py-6 flex gap-6 overflow-hidden relative font-sans">
      
      {/* --- COLUMNA IZQUIERDA: ACTIVE CALL SWARM --- */}
      <div className="w-[20%] flex flex-col gap-4 animate-[fadeIn_0.5s_ease-out]">
        <div className="flex items-center gap-2 mb-2 px-1">
             <Activity size={14} className="text-obsidian-text-muted" />
             <span className="text-[10px] text-obsidian-text-muted uppercase tracking-[0.2em] font-medium">Active Call Swarm</span>
        </div>
        
        <div className="flex-1 flex flex-col gap-3 overflow-y-auto pr-1">
            {[1, 2, 3, 4].map((call, i) => (
                <div key={call} className={`group relative p-3 rounded-lg border bg-[#0F0F12]/60 hover:bg-white/[0.04] transition-all duration-300 ${i === 1 ? 'border-obsidian-accent/50 shadow-[0_0_15px_rgba(106,79,251,0.15)]' : 'border-white/[0.04]'}`}>
                    <div className="flex gap-3 mb-2">
                        {/* Avatar / Photo Placeholder */}
                        <div className="w-10 h-10 rounded bg-[#16161A] flex items-center justify-center relative overflow-hidden">
                             <User size={16} className="text-obsidian-text-muted opacity-50" />
                             {i === 1 && <div className="absolute top-0 right-0 w-2 h-2 bg-obsidian-accent rounded-full shadow-[0_0_5px_#6A4FFB]"></div>}
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="text-xs text-white font-light">Lead #{204 + i}</span>
                                {i === 1 && <span className="text-[8px] bg-obsidian-accent/20 text-obsidian-accent px-1 rounded">VIP</span>}
                            </div>
                            <span className="text-[10px] text-obsidian-text-muted block mt-0.5">Closing Phase</span>
                        </div>
                    </div>
                    <div className="flex justify-between items-center border-t border-white/[0.04] pt-2 mt-2">
                        <span className="text-[11px] font-mono text-white/80">$5,000</span>
                        <button className="text-[9px] bg-white/[0.05] hover:bg-white/[0.1] text-obsidian-text-muted hover:text-white px-2 py-1 rounded transition-colors uppercase tracking-wider flex items-center gap-1">
                            <Zap size={8} /> Take Over
                        </button>
                    </div>
                </div>
            ))}
        </div>
      </div>

      {/* --- PANEL CENTRAL: THE BIO-FEED (Video & AR) --- */}
      <div className="w-[60%] flex flex-col relative animate-[fadeIn_0.5s_ease-out_0.2s_both]">
         <ObsidianCard 
            className={`flex-1 relative overflow-hidden transition-all duration-1000 ${getHaloColor()}`} 
            noPadding
         >
             {/* Simulated Video Background */}
             <div className="absolute inset-0 bg-[#08080A] flex items-center justify-center overflow-hidden">
                 {/* This represents the "Client Video" - Abstract silhouette for demo */}
                 <div className="relative w-64 h-80 opacity-80">
                     <svg viewBox="0 0 200 250" className="w-full h-full drop-shadow-2xl">
                         <defs>
                             <linearGradient id="faceGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                                 <stop offset="0%" stopColor="#1A1A1D" />
                                 <stop offset="100%" stopColor="#0B0B0D" />
                             </linearGradient>
                         </defs>
                         <path d="M100,40 C140,40 160,80 160,130 C160,190 130,220 100,220 C70,220 40,190 40,130 C40,80 60,40 100,40 Z" fill="url(#faceGrad)" />
                     </svg>
                     
                     {/* FACE MESH OVERLAY */}
                     <svg viewBox="0 0 200 250" className="absolute inset-0 w-full h-full mix-blend-screen pointer-events-none">
                         {/* Grid Points */}
                         <g fill={sentiment === 'HOSTILE' ? '#FF6B6B' : sentiment === 'BUYING' ? '#45FF9A' : '#6A4FFB'} fillOpacity="0.4">
                             {Array.from({length: 40}).map((_, i) => (
                                 <circle 
                                    key={i} 
                                    cx={60 + (i % 5) * 20 + Math.random()*5} 
                                    cy={80 + Math.floor(i / 5) * 15 + Math.random()*5} 
                                    r={0.8}
                                    className="animate-pulse"
                                    style={{ animationDuration: `${1 + Math.random()}s` }}
                                 />
                             ))}
                         </g>
                         {/* Jawline / Structure Lines */}
                         <path d="M50,130 Q100,230 150,130" fill="none" stroke="white" strokeOpacity="0.1" strokeWidth="0.5" strokeDasharray="2 2" />
                         <path d="M100,40 L100,220" fill="none" stroke="white" strokeOpacity="0.05" strokeWidth="0.5" />
                         <path d="M40,130 L160,130" fill="none" stroke="white" strokeOpacity="0.05" strokeWidth="0.5" />
                     </svg>
                 </div>
             </div>

             {/* AR Telemetry (Floating Tags) */}
             <div className="absolute top-[20%] right-[15%] flex flex-col gap-2 pointer-events-none z-10">
                 <div className="bg-[#0F0F12]/40 backdrop-blur-md border border-white/[0.1] px-3 py-1.5 rounded flex items-center gap-3 w-40">
                     <span className="text-[9px] text-obsidian-text-muted uppercase tracking-widest w-12">Trust</span>
                     <div className="flex-1 h-1 bg-white/[0.1] rounded-full overflow-hidden">
                         <div className="h-full bg-obsidian-success transition-all duration-1000" style={{ width: '78%' }}></div>
                     </div>
                     <span className="text-[9px] font-mono text-white">78%</span>
                 </div>
                 <div className="bg-[#0F0F12]/40 backdrop-blur-md border border-white/[0.1] px-3 py-1.5 rounded flex items-center gap-3 w-40">
                     <span className="text-[9px] text-obsidian-text-muted uppercase tracking-widest w-12">Stress</span>
                     <div className="flex-1 h-1 bg-white/[0.1] rounded-full overflow-hidden">
                         <div className={`h-full transition-all duration-1000 ${isAlert ? 'bg-red-500 w-[60%]' : 'bg-gray-500 w-[12%]'}`}></div>
                     </div>
                     <span className="text-[9px] font-mono text-white">{isAlert ? '60%' : '12%'}</span>
                 </div>
             </div>
             
             <div className="absolute top-[25%] left-[15%] pointer-events-none z-10">
                <div className="bg-[#0F0F12]/40 backdrop-blur-md border border-white/[0.1] px-3 py-1.5 rounded">
                     <span className="text-[9px] text-obsidian-text-muted uppercase tracking-widest block mb-1">Engagement</span>
                     <span className={`text-xs font-medium tracking-wider ${sentiment === 'BUYING' ? 'text-obsidian-success' : 'text-white'}`}>
                        {sentiment === 'BUYING' ? 'PEAK DETECTED' : 'HIGH'}
                     </span>
                </div>
             </div>

             {/* Voice Analysis Wave */}
             <div className="absolute bottom-10 left-0 right-0 flex justify-center items-end h-16 gap-1 px-20 pointer-events-none">
                 {Array.from({length: 40}).map((_, i) => (
                     <div 
                        key={i} 
                        className={`w-1 rounded-t-sm transition-all duration-100 ${voiceTremor ? 'bg-amber-500 shadow-[0_0_10px_orange]' : 'bg-white/[0.2]'}`}
                        style={{ 
                            height: `${Math.max(10, Math.random() * (voiceTremor ? 60 : 30))}%`,
                            opacity: Math.max(0.3, 1 - Math.abs(20 - i) / 20) 
                        }}
                     ></div>
                 ))}
                 {voiceTremor && (
                     <div className="absolute -top-6 bg-amber-500/10 border border-amber-500/50 px-2 py-0.5 rounded text-[9px] text-amber-500 font-bold uppercase tracking-widest animate-pulse">
                         Duda Vocal Detectada (300ms)
                     </div>
                 )}
             </div>

             {/* Bottom Controls Overlay */}
             <div className="absolute bottom-6 left-6 right-6 flex justify-between items-end z-20">
                 <div className="flex gap-2">
                     <button className="w-8 h-8 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-500 hover:bg-red-500 hover:text-white transition-all">
                         <PhoneOff size={14} />
                     </button>
                     <button className="w-8 h-8 rounded-full bg-white/[0.05] border border-white/[0.1] flex items-center justify-center text-white hover:bg-white/[0.1] transition-all">
                         <Mic size={14} />
                     </button>
                 </div>
                 <div className="bg-[#0F0F12]/80 backdrop-blur border border-white/[0.1] px-3 py-1 rounded-full flex items-center gap-2">
                     <div className={`w-1.5 h-1.5 rounded-full ${sentiment === 'NEUTRAL' ? 'bg-blue-400' : sentiment === 'BUYING' ? 'bg-obsidian-success animate-ping' : 'bg-red-500'}`}></div>
                     <span className="text-[10px] text-white font-mono uppercase tracking-wider">
                         {sentiment === 'NEUTRAL' ? 'ANALYZING...' : sentiment === 'BUYING' ? 'BUYING SIGNAL' : 'HOSTILE DETECTED'}
                     </span>
                 </div>
             </div>
         </ObsidianCard>
      </div>

      {/* --- COLUMNA DERECHA: CYRANO LNN CORE --- */}
      <div className="w-[20%] flex flex-col gap-6 animate-[fadeIn_0.5s_ease-out_0.4s_both]">
         <ObsidianCard className="flex-1 flex flex-col relative overflow-hidden">
             
             {/* Closing Probability (Background) */}
             <div className="absolute top-10 right-0 text-[80px] font-thin text-white/[0.03] leading-none pointer-events-none select-none -z-0">
                 {closingProb}%
             </div>

             {/* Header */}
             <div className="flex items-center gap-2 mb-6 z-10">
                 <BrainCircuit size={14} className="text-obsidian-accent" />
                 <span className="text-[10px] uppercase tracking-[0.2em] text-white/80 font-medium">Cyrano LNN Core</span>
             </div>

             {/* Teleprompter */}
             <div className="flex-1 z-10 flex flex-col">
                 <label className="text-[10px] uppercase tracking-widest text-obsidian-text-muted mb-3 flex justify-between">
                     <span>Suggested Script</span>
                     {isAlert && <AlertTriangle size={12} className="text-red-500 animate-pulse" />}
                 </label>
                 
                 <div className={`
                    p-4 border rounded-lg min-h-[140px] flex items-center transition-all duration-300
                    ${isAlert 
                        ? 'bg-red-500/10 border-red-500/50 shadow-[0_0_20px_rgba(255,107,107,0.1)]' 
                        : 'bg-white/[0.03] border-white/[0.1]'}
                 `}>
                     <p className={`text-base font-medium leading-relaxed transition-colors duration-300 ${isAlert ? 'text-red-200' : 'text-white'}`}>
                         {isAlert ? (
                             <span className="flex items-start gap-2">
                                <span className="mt-1"><AlertTriangle size={16} /></span>
                                {teleprompterText}
                             </span>
                         ) : (
                             teleprompterText
                         )}
                     </p>
                 </div>

                 {/* Objection Cards */}
                 <div className="mt-6 space-y-3">
                     <label className="text-[10px] uppercase tracking-widest text-obsidian-text-muted mb-1 block">Play Cards (Tactics)</label>
                     {[
                         { txt: 'Offer 5% Discount', type: 'offer' },
                         { txt: 'Show "Safe Harbor" Slide', type: 'tactic' },
                         { txt: 'Ask: "What is your budget?"', type: 'question' }
                     ].map((card, i) => (
                         <button 
                            key={i}
                            className="w-full text-left px-3 py-3 bg-[#16161A] border border-white/[0.06] rounded hover:border-obsidian-accent hover:bg-white/[0.04] transition-all group flex items-center justify-between"
                         >
                             <span className="text-[11px] text-obsidian-text-secondary group-hover:text-white transition-colors">{card.txt}</span>
                             <MousePointer2 size={10} className="opacity-0 group-hover:opacity-100 text-obsidian-accent transition-opacity transform rotate-[-45deg]" />
                         </button>
                     ))}
                 </div>
             </div>

             {/* Flash Insight Effect */}
             {!isAlert && closingProb > 80 && (
                 <div className="absolute inset-0 bg-white/5 animate-[pulse_0.2s_ease-in-out] pointer-events-none"></div>
             )}
         </ObsidianCard>
      </div>

    </div>
  );
};

export default BionicSales;