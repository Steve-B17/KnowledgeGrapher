import React, { useState } from 'react';
import { Users, Building2, MapPin, Zap, Brain, ChevronDown, ChevronRight } from 'lucide-react';

const TYPE_CONFIG = {
  PERSON:       { icon: Users,     color: 'text-sky-400',    badge: 'badge-PERSON',       dot: '#38bdf8' },
  ORGANIZATION: { icon: Building2, color: 'text-violet-400', badge: 'badge-ORGANIZATION', dot: '#a78bfa' },
  LOCATION:     { icon: MapPin,    color: 'text-emerald-400',badge: 'badge-LOCATION',      dot: '#34d399' },
  EVENT:        { icon: Zap,       color: 'text-amber-400',  badge: 'badge-EVENT',         dot: '#fbbf24' },
  CONCEPT:      { icon: Brain,     color: 'text-rose-400',   badge: 'badge-CONCEPT',       dot: '#fb7185' },
};

export default function EntityPanel({ nodes, edges, selectedNodeId, onEntityClick }) {
  const [expandedTypes, setExpandedTypes] = useState(new Set(['PERSON', 'ORGANIZATION']));

  const toggleType = (type) => {
    setExpandedTypes(prev => {
      const next = new Set(prev);
      next.has(type) ? next.delete(type) : next.add(type);
      return next;
    });
  };

  // Group nodes by type
  const grouped = nodes.reduce((acc, node) => {
    if (!acc[node.type]) acc[node.type] = [];
    acc[node.type].push(node);
    return acc;
  }, {});

  // Count edges per node
  const edgeCount = (nodeId) =>
    edges.filter(e => e.source === nodeId || e.target === nodeId).length;

  // Relationships involving selected node
  const selectedRelations = selectedNodeId
    ? edges.filter(e => e.source === selectedNodeId || e.target === selectedNodeId)
    : [];

  const findNode = (id) => nodes.find(n => n.id === id);

  return (
    <div className="glass-panel rounded-2xl flex flex-col h-full overflow-hidden">
      <div className="px-4 py-3.5 border-b border-white/5 flex items-center justify-between shrink-0">
        <span className="text-sm font-bold text-white">Entities</span>
        <div className="flex gap-2 text-[10px] font-semibold">
          <span className="text-violet-300">{nodes.length} nodes</span>
          <span className="text-slate-600">·</span>
          <span className="text-slate-400">{edges.length} edges</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-2">
        {nodes.length === 0 ? (
          <p className="text-[11px] text-slate-600 text-center py-8">No entities yet — analyze some text first.</p>
        ) : (
          Object.entries(TYPE_CONFIG).map(([type, cfg]) => {
            const typeNodes = grouped[type] || [];
            if (typeNodes.length === 0) return null;
            const Icon = cfg.icon;
            const isOpen = expandedTypes.has(type);
            return (
              <div key={type} className="glass-card rounded-xl overflow-hidden">
                {/* Type Header */}
                <button
                  onClick={() => toggleType(type)}
                  className="w-full flex items-center justify-between px-3 py-2 hover:bg-white/5 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Icon className={`w-3.5 h-3.5 ${cfg.color}`} />
                    <span className={`text-[11px] font-bold uppercase tracking-wider ${cfg.color}`}>{type}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className={`text-[10px] font-extrabold border rounded px-1.5 py-0.5 ${cfg.badge}`}>
                      {typeNodes.length}
                    </span>
                    {isOpen ? <ChevronDown className="w-3 h-3 text-slate-500" /> : <ChevronRight className="w-3 h-3 text-slate-500" />}
                  </div>
                </button>

                {/* Entity list */}
                {isOpen && (
                  <div className="px-2 pb-2 space-y-1">
                    {typeNodes.map(node => {
                      const isSelected = node.id === selectedNodeId;
                      return (
                        <button
                          key={node.id}
                          onClick={() => onEntityClick(node)}
                          className={`w-full text-left px-2.5 py-2 rounded-lg transition-all duration-150 ${
                            isSelected
                              ? 'bg-violet-500/15 border border-violet-500/30'
                              : 'hover:bg-white/5 border border-transparent'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 min-w-0">
                              <span className="w-2 h-2 rounded-full shrink-0" style={{ background: cfg.dot }}></span>
                              <span className="text-[12px] font-semibold text-slate-200 truncate">{node.label}</span>
                            </div>
                            <span className="text-[9px] text-slate-600 font-mono shrink-0 ml-1">
                              {edgeCount(node.id)} links
                            </span>
                          </div>
                          {node.description && (
                            <p className="text-[10px] text-slate-500 mt-0.5 ml-4 line-clamp-2 leading-relaxed">
                              {node.description}
                            </p>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Selected node relations panel */}
      {selectedNodeId && selectedRelations.length > 0 && (
        <div className="shrink-0 border-t border-white/5 px-4 py-3 bg-violet-500/5">
          <p className="text-[10px] font-bold uppercase tracking-wider text-violet-300 mb-2">
            {findNode(selectedNodeId)?.label} — Relationships
          </p>
          <div className="space-y-1 max-h-28 overflow-y-auto custom-scrollbar">
            {selectedRelations.map((e, i) => {
              const isSource = e.source === selectedNodeId;
              const otherId = isSource ? e.target : e.source;
              const other = findNode(otherId);
              return (
                <div key={i} className="text-[11px] text-slate-300 flex items-center gap-1.5">
                  {isSource ? (
                    <>
                      <span className="text-slate-500">→</span>
                      <span className="text-violet-300 font-semibold">{e.relationship}</span>
                      <span className="text-slate-500">→</span>
                      <span className="font-medium">{other?.label || otherId}</span>
                    </>
                  ) : (
                    <>
                      <span className="font-medium">{other?.label || otherId}</span>
                      <span className="text-slate-500">→</span>
                      <span className="text-violet-300 font-semibold">{e.relationship}</span>
                      <span className="text-slate-500">→ you</span>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
