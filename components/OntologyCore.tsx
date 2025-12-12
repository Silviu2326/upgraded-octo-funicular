import React, { useState, useEffect, useRef } from 'react';
import { ObsidianCard, ObsidianButton, ObsidianInput } from './ui/ObsidianElements';
import {
  Database, Globe, FileText, Zap, GitCommit, AlertTriangle, Plus, Search, Server,
  Network, Download, Upload, CheckCircle, XCircle, Edit3, Trash2, Save, X,
  ArrowLeft, Play, Pause, RefreshCw, TrendingUp, Book, Layers
} from 'lucide-react';

// ==================== TYPE DEFINITIONS ====================

type ViewMode = 'explorer' | 'sources' | 'library' | 'conflicts' | 'editor';

type NodeType = 'ROOT' | 'CATEGORY' | 'CONCEPT' | 'PROPERTY';
type NodeStatus = 'STABLE' | 'LIVE' | 'UPDATING' | 'CONFLICT';
type ConnectionStatus = 'CONNECTED' | 'SYNCING' | 'ERROR' | 'PAUSED';
type ConflictStatus = 'PENDING' | 'RESOLVED' | 'IGNORED';

interface OntologyNode {
  id: string;
  label: string;
  x: number;
  y: number;
  type: NodeType;
  status: NodeStatus;
  description: string;
  properties: Record<string, any>;
  source?: string;
  lastUpdate?: Date;
  confidence?: number;
}

interface OntologyEdge {
  id: string;
  from: string;
  to: string;
  label: string;
  type: 'IS_A' | 'HAS_A' | 'RELATES_TO' | 'DEPENDS_ON';
}

interface KnowledgeSource {
  id: string;
  name: string;
  type: 'API' | 'SCRAPER' | 'SQL' | 'SOCKET' | 'FILE';
  url: string;
  status: ConnectionStatus;
  frequency: string;
  lastSync?: Date;
  recordsIngested: number;
  errorRate: number;
  config: Record<string, any>;
}

interface IndustryOntology {
  id: string;
  name: string;
  sector: string;
  description: string;
  nodeCount: number;
  edgeCount: number;
  version: string;
  author: string;
  downloadCount: number;
  rating: number;
  preview: OntologyNode[];
}

interface SemanticConflict {
  id: string;
  concept: string;
  description: string;
  sources: {
    name: string;
    definition: string;
    confidence: number;
  }[];
  status: ConflictStatus;
  impact: 'HIGH' | 'MEDIUM' | 'LOW';
  affectedNodes: string[];
  timestamp: Date;
}

interface PropagationEvent {
  id: string;
  timestamp: Date;
  sourceNode: string;
  changeType: 'UPDATE' | 'CREATE' | 'DELETE';
  change: string;
  propagationPath: string[];
  affectedAgents: string[];
  impact: string;
}

// ==================== SAMPLE DATA ====================

const SAMPLE_NODES: OntologyNode[] = [
  { id: 'root', label: 'Empresa Soberana', x: 50, y: 50, type: 'ROOT', status: 'STABLE', description: 'Entidad raíz del negocio', properties: {}, confidence: 100 },
  { id: 'market', label: 'Mercado', x: 20, y: 30, type: 'CATEGORY', status: 'LIVE', description: 'Condiciones externas de mercado', properties: {}, source: 'LME', confidence: 98.5 },
  { id: 'legal', label: 'Marco Legal', x: 80, y: 30, type: 'CATEGORY', status: 'STABLE', description: 'Regulaciones y normativas', properties: {}, source: 'BOE', confidence: 99.2 },
  { id: 'ops', label: 'Operaciones', x: 50, y: 80, type: 'CATEGORY', status: 'LIVE', description: 'Logística interna', properties: {}, source: 'Internal', confidence: 100 },
  { id: 'copper', label: 'Copper Futures', x: 10, y: 15, type: 'CONCEPT', status: 'LIVE', description: 'Precio del cobre en tiempo real', properties: { price: 3.85, unit: 'USD/lb' }, source: 'LME', confidence: 99.8 },
  { id: 'labor', label: 'Derecho Laboral', x: 90, y: 15, type: 'CONCEPT', status: 'CONFLICT', description: 'Normativa de empleo', properties: { version: 'v24' }, source: 'BOE', confidence: 85.2 },
  { id: 'vat', label: 'IVA', x: 85, y: 45, type: 'CONCEPT', status: 'STABLE', description: 'Impuesto sobre el valor añadido', properties: { rate: 21 }, source: 'AEAT', confidence: 100 },
  { id: 'pricing', label: 'Estrategia de Precios', x: 30, y: 45, type: 'CONCEPT', status: 'UPDATING', description: 'Modelo dinámico de márgenes', properties: { model: 'dynamic' }, source: 'Internal', confidence: 92.1 },
  { id: 'inventory', label: 'Inventario', x: 50, y: 95, type: 'CONCEPT', status: 'LIVE', description: 'Stock actual de productos', properties: { level: 'low' }, source: 'ERP', confidence: 100 },
];

const SAMPLE_EDGES: OntologyEdge[] = [
  { id: 'e1', from: 'market', to: 'root', label: 'parte de', type: 'IS_A' },
  { id: 'e2', from: 'legal', to: 'root', label: 'parte de', type: 'IS_A' },
  { id: 'e3', from: 'ops', to: 'root', label: 'parte de', type: 'IS_A' },
  { id: 'e4', from: 'copper', to: 'market', label: 'subcategoría', type: 'IS_A' },
  { id: 'e5', from: 'pricing', to: 'market', label: 'subcategoría', type: 'IS_A' },
  { id: 'e6', from: 'labor', to: 'legal', label: 'subcategoría', type: 'IS_A' },
  { id: 'e7', from: 'vat', to: 'legal', label: 'subcategoría', type: 'IS_A' },
  { id: 'e8', from: 'inventory', to: 'ops', label: 'subcategoría', type: 'IS_A' },
  { id: 'e9', from: 'pricing', to: 'copper', label: 'depende de', type: 'DEPENDS_ON' },
  { id: 'e10', from: 'pricing', to: 'inventory', label: 'influye en', type: 'RELATES_TO' },
];

