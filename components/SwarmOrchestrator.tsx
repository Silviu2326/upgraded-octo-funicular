import React, { useState, useEffect, useRef } from 'react';
import { ObsidianCard, ObsidianButton, ObsidianSlider, ObsidianSwitch } from './ui/ObsidianElements';
import {
  Search, Mic, ArrowLeftRight, Play, Activity, AlertCircle, Radio,
  Plus, Pause, StopCircle, PlayCircle, Eye, TrendingUp, Database,
  Users, Clock, DollarSign, CheckCircle, XCircle, ChevronRight,
  Settings, BarChart3, FileText, AlertTriangle, X, Edit2, Trash2
} from 'lucide-react';

// --- Types ---
type SwarmType = 'research' | 'sentiment' | 'negotiation' | 'lead_generation' | 'content_creation' | 'market_analysis';
type MissionStatus = 'IDLE' | 'DEPLOYING' | 'OPERATIONAL' | 'PAUSED' | 'COMPLETED' | 'FAILED';
type ViewMode = 'dashboard' | 'detail' | 'create';

interface SwarmTemplate {
  id: SwarmType;
  name: string;
  description: string;
  icon: React.ReactNode;
  estimatedCost: string;
  defaultAgents: number;
  capabilities: string[];
}

interface Mission {
  id: string;
  name: string;
  swarmType: SwarmType;
  status: MissionStatus;
  progress: number;
  agentCount: number;
  objective: string;
  kpis: {
    dataProcessed: string;
    tasksCompleted: number;
    accuracy: number;
    sentiment?: number;
  };
  cost: number;
  startTime: Date;
  estimatedCompletion?: Date;
  logs: LogEntry[];
  results: MissionResult[];
}

interface LogEntry {
  id: string;
  timestamp: Date;
  level: 'info' | 'warning' | 'error' | 'success';
  message: string;
  agentId?: string;
}

interface MissionResult {
  id: string;
  type: 'report' | 'data' | 'insight';
  title: string;
  content: string;
  timestamp: Date;
}

interface CreateMissionForm {
  name: string;
  swarmType: SwarmType | null;
  objective: string;
  maxAgents: number;
  budget: number;
  priority: 'speed' | 'accuracy' | 'balanced';
  criticalAlerts: boolean;
}

// --- Swarm Templates Library ---
const SWARM_TEMPLATES: SwarmTemplate[] = [
  {
    id: 'research',
    name: 'Research Extremo',
    description: 'Escanea 500 fuentes, simula 50 embudos de conversión y analiza competencia.',
    icon: <Search size={18} />,
    estimatedCost: '$0.50/hora',
    defaultAgents: 250,
    capabilities: ['Web Scraping', 'Data Mining', 'Competitive Analysis', 'Funnel Simulation']
  },
  {
    id: 'sentiment',
    name: 'Análisis de Sentimiento',
    description: 'Procesamiento NLP en tiempo real de redes sociales y comentarios.',
    icon: <Mic size={18} />,
    estimatedCost: '$0.30/hora',
    defaultAgents: 150,
    capabilities: ['NLP Processing', 'Social Media Monitoring', 'Sentiment Scoring', 'Trend Detection']
  },
  {
    id: 'negotiation',
    name: 'Negociación B2B',
    description: 'Agentes autónomos para cierre de tratos y negociación automatizada.',
    icon: <ArrowLeftRight size={18} />,
    estimatedCost: '$0.80/hora',
    defaultAgents: 100,
    capabilities: ['Autonomous Negotiation', 'Deal Scoring', 'Contract Analysis', 'Pricing Optimization']
  },
  {
    id: 'lead_generation',
    name: 'Generación de Leads',
    description: 'Identificación y cualificación automática de leads potenciales.',
    icon: <Users size={18} />,
    estimatedCost: '$0.40/hora',
    defaultAgents: 200,
    capabilities: ['Lead Discovery', 'Qualification Scoring', 'Outreach Automation', 'CRM Integration']
  },
  {
    id: 'content_creation',
    name: 'Creación de Contenido',
    description: 'Generación masiva de contenido personalizado multi-canal.',
    icon: <FileText size={18} />,
    estimatedCost: '$0.60/hora',
    defaultAgents: 180,
    capabilities: ['Content Generation', 'SEO Optimization', 'Multi-channel Adaptation', 'A/B Testing']
  },
  {
    id: 'market_analysis',
    name: 'Análisis de Mercado',
    description: 'Monitoreo continuo de mercado y detección de oportunidades.',
    icon: <TrendingUp size={18} />,
    estimatedCost: '$0.70/hora',
    defaultAgents: 220,
    capabilities: ['Market Monitoring', 'Opportunity Detection', 'Price Tracking', 'Competitor Intelligence']
  },
];

