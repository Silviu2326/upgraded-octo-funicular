import React, { useState, useEffect, useRef } from 'react';
import { ObsidianCard, ObsidianButton, ObsidianInput } from './ui/ObsidianElements';
import {
  Activity, ShieldCheck, Zap, Server, Power, Wifi, Stethoscope, AlertOctagon,
  CheckCircle, XCircle, Clock, AlertTriangle, TrendingUp, TrendingDown,
  Play, Pause, Settings, Bell, BellOff, Mail, MessageSquare, Smartphone,
  Eye, RefreshCw, Terminal, Package, Database, Cpu, HardDrive, Network
} from 'lucide-react';

const GREEN_ACCENT = '#45FF9A';
const YELLOW_ACCENT = '#FFAA00';
const RED_ACCENT = '#FF4444';

// ==================== TYPE DEFINITIONS ====================

type ViewMode = 'dashboard' | 'incidents' | 'status' | 'playbooks' | 'alerts';

type IncidentStatus = 'ACTIVE' | 'HEALING' | 'RESOLVED' | 'FAILED';
type IncidentSeverity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
type ServiceStatus = 'OPERATIONAL' | 'DEGRADED' | 'DOWN' | 'MAINTENANCE';
type PlaybookStatus = 'ENABLED' | 'DISABLED' | 'TESTING';
type AlertChannel = 'EMAIL' | 'SLACK' | 'SMS' | 'WEBHOOK';

interface Incident {
  id: string;
  title: string;
  description: string;
  severity: IncidentSeverity;
  status: IncidentStatus;
  timestamp: Date;
  affectedService: string;
  detectedBy: string;
  actions: {
    step: number;
    action: string;
    timestamp: Date;
    status: 'SUCCESS' | 'FAILED' | 'PENDING';
  }[];
  resolution?: string;
  duration?: number; // in seconds
}

interface ServiceComponent {
  id: string;
  name: string;
  category: 'INFRASTRUCTURE' | 'API' | 'AGENT' | 'BUSINESS';
  status: ServiceStatus;
  uptime: number; // percentage
  latency: number; // ms
  lastIncident: Date | null;
  metrics: {
    cpu?: number;
    memory?: number;
    requests?: number;
    errors?: number;
  };
}

interface Playbook {
  id: string;
  name: string;
  description: string;
  trigger: {
    condition: string;
    threshold: string;
  };
  actions: string[];
  status: PlaybookStatus;
  executionCount: number;
  successRate: number;
  lastExecuted: Date | null;
  avgResolutionTime: number; // seconds
}

interface AlertRule {
  id: string;
  name: string;
  condition: string;
  threshold: string;
  channels: AlertChannel[];
  enabled: boolean;
  createdAt: Date;
  triggeredCount: number;
  lastTriggered: Date | null;
}

// ==================== SAMPLE DATA ====================

const SAMPLE_INCIDENTS: Incident[] = [
  {
    id: 'inc-001',
    title: 'Payment Gateway Latency Spike',
    description: 'Stripe API response time exceeded 1000ms threshold, affecting payment processing',
    severity: 'HIGH',
    status: 'HEALING',
    timestamp: new Date(Date.now() - 45000),
    affectedService: 'Stripe Payments',
    detectedBy: 'Latency Monitor',
    actions: [
      { step: 1, action: 'Detected latency spike: 1840ms average', timestamp: new Date(Date.now() - 45000), status: 'SUCCESS' },
      { step: 2, action: 'Initiated failover to PayPal backup processor', timestamp: new Date(Date.now() - 40000), status: 'SUCCESS' },
      { step: 3, action: 'Rerouted 23 pending transactions to PayPal', timestamp: new Date(Date.now() - 35000), status: 'SUCCESS' },
      { step: 4, action: 'Monitoring Stripe recovery...', timestamp: new Date(Date.now() - 30000), status: 'PENDING' }
    ]
  },
  {
    id: 'inc-002',
    title: 'Facebook Ad Policy Violation',
    description: 'Ad campaign flagged for policy violation: prohibited content detected',
    severity: 'MEDIUM',
    status: 'RESOLVED',
    timestamp: new Date(Date.now() - 720000),
    affectedService: 'Marketing Automation',
    detectedBy: 'Compliance Agent',
    actions: [
      { step: 1, action: 'Policy violation detected in campaign #4872', timestamp: new Date(Date.now() - 720000), status: 'SUCCESS' },
      { step: 2, action: 'Paused campaign automatically', timestamp: new Date(Date.now() - 710000), status: 'SUCCESS' },
      { step: 3, action: 'Compliance agent rewrote ad copy', timestamp: new Date(Date.now() - 680000), status: 'SUCCESS' },
      { step: 4, action: 'Resubmitted for review', timestamp: new Date(Date.now() - 650000), status: 'SUCCESS' },
      { step: 5, action: 'Approved and campaign resumed', timestamp: new Date(Date.now() - 600000), status: 'SUCCESS' }
    ],
    resolution: 'Ad copy rewritten to comply with Facebook policies. Campaign resumed successfully.',
    duration: 120
  },
  {
    id: 'inc-003',
    title: 'High CPU Load - Swarm Node 4',
    description: 'CPU utilization exceeded 85% on agent orchestration node',
    severity: 'MEDIUM',
    status: 'RESOLVED',
    timestamp: new Date(Date.now() - 900000),
    affectedService: 'Agent Swarm',
    detectedBy: 'Infrastructure Monitor',
    actions: [
      { step: 1, action: 'CPU spike detected: 87.3%', timestamp: new Date(Date.now() - 900000), status: 'SUCCESS' },
      { step: 2, action: 'Auto-scaled +2 containers', timestamp: new Date(Date.now() - 890000), status: 'SUCCESS' },
      { step: 3, action: 'Redistributed workload across nodes', timestamp: new Date(Date.now() - 880000), status: 'SUCCESS' },
      { step: 4, action: 'CPU normalized to 42%', timestamp: new Date(Date.now() - 870000), status: 'SUCCESS' }
    ],
    resolution: 'Horizontal scaling resolved the issue. Additional capacity maintained for 24h.',
    duration: 30
  },
  {
    id: 'inc-004',
    title: 'Data Drift in Pricing Model',
    description: 'ML model predictions diverging from expected distribution',
    severity: 'LOW',
    status: 'RESOLVED',
    timestamp: new Date(Date.now() - 3600000),
    affectedService: 'Pricing Engine',
    detectedBy: 'Model Monitor',
    actions: [
      { step: 1, action: 'Data drift detected: PSI score 0.42', timestamp: new Date(Date.now() - 3600000), status: 'SUCCESS' },
      { step: 2, action: 'Collected last 1000 samples for retraining', timestamp: new Date(Date.now() - 3590000), status: 'SUCCESS' },
      { step: 3, action: 'Retrained model with updated weights', timestamp: new Date(Date.now() - 3500000), status: 'SUCCESS' },
      { step: 4, action: 'Validation tests passed (R² = 0.94)', timestamp: new Date(Date.now() - 3450000), status: 'SUCCESS' },
      { step: 5, action: 'Deployed updated model', timestamp: new Date(Date.now() - 3400000), status: 'SUCCESS' }
    ],
    resolution: 'Model retrained and redeployed. Performance metrics within acceptable range.',
    duration: 200
  },
  {
    id: 'inc-005',
    title: 'Database Connection Pool Exhausted',
    description: 'PostgreSQL connection pool reached maximum capacity',
    severity: 'CRITICAL',
    status: 'RESOLVED',
    timestamp: new Date(Date.now() - 7200000),
    affectedService: 'Database',
    detectedBy: 'Database Monitor',
    actions: [
      { step: 1, action: 'Connection pool exhaustion detected', timestamp: new Date(Date.now() - 7200000), status: 'SUCCESS' },
      { step: 2, action: 'Identified long-running queries (>30s)', timestamp: new Date(Date.now() - 7190000), status: 'SUCCESS' },
      { step: 3, action: 'Killed 8 slow queries', timestamp: new Date(Date.now() - 7180000), status: 'SUCCESS' },
      { step: 4, action: 'Increased pool size from 20 to 40', timestamp: new Date(Date.now() - 7170000), status: 'SUCCESS' },
      { step: 5, action: 'Connection pool stabilized', timestamp: new Date(Date.now() - 7160000), status: 'SUCCESS' }
    ],
    resolution: 'Slow queries terminated and connection pool expanded. Query optimization scheduled.',
    duration: 40
  }
];