const SAMPLE_SOURCES: KnowledgeSource[] = [
  { id: 's1', name: 'LME (London Metal Exchange)', type: 'API', url: 'https://api.lme.com/v2', status: 'CONNECTED', frequency: '500ms', lastSync: new Date(Date.now() - 12000), recordsIngested: 145892, errorRate: 0.02, config: { apiKey: '***' } },
  { id: 's2', name: 'Boletín Oficial del Estado (BOE)', type: 'SCRAPER', url: 'https://boe.es', status: 'CONNECTED', frequency: '24h', lastSync: new Date(Date.now() - 3600000), recordsIngested: 3421, errorRate: 0.5, config: { selector: '.documento' } },
  { id: 's3', name: 'Internal HR Database', type: 'SQL', url: 'postgresql://internal/hr', status: 'SYNCING', frequency: 'Real-time', lastSync: new Date(Date.now() - 5000), recordsIngested: 89234, errorRate: 0, config: { tables: ['employees', 'contracts'] } },
  { id: 's4', name: 'Bloomberg Terminal A', type: 'SOCKET', url: 'ws://bloomberg.com/feed', status: 'CONNECTED', frequency: '100ms', lastSync: new Date(Date.now() - 100), recordsIngested: 2456789, errorRate: 0.01, config: { symbols: ['CU', 'AL', 'ZN'] } },
  { id: 's5', name: 'AEAT (Agencia Tributaria)', type: 'API', url: 'https://api.aeat.es', status: 'PAUSED', frequency: '1w', recordsIngested: 1203, errorRate: 5.2, config: {} },
];

const SAMPLE_ONTOLOGIES: IndustryOntology[] = [
  { id: 'o1', name: 'Restauración y Hostelería', sector: 'Hospitality', description: 'Ontología completa para restaurantes, bares y hoteles. Incluye conceptos de menú, reservas, proveedores, normativas sanitarias.', nodeCount: 342, edgeCount: 891, version: '2.1.0', author: 'Manus AI', downloadCount: 1843, rating: 4.8, preview: [] },
  { id: 'o2', name: 'Consultoría Legal', sector: 'Legal', description: 'Marco semántico para bufetes de abogados. Tipos de casos, procedimientos judiciales, referencias legales, gestión de clientes.', nodeCount: 567, edgeCount: 1432, version: '3.0.2', author: 'LegalTech Corp', downloadCount: 923, rating: 4.9, preview: [] },
  { id: 'o3', name: 'E-commerce y Retail', sector: 'Commerce', description: 'Estructura para tiendas online. Productos, categorías, logística, pagos, marketing, atención al cliente.', nodeCount: 489, edgeCount: 1156, version: '1.8.5', author: 'RetailAI', downloadCount: 3421, rating: 4.7, preview: [] },
  { id: 'o4', name: 'Manufactura Industrial', sector: 'Manufacturing', description: 'Gestión de producción, cadena de suministro, maquinaria, mantenimiento preventivo, control de calidad.', nodeCount: 678, edgeCount: 1823, version: '2.5.1', author: 'Industry 4.0 Lab', downloadCount: 1567, rating: 4.6, preview: [] },
  { id: 'o5', name: 'Servicios Financieros', sector: 'Finance', description: 'Banca, inversiones, seguros. Productos financieros, regulación, KYC, gestión de riesgos.', nodeCount: 823, edgeCount: 2341, version: '4.1.0', author: 'FinTech Alliance', downloadCount: 2109, rating: 4.9, preview: [] },
];

const SAMPLE_CONFLICTS: SemanticConflict[] = [
  {
    id: 'c1',
    concept: 'Empleado a Tiempo Completo',
    description: 'Definición inconsistente del concepto de empleado a tiempo completo entre BOE y base de datos interna de RRHH.',
    sources: [
      { name: 'BOE (Estatuto de los Trabajadores)', definition: 'Trabajador con jornada superior a 35 horas semanales', confidence: 99.2 },
      { name: 'Internal HR Database', definition: 'Empleado contratado con jornada de 40 horas o más', confidence: 100 },
    ],
    status: 'PENDING',
    impact: 'HIGH',
    affectedNodes: ['labor', 'ops', 'hr-contracts'],
    timestamp: new Date(Date.now() - 7200000),
  },
  {
    id: 'c2',
    concept: 'Tasa de Descuento',
    description: 'El modelo de pricing interno define "descuento" de manera diferente a la política comercial oficial.',
    sources: [
      { name: 'Pricing Strategy Model', definition: 'Reducción porcentual aplicada sobre precio base antes de impuestos', confidence: 92.1 },
      { name: 'Sales Policy Document', definition: 'Rebaja sobre PVP final incluyendo IVA', confidence: 95.8 },
    ],
    status: 'PENDING',
    impact: 'MEDIUM',
    affectedNodes: ['pricing', 'sales'],
    timestamp: new Date(Date.now() - 3600000),
  },
];

const SAMPLE_EVENTS: PropagationEvent[] = [
  {
    id: 'p1',
    timestamp: new Date(Date.now() - 65000),
    sourceNode: 'copper',
    changeType: 'UPDATE',
    change: 'Copper Price ▲ 2.4% → $3.85/lb',
    propagationPath: ['copper', 'market', 'pricing', 'quote-agent'],
    affectedAgents: ['Quote Agent', 'Procurement Bot'],
    impact: 'Quote Agent updated margin (+2.4%)',
  },
  {
    id: 'p2',
    timestamp: new Date(Date.now() - 110000),
    sourceNode: 'labor',
    changeType: 'UPDATE',
    change: 'Nueva Regulación Laboral (BOE)',
    propagationPath: ['labor', 'legal', 'hr-contracts'],
    affectedAgents: ['HR Compliance Agent'],
    impact: 'HR Contracts Flagged for Review',
  },
  {
    id: 'p3',
    timestamp: new Date(Date.now() - 228000),
    sourceNode: 'inventory',
    changeType: 'UPDATE',
    change: 'Inventory Level < 10%',
    propagationPath: ['inventory', 'ops', 'procurement-bot'],
    affectedAgents: ['Procurement Bot'],
    impact: 'Auto-reorder triggered (Supplier A)',
  },
];

// ==================== MAIN COMPONENT ====================