// --- Sample Data ---
const SAMPLE_MISSIONS: Mission[] = [
  {
    id: 'MX-001',
    name: 'Campaña Q4 Research',
    swarmType: 'research',
    status: 'OPERATIONAL',
    progress: 62,
    agentCount: 250,
    objective: 'Analizar competencia y oportunidades de mercado para campaña Q4',
    kpis: {
      dataProcessed: '4.2 TB',
      tasksCompleted: 1247,
      accuracy: 94.5
    },
    cost: 12.50,
    startTime: new Date(Date.now() - 3600000 * 2),
    logs: [],
    results: []
  },
  {
    id: 'MX-002',
    name: 'Social Sentiment Monitor',
    swarmType: 'sentiment',
    status: 'OPERATIONAL',
    progress: 45,
    agentCount: 150,
    objective: 'Monitoreo de sentimiento en redes sociales sobre lanzamiento de producto',
    kpis: {
      dataProcessed: '1.8 TB',
      tasksCompleted: 892,
      accuracy: 91.2,
      sentiment: 78
    },
    cost: 8.20,
    startTime: new Date(Date.now() - 3600000 * 1.5),
    logs: [],
    results: []
  },
  {
    id: 'MX-003',
    name: 'Lead Gen Outbound',
    swarmType: 'lead_generation',
    status: 'PAUSED',
    progress: 28,
    agentCount: 200,
    objective: 'Generación de 5000 leads cualificados para equipo de ventas',
    kpis: {
      dataProcessed: '0.9 TB',
      tasksCompleted: 445,
      accuracy: 88.7
    },
    cost: 5.60,
    startTime: new Date(Date.now() - 3600000 * 4),
    logs: [],
    results: []
  }
];

