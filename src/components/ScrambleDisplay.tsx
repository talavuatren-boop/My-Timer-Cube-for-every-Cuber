import React, { useState } from 'react';
import { Copy, Check, RefreshCw, ChevronLeft, ChevronRight, Eye, EyeOff, History } from 'lucide-react';
import { PuzzleType } from '../types/cube';
import { compute2DStateFromScramble, ColorCode } from '../lib/scrambler';

interface ScrambleDisplayProps {
  scramble: string;
  puzzle: PuzzleType;
  onNewScramble: () => void;
  onPrevScramble?: () => void;
  hasPrevScramble?: boolean;
  onPuzzleChange: (puzzle: PuzzleType) => void;
  show2DPreview?: boolean;
  onOpenHistory?: () => void;
  historyCount?: number;
}

const PUZZLE_LABELS: Record<PuzzleType, string> = {
  '3x3': '3×3×3',
  '2x2': '2×2×2',
  '4x4': '4×4×4',
  '5x5': '5×5×5',
  '6x6': '6×6×6',
  '7x7': '7×7×7',
  'pyraminx': 'Pyraminx',
  'megaminx': 'Megaminx',
  'skewb': 'Skewb',
  'sq1': 'Square-1',
  'clock': 'Clock',
};

const COLOR_MAP: Record<ColorCode, string> = {
  W: '#ffffff', // White
  Y: '#ffd500', // Yellow
  G: '#009b48', // Green
  B: '#0046ad', // Blue
  O: '#ff5800', // Orange
  R: '#b71234', // Red
};

export const ScrambleDisplay: React.FC<ScrambleDisplayProps> = ({
  scramble,
  puzzle,
  onNewScramble,
  onPrevScramble,
  hasPrevScramble = false,
  onPuzzleChange,
  show2DPreview = true,
  onOpenHistory,
  historyCount = 0,
}) => {
  const [copied, setCopied] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(scramble);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Compute 2D facelets for 3x3
  const cube2D = puzzle === '3x3' ? compute2DStateFromScramble(scramble) : null;

  return (
    <div className="w-full flex flex-col items-center">
      {/* Top selector & actions bar */}
      <div className="w-full max-w-4xl flex items-center justify-between px-3 py-1.5 text-xs text-neutral-400">
        <div className="flex items-center gap-2">
          {/* Puzzle selector */}
          <select
            value={puzzle}
            onChange={(e) => onPuzzleChange(e.target.value as PuzzleType)}
            className="bg-neutral-900 border border-neutral-800 text-neutral-200 text-xs rounded-lg px-2.5 py-1 outline-hidden focus:border-emerald-500 cursor-pointer font-medium hover:bg-neutral-850 transition-colors"
          >
            {(Object.keys(PUZZLE_LABELS) as PuzzleType[]).map((p) => (
              <option key={p} value={p}>
                {PUZZLE_LABELS[p]}
              </option>
            ))}
          </select>

          {/* 2D Preview toggle (3x3 only) */}
          {puzzle === '3x3' && show2DPreview && (
            <button
              onClick={() => setShowPreviewModal(!showPreviewModal)}
              title="Toggle 2D Facelet Scramble Preview"
              className={`p-1.5 rounded-lg border transition-colors flex items-center gap-1 ${
                showPreviewModal
                  ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
                  : 'bg-neutral-900/60 border-neutral-800 text-neutral-400 hover:text-neutral-200'
              }`}
            >
              {showPreviewModal ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline text-[11px]">Preview</span>
            </button>
          )}
        </div>

        <div className="flex items-center gap-1">
          {/* Previous Scramble */}
          {onPrevScramble && (
            <button
              onClick={onPrevScramble}
              disabled={!hasPrevScramble}
              title="Previous Scramble"
              className="p-1.5 rounded-lg hover:bg-neutral-800 text-neutral-400 hover:text-neutral-200 disabled:opacity-30 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          )}

          {/* New Scramble */}
          <button
            onClick={onNewScramble}
            title="Next / New Scramble"
            className="p-1.5 rounded-lg hover:bg-neutral-800 text-neutral-400 hover:text-neutral-200 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          {/* Copy Scramble */}
          <button
            onClick={handleCopy}
            title="Copy Scramble"
            className="p-1.5 rounded-lg hover:bg-neutral-800 text-neutral-400 hover:text-neutral-200 transition-colors"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
          </button>

          {/* Scramble History (Last 20) */}
          {onOpenHistory && (
            <button
              onClick={onOpenHistory}
              title="Scramble History (Last 20 generated)"
              className="p-1.5 rounded-lg hover:bg-neutral-800 text-neutral-400 hover:text-teal-300 transition-colors flex items-center gap-1"
            >
              <History className="w-4 h-4" />
              {historyCount > 0 && (
                <span className="hidden sm:inline text-[10px] font-mono px-1.5 py-0.2 rounded-md bg-neutral-800 border border-neutral-700 text-neutral-300">
                  {historyCount}
                </span>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Main Scramble Text Display */}
      <div className="w-full max-w-4xl px-4 py-2 sm:py-3 text-center">
        <p className="font-mono text-base sm:text-lg md:text-xl font-medium tracking-wide text-neutral-200 leading-relaxed select-all hover:text-white transition-colors">
          {scramble}
        </p>
      </div>

      {/* 2D Unfolded Facelets Preview (Optional & collapsible) */}
      {showPreviewModal && cube2D && (
        <div className="mt-2 mb-1 p-3 bg-neutral-900/90 border border-neutral-800 rounded-xl shadow-lg animate-in fade-in zoom-in-95 duration-150">
          <div className="text-[11px] text-neutral-400 mb-2 font-mono text-center">
            Scramble Verification (White Top · Green Front)
          </div>
          {/* Unfolded Net Grid Layout */}
          <div className="grid grid-cols-4 gap-2 w-fit mx-auto text-[9px] font-mono text-neutral-500">
            {/* Row 1: empty, Up (U), empty, empty */}
            <div></div>
            <FaceletGrid face={cube2D.U} label="U" />
            <div></div>
            <div></div>

            {/* Row 2: Left (L), Front (F), Right (R), Back (B) */}
            <FaceletGrid face={cube2D.L} label="L" />
            <FaceletGrid face={cube2D.F} label="F" />
            <FaceletGrid face={cube2D.R} label="R" />
            <FaceletGrid face={cube2D.B} label="B" />

            {/* Row 3: empty, Down (D), empty, empty */}
            <div></div>
            <FaceletGrid face={cube2D.D} label="D" />
            <div></div>
            <div></div>
          </div>
        </div>
      )}
    </div>
  );
};

// Render single 3x3 face net
const FaceletGrid: React.FC<{ face: ColorCode[][]; label: string }> = ({ face, label }) => {
  return (
    <div className="flex flex-col items-center">
      <div className="grid grid-cols-3 gap-0.5 p-1 bg-neutral-950 border border-neutral-800 rounded-sm">
        {face.map((row, r) =>
          row.map((cell, c) => (
            <div
              key={`${r}-${c}`}
              className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-[1.5px] border border-black/40"
              style={{ backgroundColor: COLOR_MAP[cell] }}
            />
          ))
        )}
      </div>
      <span className="mt-0.5 text-[10px] text-neutral-400">{label}</span>
    </div>
  );
};
