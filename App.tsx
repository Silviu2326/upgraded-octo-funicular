import React, { useState } from 'react';
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
import ContentSocialStudio from './components/ContentSocialStudio';
import { ObsidianCard } from './components/ui/ObsidianElements';
import type { AuthState, LoginFormData } from './types';
import { Wifi, WifiOff, Activity } from 'lucide-react';
import { useWarRoom } from './hooks/useWarRoom';
import {
  KPIPanel,
  SwarmStatusPanel,
  EventStream,
  OpportunitiesPanel,
  AlertsPanel,
  RevenueChart,
  SystemMetrics,
  MarketTopology
} from './components/WarRoom';

// --- WAR ROOM DASHBOARD PAGE ---

const WarRoomDashboard: React.FC = () => {
  const {
    connected,
    kpis,
    swarms,
    events,
    opportunities,
    alerts,
    controlSwarm,
    markAlertAsRead
  } = useWarRoom();

  const [activeTab, setActiveTab] = useState<'overview' | 'swarms' | 'alerts'>('overview');

  return (
    <div className="w-full h-screen px-6 py-6 flex items-center justify-center overflow-hidden relative">
      {/* Background Ambient Glows */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-obsidian-accent/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-obsidian-success/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Main Grid */}
      <div className="w-full max-w-[1600px] h-full max-h-[900px] grid grid-cols-12 grid-rows-12 gap-6 relative z-10 animate-[fadeIn_0.5s_ease-out]">

        {/* -- TOP HEADER -- */}
        <div className="col-span-12 row-span-1 flex justify-between items-start">
           <div className="flex items-center gap-3">
             <div className="flex items-center gap-2 opacity-50">
               <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></div>
               <span className="text-[10px] tracking-[0.3em] font-light uppercase">Obsidian OS v3.0 // War Room</span>
             </div>
             <div className="flex items-center gap-2">
               {connected ? (
                 <>
                   <Wifi size={12} className="text-obsidian-success" />
                   <span className="text-[9px] text-obsidian-success uppercase tracking-wider">En Línea</span>
                 </>
               ) : (
                 <>
                   <WifiOff size={12} className="text-red-400" />
                   <span className="text-[9px] text-red-400 uppercase tracking-wider">Desconectado</span>
                 </>
               )}
             </div>
           </div>

           {/* Tabs */}
           <div className="flex gap-2">
             <button
               onClick={() => setActiveTab('overview')}
               className={`px-3 py-1 text-[10px] uppercase tracking-wider transition-colors ${
                 activeTab === 'overview'
                   ? 'text-white border-b-2 border-obsidian-accent'
                   : 'text-obsidian-text-muted hover:text-white'
               }`}
             >
               Overview
             </button>
             <button
               onClick={() => setActiveTab('swarms')}
               className={`px-3 py-1 text-[10px] uppercase tracking-wider transition-colors ${
                 activeTab === 'swarms'
                   ? 'text-white border-b-2 border-obsidian-accent'
                   : 'text-obsidian-text-muted hover:text-white'
               }`}
             >
               Enjambres ({swarms.length})
             </button>
             <button
               onClick={() => setActiveTab('alerts')}
               className={`px-3 py-1 text-[10px] uppercase tracking-wider transition-colors relative ${
                 activeTab === 'alerts'
                   ? 'text-white border-b-2 border-obsidian-accent'
                   : 'text-obsidian-text-muted hover:text-white'
               }`}
             >
               Alertas
               {alerts.filter(a => !a.read).length > 0 && (
                 <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-400 rounded-full animate-pulse" />
               )}
             </button>
           </div>
        </div>

        {/* -- CONTENT BASED ON ACTIVE TAB -- */}
        {activeTab === 'overview' && (
          <>
            {/* -- LEFT PANEL: METRICS -- */}
            <div className="col-span-12 md:col-span-3 row-span-11 animate-[fadeIn_0.8s_ease-out_0.2s_both]">
              <KPIPanel kpis={kpis} />
            </div>

            {/* -- CENTER: TOPOLOGY & EVENTS -- */}
            <div className="col-span-12 md:col-span-6 row-span-11 flex flex-col gap-6 animate-[fadeIn_1s_ease-out_0.4s_both]">
              {/* Market Topology */}
              <ObsidianCard className="flex-[2] p-5">
                <MarketTopology kpis={kpis} opportunities={opportunities} />
              </ObsidianCard>

              {/* Event Stream */}
              <ObsidianCard className="flex-[1.5]" noPadding>
                <div className="h-full w-full p-4 bg-black/20">
                  <EventStream events={events} />
                </div>
              </ObsidianCard>
            </div>

            {/* -- RIGHT: OPPORTUNITIES & METRICS -- */}
            <div className="col-span-12 md:col-span-3 row-span-11 flex flex-col gap-6 animate-[fadeIn_0.8s_ease-out_0.6s_both]">
              {/* Opportunities */}
              <div className="flex-1 overflow-y-auto">
                <OpportunitiesPanel opportunities={opportunities} />
              </div>

              {/* System Metrics */}
              <ObsidianCard className="h-[380px]" active>
                <SystemMetrics kpis={kpis} />
              </ObsidianCard>
            </div>
          </>
        )}

        {activeTab === 'swarms' && (
          <>
            {/* Swarms Grid */}
            <div className="col-span-12 row-span-11 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 overflow-y-auto p-2 animate-[fadeIn_0.5s_ease-out]">
              <SwarmStatusPanel swarms={swarms} onControlSwarm={controlSwarm} />
            </div>
          </>
        )}

        {activeTab === 'alerts' && (
          <>
            {/* Alerts Panel */}
            <div className="col-span-12 md:col-span-8 md:col-start-3 row-span-11 overflow-y-auto p-2 animate-[fadeIn_0.5s_ease-out]">
              <AlertsPanel alerts={alerts} onMarkAsRead={markAlertAsRead} />
            </div>
          </>
        )}
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

  const [currentView, setCurrentView] = useState<'war-room' | 'dto-lab' | 'swarm-orchestrator' | 'negotiation-hub' | 'avatar-studio' | 'content-social' | 'bionic-sales' | 'neuro-finance' | 'ontology-core' | 'system-health' | 'ssi-vault'>('war-room');

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
                {currentView === 'content-social' && <ContentSocialStudio />}
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