import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import GraphCanvas from '../components/GraphCanvas';
import TextInputPanel from '../components/TextInputPanel';
import EntityPanel from '../components/EntityPanel';
import HistorySidebar from '../components/HistorySidebar';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

export default function Dashboard() {
  const [currentNodes, setCurrentNodes] = useState([]);
  const [currentEdges, setCurrentEdges] = useState([]);
  const [currentAnalysisId, setCurrentAnalysisId] = useState(null);
  const [selectedNodeId, setSelectedNodeId] = useState(null);

  const [history, setHistory] = useState([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const [toast, setToast] = useState(null); // { type: 'success'|'error', message }

  const showToast = useCallback((type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  }, []);

  // Fetch analysis history on mount
  const fetchHistory = useCallback(async () => {
    try {
      const res = await axios.get('/api/analysis/history');
      setHistory(res.data);
    } catch (err) {
      console.error('Could not fetch history:', err.message);
    }
  }, []);

  useEffect(() => { fetchHistory(); }, [fetchHistory]);

  const handleAnalyze = async (text) => {
    setIsAnalyzing(true);
    setSelectedNodeId(null);
    try {
      const res = await axios.post('/api/analysis/analyze', { text });
      setCurrentNodes(res.data.nodes);
      setCurrentEdges(res.data.edges);
      setCurrentAnalysisId(res.data._id);
      showToast('success', `Extracted ${res.data.entityCount} entities and ${res.data.edgeCount} relationships!`);
      fetchHistory();
    } catch (err) {
      const msg = err.response?.data?.message || 'Analysis failed. Check your API key and try again.';
      showToast('error', msg);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleHistorySelect = async (id) => {
    if (id === currentAnalysisId) return;
    try {
      const res = await axios.get(`/api/analysis/${id}`);
      setCurrentNodes(res.data.nodes);
      setCurrentEdges(res.data.edges);
      setCurrentAnalysisId(res.data._id);
      setSelectedNodeId(null);
    } catch (err) {
      showToast('error', 'Could not load analysis.');
    }
  };

  const handleDeleteHistory = (id) => {
    setHistory(prev => prev.filter(h => h._id !== id));
    if (id === currentAnalysisId) {
      setCurrentNodes([]);
      setCurrentEdges([]);
      setCurrentAnalysisId(null);
      setSelectedNodeId(null);
    }
  };

  const currentStats = currentNodes.length > 0
    ? { entityCount: currentNodes.length, edgeCount: currentEdges.length }
    : null;

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-slate-950">
      <Navbar stats={currentStats} />

      {/* Main layout */}
      <div className="flex flex-1 overflow-hidden gap-3 p-3">
        {/* Left: History Sidebar */}
        <div className="w-56 shrink-0 hidden lg:flex flex-col">
          <HistorySidebar
            history={history}
            selectedId={currentAnalysisId}
            onSelect={handleHistorySelect}
            onDelete={handleDeleteHistory}
          />
        </div>

        {/* Center: Graph + Input */}
        <div className="flex-1 flex flex-col gap-3 min-w-0">
          {/* Graph Canvas — takes remaining space */}
          <div className="flex-1 min-h-0">
            <GraphCanvas
              nodes={currentNodes}
              edges={currentEdges}
              selectedNodeId={selectedNodeId}
              onNodeClick={(node) => setSelectedNodeId(prev => prev === node.id ? null : node.id)}
            />
          </div>

          {/* Text Input Panel — fixed at bottom */}
          <div className="shrink-0">
            <TextInputPanel onAnalyze={handleAnalyze} isAnalyzing={isAnalyzing} />
          </div>
        </div>

        {/* Right: Entity Panel */}
        <div className="w-64 shrink-0 hidden md:flex flex-col">
          <EntityPanel
            nodes={currentNodes}
            edges={currentEdges}
            selectedNodeId={selectedNodeId}
            onEntityClick={(node) => setSelectedNodeId(prev => prev === node.id ? null : node.id)}
          />
        </div>
      </div>

      {/* Toast notification */}
      {toast && (
        <div className={`fixed bottom-5 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2.5 px-5 py-3 rounded-2xl shadow-2xl text-sm font-semibold backdrop-blur-lg border transition-all duration-300 ${
          toast.type === 'success'
            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-200'
            : 'bg-red-500/10 border-red-500/20 text-red-200'
        }`}>
          {toast.type === 'success'
            ? <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            : <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
          }
          <span>{toast.message}</span>
        </div>
      )}
    </div>
  );
}
