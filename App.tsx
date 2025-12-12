import React, { useState, useEffect } from 'react';
import LoginForm from './components/LoginForm';
import { Sidebar } from './components/Sidebar';
import DTOLab from './components/DTOLab';
import SwarmOrchestrator from './components/SwarmOrchestrator';
import NegotiationHub from './components/NegotiationHub';
import AvatarStudio from './components/AvatarStudio';
import BionicSales from './components/BionicSales';
import NeuroFinance from './components/NeuroFinance';
import OntologyCore from './components/OntologyCore';
import SystemHealth from './components/SystemHealth';
import SSIVault from './components/SSIVault';
import { ObsidianCard } from './components/ui/ObsidianElements';
import type { AuthState, LoginFormData } from './types';
import { Hexagon, Zap, Globe, Cpu } from 'lucide-react';

// --- WAR ROOM COMPONENTS (Translated to Spanish) ---

// 1. Topology Graph (GenUI 3.0 Spatial View)
const TopologyGraph = () => {
  return (
    <div className="w-full h-full relative group perspective-1000">
      <div 
        className="w-full h-full flex items-center justify-center transform transition-transform duration-700 ease-out group-hover:rotate-x-2 group-hover:rotate-y-2"
        style={{ transformStyle: 'preserve-3d' }}
      >
        <svg className="w-full h-full opacity-80" viewBox="0 0 800 500">
          <defs>
             <radialGradient id="nodeGlow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#6A4FFB" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#6A4FFB" stopOpacity="0" />
             </radialGradient>
          </defs>
          <g stroke="#BEBEC6" strokeOpacity="0.05" strokeWidth="0.5">
            <line x1="0" y1="250" x2="800" y2="250" />
            <line x1="400" y1="0" x2="400" y2="500" />
            <circle cx="400" cy="250" r="100" fill="none" />
            <circle cx="400" cy="250" r="200" fill="none" />
          </g>
          <g className="animate-pulse-slow">
             <path d="M400,250 L200,150 L250,350 L400,250 L600,200 L550,400 L400,250" stroke="#BEBEC6" strokeOpacity="0.15" strokeWidth="1" fill="none" />
             <path d="M200,150 L100,200" stroke="#BEBEC6" strokeOpacity="0.1" strokeWidth="1" />
             <path d="M600,200 L700,150" stroke="#BEBEC6" strokeOpacity="0.1" strokeWidth="1" />
             <circle cx="400" cy="250" r="3" fill="#6A4FFB" />
             <circle cx="400" cy="250" r="8" fill="url(#nodeGlow)" className="animate-ping" style={{animationDuration: '3s'}} />
             <circle cx="200" cy="150" r="2" fill="#BEBEC6" fillOpacity="0.5" />
             <circle cx="250" cy="350" r="2" fill="#BEBEC6" fillOpacity="0.5" />
             <circle cx="600" cy="200" r="2" fill="#BEBEC6" fillOpacity="0.5" />
             <circle cx="550" cy="400" r="2" fill="#BEBEC6" fillOpacity="0.5" />
             <circle cx="100" cy="200" r="1.5" fill="#45FF9A" className="animate-pulse" />
             <circle cx="700" cy="150" r="1.5" fill="#6A4FFB" className="animate-pulse" />
          </g>
        </svg>
      </div>
    </div>
  );
};

