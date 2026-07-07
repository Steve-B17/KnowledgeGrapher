import React, { useRef, useCallback, useEffect, useState } from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import { ZoomIn, ZoomOut, Maximize2, RotateCcw } from 'lucide-react';

// Color map per entity type
const NODE_COLORS = {
  PERSON:       '#38bdf8', // sky
  ORGANIZATION: '#a78bfa', // violet
  LOCATION:     '#34d399', // emerald
  EVENT:        '#fbbf24', // amber
  CONCEPT:      '#fb7185', // rose
};

const LINK_COLOR = 'rgba(148,163,184,0.25)';
const LINK_HOVER_COLOR = 'rgba(167,139,250,0.8)';

export default function GraphCanvas({ nodes, edges, onNodeClick, selectedNodeId }) {
  const fgRef = useRef();
  const containerRef = useRef();
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const [hoveredLink, setHoveredLink] = useState(null);

  // Resize observer
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(entries => {
      for (const entry of entries) {
        setDimensions({
          width: entry.contentRect.width,
          height: entry.contentRect.height
        });
      }
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const graphData = {
    nodes: nodes.map(n => ({ ...n, val: 6 })),
    links: edges.map(e => ({
      source: e.source,
      target: e.target,
      label: e.relationship
    }))
  };

  const nodeCanvasDraw = useCallback((node, ctx, globalScale) => {
    const isSelected = node.id === selectedNodeId;
    const color = NODE_COLORS[node.type] || '#94a3b8';
    const radius = isSelected ? 9 : 7;

    // Glow ring for selected
    if (isSelected) {
      ctx.beginPath();
      ctx.arc(node.x, node.y, radius + 5, 0, 2 * Math.PI);
      ctx.fillStyle = `${color}22`;
      ctx.fill();

      ctx.beginPath();
      ctx.arc(node.x, node.y, radius + 2, 0, 2 * Math.PI);
      ctx.strokeStyle = `${color}88`;
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }

    // Node circle
    ctx.beginPath();
    ctx.arc(node.x, node.y, radius, 0, 2 * Math.PI);
    ctx.fillStyle = isSelected ? color : `${color}cc`;
    ctx.fill();
    ctx.strokeStyle = isSelected ? '#fff' : `${color}55`;
    ctx.lineWidth = isSelected ? 2 : 1;
    ctx.stroke();

    // Label
    const fontSize = Math.max(10 / globalScale, 4);
    ctx.font = `600 ${fontSize}px Outfit, Inter, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = isSelected ? '#fff' : '#e2e8f0';
    ctx.fillText(node.label, node.x, node.y + radius + fontSize + 2);
  }, [selectedNodeId]);

  const linkCanvasDraw = useCallback((link, ctx) => {
    const isHovered = hoveredLink === link;
    ctx.strokeStyle = isHovered ? LINK_HOVER_COLOR : LINK_COLOR;
    ctx.lineWidth = isHovered ? 1.5 : 1;

    const start = link.source;
    const end = link.target;
    if (!start?.x || !end?.x) return;

    ctx.beginPath();
    ctx.moveTo(start.x, start.y);
    ctx.lineTo(end.x, end.y);
    ctx.stroke();

    // Relationship label at midpoint
    if (isHovered || link.__hovered) {
      const midX = (start.x + end.x) / 2;
      const midY = (start.y + end.y) / 2;
      ctx.font = '500 9px Outfit, Inter, sans-serif';
      ctx.fillStyle = '#c4b5fd';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      // Background pill
      const tw = ctx.measureText(link.label).width;
      ctx.fillStyle = 'rgba(15,15,30,0.85)';
      ctx.beginPath();
      ctx.roundRect(midX - tw / 2 - 4, midY - 7, tw + 8, 14, 4);
      ctx.fill();
      ctx.fillStyle = '#c4b5fd';
      ctx.fillText(link.label, midX, midY);
    }
  }, [hoveredLink]);

  const handleZoomIn  = () => fgRef.current?.zoom(1.4, 300);
  const handleZoomOut = () => fgRef.current?.zoom(0.7, 300);
  const handleFit     = () => fgRef.current?.zoomToFit(400, 40);
  const handleReset   = () => {
    fgRef.current?.zoomToFit(400, 40);
    fgRef.current?.d3ReheatSimulation();
  };

  return (
    <div ref={containerRef} className="relative w-full h-full bg-slate-950/80 rounded-2xl overflow-hidden border border-white/5">
      {nodes.length === 0 ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-600 gap-3 select-none">
          <span className="text-6xl">🕸️</span>
          <p className="text-sm font-semibold text-slate-500">Paste text below and click <span className="text-violet-400">Analyze</span> to build the graph</p>
        </div>
      ) : (
        <>
          <ForceGraph2D
            ref={fgRef}
            width={dimensions.width}
            height={dimensions.height}
            graphData={graphData}
            nodeCanvasObject={nodeCanvasDraw}
            nodeCanvasObjectMode={() => 'replace'}
            linkCanvasObject={linkCanvasDraw}
            linkCanvasObjectMode={() => 'replace'}
            onNodeClick={(node) => onNodeClick && onNodeClick(node)}
            onLinkHover={setHoveredLink}
            linkDirectionalArrowLength={5}
            linkDirectionalArrowRelPos={1}
            linkDirectionalArrowColor={() => 'rgba(148,163,184,0.4)'}
            backgroundColor="transparent"
            cooldownTicks={120}
            onEngineStop={() => fgRef.current?.zoomToFit(400, 40)}
            enableNodeDrag={true}
          />

          {/* Graph Controls */}
          <div className="absolute bottom-4 right-4 flex flex-col gap-1.5">
            {[
              { icon: ZoomIn,    fn: handleZoomIn,  tip: 'Zoom In' },
              { icon: ZoomOut,   fn: handleZoomOut, tip: 'Zoom Out' },
              { icon: Maximize2, fn: handleFit,     tip: 'Fit Graph' },
              { icon: RotateCcw, fn: handleReset,   tip: 'Reset' }
            ].map(({ icon: Icon, fn, tip }) => (
              <button
                key={tip}
                onClick={fn}
                title={tip}
                className="w-8 h-8 bg-slate-800/80 hover:bg-slate-700 border border-white/10 rounded-lg flex items-center justify-center text-slate-400 hover:text-violet-300 transition-colors"
              >
                <Icon className="w-3.5 h-3.5" />
              </button>
            ))}
          </div>

          {/* Legend */}
          <div className="absolute top-3 left-3 glass-panel rounded-xl px-3 py-2 flex flex-wrap gap-x-3 gap-y-1">
            {Object.entries(NODE_COLORS).map(([type, color]) => (
              <div key={type} className="flex items-center gap-1.5 text-[10px] font-semibold text-slate-400">
                <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ background: color }}></span>
                {type}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
