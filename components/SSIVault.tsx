import React, { useState, useEffect, useRef } from 'react';
import { ObsidianCard, ObsidianButton, ObsidianInput, ObsidianSlider } from './ui/ObsidianElements';
import {
  Shield, Key, Cpu, QrCode, Eye, EyeOff, Wifi, Lock, RefreshCw, Trash2,
  Fingerprint, AlertTriangle, Plus, Copy, CheckCircle, XCircle, Clock,
  Activity, Award, Settings, FileKey, Users, Database, Sliders
} from 'lucide-react';

const CYAN_ACCENT = '#00F0FF';
const ACCENT_COLOR = '#6A4FFB';

// ==================== TYPE DEFINITIONS ====================

type ViewMode = 'identity' | 'passports' | 'secrets' | 'privacy' | 'security';

type DIDStatus = 'VERIFIED' | 'PENDING' | 'REVOKED' | 'SUSPENDED';
type AgentStatus = 'ACTIVE' | 'SUSPENDED' | 'REVOKED';
type VerificationLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
type SecretType = 'API_KEY' | 'PRIVATE_KEY' | 'SEED_PHRASE' | 'PASSWORD' | 'TOKEN';
type HardwareStatus = 'DISCONNECTED' | 'SEARCHING' | 'CONNECTED';

interface MasterIdentity {
  did: string;
  name: string;
  organization: string;
  status: DIDStatus;
  createdAt: Date;
  lastSync: {
    blockNumber: number;
    timestamp: Date;
  };
  publicKey: string;
  verificationLevel: VerificationLevel;
  qrCode: string;
}

interface AgentPassport {
  id: string;
  agentName: string;
  role: string;
  did: string;
  status: AgentStatus;
  reputation: number;
  issuedAt: Date;
  expiresAt: Date | null;
  permissions: string[];
  credentialHash: string;
  interactions: number;
  successRate: number;
}

interface ReputationEvent {
  id: string;
  agentId: string;
  timestamp: Date;
  eventType: 'SUCCESS' | 'FAILURE' | 'DISPUTE' | 'ATTESTATION';
  description: string;
  impact: number;
  verifiedBy?: string;
}

interface VaultSecret {
  id: string;
  name: string;
  type: SecretType;
  createdAt: Date;
  lastAccessed: Date | null;
  expiresAt: Date | null;
  accessCount: number;
  metadata: {
    service?: string;
    environment?: string;
    notes?: string;
  };
}

interface PrivacySettings {
  epsilon: number;
  mode: 'FORTRESS' | 'BALANCED' | 'GLASS_HOUSE';
  federatedLearning: boolean;
  noiseInjection: boolean;
  gradientClipping: boolean;
}

// ==================== SAMPLE DATA ====================

const MASTER_IDENTITY: MasterIdentity = {
  did: 'did:sov:28f9s8d9f8s9d8f...x92',
  name: 'Sovereign Identity',
  organization: 'Obsidian CRM Platform',
  status: 'VERIFIED',
  createdAt: new Date('2024-01-15'),
  lastSync: {
    blockNumber: 18294002,
    timestamp: new Date()
  },
  publicKey: '0x4A5B6C7D8E9F0A1B2C3D4E5F6A7B8C9D0E1F2A3B',
  verificationLevel: 'HIGH',
  qrCode: 'QR_CODE_DATA'
};

const SAMPLE_PASSPORTS: AgentPassport[] = [
  {
    id: 'ap-001',
    agentName: 'Agent-07',
    role: 'Negotiation Specialist',
    did: 'did:sov:28f...92x',
    status: 'ACTIVE',
    reputation: 98,
    issuedAt: new Date('2024-06-10'),
    expiresAt: null,
    permissions: ['negotiate_contracts', 'sign_agreements', 'access_client_data', 'execute_payments'],
    credentialHash: '0xaf9s8d9f8s9d8f9s8d9f8s9d8f9s8d9f',
    interactions: 1247,
    successRate: 98.2
  },
  {
    id: 'ap-002',
    agentName: 'Agent-12',
    role: 'Market Intelligence',
    did: 'did:eth:0x4...a91',
    status: 'ACTIVE',
    reputation: 94,
    issuedAt: new Date('2024-07-22'),
    expiresAt: null,
    permissions: ['read_market_data', 'generate_reports', 'query_databases'],
    credentialHash: '0x8f9s8d9f8s9d8f9s8d9f8s9d8f9s8d9f',
    interactions: 892,
    successRate: 94.8
  },
  {
    id: 'ap-003',
    agentName: 'Agent-99',
    role: 'Compliance Monitor',
    did: 'did:web:obs.../leg',
    status: 'ACTIVE',
    reputation: 100,
    issuedAt: new Date('2024-05-05'),
    expiresAt: null,
    permissions: ['audit_transactions', 'verify_compliance', 'flag_anomalies', 'generate_audit_reports'],
    credentialHash: '0x1f9s8d9f8s9d8f9s8d9f8s9d8f9s8d9f',
    interactions: 2104,
    successRate: 99.9
  },
  {
    id: 'ap-004',
    agentName: 'Agent-24',
    role: 'Customer Support',
    did: 'did:sov:45d...k83',
    status: 'SUSPENDED',
    reputation: 76,
    issuedAt: new Date('2024-09-01'),
    expiresAt: null,
    permissions: ['respond_tickets', 'access_kb', 'escalate_issues'],
    credentialHash: '0x5f9s8d9f8s9d8f9s8d9f8s9d8f9s8d9f',
    interactions: 324,
    successRate: 82.1
  },
  {
    id: 'ap-005',
    agentName: 'Agent-56',
    role: 'Data Analyst',
    did: 'did:polygon:78h...m21',
    status: 'ACTIVE',
    reputation: 91,
    issuedAt: new Date('2024-08-14'),
    expiresAt: new Date('2025-08-14'),
    permissions: ['query_analytics', 'generate_visualizations', 'export_data'],
    credentialHash: '0x9f9s8d9f8s9d8f9s8d9f8s9d8f9s8d9f',
    interactions: 567,
    successRate: 91.4
  }
];

const REPUTATION_EVENTS: ReputationEvent[] = [
  {
    id: 're-001',
    agentId: 'ap-001',
    timestamp: new Date('2024-12-10T14:23:00'),
    eventType: 'SUCCESS',
    description: 'Negotiated favorable contract terms (+$15K value)',
    impact: +2,
    verifiedBy: 'did:sov:master'
  },
  {
    id: 're-002',
    agentId: 'ap-001',
    timestamp: new Date('2024-12-09T09:12:00'),
    eventType: 'ATTESTATION',
    description: 'Client attestation: "Excellent communication"',
    impact: +1,
    verifiedBy: 'did:client:5x8...p9k'
  },
  {
    id: 're-003',
    agentId: 'ap-004',
    timestamp: new Date('2024-12-08T16:45:00'),
    eventType: 'FAILURE',
    description: 'Failed to resolve customer complaint within SLA',
    impact: -5,
    verifiedBy: 'did:sov:master'
  },
  {
    id: 're-004',
    agentId: 'ap-003',
    timestamp: new Date('2024-12-07T11:30:00'),
    eventType: 'SUCCESS',
    description: 'Detected and prevented non-compliant transaction',
    impact: +3,
    verifiedBy: 'did:sov:master'
  },
  {
    id: 're-005',
    agentId: 'ap-002',
    timestamp: new Date('2024-12-06T08:15:00'),
    eventType: 'SUCCESS',
    description: 'Generated actionable market intelligence report',
    impact: +1,
    verifiedBy: 'did:sov:master'
  }
];

