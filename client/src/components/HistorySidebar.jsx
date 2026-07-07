import React from 'react';
import { History, Trash2, GitBranch, Circle } from 'lucide-react';
import axios from 'axios';

export default function HistorySidebar({ history, selectedId, onSelect, onDelete }) {
  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm('Delete this analysis?')) return;
    try {
      await axios.delete(`/api/analysis/${id}`);
      onDelete(id);
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    const now = new Date();
    const diffMs = now - d;
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  };

  return (
    <div className="glass-panel rounded-2xl flex flex-col h-full overflow-hidden">
      <div className="px-4 py-3.5 border-b border-white/5 flex items-center gap-2 shrink-0">
        <History className="w-4 h-4 text-violet-400" />
        <span className="text-sm font-bold text-white">History</span>
        <span className="ml-auto text-[10px] text-slate-500 font-semibold">{history.length} analyses</span>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1.5">
        {history.length === 0 ? (
          <p className="text-[11px] text-slate-600 text-center py-8 leading-relaxed px-4">
            Your analyzed graphs will appear here for easy re-loading.
          </p>
        ) : (
          history.map(item => {
            const isActive = item._id === selectedId;
            return (
              <button
                key={item._id}
                onClick={() => onSelect(item._id)}
                className={`w-full text-left px-3 py-2.5 rounded-xl transition-all duration-150 group relative ${
                  isActive
                    ? 'bg-violet-500/15 border border-violet-500/25'
                    : 'hover:bg-white/5 border border-transparent'
                }`}
              >
                <div className="flex items-start gap-2 pr-6">
                  <Circle
                    className={`w-2 h-2 shrink-0 mt-1 ${isActive ? 'text-violet-400 fill-violet-400' : 'text-slate-600 fill-slate-600'}`}
                  />
                  <div className="min-w-0">
                    <p className="text-[12px] font-semibold text-slate-200 line-clamp-2 leading-snug">
                      {item.title}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex items-center gap-1 text-[10px] text-slate-500">
                        <GitBranch className="w-3 h-3" />
                        <span>{item.entityCount} entities · {item.edgeCount} edges</span>
                      </div>
                    </div>
                    <p className="text-[10px] text-slate-600 mt-0.5">{formatDate(item.createdAt)}</p>
                  </div>
                </div>

                {/* Delete button */}
                <button
                  onClick={e => handleDelete(e, item._id)}
                  className="absolute top-2 right-2 p-1 rounded-lg opacity-0 group-hover:opacity-100 bg-slate-700/50 hover:bg-red-500/20 text-slate-500 hover:text-red-400 transition-all"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
