import React, { useState, useEffect, useRef } from 'react';
import { ObsidianCard, ObsidianButton, ObsidianSlider, ObsidianSwitch, ObsidianTooltip } from './ui/ObsidianElements';
import {
  Search, Mic, ArrowLeftRight, Play, Activity, AlertCircle, Radio,
  Plus, Pause, StopCircle, PlayCircle, Eye, TrendingUp, Database,
  Users, Clock, DollarSign, CheckCircle, XCircle, ChevronRight,
  Settings, BarChart3, FileText, AlertTriangle, X, Edit2, Trash2,
  Info, HelpCircle, Zap, Target, Scale, Save, Download
} from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// --- Types ---
type SwarmType = 'research' | 'sentiment' | 'negotiation' | 'lead_generation' | 'content_creation' | 'market_analysis';
type MissionStatus = 'IDLE' | 'DEPLOYING' | 'OPERATIONAL' | 'PAUSED' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
type ViewMode = 'dashboard' | 'detail' | 'create';

interface ConfirmationModal {
  isOpen: boolean;
  action: 'start' | 'pause' | 'resume' | 'stop' | 'cancel' | null;
  missionId: string | null;
  title: string;
  message: string;
  confirmText: string;
  confirmColor: string;
}

type AgentStatus = 'working' | 'idle' | 'completed' | 'error';

interface Agent {
  id: string; // "Agent-001"
  status: AgentStatus;
  currentTask: string;
  tasksCompleted: number;
  dataProcessed: string; // "145 MB"
  lastUpdate: Date;
  errorMessage?: string;
  x?: number; // Canvas position percentage
  y?: number;
}

interface AgentFilter {
  status: AgentStatus | 'all';
  searchQuery: string;
}

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
  agents?: Agent[]; // Generated on demand
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