const SAMPLE_SERVICES: ServiceComponent[] = [
  {
    id: 'svc-001',
    name: 'OpenAI GPT-4',
    category: 'API',
    status: 'OPERATIONAL',
    uptime: 99.98,
    latency: 245,
    lastIncident: new Date(Date.now() - 604800000),
    metrics: { requests: 12847, errors: 3 }
  },
  {
    id: 'svc-002',
    name: 'Stripe Payments',
    category: 'API',
    status: 'DEGRADED',
    uptime: 99.12,
    latency: 840,
    lastIncident: new Date(Date.now() - 45000),
    metrics: { requests: 1547, errors: 12 }
  },
  {
    id: 'svc-003',
    name: 'AWS us-east-1',
    category: 'INFRASTRUCTURE',
    status: 'OPERATIONAL',
    uptime: 99.99,
    latency: 42,
    lastIncident: new Date(Date.now() - 2592000000),
    metrics: { cpu: 34, memory: 58 }
  },
  {
    id: 'svc-004',
    name: 'PostgreSQL Primary',
    category: 'INFRASTRUCTURE',
    status: 'OPERATIONAL',
    uptime: 99.95,
    latency: 8,
    lastIncident: new Date(Date.now() - 7200000),
    metrics: { cpu: 42, memory: 67 }
  },
  {
    id: 'svc-005',
    name: 'Agent Swarm Orchestrator',
    category: 'AGENT',
    status: 'OPERATIONAL',
    uptime: 99.87,
    latency: 125,
    lastIncident: new Date(Date.now() - 900000),
    metrics: { requests: 5248, errors: 8 }
  },
  {
    id: 'svc-006',
    name: 'Negotiation Hub',
    category: 'BUSINESS',
    status: 'OPERATIONAL',
    uptime: 99.92,
    latency: 210,
    lastIncident: null,
    metrics: { requests: 324, errors: 0 }
  },
  {
    id: 'svc-007',
    name: 'Binance Market Data',
    category: 'API',
    status: 'OPERATIONAL',
    uptime: 99.78,
    latency: 120,
    lastIncident: new Date(Date.now() - 432000000),
    metrics: { requests: 8947, errors: 21 }
  },
  {
    id: 'svc-008',
    name: 'Redis Cache',
    category: 'INFRASTRUCTURE',
    status: 'OPERATIONAL',
    uptime: 100.0,
    latency: 2,
    lastIncident: null,
    metrics: { memory: 42 }
  },
  {
    id: 'svc-009',
    name: 'Payment Processing',
    category: 'BUSINESS',
    status: 'DEGRADED',
    uptime: 98.45,
    latency: 1200,
    lastIncident: new Date(Date.now() - 45000),
    metrics: { requests: 847, errors: 23 }
  }
];

const SAMPLE_PLAYBOOKS: Playbook[] = [
  {
    id: 'pb-001',
    name: 'API Latency Failover',
    description: 'Automatically failover to backup service when primary API latency exceeds threshold',
    trigger: { condition: 'API latency > 1000ms', threshold: 'for 30 seconds' },
    actions: [
      'Detect latency spike above 1000ms',
      'Validate backup service availability',
      'Reroute traffic to backup processor',
      'Notify operations team',
      'Monitor primary service recovery'
    ],
    status: 'ENABLED',
    executionCount: 12,
    successRate: 91.7,
    lastExecuted: new Date(Date.now() - 45000),
    avgResolutionTime: 45
  },
  {
    id: 'pb-002',
    name: 'Auto-Scale on High Load',
    description: 'Scale infrastructure horizontally when resource utilization exceeds capacity',
    trigger: { condition: 'CPU > 85% or Memory > 90%', threshold: 'for 5 minutes' },
    actions: [
      'Detect resource saturation',
      'Calculate required additional capacity',
      'Provision new containers/instances',
      'Redistribute workload',
      'Verify scaling success'
    ],
    status: 'ENABLED',
    executionCount: 47,
    successRate: 100.0,
    lastExecuted: new Date(Date.now() - 900000),
    avgResolutionTime: 30
  },
  {
    id: 'pb-003',
    name: 'ML Model Retraining',
    description: 'Retrain and redeploy ML models when data drift is detected',
    trigger: { condition: 'PSI score > 0.4', threshold: 'instant' },
    actions: [
      'Detect data drift in model predictions',
      'Collect recent training samples',
      'Retrain model with updated dataset',
      'Run validation test suite',
      'Deploy if tests pass, rollback if fail'
    ],
    status: 'ENABLED',
    executionCount: 8,
    successRate: 87.5,
    lastExecuted: new Date(Date.now() - 3600000),
    avgResolutionTime: 200
  },
  {
    id: 'pb-004',
    name: 'Database Connection Recovery',
    description: 'Resolve database connection pool exhaustion and slow queries',
    trigger: { condition: 'Connection pool > 90% capacity', threshold: 'instant' },
    actions: [
      'Identify connection pool exhaustion',
      'Detect and kill long-running queries',
      'Increase pool size dynamically',
      'Log slow queries for optimization',
      'Monitor connection stability'
    ],
    status: 'ENABLED',
    executionCount: 3,
    successRate: 100.0,
    lastExecuted: new Date(Date.now() - 7200000),
    avgResolutionTime: 40
  },
  {
    id: 'pb-005',
    name: 'Compliance Violation Fix',
    description: 'Automatically correct policy violations in marketing campaigns',
    trigger: { condition: 'Policy violation detected', threshold: 'instant' },
    actions: [
      'Detect compliance violation',
      'Pause affected campaign',
      'AI agent rewrites violating content',
      'Resubmit for approval',
      'Resume campaign on approval'
    ],
    status: 'ENABLED',
    executionCount: 15,
    successRate: 93.3,
    lastExecuted: new Date(Date.now() - 720000),
    avgResolutionTime: 120
  },
  {
    id: 'pb-006',
    name: 'SSL Certificate Renewal',
    description: 'Automatically renew SSL certificates before expiration',
    trigger: { condition: 'Certificate expires in < 7 days', threshold: 'daily check' },
    actions: [
      'Detect expiring certificates',
      'Request renewal from CA',
      'Validate new certificate',
      'Deploy across load balancers',
      'Verify HTTPS functionality'
    ],
    status: 'ENABLED',
    executionCount: 24,
    successRate: 100.0,
    lastExecuted: new Date(Date.now() - 1209600000),
    avgResolutionTime: 300
  }
];