// 2. The Stream (Terminal Logs)
const TheStream = () => {
  const [logs, setLogs] = useState([
    { id: 1, time: '10:42:01', source: 'SWARM-A', msg: 'Iniciando escaneo perimetral...' },
    { id: 2, time: '10:42:05', source: 'CORE', msg: 'Enlace Neural establecido.' },
    { id: 3, time: '10:42:08', source: 'AGENT-7', msg: 'Probabilidad de cualificación > 88%.' },
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      const sources = ['SWARM-B', 'AGENT-9', 'AUDIT-CORE', 'SALES-BOT', 'NET-WATCH'];
      const messages = [
         'Analizando 400 endpoints de competidores...',
         'Negociación iniciada con ID_Client_99.',
         'Transacción #882 verificada. Smart Contract ejecutado.',
         'Latencia de red optimizada (-4ms).',
         'Nuevo patrón de comportamiento detectado en Sector 4.'
      ];
      
      const newLog = {
        id: Date.now(),
        time: new Date().toLocaleTimeString('es-ES', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        source: sources[Math.floor(Math.random() * sources.length)],
        msg: messages[Math.floor(Math.random() * messages.length)]
      };

      setLogs(prev => [...prev.slice(-6), newLog]);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="h-full w-full font-mono text-[11px] text-obsidian-text-muted relative overflow-hidden flex flex-col justify-end">
       <div className="absolute top-0 left-0 right-0 h-10 bg-gradient-to-b from-[#0F0F12] to-transparent z-10 pointer-events-none"></div>
       <div className="space-y-1.5 pb-2">
         {logs.map(log => (
           <div key={log.id} className="flex gap-3 opacity-80 hover:opacity-100 transition-opacity">
             <span className="opacity-50">[{log.time}]</span>
             <span className={log.source.includes('CORE') ? 'text-obsidian-accent' : 'text-obsidian-text-secondary'}>{log.source}:</span>
             <span className="truncate">{log.msg}</span>
           </div>
         ))}
       </div>
    </div>
  );
};

// 3. Radial Pulse Chart
const SwarmHealth = () => {
  return (
    <div className="flex flex-col items-center justify-center h-full relative">
      <div className="relative w-32 h-32 flex items-center justify-center">
        <svg className="absolute inset-0 w-full h-full rotate-[-90deg]">
          <circle cx="64" cy="64" r="62" stroke="#FFFFFF" strokeOpacity="0.1" strokeWidth="0.5" fill="none" />
          <circle cx="64" cy="64" r="62" stroke="#6A4FFB" strokeWidth="0.5" fill="none" strokeDasharray="390" strokeDashoffset="100" strokeLinecap="round" className="animate-[spin_10s_linear_infinite]" />
        </svg>
        <svg className="absolute inset-0 w-full h-full rotate-[-90deg] p-4">
          <circle cx="64" cy="64" r="45" stroke="#FFFFFF" strokeOpacity="0.05" strokeWidth="2" fill="none" />
          <circle cx="64" cy="64" r="45" stroke="#FFFFFF" strokeOpacity="0.8" strokeWidth="2" fill="none" strokeDasharray="280" strokeDashoffset="60" />
        </svg>
        <div className="text-center z-10">
          <div className="text-2xl font-thin text-white tracking-tighter">86<span className="text-sm text-obsidian-text-muted">%</span></div>
        </div>
      </div>
      <div className="mt-4 text-center">
        <p className="text-[10px] uppercase tracking-widest text-obsidian-text-muted mb-3">432/500 Agentes</p>
        <button className="px-4 py-1.5 border border-white/20 text-[10px] text-white font-medium tracking-[2px] hover:bg-white hover:text-black hover:border-white transition-all duration-300 uppercase">
          Desplegar Reserva
        </button>
      </div>
    </div>
  );
};

// --- WAR ROOM DASHBOARD PAGE ---

const WarRoomDashboard: React.FC = () => {
  const [ticker, setTicker] = useState(45230);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setTicker(prev => prev + (Math.random() > 0.5 ? 5 : -2));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full h-screen px-6 py-6 flex items-center justify-center overflow-hidden relative">
      {/* Background Ambient Glows */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-obsidian-accent/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-obsidian-success/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Main Grid */}
      <div className="w-full max-w-[1600px] h-full max-h-[900px] grid grid-cols-12 grid-rows-12 gap-6 relative z-10 animate-[fadeIn_0.5s_ease-out]">
        
        {/* -- TOP HEADER -- */}
        <div className="col-span-12 row-span-1 flex justify-between items-start">
           <div className="flex items-center gap-2 opacity-50">
             <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
             <span className="text-[10px] tracking-[0.3em] font-light uppercase">Obsidian OS v3.0 // Sala de Guerra</span>
           </div>
        </div>

        {/* -- LEFT PANEL: METRICS -- */}
        <div className="col-span-12 md:col-span-3 row-span-11 flex flex-col gap-6 animate-[fadeIn_0.8s_ease-out_0.2s_both]">
          <div className="flex-1 flex flex-col justify-center border-l border-white/[0.06] pl-6">
             <span className="text-xs text-obsidian-text-muted tracking-widest uppercase mb-2">Ingresos Proyectados</span>
             <div className="flex items-start gap-2">
               <h2 className="text-[56px] leading-[0.9] font-thin text-white tracking-[-1px] tabular-nums">
                 ${ticker.toLocaleString()}
               </h2>
               <div className="w-1 h-1 bg-obsidian-success rounded-full shadow-[0_0_8px_#45FF9A] mt-4 animate-pulse"></div>
             </div>
             <p className="text-[11px] text-obsidian-text-muted mt-2 font-mono">
               +12.4% vs Objetivo <span className="opacity-30">|</span> Ajuste Mensual
             </p>
          </div>

          <div className="flex-1 flex flex-col justify-center border-l border-white/[0.06] pl-6 opacity-60 hover:opacity-100 transition-opacity">
             <span className="text-xs text-obsidian-text-muted tracking-widest uppercase mb-2">Cashflow Enjambre</span>
             <h2 className="text-[42px] leading-[0.9] font-thin text-white tracking-[-1px] tabular-nums">
               $12,840
             </h2>
             <p className="text-[11px] text-obsidian-text-muted mt-2 font-mono">
               Flujo de Caja Libre
             </p>
          </div>

          <div className="h-32 flex flex-col justify-end border-l border-white/[0.06] pl-6 pb-4">
             <div className="flex items-center gap-2 mb-1">
                <Globe size={14} className="text-obsidian-text-muted" />
                <span className="text-[10px] text-white uppercase tracking-widest">Latencia Global</span>
             </div>
             <div className="text-2xl font-thin">24ms</div>
          </div>
        </div>

        {/* -- CENTER: TOPOLOGY -- */}
        <ObsidianCard className="col-span-12 md:col-span-6 row-span-8 animate-[fadeIn_1s_ease-out_0.4s_both]" noPadding>
           <TopologyGraph />
           <div className="absolute top-4 left-4">
              <div className="flex items-center gap-2">
                 <Hexagon size={14} className="text-obsidian-accent" />
                 <span className="text-[10px] uppercase tracking-[0.2em] text-white/80">Topología de Mercado</span>
              </div>
           </div>
        </ObsidianCard>

        {/* -- RIGHT: HEALTH & NOTIFICATIONS -- */}
        <div className="col-span-12 md:col-span-3 row-span-11 flex flex-col gap-6 animate-[fadeIn_0.8s_ease-out_0.6s_both]">
           <ObsidianCard className="h-auto p-5 border-t border-white/10">
              <div className="flex items-start gap-3">
                 <div className="mt-1">
                    <Zap size={16} className="text-obsidian-accent" fill="currentColor" fillOpacity={0.2} />
                 </div>
                 <div>
                    <h4 className="text-white text-sm font-light leading-tight mb-2">Oportunidad de Arbitraje</h4>
                    <p className="text-xs text-obsidian-text-secondary leading-relaxed font-light mb-3">
                       Detectada en sector retail. Probabilidad 94%. Umbral de riesgo validado.
                    </p>
                    <a href="#" className="text-[10px] text-obsidian-accent border-b border-obsidian-accent/30 pb-0.5 hover:text-white hover:border-white transition-colors">
                       Simular en DTO
                    </a>
                 </div>
              </div>
           </ObsidianCard>

           <ObsidianCard className="flex-1" active>
              <div className="absolute top-4 right-4">
                 <Cpu size={14} className="text-obsidian-text-muted" />
              </div>
              <SwarmHealth />
           </ObsidianCard>
           
           <div className="h-24 bg-white/[0.02] border border-white/[0.04] rounded flex items-center justify-between px-6">
              <div>
                 <div className="text-[10px] text-obsidian-text-muted uppercase tracking-widest mb-1">Uptime</div>
                 <div className="text-xl font-thin text-white">99.99%</div>
              </div>
              <div className="h-8 w-[1px] bg-white/[0.1]"></div>
              <div>
                 <div className="text-[10px] text-obsidian-text-muted uppercase tracking-widest mb-1">Carga</div>
                 <div className="text-xl font-thin text-white">42%</div>
              </div>
           </div>
        </div>

        {/* -- BOTTOM: STREAM -- */}
        <ObsidianCard className="col-span-12 md:col-span-6 row-span-3 animate-[fadeIn_1s_ease-out_0.8s_both]" noPadding>
           <div className="h-full w-full p-4 bg-black/20">
              <div className="flex items-center gap-2 mb-2 border-b border-white/[0.04] pb-2">
                 <div className="w-1.5 h-1.5 rounded-full bg-obsidian-text-muted animate-pulse"></div>
                 <span className="text-[9px] uppercase tracking-[0.2em] text-obsidian-text-muted font-mono">Registro de Ejecución</span>
              </div>
              <TheStream />
           </div>
        </ObsidianCard>
      </div>
    </div>
  );
};

// --- MAIN APP LOGIC ---

const App: React.FC = () => {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    isLoading: false,
    error: null,
  });

  const [currentView, setCurrentView] = useState<'war-room' | 'dto-lab' | 'swarm-orchestrator' | 'negotiation-hub' | 'avatar-studio' | 'bionic-sales' | 'neuro-finance' | 'ontology-core' | 'system-health' | 'ssi-vault'>('war-room');

  const handleLogin = (data: LoginFormData) => {
    setAuthState((prev) => ({ ...prev, isLoading: true, error: null }));
    
    // Simulate API delay
    setTimeout(() => {
      // STRICT MOCK VALIDATION
      if (data.email === 'admin@obsidian.ai' && data.pass === '123456') {
        setAuthState({
          isAuthenticated: true,
          user: { id: '1', name: 'Comandante', email: data.email },
          isLoading: false,
          error: null,
        });
      } else {
        setAuthState((prev) => ({
          ...prev,
          isLoading: false,
          error: 'Credenciales inválidas. Usa la cuenta Demo.',
        }));
      }
    }, 1500);
  };

  const handleLogout = () => {
    setAuthState({
      isAuthenticated: false,
      user: null,
      isLoading: false,
      error: null,
    });
    setCurrentView('war-room');
  };

  if (authState.isAuthenticated) {
    return (
        <div className="bg-[#0B0B0D] min-h-screen text-obsidian-text-primary font-sans flex">
            <Sidebar 
                currentView={currentView} 
                onChangeView={setCurrentView} 
                onLogout={handleLogout} 
            />
            
            <main className="flex-1 h-screen overflow-hidden bg-[#0B0B0D]">
                {currentView === 'war-room' && <WarRoomDashboard />}
                {currentView === 'dto-lab' && <DTOLab />}
                {currentView === 'swarm-orchestrator' && <SwarmOrchestrator />}
                {currentView === 'negotiation-hub' && <NegotiationHub />}
                {currentView === 'avatar-studio' && <AvatarStudio />}
                {currentView === 'bionic-sales' && <BionicSales />}
                {currentView === 'neuro-finance' && <NeuroFinance />}
                {currentView === 'ontology-core' && <OntologyCore />}
                {currentView === 'system-health' && <SystemHealth />}
                {currentView === 'ssi-vault' && <SSIVault />}
            </main>
        </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B0B0D] relative flex items-center justify-center overflow-hidden font-sans selection:bg-white/20 selection:text-white">
      {/* Background Grid Pattern */}
      <div 
        className="absolute inset-0 z-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)`,
          backgroundSize: '40px 40px'
        }}
      />
      
      {/* Background Vignette */}
      <div className="absolute inset-0 bg-radial-gradient from-transparent via-[#0B0B0D]/80 to-[#0B0B0D] z-0 pointer-events-none" />

      <LoginForm 
        onLogin={handleLogin} 
        isLoading={authState.isLoading}
        error={authState.error}
      />
    </div>
  );
};

export default App;