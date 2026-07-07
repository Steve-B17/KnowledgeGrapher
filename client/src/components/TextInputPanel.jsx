import React, { useState } from 'react';
import { Sparkles, FileText, X, ChevronDown, ChevronUp } from 'lucide-react';

const SAMPLE_TEXTS = [
  {
    label: '🏢 Tech Acquisitions',
    text: `Microsoft acquired LinkedIn in 2016 for $26.2 billion, making it one of the largest tech acquisitions in history. LinkedIn, founded by Reid Hoffman in 2002, is headquartered in Sunnyvale, California. Microsoft, led by CEO Satya Nadella, is based in Redmond, Washington. The acquisition helped Microsoft strengthen its presence in the professional networking and cloud-based services market. LinkedIn later acquired Lynda.com, an online learning platform, to expand its education offerings. Satya Nadella also oversaw Microsoft's acquisition of GitHub in 2018, further cementing the company's commitment to developer ecosystems.`
  },
  {
    label: '🚀 Space Race',
    text: `SpaceX, founded by Elon Musk in 2002, is a private aerospace company based in Hawthorne, California. NASA partnered with SpaceX to transport astronauts to the International Space Station (ISS) as part of the Commercial Crew Program. SpaceX's Falcon 9 rocket became the first commercially operated rocket to deliver cargo to the ISS. Elon Musk also founded Tesla, an electric vehicle company, and The Boring Company, focused on urban tunnel infrastructure. Jeff Bezos founded Blue Origin, a competitor in the commercial spaceflight industry, also based in Kent, Washington. Both Blue Origin and SpaceX competed for NASA's Human Landing System contract to land astronauts on the Moon during the Artemis program.`
  },
  {
    label: '⚔️ Historical Events',
    text: `Napoleon Bonaparte led the French Empire during the early nineteenth century, conquering much of Europe. The Battle of Waterloo in 1815, fought in present-day Belgium, marked Napoleon's final defeat at the hands of the Duke of Wellington, who commanded the British and Allied forces. The French Revolution, which began in Paris in 1789, led to the collapse of the monarchy and eventually paved the way for Napoleon's rise to power. Prussia, led by Field Marshal Blücher, also played a key role in defeating Napoleon at Waterloo. After his defeat, Napoleon was exiled to the island of Saint Helena by the British government, where he died in 1821.`
  }
];

export default function TextInputPanel({ onAnalyze, isAnalyzing }) {
  const [text, setText] = useState('');
  const [expanded, setExpanded] = useState(true);

  const charCount = text.length;
  const isValid = charCount >= 50 && charCount <= 8000;

  const handleAnalyze = () => {
    if (isValid && !isAnalyzing) onAnalyze(text);
  };

  const loadSample = (sample) => {
    setText(sample.text);
    setExpanded(true);
  };

  return (
    <div className="glass-panel rounded-2xl overflow-hidden">
      {/* Header */}
      <div
        className="flex items-center justify-between px-5 py-3.5 border-b border-white/5 cursor-pointer"
        onClick={() => setExpanded(v => !v)}
      >
        <div className="flex items-center gap-2.5">
          <FileText className="w-4 h-4 text-violet-400" />
          <span className="text-sm font-bold text-white">Text Input</span>
          {!expanded && text && (
            <span className="text-[10px] text-slate-500 font-medium truncate max-w-xs ml-1">
              {text.substring(0, 60)}…
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          {/* Sample text buttons */}
          <div className="hidden md:flex items-center gap-1.5">
            {SAMPLE_TEXTS.map(s => (
              <button
                key={s.label}
                onClick={e => { e.stopPropagation(); loadSample(s); }}
                className="text-[10px] font-semibold px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 border border-white/5 text-slate-300 hover:text-white transition-colors"
              >
                {s.label}
              </button>
            ))}
          </div>
          {expanded ? <ChevronDown className="w-4 h-4 text-slate-500" /> : <ChevronUp className="w-4 h-4 text-slate-500" />}
        </div>
      </div>

      {expanded && (
        <div className="p-4 space-y-3">
          <div className="relative">
            <textarea
              value={text}
              onChange={e => setText(e.target.value)}
              placeholder="Paste any article, Wikipedia excerpt, news story, transcript, or book chapter here… The AI will extract all named entities (People, Organizations, Locations, Events, Concepts) and the relationships between them."
              rows={6}
              className="glass-input resize-none custom-scrollbar font-mono text-xs leading-relaxed"
            />
            {text && (
              <button
                onClick={() => setText('')}
                className="absolute top-2.5 right-2.5 p-1 rounded-md bg-slate-700/50 hover:bg-slate-600 text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className={`text-[11px] font-semibold ${
                charCount > 8000 ? 'text-red-400' : charCount >= 50 ? 'text-slate-400' : 'text-slate-600'
              }`}>
                {charCount} / 8000 chars {charCount < 50 && charCount > 0 && '(need 50+)'}
              </span>
              {/* Mobile sample buttons */}
              <div className="flex md:hidden items-center gap-1">
                {SAMPLE_TEXTS.map(s => (
                  <button
                    key={s.label}
                    onClick={() => loadSample(s)}
                    className="text-[10px] font-semibold px-2 py-1 rounded-lg bg-slate-800 border border-white/5 text-slate-400 hover:text-white"
                  >
                    {s.label.split(' ')[0]}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleAnalyze}
              disabled={!isValid || isAnalyzing}
              className="btn-primary flex items-center gap-2 text-sm py-2 px-5"
            >
              {isAnalyzing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Analyzing…</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Analyze Text</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
