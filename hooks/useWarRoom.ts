import { useState, useEffect } from 'react';

export interface Swarm {
  id: string;
  name: string;
  type: string;
  status: 'active' | 'paused' | 'stopped';
  agents: { active: number; total: number };
  progress: number;
  performance: 'excellent' | 'good' | 'average' | 'poor' | 'pending_review';
  tasks: Task[];
  metrics: Record<string, any>;
}

export interface Task {
  id: number;
  name: string;
  status: 'pending' | 'in_progress' | 'completed';
  completion: number;
}

export interface KPIs {
  revenue: {
    current: number;
    target: number;
    change: number;
    trend: 'up' | 'down' | 'stable';
    history: { date: string; value: number }[];
  };
  profitability: {
    current: number;
    target: number;
    change: number;
    trend: 'up' | 'down' | 'stable';
  };
  efficiency: {
    current: number;
    target: number;
    change: number;
    trend: 'up' | 'down' | 'stable';
  };
  uptime: {
    current: number;
    target: number;
    change: number;
    trend: 'up' | 'down' | 'stable';
  };
  activeClients: {
    current: number;
    total: number;
    percentage: number;
  };
  systemLoad: {
    current: number;
    trend: 'up' | 'down' | 'stable';
  };
  latency: {
    current: number;
    trend: 'up' | 'down' | 'stable';
  };
}

export interface Event {
  id: number;
  time: string;
  source: string;
  message: string;
  timestamp: string;
}

export interface Opportunity {
  id: string;
  type: string;
  sector: string;
  probability: number;
  value: number;
  risk: string;
  description: string;
  createdAt: string;
}

export interface Alert {
  id: string;
  type: 'info' | 'warning' | 'error' | 'success';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  action?: string;
  createdAt: string;
  read: boolean;
}

// Generadores de datos falsos
const generateInitialKPIs = (): KPIs => {
  const history = [];
  for (let i = 30; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    history.push({
      date: date.toISOString().split('T')[0],
      value: Math.floor(100000 + Math.random() * 30000)
    });
  }

  return {
    revenue: {
      current: 125480,
      target: 150000,
      change: 18,
      trend: 'up',
      history
    },
    profitability: {
      current: 34.2,
      target: 36.3,
      change: -2.1,
      trend: 'down'
    },
    efficiency: {
      current: 87.5,
      target: 85,
      change: 5.3,
      trend: 'up'
    },
    uptime: {
      current: 99.97,
      target: 99.95,
      change: -0.02,
      trend: 'stable'
    },
    activeClients: {
      current: 432,
      total: 500,
      percentage: 86.4
    },
    systemLoad: {
      current: 42,
      trend: 'stable'
    },
    latency: {
      current: 24,
      trend: 'stable'
    }
  };
};

const generateInitialSwarms = (): Swarm[] => [
  {
    id: 'SWARM-MARKETING',
    name: 'Marketing Swarm',
    type: 'marketing',
    status: 'active',
    agents: { active: 5, total: 5 },
    progress: 78,
    performance: 'excellent',
    tasks: [
      { id: 1, name: 'Campaña de email Q4', status: 'in_progress', completion: 78 },
      { id: 2, name: 'Análisis de competencia', status: 'completed', completion: 100 }
    ],
    metrics: {
      conversions: 245,
      leads: 1250,
      roi: 3.2
    }
  },
  {
    id: 'SWARM-VENTAS',
    name: 'Sales Swarm',
    type: 'sales',
    status: 'active',
    agents: { active: 3, total: 3 },
    progress: 45,
    performance: 'good',
    tasks: [
      { id: 3, name: 'Prospección clientes enterprise', status: 'in_progress', completion: 45 },
      { id: 4, name: 'Follow-up propuestas', status: 'pending', completion: 0 }
    ],
    metrics: {
      deals: 12,
      value: 145000,
      closeRate: 0.68
    }
  },
  {
    id: 'SWARM-OPERACIONES',
    name: 'Operations Swarm',
    type: 'operations',
    status: 'paused',
    agents: { active: 2, total: 4 },
    progress: 92,
    performance: 'pending_review',
    tasks: [
      { id: 5, name: 'Optimización de procesos', status: 'in_progress', completion: 92 }
    ],
    metrics: {
      efficiency: 0.87,
      tasksCompleted: 156,
      avgTime: 24
    }
  },
  {
    id: 'SWARM-CONTENIDO',
    name: 'Content Swarm',
    type: 'content',
    status: 'active',
    agents: { active: 4, total: 4 },
    progress: 62,
    performance: 'good',
    tasks: [
      { id: 6, name: 'Generación de assets creativos', status: 'in_progress', completion: 62 }
    ],
    metrics: {
      assetsGenerated: 234,
      quality: 0.91,
      engagement: 0.78
    }
  }
];

