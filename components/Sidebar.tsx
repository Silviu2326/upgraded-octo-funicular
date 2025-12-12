import React, { useState } from 'react';
import { LayoutDashboard, FlaskConical, Settings, LogOut, Network, Briefcase, ScanFace, BrainCircuit, Scale, Share2, HeartPulse, Fingerprint, ChevronRight, ChevronLeft } from 'lucide-react';

interface SidebarProps {
  currentView: 'war-room' | 'dto-lab' | 'swarm-orchestrator' | 'negotiation-hub' | 'avatar-studio' | 'bionic-sales' | 'neuro-finance' | 'ontology-core' | 'system-health' | 'ssi-vault';
  onChangeView: (view: 'war-room' | 'dto-lab' | 'swarm-orchestrator' | 'negotiation-hub' | 'avatar-studio' | 'bionic-sales' | 'neuro-finance' | 'ontology-core' | 'system-health' | 'ssi-vault') => void;
  onLogout: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentView, onChangeView, onLogout }) => {
  const [isCollapsed, setIsCollapsed] = useState(true);

  const navSections = [
    {
      title: 'COMMAND',
      items: [
        { id: 'war-room', label: 'War Room', icon: <LayoutDashboard size={20} /> },
        { id: 'dto-lab', label: 'DTO Lab', icon: <FlaskConical size={20} /> },
      ]
    },
    {
      title: 'SWARMS',
      items: [
        { id: 'swarm-orchestrator', label: 'Active Agents', icon: <Network size={20} /> },
        { id: 'negotiation-hub', label: 'Negotiation (MNP)', icon: <Briefcase size={20} /> },
      ]
    },
    {
      title: 'GROWTH',
      items: [
        { id: 'avatar-studio', label: 'Avatar Studio', icon: <ScanFace size={20} /> },
        { id: 'bionic-sales', label: 'Bionic Sales', icon: <BrainCircuit size={20} /> },
      ]
    },
    {
      title: 'BACKBONE',
      items: [
        { id: 'neuro-finance', label: 'Neuro-Finance', icon: <Scale size={20} /> },
        { id: 'ontology-core', label: 'Ontologies', icon: <Share2 size={20} /> },
        { id: 'system-health', label: 'Health & Audit', icon: <HeartPulse size={20} /> },
        { id: 'ssi-vault', label: 'SSI Security', icon: <Fingerprint size={20} /> },
      ]
    }
  ];

  return (
    <aside 
      className={`
        sticky top-0 h-screen flex flex-col items-center bg-[#0F0F12]/95 backdrop-blur-xl border-r border-white/[0.04] z-50 
        transition-all duration-300 ease-in-out shadow-[5px_0_30px_rgba(0,0,0,0.5)] flex-shrink-0
        ${isCollapsed ? 'w-20' : 'w-64'}
      `}
    >
      
      {/* Toggle Button */}
      <button 
        onClick={() => setIsCollapsed(!isCollapsed)} 
        className="absolute -right-3 top-10 bg-[#1A1A1D] border border-white/10 rounded-full p-1 z-50 text-white shadow-lg hover:border-obsidian-accent hover:bg-obsidian-accent transition-all"
      >
        {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>

      {/* Logo Area */}
      <div className={`py-8 flex flex-col items-center justify-center transition-all duration-300 ${isCollapsed ? 'mb-0' : 'mb-4'}`}>
        <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-white/20 to-transparent border border-white/10 flex items-center justify-center shadow-[0_0_15px_rgba(255,255,255,0.1)] flex-shrink-0">
              <div className="w-2 h-2 bg-white rounded-full shadow-[0_0_10px_white]"></div>
            </div>
            {!isCollapsed && (
                <span className="text-lg font-thin text-white tracking-widest animate-[fadeIn_0.3s_ease-out]">OBSIDIAN</span>
            )}
        </div>
        {isCollapsed && <div className="h-[1px] w-8 bg-gradient-to-r from-transparent via-white/10 to-transparent mt-2"></div>}
      </div>

      {/* Nav Sections Container (Scrollable) */}
      <nav 
        className="flex-1 w-full flex flex-col gap-6 overflow-y-auto px-3 pb-4 scrollbar-hide" 
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        
        {navSections.map((section) => (
          <div key={section.title} className="flex flex-col w-full">
            {/* Section Header */}
            <div className={`
                text-[8px] font-bold text-obsidian-text-muted/40 tracking-[0.25em] mb-3 uppercase select-none transition-all duration-300
                ${isCollapsed ? 'text-center' : 'text-left px-4'}
            `}>
              {section.title}
            </div>
            
            {/* Section Items */}
            <div className="space-y-1 w-full flex flex-col">
              {section.items.map((item) => {
                const isActive = currentView === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => onChangeView(item.id as any)}
                    className={`
                        group relative w-full flex items-center h-10 transition-all duration-300 rounded-lg overflow-hidden
                        ${isCollapsed ? 'justify-center' : 'px-3 justify-start'}
                        ${isActive ? 'bg-white/[0.08]' : 'hover:bg-white/[0.04]'}
                    `}
                    title={isCollapsed ? item.label : ''}
                  >
                    {/* Active Indicator */}
                    {isActive && (
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-[3px] bg-obsidian-accent shadow-[0_0_12px_#6A4FFB] rounded-r-full"></div>
                    )}
                    
                    {/* Icon */}
                    <div className={`
                      flex-shrink-0 transition-colors duration-300 z-10
                      ${isActive ? 'text-white' : 'text-obsidian-text-muted group-hover:text-white'}
                    `}>
                      {item.icon}
                    </div>

                    {/* Label (Expanded Only) */}
                    <span className={`
                        ml-3 text-sm font-light tracking-wide whitespace-nowrap transition-all duration-300
                        ${isCollapsed ? 'opacity-0 w-0 hidden' : 'opacity-100 w-auto text-obsidian-text-primary group-hover:text-white'}
                        ${isActive && !isCollapsed ? 'text-white' : ''}
                    `}>
                        {item.label}
                    </span>
                    
                    {/* Tooltip for Collapsed State */}
                    {isCollapsed && (
                      <div className="absolute left-full top-1/2 -translate-y-1/2 ml-4 px-3 py-1.5 bg-[#16161A] border border-white/10 rounded text-[10px] text-white whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200 z-50 shadow-xl uppercase tracking-wider backdrop-blur-md">
                        {item.label}
                      </div>
                    )}
                  </button>
                )
              })}
            </div>
            
            {/* Subtle Divider */}
            {section.title !== 'BACKBONE' && (
               <div className={`h-[1px] bg-white/[0.03] mt-4 mx-auto transition-all ${isCollapsed ? 'w-6' : 'w-[90%]'}`}></div>
            )}
          </div>
        ))}
      </nav>

      {/* Footer Actions */}
      <div className={`flex flex-col gap-1 w-full py-4 border-t border-white/[0.04] bg-[#0F0F12]/50 backdrop-blur transition-all ${isCollapsed ? 'items-center' : 'px-3 items-start'}`}>
        <button className={`flex items-center gap-3 text-obsidian-text-muted hover:text-white transition-colors p-2.5 rounded-lg hover:bg-white/[0.04] w-full ${isCollapsed ? 'justify-center' : ''}`} title="Settings">
            <Settings size={18} strokeWidth={1.5} />
            {!isCollapsed && <span className="text-xs">Settings</span>}
        </button>
        <button onClick={onLogout} className={`flex items-center gap-3 text-obsidian-text-muted hover:text-red-400 transition-colors p-2.5 rounded-lg hover:bg-red-500/10 w-full ${isCollapsed ? 'justify-center' : ''}`} title="Logout">
            <LogOut size={18} strokeWidth={1.5} />
            {!isCollapsed && <span className="text-xs">Logout</span>}
        </button>
      </div>
    </aside>
  );
};