const VAULT_SECRETS: VaultSecret[] = [
  {
    id: 'vs-001',
    name: 'OpenAI API Key',
    type: 'API_KEY',
    createdAt: new Date('2024-06-01'),
    lastAccessed: new Date('2024-12-12T10:30:00'),
    expiresAt: new Date('2025-06-01'),
    accessCount: 12847,
    metadata: {
      service: 'OpenAI GPT-4',
      environment: 'Production',
      notes: 'Primary LLM API key'
    }
  },
  {
    id: 'vs-002',
    name: 'Root Seed Phrase',
    type: 'SEED_PHRASE',
    createdAt: new Date('2024-01-15'),
    lastAccessed: null,
    expiresAt: null,
    accessCount: 1,
    metadata: {
      notes: 'Master wallet seed - NEVER access unless emergency'
    }
  },
  {
    id: 'vs-003',
    name: 'Treasury Multi-Sig Key',
    type: 'PRIVATE_KEY',
    createdAt: new Date('2024-03-10'),
    lastAccessed: new Date('2024-12-10T15:22:00'),
    expiresAt: null,
    accessCount: 47,
    metadata: {
      service: 'Gnosis Safe',
      environment: 'Mainnet',
      notes: '2 of 3 multi-sig configuration'
    }
  },
  {
    id: 'vs-004',
    name: 'Stripe Secret Key',
    type: 'API_KEY',
    createdAt: new Date('2024-04-20'),
    lastAccessed: new Date('2024-12-12T09:45:00'),
    expiresAt: null,
    accessCount: 5624,
    metadata: {
      service: 'Stripe Payments',
      environment: 'Production'
    }
  },
  {
    id: 'vs-005',
    name: 'AWS Access Token',
    type: 'TOKEN',
    createdAt: new Date('2024-07-15'),
    lastAccessed: new Date('2024-12-11T18:30:00'),
    expiresAt: new Date('2025-01-15'),
    accessCount: 892,
    metadata: {
      service: 'AWS S3 & Lambda',
      environment: 'Production',
      notes: 'Rotation scheduled for Jan 2025'
    }
  }
];

// ==================== MAIN COMPONENT ====================

