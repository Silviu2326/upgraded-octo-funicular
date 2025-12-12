import React, { useState, useEffect, useRef } from 'react';
import { ObsidianCard, ObsidianButton } from './ui/ObsidianElements';
import { Database, Globe, FileText, Zap, GitCommit, AlertTriangle, Plus, Search, Server } from 'lucide-react';

interface OntologyNode {
  id: string;
  label: string;
  x: number; // Percentage 0-100
  y: number; // Percentage 0-100
  type: 'ROOT' | 'CATEGORY' | 'CONCEPT';
  status: 'STABLE' | 'LIVE';
  description?: string;
}

interface PropagationLog {
  id: string;
  source: string;
  change: string;
  impact: string;
  timestamp: string;
}

const OntologyCore: React.FC = () => {
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [conflictDetected, setConflictDetected] = useState(true);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // --- Mock Data ---
  const [sources] = useState([
    { id: 1, name: 'LME (London Metal Exchange)', type: 'API STREAM', status: 'LIVE', freq: '500ms' },
    { id: 2, name: 'Boletín Oficial (BOE)', type: 'WEB SCRAPER', status: 'IDLE', freq: '24h' },
    { id: 3, name: 'Internal HR Database', type: 'SQL SYNC', status: 'LIVE', freq: 'Real-time' },
    { id: 4, name: 'Bloomberg Terminal A', type: 'SOCKET', status: 'LIVE', freq: '100ms' },
  ]);

  const [logs] = useState<PropagationLog[]>([
    { id: '1', timestamp: '10:42:05', source: 'LME', change: 'Copper Price ▲ 2.4%', impact: 'Quote Agent updated (+2.4%)' },
    { id: '2', timestamp: '10:41:50', source: 'BOE', change: 'New Labor Regulation', impact: 'HR Contracts Flagged' },
    { id: '3', timestamp: '10:40:12', source: 'Internal', change: 'Inventory < 10%', impact: 'Procurement Bot Triggered' },
  ]);

  const nodes: OntologyNode[] = [
    { id: 'root', label: 'Empresa Soberana', x: 50, y: 50, type: 'ROOT', status: 'STABLE', description: 'Root Entity' },
    { id: 'market', label: 'Mercado', x: 20, y: 30, type: 'CATEGORY', status: 'LIVE', description: 'External Market Conditions' },
    { id: 'legal', label: 'Legal', x: 80, y: 30, type: 'CATEGORY', status: 'STABLE', description: 'Regulatory Framework' },
    { id: 'ops', label: 'Operaciones', x: 50, y: 80, type: 'CATEGORY', status: 'LIVE', description: 'Internal Logistics' },
    // Children
    { id: 'copper', label: 'Copper Futures', x: 10, y: 15, type: 'CONCEPT', status: 'LIVE', description: 'Live Feed: $3.85/lb' },
    { id: 'labor', label: 'Labor Law', x: 90, y: 15, type: 'CONCEPT', status: 'STABLE', description: 'Estatuto Trabajadores v24' },
    { id: 'vat', label: 'VAT / IVA', x: 85, y: 45, type: 'CONCEPT', status: 'STABLE', description: 'General Rate: 21%' },
    { id: 'pricing', label: 'Pricing Strategy', x: 30, y: 45, type: 'CONCEPT', status: 'LIVE', description: 'Dynamic Margin Model' },
  ];

  // --- Canvas Animation (The Semantic Lattice) ---
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

    const pulses: { start: string, end: string, progress: number }[] = [];

    // Spawn pulses randomly
    setInterval(() => {
        const sourceNodes = nodes.filter(n => n.status === 'LIVE');
        if(sourceNodes.length > 0) {
            const start = sourceNodes[Math.floor(Math.random() * sourceNodes.length)];
            pulses.push({ start: start.id, end: 'root', progress: 0 });
        }
    }, 1500);

    const render = () => {
      time += 0.01;
      const { width, height } = canvas.getBoundingClientRect();
      ctx.clearRect(0, 0, width, height);

      // 1. Draw Connections
      ctx.lineWidth = 1;
      nodes.forEach(node => {
          if (node.id === 'root') return;
          
          const root = nodes.find(n => n.id === 'root')!;
          // Parent connection (simplified: everything connects to root or root connects to categories)
          let parent = root;
          if (node.type === 'CONCEPT') {
             // Find closest category
             if(['copper', 'pricing'].includes(node.id)) parent = nodes.find(n => n.id === 'market')!;
             if(['labor', 'vat'].includes(node.id)) parent = nodes.find(n => n.id === 'legal')!;
          }

          const startX = (node.x / 100) * width;
          const startY = (node.y / 100) * height;
          const endX = (parent.x / 100) * width;
          const endY = (parent.y / 100) * height;

          // Draw Line
          const grad = ctx.createLinearGradient(startX, startY, endX, endY);
          grad.addColorStop(0, 'rgba(255,255,255,0.05)');
          grad.addColorStop(1, 'rgba(255,255,255,0.2)');
          ctx.strokeStyle = grad;
          ctx.beginPath();
          ctx.moveTo(startX, startY);
          ctx.lineTo(endX, endY);
          ctx.stroke();
      });

      // 2. Draw Pulses (Data Ripple)
      for (let i = pulses.length - 1; i >= 0; i--) {
          const p = pulses[i];
          p.progress += 0.01;
          
          if (p.progress >= 1) {
              pulses.splice(i, 1);
              continue;
          }

          const startNode = nodes.find(n => n.id === p.start)!;
          let parentId = 'root'; // Simplified path finding
          if(['copper', 'pricing'].includes(startNode.id)) parentId = 'market';
          if(['labor', 'vat'].includes(startNode.id)) parentId = 'legal';
          
          // Two stage pulse: Concept -> Category -> Root. 
          // For simplicity here: Just animate point A to B
          // To make it look cooler, we assume the pulse goes from Node to its Parent
          const endNode = nodes.find(n => n.id === parentId)!;

          const sx = (startNode.x / 100) * width;
          const sy = (startNode.y / 100) * height;
          const ex = (endNode.x / 100) * width;
          const ey = (endNode.y / 100) * height;

          const cx = sx + (ex - sx) * p.progress;
          const cy = sy + (ey - sy) * p.progress;

          ctx.beginPath();
          ctx.arc(cx, cy, 2, 0, Math.PI * 2);
          ctx.fillStyle = '#FFFFFF';
          ctx.shadowBlur = 10;
          ctx.shadowColor = '#FFFFFF';
          ctx.fill();
          ctx.shadowBlur = 0;
      }

      // 3. Draw Nodes
      nodes.forEach(node => {
          const x = (node.x / 100) * width;
          const y = (node.y / 100) * height;
          
          // Isometric Cube / Diamond shape simulation
          const size = node.type === 'ROOT' ? 12 : 6;
          
          ctx.fillStyle = node.id === selectedNodeId ? '#6A4FFB' : '#0B0B0D';
          ctx.strokeStyle = node.status === 'LIVE' ? '#6A4FFB' : '#FFFFFF';
          ctx.lineWidth = node.id === selectedNodeId ? 2 : 1;
          
          // Draw Diamond
          ctx.beginPath();
          ctx.moveTo(x, y - size);
          ctx.lineTo(x + size, y);
          ctx.lineTo(x, y + size);
          ctx.lineTo(x - size, y);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();

          // Live Pulse Ring
          if (node.status === 'LIVE') {
              ctx.beginPath();
              ctx.arc(x, y, size + 4 + Math.sin(time * 3) * 2, 0, Math.PI * 2);
              ctx.strokeStyle = 'rgba(106, 79, 251, 0.3)';
              ctx.lineWidth = 1;
              ctx.stroke();
          }

          // Label
          if (node.id !== selectedNodeId) { // Hide label if selected (shown in card)
              ctx.fillStyle = node.status === 'LIVE' ? '#F5F5F7' : '#8C8C97';
              ctx.font = node.type === 'ROOT' ? '500 12px Inter' : '300 10px Inter';
              ctx.textAlign = 'center';
              ctx.fillText(node.label, x, y + size + 15);
          }
      });

      animationId = requestAnimationFrame(render);
    };

    render();
    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationId);
    };
  }, [selectedNodeId]);


  return (
    <div className="w-full h-screen bg-[#0B0B0D] text-obsidian-text-primary px-6 py-6 flex gap-6 overflow-hidden relative font-sans">
      
      {/* Background Depth Effect */}
      <div className="absolute inset-0 bg-radial-gradient from-[#16161A] via-[#0B0B0D] to-[#0B0B0D] opacity-50 -z-10 pointer-events-none" />

      {/* --- COLUMNA IZQUIERDA: KNOWLEDGE SOURCES --- */}
      <div className="w-[20%] flex flex-col gap-6 animate-[fadeIn_0.5s_ease-out]">
        <ObsidianCard className="flex-1 flex flex-col overflow-y-auto">
             <div className="flex items-center gap-2 mb-6">
                 <Server size={14} className="text-obsidian-accent" />
                 <span className="text-[10px] uppercase tracking-[0.2em] text-white/80 font-medium">Knowledge Sources</span>
             </div>

             <div className="space-y-3">
                 {sources.map(source => (
                     <div key={source.id} className="p-3 bg-[#16161A] border border-white/[0.06] rounded flex flex-col gap-2 group hover:border-white/[0.2] transition-colors cursor-pointer">
                         <div className="flex justify-between items-start">
                             <div className="flex items-center gap-2">
                                {source.type.includes('API') ? <Globe size={12} className="text-obsidian-text-muted" /> : <Database size={12} className="text-obsidian-text-muted" />}
                                <span className="text-[11px] font-medium text-white">{source.name}</span>
                             </div>
                             <div className={`w-1.5 h-1.5 rounded-full ${source.status === 'LIVE' ? 'bg-[#45FF9A] shadow-[0_0_5px_#45FF9A] animate-pulse' : 'bg-gray-600'}`}></div>
                         </div>
                         <div className="flex justify-between items-center border-t border-white/[0.04] pt-2">
                             <span className="text-[9px] font-mono text-obsidian-text-muted">{source.type}</span>
                             <span className="text-[9px] text-obsidian-accent">{source.freq}</span>
                         </div>
                     </div>
                 ))}
             </div>

             <div className="mt-auto pt-4 border-t border-white/[0.06]">
                 <button className="w-full py-3 bg-white/[0.03] border border-white/[0.1] rounded text-[10px] text-white uppercase tracking-widest hover:bg-white/[0.08] transition-colors flex items-center justify-center gap-2 group">
                     <Plus size={12} className="group-hover:rotate-90 transition-transform" />
                     Inject New Ontology
                 </button>
             </div>
        </ObsidianCard>
      </div>

      {/* --- PANEL CENTRAL: THE ONTOLOGY GRAPH --- */}
      <div className="w-[60%] flex flex-col relative animate-[fadeIn_0.5s_ease-out_0.2s_both]">
         <ObsidianCard className="h-full relative overflow-hidden" noPadding>
             {/* Header Overlay */}
             <div className="absolute top-6 left-6 z-20 pointer-events-none">
                 <h2 className="text-base font-light text-white tracking-wide">Ontology Graph</h2>
                 <p className="text-[10px] text-obsidian-text-muted uppercase tracking-[0.2em]">Live Semantic Structure</p>
             </div>

             {/* Search/Filter */}
             <div className="absolute top-6 right-6 z-20 w-64">
                 <div className="relative">
                     <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-obsidian-text-muted" />
                     <input 
                        type="text" 
                        placeholder="Search Concept..." 
                        className="w-full bg-[#0F0F12]/80 backdrop-blur border border-white/[0.1] rounded-full py-2 pl-9 pr-4 text-[11px] text-white focus:outline-none focus:border-white/30 transition-colors"
                     />
                 </div>
             </div>

             {/* The Canvas */}
             <div className="w-full h-full relative" onClick={(e) => {
                 // Mock selection logic based on click position (simplified)
                 const rect = e.currentTarget.getBoundingClientRect();
                 const xPct = ((e.clientX - rect.left) / rect.width) * 100;
                 const yPct = ((e.clientY - rect.top) / rect.height) * 100;
                 
                 // Find closest node
                 const clicked = nodes.find(n => Math.abs(n.x - xPct) < 5 && Math.abs(n.y - yPct) < 5);
                 setSelectedNodeId(clicked ? clicked.id : null);
             }}>
                 <canvas ref={canvasRef} className="w-full h-full block cursor-pointer" />
                 
                 {/* Floating Detail Card (Glassmorphism) */}
                 {selectedNodeId && (
                     <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 bg-[#16161A]/90 backdrop-blur-xl border border-white/[0.1] p-6 rounded-lg shadow-[0_20px_50px_rgba(0,0,0,0.8)] animate-[scaleIn_0.2s_ease-out] z-30">
                         {(() => {
                             const n = nodes.find(node => node.id === selectedNodeId)!;
                             return (
                                 <>
                                    <div className="flex justify-between items-start mb-4">
                                        <h3 className="text-lg font-light text-white">{n.label}</h3>
                                        <span className={`text-[9px] px-2 py-0.5 rounded border ${n.status === 'LIVE' ? 'border-[#6A4FFB] text-[#6A4FFB] bg-[#6A4FFB]/10' : 'border-white/20 text-white/50'}`}>
                                            {n.status}
                                        </span>
                                    </div>
                                    <p className="text-xs text-obsidian-text-secondary leading-relaxed mb-4">
                                        {n.description}
                                    </p>
                                    <div className="flex flex-col gap-2 text-[10px] font-mono text-obsidian-text-muted bg-black/30 p-3 rounded border border-white/[0.04]">
                                        <div className="flex justify-between">
                                            <span>Source:</span>
                                            <span className="text-white">LME API</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Last Update:</span>
                                            <span className="text-white">12s ago</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Confidence:</span>
                                            <span className="text-obsidian-success">99.8%</span>
                                        </div>
                                    </div>
                                 </>
                             );
                         })()}
                     </div>
                 )}
             </div>
         </ObsidianCard>
      </div>

      {/* --- COLUMNA DERECHA: AXIOM PROPAGATION --- */}
      <div className="w-[20%] flex flex-col gap-6 animate-[fadeIn_0.5s_ease-out_0.4s_both]">
         
         {/* Conflict Module */}
         {conflictDetected && (
             <div className="bg-[#FFAA00]/10 border border-[#FFAA00]/40 rounded p-4 animate-[pulse_3s_infinite]">
                 <div className="flex items-center gap-2 mb-2 text-[#FFAA00]">
                     <AlertTriangle size={14} />
                     <span className="text-[10px] font-bold uppercase tracking-widest">Conflict Detected</span>
                 </div>
                 <p className="text-[10px] text-[#FFAA00]/80 leading-tight mb-3">
                     Source mismatch: "Employment Tax" differs between BOE and Internal HR.
                 </p>
                 <div className="flex gap-2">
                     <button className="flex-1 py-1 bg-[#FFAA00]/20 border border-[#FFAA00]/40 text-[#FFAA00] text-[9px] rounded hover:bg-[#FFAA00]/30 transition-colors">Trust BOE</button>
                     <button className="flex-1 py-1 border border-white/20 text-white/60 text-[9px] rounded hover:bg-white/10 transition-colors">Trust HR</button>
                 </div>
             </div>
         )}

         <ObsidianCard className="flex-1 flex flex-col overflow-hidden">
             <div className="flex items-center gap-2 mb-4">
                 <GitCommit size={14} className="text-obsidian-text-muted" />
                 <span className="text-[10px] uppercase tracking-[0.2em] text-white/80 font-medium">Axiom Propagation</span>
             </div>

             <div className="flex-1 overflow-y-auto pr-1 space-y-4">
                 {logs.map(log => (
                     <div key={log.id} className="relative pl-4 border-l border-white/[0.1] pb-2">
                         <div className="absolute left-[-2.5px] top-[6px] w-[5px] h-[5px] rounded-full bg-obsidian-accent"></div>
                         <div className="flex justify-between items-start mb-1">
                             <span className="text-[9px] text-obsidian-accent font-mono">SOURCE CHANGE</span>
                             <span className="text-[9px] text-obsidian-text-muted opacity-50">{log.timestamp}</span>
                         </div>
                         <p className="text-[11px] text-white mb-2">{log.change}</p>
                         
                         <div className="bg-white/[0.03] p-2 rounded border border-white/[0.04]">
                             <span className="text-[9px] text-obsidian-text-muted font-mono block mb-1">PROPAGATION ➜</span>
                             <span className="text-[10px] text-obsidian-success">{log.impact}</span>
                         </div>
                     </div>
                 ))}
             </div>
         </ObsidianCard>
      </div>

    </div>
  );
};

export default OntologyCore;