const generateInitialEvents = (): Event[] => {
  const sources = [
    'SWARM-MARKETING', 'SWARM-VENTAS', 'SWARM-OPERACIONES', 'SWARM-CONTENIDO',
    'AGENT-ANALYSIS', 'AGENT-CONTENT', 'CORE', 'NET-WATCH', 'SALES-BOT', 'KAI-BOT'
  ];
  const messages = [
    'Campaña de email iniciada a {n} leads segmentados',
    'Generados {n} assets creativos para campaña',
    'Propuesta enviada a {n} clientes potenciales',
    'Análisis de competencia completado, {n} oportunidades identificadas',
    'Transacción #{n} verificada. Smart Contract ejecutado',
    'Latencia de red optimizada (-{n}ms)',
    'Nuevo patrón de comportamiento detectado',
    'Analizando {n} endpoints de competidores',
    'Negociación iniciada con cliente de alto valor',
    'Escaneo perimetral completado. {n} leads cualificados'
  ];

  const events: Event[] = [];
  for (let i = 0; i < 15; i++) {
    const source = sources[Math.floor(Math.random() * sources.length)];
    const template = messages[Math.floor(Math.random() * messages.length)];
    const n = Math.floor(Math.random() * 100) + 1;
    const message = template.replace('{n}', n.toString());

    const date = new Date(Date.now() - i * 60000); // Cada minuto hacia atrás

    events.push({
      id: Date.now() - i,
      time: date.toLocaleTimeString('es-ES', { hour12: false }),
      source,
      message,
      timestamp: date.toISOString()
    });
  }

  return events;
};

const generateInitialOpportunities = (): Opportunity[] => [
  {
    id: 'OPP-001',
    type: 'arbitrage',
    sector: 'retail',
    probability: 94,
    value: 45000,
    risk: 'validated',
    description: 'Oportunidad de arbitraje detectada en sector retail',
    createdAt: new Date().toISOString()
  },
  {
    id: 'OPP-002',
    type: 'market',
    sector: 'tech',
    probability: 87,
    value: 32000,
    risk: 'medium',
    description: 'Crecimiento acelerado en sector tecnología',
    createdAt: new Date().toISOString()
  },
  {
    id: 'OPP-003',
    type: 'expansion',
    sector: 'finance',
    probability: 76,
    value: 28000,
    risk: 'low',
    description: 'Expansión de mercado en servicios financieros',
    createdAt: new Date().toISOString()
  }
];

const generateInitialAlerts = (): Alert[] => [
  {
    id: 'ALERT-001',
    type: 'warning',
    severity: 'medium',
    title: 'Rendimiento bajo en SWARM-OPERACIONES',
    description: 'El enjambre de operaciones requiere revisión de configuración',
    action: 'Revisar configuración de agentes',
    createdAt: new Date().toISOString(),
    read: false
  },
  {
    id: 'ALERT-002',
    type: 'info',
    severity: 'low',
    title: 'Nueva actualización disponible',
    description: 'Actualización de sistema v3.1 disponible para instalación',
    action: 'Programar mantenimiento',
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    read: false
  }
];

