import React, { useState } from 'react';
import { Search, Filter } from 'lucide-react';
import type { Event } from '../../hooks/useWarRoom';

interface EventStreamProps {
  events: Event[];
}

export const EventStream: React.FC<EventStreamProps> = ({ events }) => {
  const [filter, setFilter] = useState('');
  const [sourceFilter, setSourceFilter] = useState<string>('all');

  const uniqueSources = Array.from(new Set(events.map(e => e.source)));

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.message.toLowerCase().includes(filter.toLowerCase()) ||
                         event.source.toLowerCase().includes(filter.toLowerCase());
    const matchesSource = sourceFilter === 'all' || event.source === sourceFilter;
    return matchesSearch && matchesSource;
  });

  return (
    <div className="h-full w-full flex flex-col">
      {/* Header con filtros */}
      <div className="flex items-center justify-between mb-3 pb-3 border-b border-white/[0.04]">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-obsidian-success animate-pulse" />
          <span className="text-[9px] uppercase tracking-[0.2em] text-obsidian-text-muted font-mono">
            Registro de Ejecución
          </span>
          <span className="text-[9px] text-obsidian-text-muted/50">({filteredEvents.length})</span>
        </div>

        <div className="flex items-center gap-2">
          {/* Filtro de búsqueda */}
          <div className="relative">
            <Search size={12} className="absolute left-2 top-1/2 -translate-y-1/2 text-obsidian-text-muted" />
            <input
              type="text"
              placeholder="Buscar..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="pl-7 pr-2 py-1 bg-white/[0.02] border border-white/[0.04] rounded text-[10px] text-white placeholder:text-obsidian-text-muted/50 focus:outline-none focus:border-obsidian-accent/30 w-32"
            />
          </div>

          {/* Filtro de fuente */}
          <div className="relative">
            <Filter size={12} className="absolute left-2 top-1/2 -translate-y-1/2 text-obsidian-text-muted pointer-events-none" />
            <select
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value)}
              className="pl-7 pr-2 py-1 bg-white/[0.02] border border-white/[0.04] rounded text-[10px] text-white focus:outline-none focus:border-obsidian-accent/30 appearance-none cursor-pointer"
            >
              <option value="all">Todas las fuentes</option>
              {uniqueSources.map(source => (
                <option key={source} value={source}>{source}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Stream de eventos */}
      <div className="flex-1 overflow-y-auto font-mono text-[11px] text-obsidian-text-muted relative">
        <div className="absolute top-0 left-0 right-0 h-8 bg-gradient-to-b from-[#0F0F12] to-transparent z-10 pointer-events-none" />
        <div className="space-y-1.5 pt-2 pb-4">
          {filteredEvents.length === 0 ? (
            <div className="text-center py-8 text-obsidian-text-muted/50 text-xs">
              No se encontraron eventos
            </div>
          ) : (
            filteredEvents.map(event => (
              <div
                key={event.id}
                className="flex gap-3 opacity-70 hover:opacity-100 transition-opacity group"
              >
                <span className="opacity-50 group-hover:opacity-100">[{event.time}]</span>
                <span className={
                  event.source.includes('CORE') || event.source.includes('SWARM')
                    ? 'text-obsidian-accent'
                    : 'text-obsidian-text-secondary'
                }>
                  {event.source}:
                </span>
                <span className="truncate flex-1">{event.message}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
