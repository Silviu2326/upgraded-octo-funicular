import React, { useState, useEffect, useRef } from 'react';
import { ObsidianCard, ObsidianButton, ObsidianInput } from './ui/ObsidianElements';
import {
  Database, Globe, FileText, Zap, GitCommit, AlertTriangle, Plus, Search, Server,
  Network, Download, Upload, CheckCircle, XCircle, Edit3, Trash2, Save, X,
  ArrowLeft, Play, Pause, RefreshCw, TrendingUp, Book, Layers, Activity, Share2, GitBranch
} from 'lucide-react';

// ==================== TYPE DEFINITIONS ====================

interface OntologyNode {
  id: string;
  label: string;
  x: number;
  y: number;
  type: 'ROOT' | 'CATEGORY' | 'CONCEPT' | 'PROPERTY';
  status: 'STABLE' | 'LIVE' | 'UPDATING' | 'CONFLICT';
  connections: string[];
}

interface KnowledgeSource {
  id: string;
  name: string;
  type: string;
  frequency: string;
  status: 'CONNECTED' | 'SYNCING' | 'ERROR';
}

interface Conflict {
  id: string;
  title: string;
  description: string;
  options: string[];
}

interface AxiomLog {
  id: string;
  timestamp: string;
  change: string;
  propagation: string;
}

// ==================== SAMPLE DATA ====================

const SAMPLE_NODES: OntologyNode[] = [
  { id: 'copper', label: 'Copper Futures', x: 20, y: 20, type: 'CONCEPT', status: 'LIVE', connections: ['market'] },
  { id: 'market', label: 'Mercado', x: 20, y: 50, type: 'CATEGORY', status: 'STABLE', connections: ['root'] },
  { id: 'labor', label: 'Labor Law', x: 80, y: 20, type: 'CONCEPT', status: 'CONFLICT', connections: ['legal'] },
  { id: 'pricing', label: 'Pricing Strategy', x: 50, y: 50, type: 'CONCEPT', status: 'UPDATING', connections: ['market', 'copper'] },
  { id: 'root', label: 'Empresa Soberana', x: 50, y: 80, type: 'ROOT', status: 'STABLE', connections: [] },
  { id: 'ops', label: 'Operaciones', x: 50, y: 90, type: 'CATEGORY', status: 'LIVE', connections: ['root'] },
  { id: 'legal', label: 'Legal', x: 80, y: 50, type: 'CATEGORY', status: 'STABLE', connections: ['root'] },
];

const SOURCES: KnowledgeSource[] = [
  { id: '1', name: 'LME (London Metal Exchange)', type: 'API STREAM', frequency: '500ms', status: 'CONNECTED' },
  { id: '2', name: 'Boletín Oficial (BOE)', type: 'WEB SCRAPER', frequency: '24h', status: 'CONNECTED' },
  { id: '3', name: 'Internal HR Database', type: 'SQL SYNC', frequency: 'Real-time', status: 'CONNECTED' },
  { id: '4', name: 'Bloomberg Terminal A', type: 'SOCKET', frequency: '100ms', status: 'CONNECTED' },
];

const CONFLICTS: Conflict[] = [
  { id: '1', title: "Definition of 'Empire'", description: "conflicts with BOE and HR", options: ['Trust BOE', 'Trust HR'] },
  { id: '2', title: "Holiday Pay Rate", description: "conflicts with Internal vs Legal", options: ['Trust Internal', 'Trust Legal'] }
];

const LOGS: AxiomLog[] = [
  { id: '1', timestamp: '10:42:05', change: 'Copper Price ↑ 2.4%', propagation: 'Quote Agent updated (+2.4%)' },
  { id: '2', timestamp: '10:40:12', change: 'New Labor Regulation', propagation: 'HR Contracts Flagged' },
  { id: '3', timestamp: '10:40:12', change: 'Inventory < 10%', propagation: 'Procurement Bot Triggered' },
];

// ==================== MAIN COMPONENT ====================