const OntologyCore: React.FC = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('explorer');

  // State for Explorer
  const [nodes, setNodes] = useState<OntologyNode[]>(SAMPLE_NODES);
  const [edges, setEdges] = useState<OntologyEdge[]>(SAMPLE_EDGES);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [graphOffset, setGraphOffset] = useState({ x: 0, y: 0 });
  const [graphZoom, setGraphZoom] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');

  // State for Sources
  const [sources, setSources] = useState<KnowledgeSource[]>(SAMPLE_SOURCES);
  const [selectedSource, setSelectedSource] = useState<KnowledgeSource | null>(null);

  // State for Library
  const [ontologies, setOntologies] = useState<IndustryOntology[]>(SAMPLE_ONTOLOGIES);
  const [selectedOntology, setSelectedOntology] = useState<IndustryOntology | null>(null);

  // State for Conflicts
  const [conflicts, setConflicts] = useState<SemanticConflict[]>(SAMPLE_CONFLICTS);
  const [events, setEvents] = useState<PropagationEvent[]>(SAMPLE_EVENTS);

  // State for Editor
  const [editingNode, setEditingNode] = useState<OntologyNode | null>(null);
  const [isCreatingNode, setIsCreatingNode] = useState(false);
  const [newNodeData, setNewNodeData] = useState<Partial<OntologyNode>>({});

  const canvasRef = useRef<HTMLCanvasElement>(null);

  // ==================== CANVAS RENDERING ====================

  useEffect(() => {
    if (viewMode !== 'explorer') return;

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
      time += 0.01;
      const { width, height } = canvas.getBoundingClientRect();
      ctx.clearRect(0, 0, width, height);

      // Apply transformations
      ctx.save();
      ctx.translate(graphOffset.x, graphOffset.y);
      ctx.scale(graphZoom, graphZoom);

      // Filter nodes based on search
      const visibleNodes = nodes.filter(n =>
        searchTerm === '' || n.label.toLowerCase().includes(searchTerm.toLowerCase())
      );

      // 1. Draw Edges
      ctx.lineWidth = 1;
      edges.forEach(edge => {
        const fromNode = nodes.find(n => n.id === edge.from);
        const toNode = nodes.find(n => n.id === edge.to);
        if (!fromNode || !toNode) return;

        const fromX = (fromNode.x / 100) * width;
        const fromY = (fromNode.y / 100) * height;
        const toX = (toNode.x / 100) * width;
        const toY = (toNode.y / 100) * height;

        const grad = ctx.createLinearGradient(fromX, fromY, toX, toY);
        grad.addColorStop(0, 'rgba(255,255,255,0.05)');
        grad.addColorStop(1, 'rgba(255,255,255,0.2)');
        ctx.strokeStyle = grad;
        ctx.beginPath();
        ctx.moveTo(fromX, fromY);
        ctx.lineTo(toX, toY);
        ctx.stroke();
      });

      // 2. Draw Nodes
      visibleNodes.forEach(node => {
        const x = (node.x / 100) * width;
        const y = (node.y / 100) * height;

        const size = node.type === 'ROOT' ? 14 : node.type === 'CATEGORY' ? 10 : 6;

        // Status colors
        let statusColor = '#FFFFFF';
        if (node.status === 'LIVE') statusColor = '#6A4FFB';
        if (node.status === 'UPDATING') statusColor = '#45FF9A';
        if (node.status === 'CONFLICT') statusColor = '#FFAA00';

        // Node background
        ctx.fillStyle = node.id === selectedNodeId ? statusColor : '#0B0B0D';
        ctx.strokeStyle = statusColor;
        ctx.lineWidth = node.id === selectedNodeId ? 3 : 1.5;

        // Draw diamond shape
        ctx.beginPath();
        ctx.moveTo(x, y - size);
        ctx.lineTo(x + size, y);
        ctx.lineTo(x, y + size);
        ctx.lineTo(x - size, y);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Pulse effect for live nodes
        if (node.status === 'LIVE' || node.status === 'UPDATING') {
          ctx.beginPath();
          ctx.arc(x, y, size + 4 + Math.sin(time * 3) * 2, 0, Math.PI * 2);
          ctx.strokeStyle = `${statusColor}40`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }

        // Warning pulse for conflicts
        if (node.status === 'CONFLICT') {
          ctx.beginPath();
          ctx.arc(x, y, size + 6 + Math.sin(time * 5) * 3, 0, Math.PI * 2);
          ctx.strokeStyle = `${statusColor}60`;
          ctx.lineWidth = 2;
          ctx.stroke();
        }

        // Label
        ctx.fillStyle = searchTerm && node.label.toLowerCase().includes(searchTerm.toLowerCase())
          ? '#45FF9A'
          : node.status === 'LIVE' ? '#F5F5F7' : '#8C8C97';
        ctx.font = node.type === 'ROOT' ? '600 12px Inter' : '400 10px Inter';
        ctx.textAlign = 'center';
        ctx.fillText(node.label, x, y + size + 18);
      });

      ctx.restore();

      animationId = requestAnimationFrame(render);
    };

    render();
    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationId);
    };
  }, [viewMode, nodes, edges, selectedNodeId, graphOffset, graphZoom, searchTerm]);

  // ==================== RENDER FUNCTIONS ====================

  const renderExplorer = () => {
    const selectedNode = nodes.find(n => n.id === selectedNodeId);

    return (
      <div className="w-full h-full flex gap-6">
        {/* Left Sidebar - Node List */}
        <div className="w-80 flex flex-col gap-4">
          <ObsidianCard>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Network size={14} className="text-obsidian-accent" />
                <span className="text-xs uppercase tracking-wider text-white/80 font-medium">Conceptos</span>
              </div>
              <ObsidianButton size="sm" onClick={() => {
                setViewMode('editor');
                setIsCreatingNode(true);
              }}>
                <Plus size={12} />
              </ObsidianButton>
            </div>

            <div className="mb-4">
              <div className="relative">
                <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-obsidian-text-muted" />
                <input
                  type="text"
                  placeholder="Buscar concepto..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-[#16161A] border border-white/10 rounded-full py-2 pl-9 pr-4 text-xs text-white focus:outline-none focus:border-white/30 transition-colors"
                />
              </div>
            </div>

            <div className="space-y-2 max-h-[calc(100vh-300px)] overflow-y-auto">
              {nodes.map(node => (
                <div
                  key={node.id}
                  onClick={() => setSelectedNodeId(node.id)}
                  className={`p-3 rounded border cursor-pointer transition-all ${
                    selectedNodeId === node.id
                      ? 'bg-obsidian-accent/10 border-obsidian-accent'
                      : 'bg-[#16161A] border-white/5 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-xs text-white font-medium">{node.label}</span>
                    <span className={`px-2 py-0.5 rounded text-[9px] font-mono ${
                      node.status === 'LIVE' ? 'bg-obsidian-accent/20 text-obsidian-accent' :
                      node.status === 'CONFLICT' ? 'bg-yellow-500/20 text-yellow-500' :
                      node.status === 'UPDATING' ? 'bg-green-500/20 text-green-500' :
                      'bg-white/10 text-white/60'
                    }`}>
                      {node.status}
                    </span>
                  </div>
                  <p className="text-[10px] text-obsidian-text-muted mt-1">{node.type}</p>
                </div>
              ))}
            </div>
          </ObsidianCard>
        </div>

        {/* Center - Graph Canvas */}
        <div className="flex-1 flex flex-col">
          <ObsidianCard className="flex-1 relative overflow-hidden" noPadding>
            <div className="absolute top-6 left-6 z-20">
              <h2 className="text-base font-light text-white tracking-wide">Grafo de Conocimiento</h2>
              <p className="text-[10px] text-obsidian-text-muted uppercase tracking-wider">Estructura Semántica Viva</p>
            </div>

            {/* Graph Controls */}
            <div className="absolute top-6 right-6 z-20 flex gap-2">
              <button
                onClick={() => setGraphZoom(Math.min(graphZoom * 1.2, 3))}
                className="px-3 py-2 bg-[#16161A]/80 backdrop-blur border border-white/10 rounded text-xs text-white hover:bg-white/10 transition-colors"
              >
                Zoom +
              </button>
              <button
                onClick={() => setGraphZoom(Math.max(graphZoom / 1.2, 0.5))}
                className="px-3 py-2 bg-[#16161A]/80 backdrop-blur border border-white/10 rounded text-xs text-white hover:bg-white/10 transition-colors"
              >
                Zoom -
              </button>
              <button
                onClick={() => {
                  setGraphZoom(1);
                  setGraphOffset({ x: 0, y: 0 });
                }}
                className="px-3 py-2 bg-[#16161A]/80 backdrop-blur border border-white/10 rounded text-xs text-white hover:bg-white/10 transition-colors"
              >
                <RefreshCw size={12} />
              </button>
            </div>

            {/* Canvas */}
            <div
              className="w-full h-full relative cursor-grab active:cursor-grabbing"
              onMouseDown={(e) => {
                const startX = e.clientX;
                const startY = e.clientY;
                const startOffsetX = graphOffset.x;
                const startOffsetY = graphOffset.y;

                const handleMouseMove = (moveEvent: MouseEvent) => {
                  const dx = moveEvent.clientX - startX;
                  const dy = moveEvent.clientY - startY;
                  setGraphOffset({ x: startOffsetX + dx, y: startOffsetY + dy });
                };

                const handleMouseUp = () => {
                  document.removeEventListener('mousemove', handleMouseMove);
                  document.removeEventListener('mouseup', handleMouseUp);
                };

                document.addEventListener('mousemove', handleMouseMove);
                document.addEventListener('mouseup', handleMouseUp);
              }}
              onClick={(e) => {
                if (!canvasRef.current) return;
                const rect = canvasRef.current.getBoundingClientRect();
                const clickX = ((e.clientX - rect.left - graphOffset.x) / graphZoom / rect.width) * 100;
                const clickY = ((e.clientY - rect.top - graphOffset.y) / graphZoom / rect.height) * 100;

                const clicked = nodes.find(n =>
                  Math.abs(n.x - clickX) < 3 && Math.abs(n.y - clickY) < 3
                );
                setSelectedNodeId(clicked ? clicked.id : null);
              }}
            >
              <canvas ref={canvasRef} className="w-full h-full block" />
            </div>

            {/* Node Detail Card */}
            {selectedNode && (
              <div className="absolute bottom-6 right-6 w-80 bg-[#16161A]/95 backdrop-blur-xl border border-white/10 p-5 rounded-lg shadow-2xl z-30 animate-[scaleIn_0.2s_ease-out]">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-sm font-medium text-white">{selectedNode.label}</h3>
                  <button
                    onClick={() => setSelectedNodeId(null)}
                    className="text-obsidian-text-muted hover:text-white transition-colors"
                  >
                    <X size={14} />
                  </button>
                </div>

                <div className="space-y-3">
                  <div>
                    <p className="text-[10px] text-obsidian-text-muted mb-1">Descripción</p>
                    <p className="text-xs text-obsidian-text-secondary">{selectedNode.description}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[10px]">
                    <div>
                      <p className="text-obsidian-text-muted mb-1">Tipo</p>
                      <p className="text-white font-mono">{selectedNode.type}</p>
                    </div>
                    <div>
                      <p className="text-obsidian-text-muted mb-1">Estado</p>
                      <p className="text-white font-mono">{selectedNode.status}</p>
                    </div>
                    {selectedNode.source && (
                      <div>
                        <p className="text-obsidian-text-muted mb-1">Fuente</p>
                        <p className="text-white font-mono">{selectedNode.source}</p>
                      </div>
                    )}
                    {selectedNode.confidence && (
                      <div>
                        <p className="text-obsidian-text-muted mb-1">Confianza</p>
                        <p className="text-obsidian-success font-mono">{selectedNode.confidence.toFixed(1)}%</p>
                      </div>
                    )}
                  </div>

                  {Object.keys(selectedNode.properties).length > 0 && (
                    <div>
                      <p className="text-[10px] text-obsidian-text-muted mb-2">Propiedades</p>
                      <div className="bg-black/30 rounded p-2 space-y-1">
                        {Object.entries(selectedNode.properties).map(([key, value]) => (
                          <div key={key} className="flex justify-between text-[10px]">
                            <span className="text-obsidian-text-muted">{key}:</span>
                            <span className="text-white font-mono">{String(value)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2 pt-2 border-t border-white/10">
                    <ObsidianButton
                      size="sm"
                      fullWidth
                      onClick={() => {
                        setEditingNode(selectedNode);
                        setViewMode('editor');
                      }}
                    >
                      <Edit3 size={12} />
                      Editar
                    </ObsidianButton>
                    <button
                      onClick={() => {
                        setNodes(nodes.filter(n => n.id !== selectedNode.id));
                        setSelectedNodeId(null);
                      }}
                      className="flex-1 py-2 bg-red-500/10 border border-red-500/30 rounded text-xs text-red-500 hover:bg-red-500/20 transition-colors flex items-center justify-center gap-2"
                    >
                      <Trash2 size={12} />
                      Eliminar
                    </button>
                  </div>
                </div>
              </div>
            )}
          </ObsidianCard>
        </div>
      </div>
    );
  };

  const renderSources = () => (
    <div className="w-full h-full flex gap-6">
      {/* Sources List */}
      <div className="w-96 flex flex-col gap-4">
        <ObsidianCard>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Server size={14} className="text-obsidian-accent" />
              <span className="text-xs uppercase tracking-wider text-white/80 font-medium">Fuentes de Conocimiento</span>
            </div>
            <ObsidianButton size="sm">
              <Plus size={12} />
            </ObsidianButton>
          </div>

          <div className="space-y-3 max-h-[calc(100vh-200px)] overflow-y-auto">
            {sources.map(source => (
              <div
                key={source.id}
                onClick={() => setSelectedSource(source)}
                className={`p-4 rounded border cursor-pointer transition-all ${
                  selectedSource?.id === source.id
                    ? 'bg-obsidian-accent/10 border-obsidian-accent'
                    : 'bg-[#16161A] border-white/5 hover:border-white/20'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {source.type === 'API' ? <Globe size={12} /> :
                     source.type === 'SCRAPER' ? <FileText size={12} /> :
                     source.type === 'SQL' ? <Database size={12} /> :
                     <Zap size={12} />}
                    <span className="text-xs text-white font-medium">{source.name}</span>
                  </div>
                  <div className={`w-2 h-2 rounded-full ${
                    source.status === 'CONNECTED' ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)] animate-pulse' :
                    source.status === 'SYNCING' ? 'bg-yellow-500 animate-pulse' :
                    source.status === 'ERROR' ? 'bg-red-500' :
                    'bg-gray-500'
                  }`} />
                </div>

                <div className="flex items-center justify-between text-[10px] border-t border-white/5 pt-2">
                  <span className="font-mono text-obsidian-text-muted">{source.type}</span>
                  <span className="text-obsidian-accent">{source.frequency}</span>
                </div>

                <div className="mt-2 flex items-center justify-between text-[9px]">
                  <span className="text-obsidian-text-muted">{source.recordsIngested.toLocaleString()} registros</span>
                  <span className={source.errorRate > 1 ? 'text-red-500' : 'text-obsidian-success'}>
                    Error: {source.errorRate.toFixed(1)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </ObsidianCard>
      </div>

      {/* Source Detail */}
      <div className="flex-1">
        {selectedSource ? (
          <ObsidianCard className="h-full">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-base font-light text-white">{selectedSource.name}</h2>
              <div className="flex gap-2">
                {selectedSource.status === 'PAUSED' ? (
                  <ObsidianButton size="sm" onClick={() => {
                    setSources(sources.map(s => s.id === selectedSource.id ? { ...s, status: 'CONNECTED' } : s));
                    setSelectedSource({ ...selectedSource, status: 'CONNECTED' });
                  }}>
                    <Play size={12} />
                    Reanudar
                  </ObsidianButton>
                ) : (
                  <ObsidianButton size="sm" onClick={() => {
                    setSources(sources.map(s => s.id === selectedSource.id ? { ...s, status: 'PAUSED' } : s));
                    setSelectedSource({ ...selectedSource, status: 'PAUSED' });
                  }}>
                    <Pause size={12} />
                    Pausar
                  </ObsidianButton>
                )}
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <p className="text-xs text-obsidian-text-muted mb-2">Información de Conexión</p>
                <div className="bg-[#16161A] border border-white/10 rounded p-4 space-y-3">
                  <div className="flex justify-between text-xs">
                    <span className="text-obsidian-text-muted">Tipo:</span>
                    <span className="text-white font-mono">{selectedSource.type}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-obsidian-text-muted">URL:</span>
                    <span className="text-white font-mono text-[10px]">{selectedSource.url}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-obsidian-text-muted">Frecuencia:</span>
                    <span className="text-obsidian-accent font-mono">{selectedSource.frequency}</span>
                  </div>
                  {selectedSource.lastSync && (
                    <div className="flex justify-between text-xs">
                      <span className="text-obsidian-text-muted">Última Sincronización:</span>
                      <span className="text-white font-mono">{new Date(selectedSource.lastSync).toLocaleString()}</span>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <p className="text-xs text-obsidian-text-muted mb-2">Métricas de Rendimiento</p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-[#16161A] border border-white/10 rounded p-4">
                    <p className="text-[10px] text-obsidian-text-muted mb-1">Registros Ingestados</p>
                    <p className="text-2xl font-light text-white">{selectedSource.recordsIngested.toLocaleString()}</p>
                  </div>
                  <div className="bg-[#16161A] border border-white/10 rounded p-4">
                    <p className="text-[10px] text-obsidian-text-muted mb-1">Tasa de Error</p>
                    <p className={`text-2xl font-light ${selectedSource.errorRate > 1 ? 'text-red-500' : 'text-obsidian-success'}`}>
                      {selectedSource.errorRate.toFixed(1)}%
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <p className="text-xs text-obsidian-text-muted mb-2">Configuración</p>
                <div className="bg-black/30 border border-white/10 rounded p-4 font-mono text-[10px] text-obsidian-text-secondary">
                  <pre>{JSON.stringify(selectedSource.config, null, 2)}</pre>
                </div>
              </div>
            </div>
          </ObsidianCard>
        ) : (
          <ObsidianCard className="h-full flex items-center justify-center">
            <div className="text-center text-obsidian-text-muted">
              <Server size={48} className="mx-auto mb-4 opacity-20" />
              <p className="text-sm">Selecciona una fuente de conocimiento para ver detalles</p>
            </div>
          </ObsidianCard>
        )}
      </div>
    </div>
  );

  const renderLibrary = () => (
    <div className="w-full h-full">
      <ObsidianCard className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-light text-white mb-1">Biblioteca de Modelos de Industria</h2>
            <p className="text-xs text-obsidian-text-muted">Ontologías predefinidas para sectores específicos</p>
          </div>
          <div className="flex items-center gap-2">
            <Search size={14} className="text-obsidian-text-muted" />
            <input
              type="text"
              placeholder="Buscar sector..."
              className="bg-[#16161A] border border-white/10 rounded-full px-4 py-2 text-xs text-white focus:outline-none focus:border-white/30 transition-colors"
            />
          </div>
        </div>
      </ObsidianCard>

      <div className="grid grid-cols-2 gap-6">
        {ontologies.map(onto => (
          <ObsidianCard key={onto.id} className="hover:border-obsidian-accent/50 transition-all cursor-pointer">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-obsidian-accent/10 rounded flex items-center justify-center">
                  <Book size={24} className="text-obsidian-accent" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-white mb-1">{onto.name}</h3>
                  <p className="text-[10px] text-obsidian-text-muted uppercase tracking-wider">{onto.sector}</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-yellow-500">★</span>
                <span className="text-xs text-white">{onto.rating.toFixed(1)}</span>
              </div>
            </div>

            <p className="text-xs text-obsidian-text-secondary mb-4 leading-relaxed">
              {onto.description}
            </p>

            <div className="grid grid-cols-3 gap-3 mb-4 text-center">
              <div className="bg-[#16161A] rounded p-2">
                <p className="text-lg font-light text-obsidian-accent">{onto.nodeCount}</p>
                <p className="text-[9px] text-obsidian-text-muted uppercase">Conceptos</p>
              </div>
              <div className="bg-[#16161A] rounded p-2">
                <p className="text-lg font-light text-obsidian-accent">{onto.edgeCount}</p>
                <p className="text-[9px] text-obsidian-text-muted uppercase">Relaciones</p>
              </div>
              <div className="bg-[#16161A] rounded p-2">
                <p className="text-lg font-light text-obsidian-accent">{onto.downloadCount}</p>
                <p className="text-[9px] text-obsidian-text-muted uppercase">Descargas</p>
              </div>
            </div>

            <div className="flex items-center justify-between text-[10px] text-obsidian-text-muted mb-4 pb-4 border-b border-white/10">
              <span>Versión {onto.version}</span>
              <span>Por {onto.author}</span>
            </div>

            <div className="flex gap-2">
              <ObsidianButton size="sm" fullWidth>
                <Download size={12} />
                Cargar Modelo
              </ObsidianButton>
              <button className="px-4 py-2 border border-white/20 rounded text-xs text-white hover:bg-white/10 transition-colors">
                Vista Previa
              </button>
            </div>
          </ObsidianCard>
        ))}
      </div>
    </div>
  );

  const renderConflicts = () => (
    <div className="w-full h-full flex gap-6">
      {/* Conflicts List */}
      <div className="w-96 flex flex-col gap-4">
        <ObsidianCard>
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle size={14} className="text-yellow-500" />
            <span className="text-xs uppercase tracking-wider text-white/80 font-medium">Conflictos Semánticos</span>
            <span className="ml-auto px-2 py-0.5 bg-yellow-500/20 rounded text-[10px] text-yellow-500 font-mono">
              {conflicts.filter(c => c.status === 'PENDING').length}
            </span>
          </div>

          <div className="space-y-3 max-h-[calc(50vh-150px)] overflow-y-auto">
            {conflicts.map(conflict => (
              <div
                key={conflict.id}
                className={`p-4 rounded border cursor-pointer transition-all ${
                  conflict.status === 'PENDING'
                    ? 'bg-yellow-500/5 border-yellow-500/30 hover:border-yellow-500/50'
                    : 'bg-[#16161A] border-white/5 opacity-50'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <span className="text-xs text-white font-medium">{conflict.concept}</span>
                  <span className={`px-2 py-0.5 rounded text-[9px] font-mono ${
                    conflict.impact === 'HIGH' ? 'bg-red-500/20 text-red-500' :
                    conflict.impact === 'MEDIUM' ? 'bg-yellow-500/20 text-yellow-500' :
                    'bg-blue-500/20 text-blue-500'
                  }`}>
                    {conflict.impact}
                  </span>
                </div>

                <p className="text-[10px] text-obsidian-text-secondary mb-3">{conflict.description}</p>

                {conflict.status === 'PENDING' && (
                  <div className="flex gap-2">
                    {conflict.sources.map((source, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setConflicts(conflicts.map(c =>
                            c.id === conflict.id ? { ...c, status: 'RESOLVED' as ConflictStatus } : c
                          ));
                        }}
                        className="flex-1 py-2 bg-obsidian-accent/10 border border-obsidian-accent/30 rounded text-[9px] text-obsidian-accent hover:bg-obsidian-accent/20 transition-colors"
                      >
                        Confiar {source.name.split(' ')[0]}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </ObsidianCard>

        <ObsidianCard>
          <div className="flex items-center gap-2 mb-4">
            <GitCommit size={14} className="text-obsidian-accent" />
            <span className="text-xs uppercase tracking-wider text-white/80 font-medium">Propagación de Axiomas</span>
          </div>

          <div className="space-y-4 max-h-[calc(50vh-150px)] overflow-y-auto">
            {events.map(event => (
              <div key={event.id} className="relative pl-4 border-l border-white/10 pb-2">
                <div className="absolute left-[-2.5px] top-[6px] w-[5px] h-[5px] rounded-full bg-obsidian-accent" />

                <div className="flex justify-between items-start mb-1">
                  <span className="text-[9px] text-obsidian-accent font-mono uppercase">{event.changeType}</span>
                  <span className="text-[9px] text-obsidian-text-muted">
                    {new Date(event.timestamp).toLocaleTimeString()}
                  </span>
                </div>

                <p className="text-xs text-white mb-2">{event.change}</p>

                <div className="bg-white/[0.03] rounded p-2 border border-white/5">
                  <p className="text-[9px] text-obsidian-text-muted font-mono mb-1">PROPAGACIÓN ➜</p>
                  <p className="text-[10px] text-obsidian-success mb-2">{event.impact}</p>
                  <div className="flex flex-wrap gap-1">
                    {event.affectedAgents.map((agent, idx) => (
                      <span key={idx} className="px-2 py-0.5 bg-obsidian-accent/10 rounded text-[9px] text-obsidian-accent">
                        {agent}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ObsidianCard>
      </div>

      {/* Conflict Detail / Resolution */}
      <div className="flex-1">
        <ObsidianCard className="h-full">
          <h2 className="text-lg font-light text-white mb-6">Centro de Resolución de Conflictos</h2>

          {conflicts.filter(c => c.status === 'PENDING').length > 0 ? (
            <div className="space-y-6">
              {conflicts.filter(c => c.status === 'PENDING').map(conflict => (
                <div key={conflict.id} className="bg-[#16161A] border border-yellow-500/30 rounded-lg p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-base font-medium text-white mb-1">{conflict.concept}</h3>
                      <p className="text-xs text-obsidian-text-secondary">{conflict.description}</p>
                    </div>
                    <span className={`px-3 py-1 rounded text-xs font-mono ${
                      conflict.impact === 'HIGH' ? 'bg-red-500/20 text-red-500' :
                      conflict.impact === 'MEDIUM' ? 'bg-yellow-500/20 text-yellow-500' :
                      'bg-blue-500/20 text-blue-500'
                    }`}>
                      Impacto {conflict.impact}
                    </span>
                  </div>

                  <div className="space-y-3 mb-6">
                    <p className="text-xs text-obsidian-text-muted uppercase tracking-wider">Definiciones Conflictivas:</p>
                    {conflict.sources.map((source, idx) => (
                      <div key={idx} className="bg-black/30 border border-white/10 rounded p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs text-white font-medium">{source.name}</span>
                          <span className="text-xs text-obsidian-success font-mono">
                            Confianza: {source.confidence.toFixed(1)}%
                          </span>
                        </div>
                        <p className="text-xs text-obsidian-text-secondary italic">"{source.definition}"</p>
                      </div>
                    ))}
                  </div>

                  <div className="mb-6">
                    <p className="text-xs text-obsidian-text-muted mb-2">Nodos Afectados ({conflict.affectedNodes.length}):</p>
                    <div className="flex flex-wrap gap-2">
                      {conflict.affectedNodes.map((nodeId, idx) => (
                        <span key={idx} className="px-3 py-1 bg-white/5 border border-white/10 rounded text-xs text-white font-mono">
                          {nodeId}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-3">
                    {conflict.sources.map((source, idx) => (
                      <ObsidianButton
                        key={idx}
                        fullWidth
                        onClick={() => {
                          setConflicts(conflicts.map(c =>
                            c.id === conflict.id ? { ...c, status: 'RESOLVED' as ConflictStatus } : c
                          ));
                        }}
                      >
                        <CheckCircle size={14} />
                        Usar Definición de {source.name.split(' ')[0]}
                      </ObsidianButton>
                    ))}
                    <button
                      onClick={() => {
                        setConflicts(conflicts.map(c =>
                          c.id === conflict.id ? { ...c, status: 'IGNORED' as ConflictStatus } : c
                        ));
                      }}
                      className="px-6 py-3 border border-white/20 rounded text-sm text-white hover:bg-white/10 transition-colors"
                    >
                      <XCircle size={14} className="inline mr-2" />
                      Ignorar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="h-full flex items-center justify-center">
              <div className="text-center text-obsidian-text-muted">
                <CheckCircle size={48} className="mx-auto mb-4 opacity-20" />
                <p className="text-sm">No hay conflictos pendientes</p>
              </div>
            </div>
          )}
        </ObsidianCard>
      </div>
    </div>
  );

  const renderEditor = () => {
    const nodeToEdit = editingNode || (isCreatingNode ? newNodeData : null);

    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="w-full max-w-2xl">
          <ObsidianCard>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    setViewMode('explorer');
                    setEditingNode(null);
                    setIsCreatingNode(false);
                    setNewNodeData({});
                  }}
                  className="text-obsidian-text-muted hover:text-white transition-colors"
                >
                  <ArrowLeft size={18} />
                </button>
                <h2 className="text-lg font-light text-white">
                  {isCreatingNode ? 'Crear Nuevo Concepto' : 'Editar Concepto'}
                </h2>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs text-obsidian-text-muted mb-2">Nombre del Concepto</label>
                <ObsidianInput
                  value={isCreatingNode ? (newNodeData.label || '') : (editingNode?.label || '')}
                  onChange={(e) => {
                    if (isCreatingNode) {
                      setNewNodeData({ ...newNodeData, label: e.target.value });
                    } else if (editingNode) {
                      setEditingNode({ ...editingNode, label: e.target.value });
                    }
                  }}
                  placeholder="ej. Estrategia de Marketing"
                />
              </div>

              <div>
                <label className="block text-xs text-obsidian-text-muted mb-2">Descripción</label>
                <textarea
                  value={isCreatingNode ? (newNodeData.description || '') : (editingNode?.description || '')}
                  onChange={(e) => {
                    if (isCreatingNode) {
                      setNewNodeData({ ...newNodeData, description: e.target.value });
                    } else if (editingNode) {
                      setEditingNode({ ...editingNode, description: e.target.value });
                    }
                  }}
                  placeholder="Describe el concepto..."
                  rows={3}
                  className="w-full bg-[#16161A] border border-white/10 rounded px-4 py-3 text-sm text-white focus:outline-none focus:border-white/30 transition-colors resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-obsidian-text-muted mb-2">Tipo</label>
                  <select
                    value={isCreatingNode ? (newNodeData.type || 'CONCEPT') : (editingNode?.type || 'CONCEPT')}
                    onChange={(e) => {
                      const type = e.target.value as NodeType;
                      if (isCreatingNode) {
                        setNewNodeData({ ...newNodeData, type });
                      } else if (editingNode) {
                        setEditingNode({ ...editingNode, type });
                      }
                    }}
                    className="w-full bg-[#16161A] border border-white/10 rounded px-4 py-3 text-sm text-white focus:outline-none focus:border-white/30 transition-colors"
                  >
                    <option value="CONCEPT">Concepto</option>
                    <option value="CATEGORY">Categoría</option>
                    <option value="PROPERTY">Propiedad</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs text-obsidian-text-muted mb-2">Estado</label>
                  <select
                    value={isCreatingNode ? (newNodeData.status || 'STABLE') : (editingNode?.status || 'STABLE')}
                    onChange={(e) => {
                      const status = e.target.value as NodeStatus;
                      if (isCreatingNode) {
                        setNewNodeData({ ...newNodeData, status });
                      } else if (editingNode) {
                        setEditingNode({ ...editingNode, status });
                      }
                    }}
                    className="w-full bg-[#16161A] border border-white/10 rounded px-4 py-3 text-sm text-white focus:outline-none focus:border-white/30 transition-colors"
                  >
                    <option value="STABLE">Estable</option>
                    <option value="LIVE">En Vivo</option>
                    <option value="UPDATING">Actualizando</option>
                    <option value="CONFLICT">Conflicto</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-obsidian-text-muted mb-2">Posición X (%)</label>
                  <ObsidianInput
                    type="number"
                    min="0"
                    max="100"
                    value={isCreatingNode ? (newNodeData.x || 50) : (editingNode?.x || 50)}
                    onChange={(e) => {
                      const x = parseInt(e.target.value);
                      if (isCreatingNode) {
                        setNewNodeData({ ...newNodeData, x });
                      } else if (editingNode) {
                        setEditingNode({ ...editingNode, x });
                      }
                    }}
                  />
                </div>

                <div>
                  <label className="block text-xs text-obsidian-text-muted mb-2">Posición Y (%)</label>
                  <ObsidianInput
                    type="number"
                    min="0"
                    max="100"
                    value={isCreatingNode ? (newNodeData.y || 50) : (editingNode?.y || 50)}
                    onChange={(e) => {
                      const y = parseInt(e.target.value);
                      if (isCreatingNode) {
                        setNewNodeData({ ...newNodeData, y });
                      } else if (editingNode) {
                        setEditingNode({ ...editingNode, y });
                      }
                    }}
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-white/10">
                <ObsidianButton
                  fullWidth
                  onClick={() => {
                    if (isCreatingNode && newNodeData.label) {
                      const newNode: OntologyNode = {
                        id: `node_${Date.now()}`,
                        label: newNodeData.label,
                        description: newNodeData.description || '',
                        type: (newNodeData.type as NodeType) || 'CONCEPT',
                        status: (newNodeData.status as NodeStatus) || 'STABLE',
                        x: newNodeData.x || 50,
                        y: newNodeData.y || 50,
                        properties: {},
                      };
                      setNodes([...nodes, newNode]);
                      setIsCreatingNode(false);
                      setNewNodeData({});
                      setViewMode('explorer');
                    } else if (editingNode) {
                      setNodes(nodes.map(n => n.id === editingNode.id ? editingNode : n));
                      setEditingNode(null);
                      setViewMode('explorer');
                    }
                  }}
                >
                  <Save size={14} />
                  {isCreatingNode ? 'Crear Concepto' : 'Guardar Cambios'}
                </ObsidianButton>
                <button
                  onClick={() => {
                    setViewMode('explorer');
                    setEditingNode(null);
                    setIsCreatingNode(false);
                    setNewNodeData({});
                  }}
                  className="flex-1 py-3 border border-white/20 rounded text-sm text-white hover:bg-white/10 transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </ObsidianCard>
        </div>
      </div>
    );
  };

  // ==================== MAIN RENDER ====================

  return (
    <div className="w-full h-screen bg-[#0B0B0D] text-obsidian-text-primary px-6 py-6 flex flex-col gap-6 overflow-hidden font-sans">
      {/* Header with View Tabs */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-light text-white mb-1">Ontology Core</h1>
          <p className="text-sm text-obsidian-text-muted">Gestión del Grafo de Conocimiento</p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setViewMode('explorer')}
            className={`px-4 py-2 rounded text-xs font-medium transition-all ${
              viewMode === 'explorer'
                ? 'bg-obsidian-accent text-white'
                : 'bg-white/5 text-obsidian-text-muted hover:bg-white/10'
            }`}
          >
            <Network size={14} className="inline mr-2" />
            Explorador
          </button>
          <button
            onClick={() => setViewMode('sources')}
            className={`px-4 py-2 rounded text-xs font-medium transition-all ${
              viewMode === 'sources'
                ? 'bg-obsidian-accent text-white'
                : 'bg-white/5 text-obsidian-text-muted hover:bg-white/10'
            }`}
          >
            <Server size={14} className="inline mr-2" />
            Fuentes
          </button>
          <button
            onClick={() => setViewMode('library')}
            className={`px-4 py-2 rounded text-xs font-medium transition-all ${
              viewMode === 'library'
                ? 'bg-obsidian-accent text-white'
                : 'bg-white/5 text-obsidian-text-muted hover:bg-white/10'
            }`}
          >
            <Book size={14} className="inline mr-2" />
            Biblioteca
          </button>
          <button
            onClick={() => setViewMode('conflicts')}
            className={`px-4 py-2 rounded text-xs font-medium transition-all ${
              viewMode === 'conflicts'
                ? 'bg-obsidian-accent text-white'
                : 'bg-white/5 text-obsidian-text-muted hover:bg-white/10'
            }`}
          >
            <AlertTriangle size={14} className="inline mr-2" />
            Conflictos
            {conflicts.filter(c => c.status === 'PENDING').length > 0 && (
              <span className="ml-2 px-2 py-0.5 bg-yellow-500 text-black rounded-full text-[10px] font-bold">
                {conflicts.filter(c => c.status === 'PENDING').length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-hidden">
        {viewMode === 'explorer' && renderExplorer()}
        {viewMode === 'sources' && renderSources()}
        {viewMode === 'library' && renderLibrary()}
        {viewMode === 'conflicts' && renderConflicts()}
        {viewMode === 'editor' && renderEditor()}
      </div>
    </div>
  );
};

export default OntologyCore;