const SAMPLE_ALERTS: AlertRule[] = [
  {
    id: 'alert-001',
    name: 'Critical Service Down',
    condition: 'Service status = DOWN',
    threshold: 'instant',
    channels: ['EMAIL', 'SMS', 'SLACK'],
    enabled: true,
    createdAt: new Date('2024-01-15'),
    triggeredCount: 2,
    lastTriggered: new Date(Date.now() - 2592000000)
  },
  {
    id: 'alert-002',
    name: 'High Error Rate',
    condition: 'Error rate > 5%',
    threshold: 'for 10 minutes',
    channels: ['EMAIL', 'SLACK'],
    enabled: true,
    createdAt: new Date('2024-02-10'),
    triggeredCount: 8,
    lastTriggered: new Date(Date.now() - 432000000)
  },
  {
    id: 'alert-003',
    name: 'Payment Processing Failure',
    condition: 'Payment success rate < 95%',
    threshold: 'for 5 minutes',
    channels: ['SMS', 'SLACK'],
    enabled: true,
    createdAt: new Date('2024-03-05'),
    triggeredCount: 5,
    lastTriggered: new Date(Date.now() - 45000)
  },
  {
    id: 'alert-004',
    name: 'Database Performance',
    condition: 'Query latency > 1000ms',
    threshold: 'for 15 minutes',
    channels: ['EMAIL'],
    enabled: true,
    createdAt: new Date('2024-04-20'),
    triggeredCount: 12,
    lastTriggered: new Date(Date.now() - 7200000)
  },
  {
    id: 'alert-005',
    name: 'Agent Swarm Failure',
    condition: 'Agent mission success rate < 80%',
    threshold: 'for 30 minutes',
    channels: ['EMAIL', 'SLACK'],
    enabled: false,
    createdAt: new Date('2024-05-12'),
    triggeredCount: 0,
    lastTriggered: null
  }
];

// ==================== MAIN COMPONENT ====================

