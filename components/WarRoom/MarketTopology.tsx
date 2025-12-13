import React, { useRef, useEffect, useState } from 'react';
import { Info, Layers, Filter } from 'lucide-react';
import type { KPIs, Opportunity } from '../../hooks/useWarRoom';

interface DataPoint {
  id: string;
  x: number;
  y: number;
  tx: number; // target x
  ty: number; // target y
  type: 'opportunity' | 'client' | 'competitor' | 'market_signal';
  value: number;
  label: string;
  color: string;
  connections: string[]; // IDs of connected points
}

interface MarketTopologyProps {
  kpis: KPIs | null;
  opportunities: Opportunity[];
}

// Genera puntos de datos para la topología
const generateDataPoints = (kpis: KPIs | null, opportunities: Opportunity[]): DataPoint[] => {
  const points: DataPoint[] = [];

  // Agregar oportunidades
  opportunities.forEach((opp, idx) => {
    const angle = (idx / opportunities.length) * Math.PI * 2;
    points.push({
      id: `opp-${opp.id}`,
      x: 250 + Math.cos(angle) * 120,
      y: 200 + Math.sin(angle) * 120,
      tx: 250 + Math.cos(angle) * 120,
      ty: 200 + Math.sin(angle) * 120,
      type: 'opportunity',
      value: opp.probability,
      label: `${opp.sector} (${opp.probability}%)`,
      color: '#6A4FFB',
      connections: []
    });
  });

  // Agregar clientes (datos simulados)
  for (let i = 0; i < 8; i++) {
    const angle = (i / 8) * Math.PI * 2 + Math.PI / 4;
    points.push({
      id: `client-${i}`,
      x: 250 + Math.cos(angle) * 80,
      y: 200 + Math.sin(angle) * 80,
      tx: 250 + Math.cos(angle) * 80,
      ty: 200 + Math.sin(angle) * 80,
      type: 'client',
      value: Math.random() * 100,
      label: `Cliente ${i + 1}`,
      color: '#45FF9A',
      connections: i < opportunities.length ? [`opp-${opportunities[i]?.id}`] : []
    });
  }

  // Agregar competidores
  for (let i = 0; i < 5; i++) {
    const angle = (i / 5) * Math.PI * 2;
    points.push({
      id: `comp-${i}`,
      x: 250 + Math.cos(angle) * 160,
      y: 200 + Math.sin(angle) * 160,
      tx: 250 + Math.cos(angle) * 160,
      ty: 200 + Math.sin(angle) * 160,
      type: 'competitor',
      value: Math.random() * 100,
      label: `Competidor ${i + 1}`,
      color: '#FF4545',
      connections: []
    });
  }

  // Agregar señales de mercado
  for (let i = 0; i < 12; i++) {
    const angle = Math.random() * Math.PI * 2;
    const distance = 40 + Math.random() * 100;
    points.push({
      id: `signal-${i}`,
      x: 250 + Math.cos(angle) * distance,
      y: 200 + Math.sin(angle) * distance,
      tx: 250 + Math.cos(angle) * distance,
      ty: 200 + Math.sin(angle) * distance,
      type: 'market_signal',
      value: Math.random() * 100,
      label: `Señal ${i + 1}`,
      color: '#BEBEC6',
      connections: []
    });
  }

  return points;
};

