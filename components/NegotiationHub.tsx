import React, { useState, useEffect, useRef } from 'react';
import { ObsidianCard, ObsidianButton, ObsidianSlider } from './ui/ObsidianElements';
import {
  ShieldCheck, Lock, CheckCircle2, FileCode, Play, AlertTriangle, ArrowRightLeft,
  Plus, TrendingUp, TrendingDown, DollarSign, Clock, Users, Eye, Pause,
  PlayCircle, StopCircle, Calendar, Target, MessageSquare, Activity,
  FileText, Download, Share2, ArrowLeft, ChevronRight, Zap, AlertCircle,
  CheckCircle, XCircle, Edit2, Trash2, BarChart3, Hash
} from 'lucide-react';

// --- Types ---
type ViewMode = 'dashboard' | 'create' | 'detail' | 'contract' | 'history';
type NegotiationType = 'BUY' | 'SELL';
type NegotiationStatus = 'ACTIVE' | 'PAUSED' | 'CLOSED' | 'FAILED' | 'AUCTION';
type ContractStatus = 'DRAFT' | 'PENDING_SIGNATURE' | 'SIGNED' | 'EXECUTED';

interface Negotiation {
  id: string;
  counterparty: string;
  type: NegotiationType;
  product: string;
  currentOffer: number;
  targetPrice: number;
  limitPrice: number;
  status: NegotiationStatus;
  progress: number;
  aggressiveness: number;
  startDate: Date;
  deadline?: Date;
  offers: Offer[];
  sentiment: number;
  strategy: string;
  zopaDetected: boolean;
}

interface Offer {
  id: string;
  timestamp: Date;
  from: 'user' | 'counterparty';
  amount: number;
  conditions: string[];
  sentiment?: number;
  accepted: boolean;
}

interface SmartContract {
  id: string;
  negotiationId: string;
  terms: ContractTerm[];
  escrowAmount: number;
  status: ContractStatus;
  hash?: string;
  signedBy: string[];
}

interface ContractTerm {
  id: string;
  label: string;
  value: string;
  mandatory: boolean;
  accepted: boolean;
}

interface NegotiationForm {
  product: string;
  counterparty: string;
  type: NegotiationType;
  targetPrice: number;
  limitPrice: number;
  deadline: string;
  aggressiveness: number;
}

// --- Sample Data ---
const SAMPLE_NEGOTIATIONS: Negotiation[] = [
  {
    id: 'NEG-001',
    counterparty: 'Acme Corp Supply',
    type: 'BUY',
    product: 'Materia Prima Q4',
    currentOffer: 12450,
    targetPrice: 11000,
    limitPrice: 13500,
    status: 'ACTIVE',
    progress: 68,
    aggressiveness: 65,
    startDate: new Date(Date.now() - 3600000 * 12),
    deadline: new Date(Date.now() + 3600000 * 24),
    offers: [],
    sentiment: 0.6,
    strategy: 'Anchoring Bias',
    zopaDetected: true
  },
  {
    id: 'NEG-002',
    counterparty: 'Globex Logistics',
    type: 'BUY',
    product: 'Servicio de Logística',
    currentOffer: 45000,
    targetPrice: 42000,
    limitPrice: 48000,
    status: 'AUCTION',
    progress: 45,
    aggressiveness: 80,
    startDate: new Date(Date.now() - 3600000 * 6),
    deadline: new Date(Date.now() + 3600000 * 4),
    offers: [],
    sentiment: 0.4,
    strategy: 'Reverse Auction',
    zopaDetected: false
  },
  {
    id: 'NEG-003',
    counterparty: 'Sovereign Systems',
    type: 'SELL',
    product: 'Licencia Software Enterprise',
    currentOffer: 120000,
    targetPrice: 125000,
    limitPrice: 115000,
    status: 'CLOSED',
    progress: 100,
    aggressiveness: 50,
    startDate: new Date(Date.now() - 3600000 * 48),
    offers: [],
    sentiment: 0.9,
    strategy: 'Value-Based',
    zopaDetected: true
  },
  {
    id: 'NEG-004',
    counterparty: 'Massive Dynamic',
    type: 'BUY',
    product: 'Hardware Infrastructure',
    currentOffer: 8900,
    targetPrice: 8000,
    limitPrice: 9500,
    status: 'PAUSED',
    progress: 30,
    aggressiveness: 40,
    startDate: new Date(Date.now() - 3600000 * 24),
    offers: [],
    sentiment: 0.5,
    strategy: 'Gradual Concession',
    zopaDetected: false
  }
];

