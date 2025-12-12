import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json());

// --- DATA MODELS ---

let swarms = [
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

let kpis = {
  revenue: {
    current: 125480,
    target: 150000,
    change: 18,
    trend: 'up',
    history: []
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

let events = [];
let opportunities = [
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
  }
];

let alerts = [
  {
    id: 'ALERT-001',
    type: 'warning',
    severity: 'medium',
    title: 'Rendimiento bajo en SWARM-OPERACIONES',
    description: 'El enjambre de operaciones requiere revisión',
    action: 'Revisar configuración de agentes',
    createdAt: new Date().toISOString(),
    read: false
  }
];

// Initialize revenue history
for (let i = 30; i >= 0; i--) {
  kpis.revenue.history.push({
    date: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    value: Math.floor(100000 + Math.random() * 30000)
  });
}

// --- EVENT GENERATOR ---

const eventSources = [
  'SWARM-MARKETING', 'SWARM-VENTAS', 'SWARM-OPERACIONES', 'SWARM-CONTENIDO',
  'AGENT-ANALYSIS', 'AGENT-CONTENT', 'CORE', 'NET-WATCH', 'SALES-BOT', 'KAI-BOT'
];

const eventMessages = [
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

function generateEvent() {
  const source = eventSources[Math.floor(Math.random() * eventSources.length)];
  const template = eventMessages[Math.floor(Math.random() * eventMessages.length)];
  const n = Math.floor(Math.random() * 100) + 1;
  const message = template.replace('{n}', n);

  const event = {
    id: Date.now(),
    time: new Date().toLocaleTimeString('es-ES', { hour12: false }),
    source,
    message,
    timestamp: new Date().toISOString()
  };

  events.unshift(event);
  if (events.length > 50) events.pop();

  return event;
}

// Generate initial events
for (let i = 0; i < 10; i++) {
  generateEvent();
}

// --- SIMULATION UPDATES ---

setInterval(() => {
  // Update KPIs
  kpis.revenue.current += Math.floor(Math.random() * 200 - 50);
  kpis.systemLoad.current = Math.max(20, Math.min(80, kpis.systemLoad.current + Math.random() * 10 - 5));
  kpis.latency.current = Math.max(15, Math.min(35, kpis.latency.current + Math.random() * 4 - 2));

  // Update swarm progress
  swarms.forEach(swarm => {
    if (swarm.status === 'active' && swarm.progress < 100) {
      swarm.progress = Math.min(100, swarm.progress + Math.random() * 2);
    }
  });

  // Generate new event
  const newEvent = generateEvent();

  // Broadcast updates via WebSocket
  io.emit('kpis_update', kpis);
  io.emit('swarms_update', swarms);
  io.emit('new_event', newEvent);
}, 3000);

// Generate new opportunity occasionally
setInterval(() => {
  if (Math.random() > 0.7) {
    const newOpp = {
      id: `OPP-${Date.now()}`,
      type: ['arbitrage', 'market', 'expansion'][Math.floor(Math.random() * 3)],
      sector: ['retail', 'tech', 'finance', 'healthcare'][Math.floor(Math.random() * 4)],
      probability: Math.floor(Math.random() * 30 + 70),
      value: Math.floor(Math.random() * 50000 + 10000),
      risk: ['low', 'medium', 'validated'][Math.floor(Math.random() * 3)],
      description: 'Nueva oportunidad detectada por análisis de mercado',
      createdAt: new Date().toISOString()
    };

    opportunities.unshift(newOpp);
    if (opportunities.length > 10) opportunities.pop();

    io.emit('new_opportunity', newOpp);
  }
}, 15000);

// --- API ENDPOINTS ---

app.get('/api/kpis', (req, res) => {
  res.json(kpis);
});

app.get('/api/swarms', (req, res) => {
  res.json(swarms);
});

app.get('/api/swarms/:id', (req, res) => {
  const swarm = swarms.find(s => s.id === req.params.id);
  if (swarm) {
    res.json(swarm);
  } else {
    res.status(404).json({ error: 'Swarm not found' });
  }
});

app.get('/api/events', (req, res) => {
  const limit = parseInt(req.query.limit) || 20;
  res.json(events.slice(0, limit));
});

app.get('/api/opportunities', (req, res) => {
  res.json(opportunities);
});

app.get('/api/alerts', (req, res) => {
  res.json(alerts);
});

app.post('/api/swarms/:id/action', (req, res) => {
  const { action } = req.body;
  const swarm = swarms.find(s => s.id === req.params.id);

  if (!swarm) {
    return res.status(404).json({ error: 'Swarm not found' });
  }

  switch(action) {
    case 'pause':
      swarm.status = 'paused';
      break;
    case 'resume':
      swarm.status = 'active';
      break;
    case 'stop':
      swarm.status = 'stopped';
      break;
    default:
      return res.status(400).json({ error: 'Invalid action' });
  }

  io.emit('swarms_update', swarms);
  res.json(swarm);
});

app.post('/api/alerts/:id/read', (req, res) => {
  const alert = alerts.find(a => a.id === req.params.id);
  if (alert) {
    alert.read = true;
    io.emit('alerts_update', alerts);
    res.json(alert);
  } else {
    res.status(404).json({ error: 'Alert not found' });
  }
});

// --- WEBSOCKET ---

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  // Send initial data
  socket.emit('initial_data', {
    kpis,
    swarms,
    events: events.slice(0, 20),
    opportunities,
    alerts
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// --- START SERVER ---

const PORT = process.env.PORT || 3001;

httpServer.listen(PORT, () => {
  console.log(`War Room Backend running on http://localhost:${PORT}`);
  console.log('WebSocket server ready');
});