export function useWarRoom() {
  const [connected] = useState(true); // Siempre conectado con datos falsos
  const [kpis, setKpis] = useState<KPIs>(() => generateInitialKPIs());
  const [swarms, setSwarms] = useState<Swarm[]>(() => generateInitialSwarms());
  const [events, setEvents] = useState<Event[]>(() => generateInitialEvents());
  const [opportunities, setOpportunities] = useState<Opportunity[]>(() => generateInitialOpportunities());
  const [alerts, setAlerts] = useState<Alert[]>(() => generateInitialAlerts());

  // Simular actualizaciones de KPIs
  useEffect(() => {
    const interval = setInterval(() => {
      setKpis(prev => {
        if (!prev) return prev;

        return {
          ...prev,
          revenue: {
            ...prev.revenue,
            current: prev.revenue.current + Math.floor(Math.random() * 200 - 50)
          },
          systemLoad: {
            ...prev.systemLoad,
            current: Math.max(20, Math.min(80, prev.systemLoad.current + Math.random() * 10 - 5))
          },
          latency: {
            ...prev.latency,
            current: Math.max(15, Math.min(35, prev.latency.current + Math.random() * 4 - 2))
          }
        };
      });
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  // Simular progreso de enjambres
  useEffect(() => {
    const interval = setInterval(() => {
      setSwarms(prev =>
        prev.map(swarm => {
          if (swarm.status === 'active' && swarm.progress < 100) {
            return {
              ...swarm,
              progress: Math.min(100, swarm.progress + Math.random() * 2)
            };
          }
          return swarm;
        })
      );
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  // Generar nuevos eventos
  useEffect(() => {
    const interval = setInterval(() => {
      const sources = [
        'SWARM-MARKETING', 'SWARM-VENTAS', 'SWARM-OPERACIONES', 'SWARM-CONTENIDO',
        'AGENT-ANALYSIS', 'AGENT-CONTENT', 'CORE', 'NET-WATCH', 'SALES-BOT', 'KAI-BOT'
      ];
      const messages = [
        'Campaña de email iniciada a {n} leads segmentados',
        'Generados {n} assets creativos para campaña',
        'Propuesta enviada a {n} clientes potenciales',
        'Análisis de competencia completado, {n} oportunidades identificadas',
        'Transacción #{n} verificada. Smart Contract ejecutado',
        'Latencia de red optimizada (-{n}ms)',
        'Nuevo patrón de comportamiento detectado',
        'Analizando {n} endpoints de competidores',
        'Negociación iniciada con cliente de alto valor',
        'Escaneo perimetral completado. {n} leads cualificados'
      ];

      const source = sources[Math.floor(Math.random() * sources.length)];
      const template = messages[Math.floor(Math.random() * messages.length)];
      const n = Math.floor(Math.random() * 100) + 1;
      const message = template.replace('{n}', n.toString());

      const newEvent: Event = {
        id: Date.now(),
        time: new Date().toLocaleTimeString('es-ES', { hour12: false }),
        source,
        message,
        timestamp: new Date().toISOString()
      };

      setEvents(prev => [newEvent, ...prev.slice(0, 49)]);
    }, 3500);

    return () => clearInterval(interval);
  }, []);

  // Generar nuevas oportunidades ocasionalmente
  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() > 0.7) {
        const types = ['arbitrage', 'market', 'expansion'];
        const sectors = ['retail', 'tech', 'finance', 'healthcare', 'energy'];
        const risks = ['low', 'medium', 'validated'];

        const newOpp: Opportunity = {
          id: `OPP-${Date.now()}`,
          type: types[Math.floor(Math.random() * types.length)],
          sector: sectors[Math.floor(Math.random() * sectors.length)],
          probability: Math.floor(Math.random() * 30 + 70),
          value: Math.floor(Math.random() * 50000 + 10000),
          risk: risks[Math.floor(Math.random() * risks.length)],
          description: 'Nueva oportunidad detectada por análisis de mercado',
          createdAt: new Date().toISOString()
        };

        setOpportunities(prev => [newOpp, ...prev.slice(0, 9)]);
      }
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  const controlSwarm = (swarmId: string, action: 'pause' | 'resume' | 'stop') => {
    setSwarms(prev =>
      prev.map(swarm => {
        if (swarm.id === swarmId) {
          let newStatus: Swarm['status'];
          switch (action) {
            case 'pause':
              newStatus = 'paused';
              break;
            case 'resume':
              newStatus = 'active';
              break;
            case 'stop':
              newStatus = 'stopped';
              break;
            default:
              newStatus = swarm.status;
          }
          return { ...swarm, status: newStatus };
        }
        return swarm;
      })
    );
  };

  const markAlertAsRead = (alertId: string) => {
    setAlerts(prev =>
      prev.map(alert =>
        alert.id === alertId ? { ...alert, read: true } : alert
      )
    );
  };

  return {
    connected,
    kpis,
    swarms,
    events,
    opportunities,
    alerts,
    controlSwarm,
    markAlertAsRead
  };
}
