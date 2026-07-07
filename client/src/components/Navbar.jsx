import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Network, LogOut, GitBranch } from 'lucide-react';

export default function Navbar({ stats }) {
  const { user, logout } = useContext(AuthContext);

  return (
    <nav className="glass-panel border-b border-white/5 px-6 py-3.5 flex items-center justify-between sticky top-0 z-40">
      {/* Brand */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 bg-violet-500/10 rounded-xl flex items-center justify-center border border-violet-500/20 text-violet-400 shrink-0">
          <Network className="w-5 h-5" />
        </div>
        <div>
          <span className="text-lg font-extrabold shimmer-text tracking-tight">KnowledgeGrapher</span>
          <span className="text-[10px] block text-slate-500 font-medium -mt-0.5">NLP Entity & Relationship Visualizer</span>
        </div>
      </div>

      {/* Center stats (if graph is loaded) */}
      {stats && (
        <div className="hidden md:flex items-center gap-4 px-4 py-2 glass-card rounded-xl">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-300">
            <GitBranch className="w-3.5 h-3.5 text-violet-400" />
            <span>{stats.entityCount} entities</span>
          </div>
          <span className="text-slate-700">·</span>
          <div className="text-xs font-semibold text-slate-300">
            {stats.edgeCount} relationships
          </div>
        </div>
      )}

      {/* User & Logout */}
      <div className="flex items-center gap-3">
        <div className="hidden sm:block text-right">
          <span className="text-[9px] block text-slate-600 uppercase tracking-wider font-bold">Signed in</span>
          <span className="text-xs font-semibold text-slate-300">{user?.email}</span>
        </div>
        <button
          onClick={logout}
          className="p-2.5 bg-slate-800/60 hover:bg-rose-500/10 border border-white/5 hover:border-rose-500/20 rounded-xl text-slate-400 hover:text-rose-400 transition-all duration-200"
          title="Sign Out"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </nav>
  );
}