interface ConfigPreset {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  isSystem: boolean;
  config: {
    swarmType: SwarmType | null;
    maxAgents: number;
    priority: 'speed' | 'accuracy' | 'balanced';
    budget: number;
  };
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

// --- System Presets (Phase 8) ---
const SYSTEM_PRESETS: ConfigPreset[] = [
  {
    id: 'max-speed',
    name: 'Máxima Velocidad',
    description: 'Optimizado para procesamiento ultra-rápido con validación mínima',
    icon: <Zap size={16} className="text-yellow-400" />,
    isSystem: true,
    config: {
      swarmType: null,
      maxAgents: 300,
      priority: 'speed',
      budget: 100
    }
  },
  {
    id: 'max-accuracy',
    name: 'Máxima Precisión',
    description: 'Validación exhaustiva y verificación cruzada entre agentes',
    icon: <Target size={16} className="text-purple-400" />,
    isSystem: true,
    config: {
      swarmType: null,
      maxAgents: 100,
      priority: 'accuracy',
      budget: 80
    }
  },
  {
    id: 'low-cost',
    name: 'Bajo Coste',
    description: 'Minimiza consumo de recursos manteniendo resultados aceptables',
    icon: <DollarSign size={16} className="text-green-400" />,
    isSystem: true,
    config: {
      swarmType: null,
      maxAgents: 80,
      priority: 'balanced',
      budget: 30
    }
  },
  {
    id: 'balanced',
    name: 'Equilibrado',
    description: 'Balance óptimo entre velocidad, precisión y coste',
    icon: <Scale size={16} className="text-blue-400" />,
    isSystem: true,
    config: {
      swarmType: null,
      maxAgents: 200,
      priority: 'balanced',
      budget: 50
    }
  }
];

// --- Tooltips Dictionary ---
const TOOLTIPS = {
  dataProcessed: 'Cantidad total de datos procesados por todos los agentes del enjambre. Incluye scraping, análisis y transformaciones de datos en tiempo real.',
  tasksCompleted: 'Número de tareas individuales completadas por los agentes. Cada agente puede completar múltiples tareas de forma autónoma durante la misión.',
  accuracy: 'Precisión promedio de los resultados generados, basado en validaciones internas y verificación cruzada entre agentes.',
  sentiment: 'Métrica de sentimiento promedio detectada en el análisis. +100% = muy positivo, 0% = neutral, -100% = muy negativo.',
  agentCount: 'Número de agentes micro-autónomos desplegados para esta misión. Cada agente opera independientemente con su propia tarea.',
  swarmType: 'Tipo de enjambre que determina las capacidades y estrategias específicas de los agentes desplegados.',
  maxAgents: 'Número máximo de agentes que se desplegarán para esta misión. Más agentes = mayor paralelismo pero mayor coste.',
  budget: 'Presupuesto máximo asignado a esta misión en dólares. La ejecución se detendrá automáticamente al alcanzar este límite.',
  criticalAlerts: 'Envía notificaciones inmediatas cuando se detecten anomalías críticas, errores importantes o oportunidades urgentes.',
  priority: {
    speed: 'Prioriza velocidad de ejecución. Los agentes procesarán más datos en paralelo con validaciones reducidas.',
    accuracy: 'Prioriza precisión y calidad. Los agentes realizarán validaciones exhaustivas y verificaciones cruzadas.',
    balanced: 'Balance óptimo entre velocidad y precisión. Recomendado para la mayoría de casos de uso.'
  },
  cost: 'Coste acumulado de la misión hasta el momento, basado en tiempo de ejecución y recursos computacionales utilizados.'
};

// --- Agent Generation Functions ---
function generateTaskForSwarmType(swarmType: SwarmType, status: AgentStatus): string {
  if (status === 'idle') return 'Waiting for assignment';
  if (status === 'completed') return 'All tasks completed';
  if (status === 'error') return 'Task failed - retrying';

  const tasks: Record<SwarmType, string[]> = {
    research: ['Scraping competitor site', 'Analyzing pricing data', 'Processing funnel metrics', 'Extracting market insights', 'Validating data sources'],
    sentiment: ['Processing tweets', 'Analyzing Reddit comments', 'Scoring sentiment', 'Detecting trends', 'Categorizing feedback'],
    negotiation: ['Reviewing contract terms', 'Calculating optimal offer', 'Drafting counter-proposal', 'Analyzing deal value', 'Preparing negotiation strategy'],
    lead_generation: ['Identifying potential leads', 'Qualifying prospects', 'Enriching contact data', 'Scoring lead quality', 'Building outreach lists'],
    content_creation: ['Generating blog post', 'Creating social media copy', 'Optimizing SEO keywords', 'A/B testing headlines', 'Adapting for channels'],
    market_analysis: ['Monitoring market trends', 'Tracking competitor prices', 'Detecting opportunities', 'Analyzing demand patterns', 'Forecasting market shifts']
  };

  const taskList = tasks[swarmType] || ['Processing data'];
  return taskList[Math.floor(Math.random() * taskList.length)];
}

function generateAgentsForMission(mission: Mission): Agent[] {
  const agents: Agent[] = [];

  // Status distribution: 70% working, 15% idle, 13% completed, 2% error
  const statusDistribution = {
    error: 0.02,
    completed: 0.13,
    idle: 0.15,
    working: 0.70
  };

  for (let i = 0; i < mission.agentCount; i++) {
    const rand = Math.random();
    let status: AgentStatus;

    if (rand < statusDistribution.error) {
      status = 'error';
    } else if (rand < statusDistribution.error + statusDistribution.completed) {
      status = 'completed';
    } else if (rand < 1 - statusDistribution.working) {
      status = 'idle';
    } else {
      status = 'working';
    }

    agents.push({
      id: `Agent-${String(i + 1).padStart(3, '0')}`,
      status,
      currentTask: generateTaskForSwarmType(mission.swarmType, status),
      tasksCompleted: Math.floor(Math.random() * 50),
      dataProcessed: `${Math.floor(Math.random() * 500)} MB`,
      lastUpdate: new Date(Date.now() - Math.random() * 60000),
      x: Math.random() * 100, // Percentage
      y: Math.random() * 100,
      ...(status === 'error' && { errorMessage: 'Connection timeout' })
    });
  }

  return agents;
}

// --- Result Generation Functions ---
function generateResultTitle(swarmType: SwarmType, type: 'report' | 'data' | 'insight', index: number): string {
  const titles: Record<SwarmType, Record<string, string[]>> = {
    research: {
      report: ['Competitive Analysis Summary', 'Market Positioning Report', 'Final Research Findings', 'Competitor Overview'],
      data: ['Top 50 Competitor Prices', 'Traffic Sources Dataset', 'Conversion Funnel Data', 'Market Share Data'],
      insight: ['Pricing Gap Identified', 'Emerging Market Trend', 'Opportunity Alert', 'Strategic Recommendation']
    },
    sentiment: {
      report: ['Sentiment Analysis Report', 'Brand Perception Study', 'Social Media Overview', 'Customer Feedback Summary'],
      data: ['Tweet Sentiment Scores', 'Reddit Discussion Data', 'Review Aggregation', 'Trend Timeline'],
      insight: ['Viral Trend Detected', 'Negative Sentiment Spike', 'Brand Mention Surge', 'Competitor Comparison']
    },
    negotiation: {
      report: ['Deal Analysis Report', 'Negotiation Strategy', 'Contract Review Summary', 'Value Assessment'],
      data: ['Pricing Scenarios', 'Contract Terms Data', 'Competitive Offers', 'Historical Deals'],
      insight: ['Optimal Price Point', 'Concession Strategy', 'Deal Risk Assessment', 'Win Probability']
    },
    lead_generation: {
      report: ['Lead Quality Report', 'Prospect Analysis', 'Outreach Performance', 'Conversion Forecast'],
      data: ['Qualified Leads List', 'Contact Enrichment Data', 'Lead Scoring Results', 'Industry Segmentation'],
      insight: ['High-Value Prospect Identified', 'Conversion Opportunity', 'Market Segment Growth', 'Outreach Timing']
    },
    content_creation: {
      report: ['Content Performance Report', 'SEO Optimization Summary', 'A/B Test Results', 'Channel Analysis'],
      data: ['Generated Content Assets', 'Keyword Performance', 'Engagement Metrics', 'Channel Variations'],
      insight: ['High-Performing Topic', 'SEO Opportunity', 'Audience Preference', 'Content Gap Identified']
    },
    market_analysis: {
      report: ['Market Trends Report', 'Competitive Landscape', 'Demand Forecast', 'Price Analysis'],
      data: ['Market Size Data', 'Competitor Pricing', 'Demand Patterns', 'Growth Indicators'],
      insight: ['Market Shift Detected', 'Price Opportunity', 'Demand Surge', 'Competitive Threat']
    }
  };

  return titles[swarmType]?.[type]?.[index % titles[swarmType][type].length] || `${type} ${index + 1}`;
}

function generateResultContent(swarmType: SwarmType, type: 'report' | 'data' | 'insight'): string {
  if (type === 'report') {
    return `## Executive Summary\n\nBased on analysis of ${Math.floor(Math.random() * 500) + 100} sources, our ${swarmType} swarm has identified key findings.\n\n### Key Findings\n1. Primary trend: Market shows ${Math.floor(Math.random() * 30) + 10}% growth\n2. Competitive gap: Average price difference of $${Math.floor(Math.random() * 50) + 20}\n3. Opportunity window: Next ${Math.floor(Math.random() * 12) + 3} months\n\n### Recommendations\nImmediate action recommended in ${Math.floor(Math.random() * 5) + 1} key areas.`;
  }

  if (type === 'data') {
    return JSON.stringify({
      records: Math.floor(Math.random() * 500) + 100,
      avgValue: `$${Math.floor(Math.random() * 100) + 30}`,
      topItems: ['Item A', 'Item B', 'Item C'],
      confidence: `${Math.floor(Math.random() * 20) + 80}%`,
      dataPoints: Math.floor(Math.random() * 10000) + 1000
    }, null, 2);
  }

  if (type === 'insight') {
    const value = Math.floor(Math.random() * 50) + 10;
    return `⚡ **Alert**: Detected a ${value}% ${value > 30 ? 'increase' : 'change'} in key metrics. Immediate opportunity for optimization identified. Confidence: ${Math.floor(Math.random() * 20) + 80}%.`;
  }

  return 'No content available.';
}

function generateResultsForMission(mission: Mission, milestone: number): MissionResult {
  const types: ('report' | 'data' | 'insight')[] = ['report', 'data', 'insight'];
  const type = types[milestone % 3];

  return {
    id: `result-${mission.id}-${milestone}`,
    type,
    title: generateResultTitle(mission.swarmType, type, milestone),
    content: generateResultContent(mission.swarmType, type),
    timestamp: new Date()
  };
}

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
  const [glossaryOpen, setGlossaryOpen] = useState(false);
  const [confirmModal, setConfirmModal] = useState<ConfirmationModal>({
    isOpen: false,
    action: null,
    missionId: null,
    title: '',
    message: '',
    confirmText: '',
    confirmColor: ''
  });
  const [agentFilter, setAgentFilter] = useState<AgentFilter>({
    status: 'all',
    searchQuery: ''
  });
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);
  const [hoveredAgentId, setHoveredAgentId] = useState<string | null>(null);
  const [canvasTooltip, setCanvasTooltip] = useState<{
    visible: boolean;
    x: number;
    y: number;
    agent: Agent | null;
  } | null>(null);
  const [customPresets, setCustomPresets] = useState<ConfigPreset[]>([]);
  const [savePresetModal, setSavePresetModal] = useState<{
    isOpen: boolean;
    presetName: string;
    presetDescription: string;
  }>({
    isOpen: false,
    presetName: '',
    presetDescription: ''
  });
  const [dashboardTab, setDashboardTab] = useState<'active' | 'history'>('active');
  const [historyFilter, setHistoryFilter] = useState<'all' | 'completed' | 'failed' | 'cancelled'>('all');
  const [comparisonMissions, setComparisonMissions] = useState<string[]>([]);
  const [missionHistory, setMissionHistory] = useState<Mission[]>([]);
  const [exportDropdownOpen, setExportDropdownOpen] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<any[]>([]);

  // --- Computed Values ---
  const selectedMission = missions.find(m => m.id === selectedMissionId);
  const activeMissions = missions.filter(m => ['OPERATIONAL', 'DEPLOYING'].includes(m.status));
  const totalCost = missions.reduce((sum, m) => sum + m.cost, 0);
  const totalAgents = activeMissions.reduce((sum, m) => sum + m.agentCount, 0);

  // --- Generate agents for selected mission ---
  useEffect(() => {
    if (selectedMission && !selectedMission.agents) {
      setMissions(prev => prev.map(m =>
        m.id === selectedMission.id
          ? { ...m, agents: generateAgentsForMission(m) }
          : m
      ));
    }
  }, [selectedMissionId]);

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

    // Particle System with agent association
    const particles: { x: number; y: number; tx: number; ty: number; speed: number; phase: number; agentId?: string; status?: AgentStatus }[] = [];
    const numParticles = Math.min(selectedMission.agentCount, 125); // Visual representation, max 125 for performance
    const agents = selectedMission.agents || [];

    for(let i=0; i<numParticles; i++) {
      const agent = agents[i];
      particles.push({
        x: canvas.width / 4,
        y: canvas.height / 4,
        tx: Math.random() * (canvas.width / 2),
        ty: Math.random() * (canvas.height / 2),
        speed: Math.random() * 2 + 0.5,
        phase: Math.random() * Math.PI * 2,
        agentId: agent?.id,
        status: agent?.status
      });
    }

    particlesRef.current = particles;

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

        // Color based on agent status
        let particleColor = '#6A4FFB'; // Default purple
        if (p.status === 'working') particleColor = '#45FF9A'; // Green
        else if (p.status === 'idle') particleColor = '#BEBEC6'; // Gray
        else if (p.status === 'completed') particleColor = '#6A4FFB'; // Purple
        else if (p.status === 'error') particleColor = '#FF4545'; // Red

        // Highlight if hovered or selected
        const isHovered = hoveredAgentId === p.agentId;
        const isSelected = selectedAgentId === p.agentId;
        let size = 1.5;

        if (isHovered || isSelected) {
          size = 4;
          ctx.shadowBlur = 15;
          ctx.shadowColor = particleColor;
        }

        ctx.beginPath();
        ctx.moveTo(p.x - (Math.cos(time)*5), p.y - (Math.sin(time)*5));
        ctx.lineTo(p.x, p.y);
        ctx.strokeStyle = `${particleColor}33`; // 20% opacity
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.fillStyle = particleColor;
        ctx.fillRect(p.x - size/2, p.y - size/2, size, size);

        if (isHovered || isSelected) {
          ctx.shadowBlur = 0;
        }
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

  // --- Load/Save Custom Presets from localStorage (Phase 8) ---
  useEffect(() => {
    const saved = localStorage.getItem('swarm_custom_presets');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Icons can't be serialized, so we add a default icon
        const withIcons = parsed.map((p: ConfigPreset) => ({
          ...p,
          icon: <Settings size={16} className="text-gray-400" />
        }));
        setCustomPresets(withIcons);
      } catch (e) {
        console.error('Failed to load custom presets:', e);
      }
    }
  }, []);

  useEffect(() => {
    if (customPresets.length > 0) {
      // Remove icons before saving (can't serialize React nodes)
      const serializable = customPresets.map(({ icon, ...rest }) => rest);
      localStorage.setItem('swarm_custom_presets', JSON.stringify(serializable));
    }
  }, [customPresets]);

  // --- Load/Save Mission History from localStorage (Phase 5) ---
  useEffect(() => {
    const saved = localStorage.getItem('swarm_mission_history');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Re-create Date objects
        const withDates = parsed.map((m: Mission) => ({
          ...m,
          startTime: new Date(m.startTime),
          estimatedCompletion: m.estimatedCompletion ? new Date(m.estimatedCompletion) : undefined,
          logs: m.logs.map(log => ({ ...log, timestamp: new Date(log.timestamp) })),
          results: m.results.map(r => ({ ...r, timestamp: new Date(r.timestamp) })),
          agents: m.agents?.map(a => ({ ...a, lastUpdate: new Date(a.lastUpdate) }))
        }));
        setMissionHistory(withDates);
      } catch (e) {
        console.error('Failed to load mission history:', e);
      }
    }
  }, []);

  // Move completed/failed/cancelled missions to history
  useEffect(() => {
    const finishedMissions = missions.filter(m =>
      m.status === 'COMPLETED' || m.status === 'FAILED' || m.status === 'CANCELLED'
    );

    if (finishedMissions.length > 0) {
      // Add to history (max 50)
      const newHistory = [...missionHistory, ...finishedMissions].slice(-50);
      setMissionHistory(newHistory);

      // Remove from active missions
      setMissions(prev => prev.filter(m =>
        m.status !== 'COMPLETED' && m.status !== 'FAILED' && m.status !== 'CANCELLED'
      ));

      // Save to localStorage
      try {
        localStorage.setItem('swarm_mission_history', JSON.stringify(newHistory));
      } catch (e) {
        console.error('Failed to save mission history:', e);
      }
    }
  }, [missions.map(m => `${m.id}-${m.status}`).join(',')]);

  // --- Mission Progress Simulation ---
  useEffect(() => {
    const interval = setInterval(() => {
      setMissions(prev => prev.map(mission => {
        if (mission.status === 'OPERATIONAL' && mission.progress < 100) {
          const newProgress = Math.min(mission.progress + 0.5, 100);
          const currentMilestone = Math.floor(mission.progress / 25);
          const nextMilestone = Math.floor(newProgress / 25);

          // Generate result at milestone (25%, 50%, 75%, 100%)
          let newResults = mission.results;
          if (nextMilestone > currentMilestone && nextMilestone <= 4) {
            const newResult = generateResultsForMission(mission, mission.results.length);
            newResults = [...mission.results, newResult];
          }

          // Update agent statuses randomly (5% chance)
          let updatedAgents = mission.agents;
          if (mission.agents && Math.random() < 0.05) {
            const randomIndex = Math.floor(Math.random() * mission.agents.length);
            updatedAgents = mission.agents.map((agent, idx) => {
              if (idx === randomIndex) {
                const statuses: AgentStatus[] = ['working', 'idle', 'completed'];
                return {
                  ...agent,
                  status: statuses[Math.floor(Math.random() * statuses.length)],
                  currentTask: generateTaskForSwarmType(mission.swarmType, agent.status)
                };
              }
              return agent;
            });
          }

          return {
            ...mission,
            progress: newProgress,
            kpis: {
              ...mission.kpis,
              tasksCompleted: mission.kpis.tasksCompleted + Math.floor(Math.random() * 5)
            },
            cost: mission.cost + 0.01,
            results: newResults,
            agents: updatedAgents
          };
        }
        return mission;
      }));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  // --- Handlers ---
  const showConfirmation = (missionId: string, action: 'start' | 'pause' | 'resume' | 'stop' | 'cancel') => {
    const mission = missions.find(m => m.id === missionId);
    if (!mission) return;

    const confirmations = {
      start: {
        title: 'Iniciar Misión',
        message: `¿Deseas iniciar la misión "${mission.name}"? Se desplegarán ${mission.agentCount} agentes.`,
        confirmText: 'Iniciar',
        confirmColor: 'bg-[#45FF9A] hover:bg-[#45FF9A]/90'
      },
      pause: {
        title: 'Pausar Misión',
        message: `¿Pausar "${mission.name}"? Los agentes detendrán su trabajo temporalmente.`,
        confirmText: 'Pausar',
        confirmColor: 'bg-yellow-500 hover:bg-yellow-600'
      },
      resume: {
        title: 'Reanudar Misión',
        message: `¿Reanudar "${mission.name}"? Los agentes continuarán desde donde se pausaron.`,
        confirmText: 'Reanudar',
        confirmColor: 'bg-[#45FF9A] hover:bg-[#45FF9A]/90'
      },
      stop: {
        title: 'Detener Misión',
        message: `¿Detener "${mission.name}"? Esta acción marcará la misión como completada y no se puede deshacer.`,
        confirmText: 'Detener',
        confirmColor: 'bg-red-500 hover:bg-red-600'
      },
      cancel: {
        title: 'Cancelar Misión',
        message: `¿Cancelar "${mission.name}"? Esta acción no se puede deshacer.`,
        confirmText: 'Cancelar Misión',
        confirmColor: 'bg-red-500 hover:bg-red-600'
      }
    };

    const config = confirmations[action];
    setConfirmModal({
      isOpen: true,
      action,
      missionId,
      ...config
    });
  };

  const handleConfirmedAction = () => {
    if (!confirmModal.missionId || !confirmModal.action) return;

    const missionId = confirmModal.missionId;
    const action = confirmModal.action;

    setMissions(prev => prev.map(mission => {
      if (mission.id === missionId) {
        switch (action) {
          case 'start':
            return { ...mission, status: 'OPERATIONAL' as MissionStatus };
          case 'pause':
            return { ...mission, status: 'PAUSED' as MissionStatus };
          case 'resume':
            return { ...mission, status: 'OPERATIONAL' as MissionStatus };
          case 'stop':
            return { ...mission, status: 'COMPLETED' as MissionStatus, progress: 100 };
          case 'cancel':
            return { ...mission, status: 'CANCELLED' as MissionStatus };
          default:
            return mission;
        }
      }
      return mission;
    }));

    // Close modal
    setConfirmModal({
      isOpen: false,
      action: null,
      missionId: null,
      title: '',
      message: '',
      confirmText: '',
      confirmColor: ''
    });
  };

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


  const handleViewMissionDetail = (missionId: string) => {
    setSelectedMissionId(missionId);
    setViewMode('detail');
  };

  // --- Canvas Interaction Handlers (Phase 4) ---
  const findNearestParticle = (
    x: number,
    y: number,
    particles: Array<{ x: number; y: number; agentId?: string }>,
    maxDistance: number = 20
  ): { particle: any; index: number } | null => {
    let nearestParticle = null;
    let nearestIndex = -1;
    let minDistance = maxDistance;

    particles.forEach((p, idx) => {
      const dx = p.x - x;
      const dy = p.y - y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < minDistance && p.agentId) {
        minDistance = distance;
        nearestParticle = p;
        nearestIndex = idx;
      }
    });

    return nearestParticle ? { particle: nearestParticle, index: nearestIndex } : null;
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current || !selectedMission) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Get current particles from particlesRef
    const particles = particlesRef.current;
    if (!particles || particles.length === 0) {
      setCanvasTooltip(null);
      setHoveredAgentId(null);
      return;
    }

    const nearest = findNearestParticle(x, y, particles, 20);

    if (nearest && nearest.particle.agentId) {
      const agent = selectedMission.agents?.find(a => a.id === nearest.particle.agentId);
      if (agent) {
        setHoveredAgentId(agent.id);
        setCanvasTooltip({
          visible: true,
          x: e.clientX,
          y: e.clientY,
          agent
        });
        canvas.style.cursor = 'pointer';
      } else {
        setCanvasTooltip(null);
        setHoveredAgentId(null);
        canvas.style.cursor = 'default';
      }
    } else {
      setCanvasTooltip(null);
      setHoveredAgentId(null);
      canvas.style.cursor = 'default';
    }
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current || !selectedMission) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const particles = particlesRef.current;
    if (!particles || particles.length === 0) return;

    const nearest = findNearestParticle(x, y, particles, 20);

    if (nearest && nearest.particle.agentId) {
      const agent = selectedMission.agents?.find(a => a.id === nearest.particle.agentId);
      if (agent) {
        setSelectedAgentId(agent.id);
        setCanvasTooltip(null); // Hide tooltip when modal opens
      }
    }
  };

  // --- Preset Management Functions (Phase 8) ---
  const loadPreset = (preset: ConfigPreset) => {
    setCreateForm({
      ...createForm,
      swarmType: preset.config.swarmType,
      maxAgents: preset.config.maxAgents,
      priority: preset.config.priority,
      budget: preset.config.budget
    });
  };

  const saveCustomPreset = () => {
    if (!savePresetModal.presetName.trim()) {
      alert('Por favor ingresa un nombre para el preset');
      return;
    }

    const newPreset: ConfigPreset = {
      id: `custom-${Date.now()}`,
      name: savePresetModal.presetName,
      description: savePresetModal.presetDescription || 'Preset personalizado',
      icon: <Settings size={16} className="text-gray-400" />,
      isSystem: false,
      config: {
        swarmType: createForm.swarmType,
        maxAgents: createForm.maxAgents,
        priority: createForm.priority,
        budget: createForm.budget
      }
    };

    setCustomPresets([...customPresets, newPreset]);
    setSavePresetModal({
      isOpen: false,
      presetName: '',
      presetDescription: ''
    });
  };

  const deletePreset = (presetId: string) => {
    if (confirm('¿Estás seguro de que deseas eliminar este preset?')) {
      setCustomPresets(customPresets.filter(p => p.id !== presetId));
    }
  };

  // --- History Management Functions (Phase 5) ---
  const reuseConfiguration = (mission: Mission) => {
    setCreateForm({
      name: `${mission.name} (Copy)`,
      swarmType: mission.swarmType,
      objective: mission.objective,
      maxAgents: mission.agentCount,
      budget: createForm.budget,
      priority: createForm.priority,
      criticalAlerts: createForm.criticalAlerts
    });
    setViewMode('create');
  };

  const deleteHistoryMission = (missionId: string) => {
    if (confirm('¿Estás seguro de que deseas eliminar esta misión del historial?')) {
      const newHistory = missionHistory.filter(m => m.id !== missionId);
      setMissionHistory(newHistory);
      setComparisonMissions(comparisonMissions.filter(id => id !== missionId));
      localStorage.setItem('swarm_mission_history', JSON.stringify(newHistory));
    }
  };

  const toggleMissionComparison = (missionId: string) => {
    if (comparisonMissions.includes(missionId)) {
      setComparisonMissions(comparisonMissions.filter(id => id !== missionId));
    } else {
      setComparisonMissions([...comparisonMissions, missionId]);
    }
  };

  // --- Export Functions (Phase 6) ---
  const exportToCSV = (mission: Mission) => {
    const csv: string[] = [];

    // Header
    csv.push('=== SWARM ORCHESTRATOR - EXPORT DE MISIÓN ===');
    csv.push('');

    // Mission Info
    csv.push(`Nombre,${mission.name}`);
    csv.push(`ID,${mission.id}`);
    csv.push(`Tipo,${SWARM_TEMPLATES.find(t => t.id === mission.swarmType)?.name || mission.swarmType}`);
    csv.push(`Estado,${mission.status}`);
    csv.push(`Progreso,${mission.progress}%`);
    csv.push(`Objetivo,"${mission.objective}"`);
    csv.push('');

    // KPIs
    csv.push('=== KPIS ===');
    csv.push(`Datos Procesados,${mission.kpis.dataProcessed}`);
    csv.push(`Tareas Completadas,${mission.kpis.tasksCompleted}`);
    csv.push(`Precisión,${mission.kpis.accuracy}%`);
    if (mission.kpis.sentiment !== undefined) csv.push(`Sentimiento,${mission.kpis.sentiment}%`);
    csv.push(`Coste Total,$${mission.cost.toFixed(2)}`);
    csv.push('');

    // Agents
    if (mission.agents && mission.agents.length > 0) {
      csv.push('=== AGENTES ===');
      csv.push('ID,Estado,Tarea Actual,Tareas Completadas,Datos Procesados');
      mission.agents.forEach(agent => {
        csv.push(`${agent.id},${agent.status},"${agent.currentTask}",${agent.tasksCompleted},${agent.dataProcessed}`);
      });
      csv.push('');
    }

    // Results
    if (mission.results.length > 0) {
      csv.push('=== RESULTADOS ===');
      csv.push('Tipo,Título,Timestamp');
      mission.results.forEach(result => {
        csv.push(`${result.type},"${result.title}",${result.timestamp.toISOString()}`);
      });
    }

    // Download
    const blob = new Blob([csv.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `mission_${mission.id}_${Date.now()}.csv`;
    link.click();
  };

  const exportToJSON = (mission: Mission) => {
    const data = {
      mission: {
        id: mission.id,
        name: mission.name,
        swarmType: mission.swarmType,
        status: mission.status,
        progress: mission.progress,
        agentCount: mission.agentCount,
        objective: mission.objective,
        startTime: mission.startTime.toISOString(),
        estimatedCompletion: mission.estimatedCompletion?.toISOString()
      },
      kpis: mission.kpis,
      cost: mission.cost,
      agents: mission.agents?.map(a => ({
        id: a.id,
        status: a.status,
        currentTask: a.currentTask,
        tasksCompleted: a.tasksCompleted,
        dataProcessed: a.dataProcessed,
        lastUpdate: a.lastUpdate.toISOString(),
        errorMessage: a.errorMessage
      })) || [],
      results: mission.results.map(r => ({
        id: r.id,
        type: r.type,
        title: r.title,
        content: r.content,
        timestamp: r.timestamp.toISOString()
      })),
      logs: mission.logs.map(l => ({
        id: l.id,
        timestamp: l.timestamp.toISOString(),
        level: l.level,
        message: l.message,
        agentId: l.agentId
      })),
      exportedAt: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `mission_${mission.id}_${Date.now()}.json`;
    link.click();
  };

  const exportToPDF = (mission: Mission) => {
    const doc = new jsPDF();

    // Title
    doc.setFontSize(20);
    doc.text('Swarm Orchestrator', 14, 20);
    doc.setFontSize(12);
    doc.text(`Reporte de Misión - ${mission.name}`, 14, 28);

    // Mission Info
    doc.setFontSize(10);
    doc.text(`ID: ${mission.id}`, 14, 38);
    doc.text(`Estado: ${mission.status}`, 14, 44);
    doc.text(`Progreso: ${mission.progress}%`, 14, 50);
    doc.text(`Tipo: ${SWARM_TEMPLATES.find(t => t.id === mission.swarmType)?.name || mission.swarmType}`, 14, 56);

    // KPIs Table
    autoTable(doc, {
      startY: 65,
      head: [['Métrica', 'Valor']],
      body: [
        ['Datos Procesados', mission.kpis.dataProcessed],
        ['Tareas Completadas', mission.kpis.tasksCompleted.toString()],
        ['Precisión', `${mission.kpis.accuracy}%`],
        ['Coste Total', `$${mission.cost.toFixed(2)}`]
      ],
      theme: 'grid',
      headStyles: { fillColor: [106, 79, 251] }
    });

    // Agents Summary
    if (mission.agents && mission.agents.length > 0) {
      const agentsByStatus = mission.agents.reduce((acc, a) => {
        acc[a.status] = (acc[a.status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      autoTable(doc, {
        startY: (doc as any).lastAutoTable.finalY + 10,
        head: [['Agentes por Estado', 'Cantidad']],
        body: Object.entries(agentsByStatus).map(([status, count]) => [status, count.toString()]),
        theme: 'grid',
        headStyles: { fillColor: [106, 79, 251] }
      });
    }

    // Results Summary
    if (mission.results.length > 0) {
      autoTable(doc, {
        startY: (doc as any).lastAutoTable.finalY + 10,
        head: [['Resultados', 'Tipo', 'Título']],
        body: mission.results.slice(0, 5).map((r, i) => [(i + 1).toString(), r.type, r.title]),
        theme: 'grid',
        headStyles: { fillColor: [106, 79, 251] }
      });

      if (mission.results.length > 5) {
        doc.setFontSize(8);
        doc.text(`... y ${mission.results.length - 5} resultados más`, 14, (doc as any).lastAutoTable.finalY + 6);
      }
    }

    // Footer
    const pageCount = (doc as any).internal.getNumberOfPages();
    doc.setFontSize(8);
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.text(
        `Página ${i} de ${pageCount} - Generado: ${new Date().toLocaleString()}`,
        doc.internal.pageSize.getWidth() / 2,
        doc.internal.pageSize.getHeight() - 10,
        { align: 'center' }
      );
    }

    // Download
    doc.save(`mission_${mission.id}_${Date.now()}.pdf`);
  };

  const getStatusColor = (status: MissionStatus) => {
    switch (status) {
      case 'IDLE': return 'text-gray-400 border-gray-400/30 bg-gray-400/10';
      case 'OPERATIONAL': return 'text-[#45FF9A] border-[#45FF9A]/30 bg-[#45FF9A]/10';
      case 'DEPLOYING': return 'text-[#6A4FFB] border-[#6A4FFB]/30 bg-[#6A4FFB]/10';
      case 'PAUSED': return 'text-yellow-400 border-yellow-400/30 bg-yellow-400/10';
      case 'COMPLETED': return 'text-blue-400 border-blue-400/30 bg-blue-400/10';
      case 'FAILED': return 'text-red-400 border-red-400/30 bg-red-400/10';
      case 'CANCELLED': return 'text-orange-400 border-orange-400/30 bg-orange-400/10';
      default: return 'text-gray-400 border-gray-400/30 bg-gray-400/10';
    }
  };

  const getStatusIcon = (status: MissionStatus) => {
    switch (status) {
      case 'IDLE': return <Radio size={12} />;
      case 'OPERATIONAL': return <Activity size={12} className="animate-pulse" />;
      case 'DEPLOYING': return <PlayCircle size={12} className="animate-bounce" />;
      case 'PAUSED': return <Pause size={12} />;
      case 'COMPLETED': return <CheckCircle size={12} />;
      case 'FAILED': return <XCircle size={12} />;
      case 'CANCELLED': return <X Circle size={12} />;
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
            <button
              onClick={() => setGlossaryOpen(true)}
              className="p-2 rounded-lg border border-white/[0.1] hover:bg-white/[0.05] transition-all"
              title="Glosario HAAS"
            >
              <HelpCircle size={20} className="text-obsidian-text-muted hover:text-white transition-colors" />
            </button>
            <ObsidianButton
              onClick={() => setViewMode('create')}
              icon={<Plus size={16} />}
            >
              Nueva Misión
            </ObsidianButton>
          </div>
        </div>
      </div>

      {/* Tabs (Phase 5) */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setDashboardTab('active')}
          className={`px-4 py-2 rounded-lg text-sm transition-all ${
            dashboardTab === 'active'
              ? 'bg-obsidian-accent/20 border border-obsidian-accent/50 text-white'
              : 'border border-white/[0.1] text-obsidian-text-muted hover:text-white hover:bg-white/[0.05]'
          }`}
        >
          Activas ({missions.length})
        </button>
        <button
          onClick={() => setDashboardTab('history')}
          className={`px-4 py-2 rounded-lg text-sm transition-all ${
            dashboardTab === 'history'
              ? 'bg-obsidian-accent/20 border border-obsidian-accent/50 text-white'
              : 'border border-white/[0.1] text-obsidian-text-muted hover:text-white hover:bg-white/[0.05]'
          }`}
        >
          Historial ({missionHistory.length})
        </button>
      </div>

      {/* Active Missions Tab */}
      {dashboardTab === 'active' && (
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
                    {mission.status === 'IDLE' && (
                      <button
                        onClick={() => showConfirmation(mission.id, 'start')}
                        className="p-2 rounded-lg border border-white/[0.1] hover:bg-white/[0.05] transition-all"
                        title="Iniciar"
                      >
                        <PlayCircle size={14} className="text-[#45FF9A]" />
                      </button>
                    )}
                    {mission.status === 'OPERATIONAL' && (
                      <button
                        onClick={() => showConfirmation(mission.id, 'pause')}
                        className="p-2 rounded-lg border border-white/[0.1] hover:bg-white/[0.05] transition-all"
                        title="Pausar"
                      >
                        <Pause size={14} className="text-yellow-400" />
                      </button>
                    )}
                    {mission.status === 'PAUSED' && (
                      <>
                        <button
                          onClick={() => showConfirmation(mission.id, 'resume')}
                          className="p-2 rounded-lg border border-white/[0.1] hover:bg-white/[0.05] transition-all"
                          title="Reanudar"
                        >
                          <PlayCircle size={14} className="text-[#45FF9A]" />
                        </button>
                        <button
                          onClick={() => showConfirmation(mission.id, 'cancel')}
                          className="p-2 rounded-lg border border-white/[0.1] hover:bg-red-500/[0.1] transition-all"
                          title="Cancelar"
                        >
                          <X size={14} className="text-red-400" />
                        </button>
                      </>
                    )}
                    {['OPERATIONAL', 'PAUSED'].includes(mission.status) && (
                      <button
                        onClick={() => showConfirmation(mission.id, 'stop')}
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
      )}

      {/* History Tab (Phase 5) */}
      {dashboardTab === 'history' && (
        <div className="flex-1 overflow-y-auto">
          {/* Comparison Banner */}
          {comparisonMissions.length > 0 && (
            <div className="mb-4 p-4 bg-obsidian-accent/10 border border-obsidian-accent/30 rounded-lg">
              <div className="flex justify-between items-center">
                <div>
                  <div className="text-sm text-white font-medium">
                    Comparando {comparisonMissions.length} misiones
                  </div>
                  <div className="text-xs text-obsidian-text-muted mt-1">
                    Selecciona hasta 4 misiones para comparar KPIs
                  </div>
                </div>
                <button
                  onClick={() => setComparisonMissions([])}
                  className="px-3 py-1.5 text-xs rounded-lg border border-white/[0.1] hover:bg-white/[0.05] text-white transition-all"
                >
                  Limpiar Comparación
                </button>
              </div>
            </div>
          )}

          {/* Filters */}
          <div className="flex gap-2 mb-4">
            {(['all', 'completed', 'failed', 'cancelled'] as const).map(filter => {
              const count = filter === 'all'
                ? missionHistory.length
                : missionHistory.filter(m => m.status.toLowerCase() === filter).length;

              return (
                <button
                  key={filter}
                  onClick={() => setHistoryFilter(filter)}
                  className={`px-3 py-1.5 rounded-lg text-xs transition-all ${
                    historyFilter === filter
                      ? 'bg-white/[0.1] border border-white/[0.15] text-white'
                      : 'border border-white/[0.08] text-obsidian-text-muted hover:text-white hover:bg-white/[0.05]'
                  }`}
                >
                  {filter.charAt(0).toUpperCase() + filter.slice(1)} ({count})
                </button>
              );
            })}
          </div>

          {/* History List */}
          <div className="space-y-4">
            {missionHistory
              .filter(m => historyFilter === 'all' || m.status.toLowerCase() === historyFilter)
              .reverse()
              .map(mission => (
                <ObsidianCard key={mission.id} className="hover:bg-white/[0.02] transition-all">
                  <div className="flex gap-4">
                    {/* Checkbox for comparison */}
                    <div className="flex items-start pt-1">
                      <input
                        type="checkbox"
                        checked={comparisonMissions.includes(mission.id)}
                        onChange={() => toggleMissionComparison(mission.id)}
                        disabled={!comparisonMissions.includes(mission.id) && comparisonMissions.length >= 4}
                        className="w-4 h-4 rounded border-white/[0.2] bg-transparent checked:bg-obsidian-accent cursor-pointer"
                      />
                    </div>

                    {/* Mission Info */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="text-lg text-white font-light">{mission.name}</h3>
                          <div className="flex items-center gap-3 mt-1">
                            <span className="text-xs text-obsidian-text-muted">{mission.id}</span>
                            <span className={`px-2 py-0.5 rounded text-[10px] border ${getStatusColor(mission.status)}`}>
                              {mission.status}
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => reuseConfiguration(mission)}
                            className="px-3 py-1.5 text-xs rounded-lg border border-white/[0.1] hover:bg-white/[0.05] text-white transition-all flex items-center gap-1"
                            title="Reutilizar configuración"
                          >
                            <Edit2 size={12} />
                            Reusar Config
                          </button>
                          <button
                            onClick={() => handleViewMissionDetail(mission.id)}
                            className="px-3 py-1.5 text-xs rounded-lg border border-white/[0.1] hover:bg-white/[0.05] text-white transition-all flex items-center gap-1"
                          >
                            <Eye size={12} />
                            Ver Detalles
                          </button>
                          <button
                            onClick={() => deleteHistoryMission(mission.id)}
                            className="p-1.5 rounded-lg border border-red-500/30 bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-all"
                            title="Eliminar"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>

                      {/* KPIs Summary */}
                      <div className="grid grid-cols-5 gap-4">
                        <div>
                          <div className="text-[10px] text-obsidian-text-muted uppercase mb-1">Datos</div>
                          <div className="text-sm text-white">{mission.kpis.dataProcessed}</div>
                        </div>
                        <div>
                          <div className="text-[10px] text-obsidian-text-muted uppercase mb-1">Tareas</div>
                          <div className="text-sm text-white">{mission.kpis.tasksCompleted}</div>
                        </div>
                        <div>
                          <div className="text-[10px] text-obsidian-text-muted uppercase mb-1">Precisión</div>
                          <div className="text-sm text-white">{mission.kpis.accuracy}%</div>
                        </div>
                        <div>
                          <div className="text-[10px] text-obsidian-text-muted uppercase mb-1">Coste</div>
                          <div className="text-sm text-white">${mission.cost.toFixed(2)}</div>
                        </div>
                        <div>
                          <div className="text-[10px] text-obsidian-text-muted uppercase mb-1">Duración</div>
                          <div className="text-sm text-white">
                            {Math.round((new Date().getTime() - mission.startTime.getTime()) / 60000)} min
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </ObsidianCard>
              ))}

            {missionHistory.filter(m => historyFilter === 'all' || m.status.toLowerCase() === historyFilter).length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-obsidian-text-muted py-20">
                <Database size={48} className="mb-4 opacity-20" />
                <p className="text-sm">No hay misiones en el historial</p>
              </div>
            )}
          </div>

          {/* Comparison Table */}
          {comparisonMissions.length > 1 && (
            <ObsidianCard className="mt-6">
              <h3 className="text-sm font-normal text-[#F5F5F7] uppercase tracking-wider mb-4">
                Tabla de Comparación
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/[0.05]">
                      <th className="text-left text-xs text-obsidian-text-muted uppercase pb-2 pr-4">Métrica</th>
                      {comparisonMissions.map(id => {
                        const m = missionHistory.find(mission => mission.id === id);
                        return (
                          <th key={id} className="text-left text-xs text-white pb-2 px-4">
                            {m?.name}
                          </th>
                        );
                      })}
                    </tr>
                  </thead>
                  <tbody className="text-xs">
                    <tr className="border-b border-white/[0.05]">
                      <td className="py-3 pr-4 text-obsidian-text-muted">Datos Procesados</td>
                      {comparisonMissions.map(id => {
                        const m = missionHistory.find(mission => mission.id === id);
                        return <td key={id} className="py-3 px-4 text-white">{m?.kpis.dataProcessed}</td>;
                      })}
                    </tr>
                    <tr className="border-b border-white/[0.05]">
                      <td className="py-3 pr-4 text-obsidian-text-muted">Tareas Completadas</td>
                      {comparisonMissions.map(id => {
                        const m = missionHistory.find(mission => mission.id === id);
                        return <td key={id} className="py-3 px-4 text-white">{m?.kpis.tasksCompleted}</td>;
                      })}
                    </tr>
                    <tr className="border-b border-white/[0.05]">
                      <td className="py-3 pr-4 text-obsidian-text-muted">Precisión</td>
                      {comparisonMissions.map(id => {
                        const m = missionHistory.find(mission => mission.id === id);
                        return <td key={id} className="py-3 px-4 text-white">{m?.kpis.accuracy}%</td>;
                      })}
                    </tr>
                    <tr>
                      <td className="py-3 pr-4 text-obsidian-text-muted">Coste</td>
                      {comparisonMissions.map(id => {
                        const m = missionHistory.find(mission => mission.id === id);
                        return <td key={id} className="py-3 px-4 text-white">${m?.cost.toFixed(2)}</td>;
                      })}
                    </tr>
                  </tbody>
                </table>
              </div>
            </ObsidianCard>
          )}
        </div>
      )}
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
          {/* Presets Section (Phase 8) */}
          <ObsidianCard className="mb-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-normal text-[#F5F5F7] uppercase tracking-wider">
                Configuración Rápida
              </h3>
              <button
                onClick={() => setSavePresetModal({ ...savePresetModal, isOpen: true })}
                className="flex items-center gap-2 px-3 py-1.5 text-xs rounded-lg border border-white/[0.1] hover:bg-white/[0.05] transition-all text-white"
              >
                <Save size={12} />
                Guardar Configuración Actual
              </button>
            </div>

            <div className="space-y-4">
              {/* System Presets */}
              <div>
                <div className="text-[10px] text-obsidian-text-muted uppercase mb-3">Presets del Sistema</div>
                <div className="grid grid-cols-4 gap-3">
                  {SYSTEM_PRESETS.map(preset => (
                    <button
                      key={preset.id}
                      onClick={() => loadPreset(preset)}
                      className="p-4 rounded-lg border border-white/[0.08] hover:border-white/[0.15] bg-white/[0.02] hover:bg-white/[0.04] transition-all text-left group"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        {preset.icon}
                        <span className="text-xs text-white font-medium">{preset.name}</span>
                      </div>
                      <div className="text-[10px] text-obsidian-text-muted leading-relaxed mb-3">
                        {preset.description}
                      </div>
                      <div className="space-y-1 text-[9px] text-obsidian-text-muted/70">
                        <div>Agentes: {preset.config.maxAgents}</div>
                        <div>Prioridad: {preset.config.priority}</div>
                        <div>Budget: ${preset.config.budget}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Presets */}
              {customPresets.length > 0 && (
                <div>
                  <div className="text-[10px] text-obsidian-text-muted uppercase mb-3">Mis Presets</div>
                  <div className="grid grid-cols-4 gap-3">
                    {customPresets.map(preset => (
                      <div key={preset.id} className="relative group">
                        <button
                          onClick={() => loadPreset(preset)}
                          className="w-full p-4 rounded-lg border border-white/[0.08] hover:border-white/[0.15] bg-white/[0.02] hover:bg-white/[0.04] transition-all text-left"
                        >
                          <div className="flex items-center gap-2 mb-2">
                            {preset.icon}
                            <span className="text-xs text-white font-medium">{preset.name}</span>
                          </div>
                          <div className="text-[10px] text-obsidian-text-muted leading-relaxed mb-3">
                            {preset.description}
                          </div>
                          <div className="space-y-1 text-[9px] text-obsidian-text-muted/70">
                            <div>Agentes: {preset.config.maxAgents}</div>
                            <div>Prioridad: {preset.config.priority}</div>
                            <div>Budget: ${preset.config.budget}</div>
                          </div>
                        </button>
                        <button
                          onClick={() => deletePreset(preset.id)}
                          className="absolute top-2 right-2 p-1 rounded bg-red-500/10 border border-red-500/30 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 size={12} className="text-red-400" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg text-[11px] text-blue-200 leading-relaxed">
                <strong>Tip:</strong> Los presets te permiten guardar configuraciones frecuentes. Selecciona uno para aplicar su configuración al formulario.
              </div>
            </div>
          </ObsidianCard>

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
              {selectedMission.status === 'IDLE' && (
                <button
                  onClick={() => showConfirmation(selectedMission.id, 'start')}
                  className="p-2 rounded-lg border border-white/[0.1] hover:bg-white/[0.05] transition-all"
                  title="Iniciar"
                >
                  <PlayCircle size={16} className="text-[#45FF9A]" />
                </button>
              )}
              {selectedMission.status === 'OPERATIONAL' && (
                <button
                  onClick={() => showConfirmation(selectedMission.id, 'pause')}
                  className="p-2 rounded-lg border border-white/[0.1] hover:bg-white/[0.05] transition-all"
                  title="Pausar"
                >
                  <Pause size={16} className="text-yellow-400" />
                </button>
              )}
              {selectedMission.status === 'PAUSED' && (
                <>
                  <button
                    onClick={() => showConfirmation(selectedMission.id, 'resume')}
                    className="p-2 rounded-lg border border-white/[0.1] hover:bg-white/[0.05] transition-all"
                    title="Reanudar"
                  >
                    <PlayCircle size={16} className="text-[#45FF9A]" />
                  </button>
                  <button
                    onClick={() => showConfirmation(selectedMission.id, 'cancel')}
                    className="p-2 rounded-lg border border-white/[0.1] hover:bg-red-500/[0.1] transition-all"
                    title="Cancelar"
                  >
                    <X size={16} className="text-red-400" />
                  </button>
                </>
              )}
              {['OPERATIONAL', 'PAUSED'].includes(selectedMission.status) && (
                <button
                  onClick={() => showConfirmation(selectedMission.id, 'stop')}
                  className="p-2 rounded-lg border border-white/[0.1] hover:bg-red-500/[0.1] transition-all"
                  title="Detener"
                >
                  <StopCircle size={16} className="text-red-400" />
                </button>
              )}

              {/* Export Button (Phase 6) */}
              <div className="relative">
                <button
                  onClick={() => setExportDropdownOpen(!exportDropdownOpen)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg border border-white/[0.1] hover:bg-white/[0.05] transition-all text-white text-xs"
                  title="Exportar misión"
                >
                  <Download size={14} />
                  Exportar
                </button>

                {exportDropdownOpen && (
                  <div className="absolute right-0 top-full mt-2 w-48 bg-[#0F0F12]/98 backdrop-blur-md border border-white/[0.2] rounded-lg shadow-obsidian-deep z-50">
                    <button
                      onClick={() => {
                        exportToCSV(selectedMission);
                        setExportDropdownOpen(false);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-white/[0.05] transition-all border-b border-white/[0.05]"
                    >
                      <FileText size={14} className="text-green-400" />
                      <div>
                        <div className="text-xs text-white">CSV</div>
                        <div className="text-[9px] text-obsidian-text-muted">Datos tabulados</div>
                      </div>
                    </button>
                    <button
                      onClick={() => {
                        exportToJSON(selectedMission);
                        setExportDropdownOpen(false);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-white/[0.05] transition-all border-b border-white/[0.05]"
                    >
                      <Database size={14} className="text-purple-400" />
                      <div>
                        <div className="text-xs text-white">JSON</div>
                        <div className="text-[9px] text-obsidian-text-muted">Datos completos</div>
                      </div>
                    </button>
                    <button
                      onClick={() => {
                        exportToPDF(selectedMission);
                        setExportDropdownOpen(false);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-white/[0.05] transition-all"
                    >
                      <FileText size={14} className="text-blue-400" />
                      <div>
                        <div className="text-xs text-white">PDF</div>
                        <div className="text-[9px] text-obsidian-text-muted">Reporte formateado</div>
                      </div>
                    </button>
                  </div>
                )}
              </div>
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

              <canvas
                ref={canvasRef}
                className="w-full h-full block cursor-pointer"
                onMouseMove={handleCanvasMouseMove}
                onClick={handleCanvasClick}
                onMouseLeave={() => {
                  setCanvasTooltip(null);
                  setHoveredAgentId(null);
                  if (canvasRef.current) {
                    canvasRef.current.style.cursor = 'default';
                  }
                }}
              />
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

            {/* Results Panel */}
            <ObsidianCard>
              <h3 className="text-sm font-normal text-[#F5F5F7] uppercase tracking-wider mb-4 flex items-center gap-2">
                <BarChart3 size={14} />
                Resultados de Misión ({selectedMission.results.length})
              </h3>

              {selectedMission.results.length === 0 ? (
                <div className="text-xs text-obsidian-text-muted italic py-4 text-center">
                  Esperando resultados... Se generarán automáticamente al alcanzar hitos (25%, 50%, 75%, 100%)
                </div>
              ) : (
                <div className="space-y-3">
                  {selectedMission.results.slice().reverse().map(result => {
                    const [expanded, setExpanded] = React.useState(false);

                    const resultIcons = {
                      report: <FileText size={16} className="text-blue-400" />,
                      data: <Database size={16} className="text-purple-400" />,
                      insight: <TrendingUp size={16} className="text-yellow-400" />
                    };

                    return (
                      <div
                        key={result.id}
                        className="p-3 bg-white/[0.02] border border-white/[0.05] rounded-lg"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            {resultIcons[result.type]}
                            <div>
                              <div className="text-sm text-white font-medium">{result.title}</div>
                              <div className="text-[10px] text-obsidian-text-muted">
                                {result.type.toUpperCase()} • {result.timestamp.toLocaleTimeString()}
                              </div>
                            </div>
                          </div>
                          <button
                            onClick={() => setExpanded(!expanded)}
                            className="p-1 rounded hover:bg-white/[0.05] transition-all"
                          >
                            <ChevronRight
                              size={16}
                              className={`text-obsidian-text-muted transition-transform ${expanded ? 'rotate-90' : ''}`}
                            />
                          </button>
                        </div>

                        {expanded && (
                          <div className="mt-3 pt-3 border-t border-white/[0.05]">
                            <div className={`text-xs leading-relaxed ${
                              result.type === 'data' ? 'font-mono bg-black/20 p-3 rounded overflow-x-auto' : 'text-obsidian-text-muted'
                            }`}>
                              {result.content.split('\n').map((line, idx) => (
                                <div key={idx}>{line || '\u00A0'}</div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
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

            {/* Agents List */}
            <ObsidianCard className="flex-1 flex flex-col min-h-0">
              <h3 className="text-sm font-normal text-[#F5F5F7] uppercase tracking-wider mb-4 flex items-center gap-2">
                <Users size={14} />
                Agentes Activos ({selectedMission.agents?.length || 0})
              </h3>

              {/* Search and filters */}
              <div className="mb-3">
                <input
                  type="text"
                  placeholder="Buscar agente..."
                  className="w-full bg-white/[0.02] border border-white/[0.1] rounded px-3 py-2 text-xs text-white placeholder-obsidian-text-muted/50 focus:outline-none focus:border-obsidian-accent transition-colors"
                  value={agentFilter.searchQuery}
                  onChange={(e) => setAgentFilter({ ...agentFilter, searchQuery: e.target.value })}
                />
              </div>

              {/* Status filters */}
              <div className="flex gap-2 mb-4 flex-wrap">
                {(['all', 'working', 'idle', 'completed', 'error'] as const).map(status => {
                  const count = status === 'all'
                    ? selectedMission.agents?.length || 0
                    : selectedMission.agents?.filter(a => a.status === status).length || 0;

                  return (
                    <button
                      key={status}
                      onClick={() => setAgentFilter({ ...agentFilter, status })}
                      className={`px-2 py-1 text-[9px] uppercase rounded border transition-all ${
                        agentFilter.status === status
                          ? 'bg-white/[0.1] border-white/[0.3] text-white'
                          : 'bg-white/[0.02] border-white/[0.1] text-obsidian-text-muted hover:border-white/[0.2]'
                      }`}
                    >
                      {status} ({count})
                    </button>
                  );
                })}
              </div>

              {/* Agents list */}
              <div className="flex-1 overflow-y-auto space-y-2 pr-2">
                {selectedMission.agents
                  ?.filter(a => {
                    if (agentFilter.status !== 'all' && a.status !== agentFilter.status) return false;
                    if (agentFilter.searchQuery && !a.id.toLowerCase().includes(agentFilter.searchQuery.toLowerCase())) return false;
                    return true;
                  })
                  .slice(0, 20) // Virtualization: show first 20
                  .map(agent => {
                    const agentStatusColors: Record<AgentStatus, string> = {
                      working: '#45FF9A',
                      idle: '#BEBEC6',
                      completed: '#6A4FFB',
                      error: '#FF4545'
                    };

                    return (
                      <div
                        key={agent.id}
                        className={`p-2 bg-white/[0.02] rounded border transition-all cursor-pointer ${
                          hoveredAgentId === agent.id
                            ? 'border-obsidian-accent/50 bg-white/[0.04]'
                            : 'border-white/[0.05] hover:border-white/[0.1]'
                        }`}
                        onMouseEnter={() => setHoveredAgentId(agent.id)}
                        onMouseLeave={() => setHoveredAgentId(null)}
                        onClick={() => setSelectedAgentId(agent.id)}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <div
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: agentStatusColors[agent.status] }}
                          />
                          <span className="text-[10px] font-mono text-white">{agent.id}</span>
                          <span className={`text-[8px] uppercase px-1.5 py-0.5 rounded ${
                            agent.status === 'working' ? 'bg-green-500/20 text-green-400' :
                            agent.status === 'error' ? 'bg-red-500/20 text-red-400' :
                            agent.status === 'completed' ? 'bg-blue-500/20 text-blue-400' :
                            'bg-gray-500/20 text-gray-400'
                          }`}>
                            {agent.status}
                          </span>
                        </div>
                        <div className="text-[10px] text-obsidian-text-muted truncate">
                          {agent.currentTask}
                        </div>
                        <div className="flex gap-3 mt-1 text-[9px] text-obsidian-text-muted">
                          <span>{agent.tasksCompleted} tareas</span>
                          <span>{agent.dataProcessed}</span>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </ObsidianCard>

            {/* Live Logs */}
            <ObsidianCard className="flex-shrink-0" style={{ height: '300px' }}>
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

  // --- Confirmation Modal Component ---
  const renderConfirmationModal = () => (
    <>
      {confirmModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <ObsidianCard className="w-full max-w-md">
            <div className="mb-6">
              <h2 className="text-xl text-white mb-2">{confirmModal.title}</h2>
              <p className="text-sm text-obsidian-text-muted">{confirmModal.message}</p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setConfirmModal({ ...confirmModal, isOpen: false })}
                className="flex-1 py-3 px-4 border border-white/[0.1] rounded-lg text-white hover:bg-white/[0.05] transition-all"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmedAction}
                className={`flex-1 py-3 px-4 rounded-lg text-white transition-all ${confirmModal.confirmColor}`}
              >
                {confirmModal.confirmText}
              </button>
            </div>
          </ObsidianCard>
        </div>
      )}
    </>
  );

  // --- Agent Detail Modal Component ---
  const renderAgentDetailModal = () => {
    if (!selectedAgentId || !selectedMission?.agents) return null;

    const agent = selectedMission.agents.find(a => a.id === selectedAgentId);
    if (!agent) return null;

    const agentStatusColors: Record<AgentStatus, string> = {
      working: '#45FF9A',
      idle: '#BEBEC6',
      completed: '#6A4FFB',
      error: '#FF4545'
    };

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
        <ObsidianCard className="w-full max-w-md">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl text-white">{agent.id} Detalles</h2>
            <button
              onClick={() => setSelectedAgentId(null)}
              className="p-2 rounded-lg border border-white/[0.1] hover:bg-white/[0.05] transition-all"
            >
              <X size={20} className="text-white" />
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <div className="text-xs text-obsidian-text-muted uppercase mb-2">Estado</div>
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: agentStatusColors[agent.status] }}
                />
                <span className="text-sm text-white font-medium uppercase">{agent.status}</span>
              </div>
            </div>

            <div>
              <div className="text-xs text-obsidian-text-muted uppercase mb-2">Tarea Actual</div>
              <div className="text-sm text-white">{agent.currentTask}</div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-xs text-obsidian-text-muted uppercase mb-2">Tareas Completadas</div>
                <div className="text-xl font-thin text-white">{agent.tasksCompleted}</div>
              </div>
              <div>
                <div className="text-xs text-obsidian-text-muted uppercase mb-2">Datos Procesados</div>
                <div className="text-xl font-thin text-white">{agent.dataProcessed}</div>
              </div>
            </div>

            <div>
              <div className="text-xs text-obsidian-text-muted uppercase mb-2">Última Actualización</div>
              <div className="text-sm text-white">
                {agent.lastUpdate.toLocaleTimeString()}
              </div>
            </div>

            {agent.errorMessage && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <AlertTriangle size={14} className="text-red-400" />
                  <span className="text-xs text-red-400 uppercase font-medium">Error</span>
                </div>
                <div className="text-xs text-red-200">{agent.errorMessage}</div>
              </div>
            )}
          </div>
        </ObsidianCard>
      </div>
    );
  };

  // --- Canvas Tooltip Component (Phase 4) ---
  const renderCanvasTooltip = () => {
    if (!canvasTooltip || !canvasTooltip.visible || !canvasTooltip.agent) return null;

    const agentStatusColors: Record<AgentStatus, string> = {
      working: '#45FF9A',
      idle: '#BEBEC6',
      completed: '#6A4FFB',
      error: '#FF4545'
    };

    return (
      <div
        className="fixed z-[60] pointer-events-none"
        style={{
          left: canvasTooltip.x + 15,
          top: canvasTooltip.y + 15,
        }}
      >
        <div className="bg-[#0F0F12]/98 backdrop-blur-md border border-white/[0.2] rounded-lg px-3 py-2.5 shadow-obsidian-deep">
          <div className="flex items-center gap-2 mb-2">
            <div
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: agentStatusColors[canvasTooltip.agent.status] }}
            />
            <span className="text-xs text-white font-medium">{canvasTooltip.agent.id}</span>
          </div>

          <div className="text-[10px] text-obsidian-text-muted uppercase mb-1">
            {canvasTooltip.agent.status}
          </div>

          <div className="text-[11px] text-white mb-2 max-w-[200px]">
            {canvasTooltip.agent.currentTask}
          </div>

          <div className="flex gap-3 text-[10px]">
            <div>
              <span className="text-obsidian-text-muted">Tareas:</span>{' '}
              <span className="text-white">{canvasTooltip.agent.tasksCompleted}</span>
            </div>
            <div>
              <span className="text-obsidian-text-muted">Datos:</span>{' '}
              <span className="text-white">{canvasTooltip.agent.dataProcessed}</span>
            </div>
          </div>

          <div className="text-[9px] text-obsidian-text-muted/60 mt-2 italic">
            Click para ver detalles completos
          </div>
        </div>
      </div>
    );
  };

  // --- Glossary Modal Component ---
  const renderGlossaryModal = () => (
    <>
      {glossaryOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <ObsidianCard className="w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl text-white">Glosario HAAS</h2>
              <button
                onClick={() => setGlossaryOpen(false)}
                className="p-2 rounded-lg border border-white/[0.1] hover:bg-white/[0.05] transition-all"
              >
                <X size={20} className="text-white" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-white mb-1">Enjambre (Swarm)</h3>
                <p className="text-xs text-obsidian-text-muted leading-relaxed">
                  Conjunto coordinado de agentes autónomos que trabajan en paralelo para completar una misión compleja.
                  Cada enjambre tiene capacidades específicas según su tipo (Research, Sentiment, Negotiation, etc.).
                </p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-white mb-1">Agente</h3>
                <p className="text-xs text-obsidian-text-muted leading-relaxed">
                  Unidad micro-autónoma de IA que ejecuta tareas específicas de forma independiente. Cada agente puede
                  procesar datos, tomar decisiones y completar tareas sin supervisión constante.
                </p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-white mb-1">HAAS (Hierarchical Autonomous Agent Swarms)</h3>
                <p className="text-xs text-obsidian-text-muted leading-relaxed">
                  Sistema de enjambres jerárquicos de agentes autónomos. Permite desplegar cientos de agentes especializados
                  que trabajan coordinadamente bajo una estructura organizativa jerárquica.
                </p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-white mb-1">Misión</h3>
                <p className="text-xs text-obsidian-text-muted leading-relaxed">
                  Objetivo de alto nivel asignado a un enjambre completo. Una misión se divide automáticamente en múltiples
                  tareas que se distribuyen entre los agentes disponibles.
                </p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-white mb-1">KPI (Key Performance Indicator)</h3>
                <p className="text-xs text-obsidian-text-muted leading-relaxed">
                  Métrica clave de rendimiento que mide el progreso y efectividad de una misión. Incluye datos procesados,
                  tareas completadas, precisión, y coste acumulado.
                </p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-white mb-1">Precisión</h3>
                <p className="text-xs text-obsidian-text-muted leading-relaxed">
                  Porcentaje de resultados correctos generados por el enjambre, calculado mediante validaciones cruzadas
                  entre agentes y verificación de fuentes múltiples.
                </p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-white mb-1">Sentimiento</h3>
                <p className="text-xs text-obsidian-text-muted leading-relaxed">
                  Métrica de análisis de sentimiento que va de -100% (muy negativo) a +100% (muy positivo). Se calcula
                  procesando texto de redes sociales, comentarios, reviews y otras fuentes de opinión.
                </p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-white mb-1">Despliegue</h3>
                <p className="text-xs text-obsidian-text-muted leading-relaxed">
                  Proceso de inicialización y asignación de recursos a los agentes de un enjambre. Durante el despliegue,
                  cada agente recibe sus instrucciones, accesos y parámetros de configuración.
                </p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-white mb-1">Resultado</h3>
                <p className="text-xs text-obsidian-text-muted leading-relaxed">
                  Output generado por la misión. Puede ser un reporte (análisis textual), datos (conjuntos de información
                  estructurada), o insights (descubrimientos y oportunidades identificadas automáticamente).
                </p>
              </div>
            </div>
          </ObsidianCard>
        </div>
      )}
    </>
  );

  // --- Save Preset Modal (Phase 8) ---
  const renderSavePresetModal = () => (
    <>
      {savePresetModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <ObsidianCard className="w-full max-w-md">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl text-white">Guardar Preset Personalizado</h2>
              <button
                onClick={() => setSavePresetModal({ isOpen: false, presetName: '', presetDescription: '' })}
                className="p-2 rounded-lg border border-white/[0.1] hover:bg-white/[0.05] transition-all"
              >
                <X size={20} className="text-white" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs text-obsidian-text-muted uppercase mb-2">Nombre del Preset</label>
                <input
                  type="text"
                  value={savePresetModal.presetName}
                  onChange={(e) => setSavePresetModal({ ...savePresetModal, presetName: e.target.value })}
                  placeholder="Ej: Mi Configuración Rápida"
                  className="w-full bg-[#0B0B0D]/50 text-white font-light text-sm placeholder-obsidian-text-muted/30 border border-white/[0.08] rounded-md py-3 px-4 outline-none transition-all duration-300 focus:border-white/[0.15] focus:bg-[#111114]"
                />
              </div>

              <div>
                <label className="block text-xs text-obsidian-text-muted uppercase mb-2">Descripción (opcional)</label>
                <textarea
                  value={savePresetModal.presetDescription}
                  onChange={(e) => setSavePresetModal({ ...savePresetModal, presetDescription: e.target.value })}
                  placeholder="Describe brevemente esta configuración..."
                  className="w-full bg-[#0B0B0D]/50 text-white font-light text-sm placeholder-obsidian-text-muted/30 border border-white/[0.08] rounded-md py-3 px-4 outline-none transition-all duration-300 focus:border-white/[0.15] focus:bg-[#111114] resize-none"
                  rows={3}
                />
              </div>

              <div className="p-3 bg-white/[0.02] border border-white/[0.05] rounded-lg">
                <div className="text-[10px] text-obsidian-text-muted uppercase mb-2">Vista Previa de Configuración</div>
                <div className="space-y-1 text-xs text-white">
                  <div>Tipo: {createForm.swarmType ? SWARM_TEMPLATES.find(t => t.id === createForm.swarmType)?.name : 'No seleccionado'}</div>
                  <div>Agentes: {createForm.maxAgents}</div>
                  <div>Prioridad: {createForm.priority}</div>
                  <div>Budget: ${createForm.budget}</div>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setSavePresetModal({ isOpen: false, presetName: '', presetDescription: '' })}
                  className="flex-1 py-3 rounded-md text-sm border border-white/[0.1] text-obsidian-text-muted hover:text-white hover:bg-white/[0.05] transition-all"
                >
                  Cancelar
                </button>
                <button
                  onClick={saveCustomPreset}
                  className="flex-1 py-3 rounded-md text-sm bg-obsidian-accent/20 border border-obsidian-accent/50 text-white hover:bg-obsidian-accent/30 transition-all"
                >
                  Guardar Preset
                </button>
              </div>
            </div>
          </ObsidianCard>
        </div>
      )}
    </>
  );

  // --- Main Render ---
  return (
    <>
      {(() => {
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
      })()}
      {renderConfirmationModal()}
      {renderAgentDetailModal()}
      {renderCanvasTooltip()}
      {renderGlossaryModal()}
      {renderSavePresetModal()}
    </>
  );
};

export default SwarmOrchestrator;