const SSIVault: React.FC = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('identity');
  const [selectedPassportId, setSelectedPassportId] = useState<string | null>(null);
  const [selectedSecretId, setSelectedSecretId] = useState<string | null>(null);
  const [revealingSecretId, setRevealingSecretId] = useState<string | null>(null);
  const [hardwareStatus, setHardwareStatus] = useState<HardwareStatus>('CONNECTED');
  const [privacySettings, setPrivacySettings] = useState<PrivacySettings>({
    epsilon: 0.25,
    mode: 'BALANCED',
    federatedLearning: true,
    noiseInjection: true,
    gradientClipping: true
  });

  // Forms
  const [showNewPassportForm, setShowNewPassportForm] = useState(false);
  const [newPassportForm, setNewPassportForm] = useState({
    agentName: '',
    role: '',
    permissions: [] as string[]
  });

  const [showNewSecretForm, setShowNewSecretForm] = useState(false);
  const [newSecretForm, setNewSecretForm] = useState({
    name: '',
    type: 'API_KEY' as SecretType,
    service: '',
    notes: ''
  });

  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Update privacy mode based on epsilon
  useEffect(() => {
    if (privacySettings.epsilon < 0.3) {
      setPrivacySettings(prev => ({ ...prev, mode: 'FORTRESS' }));
    } else if (privacySettings.epsilon > 0.7) {
      setPrivacySettings(prev => ({ ...prev, mode: 'GLASS_HOUSE' }));
    } else {
      setPrivacySettings(prev => ({ ...prev, mode: 'BALANCED' }));
    }
  }, [privacySettings.epsilon]);

  // Differential Privacy Canvas Animation
  useEffect(() => {
    if (viewMode !== 'privacy') return;

    const canvas = canvasRef.current;
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

    // Particle System
    const particles: { x: number, y: number, angle: number, radius: number, speed: number, size: number }[] = [];
    const numParticles = 400;
    const cx = canvas.width / 4;
    const cy = canvas.height / 4;

    for (let i = 0; i < numParticles; i++) {
      particles.push({
        x: cx,
        y: cy,
        angle: Math.random() * Math.PI * 2,
        radius: 50 + Math.random() * 100,
        speed: (Math.random() - 0.5) * 0.02,
        size: Math.random() * 1.5
      });
    }

    let time = 0;
    let frameId: number;

    const render = () => {
      time += 0.05;
      const width = canvas.width / 2;
      const height = canvas.height / 2;

      const glitch = Math.random() > 0.98 ? (Math.random() - 0.5) * 5 : 0;

      ctx.clearRect(0, 0, width, height);
      ctx.save();
      ctx.translate(glitch, 0);

      // Federated Uplink (Beam)
      const beamOpacity = 0.1 + Math.sin(time * 5) * 0.05;
      const grad = ctx.createLinearGradient(cx, cy, cx, 0);
      grad.addColorStop(0, `rgba(106, 79, 251, ${beamOpacity})`);
      grad.addColorStop(1, 'rgba(106, 79, 251, 0)');
      ctx.fillStyle = grad;
      ctx.fillRect(cx - 20, 0, 40, cy);

      // The Core (Data Orb)
      ctx.beginPath();
      ctx.arc(cx, cy, 40, 0, Math.PI * 2);
      ctx.fillStyle = '#FFFFFF';
      ctx.shadowBlur = 30;
      ctx.shadowColor = 'rgba(255, 255, 255, 0.5)';
      ctx.fill();
      ctx.shadowBlur = 0;

      // Noise Shield (Particles)
      const expansionFactor = (privacySettings.epsilon * 100) * 1.5;

      particles.forEach(p => {
        p.angle += p.speed;

        const r = 50 + expansionFactor + Math.sin(time + p.angle * 5) * 10 + (Math.random() * (100 - privacySettings.epsilon * 100));

        const px = cx + Math.cos(p.angle) * r;
        const py = cy + Math.sin(p.angle) * r;

        const alpha = Math.max(0.1, 1 - privacySettings.epsilon);

        ctx.fillStyle = `rgba(106, 79, 251, ${alpha})`;
        ctx.beginPath();
        ctx.rect(px, py, p.size, p.size);
        ctx.fill();

        if (Math.random() > 0.95 && alpha > 0.2) {
          ctx.strokeStyle = `rgba(106, 79, 251, ${alpha * 0.5})`;
          ctx.lineWidth = 0.5;
          ctx.beginPath();
          ctx.moveTo(px, py);
          ctx.lineTo(cx, cy);
          ctx.stroke();
        }
      });

      // Rings
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(cx, cy, 100 + Math.sin(time) * 5, 0, Math.PI * 2);
      ctx.stroke();

      ctx.strokeStyle = `rgba(106, 79, 251, 0.2)`;
      ctx.setLineDash([2, 10]);
      ctx.beginPath();
      ctx.arc(cx, cy, 120 + Math.cos(time * 0.5) * 5, time, time + Math.PI);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.restore();
      frameId = requestAnimationFrame(render);
    };
    render();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(frameId);
    };
  }, [viewMode, privacySettings.epsilon]);

  // Secret reveal effect
  const SecretDisplay: React.FC<{ secret: string, isRevealing: boolean }> = ({ secret, isRevealing }) => {
    const [display, setDisplay] = useState('************************');

    useEffect(() => {
      if (!isRevealing) {
        setDisplay('************************');
        return;
      }

      let iterations = 0;
      const interval = setInterval(() => {
        setDisplay(prev => secret.split('').map((char, index) => {
          if (index < iterations) return char;
          return String.fromCharCode(33 + Math.random() * 90);
        }).join(''));

        iterations += 1 / 2;
        if (iterations >= secret.length) clearInterval(interval);
      }, 30);

      return () => clearInterval(interval);
    }, [isRevealing, secret]);

    return <span className={`font-mono text-xs ${isRevealing ? 'text-white' : 'text-obsidian-text-muted'}`}>{display}</span>;
  };

  // ==================== RENDER FUNCTIONS ====================

  const renderIdentity = () => {
    const selectedPassport = selectedPassportId ? SAMPLE_PASSPORTS.find(p => p.id === selectedPassportId) : null;

    return (
      <div className="w-full h-full flex gap-6">
        {/* Master Identity */}
        <div className="w-1/2 flex flex-col gap-6">
          <ObsidianCard className="p-0 overflow-hidden relative group">
            <div className="absolute inset-0 bg-gradient-to-br from-[#0F0F12] to-[#000000]"></div>
            <div className="absolute inset-0 border border-white/5 group-hover:border-obsidian-accent/30 transition-colors duration-500 rounded-lg"></div>

            <div className="relative p-6 z-10">
              <div className="flex justify-between items-start mb-6">
                <div className="flex flex-col">
                  <span className="text-[10px] text-obsidian-text-muted uppercase tracking-[0.2em] mb-1">Master Identity</span>
                  <h2 className="text-xl text-white font-light">{MASTER_IDENTITY.organization}</h2>
                  <p className="text-xs text-obsidian-text-muted mt-1">{MASTER_IDENTITY.name}</p>
                </div>
                <div className="px-3 py-1.5 border border-obsidian-accent/30 bg-obsidian-accent/10 rounded flex items-center gap-2 shadow-[0_0_10px_rgba(106,79,251,0.2)]">
                  <div className="w-1.5 h-1.5 bg-obsidian-accent rounded-full animate-pulse"></div>
                  <span className="text-[9px] font-bold text-obsidian-accent tracking-widest">{MASTER_IDENTITY.status}</span>
                </div>
              </div>

              <div className="flex gap-4 items-center mb-6">
                {/* QR Code */}
                <div className="w-24 h-24 bg-white/5 border border-white/10 rounded p-1 flex items-center justify-center relative overflow-hidden">
                  <QrCode size={60} className="text-obsidian-accent opacity-80" />
                  <div className="absolute top-0 left-0 w-full h-[2px] bg-obsidian-accent animate-[scan_2s_linear_infinite] shadow-[0_0_8px_rgba(106,79,251,0.5)]"></div>
                </div>

                <div className="flex-1 space-y-3">
                  <div>
                    <span className="text-[9px] text-obsidian-text-muted block uppercase tracking-wider">DID String</span>
                    <div className="flex items-center gap-2">
                      <code className="text-[10px] font-mono text-obsidian-accent break-all">{MASTER_IDENTITY.did}</code>
                      <button className="text-obsidian-text-muted hover:text-obsidian-accent transition-colors">
                        <Copy size={12} />
                      </button>
                    </div>
                  </div>
                  <div>
                    <span className="text-[9px] text-obsidian-text-muted block uppercase tracking-wider">Public Key</span>
                    <code className="text-[10px] font-mono text-white break-all">{MASTER_IDENTITY.publicKey.slice(0, 20)}...</code>
                  </div>
                </div>
              </div>

              {/* Verification Details */}
              <div className="grid grid-cols-2 gap-3 pt-4 border-t border-white/10">
                <div>
                  <span className="text-[9px] text-obsidian-text-muted block uppercase">Last Sync</span>
                  <span className="text-xs text-white">Block #{MASTER_IDENTITY.lastSync.blockNumber.toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-[9px] text-obsidian-text-muted block uppercase">Verification Level</span>
                  <span className="text-xs text-green-500 font-semibold">{MASTER_IDENTITY.verificationLevel}</span>
                </div>
                <div>
                  <span className="text-[9px] text-obsidian-text-muted block uppercase">Created</span>
                  <span className="text-xs text-white">{MASTER_IDENTITY.createdAt.toLocaleDateString()}</span>
                </div>
                <div>
                  <span className="text-[9px] text-obsidian-text-muted block uppercase">Active Agents</span>
                  <span className="text-xs text-white">{SAMPLE_PASSPORTS.filter(p => p.status === 'ACTIVE').length} / {SAMPLE_PASSPORTS.length}</span>
                </div>
              </div>
            </div>
          </ObsidianCard>

          {/* Hardware Wallet Connection */}
          <ObsidianCard className="p-5 border border-obsidian-accent/20 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-2 opacity-10">
              <Cpu size={60} />
            </div>
            <div className="flex items-center gap-2 mb-4 relative z-10">
              <div className={`w-2 h-2 rounded-full ${hardwareStatus === 'CONNECTED' ? 'bg-obsidian-accent shadow-[0_0_8px_rgba(106,79,251,0.5)]' : 'bg-red-500'}`}></div>
              <span className="text-xs uppercase tracking-[0.2em] text-white font-medium">Hardware Wallet Bridge</span>
            </div>

            <div className="space-y-4 relative z-10">
              <div className="flex justify-between items-center bg-white/[0.03] p-3 rounded border border-white/[0.06]">
                <div className="flex items-center gap-3">
                  <Wifi size={16} className="text-obsidian-accent" />
                  <div>
                    <div className="text-xs text-white">Ledger Nano X</div>
                    <div className="text-[9px] text-obsidian-text-muted">Firmware v2.2.1</div>
                  </div>
                </div>
                <span className="text-[9px] font-bold text-obsidian-accent">{hardwareStatus}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs text-obsidian-text-secondary">Require Hardware Signature</span>
                <div className="w-10 h-5 bg-obsidian-accent/30 rounded-full relative cursor-pointer border border-obsidian-accent/50">
                  <div className="absolute right-0.5 top-0.5 w-3.5 h-3.5 bg-obsidian-accent rounded-full shadow-sm"></div>
                </div>
              </div>

              <ObsidianButton className="w-full" variant="outline">
                <Key size={14} />
                Sign Test Transaction
              </ObsidianButton>
            </div>
          </ObsidianCard>

          {/* Statistics */}
          <ObsidianCard>
            <h3 className="text-sm text-white mb-4 flex items-center gap-2">
              <Activity size={14} />
              Identity Statistics
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-white/5 rounded">
                <p className="text-[10px] text-obsidian-text-muted uppercase">Total Interactions</p>
                <p className="text-2xl text-white font-light mt-1">
                  {SAMPLE_PASSPORTS.reduce((sum, p) => sum + p.interactions, 0).toLocaleString()}
                </p>
              </div>
              <div className="p-3 bg-white/5 rounded">
                <p className="text-[10px] text-obsidian-text-muted uppercase">Avg Success Rate</p>
                <p className="text-2xl text-green-500 font-light mt-1">
                  {(SAMPLE_PASSPORTS.reduce((sum, p) => sum + p.successRate, 0) / SAMPLE_PASSPORTS.length).toFixed(1)}%
                </p>
              </div>
            </div>
          </ObsidianCard>
        </div>

        {/* Identity Management Actions */}
        <div className="w-1/2 flex flex-col gap-6">
          <ObsidianCard>
            <h3 className="text-sm text-white mb-4">Identity Actions</h3>
            <div className="space-y-3">
              <ObsidianButton className="w-full justify-start" variant="outline">
                <RefreshCw size={14} />
                Sync with Blockchain
              </ObsidianButton>
              <ObsidianButton className="w-full justify-start" variant="outline">
                <QrCode size={14} />
                Export Verifiable Credential
              </ObsidianButton>
              <ObsidianButton className="w-full justify-start" variant="outline">
                <Shield size={14} />
                Request External Attestation
              </ObsidianButton>
              <ObsidianButton className="w-full justify-start" variant="outline">
                <Key size={14} />
                Rotate Public Key
              </ObsidianButton>
            </div>
          </ObsidianCard>

          <ObsidianCard className="flex-1">
            <h3 className="text-sm text-white mb-4 flex items-center gap-2">
              <Award size={14} />
              Recent Identity Events
            </h3>
            <div className="space-y-3 overflow-y-auto" style={{ maxHeight: 'calc(100% - 40px)' }}>
              {REPUTATION_EVENTS.slice(0, 10).map(event => (
                <div key={event.id} className="p-3 bg-white/5 rounded border border-white/10">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {event.eventType === 'SUCCESS' && <CheckCircle size={12} className="text-green-500" />}
                      {event.eventType === 'FAILURE' && <XCircle size={12} className="text-red-500" />}
                      {event.eventType === 'ATTESTATION' && <Award size={12} className="text-obsidian-accent" />}
                      <span className="text-[10px] text-obsidian-text-muted">
                        {SAMPLE_PASSPORTS.find(p => p.id === event.agentId)?.agentName || 'Unknown'}
                      </span>
                    </div>
                    <span className={`text-[10px] font-semibold ${event.impact > 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {event.impact > 0 ? '+' : ''}{event.impact}
                    </span>
                  </div>
                  <p className="text-xs text-white">{event.description}</p>
                  <div className="flex items-center gap-2 mt-2 text-[9px] text-obsidian-text-muted">
                    <Clock size={10} />
                    {event.timestamp.toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </ObsidianCard>
        </div>
      </div>
    );
  };

  const renderPassports = () => {
    const selectedPassport = selectedPassportId ? SAMPLE_PASSPORTS.find(p => p.id === selectedPassportId) : null;

    return (
      <div className="w-full h-full flex gap-6">
        {/* Passport List */}
        <div className="w-1/2 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg text-white flex items-center gap-2">
              <Fingerprint size={18} />
              Agent Passports
            </h2>
            <ObsidianButton onClick={() => setShowNewPassportForm(true)}>
              <Plus size={14} />
              Issue New Passport
            </ObsidianButton>
          </div>

          {/* New Passport Form */}
          {showNewPassportForm && (
            <ObsidianCard className="border border-obsidian-accent/30">
              <h3 className="text-sm text-white mb-4">Issue New Agent Passport</h3>
              <div className="space-y-3">
                <ObsidianInput
                  label="Agent Name"
                  value={newPassportForm.agentName}
                  onChange={(e) => setNewPassportForm({ ...newPassportForm, agentName: e.target.value })}
                  placeholder="e.g., Agent-42"
                />
                <ObsidianInput
                  label="Role"
                  value={newPassportForm.role}
                  onChange={(e) => setNewPassportForm({ ...newPassportForm, role: e.target.value })}
                  placeholder="e.g., Sales Assistant"
                />
                <div>
                  <label className="text-xs text-obsidian-text-muted block mb-2">Permissions</label>
                  <div className="space-y-2">
                    {['read_data', 'write_data', 'execute_transactions', 'access_secrets', 'modify_settings'].map(perm => (
                      <label key={perm} className="flex items-center gap-2 text-xs cursor-pointer">
                        <input type="checkbox" className="rounded border-white/20" />
                        <span className="text-white">{perm.replace(/_/g, ' ')}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div className="flex gap-2 pt-2">
                  <ObsidianButton className="flex-1" variant="outline" onClick={() => setShowNewPassportForm(false)}>
                    Cancel
                  </ObsidianButton>
                  <ObsidianButton className="flex-1">
                    <Key size={14} />
                    Issue & Sign
                  </ObsidianButton>
                </div>
              </div>
            </ObsidianCard>
          )}

          {/* Passport Table */}
          <ObsidianCard className="flex-1 overflow-hidden flex flex-col">
            <div className="overflow-y-auto flex-1">
              <table className="w-full text-xs">
                <thead className="sticky top-0 bg-[#0F0F12] border-b border-white/10">
                  <tr>
                    <th className="text-left p-3 text-[10px] text-obsidian-text-muted uppercase">Agent</th>
                    <th className="text-left p-3 text-[10px] text-obsidian-text-muted uppercase">Role</th>
                    <th className="text-center p-3 text-[10px] text-obsidian-text-muted uppercase">Reputation</th>
                    <th className="text-center p-3 text-[10px] text-obsidian-text-muted uppercase">Status</th>
                    <th className="text-center p-3 text-[10px] text-obsidian-text-muted uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {SAMPLE_PASSPORTS.map(passport => (
                    <tr
                      key={passport.id}
                      className={`border-b border-white/5 hover:bg-white/5 cursor-pointer transition-colors ${selectedPassportId === passport.id ? 'bg-obsidian-accent/10' : ''
                        }`}
                      onClick={() => setSelectedPassportId(passport.id)}
                    >
                      <td className="p-3">
                        <div>
                          <p className="text-white font-medium">{passport.agentName}</p>
                          <code className="text-[9px] text-obsidian-text-muted font-mono">{passport.did}</code>
                        </div>
                      </td>
                      <td className="p-3 text-obsidian-text-secondary">{passport.role}</td>
                      <td className="p-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Award size={12} className="text-obsidian-accent" />
                          <span className="text-white font-semibold">{passport.reputation}</span>
                        </div>
                      </td>
                      <td className="p-3 text-center">
                        <span className={`px-2 py-1 rounded text-[9px] uppercase font-semibold ${passport.status === 'ACTIVE' ? 'bg-green-500/20 text-green-500' :
                            passport.status === 'SUSPENDED' ? 'bg-yellow-500/20 text-yellow-500' :
                              'bg-red-500/20 text-red-500'
                          }`}>
                          {passport.status}
                        </span>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center justify-center gap-2">
                          {passport.status === 'ACTIVE' && (
                            <button className="text-yellow-500 hover:text-yellow-400 transition-colors p-1" title="Suspend">
                              <AlertTriangle size={14} />
                            </button>
                          )}
                          {passport.status === 'SUSPENDED' && (
                            <button className="text-green-500 hover:text-green-400 transition-colors p-1" title="Reactivate">
                              <CheckCircle size={14} />
                            </button>
                          )}
                          <button className="text-red-500 hover:text-red-400 transition-colors p-1" title="Revoke">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </ObsidianCard>
        </div>

        {/* Passport Details */}
        <div className="w-1/2 flex flex-col gap-6">
          {selectedPassport ? (
            <>
              <ObsidianCard>
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg text-white font-medium">{selectedPassport.agentName}</h3>
                    <p className="text-sm text-obsidian-text-muted">{selectedPassport.role}</p>
                  </div>
                  <div className={`px-3 py-1.5 rounded border ${selectedPassport.status === 'ACTIVE' ? 'bg-green-500/10 border-green-500/30 text-green-500' :
                      selectedPassport.status === 'SUSPENDED' ? 'bg-yellow-500/10 border-yellow-500/30 text-yellow-500' :
                        'bg-red-500/10 border-red-500/30 text-red-500'
                    }`}>
                    <span className="text-xs font-semibold">{selectedPassport.status}</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <span className="text-[10px] text-obsidian-text-muted uppercase block mb-1">DID</span>
                    <div className="flex items-center gap-2">
                      <code className="text-xs font-mono text-obsidian-accent">{selectedPassport.did}</code>
                      <button className="text-obsidian-text-muted hover:text-obsidian-accent">
                        <Copy size={12} />
                      </button>
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] text-obsidian-text-muted uppercase block mb-1">Credential Hash</span>
                    <code className="text-xs font-mono text-white break-all">{selectedPassport.credentialHash}</code>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-3 border-t border-white/10">
                    <div>
                      <span className="text-[10px] text-obsidian-text-muted uppercase block">Issued</span>
                      <span className="text-xs text-white">{selectedPassport.issuedAt.toLocaleDateString()}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-obsidian-text-muted uppercase block">Expires</span>
                      <span className="text-xs text-white">{selectedPassport.expiresAt?.toLocaleDateString() || 'Never'}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-obsidian-text-muted uppercase block">Interactions</span>
                      <span className="text-xs text-white">{selectedPassport.interactions.toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-obsidian-text-muted uppercase block">Success Rate</span>
                      <span className="text-xs text-green-500 font-semibold">{selectedPassport.successRate}%</span>
                    </div>
                  </div>
                </div>
              </ObsidianCard>

              <ObsidianCard>
                <h4 className="text-sm text-white mb-3">Permissions</h4>
                <div className="space-y-2">
                  {selectedPassport.permissions.map(perm => (
                    <div key={perm} className="flex items-center gap-2 p-2 bg-white/5 rounded">
                      <CheckCircle size={12} className="text-green-500" />
                      <span className="text-xs text-white">{perm.replace(/_/g, ' ')}</span>
                    </div>
                  ))}
                </div>
              </ObsidianCard>

              <ObsidianCard className="flex-1">
                <h4 className="text-sm text-white mb-3 flex items-center gap-2">
                  <Activity size={14} />
                  Reputation History
                </h4>
                <div className="space-y-2 overflow-y-auto" style={{ maxHeight: '300px' }}>
                  {REPUTATION_EVENTS.filter(e => e.agentId === selectedPassport.id).map(event => (
                    <div key={event.id} className="p-3 bg-white/5 rounded border border-white/10">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {event.eventType === 'SUCCESS' && <CheckCircle size={12} className="text-green-500" />}
                          {event.eventType === 'FAILURE' && <XCircle size={12} className="text-red-500" />}
                          {event.eventType === 'ATTESTATION' && <Award size={12} className="text-obsidian-accent" />}
                          <span className="text-[10px] text-obsidian-text-muted uppercase">{event.eventType}</span>
                        </div>
                        <span className={`text-xs font-semibold ${event.impact > 0 ? 'text-green-500' : 'text-red-500'}`}>
                          {event.impact > 0 ? '+' : ''}{event.impact}
                        </span>
                      </div>
                      <p className="text-xs text-white mb-2">{event.description}</p>
                      <div className="flex items-center gap-2 text-[9px] text-obsidian-text-muted">
                        <Clock size={10} />
                        {event.timestamp.toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              </ObsidianCard>
            </>
          ) : (
            <ObsidianCard className="flex-1 flex items-center justify-center">
              <div className="text-center text-obsidian-text-muted">
                <Fingerprint size={48} className="mx-auto mb-3 opacity-30" />
                <p className="text-sm">Select a passport to view details</p>
              </div>
            </ObsidianCard>
          )}
        </div>
      </div>
    );
  };

  const renderSecrets = () => {
    const selectedSecret = selectedSecretId ? VAULT_SECRETS.find(s => s.id === selectedSecretId) : null;

    return (
      <div className="w-full h-full flex gap-6">
        {/* Secrets List */}
        <div className="w-1/2 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg text-white flex items-center gap-2">
              <FileKey size={18} />
              Secrets Vault
            </h2>
            <ObsidianButton onClick={() => setShowNewSecretForm(true)}>
              <Plus size={14} />
              Add Secret
            </ObsidianButton>
          </div>

          {/* New Secret Form */}
          {showNewSecretForm && (
            <ObsidianCard className="border border-obsidian-accent/30">
              <h3 className="text-sm text-white mb-4">Add New Secret</h3>
              <div className="space-y-3">
                <ObsidianInput
                  label="Secret Name"
                  value={newSecretForm.name}
                  onChange={(e) => setNewSecretForm({ ...newSecretForm, name: e.target.value })}
                  placeholder="e.g., Production API Key"
                />
                <div>
                  <label className="text-xs text-obsidian-text-muted block mb-2">Type</label>
                  <select
                    className="w-full bg-[#16161A] border border-white/20 rounded px-3 py-2 text-sm text-white"
                    value={newSecretForm.type}
                    onChange={(e) => setNewSecretForm({ ...newSecretForm, type: e.target.value as SecretType })}
                  >
                    <option value="API_KEY">API Key</option>
                    <option value="PRIVATE_KEY">Private Key</option>
                    <option value="SEED_PHRASE">Seed Phrase</option>
                    <option value="PASSWORD">Password</option>
                    <option value="TOKEN">Token</option>
                  </select>
                </div>
                <ObsidianInput
                  label="Service"
                  value={newSecretForm.service}
                  onChange={(e) => setNewSecretForm({ ...newSecretForm, service: e.target.value })}
                  placeholder="e.g., OpenAI, Stripe"
                />
                <div>
                  <label className="text-xs text-obsidian-text-muted block mb-2">Notes</label>
                  <textarea
                    className="w-full bg-[#16161A] border border-white/20 rounded px-3 py-2 text-sm text-white resize-none"
                    rows={3}
                    value={newSecretForm.notes}
                    onChange={(e) => setNewSecretForm({ ...newSecretForm, notes: e.target.value })}
                    placeholder="Optional notes..."
                  />
                </div>
                <div className="flex gap-2 pt-2">
                  <ObsidianButton className="flex-1" variant="outline" onClick={() => setShowNewSecretForm(false)}>
                    Cancel
                  </ObsidianButton>
                  <ObsidianButton className="flex-1">
                    <Lock size={14} />
                    Encrypt & Store
                  </ObsidianButton>
                </div>
              </div>
            </ObsidianCard>
          )}

          {/* Secrets List */}
          <ObsidianCard className="flex-1 overflow-hidden flex flex-col">
            <div className="space-y-2 overflow-y-auto flex-1">
              {VAULT_SECRETS.map(secret => (
                <div
                  key={secret.id}
                  className={`p-4 rounded border cursor-pointer transition-colors ${selectedSecretId === secret.id
                      ? 'bg-obsidian-accent/10 border-obsidian-accent/30'
                      : 'bg-white/5 border-white/10 hover:bg-white/10'
                    }`}
                  onClick={() => setSelectedSecretId(secret.id)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Key size={14} className="text-obsidian-accent" />
                      <h4 className="text-sm text-white font-medium">{secret.name}</h4>
                    </div>
                    <span className="text-[9px] px-2 py-0.5 bg-white/10 rounded text-obsidian-text-muted uppercase">
                      {secret.type.replace(/_/g, ' ')}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 text-[10px] text-obsidian-text-muted">
                    <div className="flex items-center gap-1">
                      <Activity size={10} />
                      <span>Accessed {secret.accessCount} times</span>
                    </div>
                    {secret.lastAccessed && (
                      <div className="flex items-center gap-1">
                        <Clock size={10} />
                        <span>{secret.lastAccessed.toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>

                  {secret.metadata.service && (
                    <div className="mt-2 text-xs text-obsidian-text-secondary">
                      Service: {secret.metadata.service}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </ObsidianCard>
        </div>

        {/* Secret Details */}
        <div className="w-1/2 flex flex-col gap-6">
          {selectedSecret ? (
            <>
              <ObsidianCard>
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg text-white font-medium">{selectedSecret.name}</h3>
                    <p className="text-sm text-obsidian-text-muted">{selectedSecret.type.replace(/_/g, ' ')}</p>
                  </div>
                  <button className="text-red-500 hover:text-red-400 transition-colors p-2">
                    <Trash2 size={16} />
                  </button>
                </div>

                <div className="space-y-4">
                  {/* Secret Value Display */}
                  <div className="p-4 bg-[#16161A] border border-white/10 rounded">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] text-obsidian-text-muted uppercase">Secret Value</span>
                      <button
                        className="text-obsidian-text-muted hover:text-obsidian-accent transition-colors"
                        onMouseDown={() => setRevealingSecretId(selectedSecret.id)}
                        onMouseUp={() => setRevealingSecretId(null)}
                        onMouseLeave={() => setRevealingSecretId(null)}
                      >
                        {revealingSecretId === selectedSecret.id ? <Eye size={14} /> : <EyeOff size={14} />}
                      </button>
                    </div>
                    <SecretDisplay
                      secret="sk-x8s9f9s8d8f9s8d9f9s8d9f8s9d8f9s8d9"
                      isRevealing={revealingSecretId === selectedSecret.id}
                    />
                    <p className="text-[9px] text-obsidian-text-muted mt-2 italic">Hold the eye icon to reveal</p>
                  </div>

                  {/* Metadata */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <span className="text-[10px] text-obsidian-text-muted uppercase block mb-1">Created</span>
                      <span className="text-xs text-white">{selectedSecret.createdAt.toLocaleDateString()}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-obsidian-text-muted uppercase block mb-1">Last Accessed</span>
                      <span className="text-xs text-white">
                        {selectedSecret.lastAccessed ? selectedSecret.lastAccessed.toLocaleDateString() : 'Never'}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-obsidian-text-muted uppercase block mb-1">Access Count</span>
                      <span className="text-xs text-white">{selectedSecret.accessCount.toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-obsidian-text-muted uppercase block mb-1">Expires</span>
                      <span className={`text-xs ${selectedSecret.expiresAt && new Date(selectedSecret.expiresAt) < new Date() ? 'text-red-500' : 'text-white'
                        }`}>
                        {selectedSecret.expiresAt ? selectedSecret.expiresAt.toLocaleDateString() : 'Never'}
                      </span>
                    </div>
                  </div>

                  {selectedSecret.metadata.service && (
                    <div>
                      <span className="text-[10px] text-obsidian-text-muted uppercase block mb-1">Service</span>
                      <span className="text-xs text-white">{selectedSecret.metadata.service}</span>
                    </div>
                  )}

                  {selectedSecret.metadata.environment && (
                    <div>
                      <span className="text-[10px] text-obsidian-text-muted uppercase block mb-1">Environment</span>
                      <span className="text-xs text-white">{selectedSecret.metadata.environment}</span>
                    </div>
                  )}

                  {selectedSecret.metadata.notes && (
                    <div>
                      <span className="text-[10px] text-obsidian-text-muted uppercase block mb-1">Notes</span>
                      <p className="text-xs text-obsidian-text-secondary italic">{selectedSecret.metadata.notes}</p>
                    </div>
                  )}
                </div>
              </ObsidianCard>

              <ObsidianCard>
                <h4 className="text-sm text-white mb-3">Actions</h4>
                <div className="space-y-2">
                  <ObsidianButton className="w-full justify-start" variant="outline">
                    <RefreshCw size={14} />
                    Rotate Secret
                  </ObsidianButton>
                  <ObsidianButton className="w-full justify-start" variant="outline">
                    <Copy size={14} />
                    Copy to Clipboard
                  </ObsidianButton>
                  <ObsidianButton className="w-full justify-start" variant="outline">
                    <Clock size={14} />
                    Set Expiration Date
                  </ObsidianButton>
                  <ObsidianButton className="w-full justify-start text-red-500 border-red-500/30 hover:bg-red-500/10">
                    <Trash2 size={14} />
                    Revoke Secret
                  </ObsidianButton>
                </div>
              </ObsidianCard>

              <ObsidianCard className="flex-1">
                <h4 className="text-sm text-white mb-3 flex items-center gap-2">
                  <Activity size={14} />
                  Access Log
                </h4>
                <div className="space-y-2 overflow-y-auto" style={{ maxHeight: '200px' }}>
                  {[...Array(8)].map((_, i) => {
                    const date = new Date();
                    date.setHours(date.getHours() - i * 3);
                    return (
                      <div key={i} className="p-2 bg-white/5 rounded text-xs">
                        <div className="flex items-center justify-between">
                          <span className="text-white">Secret accessed</span>
                          <span className="text-obsidian-text-muted text-[10px]">{date.toLocaleString()}</span>
                        </div>
                        <span className="text-obsidian-text-muted text-[10px]">IP: 192.168.1.{100 + i}</span>
                      </div>
                    );
                  })}
                </div>
              </ObsidianCard>
            </>
          ) : (
            <ObsidianCard className="flex-1 flex items-center justify-center">
              <div className="text-center text-obsidian-text-muted">
                <FileKey size={48} className="mx-auto mb-3 opacity-30" />
                <p className="text-sm">Select a secret to view details</p>
              </div>
            </ObsidianCard>
          )}
        </div>
      </div>
    );
  };

  const renderPrivacy = () => {
    return (
      <div className="w-full h-full flex gap-6">
        {/* Visualization */}
        <div className="w-2/3 flex flex-col">
          <ObsidianCard className="h-full relative overflow-hidden flex flex-col items-center justify-center" noPadding>
            {/* Header */}
            <div className="absolute top-6 left-6 z-20">
              <h2 className="text-2xl font-thin text-white tracking-tight">Differential Privacy</h2>
              <p className="text-[10px] text-obsidian-text-muted uppercase tracking-[0.2em] mt-1">
                Noise Injection Protocol • Epsilon {privacySettings.epsilon.toFixed(2)}
              </p>
            </div>

            {/* Status Indicator */}
            <div className="absolute top-6 right-6 z-20 flex flex-col items-end">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-obsidian-accent rounded-full animate-pulse"></div>
                <span className="text-[10px] text-obsidian-accent tracking-widest uppercase">
                  {privacySettings.federatedLearning ? 'Federated Uplink Active' : 'Offline Mode'}
                </span>
              </div>
              <span className="text-[9px] text-obsidian-text-muted mt-1">
                {privacySettings.mode} MODE
              </span>
            </div>

            {/* Canvas */}
            <canvas ref={canvasRef} className="w-full h-full block" />

            {/* Controls Footer */}
            <div className="absolute bottom-0 w-full p-8 bg-gradient-to-t from-[#0B0B0D] to-transparent z-20">
              <div className="flex justify-between items-end mb-4 text-[10px] uppercase tracking-widest font-medium">
                <span className={`transition-colors ${privacySettings.epsilon < 0.3 ? 'text-obsidian-accent' : 'text-obsidian-text-muted'}`}>
                  Total Obfuscation
                </span>
                <span className={`transition-colors ${privacySettings.epsilon > 0.7 ? 'text-red-400' : 'text-obsidian-text-muted'}`}>
                  Max Utility
                </span>
              </div>

              <ObsidianSlider
                label="Privacy Budget (ε)"
                min={0.01}
                max={1}
                step={0.01}
                value={privacySettings.epsilon}
                onChange={(e) => setPrivacySettings({ ...privacySettings, epsilon: Number(e.target.value) })}
                valueDisplay={privacySettings.epsilon.toFixed(2)}
              />

              <div className="mt-4 text-center">
                <p className="text-[10px] text-obsidian-text-muted font-mono bg-black/40 inline-block px-3 py-1 rounded border border-white/5">
                  {privacySettings.mode === 'FORTRESS' ? "External agents perceive pure noise. Maximum privacy." :
                    privacySettings.mode === 'GLASS_HOUSE' ? "High precision, reduced anonymity. Use with caution." :
                      "Standard operational security. Balanced trade-off."}
                </p>
              </div>
            </div>
          </ObsidianCard>
        </div>

        {/* Configuration */}
        <div className="w-1/3 flex flex-col gap-6">
          <ObsidianCard>
            <h3 className="text-sm text-white mb-4 flex items-center gap-2">
              <Sliders size={14} />
              Privacy Configuration
            </h3>

            <div className="space-y-4">
              <div className="p-4 bg-white/5 rounded">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-white">Federated Learning</span>
                  <div
                    className={`w-10 h-5 rounded-full relative cursor-pointer border transition-colors ${privacySettings.federatedLearning
                        ? 'bg-obsidian-accent/30 border-obsidian-accent/50'
                        : 'bg-white/10 border-white/20'
                      }`}
                    onClick={() => setPrivacySettings({ ...privacySettings, federatedLearning: !privacySettings.federatedLearning })}
                  >
                    <div className={`absolute top-0.5 w-3.5 h-3.5 bg-white rounded-full shadow-sm transition-all ${privacySettings.federatedLearning ? 'right-0.5' : 'left-0.5'
                      }`}></div>
                  </div>
                </div>
                <p className="text-[10px] text-obsidian-text-muted">
                  Train models collaboratively without sharing raw data
                </p>
              </div>

              <div className="p-4 bg-white/5 rounded">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-white">Noise Injection</span>
                  <div
                    className={`w-10 h-5 rounded-full relative cursor-pointer border transition-colors ${privacySettings.noiseInjection
                        ? 'bg-obsidian-accent/30 border-obsidian-accent/50'
                        : 'bg-white/10 border-white/20'
                      }`}
                    onClick={() => setPrivacySettings({ ...privacySettings, noiseInjection: !privacySettings.noiseInjection })}
                  >
                    <div className={`absolute top-0.5 w-3.5 h-3.5 bg-white rounded-full shadow-sm transition-all ${privacySettings.noiseInjection ? 'right-0.5' : 'left-0.5'
                      }`}></div>
                  </div>
                </div>
                <p className="text-[10px] text-obsidian-text-muted">
                  Add calibrated noise to protect individual data points
                </p>
              </div>

              <div className="p-4 bg-white/5 rounded">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-white">Gradient Clipping</span>
                  <div
                    className={`w-10 h-5 rounded-full relative cursor-pointer border transition-colors ${privacySettings.gradientClipping
                        ? 'bg-obsidian-accent/30 border-obsidian-accent/50'
                        : 'bg-white/10 border-white/20'
                      }`}
                    onClick={() => setPrivacySettings({ ...privacySettings, gradientClipping: !privacySettings.gradientClipping })}
                  >
                    <div className={`absolute top-0.5 w-3.5 h-3.5 bg-white rounded-full shadow-sm transition-all ${privacySettings.gradientClipping ? 'right-0.5' : 'left-0.5'
                      }`}></div>
                  </div>
                </div>
                <p className="text-[10px] text-obsidian-text-muted">
                  Limit gradient magnitude to prevent information leakage
                </p>
              </div>
            </div>
          </ObsidianCard>

          <ObsidianCard>
            <h3 className="text-sm text-white mb-4">Privacy Budget Status</h3>
            <div className="space-y-3">
              <div className="p-3 bg-white/5 rounded">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[10px] text-obsidian-text-muted uppercase">Current Epsilon</span>
                  <span className="text-lg text-white font-light">{privacySettings.epsilon.toFixed(2)}</span>
                </div>
                <div className="w-full h-1 bg-white/10 rounded overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-green-500 via-yellow-500 to-red-500"
                    style={{ width: `${privacySettings.epsilon * 100}%` }}
                  ></div>
                </div>
              </div>

              <div className="p-3 bg-white/5 rounded">
                <span className="text-[10px] text-obsidian-text-muted uppercase block mb-1">Privacy Level</span>
                <span className={`text-sm font-semibold ${privacySettings.mode === 'FORTRESS' ? 'text-green-500' :
                    privacySettings.mode === 'GLASS_HOUSE' ? 'text-red-500' :
                      'text-yellow-500'
                  }`}>
                  {privacySettings.mode}
                </span>
              </div>

              <div className="p-3 bg-white/5 rounded">
                <span className="text-[10px] text-obsidian-text-muted uppercase block mb-1">Active Protections</span>
                <div className="flex gap-2 mt-2">
                  {privacySettings.federatedLearning && (
                    <span className="px-2 py-1 bg-obsidian-accent/20 text-obsidian-accent text-[9px] rounded">FL</span>
                  )}
                  {privacySettings.noiseInjection && (
                    <span className="px-2 py-1 bg-obsidian-accent/20 text-obsidian-accent text-[9px] rounded">NOISE</span>
                  )}
                  {privacySettings.gradientClipping && (
                    <span className="px-2 py-1 bg-obsidian-accent/20 text-obsidian-accent text-[9px] rounded">CLIP</span>
                  )}
                </div>
              </div>
            </div>
          </ObsidianCard>

          <ObsidianCard className="flex-1">
            <h3 className="text-sm text-white mb-4">Understanding Privacy Budget</h3>
            <div className="space-y-3 text-xs text-obsidian-text-secondary">
              <p>
                <strong className="text-white">Epsilon (ε)</strong> measures the privacy loss. Lower values = stronger privacy but less accuracy.
              </p>
              <p>
                <strong className="text-white">Fortress Mode (ε &lt; 0.3)</strong>: Maximum privacy. Data is heavily obscured. Use for sensitive operations.
              </p>
              <p>
                <strong className="text-white">Balanced Mode (0.3 ≤ ε ≤ 0.7)</strong>: Standard protection with good utility. Recommended for most use cases.
              </p>
              <p>
                <strong className="text-white">Glass House (ε &gt; 0.7)</strong>: High precision but reduced anonymity. Only use when privacy is not critical.
              </p>
            </div>
          </ObsidianCard>
        </div>
      </div>
    );
  };

  const renderSecurity = () => {
    return (
      <div className="w-full h-full flex gap-6">
        {/* Hardware Wallet & Key Management */}
        <div className="w-1/2 flex flex-col gap-6">
          <ObsidianCard className="p-5 border border-obsidian-accent/20 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-2 opacity-10">
              <Cpu size={60} />
            </div>
            <div className="flex items-center gap-2 mb-4 relative z-10">
              <div className={`w-2 h-2 rounded-full ${hardwareStatus === 'CONNECTED' ? 'bg-obsidian-accent shadow-[0_0_8px_rgba(106,79,251,0.5)]' : 'bg-red-500'
                }`}></div>
              <span className="text-sm uppercase tracking-[0.2em] text-white font-medium">Hardware Wallet Bridge</span>
            </div>

            <div className="space-y-4 relative z-10">
              <div className="flex justify-between items-center bg-white/[0.03] p-4 rounded border border-white/[0.06]">
                <div className="flex items-center gap-3">
                  <Wifi size={20} className="text-obsidian-accent" />
                  <div>
                    <div className="text-sm text-white">Ledger Nano X</div>
                    <div className="text-[10px] text-obsidian-text-muted">Firmware v2.2.1</div>
                  </div>
                </div>
                <span className="text-xs font-bold text-obsidian-accent">{hardwareStatus}</span>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-white/5 rounded">
                  <span className="text-xs text-white">Require Hardware Signature</span>
                  <div className="w-10 h-5 bg-obsidian-accent/30 rounded-full relative cursor-pointer border border-obsidian-accent/50">
                    <div className="absolute right-0.5 top-0.5 w-3.5 h-3.5 bg-obsidian-accent rounded-full shadow-sm"></div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 bg-white/5 rounded">
                  <span className="text-xs text-white">Auto-lock on Disconnect</span>
                  <div className="w-10 h-5 bg-obsidian-accent/30 rounded-full relative cursor-pointer border border-obsidian-accent/50">
                    <div className="absolute right-0.5 top-0.5 w-3.5 h-3.5 bg-obsidian-accent rounded-full shadow-sm"></div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 bg-white/5 rounded">
                  <span className="text-xs text-white">Biometric Verification</span>
                  <div className="w-10 h-5 bg-white/10 rounded-full relative cursor-pointer border border-white/20">
                    <div className="absolute left-0.5 top-0.5 w-3.5 h-3.5 bg-white/50 rounded-full shadow-sm"></div>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-white/10 space-y-2">
                <ObsidianButton className="w-full justify-start" variant="outline">
                  <Key size={14} />
                  Sign Test Transaction
                </ObsidianButton>
                <ObsidianButton className="w-full justify-start" variant="outline">
                  <RefreshCw size={14} />
                  Reconnect Device
                </ObsidianButton>
              </div>
            </div>
          </ObsidianCard>

          <ObsidianCard className="flex-1 flex flex-col overflow-hidden">
            <div className="flex items-center gap-2 mb-4">
              <Key size={14} className="text-obsidian-text-muted" />
              <span className="text-sm uppercase tracking-[0.2em] text-white font-medium">Cold Storage Slots</span>
            </div>

            <div className="space-y-3 flex-1 overflow-y-auto">
              {[
                { id: 'k1', label: 'Root Seed Phrase', type: 'SEED', danger: 'CRITICAL' },
                { id: 'k2', label: 'API Master Secret', type: 'KEY', danger: 'HIGH' },
                { id: 'k3', label: 'Treasury Multi-Sig', type: 'KEY', danger: 'HIGH' },
                { id: 'k4', label: 'Backup Recovery Key', type: 'KEY', danger: 'MEDIUM' }
              ].map(key => (
                <div key={key.id} className="bg-[#16161A] p-4 rounded border border-white/[0.04] flex flex-col gap-3">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-white font-medium">{key.label}</span>
                      <span className={`text-[8px] px-1.5 py-0.5 rounded font-semibold ${key.danger === 'CRITICAL' ? 'bg-red-500/20 text-red-500' :
                          key.danger === 'HIGH' ? 'bg-orange-500/20 text-orange-500' :
                            'bg-yellow-500/20 text-yellow-500'
                        }`}>
                        {key.danger}
                      </span>
                    </div>
                    <span className="text-[8px] bg-white/10 px-2 py-0.5 rounded text-obsidian-text-muted">{key.type}</span>
                  </div>
                  <div className="flex justify-between items-center bg-black/40 p-3 rounded">
                    <SecretDisplay secret="x8s9-f9s8-d8f9-s8d9" isRevealing={revealingSecretId === key.id} />
                    <button
                      className="text-obsidian-text-muted hover:text-obsidian-accent transition-colors"
                      onMouseDown={() => setRevealingSecretId(key.id)}
                      onMouseUp={() => setRevealingSecretId(null)}
                      onMouseLeave={() => setRevealingSecretId(null)}
                    >
                      {revealingSecretId === key.id ? <Eye size={14} /> : <EyeOff size={14} />}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </ObsidianCard>
        </div>

        {/* Emergency & Security Actions */}
        <div className="w-1/2 flex flex-col gap-6">
          <ObsidianCard className="border border-red-500/20 bg-red-500/5">
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle size={18} className="text-red-500" />
              <h3 className="text-sm text-white font-semibold uppercase tracking-wider">Emergency Controls</h3>
            </div>

            <div className="space-y-3">
              <button className="w-full py-4 bg-[repeating-linear-gradient(45deg,#16161A,#16161A_10px,#1A1A1D_10px,#1A1A1D_20px)] border border-[#FFAA00]/30 text-[#FFAA00] hover:bg-[#FFAA00] hover:text-black transition-all duration-300 rounded flex items-center justify-center gap-2 group uppercase tracking-widest text-xs font-bold">
                <RefreshCw size={14} />
                Emergency Key Rotation
              </button>

              <button className="w-full py-4 border border-red-500/30 text-red-500 hover:bg-red-500 hover:text-white transition-all duration-300 rounded flex items-center justify-center gap-2 group uppercase tracking-widest text-xs font-bold">
                <Lock size={14} />
                Lockdown All Agents
              </button>

              <button className="w-full py-4 border border-red-500/30 text-red-500 hover:bg-red-500 hover:text-white transition-all duration-300 rounded flex items-center justify-center gap-2 group uppercase tracking-widest text-xs font-bold">
                <XCircle size={14} />
                Revoke All Credentials
              </button>
            </div>

            <div className="mt-4 p-3 bg-black/40 rounded border border-white/10">
              <p className="text-[10px] text-obsidian-text-muted italic">
                ⚠️ Emergency actions require hardware wallet confirmation and cannot be undone. Use only in case of security breach.
              </p>
            </div>
          </ObsidianCard>

          <ObsidianCard>
            <h3 className="text-sm text-white mb-4 flex items-center gap-2">
              <Shield size={14} />
              Security Actions
            </h3>
            <div className="space-y-2">
              <ObsidianButton className="w-full justify-start" variant="outline">
                <RefreshCw size={14} />
                Rotate Master Keys
              </ObsidianButton>
              <ObsidianButton className="w-full justify-start" variant="outline">
                <Database size={14} />
                Backup Identity Vault
              </ObsidianButton>
              <ObsidianButton className="w-full justify-start" variant="outline">
                <Activity size={14} />
                View Audit Log
              </ObsidianButton>
              <ObsidianButton className="w-full justify-start" variant="outline">
                <Settings size={14} />
                Configure 2FA
              </ObsidianButton>
            </div>
          </ObsidianCard>

          <ObsidianCard className="flex-1">
            <h3 className="text-sm text-white mb-4">Security Status</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-green-500/10 border border-green-500/30 rounded">
                <div className="flex items-center gap-2">
                  <CheckCircle size={14} className="text-green-500" />
                  <span className="text-xs text-white">Hardware Wallet Connected</span>
                </div>
                <span className="text-xs text-green-500 font-semibold">OK</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-green-500/10 border border-green-500/30 rounded">
                <div className="flex items-center gap-2">
                  <CheckCircle size={14} className="text-green-500" />
                  <span className="text-xs text-white">All Secrets Encrypted</span>
                </div>
                <span className="text-xs text-green-500 font-semibold">OK</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-yellow-500/10 border border-yellow-500/30 rounded">
                <div className="flex items-center gap-2">
                  <AlertTriangle size={14} className="text-yellow-500" />
                  <span className="text-xs text-white">Key Rotation Recommended</span>
                </div>
                <span className="text-xs text-yellow-500 font-semibold">WARN</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-green-500/10 border border-green-500/30 rounded">
                <div className="flex items-center gap-2">
                  <CheckCircle size={14} className="text-green-500" />
                  <span className="text-xs text-white">Privacy Mode Active</span>
                </div>
                <span className="text-xs text-green-500 font-semibold">OK</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-green-500/10 border border-green-500/30 rounded">
                <div className="flex items-center gap-2">
                  <CheckCircle size={14} className="text-green-500" />
                  <span className="text-xs text-white">Blockchain Synced</span>
                </div>
                <span className="text-xs text-green-500 font-semibold">OK</span>
              </div>
            </div>
          </ObsidianCard>

          <ObsidianCard>
            <h3 className="text-sm text-white mb-3">Recent Security Events</h3>
            <div className="space-y-2 text-xs">
              <div className="p-2 bg-white/5 rounded">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-white">Hardware wallet connected</span>
                  <span className="text-[10px] text-obsidian-text-muted">2 mins ago</span>
                </div>
              </div>
              <div className="p-2 bg-white/5 rounded">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-white">Agent-07 credential verified</span>
                  <span className="text-[10px] text-obsidian-text-muted">1 hour ago</span>
                </div>
              </div>
              <div className="p-2 bg-white/5 rounded">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-white">Secret accessed: OpenAI API Key</span>
                  <span className="text-[10px] text-obsidian-text-muted">3 hours ago</span>
                </div>
              </div>
            </div>
          </ObsidianCard>
        </div>
      </div>
    );
  };

  // ==================== MAIN RENDER ====================

  return (
    <div className="w-full h-screen bg-[#0B0B0D] text-obsidian-text-primary px-6 py-6 flex flex-col gap-6 overflow-hidden relative font-sans">
      {/* Scanline Overlay */}
      <div className="absolute inset-0 z-50 pointer-events-none opacity-[0.02]"
        style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 1px, #fff 1px, #fff 2px)' }}>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl text-white font-light tracking-tight flex items-center gap-3">
            <Shield size={28} className="text-obsidian-accent" />
            SSI Vault
          </h1>
          <p className="text-sm text-obsidian-text-muted mt-1">Self-Sovereign Identity & Secrets Management</p>
        </div>

        <div className="flex items-center gap-2">
          <div className="px-3 py-1.5 border border-green-500/30 bg-green-500/10 rounded flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-xs text-green-500 font-semibold">100% COMPLIANT</span>
          </div>
          <div className="px-3 py-1.5 bg-white/5 border border-white/10 rounded">
            <span className="text-xs text-white">Block #{MASTER_IDENTITY.lastSync.blockNumber.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex gap-2">
        {[
          { mode: 'identity' as ViewMode, label: 'Master Identity', icon: Shield },
          { mode: 'passports' as ViewMode, label: 'Agent Passports', icon: Fingerprint },
          { mode: 'secrets' as ViewMode, label: 'Secrets Vault', icon: FileKey },
          { mode: 'privacy' as ViewMode, label: 'Privacy Config', icon: Sliders },
          { mode: 'security' as ViewMode, label: 'Security', icon: Lock }
        ].map(({ mode, label, icon: Icon }) => (
          <button
            key={mode}
            onClick={() => setViewMode(mode)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 ${viewMode === mode
                ? 'bg-obsidian-accent text-white shadow-[0_0_20px_rgba(106,79,251,0.3)]'
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
        {viewMode === 'identity' && renderIdentity()}
        {viewMode === 'passports' && renderPassports()}
        {viewMode === 'secrets' && renderSecrets()}
        {viewMode === 'privacy' && renderPrivacy()}
        {viewMode === 'security' && renderSecurity()}
      </div>
    </div>
  );
};

export default SSIVault;
