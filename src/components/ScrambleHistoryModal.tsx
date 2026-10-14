import React, { useState } from 'react';
import {
  X,
  History,
  Copy,
  Check,
  Play,
  Trash2,
  Share2,
  Eye,
  EyeOff,
  Sparkles,
} from 'lucide-react';
import { ScrambleHistoryItem, PuzzleType } from '../types/cube';
import { compute2DStateFromScramble, ColorCode } from '../lib/scrambler';

interface ScrambleHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  history: ScrambleHistoryItem[];
  currentScramble: string;
  onSelectScramble: (scramble: string, puzzle: PuzzleType) => void;
  onClearHistory: () => void;
}

const COLOR_MAP: Record<ColorCode, string> = {
  W: '#ffffff',
  Y: '#ffd500',
  G: '#009b48',
  B: '#0046ad',
  O: '#ff5800',
  R: '#b71234',
};

export const ScrambleHistoryModal: React.FC<ScrambleHistoryModalProps> = ({
  isOpen,
  onClose,
  history,
  currentScramble,
  onSelectScramble,
  onClearHistory,
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);
  const [previewId, setPreviewId] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopySingle = (item: ScrambleHistoryItem) => {
    navigator.clipboard.writeText(item.scramble);
    setCopiedId(item.id);
    setTimeout(() => setCopiedId(null), 1800);
  };

  const handleCopyAll = () => {
    if (history.length === 0) return;
    const text = history
      .map((item, idx) => `${history.length - idx}. (${item.puzzle}) ${item.scramble}`)
      .join('\n');
    navigator.clipboard.writeText(text);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  };

  const formatTime = (ts: number) => {
    const d = new Date(ts);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl max-h-[88vh] bg-neutral-900 border border-neutral-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-800 bg-neutral-900/90 sticky top-0 z-10">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-400">
              <History className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-neutral-100 text-base sm:text-lg">
                  Scramble History
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-mono font-semibold bg-neutral-800 text-teal-300 border border-neutral-700">
                  {history.length} / 20
                </span>
              </div>
              <p className="text-xs text-neutral-400">
                View, copy, or reload any of the last 20 generated scrambles
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scramble List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3 scrollbar-thin scrollbar-thumb-neutral-800">
          {history.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center text-neutral-500">
              <History className="w-12 h-12 mb-3 text-neutral-700 stroke-[1.5]" />
              <p className="text-sm font-medium text-neutral-400">No scrambles in history yet</p>
              <p className="text-xs text-neutral-600 mt-1 max-w-xs">
                Generate scrambles using the timer or new scramble button to populate your recent 20 scrambles.
              </p>
            </div>
          ) : (
            history.map((item, index) => {
              const isCurrent = item.scramble.trim() === currentScramble.trim();
              const isPreviewing = previewId === item.id;
              const cube2D = item.puzzle === '3x3' ? compute2DStateFromScramble(item.scramble) : null;

              return (
                <div
                  key={item.id}
                  className={`p-3.5 rounded-2xl border transition-all ${
                    isCurrent
                      ? 'bg-teal-950/20 border-teal-500/40 shadow-sm'
                      : 'bg-neutral-950/60 border-neutral-800/80 hover:border-neutral-700'
                  }`}
                >
                  {/* Item Top Meta */}
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-neutral-500">
                        #{history.length - index}
                      </span>
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-semibold bg-neutral-800 text-neutral-300 uppercase">
                        {item.puzzle}
                      </span>
                      {isCurrent && (
                        <span className="flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-teal-500/20 text-teal-300 border border-teal-500/30">
                          <Sparkles className="w-2.5 h-2.5" />
                          Active
                        </span>
                      )}
                    </div>

                    <span className="text-[11px] font-mono text-neutral-500">
                      {formatTime(item.timestamp)}
                    </span>
                  </div>

                  {/* Scramble Text */}
                  <p className="font-mono text-xs sm:text-sm text-neutral-200 tracking-wide select-all leading-relaxed bg-neutral-900/70 p-2.5 rounded-xl border border-neutral-800/60 break-words">
                    {item.scramble}
                  </p>

                  {/* 2D Verification Preview (if toggled) */}
                  {isPreviewing && cube2D && (
                    <div className="mt-2 p-2.5 bg-neutral-900/90 border border-neutral-800 rounded-xl flex flex-col items-center animate-in fade-in duration-150">
                      <span className="text-[10px] text-neutral-400 font-mono mb-2">
                        2D Flat State (White Top · Green Front)
                      </span>
                      <div className="grid grid-cols-4 gap-1 p-1 bg-black/40 rounded-lg">
                        <div />
                        {/* Up Face */}
                        <div className="grid grid-cols-3 gap-0.5 p-0.5 bg-neutral-950 rounded">
                          {cube2D.U.map((row, r) =>
                            row.map((cell, c) => (
                              <div
                                key={`U-${r}-${c}`}
                                className="w-2.5 h-2.5 rounded-[1px]"
                                style={{ backgroundColor: COLOR_MAP[cell] }}
                              />
                            ))
                          )}
                        </div>
                        <div />
                        <div />

                        {/* Left Face */}
                        <div className="grid grid-cols-3 gap-0.5 p-0.5 bg-neutral-950 rounded">
                          {cube2D.L.map((row, r) =>
                            row.map((cell, c) => (
                              <div
                                key={`L-${r}-${c}`}
                                className="w-2.5 h-2.5 rounded-[1px]"
                                style={{ backgroundColor: COLOR_MAP[cell] }}
                              />
                            ))
                          )}
                        </div>
                        {/* Front Face */}
                        <div className="grid grid-cols-3 gap-0.5 p-0.5 bg-neutral-950 rounded">
                          {cube2D.F.map((row, r) =>
                            row.map((cell, c) => (
                              <div
                                key={`F-${r}-${c}`}
                                className="w-2.5 h-2.5 rounded-[1px]"
                                style={{ backgroundColor: COLOR_MAP[cell] }}
                              />
                            ))
                          )}
                        </div>
                        {/* Right Face */}
                        <div className="grid grid-cols-3 gap-0.5 p-0.5 bg-neutral-950 rounded">
                          {cube2D.R.map((row, r) =>
                            row.map((cell, c) => (
                              <div
                                key={`R-${r}-${c}`}
                                className="w-2.5 h-2.5 rounded-[1px]"
                                style={{ backgroundColor: COLOR_MAP[cell] }}
                              />
                            ))
                          )}
                        </div>
                        {/* Back Face */}
                        <div className="grid grid-cols-3 gap-0.5 p-0.5 bg-neutral-950 rounded">
                          {cube2D.B.map((row, r) =>
                            row.map((cell, c) => (
                              <div
                                key={`B-${r}-${c}`}
                                className="w-2.5 h-2.5 rounded-[1px]"
                                style={{ backgroundColor: COLOR_MAP[cell] }}
                              />
                            ))
                          )}
                        </div>

                        <div />
                        {/* Down Face */}
                        <div className="grid grid-cols-3 gap-0.5 p-0.5 bg-neutral-950 rounded">
                          {cube2D.D.map((row, r) =>
                            row.map((cell, c) => (
                              <div
                                key={`D-${r}-${c}`}
                                className="w-2.5 h-2.5 rounded-[1px]"
                                style={{ backgroundColor: COLOR_MAP[cell] }}
                              />
                            ))
                          )}
                        </div>
                        <div />
                        <div />
                      </div>
                    </div>
                  )}

                  {/* Actions Bar */}
                  <div className="flex items-center justify-between mt-2.5 pt-1">
                    <div className="flex items-center gap-1.5">
                      {/* Use / Reuse Scramble */}
                      <button
                        onClick={() => {
                          onSelectScramble(item.scramble, item.puzzle);
                          onClose();
                        }}
                        disabled={isCurrent}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                          isCurrent
                            ? 'bg-neutral-800/50 text-neutral-500 cursor-not-allowed'
                            : 'bg-teal-600 hover:bg-teal-500 text-white shadow-xs active:scale-95'
                        }`}
                      >
                        <Play className="w-3 h-3 fill-current" />
                        <span>{isCurrent ? 'Currently Loaded' : 'Use Scramble'}</span>
                      </button>

                      {/* 2D Preview toggle */}
                      {item.puzzle === '3x3' && (
                        <button
                          onClick={() => setPreviewId(isPreviewing ? null : item.id)}
                          className={`p-1.5 rounded-xl border text-xs transition-colors flex items-center gap-1 ${
                            isPreviewing
                              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                              : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-neutral-200'
                          }`}
                          title="Toggle 2D Facelet Preview"
                        >
                          {isPreviewing ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      )}
                    </div>

                    {/* Copy Button */}
                    <button
                      onClick={() => handleCopySingle(item)}
                      className={`px-2.5 py-1.5 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-all border ${
                        copiedId === item.id
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                          : 'bg-neutral-900 hover:bg-neutral-800 text-neutral-300 border-neutral-800 hover:border-neutral-700'
                      }`}
                      title="Copy scramble to clipboard"
                    >
                      {copiedId === item.id ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        {history.length > 0 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-neutral-800 bg-neutral-950/80">
            <button
              onClick={handleCopyAll}
              className="px-3 py-1.5 rounded-xl text-xs font-medium text-neutral-300 hover:text-white bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 flex items-center gap-1.5 transition-colors"
            >
              {copiedAll ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Copied All 20!</span>
                </>
              ) : (
                <>
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Copy All Scrambles</span>
                </>
              )}
            </button>

            <button
              onClick={() => {
                if (window.confirm('Clear all 20 scrambles from history?')) {
                  onClearHistory();
                }
              }}
              className="px-3 py-1.5 rounded-xl text-xs font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors flex items-center gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear History</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