const SwarmOrchestrator: React.FC = () => {
  // --- State Management ---
  const [viewMode, setViewMode] = useState<ViewMode>('dashboard');
  const [missions, setMissions] = useState<Mission[]>(SAMPLE_MISSIONS);
  const [selectedMissionId, setSelectedMissionId] = useState<string | null>(null);
  const [createForm, setCreateForm] = useState<CreateMissionForm>({
    name: '',
    swarmType: null,
    objective: '',
    maxAgents: 200,
    budget: 50,
    priority: 'balanced',
    criticalAlerts: true
  });

  const canvasRef = useRef<HTMLCanvasElement>(null);

  // --- Computed Values ---
  const selectedMission = missions.find(m => m.id === selectedMissionId);
  const activeMissions = missions.filter(m => ['OPERATIONAL', 'DEPLOYING'].includes(m.status));
  const totalCost = missions.reduce((sum, m) => sum + m.cost, 0);
  const totalAgents = activeMissions.reduce((sum, m) => sum + m.agentCount, 0);

  // --- Canvas Animation for Detail View ---
  useEffect(() => {
    if (viewMode !== 'detail' || !selectedMission) return;

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

    // Particle System
    const particles: { x: number; y: number; tx: number; ty: number; speed: number; phase: number }[] = [];
    const numParticles = selectedMission.agentCount / 2; // Visual representation

    for(let i=0; i<numParticles; i++) {
      particles.push({
        x: canvas.width / 4,
        y: canvas.height / 4,
        tx: Math.random() * (canvas.width / 2),
        ty: Math.random() * (canvas.height / 2),
        speed: Math.random() * 2 + 0.5,
        phase: Math.random() * Math.PI * 2
      });
    }

    let time = 0;
    let animationId: number;

    const render = () => {
      time += 0.05;
      const width = canvas.width / 2;
      const height = canvas.height / 2;

      ctx.clearRect(0, 0, width, height);

      // Draw zones based on swarm type
      ctx.strokeStyle = selectedMission.status === 'OPERATIONAL' ? '#45FF9A' : '#6A4FFB';
      ctx.lineWidth = 1;
      ctx.fillStyle = selectedMission.status === 'OPERATIONAL' ? 'rgba(69, 255, 154, 0.02)' : 'rgba(106, 79, 251, 0.02)';

      const zones = [];
      if (selectedMission.swarmType === 'research') {
        zones.push({ x: width * 0.2, y: height * 0.2, r: 60 });
        zones.push({ x: width * 0.8, y: height * 0.3, r: 80 });
        zones.push({ x: width * 0.5, y: height * 0.8, r: 70 });
      } else if (selectedMission.swarmType === 'sentiment') {
        zones.push({ x: width * 0.5, y: height * 0.5, r: 120 });
      } else {
        zones.push({ x: width * 0.3, y: height * 0.4, r: 50 });
        zones.push({ x: width * 0.7, y: height * 0.6, r: 50 });
      }

      zones.forEach(z => {
        ctx.beginPath();
        ctx.arc(z.x, z.y, z.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(z.x, z.y, z.r + Math.sin(time) * 5, 0, Math.PI * 2);
        ctx.strokeStyle = selectedMission.status === 'OPERATIONAL' ? 'rgba(69, 255, 154, 0.1)' : 'rgba(106, 79, 251, 0.1)';
        ctx.stroke();
      });

      // Core
      const centerX = width / 2;
      const centerY = height / 2;
      const pulseSize = 20 + Math.sin(time * 2) * 5;
      const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, pulseSize * 2);
      gradient.addColorStop(0, 'rgba(106, 79, 251, 0.8)');
      gradient.addColorStop(1, 'rgba(106, 79, 251, 0)');

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(centerX, centerY, pulseSize * 2, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#6A4FFB';
      ctx.beginPath();
      ctx.arc(centerX, centerY, 6, 0, Math.PI * 2);
      ctx.fill();

      // Particles
      ctx.globalCompositeOperation = 'screen';
      particles.forEach(p => {
        const currentZone = zones[Math.floor(Math.abs(Math.sin(p.phase)) * zones.length)];

        if (currentZone) {
          const dx = currentZone.x + Math.cos(time + p.phase)*currentZone.r*0.8 - p.x;
          const dy = currentZone.y + Math.sin(time + p.phase)*currentZone.r*0.8 - p.y;
          const dist = Math.sqrt(dx*dx + dy*dy);

          if (dist > 5) {
            p.x += (dx / dist) * p.speed;
            p.y += (dy / dist) * p.speed;
          } else {
            p.x += (Math.random() - 0.5) * 2;
            p.y += (Math.random() - 0.5) * 2;
          }
        } else {
          p.x = centerX + Math.cos(time * 0.5 + p.phase) * 100;
          p.y = centerY + Math.sin(time * 0.5 + p.phase) * 100;
        }

        ctx.beginPath();
        ctx.moveTo(p.x - (Math.cos(time)*5), p.y - (Math.sin(time)*5));
        ctx.lineTo(p.x, p.y);
        ctx.strokeStyle = 'rgba(106, 79, 251, 0.2)';
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.fillStyle = selectedMission.status === 'OPERATIONAL' ? '#6A4FFB' : '#BEBEC6';
        if (Math.random() > 0.95) ctx.fillStyle = '#45FF9A';
        ctx.fillRect(p.x, p.y, 1.5, 1.5);
      });

      ctx.globalCompositeOperation = 'source-over';

      animationId = requestAnimationFrame(render);
    };

    render();
    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationId);
    };
  }, [viewMode, selectedMission]);

  // --- Mission Progress Simulation ---
  useEffect(() => {
    const interval = setInterval(() => {
      setMissions(prev => prev.map(mission => {
        if (mission.status === 'OPERATIONAL' && mission.progress < 100) {
          return {
            ...mission,
            progress: Math.min(mission.progress + 0.5, 100),
            kpis: {
              ...mission.kpis,
              tasksCompleted: mission.kpis.tasksCompleted + Math.floor(Math.random() * 5)
            },
            cost: mission.cost + 0.01
          };
        }
        return mission;
      }));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  // --- Handlers ---
  const handleCreateMission = () => {
    if (!createForm.name || !createForm.swarmType || !createForm.objective) {
      alert('Por favor completa todos los campos requeridos');
      return;
    }

    const newMission: Mission = {
      id: `MX-${String(missions.length + 1).padStart(3, '0')}`,
      name: createForm.name,
      swarmType: createForm.swarmType,
      status: 'DEPLOYING',
      progress: 0,
      agentCount: createForm.maxAgents,
      objective: createForm.objective,
      kpis: {
        dataProcessed: '0 GB',
        tasksCompleted: 0,
        accuracy: 0
      },
      cost: 0,
      startTime: new Date(),
      logs: [
        {
          id: 'log-1',
          timestamp: new Date(),
          level: 'info',
          message: `Misión ${createForm.name} creada. Desplegando ${createForm.maxAgents} agentes...`
        }
      ],
      results: []
    };

    setMissions([...missions, newMission]);

    // Simulate deployment
    setTimeout(() => {
      setMissions(prev => prev.map(m =>
        m.id === newMission.id ? { ...m, status: 'OPERATIONAL' as MissionStatus } : m
      ));
    }, 2000);

    // Reset form and return to dashboard
    setCreateForm({
      name: '',
      swarmType: null,
      objective: '',
      maxAgents: 200,
      budget: 50,
      priority: 'balanced',
      criticalAlerts: true
    });
    setViewMode('dashboard');
  };

  const handleMissionAction = (missionId: string, action: 'pause' | 'resume' | 'stop') => {
    setMissions(prev => prev.map(mission => {
      if (mission.id === missionId) {
        switch (action) {
          case 'pause':
            return { ...mission, status: 'PAUSED' as MissionStatus };
          case 'resume':
            return { ...mission, status: 'OPERATIONAL' as MissionStatus };
          case 'stop':
            return { ...mission, status: 'COMPLETED' as MissionStatus, progress: 100 };
          default:
            return mission;
        }
      }
      return mission;
    }));
  };

  const handleViewMissionDetail = (missionId: string) => {
    setSelectedMissionId(missionId);
    setViewMode('detail');
  };

  const getStatusColor = (status: MissionStatus) => {
    switch (status) {
      case 'OPERATIONAL': return 'text-[#45FF9A] border-[#45FF9A]/30 bg-[#45FF9A]/10';
      case 'DEPLOYING': return 'text-[#6A4FFB] border-[#6A4FFB]/30 bg-[#6A4FFB]/10';
      case 'PAUSED': return 'text-yellow-400 border-yellow-400/30 bg-yellow-400/10';
      case 'COMPLETED': return 'text-blue-400 border-blue-400/30 bg-blue-400/10';
      case 'FAILED': return 'text-red-400 border-red-400/30 bg-red-400/10';
      default: return 'text-gray-400 border-gray-400/30 bg-gray-400/10';
    }
  };

  const getStatusIcon = (status: MissionStatus) => {
    switch (status) {
      case 'OPERATIONAL': return <Activity size={12} className="animate-pulse" />;
      case 'DEPLOYING': return <PlayCircle size={12} className="animate-bounce" />;
      case 'PAUSED': return <Pause size={12} />;
      case 'COMPLETED': return <CheckCircle size={12} />;
      case 'FAILED': return <XCircle size={12} />;
      default: return <StopCircle size={12} />;
    }
  };

  // --- Render Functions ---
  const renderDashboard = () => (
    <div className="w-full h-screen bg-[#0B0B0D] text-obsidian-text-primary px-6 py-6 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="mb-6 animate-[fadeIn_0.5s_ease-out]">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-light text-[#F5F5F7] tracking-wide mb-1">Swarm Orchestrator</h1>
            <p className="text-sm text-obsidian-text-muted">Centro de mando para gestión de enjambres de agentes</p>
          </div>
          <div className="flex gap-4 items-center">
            <div className="text-right">
              <div className="text-sm text-obsidian-text-muted">Agentes Activos</div>
              <div className="text-2xl font-thin text-white">{totalAgents}</div>
            </div>
            <div className="text-right">
              <div className="text-sm text-obsidian-text-muted">Coste Acumulado</div>
              <div className="text-2xl font-thin text-white">${totalCost.toFixed(2)}</div>
            </div>
            <ObsidianButton
              onClick={() => setViewMode('create')}
              icon={<Plus size={16} />}
            >
              Nueva Misión
            </ObsidianButton>
          </div>
        </div>
      </div>

      {/* Missions Grid */}
      <div className="flex-1 overflow-y-auto">
        <div className="grid grid-cols-1 gap-4 animate-[fadeIn_0.6s_ease-out_0.2s_both]">
          {missions.map(mission => (
            <ObsidianCard key={mission.id} className="hover:bg-white/[0.02] transition-all cursor-pointer group">
              <div className="flex gap-6">
                {/* Left: Mission Info */}
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="text-lg font-normal text-[#F5F5F7]">{mission.name}</h3>
                        <span className="text-[10px] text-obsidian-text-muted font-mono opacity-60">[{mission.id}]</span>
                      </div>
                      <p className="text-xs text-obsidian-text-muted">{mission.objective}</p>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-[10px] font-medium tracking-widest uppercase flex items-center gap-2 border ${getStatusColor(mission.status)}`}>
                      {getStatusIcon(mission.status)}
                      {mission.status}
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-3">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-obsidian-text-muted">Progreso</span>
                      <span className="text-white">{mission.progress.toFixed(0)}%</span>
                    </div>
                    <div className="w-full h-1 bg-white/[0.05] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#6A4FFB] shadow-[0_0_10px_#6A4FFB] transition-all duration-300"
                        style={{ width: `${mission.progress}%` }}
                      />
                    </div>
                  </div>

                  {/* KPIs */}
                  <div className="grid grid-cols-4 gap-4">
                    <div>
                      <div className="text-[10px] text-obsidian-text-muted uppercase mb-1">Tipo</div>
                      <div className="flex items-center gap-2 text-sm text-white">
                        {SWARM_TEMPLATES.find(t => t.id === mission.swarmType)?.icon}
                        <span>{SWARM_TEMPLATES.find(t => t.id === mission.swarmType)?.name}</span>
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] text-obsidian-text-muted uppercase mb-1">Agentes</div>
                      <div className="text-sm text-white">{mission.agentCount}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-obsidian-text-muted uppercase mb-1">Tareas</div>
                      <div className="text-sm text-white">{mission.kpis.tasksCompleted}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-obsidian-text-muted uppercase mb-1">Coste</div>
                      <div className="text-sm text-white">${mission.cost.toFixed(2)}</div>
                    </div>
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex flex-col justify-between items-end">
                  <button
                    onClick={() => handleViewMissionDetail(mission.id)}
                    className="p-2 rounded-lg border border-white/[0.1] hover:bg-white/[0.05] transition-all opacity-0 group-hover:opacity-100"
                  >
                    <Eye size={16} className="text-white" />
                  </button>

                  <div className="flex gap-2">
                    {mission.status === 'OPERATIONAL' && (
                      <button
                        onClick={() => handleMissionAction(mission.id, 'pause')}
                        className="p-2 rounded-lg border border-white/[0.1] hover:bg-white/[0.05] transition-all"
                        title="Pausar"
                      >
                        <Pause size={14} className="text-yellow-400" />
                      </button>
                    )}
                    {mission.status === 'PAUSED' && (
                      <button
                        onClick={() => handleMissionAction(mission.id, 'resume')}
                        className="p-2 rounded-lg border border-white/[0.1] hover:bg-white/[0.05] transition-all"
                        title="Reanudar"
                      >
                        <PlayCircle size={14} className="text-[#45FF9A]" />
                      </button>
                    )}
                    {['OPERATIONAL', 'PAUSED'].includes(mission.status) && (
                      <button
                        onClick={() => handleMissionAction(mission.id, 'stop')}
                        className="p-2 rounded-lg border border-white/[0.1] hover:bg-red-500/[0.1] transition-all"
                        title="Detener"
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

        {missions.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-obsidian-text-muted">
            <Radio size={48} className="mb-4 opacity-20" />
            <p className="text-sm">No hay misiones activas</p>
            <button
              onClick={() => setViewMode('create')}
              className="mt-4 text-obsidian-accent hover:text-obsidian-accent-dark text-sm flex items-center gap-2"
            >
              <Plus size={16} />
              Crear primera misión
            </button>
          </div>
        )}
      </div>
    </div>
  );

  const renderCreateMission = () => (
    <div className="w-full h-screen bg-[#0B0B0D] text-obsidian-text-primary px-6 py-6 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="mb-6 flex items-center gap-4">
        <button
          onClick={() => setViewMode('dashboard')}
          className="p-2 rounded-lg border border-white/[0.1] hover:bg-white/[0.05] transition-all"
        >
          <ChevronRight size={20} className="text-white rotate-180" />
        </button>
        <div>
          <h1 className="text-2xl font-light text-[#F5F5F7] tracking-wide">Crear Nueva Misión</h1>
          <p className="text-sm text-obsidian-text-muted">Configura y despliega un nuevo enjambre de agentes</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto">
          {/* Step 1: Basic Info */}
          <ObsidianCard className="mb-6">
            <h3 className="text-lg font-normal text-[#F5F5F7] mb-4 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-obsidian-accent text-white text-xs flex items-center justify-center">1</span>
              Información Básica
            </h3>
            <div className="space-y-4">
              <div>
                <label className="text-xs text-obsidian-text-muted uppercase tracking-wider block mb-2">
                  Nombre de la Misión *
                </label>
                <input
                  type="text"
                  value={createForm.name}
                  onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                  placeholder="Ej: Campaña Q4 Research"
                  className="w-full bg-white/[0.02] border border-white/[0.1] rounded-lg px-4 py-2 text-white focus:outline-none focus:border-obsidian-accent transition-colors"
                />
              </div>
              <div>
                <label className="text-xs text-obsidian-text-muted uppercase tracking-wider block mb-2">
                  Objetivo *
                </label>
                <textarea
                  value={createForm.objective}
                  onChange={(e) => setCreateForm({ ...createForm, objective: e.target.value })}
                  placeholder="Describe el objetivo de esta misión..."
                  rows={3}
                  className="w-full bg-white/[0.02] border border-white/[0.1] rounded-lg px-4 py-2 text-white focus:outline-none focus:border-obsidian-accent transition-colors resize-none"
                />
              </div>
            </div>
          </ObsidianCard>

          {/* Step 2: Swarm Selection */}
          <ObsidianCard className="mb-6">
            <h3 className="text-lg font-normal text-[#F5F5F7] mb-4 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-obsidian-accent text-white text-xs flex items-center justify-center">2</span>
              Selección de Enjambre *
            </h3>
            <div className="grid grid-cols-2 gap-4">
              {SWARM_TEMPLATES.map(template => (
                <button
                  key={template.id}
                  onClick={() => setCreateForm({
                    ...createForm,
                    swarmType: template.id,
                    maxAgents: template.defaultAgents
                  })}
                  className={`
                    text-left p-4 rounded-lg border transition-all duration-300 relative
                    ${createForm.swarmType === template.id
                      ? 'bg-white/[0.04] border-obsidian-accent/50 shadow-[inset_0_0_20px_rgba(106,79,251,0.1)]'
                      : 'bg-[#0F0F12]/60 border-white/[0.04] hover:bg-white/[0.02] hover:border-white/[0.1]'}
                  `}
                >
                  <div className="flex items-start gap-3 mb-3">
                    <div className={`p-2 rounded-md ${createForm.swarmType === template.id ? 'bg-obsidian-accent text-white' : 'bg-white/[0.05] text-obsidian-text-muted'}`}>
                      {template.icon}
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-normal text-[#F5F5F7] mb-1">{template.name}</h4>
                      <p className="text-[10px] text-obsidian-text-muted">{template.description}</p>
                    </div>
                    {createForm.swarmType === template.id && (
                      <CheckCircle size={16} className="text-obsidian-accent" />
                    )}
                  </div>
                  <div className="flex gap-4 text-[10px] text-obsidian-text-muted">
                    <span>{template.estimatedCost}</span>
                    <span>{template.defaultAgents} agentes</span>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {template.capabilities.slice(0, 3).map(cap => (
                      <span key={cap} className="px-2 py-0.5 bg-white/[0.03] rounded text-[9px] text-obsidian-text-muted">
                        {cap}
                      </span>
                    ))}
                  </div>
                </button>
              ))}
            </div>
          </ObsidianCard>

          {/* Step 3: Configuration */}
          <ObsidianCard className="mb-6">
            <h3 className="text-lg font-normal text-[#F5F5F7] mb-4 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-obsidian-accent text-white text-xs flex items-center justify-center">3</span>
              Configuración Avanzada
            </h3>
            <div className="space-y-6">
              <div>
                <ObsidianSlider
                  label="Máximo de Agentes"
                  min={50}
                  max={1000}
                  value={createForm.maxAgents}
                  onChange={(e) => setCreateForm({ ...createForm, maxAgents: Number(e.target.value) })}
                  valueDisplay={createForm.maxAgents}
                />
              </div>
              <div>
                <ObsidianSlider
                  label="Presupuesto Máximo ($)"
                  min={10}
                  max={500}
                  value={createForm.budget}
                  onChange={(e) => setCreateForm({ ...createForm, budget: Number(e.target.value) })}
                  valueDisplay={`$${createForm.budget}`}
                />
              </div>
              <div>
                <label className="text-xs text-obsidian-text-muted uppercase tracking-wider block mb-3">
                  Prioridad
                </label>
                <div className="flex gap-3">
                  {[
                    { id: 'speed', label: 'Velocidad', icon: <TrendingUp size={14} /> },
                    { id: 'balanced', label: 'Equilibrado', icon: <Activity size={14} /> },
                    { id: 'accuracy', label: 'Precisión', icon: <CheckCircle size={14} /> }
                  ].map(priority => (
                    <button
                      key={priority.id}
                      onClick={() => setCreateForm({ ...createForm, priority: priority.id as any })}
                      className={`
                        flex-1 py-3 px-4 border rounded-lg text-xs uppercase flex items-center justify-center gap-2 transition-all
                        ${createForm.priority === priority.id
                          ? 'border-obsidian-accent bg-obsidian-accent/10 text-obsidian-accent'
                          : 'border-white/[0.1] text-white hover:bg-white/[0.05]'}
                      `}
                    >
                      {priority.icon}
                      {priority.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <ObsidianSwitch
                  label="Alertas Críticas Habilitadas"
                  checked={createForm.criticalAlerts}
                  onChange={(checked) => setCreateForm({ ...createForm, criticalAlerts: checked })}
                />
              </div>
            </div>
          </ObsidianCard>

          {/* Actions */}
          <div className="flex justify-end gap-4 pb-6">
            <button
              onClick={() => setViewMode('dashboard')}
              className="px-6 py-2 border border-white/[0.1] rounded-lg text-white hover:bg-white/[0.05] transition-all"
            >
              Cancelar
            </button>
            <ObsidianButton
              onClick={handleCreateMission}
              icon={<PlayCircle size={16} />}
            >
              Desplegar Misión
            </ObsidianButton>
          </div>
        </div>
      </div>
    </div>
  );

  const renderMissionDetail = () => {
    if (!selectedMission) return null;

    const template = SWARM_TEMPLATES.find(t => t.id === selectedMission.swarmType);

    return (
      <div className="w-full h-screen bg-[#0B0B0D] text-obsidian-text-primary px-6 py-6 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setViewMode('dashboard')}
              className="p-2 rounded-lg border border-white/[0.1] hover:bg-white/[0.05] transition-all"
            >
              <ChevronRight size={20} className="text-white rotate-180" />
            </button>
            <div>
              <h1 className="text-2xl font-light text-[#F5F5F7] tracking-wide flex items-center gap-3">
                {selectedMission.name}
                <span className="text-[10px] text-obsidian-text-muted font-mono opacity-60">[{selectedMission.id}]</span>
              </h1>
              <p className="text-sm text-obsidian-text-muted">{selectedMission.objective}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className={`px-4 py-2 rounded-full text-xs font-medium tracking-widest uppercase flex items-center gap-2 border ${getStatusColor(selectedMission.status)}`}>
              {getStatusIcon(selectedMission.status)}
              {selectedMission.status}
            </div>
            <div className="flex gap-2">
              {selectedMission.status === 'OPERATIONAL' && (
                <button
                  onClick={() => handleMissionAction(selectedMission.id, 'pause')}
                  className="p-2 rounded-lg border border-white/[0.1] hover:bg-white/[0.05] transition-all"
                  title="Pausar"
                >
                  <Pause size={16} className="text-yellow-400" />
                </button>
              )}
              {selectedMission.status === 'PAUSED' && (
                <button
                  onClick={() => handleMissionAction(selectedMission.id, 'resume')}
                  className="p-2 rounded-lg border border-white/[0.1] hover:bg-white/[0.05] transition-all"
                  title="Reanudar"
                >
                  <PlayCircle size={16} className="text-[#45FF9A]" />
                </button>
              )}
              <button
                onClick={() => handleMissionAction(selectedMission.id, 'stop')}
                className="p-2 rounded-lg border border-white/[0.1] hover:bg-red-500/[0.1] transition-all"
                title="Detener"
              >
                <StopCircle size={16} className="text-red-400" />
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex gap-6 min-h-0 overflow-hidden">
          {/* Left Column: Visualization & Agents */}
          <div className="w-[60%] flex flex-col gap-6">
            {/* Visualization */}
            <ObsidianCard className="flex-1 relative overflow-hidden" noPadding>
              <div className="absolute top-4 left-4 z-10">
                <div className="flex items-center gap-2 mb-1">
                  <Activity size={14} className="text-obsidian-text-muted" />
                  <span className="text-[10px] text-obsidian-text-muted uppercase tracking-widest">Visualización en Tiempo Real</span>
                </div>
              </div>

              <div className="absolute top-4 right-4 z-10 flex gap-2">
                <div className="bg-[#0F0F12]/80 backdrop-blur border border-white/[0.1] px-3 py-1.5 rounded text-[10px] font-mono text-[#BEBEC6]">
                  {selectedMission.agentCount} AGENTES ACTIVOS
                </div>
                <div className="bg-[#0F0F12]/80 backdrop-blur border border-[#45FF9A]/30 px-3 py-1.5 rounded text-[10px] font-mono text-[#45FF9A]">
                  {selectedMission.kpis.tasksCompleted} TAREAS COMPLETADAS
                </div>
              </div>

              <canvas ref={canvasRef} className="w-full h-full block" />
            </ObsidianCard>

            {/* Progress & KPIs */}
            <ObsidianCard>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-normal text-[#F5F5F7] uppercase tracking-wider">Progreso de Misión</h3>
                <span className="text-2xl font-thin text-white">{selectedMission.progress.toFixed(0)}%</span>
              </div>
              <div className="w-full h-2 bg-white/[0.05] rounded-full overflow-hidden mb-6">
                <div
                  className="h-full bg-gradient-to-r from-obsidian-accent to-[#45FF9A] shadow-[0_0_15px_#6A4FFB] transition-all duration-300"
                  style={{ width: `${selectedMission.progress}%` }}
                />
              </div>

              <div className="grid grid-cols-4 gap-4">
                <div className="p-3 bg-white/[0.02] rounded-lg border border-white/[0.05]">
                  <div className="flex items-center gap-2 mb-2">
                    <Database size={14} className="text-obsidian-text-muted" />
                    <span className="text-[10px] text-obsidian-text-muted uppercase">Datos Procesados</span>
                  </div>
                  <div className="text-lg font-thin text-white">{selectedMission.kpis.dataProcessed}</div>
                </div>
                <div className="p-3 bg-white/[0.02] rounded-lg border border-white/[0.05]">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle size={14} className="text-obsidian-text-muted" />
                    <span className="text-[10px] text-obsidian-text-muted uppercase">Tareas</span>
                  </div>
                  <div className="text-lg font-thin text-white">{selectedMission.kpis.tasksCompleted}</div>
                </div>
                <div className="p-3 bg-white/[0.02] rounded-lg border border-white/[0.05]">
                  <div className="flex items-center gap-2 mb-2">
                    <BarChart3 size={14} className="text-obsidian-text-muted" />
                    <span className="text-[10px] text-obsidian-text-muted uppercase">Precisión</span>
                  </div>
                  <div className="text-lg font-thin text-white">{selectedMission.kpis.accuracy}%</div>
                </div>
                <div className="p-3 bg-white/[0.02] rounded-lg border border-white/[0.05]">
                  <div className="flex items-center gap-2 mb-2">
                    <DollarSign size={14} className="text-obsidian-text-muted" />
                    <span className="text-[10px] text-obsidian-text-muted uppercase">Coste</span>
                  </div>
                  <div className="text-lg font-thin text-white">${selectedMission.cost.toFixed(2)}</div>
                </div>
              </div>
            </ObsidianCard>
          </div>

          {/* Right Column: Info & Logs */}
          <div className="w-[40%] flex flex-col gap-6 overflow-hidden">
            {/* Mission Info */}
            <ObsidianCard>
              <h3 className="text-sm font-normal text-[#F5F5F7] uppercase tracking-wider mb-4 flex items-center gap-2">
                <Settings size={14} />
                Información de Misión
              </h3>
              <div className="space-y-3">
                <div>
                  <div className="text-[10px] text-obsidian-text-muted uppercase mb-1">Tipo de Enjambre</div>
                  <div className="flex items-center gap-2 text-sm text-white">
                    {template?.icon}
                    <span>{template?.name}</span>
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-obsidian-text-muted uppercase mb-1">Agentes Desplegados</div>
                  <div className="text-sm text-white">{selectedMission.agentCount} agentes</div>
                </div>
                <div>
                  <div className="text-[10px] text-obsidian-text-muted uppercase mb-1">Inicio</div>
                  <div className="text-sm text-white">{selectedMission.startTime.toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-[10px] text-obsidian-text-muted uppercase mb-1">Capacidades</div>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {template?.capabilities.map(cap => (
                      <span key={cap} className="px-2 py-1 bg-white/[0.03] rounded text-[9px] text-obsidian-text-muted border border-white/[0.05]">
                        {cap}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </ObsidianCard>

            {/* Live Logs */}
            <ObsidianCard className="flex-1 flex flex-col min-h-0">
              <h3 className="text-sm font-normal text-[#F5F5F7] uppercase tracking-wider mb-4 flex items-center gap-2">
                <FileText size={14} />
                Logs en Tiempo Real
              </h3>
              <div className="flex-1 overflow-y-auto space-y-2 pr-2">
                {selectedMission.logs.length === 0 ? (
                  <div className="text-xs text-obsidian-text-muted italic">
                    Esperando eventos del enjambre...
                  </div>
                ) : (
                  selectedMission.logs.map(log => (
                    <div key={log.id} className="p-2 bg-white/[0.02] rounded border-l-2 border-obsidian-accent/50">
                      <div className="flex items-start gap-2 mb-1">
                        <span className="text-[9px] font-mono text-obsidian-text-muted">
                          {log.timestamp.toLocaleTimeString()}
                        </span>
                        <span className={`
                          text-[9px] font-mono uppercase px-1.5 py-0.5 rounded
                          ${log.level === 'error' ? 'bg-red-500/20 text-red-400' : ''}
                          ${log.level === 'warning' ? 'bg-yellow-500/20 text-yellow-400' : ''}
                          ${log.level === 'success' ? 'bg-green-500/20 text-green-400' : ''}
                          ${log.level === 'info' ? 'bg-blue-500/20 text-blue-400' : ''}
                        `}>
                          {log.level}
                        </span>
                      </div>
                      <p className="text-[11px] text-white/80">{log.message}</p>
                    </div>
                  ))
                )}

                {/* Simulated live activity */}
                <div className="p-2 bg-white/[0.02] rounded border-l-2 border-[#45FF9A]/50 animate-pulse">
                  <div className="flex items-start gap-2 mb-1">
                    <span className="text-[9px] font-mono text-obsidian-text-muted">
                      {new Date().toLocaleTimeString()}
                    </span>
                    <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded bg-green-500/20 text-green-400">
                      INFO
                    </span>
                  </div>
                  <p className="text-[11px] text-white/80">Agente #{Math.floor(Math.random() * selectedMission.agentCount)} procesando datos...</p>
                </div>
              </div>
            </ObsidianCard>
          </div>
        </div>
      </div>
    );
  };

  // --- Main Render ---
  switch (viewMode) {
    case 'dashboard':
      return renderDashboard();
    case 'create':
      return renderCreateMission();
    case 'detail':
      return renderMissionDetail();
    default:
      return renderDashboard();
  }
};

export default SwarmOrchestrator;