const SystemHealth: React.FC = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('dashboard');
  const [selectedIncidentId, setSelectedIncidentId] = useState<string | null>(null);
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);
  const [selectedPlaybookId, setSelectedPlaybookId] = useState<string | null>(null);
  const [showNewAlertForm, setShowNewAlertForm] = useState(false);

  const anatomyCanvasRef = useRef<HTMLCanvasElement>(null);
  const ecgCanvasRef = useRef<HTMLCanvasElement>(null);

  // Calculate overall health score
  const overallHealth = SAMPLE_SERVICES.reduce((sum, svc) => sum + svc.uptime, 0) / SAMPLE_SERVICES.length;
  const activeIncidents = SAMPLE_INCIDENTS.filter(i => i.status === 'ACTIVE' || i.status === 'HEALING').length;

  // ECG Animation
  useEffect(() => {
    if (viewMode !== 'dashboard') return;

    const canvas = ecgCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      const { width, height } = canvas.getBoundingClientRect();
      canvas.width = width;
      canvas.height = height;
    };
    resize();
    window.addEventListener('resize', resize);

    let time = 0;
    const data: number[] = new Array(canvas.width).fill(canvas.height / 2);

    const render = () => {
      const { width, height } = canvas;
      time += 0.05;

      data.shift();

      const base = height / 2;
      let y = base;

      const beatPhase = time % 10;
      if (beatPhase > 8 && beatPhase < 9) {
        const t = (beatPhase - 8) * 5;
        if (t < 1) y -= 10 * t;
        else if (t < 2) y += 30 * (t - 1);
        else if (t < 3) y -= 40 * (t - 2);
        else y = base;
      } else {
        y = base + (Math.random() - 0.5) * 2;
      }

      data.push(y);

      ctx.clearRect(0, 0, width, height);
      ctx.beginPath();
      ctx.strokeStyle = GREEN_ACCENT;
      ctx.lineWidth = 1.5;
      ctx.shadowBlur = 4;
      ctx.shadowColor = GREEN_ACCENT;

      for (let i = 0; i < width; i++) {
        if (i === 0) ctx.moveTo(i, data[i]);
        else ctx.lineTo(i, data[i]);
      }
      ctx.stroke();

      const lastY = data[data.length - 1];
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(width - 2, lastY, 2, 0, Math.PI * 2);
      ctx.fill();

      requestAnimationFrame(render);
    };
    const animId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animId);
    };
  }, [viewMode]);

  // System Anatomy Animation
  useEffect(() => {
    if (viewMode !== 'dashboard') return;

    const canvas = anatomyCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      const { width, height } = canvas.getBoundingClientRect();
      canvas.width = width * 2;
      canvas.height = height * 2;
      ctx.scale(2, 2);
    };
    resize();
    window.addEventListener('resize', resize);

    let time = 0;

    const render = () => {
      time += 0.01;
      const { width: w, height: h } = canvas.getBoundingClientRect();
      const cx = w / 2;
      const cy = h / 2;

      ctx.clearRect(0, 0, w, h);

      // Outer shield
      ctx.beginPath();
      ctx.arc(cx, cy, 140, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(69, 255, 154, 0.1)';
      ctx.lineWidth = 1;
      ctx.setLineDash([5, 10]);
      ctx.stroke();

      // Rotating shield
      ctx.beginPath();
      ctx.arc(cx, cy, 150, time * 0.5, time * 0.5 + Math.PI / 2);
      ctx.strokeStyle = GREEN_ACCENT;
      ctx.lineWidth = 2;
      ctx.setLineDash([]);
      ctx.shadowBlur = 10;
      ctx.shadowColor = GREEN_ACCENT;
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Concentric rings
      const rings = 5;
      for (let i = 0; i < rings; i++) {
        const r = 30 + i * 20;
        const offset = i % 2 === 0 ? 1 : -1;
        const rotation = time * 0.2 * offset + i;

        ctx.beginPath();
        const segments = 6;
        for (let j = 0; j <= segments; j++) {
          const angle = rotation + (j / segments) * Math.PI * 2;
          const px = cx + Math.cos(angle) * r;
          const py = cy + Math.sin(angle) * r;
          if (j === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.closePath();

        const isHealing = activeIncidents > 0 && i === 2;

        ctx.strokeStyle = isHealing ? YELLOW_ACCENT : 'rgba(255, 255, 255, 0.1)';
        ctx.lineWidth = isHealing ? 2 : 1;

        if (isHealing) {
          ctx.setLineDash([2, 4]);
          ctx.shadowColor = YELLOW_ACCENT;
          ctx.shadowBlur = 5;
        } else {
          ctx.setLineDash([]);
          ctx.shadowBlur = 0;
        }

        ctx.stroke();
      }

      // Central nucleus
      const pulse = Math.sin(time * 3);
      ctx.beginPath();
      ctx.arc(cx, cy, 10 + pulse * 2, 0, Math.PI * 2);
      ctx.fillStyle = GREEN_ACCENT;
      ctx.fill();

      ctx.beginPath();
      ctx.arc(cx, cy, 20 + pulse * 5, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(69, 255, 154, 0.2)';
      ctx.fill();

      requestAnimationFrame(render);
    };

    const animId = requestAnimationFrame(render);
    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animId);
    };
  }, [viewMode, activeIncidents]);

  // ==================== RENDER FUNCTIONS ====================

  const renderDashboard = () => {
    const recentIncidents = SAMPLE_INCIDENTS.slice(0, 4);
    const criticalServices = SAMPLE_SERVICES.filter(s => s.status !== 'OPERATIONAL').slice(0, 3);

    return (
      <div className="w-full h-full flex flex-col gap-6">
        {/* Top Stats */}
        <div className="grid grid-cols-4 gap-4">
          <ObsidianCard className="border-l-4 border-l-green-500">
            <div className="flex items-center gap-2 mb-2">
              <Activity size={14} className="text-green-500" />
              <span className="text-[10px] uppercase tracking-wider text-obsidian-text-muted">Overall Health</span>
            </div>
            <p className="text-3xl text-green-500 font-light">{overallHealth.toFixed(2)}%</p>
            <div className="h-16 relative mt-3">
              <canvas ref={ecgCanvasRef} className="w-full h-full opacity-80" />
            </div>
          </ObsidianCard>

          <ObsidianCard>
            <div className="flex items-center gap-2 mb-2">
              <Stethoscope size={14} className="text-obsidian-text-muted" />
              <span className="text-[10px] uppercase tracking-wider text-obsidian-text-muted">Active Incidents</span>
            </div>
            <p className={`text-3xl font-light ${activeIncidents > 0 ? 'text-yellow-500' : 'text-green-500'}`}>
              {activeIncidents}
            </p>
            <p className="text-xs text-obsidian-text-muted mt-2">
              {activeIncidents > 0 ? `${activeIncidents} healing in progress` : 'All systems nominal'}
            </p>
          </ObsidianCard>

          <ObsidianCard>
            <div className="flex items-center gap-2 mb-2">
              <ShieldCheck size={14} className="text-obsidian-text-muted" />
              <span className="text-[10px] uppercase tracking-wider text-obsidian-text-muted">Compliance</span>
            </div>
            <p className="text-3xl text-green-500 font-light">100%</p>
            <p className="text-xs text-obsidian-text-muted mt-2">All regulations met</p>
          </ObsidianCard>

          <ObsidianCard>
            <div className="flex items-center gap-2 mb-2">
              <Zap size={14} className="text-obsidian-text-muted" />
              <span className="text-[10px] uppercase tracking-wider text-obsidian-text-muted">Auto-Heal Rate</span>
            </div>
            <p className="text-3xl text-green-500 font-light">94.2%</p>
            <p className="text-xs text-obsidian-text-muted mt-2">No human intervention</p>
          </ObsidianCard>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex gap-6 min-h-0">
          {/* System Anatomy */}
          <div className="w-2/5 flex flex-col">
            <ObsidianCard className="h-full relative overflow-hidden flex flex-col justify-center items-center" noPadding>
              <div className="absolute top-6 left-6 z-20">
                <h2 className="text-base text-white">System Anatomy</h2>
                <p className="text-[10px] text-obsidian-text-muted uppercase tracking-wider">Digital Homeostasis</p>
              </div>

              <div className="absolute top-6 right-6 z-20 text-right">
                <p className="text-[10px] text-obsidian-text-muted uppercase">Entropy Level</p>
                <p className="text-xl text-green-500 font-light">
                  {(100 - overallHealth).toFixed(2)}%
                </p>
              </div>

              <canvas ref={anatomyCanvasRef} className="w-full h-full block" />

              <div className="absolute bottom-10 bg-[#0F0F12]/80 backdrop-blur border border-white/10 px-4 py-2 rounded-full flex items-center gap-3">
                <div className="flex gap-1">
                  {[0, 1, 2].map(i => (
                    <span key={i} className={`w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse`} style={{ animationDelay: `${i * 100}ms` }}></span>
                  ))}
                </div>
                <span className="text-[10px] text-white uppercase tracking-wider">
                  {activeIncidents > 0 ? 'Healing in Progress' : 'All Systems Nominal'}
                </span>
              </div>
            </ObsidianCard>
          </div>

          {/* Recent Activity */}
          <div className="w-3/5 flex flex-col gap-6">
            {/* Recent Incidents */}
            <ObsidianCard className="flex-1 overflow-hidden flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm text-white flex items-center gap-2">
                  <Stethoscope size={14} />
                  Recent Incidents
                </h3>
                <ObsidianButton onClick={() => setViewMode('incidents')} variant="outline">
                  View All
                </ObsidianButton>
              </div>
              <div className="space-y-2 overflow-y-auto flex-1">
                {recentIncidents.map(incident => (
                  <div
                    key={incident.id}
                    className="p-3 bg-white/5 rounded border border-white/10 hover:bg-white/10 cursor-pointer transition-colors"
                    onClick={() => {
                      setSelectedIncidentId(incident.id);
                      setViewMode('incidents');
                    }}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {incident.status === 'RESOLVED' && <CheckCircle size={12} className="text-green-500" />}
                        {incident.status === 'HEALING' && <RefreshCw size={12} className="text-yellow-500 animate-spin" />}
                        {incident.status === 'ACTIVE' && <AlertTriangle size={12} className="text-red-500" />}
                        <span className={`text-xs font-medium ${incident.status === 'HEALING' ? 'text-yellow-500' : 'text-white'
                          }`}>
                          {incident.title}
                        </span>
                      </div>
                      <span className={`text-[9px] px-2 py-0.5 rounded ${incident.severity === 'CRITICAL' ? 'bg-red-500/20 text-red-500' :
                          incident.severity === 'HIGH' ? 'bg-orange-500/20 text-orange-500' :
                            incident.severity === 'MEDIUM' ? 'bg-yellow-500/20 text-yellow-500' :
                              'bg-blue-500/20 text-blue-500'
                        }`}>
                        {incident.severity}
                      </span>
                    </div>
                    <p className="text-[10px] text-obsidian-text-muted">
                      {incident.actions[incident.actions.length - 1].action}
                    </p>
                    <div className="flex items-center gap-2 mt-2 text-[9px] text-obsidian-text-muted">
                      <Clock size={10} />
                      {Math.floor((Date.now() - incident.timestamp.getTime()) / 1000 / 60)}m ago
                    </div>
                  </div>
                ))}
              </div>
            </ObsidianCard>

            {/* Service Status Overview */}
            <ObsidianCard>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm text-white flex items-center gap-2">
                  <Server size={14} />
                  Critical Services
                </h3>
                <ObsidianButton onClick={() => setViewMode('status')} variant="outline">
                  View All
                </ObsidianButton>
              </div>
              <div className="space-y-3">
                {criticalServices.length > 0 ? (
                  criticalServices.map(service => (
                    <div key={service.id} className="flex items-center justify-between p-2 bg-white/5 rounded">
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${service.status === 'OPERATIONAL' ? 'bg-green-500' :
                            service.status === 'DEGRADED' ? 'bg-yellow-500 animate-pulse' :
                              'bg-red-500 animate-pulse'
                          }`}></div>
                        <div>
                          <p className="text-xs text-white">{service.name}</p>
                          <p className="text-[10px] text-obsidian-text-muted">{service.status}</p>
                        </div>
                      </div>
                      <span className="text-[10px] text-obsidian-text-muted font-mono">{service.latency}ms</span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-green-500 text-center py-4">All services operational</p>
                )}
              </div>
            </ObsidianCard>
          </div>
        </div>
      </div>
    );
  };

  const renderIncidents = () => {
    const selectedIncident = selectedIncidentId ? SAMPLE_INCIDENTS.find(i => i.id === selectedIncidentId) : null;

    return (
      <div className="w-full h-full flex gap-6">
        {/* Incidents List */}
        <div className="w-1/2 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg text-white flex items-center gap-2">
              <Stethoscope size={18} />
              Immune Log
            </h2>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
              <span className="text-xs text-green-500">AUTO-HEAL ACTIVE</span>
            </div>
          </div>

          <ObsidianCard className="flex-1 overflow-hidden flex flex-col">
            <div className="space-y-2 overflow-y-auto flex-1">
              {SAMPLE_INCIDENTS.map(incident => (
                <div
                  key={incident.id}
                  className={`p-4 rounded border cursor-pointer transition-colors ${selectedIncidentId === incident.id
                      ? 'bg-obsidian-accent/10 border-obsidian-accent/30'
                      : 'bg-white/5 border-white/10 hover:bg-white/10'
                    }`}
                  onClick={() => setSelectedIncidentId(incident.id)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {incident.status === 'RESOLVED' && <CheckCircle size={14} className="text-green-500" />}
                      {incident.status === 'HEALING' && <RefreshCw size={14} className="text-yellow-500 animate-spin" />}
                      {incident.status === 'ACTIVE' && <AlertTriangle size={14} className="text-red-500" />}
                      {incident.status === 'FAILED' && <XCircle size={14} className="text-red-500" />}
                      <span className="text-sm text-white font-medium">{incident.title}</span>
                    </div>
                    <span className={`text-[9px] px-2 py-0.5 rounded font-semibold ${incident.severity === 'CRITICAL' ? 'bg-red-500/20 text-red-500' :
                        incident.severity === 'HIGH' ? 'bg-orange-500/20 text-orange-500' :
                          incident.severity === 'MEDIUM' ? 'bg-yellow-500/20 text-yellow-500' :
                            'bg-blue-500/20 text-blue-500'
                      }`}>
                      {incident.severity}
                    </span>
                  </div>

                  <p className="text-xs text-obsidian-text-muted mb-3">{incident.description}</p>

                  <div className="flex items-center justify-between text-[10px]">
                    <div className="flex items-center gap-4">
                      <span className="text-obsidian-text-muted">
                        <Clock size={10} className="inline mr-1" />
                        {Math.floor((Date.now() - incident.timestamp.getTime()) / 1000 / 60)}m ago
                      </span>
                      <span className="text-obsidian-text-muted">
                        {incident.actions.length} steps
                      </span>
                    </div>
                    <span className={`font-semibold uppercase ${incident.status === 'RESOLVED' ? 'text-green-500' :
                        incident.status === 'HEALING' ? 'text-yellow-500' :
                          'text-red-500'
                      }`}>
                      {incident.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-3 bg-green-500/5 border-t border-green-500/10 text-center">
              <p className="text-[10px] text-green-500">
                Human Intervention Saved: <span className="font-bold">14h 32m</span> this week
              </p>
            </div>
          </ObsidianCard>
        </div>

        {/* Incident Details */}
        <div className="w-1/2 flex flex-col gap-6">
          {selectedIncident ? (
            <>
              <ObsidianCard>
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg text-white font-medium">{selectedIncident.title}</h3>
                    <p className="text-sm text-obsidian-text-muted mt-1">{selectedIncident.description}</p>
                  </div>
                  <span className={`px-3 py-1 rounded text-xs font-semibold ${selectedIncident.status === 'RESOLVED' ? 'bg-green-500/20 text-green-500' :
                      selectedIncident.status === 'HEALING' ? 'bg-yellow-500/20 text-yellow-500' :
                        'bg-red-500/20 text-red-500'
                    }`}>
                    {selectedIncident.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 p-3 bg-white/5 rounded">
                  <div>
                    <span className="text-[10px] text-obsidian-text-muted uppercase block">Severity</span>
                    <span className="text-sm text-white">{selectedIncident.severity}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-obsidian-text-muted uppercase block">Affected Service</span>
                    <span className="text-sm text-white">{selectedIncident.affectedService}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-obsidian-text-muted uppercase block">Detected By</span>
                    <span className="text-sm text-white">{selectedIncident.detectedBy}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-obsidian-text-muted uppercase block">Timestamp</span>
                    <span className="text-sm text-white">{selectedIncident.timestamp.toLocaleTimeString()}</span>
                  </div>
                </div>
              </ObsidianCard>

              <ObsidianCard className="flex-1 overflow-hidden flex flex-col">
                <h4 className="text-sm text-white mb-4 flex items-center gap-2">
                  <Terminal size={14} />
                  Auto-Repair Actions
                </h4>
                <div className="space-y-3 overflow-y-auto flex-1">
                  {selectedIncident.actions.map((action, index) => (
                    <div key={index} className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${action.status === 'SUCCESS' ? 'bg-green-500/20 text-green-500' :
                            action.status === 'FAILED' ? 'bg-red-500/20 text-red-500' :
                              'bg-yellow-500/20 text-yellow-500'
                          }`}>
                          {action.step}
                        </div>
                        {index < selectedIncident.actions.length - 1 && (
                          <div className="w-0.5 h-full bg-white/10 mt-1"></div>
                        )}
                      </div>
                      <div className="flex-1 pb-4">
                        <div className="flex items-center gap-2 mb-1">
                          {action.status === 'SUCCESS' && <CheckCircle size={12} className="text-green-500" />}
                          {action.status === 'FAILED' && <XCircle size={12} className="text-red-500" />}
                          {action.status === 'PENDING' && <RefreshCw size={12} className="text-yellow-500 animate-spin" />}
                          <p className="text-xs text-white">{action.action}</p>
                        </div>
                        <span className="text-[10px] text-obsidian-text-muted">
                          {action.timestamp.toLocaleTimeString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {selectedIncident.resolution && (
                  <div className="mt-4 p-3 bg-green-500/10 border border-green-500/30 rounded">
                    <p className="text-[10px] text-green-500 uppercase mb-1">Resolution</p>
                    <p className="text-xs text-white">{selectedIncident.resolution}</p>
                    {selectedIncident.duration && (
                      <p className="text-[10px] text-obsidian-text-muted mt-2">
                        Resolved in {selectedIncident.duration}s
                      </p>
                    )}
                  </div>
                )}
              </ObsidianCard>
            </>
          ) : (
            <ObsidianCard className="flex-1 flex items-center justify-center">
              <div className="text-center text-obsidian-text-muted">
                <Stethoscope size={48} className="mx-auto mb-3 opacity-30" />
                <p className="text-sm">Select an incident to view details</p>
              </div>
            </ObsidianCard>
          )}
        </div>
      </div>
    );
  };

  const renderStatus = () => {
    const selectedService = selectedServiceId ? SAMPLE_SERVICES.find(s => s.id === selectedServiceId) : null;
    const categories: ServiceComponent['category'][] = ['INFRASTRUCTURE', 'API', 'AGENT', 'BUSINESS'];

    return (
      <div className="w-full h-full flex gap-6">
        {/* Services by Category */}
        <div className="w-1/2 flex flex-col gap-4">
          <h2 className="text-lg text-white flex items-center gap-2">
            <Server size={18} />
            System Status
          </h2>

          {categories.map(category => {
            const services = SAMPLE_SERVICES.filter(s => s.category === category);
            return (
              <ObsidianCard key={category}>
                <div className="flex items-center gap-2 mb-3">
                  {category === 'INFRASTRUCTURE' && <Cpu size={14} className="text-obsidian-accent" />}
                  {category === 'API' && <Wifi size={14} className="text-obsidian-accent" />}
                  {category === 'AGENT' && <Zap size={14} className="text-obsidian-accent" />}
                  {category === 'BUSINESS' && <Package size={14} className="text-obsidian-accent" />}
                  <h3 className="text-sm text-white font-medium">{category}</h3>
                </div>
                <div className="space-y-2">
                  {services.map(service => (
                    <div
                      key={service.id}
                      className={`p-3 rounded border cursor-pointer transition-colors ${selectedServiceId === service.id
                          ? 'bg-obsidian-accent/10 border-obsidian-accent/30'
                          : 'bg-white/5 border-white/10 hover:bg-white/10'
                        }`}
                      onClick={() => setSelectedServiceId(service.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${service.status === 'OPERATIONAL' ? 'bg-green-500' :
                              service.status === 'DEGRADED' ? 'bg-yellow-500 animate-pulse' :
                                service.status === 'DOWN' ? 'bg-red-500 animate-pulse' :
                                  'bg-blue-500'
                            }`}></div>
                          <span className="text-xs text-white">{service.name}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-[10px] text-obsidian-text-muted">{service.uptime.toFixed(2)}%</span>
                          <span className="text-[10px] text-obsidian-text-muted font-mono">{service.latency}ms</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ObsidianCard>
            );
          })}
        </div>

        {/* Service Details */}
        <div className="w-1/2 flex flex-col gap-6">
          {selectedService ? (
            <>
              <ObsidianCard>
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg text-white font-medium">{selectedService.name}</h3>
                    <p className="text-sm text-obsidian-text-muted mt-1">{selectedService.category}</p>
                  </div>
                  <span className={`px-3 py-1 rounded text-xs font-semibold ${selectedService.status === 'OPERATIONAL' ? 'bg-green-500/20 text-green-500' :
                      selectedService.status === 'DEGRADED' ? 'bg-yellow-500/20 text-yellow-500' :
                        selectedService.status === 'DOWN' ? 'bg-red-500/20 text-red-500' :
                          'bg-blue-500/20 text-blue-500'
                    }`}>
                    {selectedService.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-white/5 rounded">
                    <p className="text-[10px] text-obsidian-text-muted uppercase mb-1">Uptime</p>
                    <div className="flex items-end gap-2">
                      <p className="text-2xl text-green-500 font-light">{selectedService.uptime.toFixed(2)}%</p>
                      {selectedService.uptime >= 99.9 ? (
                        <TrendingUp size={14} className="text-green-500 mb-1" />
                      ) : (
                        <TrendingDown size={14} className="text-red-500 mb-1" />
                      )}
                    </div>
                  </div>

                  <div className="p-3 bg-white/5 rounded">
                    <p className="text-[10px] text-obsidian-text-muted uppercase mb-1">Latency</p>
                    <p className={`text-2xl font-light ${selectedService.latency > 500 ? 'text-red-500' :
                        selectedService.latency > 200 ? 'text-yellow-500' :
                          'text-green-500'
                      }`}>
                      {selectedService.latency}ms
                    </p>
                  </div>

                  <div className="p-3 bg-white/5 rounded">
                    <p className="text-[10px] text-obsidian-text-muted uppercase mb-1">Last Incident</p>
                    <p className="text-sm text-white">
                      {selectedService.lastIncident
                        ? `${Math.floor((Date.now() - selectedService.lastIncident.getTime()) / 1000 / 60 / 60)}h ago`
                        : 'Never'}
                    </p>
                  </div>

                  <div className="p-3 bg-white/5 rounded">
                    <p className="text-[10px] text-obsidian-text-muted uppercase mb-1">Status</p>
                    <p className="text-sm text-white">{selectedService.status}</p>
                  </div>
                </div>
              </ObsidianCard>

              <ObsidianCard>
                <h4 className="text-sm text-white mb-4">Metrics</h4>
                <div className="space-y-3">
                  {selectedService.metrics.cpu !== undefined && (
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-obsidian-text-muted">CPU Usage</span>
                        <span className="text-white">{selectedService.metrics.cpu}%</span>
                      </div>
                      <div className="w-full h-2 bg-white/10 rounded overflow-hidden">
                        <div
                          className={`h-full ${selectedService.metrics.cpu > 80 ? 'bg-red-500' :
                              selectedService.metrics.cpu > 60 ? 'bg-yellow-500' :
                                'bg-green-500'
                            }`}
                          style={{ width: `${selectedService.metrics.cpu}%` }}
                        ></div>
                      </div>
                    </div>
                  )}

                  {selectedService.metrics.memory !== undefined && (
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-obsidian-text-muted">Memory Usage</span>
                        <span className="text-white">{selectedService.metrics.memory}%</span>
                      </div>
                      <div className="w-full h-2 bg-white/10 rounded overflow-hidden">
                        <div
                          className={`h-full ${selectedService.metrics.memory > 80 ? 'bg-red-500' :
                              selectedService.metrics.memory > 60 ? 'bg-yellow-500' :
                                'bg-green-500'
                            }`}
                          style={{ width: `${selectedService.metrics.memory}%` }}
                        ></div>
                      </div>
                    </div>
                  )}

                  {selectedService.metrics.requests !== undefined && (
                    <div className="flex justify-between p-2 bg-white/5 rounded">
                      <span className="text-xs text-obsidian-text-muted">Total Requests</span>
                      <span className="text-xs text-white font-mono">{selectedService.metrics.requests.toLocaleString()}</span>
                    </div>
                  )}

                  {selectedService.metrics.errors !== undefined && (
                    <div className="flex justify-between p-2 bg-white/5 rounded">
                      <span className="text-xs text-obsidian-text-muted">Error Count</span>
                      <span className={`text-xs font-mono ${selectedService.metrics.errors > 10 ? 'text-red-500' :
                          selectedService.metrics.errors > 5 ? 'text-yellow-500' :
                            'text-green-500'
                        }`}>
                        {selectedService.metrics.errors}
                      </span>
                    </div>
                  )}
                </div>
              </ObsidianCard>

              <ObsidianCard className="flex-1">
                <h4 className="text-sm text-white mb-4">Actions</h4>
                <div className="space-y-2">
                  <ObsidianButton className="w-full justify-start" variant="outline">
                    <Eye size={14} />
                    View Detailed Logs
                  </ObsidianButton>
                  <ObsidianButton className="w-full justify-start" variant="outline">
                    <RefreshCw size={14} />
                    Restart Service
                  </ObsidianButton>
                  <ObsidianButton className="w-full justify-start" variant="outline">
                    <Settings size={14} />
                    Configure Monitoring
                  </ObsidianButton>
                </div>
              </ObsidianCard>
            </>
          ) : (
            <ObsidianCard className="flex-1 flex items-center justify-center">
              <div className="text-center text-obsidian-text-muted">
                <Server size={48} className="mx-auto mb-3 opacity-30" />
                <p className="text-sm">Select a service to view details</p>
              </div>
            </ObsidianCard>
          )}
        </div>
      </div>
    );
  };

  const renderPlaybooks = () => {
    const selectedPlaybook = selectedPlaybookId ? SAMPLE_PLAYBOOKS.find(p => p.id === selectedPlaybookId) : null;

    return (
      <div className="w-full h-full flex gap-6">
        {/* Playbooks List */}
        <div className="w-1/2 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg text-white flex items-center gap-2">
              <Terminal size={18} />
              Auto-Repair Playbooks
            </h2>
            <div className="flex items-center gap-2 text-xs text-green-500">
              <CheckCircle size={12} />
              {SAMPLE_PLAYBOOKS.filter(p => p.status === 'ENABLED').length} Active
            </div>
          </div>

          <ObsidianCard className="flex-1 overflow-hidden flex flex-col">
            <div className="space-y-2 overflow-y-auto flex-1">
              {SAMPLE_PLAYBOOKS.map(playbook => (
                <div
                  key={playbook.id}
                  className={`p-4 rounded border cursor-pointer transition-colors ${selectedPlaybookId === playbook.id
                      ? 'bg-obsidian-accent/10 border-obsidian-accent/30'
                      : 'bg-white/5 border-white/10 hover:bg-white/10'
                    }`}
                  onClick={() => setSelectedPlaybookId(playbook.id)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {playbook.status === 'ENABLED' ? (
                        <Play size={14} className="text-green-500" />
                      ) : (
                        <Pause size={14} className="text-yellow-500" />
                      )}
                      <span className="text-sm text-white font-medium">{playbook.name}</span>
                    </div>
                    <span className={`text-[9px] px-2 py-0.5 rounded font-semibold ${playbook.status === 'ENABLED' ? 'bg-green-500/20 text-green-500' :
                        playbook.status === 'TESTING' ? 'bg-yellow-500/20 text-yellow-500' :
                          'bg-red-500/20 text-red-500'
                      }`}>
                      {playbook.status}
                    </span>
                  </div>

                  <p className="text-xs text-obsidian-text-muted mb-3">{playbook.description}</p>

                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-obsidian-text-muted">
                      {playbook.executionCount} executions
                    </span>
                    <span className="text-green-500 font-semibold">
                      {playbook.successRate.toFixed(1)}% success
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </ObsidianCard>
        </div>

        {/* Playbook Details */}
        <div className="w-1/2 flex flex-col gap-6">
          {selectedPlaybook ? (
            <>
              <ObsidianCard>
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg text-white font-medium">{selectedPlaybook.name}</h3>
                    <p className="text-sm text-obsidian-text-muted mt-1">{selectedPlaybook.description}</p>
                  </div>
                  <button
                    className={`px-3 py-1 rounded text-xs font-semibold transition-colors ${selectedPlaybook.status === 'ENABLED'
                        ? 'bg-green-500/20 text-green-500 hover:bg-green-500/30'
                        : 'bg-red-500/20 text-red-500 hover:bg-red-500/30'
                      }`}
                  >
                    {selectedPlaybook.status === 'ENABLED' ? 'Disable' : 'Enable'}
                  </button>
                </div>

                <div className="p-3 bg-white/5 rounded mb-4">
                  <p className="text-[10px] text-obsidian-text-muted uppercase mb-2">Trigger Condition</p>
                  <div className="space-y-1">
                    <p className="text-xs text-white font-mono">{selectedPlaybook.trigger.condition}</p>
                    <p className="text-[10px] text-obsidian-text-muted">{selectedPlaybook.trigger.threshold}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-white/5 rounded">
                    <p className="text-[10px] text-obsidian-text-muted uppercase mb-1">Executions</p>
                    <p className="text-2xl text-white font-light">{selectedPlaybook.executionCount}</p>
                  </div>
                  <div className="p-3 bg-white/5 rounded">
                    <p className="text-[10px] text-obsidian-text-muted uppercase mb-1">Success Rate</p>
                    <p className="text-2xl text-green-500 font-light">{selectedPlaybook.successRate.toFixed(1)}%</p>
                  </div>
                  <div className="p-3 bg-white/5 rounded">
                    <p className="text-[10px] text-obsidian-text-muted uppercase mb-1">Avg Resolution</p>
                    <p className="text-2xl text-white font-light">{selectedPlaybook.avgResolutionTime}s</p>
                  </div>
                  <div className="p-3 bg-white/5 rounded">
                    <p className="text-[10px] text-obsidian-text-muted uppercase mb-1">Last Run</p>
                    <p className="text-sm text-white">
                      {selectedPlaybook.lastExecuted
                        ? `${Math.floor((Date.now() - selectedPlaybook.lastExecuted.getTime()) / 1000 / 60)}m ago`
                        : 'Never'}
                    </p>
                  </div>
                </div>
              </ObsidianCard>

              <ObsidianCard className="flex-1 overflow-hidden flex flex-col">
                <h4 className="text-sm text-white mb-4">Automated Actions</h4>
                <div className="space-y-2 overflow-y-auto flex-1">
                  {selectedPlaybook.actions.map((action, index) => (
                    <div key={index} className="flex gap-3 p-3 bg-white/5 rounded">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-obsidian-accent/20 text-obsidian-accent flex items-center justify-center text-xs font-bold">
                        {index + 1}
                      </div>
                      <p className="text-xs text-white flex-1">{action}</p>
                    </div>
                  ))}
                </div>
              </ObsidianCard>

              <ObsidianCard>
                <h4 className="text-sm text-white mb-3">Actions</h4>
                <div className="space-y-2">
                  <ObsidianButton className="w-full justify-start" variant="outline">
                    <Play size={14} />
                    Test Playbook
                  </ObsidianButton>
                  <ObsidianButton className="w-full justify-start" variant="outline">
                    <Eye size={14} />
                    View Execution History
                  </ObsidianButton>
                  <ObsidianButton className="w-full justify-start" variant="outline">
                    <Settings size={14} />
                    Edit Configuration
                  </ObsidianButton>
                </div>
              </ObsidianCard>
            </>
          ) : (
            <ObsidianCard className="flex-1 flex items-center justify-center">
              <div className="text-center text-obsidian-text-muted">
                <Terminal size={48} className="mx-auto mb-3 opacity-30" />
                <p className="text-sm">Select a playbook to view details</p>
              </div>
            </ObsidianCard>
          )}
        </div>
      </div>
    );
  };

  const renderAlerts = () => {
    return (
      <div className="w-full h-full flex gap-6">
        {/* Alert Rules List */}
        <div className="w-1/2 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg text-white flex items-center gap-2">
              <Bell size={18} />
              Alert Configuration
            </h2>
            <ObsidianButton onClick={() => setShowNewAlertForm(true)}>
              <Bell size={14} />
              New Alert
            </ObsidianButton>
          </div>

          {showNewAlertForm && (
            <ObsidianCard className="border border-obsidian-accent/30">
              <h3 className="text-sm text-white mb-4">Create New Alert Rule</h3>
              <div className="space-y-3">
                <ObsidianInput label="Alert Name" placeholder="e.g., High Error Rate" />
                <ObsidianInput label="Condition" placeholder="e.g., Error rate > 10%" />
                <ObsidianInput label="Threshold" placeholder="e.g., for 5 minutes" />

                <div>
                  <label className="text-xs text-obsidian-text-muted block mb-2">Notification Channels</label>
                  <div className="space-y-2">
                    {['EMAIL', 'SLACK', 'SMS', 'WEBHOOK'].map(channel => (
                      <label key={channel} className="flex items-center gap-2 text-xs cursor-pointer">
                        <input type="checkbox" className="rounded border-white/20" />
                        <span className="text-white">{channel}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <ObsidianButton className="flex-1" variant="outline" onClick={() => setShowNewAlertForm(false)}>
                    Cancel
                  </ObsidianButton>
                  <ObsidianButton className="flex-1">
                    <Bell size={14} />
                    Create Alert
                  </ObsidianButton>
                </div>
              </div>
            </ObsidianCard>
          )}

          <ObsidianCard className="flex-1 overflow-hidden flex flex-col">
            <div className="space-y-2 overflow-y-auto flex-1">
              {SAMPLE_ALERTS.map(alert => (
                <div
                  key={alert.id}
                  className="p-4 bg-white/5 rounded border border-white/10"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {alert.enabled ? (
                        <Bell size={14} className="text-green-500" />
                      ) : (
                        <BellOff size={14} className="text-red-500" />
                      )}
                      <span className="text-sm text-white font-medium">{alert.name}</span>
                    </div>
                    <button
                      className={`text-[9px] px-2 py-0.5 rounded font-semibold transition-colors ${alert.enabled
                          ? 'bg-green-500/20 text-green-500 hover:bg-green-500/30'
                          : 'bg-red-500/20 text-red-500 hover:bg-red-500/30'
                        }`}
                    >
                      {alert.enabled ? 'ENABLED' : 'DISABLED'}
                    </button>
                  </div>

                  <div className="space-y-2 mb-3">
                    <p className="text-xs text-obsidian-text-muted">
                      <span className="font-mono">{alert.condition}</span> {alert.threshold}
                    </p>
                    <div className="flex gap-2">
                      {alert.channels.map(channel => (
                        <span key={channel} className="text-[9px] px-2 py-0.5 bg-obsidian-accent/20 text-obsidian-accent rounded">
                          {channel === 'EMAIL' && <Mail size={10} className="inline mr-1" />}
                          {channel === 'SLACK' && <MessageSquare size={10} className="inline mr-1" />}
                          {channel === 'SMS' && <Smartphone size={10} className="inline mr-1" />}
                          {channel}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-obsidian-text-muted">
                    <span>Triggered {alert.triggeredCount} times</span>
                    <span>
                      {alert.lastTriggered
                        ? `${Math.floor((Date.now() - alert.lastTriggered.getTime()) / 1000 / 60 / 60)}h ago`
                        : 'Never triggered'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </ObsidianCard>
        </div>

        {/* Alert Information */}
        <div className="w-1/2 flex flex-col gap-6">
          <ObsidianCard>
            <h3 className="text-sm text-white mb-4">Alert Statistics</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-white/5 rounded">
                <p className="text-[10px] text-obsidian-text-muted uppercase mb-1">Total Rules</p>
                <p className="text-2xl text-white font-light">{SAMPLE_ALERTS.length}</p>
              </div>
              <div className="p-3 bg-white/5 rounded">
                <p className="text-[10px] text-obsidian-text-muted uppercase mb-1">Active Rules</p>
                <p className="text-2xl text-green-500 font-light">
                  {SAMPLE_ALERTS.filter(a => a.enabled).length}
                </p>
              </div>
              <div className="p-3 bg-white/5 rounded">
                <p className="text-[10px] text-obsidian-text-muted uppercase mb-1">Total Triggers</p>
                <p className="text-2xl text-white font-light">
                  {SAMPLE_ALERTS.reduce((sum, a) => sum + a.triggeredCount, 0)}
                </p>
              </div>
              <div className="p-3 bg-white/5 rounded">
                <p className="text-[10px] text-obsidian-text-muted uppercase mb-1">Last 24h</p>
                <p className="text-2xl text-yellow-500 font-light">3</p>
              </div>
            </div>
          </ObsidianCard>

          <ObsidianCard>
            <h3 className="text-sm text-white mb-4">Notification Channels</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-white/5 rounded">
                <div className="flex items-center gap-2">
                  <Mail size={14} className="text-obsidian-accent" />
                  <span className="text-xs text-white">Email</span>
                </div>
                <span className="text-[10px] text-green-500">Connected</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-white/5 rounded">
                <div className="flex items-center gap-2">
                  <MessageSquare size={14} className="text-obsidian-accent" />
                  <span className="text-xs text-white">Slack</span>
                </div>
                <span className="text-[10px] text-green-500">Connected</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-white/5 rounded">
                <div className="flex items-center gap-2">
                  <Smartphone size={14} className="text-obsidian-accent" />
                  <span className="text-xs text-white">SMS (Twilio)</span>
                </div>
                <span className="text-[10px] text-yellow-500">Not Configured</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-white/5 rounded">
                <div className="flex items-center gap-2">
                  <Network size={14} className="text-obsidian-accent" />
                  <span className="text-xs text-white">Webhook</span>
                </div>
                <span className="text-[10px] text-yellow-500">Not Configured</span>
              </div>
            </div>
          </ObsidianCard>

          <ObsidianCard className="flex-1">
            <h3 className="text-sm text-white mb-4">About Alert Rules</h3>
            <div className="space-y-3 text-xs text-obsidian-text-secondary">
              <p>
                <strong className="text-white">Alert rules</strong> notify you when specific conditions are met in your system.
              </p>
              <p>
                Configure <strong className="text-white">thresholds</strong> to avoid alert fatigue. Use time-based conditions like "for 5 minutes" to filter transient issues.
              </p>
              <p>
                Choose appropriate <strong className="text-white">notification channels</strong> based on severity. Critical alerts should use SMS, while informational alerts can use email.
              </p>
              <p>
                <strong className="text-white">Test your alerts</strong> regularly to ensure they're working as expected and reaching the right people.
              </p>
            </div>
          </ObsidianCard>
        </div>
      </div>
    );
  };

  // ==================== MAIN RENDER ====================

  return (
    <div className="w-full h-screen bg-[#0B0B0D] text-obsidian-text-primary px-6 py-6 flex flex-col gap-6 overflow-hidden relative font-sans">
      {/* Ambient glow */}
      <div className="absolute inset-0 bg-green-500 opacity-[0.02] animate-[pulse_4s_infinite] pointer-events-none"></div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl text-white font-light tracking-tight flex items-center gap-3">
            <Activity size={28} className="text-green-500" />
            System Health & Self-Healing
          </h1>
          <p className="text-sm text-obsidian-text-muted mt-1">Autonomous Monitoring & Auto-Repair</p>
        </div>

        <div className="flex items-center gap-2">
          <div className="px-3 py-1.5 border border-green-500/30 bg-green-500/10 rounded flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-xs text-green-500 font-semibold">
              {overallHealth.toFixed(2)}% HEALTHY
            </span>
          </div>
          {activeIncidents > 0 && (
            <div className="px-3 py-1.5 bg-yellow-500/10 border border-yellow-500/30 rounded">
              <span className="text-xs text-yellow-500 font-semibold">
                {activeIncidents} HEALING
              </span>
            </div>
          )}
          <button className="p-2 bg-red-500/5 border border-red-500/30 text-red-500 hover:bg-red-500 hover:text-white transition-all rounded">
            <Power size={16} />
          </button>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex gap-2">
        {[
          { mode: 'dashboard' as ViewMode, label: 'Dashboard', icon: Activity },
          { mode: 'incidents' as ViewMode, label: 'Immune Log', icon: Stethoscope },
          { mode: 'status' as ViewMode, label: 'System Status', icon: Server },
          { mode: 'playbooks' as ViewMode, label: 'Playbooks', icon: Terminal },
          { mode: 'alerts' as ViewMode, label: 'Alerts', icon: Bell }
        ].map(({ mode, label, icon: Icon }) => (
          <button
            key={mode}
            onClick={() => setViewMode(mode)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 ${viewMode === mode
                ? 'bg-green-500 text-black shadow-[0_0_20px_rgba(69,255,154,0.3)]'
                : 'bg-white/5 text-obsidian-text-muted hover:bg-white/10 hover:text-white'
              }`}
          >
            <Icon size={14} />
            {label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {viewMode === 'dashboard' && renderDashboard()}
        {viewMode === 'incidents' && renderIncidents()}
        {viewMode === 'status' && renderStatus()}
        {viewMode === 'playbooks' && renderPlaybooks()}
        {viewMode === 'alerts' && renderAlerts()}
      </div>
    </div>
  );
};

export default SystemHealth;