const NegotiationHub: React.FC = () => {
  // --- State Management ---
  const [viewMode, setViewMode] = useState<ViewMode>('dashboard');
  const [negotiations, setNegotiations] = useState<Negotiation[]>(SAMPLE_NEGOTIATIONS);
  const [selectedNegotiationId, setSelectedNegotiationId] = useState<string | null>(null);
  const [protocolLogs, setProtocolLogs] = useState<string[]>([]);

  // Create form
  const [createForm, setCreateForm] = useState<NegotiationForm>({
    product: '',
    counterparty: '',
    type: 'BUY',
    targetPrice: 0,
    limitPrice: 0,
    deadline: '',
    aggressiveness: 50
  });

  const canvasRef = useRef<HTMLCanvasElement>(null);

  // --- Computed Values ---
  const selectedNegotiation = negotiations.find(n => n.id === selectedNegotiationId);
  const activeNegotiations = negotiations.filter(n => ['ACTIVE', 'AUCTION'].includes(n.status));
  const totalValue = negotiations.reduce((sum, n) => sum + n.currentOffer, 0);

  // --- Protocol Log Simulation ---
  useEffect(() => {
    if (!selectedNegotiation) return;

    setProtocolLogs([
      `[MNP-OUT] > Offer sent: $${(selectedNegotiation.currentOffer * 0.9).toLocaleString()} + Net30.`,
      `[MNP-IN]  < Counter-party rejects. Sentiment: ${selectedNegotiation.sentiment.toFixed(1)}.`,
      `[AI-CORE] ! Calculating Nash Equilibrium...`
    ]);

    const interval = setInterval(() => {
      const actions = [
        `[AI-CORE] ! Adjusting Strategy. Triggering "${selectedNegotiation.strategy}".`,
        `[MNP-OUT] > New Offer: $${(selectedNegotiation.currentOffer * 0.95).toLocaleString()}.`,
        `[MNP-IN]  < Counter-party counter-offers: $${(selectedNegotiation.currentOffer * 0.98).toLocaleString()}.`,
        `[AI-CORE] ${selectedNegotiation.zopaDetected ? 'ZOPA Detected. Converging...' : 'Searching for ZOPA...'}`,
        `[MNP-OUT] > Finalizing terms. Generating Smart Contract hash.`
      ];
      const randomAction = actions[Math.floor(Math.random() * actions.length)];
      setProtocolLogs(prev => [...prev.slice(-6), randomAction]);
    }, 3000);

    return () => clearInterval(interval);
  }, [selectedNegotiation]);

  // --- Nash Equilibrium Canvas ---
  useEffect(() => {
    if (viewMode !== 'detail' || !selectedNegotiation) return;

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
      for(let i=0; i<width; i+=40) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, height);
        ctx.stroke();
      }
      for(let i=0; i<height; i+=40) {
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(width, i);
        ctx.stroke();
      }

      // Axes
      ctx.strokeStyle = '#BEBEC6';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(40, height-40);
      ctx.lineTo(width-40, height-40);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(40, height-40);
      ctx.lineTo(40, 40);
      ctx.stroke();

      // Labels
      ctx.fillStyle = '#8C8C97';
      ctx.font = '10px Inter';
      ctx.fillText('PRICE UTILITY', width-90, height-25);
      ctx.save();
      ctx.translate(25, 100);
      ctx.rotate(-Math.PI/2);
      ctx.fillText('CONDITIONS', 0, 0);
      ctx.restore();

      // Own Curve
      const aggFactor = selectedNegotiation.aggressiveness / 100;
      ctx.beginPath();
      ctx.moveTo(40, 40);
      ctx.bezierCurveTo(width * 0.5, 40, width * (0.5 + aggFactor * 0.2), height * 0.5, width - 40, height - 40);
      ctx.strokeStyle = '#45FF9A';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Opponent Curve
      const oppShift = Math.sin(time) * 20;
      ctx.beginPath();
      ctx.moveTo(40, height - 40);
      ctx.bezierCurveTo(width * 0.3, height - 40, width * 0.6, height * 0.6 + oppShift, width - 40, 40);
      ctx.strokeStyle = '#BEBEC6';
      ctx.setLineDash([5, 5]);
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.setLineDash([]);

      // ZOPA
      if (selectedNegotiation.zopaDetected) {
        ctx.globalCompositeOperation = 'screen';
        ctx.fillStyle = 'rgba(69, 255, 154, 0.05)';
        ctx.beginPath();
        ctx.arc(width/2, height/2, 60 + Math.sin(time*2)*5, 0, Math.PI*2);
        ctx.fill();
        ctx.globalCompositeOperation = 'source-over';
      }

      // Deal Point
      const dealX = (width / 2) + Math.cos(time * 0.5) * 20;
      const dealY = (height / 2) + Math.sin(time * 0.8) * 20;

      ctx.beginPath();
      ctx.arc(dealX, dealY, 4, 0, Math.PI * 2);
      ctx.fillStyle = '#FFFFFF';
      ctx.fill();

      ctx.beginPath();
      ctx.arc(dealX, dealY, 12, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(255,255,255,0.3)';
      ctx.stroke();

      ctx.strokeStyle = 'rgba(255,255,255,0.1)';
      ctx.beginPath();
      ctx.moveTo(dealX, dealY);
      ctx.lineTo(dealX, height-40);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(dealX, dealY);
      ctx.lineTo(40, dealY);
      ctx.stroke();

      animationId = requestAnimationFrame(render);
    };

    render();
    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationId);
    };
  }, [viewMode, selectedNegotiation]);

  // --- Handlers ---
  const handleCreateNegotiation = () => {
    if (!createForm.product || !createForm.counterparty || !createForm.targetPrice) {
      alert('Por favor completa todos los campos requeridos');
      return;
    }

    const newNegotiation: Negotiation = {
      id: `NEG-${String(negotiations.length + 1).padStart(3, '0')}`,
      counterparty: createForm.counterparty,
      type: createForm.type,
      product: createForm.product,
      currentOffer: createForm.type === 'BUY' ? createForm.limitPrice : createForm.targetPrice,
      targetPrice: createForm.targetPrice,
      limitPrice: createForm.limitPrice,
      status: 'ACTIVE',
      progress: 0,
      aggressiveness: createForm.aggressiveness,
      startDate: new Date(),
      deadline: createForm.deadline ? new Date(createForm.deadline) : undefined,
      offers: [],
      sentiment: 0.5,
      strategy: 'Initial Positioning',
      zopaDetected: false
    };

    setNegotiations([...negotiations, newNegotiation]);
    setCreateForm({
      product: '',
      counterparty: '',
      type: 'BUY',
      targetPrice: 0,
      limitPrice: 0,
      deadline: '',
      aggressiveness: 50
    });
    setViewMode('dashboard');
  };

  const handleNegotiationAction = (negotiationId: string, action: 'pause' | 'resume' | 'cancel') => {
    setNegotiations(prev => prev.map(n => {
      if (n.id === negotiationId) {
        switch (action) {
          case 'pause':
            return { ...n, status: 'PAUSED' as NegotiationStatus };
          case 'resume':
            return { ...n, status: 'ACTIVE' as NegotiationStatus };
          case 'cancel':
            return { ...n, status: 'FAILED' as NegotiationStatus };
          default:
            return n;
        }
      }
      return n;
    }));
  };

  const handleViewDetail = (negotiationId: string) => {
    setSelectedNegotiationId(negotiationId);
    setViewMode('detail');
  };

  const getStatusColor = (status: NegotiationStatus) => {
    switch (status) {
      case 'ACTIVE': return 'text-[#6A4FFB] border-[#6A4FFB]/30 bg-[#6A4FFB]/10';
      case 'AUCTION': return 'text-yellow-400 border-yellow-400/30 bg-yellow-400/10';
      case 'PAUSED': return 'text-gray-400 border-gray-400/30 bg-gray-400/10';
      case 'CLOSED': return 'text-[#45FF9A] border-[#45FF9A]/30 bg-[#45FF9A]/10';
      case 'FAILED': return 'text-red-400 border-red-400/30 bg-red-400/10';
      default: return 'text-gray-400 border-gray-400/30 bg-gray-400/10';
    }
  };

  const getStatusIcon = (status: NegotiationStatus) => {
    switch (status) {
      case 'ACTIVE': return <Activity size={12} className="animate-pulse" />;
      case 'AUCTION': return <AlertTriangle size={12} className="animate-pulse" />;
      case 'PAUSED': return <Pause size={12} />;
      case 'CLOSED': return <CheckCircle size={12} />;
      case 'FAILED': return <XCircle size={12} />;
      default: return <Clock size={12} />;
    }
  };

  // --- Render Functions ---
  const renderDashboard = () => (
    <div className="w-full h-screen bg-[#0B0B0D] text-obsidian-text-primary px-6 py-6 flex flex-col overflow-hidden">
      <div className="mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-light text-[#F5F5F7] tracking-wide mb-1">Negotiation Hub</h1>
            <p className="text-sm text-obsidian-text-muted">Centro de negociación automática B2B</p>
          </div>
          <div className="flex gap-4 items-center">
            <div className="text-right">
              <div className="text-sm text-obsidian-text-muted">Negociaciones Activas</div>
              <div className="text-2xl font-thin text-white">{activeNegotiations.length}</div>
            </div>
            <div className="text-right">
              <div className="text-sm text-obsidian-text-muted">Valor Total</div>
              <div className="text-2xl font-thin text-white">${(totalValue / 1000).toFixed(0)}K</div>
            </div>
            <ObsidianButton
              onClick={() => setViewMode('create')}
              icon={<Plus size={16} />}
            >
              Nueva Negociación
            </ObsidianButton>
          </div>
        </div>
      </div>

      {/* Negotiations Table */}
      <div className="flex-1 overflow-y-auto">
        <div className="grid grid-cols-1 gap-4">
          {negotiations.map(negotiation => (
            <ObsidianCard key={negotiation.id} className="hover:bg-white/[0.02] transition-all group">
              <div className="flex gap-6">
                {/* Left: Info */}
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="text-lg font-normal text-[#F5F5F7]">{negotiation.product}</h3>
                        <span className="text-[10px] text-obsidian-text-muted font-mono opacity-60">[{negotiation.id}]</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-obsidian-text-muted">
                        <Users size={12} />
                        <span>{negotiation.counterparty}</span>
                      </div>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-[10px] font-medium tracking-widest uppercase flex items-center gap-2 border ${getStatusColor(negotiation.status)}`}>
                      {getStatusIcon(negotiation.status)}
                      {negotiation.status}
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-3">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-obsidian-text-muted">Progreso</span>
                      <span className="text-white">{negotiation.progress}%</span>
                    </div>
                    <div className="w-full h-1 bg-white/[0.05] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#6A4FFB] shadow-[0_0_10px_#6A4FFB] transition-all duration-300"
                        style={{ width: `${negotiation.progress}%` }}
                      />
                    </div>
                  </div>

                  {/* KPIs */}
                  <div className="grid grid-cols-5 gap-4">
                    <div>
                      <div className="text-[10px] text-obsidian-text-muted uppercase mb-1">Tipo</div>
                      <div className="flex items-center gap-2 text-sm text-white">
                        {negotiation.type === 'BUY' ? <TrendingDown size={14} /> : <TrendingUp size={14} />}
                        <span>{negotiation.type}</span>
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] text-obsidian-text-muted uppercase mb-1">Oferta Actual</div>
                      <div className="text-sm text-white">${(negotiation.currentOffer / 1000).toFixed(1)}K</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-obsidian-text-muted uppercase mb-1">Objetivo</div>
                      <div className="text-sm text-white">${(negotiation.targetPrice / 1000).toFixed(1)}K</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-obsidian-text-muted uppercase mb-1">Sentimiento</div>
                      <div className="text-sm text-white">{(negotiation.sentiment * 100).toFixed(0)}%</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-obsidian-text-muted uppercase mb-1">Estrategia</div>
                      <div className="text-sm text-white truncate">{negotiation.strategy}</div>
                    </div>
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex flex-col justify-between items-end">
                  <button
                    onClick={() => handleViewDetail(negotiation.id)}
                    className="p-2 rounded-lg border border-white/[0.1] hover:bg-white/[0.05] transition-all opacity-0 group-hover:opacity-100"
                  >
                    <Eye size={16} className="text-white" />
                  </button>

                  <div className="flex gap-2">
                    {negotiation.status === 'ACTIVE' && (
                      <button
                        onClick={() => handleNegotiationAction(negotiation.id, 'pause')}
                        className="p-2 rounded-lg border border-white/[0.1] hover:bg-white/[0.05] transition-all"
                        title="Pausar"
                      >
                        <Pause size={14} className="text-yellow-400" />
                      </button>
                    )}
                    {negotiation.status === 'PAUSED' && (
                      <button
                        onClick={() => handleNegotiationAction(negotiation.id, 'resume')}
                        className="p-2 rounded-lg border border-white/[0.1] hover:bg-white/[0.05] transition-all"
                        title="Reanudar"
                      >
                        <PlayCircle size={14} className="text-[#45FF9A]" />
                      </button>
                    )}
                    {['ACTIVE', 'PAUSED'].includes(negotiation.status) && (
                      <button
                        onClick={() => handleNegotiationAction(negotiation.id, 'cancel')}
                        className="p-2 rounded-lg border border-white/[0.1] hover:bg-red-500/[0.1] transition-all"
                        title="Cancelar"
                      >
                        <StopCircle size={14} className="text-red-400" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </ObsidianCard>
          ))}
        </div>

        {negotiations.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-obsidian-text-muted">
            <ArrowRightLeft size={64} className="mb-4 opacity-20" />
            <p className="text-sm mb-4">No hay negociaciones activas</p>
            <ObsidianButton
              onClick={() => setViewMode('create')}
              icon={<Plus size={16} />}
            >
              Crear Primera Negociación
            </ObsidianButton>
          </div>
        )}
      </div>
    </div>
  );

  const renderCreate = () => (
    <div className="w-full h-screen bg-[#0B0B0D] text-obsidian-text-primary px-6 py-6 flex flex-col overflow-hidden">
      <div className="mb-6 flex items-center gap-4">
        <button
          onClick={() => setViewMode('dashboard')}
          className="p-2 rounded-lg border border-white/[0.1] hover:bg-white/[0.05] transition-all"
        >
          <ArrowLeft size={20} className="text-white" />
        </button>
        <div>
          <h1 className="text-2xl font-light text-[#F5F5F7] tracking-wide">Iniciar Nueva Negociación</h1>
          <p className="text-sm text-obsidian-text-muted">Configura los parámetros para la negociación autónoma</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto">
          <ObsidianCard className="mb-6">
            <h3 className="text-lg font-normal text-[#F5F5F7] mb-4">Información Básica</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-obsidian-text-muted uppercase tracking-wider block mb-2">
                    Producto/Servicio *
                  </label>
                  <input
                    type="text"
                    value={createForm.product}
                    onChange={(e) => setCreateForm({ ...createForm, product: e.target.value })}
                    placeholder="Ej: Materia Prima Q4"
                    className="w-full bg-white/[0.02] border border-white/[0.1] rounded-lg px-4 py-2 text-white focus:outline-none focus:border-obsidian-accent transition-colors"
                  />
                </div>
                <div>
                  <label className="text-xs text-obsidian-text-muted uppercase tracking-wider block mb-2">
                    Contraparte *
                  </label>
                  <input
                    type="text"
                    value={createForm.counterparty}
                    onChange={(e) => setCreateForm({ ...createForm, counterparty: e.target.value })}
                    placeholder="Ej: Acme Corp"
                    className="w-full bg-white/[0.02] border border-white/[0.1] rounded-lg px-4 py-2 text-white focus:outline-none focus:border-obsidian-accent transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-obsidian-text-muted uppercase tracking-wider block mb-3">
                  Tipo de Negociación
                </label>
                <div className="flex gap-3">
                  {[
                    { id: 'BUY', label: 'Compra', icon: <TrendingDown size={14} /> },
                    { id: 'SELL', label: 'Venta', icon: <TrendingUp size={14} /> }
                  ].map(type => (
                    <button
                      key={type.id}
                      onClick={() => setCreateForm({ ...createForm, type: type.id as NegotiationType })}
                      className={`
                        flex-1 py-3 px-4 border rounded-lg text-xs uppercase flex items-center justify-center gap-2 transition-all
                        ${createForm.type === type.id
                          ? 'border-obsidian-accent bg-obsidian-accent/10 text-obsidian-accent'
                          : 'border-white/[0.1] text-white hover:bg-white/[0.05]'}
                      `}
                    >
                      {type.icon}
                      {type.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </ObsidianCard>

          <ObsidianCard className="mb-6">
            <h3 className="text-lg font-normal text-[#F5F5F7] mb-4">Parámetros de Precio</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-obsidian-text-muted uppercase tracking-wider block mb-2">
                    Precio Objetivo *
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-obsidian-text-muted">$</span>
                    <input
                      type="number"
                      value={createForm.targetPrice || ''}
                      onChange={(e) => setCreateForm({ ...createForm, targetPrice: Number(e.target.value) })}
                      placeholder="0"
                      className="w-full bg-white/[0.02] border border-white/[0.1] rounded-lg pl-8 pr-4 py-2 text-white focus:outline-none focus:border-obsidian-accent transition-colors"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs text-obsidian-text-muted uppercase tracking-wider block mb-2">
                    Precio Límite *
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-obsidian-text-muted">$</span>
                    <input
                      type="number"
                      value={createForm.limitPrice || ''}
                      onChange={(e) => setCreateForm({ ...createForm, limitPrice: Number(e.target.value) })}
                      placeholder="0"
                      className="w-full bg-white/[0.02] border border-white/[0.1] rounded-lg pl-8 pr-4 py-2 text-white focus:outline-none focus:border-obsidian-accent transition-colors"
                    />
                  </div>
                </div>
              </div>
              <div>
                <label className="text-xs text-obsidian-text-muted uppercase tracking-wider block mb-2">
                  Fecha Límite
                </label>
                <input
                  type="datetime-local"
                  value={createForm.deadline}
                  onChange={(e) => setCreateForm({ ...createForm, deadline: e.target.value })}
                  className="w-full bg-white/[0.02] border border-white/[0.1] rounded-lg px-4 py-2 text-white focus:outline-none focus:border-obsidian-accent transition-colors"
                />
              </div>
            </div>
          </ObsidianCard>

          <ObsidianCard className="mb-6">
            <h3 className="text-lg font-normal text-[#F5F5F7] mb-4">Estrategia de IA</h3>
            <div>
              <ObsidianSlider
                label="Nivel de Agresividad"
                min={0}
                max={100}
                value={createForm.aggressiveness}
                onChange={(e) => setCreateForm({ ...createForm, aggressiveness: Number(e.target.value) })}
                valueDisplay={`${createForm.aggressiveness}%`}
              />
              <p className="text-xs text-obsidian-text-muted mt-2">
                {createForm.aggressiveness < 33 && 'Conservador: Prioriza mantener buena relación con la contraparte'}
                {createForm.aggressiveness >= 33 && createForm.aggressiveness < 66 && 'Equilibrado: Balance entre objetivos y relación'}
                {createForm.aggressiveness >= 66 && 'Agresivo: Prioriza alcanzar el objetivo a toda costa'}
              </p>
            </div>
          </ObsidianCard>

          <div className="flex justify-end gap-4 pb-6">
            <button
              onClick={() => setViewMode('dashboard')}
              className="px-6 py-2 border border-white/[0.1] rounded-lg text-white hover:bg-white/[0.05] transition-all"
            >
              Cancelar
            </button>
            <ObsidianButton
              onClick={handleCreateNegotiation}
              icon={<PlayCircle size={16} />}
            >
              Iniciar Negociación
            </ObsidianButton>
          </div>
        </div>
      </div>
    </div>
  );

  const renderDetail = () => {
    if (!selectedNegotiation) return null;

    return (
      <div className="w-full h-screen bg-[#0B0B0D] text-obsidian-text-primary px-6 py-6 flex flex-col overflow-hidden">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setViewMode('dashboard')}
              className="p-2 rounded-lg border border-white/[0.1] hover:bg-white/[0.05] transition-all"
            >
              <ArrowLeft size={20} className="text-white" />
            </button>
            <div>
              <h1 className="text-2xl font-light text-[#F5F5F7] tracking-wide flex items-center gap-3">
                {selectedNegotiation.product}
                <span className="text-[10px] text-obsidian-text-muted font-mono opacity-60">[{selectedNegotiation.id}]</span>
              </h1>
              <p className="text-sm text-obsidian-text-muted">
                {selectedNegotiation.counterparty}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className={`px-4 py-2 rounded-full text-xs font-medium tracking-widest uppercase flex items-center gap-2 border ${getStatusColor(selectedNegotiation.status)}`}>
              {getStatusIcon(selectedNegotiation.status)}
              {selectedNegotiation.status}
            </div>
            <div className="flex gap-2">
              {selectedNegotiation.status === 'ACTIVE' && (
                <button
                  onClick={() => handleNegotiationAction(selectedNegotiation.id, 'pause')}
                  className="p-2 rounded-lg border border-white/[0.1] hover:bg-white/[0.05] transition-all"
                >
                  <Pause size={16} className="text-yellow-400" />
                </button>
              )}
              {selectedNegotiation.status === 'PAUSED' && (
                <button
                  onClick={() => handleNegotiationAction(selectedNegotiation.id, 'resume')}
                  className="p-2 rounded-lg border border-white/[0.1] hover:bg-white/[0.05] transition-all"
                >
                  <PlayCircle size={16} className="text-[#45FF9A]" />
                </button>
              )}
              <button
                onClick={() => handleNegotiationAction(selectedNegotiation.id, 'cancel')}
                className="p-2 rounded-lg border border-white/[0.1] hover:bg-red-500/[0.1] transition-all"
              >
                <StopCircle size={16} className="text-red-400" />
              </button>
            </div>
          </div>
        </div>

        <div className="flex-1 flex gap-6 overflow-hidden">
          {/* Left: Nash & Protocol */}
          <div className="w-[60%] flex flex-col gap-4">
            {/* Nash Equilibrium */}
            <ObsidianCard className="flex-1 relative" noPadding>
              <div className="absolute top-4 left-4 z-10">
                <div className="flex items-center gap-2 mb-1">
                  <ArrowRightLeft size={14} className="text-obsidian-text-muted" />
                  <span className="text-[10px] uppercase tracking-widest text-obsidian-text-muted">Motor de Equilibrio Nash</span>
                </div>
                {selectedNegotiation.zopaDetected && (
                  <div className="flex items-center gap-2 mt-2">
                    <CheckCircle size={12} className="text-[#45FF9A]" />
                    <span className="text-xs text-[#45FF9A]">ZOPA Detectado</span>
                  </div>
                )}
              </div>
              <canvas ref={canvasRef} className="w-full h-full" />
            </ObsidianCard>

            {/* Protocol Stream */}
            <ObsidianCard className="flex-[0.8] flex flex-col overflow-hidden" noPadding>
              <div className="p-3 border-b border-white/[0.04] bg-[#0F0F12]/90 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-obsidian-accent animate-pulse"></div>
                  <span className="text-[9px] font-mono text-obsidian-text-muted">PROTOCOL STREAM // PORT: 443</span>
                </div>
              </div>
              <div className="flex-1 p-4 overflow-y-auto font-mono text-[10px] space-y-1.5 bg-black/40">
                {protocolLogs.map((log, i) => {
                  let colorClass = 'text-obsidian-text-muted';
                  if(log.includes('[MNP-OUT]')) colorClass = 'text-obsidian-success';
                  if(log.includes('[AI-CORE]')) colorClass = 'text-obsidian-accent';
                  return (
                    <div key={i} className="flex gap-2 opacity-90">
                      <span className="opacity-30 select-none">{(1000 + i).toString(16).toUpperCase()}</span>
                      <span className={colorClass}>{log}</span>
                    </div>
                  )
                })}
                <div className="animate-pulse text-obsidian-accent">_</div>
              </div>
            </ObsidianCard>
          </div>

          {/* Right: Info & Strategy */}
          <div className="w-[40%] flex flex-col gap-4 overflow-y-auto">
            {/* Negotiation Info */}
            <ObsidianCard>
              <h3 className="text-sm font-normal text-white mb-4 uppercase tracking-wider">Información</h3>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <div className="text-[10px] text-obsidian-text-muted uppercase mb-1">Oferta Actual</div>
                    <div className="text-lg font-thin text-white">${selectedNegotiation.currentOffer.toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-obsidian-text-muted uppercase mb-1">Objetivo</div>
                    <div className="text-lg font-thin text-white">${selectedNegotiation.targetPrice.toLocaleString()}</div>
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-obsidian-text-muted uppercase mb-1">Progreso</div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 bg-white/[0.05] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-obsidian-accent to-[#45FF9A] transition-all duration-300"
                        style={{ width: `${selectedNegotiation.progress}%` }}
                      />
                    </div>
                    <span className="text-sm text-white">{selectedNegotiation.progress}%</span>
                  </div>
                </div>
              </div>
            </ObsidianCard>

            {/* Strategy */}
            <ObsidianCard>
              <h3 className="text-sm font-normal text-white mb-4 uppercase tracking-wider flex items-center gap-2">
                <Zap size={14} />
                Estrategia Actual
              </h3>
              <div className="space-y-3">
                <div className="p-3 bg-white/[0.02] border border-white/[0.05] rounded-lg">
                  <div className="text-xs text-obsidian-text-muted mb-1">Táctica</div>
                  <div className="text-sm text-white">{selectedNegotiation.strategy}</div>
                </div>
                <div className="p-3 bg-white/[0.02] border border-white/[0.05] rounded-lg">
                  <div className="text-xs text-obsidian-text-muted mb-1">Análisis de Sentimiento</div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1">
                      <div className="h-2 bg-white/[0.05] rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all duration-300 ${
                            selectedNegotiation.sentiment > 0.7 ? 'bg-green-500' :
                            selectedNegotiation.sentiment > 0.4 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${selectedNegotiation.sentiment * 100}%` }}
                        />
                      </div>
                    </div>
                    <span className="text-sm text-white">{(selectedNegotiation.sentiment * 100).toFixed(0)}%</span>
                  </div>
                </div>
                <div className="p-3 bg-white/[0.02] border border-white/[0.05] rounded-lg">
                  <div className="text-xs text-obsidian-text-muted mb-1">Agresividad</div>
                  <ObsidianSlider
                    label=""
                    min={0}
                    max={100}
                    value={selectedNegotiation.aggressiveness}
                    onChange={() => {}}
                    valueDisplay={`${selectedNegotiation.aggressiveness}%`}
                  />
                </div>
              </div>
            </ObsidianCard>

            {/* Contract Preview */}
            {selectedNegotiation.status === 'CLOSED' && (
              <ObsidianCard className="border-2 border-[#45FF9A]/30">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-normal text-white uppercase tracking-wider flex items-center gap-2">
                    <FileCode size={14} className="text-[#45FF9A]" />
                    Contrato Listo
                  </h3>
                  <CheckCircle size={16} className="text-[#45FF9A]" />
                </div>
                <p className="text-xs text-obsidian-text-muted mb-4">
                  La negociación se cerró exitosamente. Revisa y firma el contrato inteligente.
                </p>
                <ObsidianButton
                  onClick={() => setViewMode('contract')}
                  icon={<FileText size={16} />}
                  className="w-full"
                >
                  Ver Contrato
                </ObsidianButton>
              </ObsidianCard>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderContract = () => (
    <div className="w-full h-screen bg-[#0B0B0D] text-obsidian-text-primary px-6 py-6 flex flex-col overflow-hidden">
      <div className="mb-6 flex items-center gap-4">
        <button
          onClick={() => setViewMode('detail')}
          className="p-2 rounded-lg border border-white/[0.1] hover:bg-white/[0.05] transition-all"
        >
          <ArrowLeft size={20} className="text-white" />
        </button>
        <div>
          <h1 className="text-2xl font-light text-[#F5F5F7] tracking-wide">Contrato Inteligente</h1>
          <p className="text-sm text-obsidian-text-muted">Revisión y firma de contrato</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Contract Terms */}
          <ObsidianCard>
            <h3 className="text-lg font-normal text-white mb-4">Términos del Contrato</h3>
            <div className="space-y-3">
              {[
                { label: 'Bloqueo de Precio', value: 'Fijo', mandatory: true, accepted: true },
                { label: 'Penalización SLA', value: '5% por día de retraso', mandatory: true, accepted: true },
                { label: 'Jurisdicción', value: 'Tribunal DAO', mandatory: true, accepted: true },
                { label: 'Seguro de Envío', value: 'Incluido', mandatory: false, accepted: true },
                { label: 'Plazo de Entrega', value: '30 días naturales', mandatory: true, accepted: true }
              ].map((term, i) => (
                <div key={i} className="p-4 bg-white/[0.02] border border-white/[0.05] rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm text-white">{term.label}</span>
                        {term.mandatory && (
                          <span className="text-[9px] px-2 py-0.5 bg-red-500/20 text-red-400 rounded">OBLIGATORIO</span>
                        )}
                      </div>
                      <p className="text-xs text-obsidian-text-muted">{term.value}</p>
                    </div>
                    {term.accepted ? (
                      <CheckCircle2 size={16} className="text-[#45FF9A]" />
                    ) : (
                      <div className="w-4 h-4 rounded-full border border-white/20"></div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </ObsidianCard>

          {/* Escrow */}
          <ObsidianCard className="border-2 border-yellow-500/30 bg-yellow-500/5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-normal text-white uppercase tracking-wider flex items-center gap-2">
                <Lock size={14} className="text-yellow-400" />
                Bóveda Escrow
              </h3>
              <span className="text-[9px] text-yellow-400 bg-yellow-500/20 px-2 py-1 rounded">BLOQUEADO</span>
            </div>
            <div className="text-3xl font-thin text-white mb-2">
              {selectedNegotiation?.currentOffer.toLocaleString()} <span className="text-sm text-obsidian-text-muted">USDC</span>
            </div>
            <p className="text-xs text-obsidian-text-muted mb-4">
              Los fondos serán transferidos a la bóveda de escrow al firmar el contrato y liberados al cumplirse las condiciones.
            </p>
            <div className="p-3 bg-white/[0.02] rounded border border-white/[0.05]">
              <div className="text-[10px] text-obsidian-text-muted uppercase mb-1">Hash del Contrato</div>
              <div className="flex items-center gap-2">
                <Hash size={12} className="text-obsidian-accent" />
                <span className="text-xs font-mono text-white">0x8f7a2e9c...4b1d3c8a</span>
              </div>
            </div>
          </ObsidianCard>

          {/* Actions */}
          <div className="flex justify-end gap-4 pb-6">
            <button
              onClick={() => setViewMode('detail')}
              className="px-6 py-2 border border-white/[0.1] rounded-lg text-white hover:bg-white/[0.05] transition-all"
            >
              Cancelar
            </button>
            <ObsidianButton
              onClick={() => {
                alert('Contrato firmado exitosamente');
                setViewMode('dashboard');
              }}
              icon={<CheckCircle size={16} />}
            >
              Firmar Contrato
            </ObsidianButton>
          </div>
        </div>
      </div>
    </div>
  );

  // --- Main Render ---
  switch (viewMode) {
    case 'dashboard':
      return renderDashboard();
    case 'create':
      return renderCreate();
    case 'detail':
      return renderDetail();
    case 'contract':
      return renderContract();
    default:
      return renderDashboard();
  }
};

export default NegotiationHub;