export const MarketTopology: React.FC<MarketTopologyProps> = ({ kpis, opportunities }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [dataPoints, setDataPoints] = useState<DataPoint[]>([]);
  const [selectedPoint, setSelectedPoint] = useState<DataPoint | null>(null);
  const [hoveredPoint, setHoveredPoint] = useState<DataPoint | null>(null);
  const [filter, setFilter] = useState<'all' | 'opportunity' | 'client' | 'competitor' | 'market_signal'>('all');
  const [showLegend, setShowLegend] = useState(true);

  // Inicializar puntos de datos
  useEffect(() => {
    const points = generateDataPoints(kpis, opportunities);
    setDataPoints(points);
  }, [kpis, opportunities]);

  // Animación del canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let time = 0;

    const render = () => {
      const { width, height } = canvas.getBoundingClientRect();
      canvas.width = width;
      canvas.height = height;

      ctx.clearRect(0, 0, width, height);

      // Centro
      ctx.beginPath();
      ctx.arc(width / 2, height / 2, 4 + Math.sin(time * 2) * 2, 0, Math.PI * 2);
      const gradient = ctx.createRadialGradient(width / 2, height / 2, 0, width / 2, height / 2, 30);
      gradient.addColorStop(0, 'rgba(106, 79, 251, 0.6)');
      gradient.addColorStop(1, 'rgba(106, 79, 251, 0)');
      ctx.fillStyle = gradient;
      ctx.fill();

      // Filtrar puntos
      const filteredPoints = dataPoints.filter(p => filter === 'all' || p.type === filter);

      // Dibujar conexiones
      filteredPoints.forEach(point => {
        point.connections.forEach(connId => {
          const targetPoint = filteredPoints.find(p => p.id === connId);
          if (targetPoint) {
            ctx.beginPath();
            ctx.moveTo(point.x, point.y);
            ctx.lineTo(targetPoint.x, targetPoint.y);
            ctx.strokeStyle = 'rgba(106, 79, 251, 0.1)';
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        });
      });

      // Animar y dibujar puntos
      filteredPoints.forEach((point, idx) => {
        // Animación suave hacia target
        const dx = point.tx - point.x;
        const dy = point.ty - point.y;
        point.x += dx * 0.05;
        point.y += dy * 0.05;

        // Pequeño movimiento orbital
        const orbit = Math.sin(time + idx) * 2;
        const finalX = point.x + Math.cos(time * 0.5 + idx) * orbit;
        const finalY = point.y + Math.sin(time * 0.5 + idx) * orbit;

        // Tamaño basado en valor
        let size = 2 + (point.value / 100) * 4;
        const isSelected = selectedPoint?.id === point.id;
        const isHovered = hoveredPoint?.id === point.id;

        if (isSelected || isHovered) {
          size *= 2;
          ctx.shadowBlur = 15;
          ctx.shadowColor = point.color;
        }

        // Dibujar punto
        ctx.beginPath();
        ctx.arc(finalX, finalY, size, 0, Math.PI * 2);
        ctx.fillStyle = point.color;
        ctx.fill();

        // Glow para puntos grandes
        if (point.value > 80) {
          ctx.beginPath();
          ctx.arc(finalX, finalY, size + 3, 0, Math.PI * 2);
          ctx.strokeStyle = `${point.color}33`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }

        ctx.shadowBlur = 0;
      });

      time += 0.02;
      animationId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [dataPoints, selectedPoint, hoveredPoint, filter]);

  // Manejar clicks y hover
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const filteredPoints = dataPoints.filter(p => filter === 'all' || p.type === filter);
    const clicked = filteredPoints.find(p => {
      const distance = Math.sqrt((p.x - x) ** 2 + (p.y - y) ** 2);
      return distance < 10;
    });

    setSelectedPoint(clicked || null);
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const filteredPoints = dataPoints.filter(p => filter === 'all' || p.type === filter);
    const hovered = filteredPoints.find(p => {
      const distance = Math.sqrt((p.x - x) ** 2 + (p.y - y) ** 2);
      return distance < 10;
    });

    setHoveredPoint(hovered || null);
    if (canvas) {
      canvas.style.cursor = hovered ? 'pointer' : 'default';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'opportunity': return 'Oportunidades';
      case 'client': return 'Clientes';
      case 'competitor': return 'Competidores';
      case 'market_signal': return 'Señales de Mercado';
      default: return type;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'opportunity': return '#6A4FFB';
      case 'client': return '#45FF9A';
      case 'competitor': return '#FF4545';
      case 'market_signal': return '#BEBEC6';
      default: return '#FFFFFF';
    }
  };

  const pointCounts = {
    opportunity: dataPoints.filter(p => p.type === 'opportunity').length,
    client: dataPoints.filter(p => p.type === 'client').length,
    competitor: dataPoints.filter(p => p.type === 'competitor').length,
    market_signal: dataPoints.filter(p => p.type === 'market_signal').length
  };

  return (
    <div className="relative w-full h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-xs text-obsidian-text-muted tracking-widest uppercase flex items-center gap-2">
            <Layers size={14} />
            Topología de Mercado
            <span className="text-[9px] opacity-50">
              ({dataPoints.filter(p => filter === 'all' || p.type === filter).length} puntos)
            </span>
          </h3>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowLegend(!showLegend)}
            className="p-1.5 rounded border border-white/[0.1] hover:bg-white/[0.05] transition-all"
            title="Mostrar/Ocultar leyenda"
          >
            <Info size={12} className="text-obsidian-text-muted" />
          </button>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex gap-2 mb-3">
        <button
          onClick={() => setFilter('all')}
          className={`px-2 py-1 text-[9px] uppercase tracking-wider rounded transition-colors ${
            filter === 'all'
              ? 'bg-white/[0.1] text-white'
              : 'text-obsidian-text-muted hover:text-white'
          }`}
        >
          Todos ({dataPoints.length})
        </button>
        {(['opportunity', 'client', 'competitor', 'market_signal'] as const).map(type => (
          <button
            key={type}
            onClick={() => setFilter(type)}
            className={`px-2 py-1 text-[9px] uppercase tracking-wider rounded transition-colors ${
              filter === type
                ? 'bg-white/[0.1] text-white'
                : 'text-obsidian-text-muted hover:text-white'
            }`}
          >
            <span className="inline-block w-2 h-2 rounded-full mr-1" style={{ backgroundColor: getTypeColor(type) }} />
            {getTypeLabel(type)} ({pointCounts[type]})
          </button>
        ))}
      </div>

      {/* Canvas */}
      <div className="relative bg-black/10 rounded-lg overflow-hidden border border-white/[0.05]">
        <canvas
          ref={canvasRef}
          className="w-full h-[400px] block"
          onClick={handleCanvasClick}
          onMouseMove={handleCanvasMouseMove}
          onMouseLeave={() => setHoveredPoint(null)}
        />

        {/* Leyenda */}
        {showLegend && (
          <div className="absolute top-3 left-3 bg-[#0F0F12]/95 backdrop-blur-sm border border-white/[0.1] rounded-lg p-3 text-[10px]">
            <div className="text-obsidian-text-muted uppercase tracking-wider mb-2">Leyenda</div>
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[#6A4FFB]" />
                <span className="text-white">Oportunidades de Arbitraje</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[#45FF9A]" />
                <span className="text-white">Clientes Activos</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[#FF4545]" />
                <span className="text-white">Competidores</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[#BEBEC6]" />
                <span className="text-white">Señales de Mercado</span>
              </div>
            </div>
            <div className="mt-2 pt-2 border-t border-white/[0.05] text-obsidian-text-muted text-[9px]">
              Click en un punto para ver detalles
            </div>
          </div>
        )}

        {/* Tooltip al hacer hover */}
        {hoveredPoint && !selectedPoint && (
          <div
            className="absolute pointer-events-none bg-[#0F0F12]/98 backdrop-blur-md border border-white/[0.2] rounded px-3 py-2 text-[10px]"
            style={{
              left: `${(hoveredPoint.x / 500) * 100}%`,
              top: `${(hoveredPoint.y / 400) * 100}%`,
              transform: 'translate(-50%, -120%)'
            }}
          >
            <div className="text-white font-medium">{hoveredPoint.label}</div>
            <div className="text-obsidian-text-muted">
              Tipo: {getTypeLabel(hoveredPoint.type)}
            </div>
            <div className="text-obsidian-text-muted">
              Valor: {hoveredPoint.value.toFixed(0)}%
            </div>
          </div>
        )}

        {/* Panel de detalles */}
        {selectedPoint && (
          <div className="absolute top-3 right-3 bg-[#0F0F12]/95 backdrop-blur-sm border border-white/[0.1] rounded-lg p-4 w-64">
            <div className="flex justify-between items-start mb-3">
              <div>
                <div className="text-xs text-obsidian-text-muted uppercase mb-1">
                  {getTypeLabel(selectedPoint.type)}
                </div>
                <div className="text-sm text-white font-medium">{selectedPoint.label}</div>
              </div>
              <button
                onClick={() => setSelectedPoint(null)}
                className="p-1 hover:bg-white/[0.1] rounded transition-colors"
              >
                <span className="text-white text-sm">×</span>
              </button>
            </div>

            <div className="space-y-2 text-[10px]">
              <div className="flex justify-between">
                <span className="text-obsidian-text-muted">Valor:</span>
                <span className="text-white font-mono">{selectedPoint.value.toFixed(1)}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-obsidian-text-muted">Conexiones:</span>
                <span className="text-white">{selectedPoint.connections.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-obsidian-text-muted">ID:</span>
                <span className="text-obsidian-text-muted font-mono">{selectedPoint.id}</span>
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-white/[0.05]">
              <button className="w-full px-3 py-1.5 bg-obsidian-accent/20 border border-obsidian-accent/50 rounded text-[10px] text-white hover:bg-obsidian-accent/30 transition-all uppercase tracking-wider">
                Análizar en DTO Lab
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="mt-2 text-[9px] text-obsidian-text-muted text-center">
        Visualización en tiempo real • Última actualización: {new Date().toLocaleTimeString()}
      </div>
    </div>
  );
};