const OntologyCore: React.FC = () => {
  const [nodes, setNodes] = useState<OntologyNode[]>(SAMPLE_NODES);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  
  // Graph interaction state
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const canvasRef = useRef<HTMLCanvasElement>(null);

  // ==================== CANVAS RENDERING ====================
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      const { width, height } = canvas.getBoundingClientRect();
      canvas.width = width * 2; // Retina
      canvas.height = height * 2;
      ctx.scale(2, 2);
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    let animationId: number;
    let time = 0;

    const render = () => {
      time += 0.02;
      const { width, height } = canvas.getBoundingClientRect();
      
      // Clear
      ctx.clearRect(0, 0, width, height);
      
      // Background Grid
      ctx.strokeStyle = 'rgba(255,255,255,0.03)';
      ctx.lineWidth = 1;
      const gridSize = 40 * zoom;
      const offX = offset.x % gridSize;
      const offY = offset.y % gridSize;
      
      for(let x = offX; x < width; x += gridSize) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, height); ctx.stroke();
      }
      for(let y = offY; y < height; y += gridSize) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(width, y); ctx.stroke();
      }

      ctx.save();
      ctx.translate(offset.x, offset.y);
      ctx.scale(zoom, zoom);

      // Draw Edges
      nodes.forEach(node => {
        node.connections.forEach(targetId => {
          const target = nodes.find(n => n.id === targetId);
          if (target) {
            const sx = (node.x / 100) * width;
            const sy = (node.y / 100) * height;
            const tx = (target.x / 100) * width;
            const ty = (target.y / 100) * height;

            const grad = ctx.createLinearGradient(sx, sy, tx, ty);
            grad.addColorStop(0, 'rgba(106, 79, 251, 0.1)');
            grad.addColorStop(1, 'rgba(106, 79, 251, 0.4)');
            
            ctx.strokeStyle = grad;
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(sx, sy);
            ctx.lineTo(tx, ty);
            ctx.stroke();
          }
        });
      });

      // Draw Nodes
      nodes.forEach(node => {
        const x = (node.x / 100) * width;
        const y = (node.y / 100) * height;
        const isSelected = selectedNodeId === node.id;
        const isMatch = searchTerm && node.label.toLowerCase().includes(searchTerm.toLowerCase());

        // Color based on Status
        let color = '#FFFFFF';
        if (node.status === 'LIVE') color = '#6A4FFB'; // Purple
        if (node.status === 'CONFLICT') color = '#FFaa00'; // Orange
        if (node.status === 'UPDATING') color = '#45FF9A'; // Green

        // Pulse for Live
        if (node.status === 'LIVE' || node.status === 'UPDATING') {
           ctx.beginPath();
           ctx.arc(x, y, 8 + Math.sin(time*3)*2, 0, Math.PI * 2);
           ctx.fillStyle = `${color}30`;
           ctx.fill();
        }

        // Node Body
        ctx.beginPath();
        ctx.arc(x, y, isSelected ? 8 : 5, 0, Math.PI * 2);
        ctx.fillStyle = isMatch ? '#fff' : color;
        ctx.fill();
        
        // Node Ring
        ctx.beginPath();
        ctx.arc(x, y, isSelected ? 12 : 8, 0, Math.PI * 2);
        ctx.strokeStyle = isMatch ? '#fff' : `${color}80`;
        ctx.lineWidth = 1;
        ctx.stroke();

        // Label
        ctx.fillStyle = isMatch ? '#fff' : '#888';
        ctx.font = isSelected ? '12px Inter' : '10px Inter';
        ctx.textAlign = 'center';
        ctx.fillText(node.label, x, y + 20);
      });

      ctx.restore();
      animationId = requestAnimationFrame(render);
    };
    render();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationId);
    };
  }, [nodes, offset, zoom, selectedNodeId, searchTerm]);

  // ==================== INTERACTION HANDLERS ====================

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setOffset({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleClick = (e: React.MouseEvent) => {
    if (isDragging) return; // Don't select if dragging
    if (!canvasRef.current) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left - offset.x) / zoom;
    const y = (e.clientY - rect.top - offset.y) / zoom;
    
    // Find clicked node (approximate hit testing)
    const clicked = nodes.find(n => {
        const nx = (n.x / 100) * rect.width;
        const ny = (n.y / 100) * rect.height;
        return Math.sqrt(Math.pow(nx - x, 2) + Math.pow(ny - y, 2)) < 20;
    });

    setSelectedNodeId(clicked ? clicked.id : null);
  };

  // ==================== RENDER ====================

  return (
    <div className="w-full h-screen bg-[#0B0B0D] text-obsidian-text-primary px-6 py-6 flex flex-col gap-6 overflow-hidden font-sans">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-light text-white tracking-widest flex items-center gap-2">
            <Share2 className="text-obsidian-accent" size={20} />
            ONTOLOGY CORE
          </h1>
          <p className="text-xs text-obsidian-text-muted mt-1">Gestión del conocimiento y reglas del mundo</p>
        </div>
        <div className="flex gap-2">
           <span className="flex items-center gap-1 text-[10px] text-green-400 bg-green-400/10 px-2 py-1 rounded-full border border-green-400/20">
             <Activity size={10} /> SYSTEM OPTIMAL
           </span>
        </div>
      </div>

      {/* Main Grid */}
      <div className="flex-1 grid grid-cols-12 gap-6 overflow-hidden">
        
        {/* LEFT PANEL: KNOWLEDGE SOURCES */}
        <div className="col-span-3 flex flex-col gap-4">
          <ObsidianCard className="flex-1 flex flex-col">
            <h2 className="text-xs font-bold text-obsidian-text-muted tracking-[0.2em] mb-6 uppercase border-b border-white/5 pb-2">
              KNOWLEDGE SOURCES
            </h2>
            
            <div className="space-y-3 flex-1 overflow-y-auto pr-2">
              {SOURCES.map(source => (
                <div key={source.id} className="p-3 bg-white/[0.02] border border-white/[0.05] rounded-lg hover:bg-white/[0.04] transition-colors group">
                  <div className="flex justify-between items-start mb-1">
                    <div className="flex items-center gap-2">
                      {source.status === 'CONNECTED' && <div className="w-1.5 h-1.5 rounded-full bg-green-400 shadow-[0_0_5px_rgba(74,222,128,0.5)]"></div>}
                      <span className="text-xs font-medium text-white">{source.name}</span>
                    </div>
                    <span className="text-[9px] text-obsidian-text-muted font-mono">{source.frequency}</span>
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-[9px] bg-white/5 px-1.5 py-0.5 rounded text-obsidian-text-muted group-hover:text-white transition-colors">
                      {source.type}
                    </span>
                    <RefreshCw size={10} className="text-obsidian-text-muted opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-4 mt-2 border-t border-white/5">
              <ObsidianButton variant="secondary" className="text-xs">
                <Plus size={14} className="mr-2" />
                INJECT NEW ONTOLOGY
              </ObsidianButton>
            </div>
          </ObsidianCard>
        </div>

        {/* CENTER PANEL: GRAPH */}
        <div className="col-span-6 flex flex-col">
          <ObsidianCard className="flex-1 relative overflow-hidden flex flex-col" noPadding>
            
            {/* Graph Header Overlay */}
            <div className="absolute top-0 left-0 w-full p-4 flex justify-between items-start z-10 pointer-events-none bg-gradient-to-b from-[#0F0F12] to-transparent">
              <div>
                <h2 className="text-sm font-medium text-white tracking-widest">ONTOLOGY GRAPH</h2>
                <div className="flex items-center gap-2 mt-1">
                   <span className="w-1.5 h-1.5 rounded-full bg-obsidian-accent animate-pulse"></span>
                   <span className="text-[10px] text-obsidian-accent uppercase tracking-wider">LIVE SEMANTIC STRUCTURE</span>
                </div>
              </div>
              
              <div className="pointer-events-auto flex gap-2">
                 <div className="relative">
                    <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-white/40" />
                    <input 
                      type="text" 
                      placeholder="Search Concept..." 
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="bg-black/40 backdrop-blur border border-white/10 rounded-full py-1.5 pl-8 pr-3 text-[10px] text-white w-40 focus:w-56 focus:border-obsidian-accent transition-all outline-none"
                    />
                 </div>
              </div>
            </div>

            {/* Canvas */}
            <canvas 
              ref={canvasRef}
              className="w-full h-full cursor-move bg-[#050505]"
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onClick={handleClick}
            />

            {/* Graph Legend/Controls Bottom */}
            <div className="absolute bottom-4 left-4 z-10 flex gap-4 pointer-events-none">
               <div className="flex items-center gap-2 bg-black/40 backdrop-blur px-3 py-1.5 rounded-full border border-white/5">
                  <div className="w-2 h-2 rounded-full bg-[#6A4FFB]"></div><span className="text-[9px] text-white">Live</span>
                  <div className="w-2 h-2 rounded-full bg-[#45FF9A] ml-2"></div><span className="text-[9px] text-white">Updating</span>
                  <div className="w-2 h-2 rounded-full bg-[#FFaa00] ml-2"></div><span className="text-[9px] text-white">Conflict</span>
               </div>
            </div>

            <div className="absolute bottom-4 right-4 z-10 flex gap-2 pointer-events-auto">
               <button onClick={() => setZoom(z => Math.min(z + 0.1, 3))} className="p-2 bg-[#16161A] border border-white/10 rounded hover:bg-white/10 text-white">+</button>
               <button onClick={() => setZoom(z => Math.max(z - 0.1, 0.5))} className="p-2 bg-[#16161A] border border-white/10 rounded hover:bg-white/10 text-white">-</button>
               <button onClick={() => { setZoom(1); setOffset({x:0, y:0}); }} className="p-2 bg-[#16161A] border border-white/10 rounded hover:bg-white/10 text-white"><RefreshCw size={14}/></button>
            </div>

          </ObsidianCard>
        </div>

        {/* RIGHT PANEL: SPLIT (CONFLICTS & LOGS) */}
        <div className="col-span-3 flex flex-col gap-6">
          
          {/* Top: Conflict Detected */}
          <ObsidianCard className="h-1/2 flex flex-col">
             <div className="flex items-center gap-2 mb-4 text-yellow-500 border-b border-yellow-500/20 pb-2">
                <AlertTriangle size={14} />
                <h2 className="text-xs font-bold tracking-[0.2em] uppercase">CONFLICT DETECTED</h2>
             </div>
             
             <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                {CONFLICTS.map(conflict => (
                  <div key={conflict.id} className="bg-yellow-500/5 border border-yellow-500/20 p-3 rounded">
                     <h3 className="text-xs font-bold text-white mb-1">{conflict.title}</h3>
                     <p className="text-[10px] text-obsidian-text-secondary mb-3">{conflict.description}</p>
                     <div className="flex gap-2">
                        {conflict.options.map((opt, i) => (
                          <button key={i} className="flex-1 py-1.5 bg-yellow-500/10 hover:bg-yellow-500/20 border border-yellow-500/30 rounded text-[9px] text-yellow-500 transition-colors">
                            {opt}
                          </button>
                        ))}
                     </div>
                  </div>
                ))}
             </div>
          </ObsidianCard>

          {/* Bottom: Axiom Propagation */}
          <ObsidianCard className="h-1/2 flex flex-col">
             <div className="flex items-center gap-2 mb-4 text-obsidian-accent border-b border-obsidian-accent/20 pb-2">
                <GitCommit size={14} />
                <h2 className="text-xs font-bold tracking-[0.2em] uppercase">AXIOM PROPAGATION</h2>
             </div>

             <div className="flex-1 overflow-y-auto space-y-4 pr-1">
                {LOGS.map(log => (
                  <div key={log.id} className="relative pl-3 border-l border-white/10 group hover:border-obsidian-accent/50 transition-colors">
                     <div className="absolute -left-[3px] top-1.5 w-1.5 h-1.5 rounded-full bg-obsidian-text-muted group-hover:bg-obsidian-accent transition-colors"></div>
                     <div className="flex justify-between text-[9px] text-obsidian-text-muted mb-0.5">
                        <span>SOURCE: CHANGE</span>
                        <span className="font-mono">{log.timestamp}</span>
                     </div>
                     <p className="text-[10px] text-white font-medium mb-1">{log.change}</p>
                     <p className="text-[9px] text-obsidian-accent">➜ {log.propagation}</p>
                  </div>
                ))}
             </div>
          </ObsidianCard>

        </div>

      </div>
    </div>
  );
};

export default OntologyCore;
