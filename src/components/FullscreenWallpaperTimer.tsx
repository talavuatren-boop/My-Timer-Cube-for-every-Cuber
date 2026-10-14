import React, { useState, useEffect } from 'react';
import { AppSettings, Solve, PuzzleType, PenaltyType, TimerBackgroundSettings } from '../types/cube';
import { Timer } from './Timer';
import {
  X,
  Eye,
  EyeOff,
  Sparkles,
  Maximize2,
  Minimize2,
  Sliders,
  Camera,
  Clock,
} from 'lucide-react';

interface FullscreenWallpaperTimerProps {
  isOpen: boolean;
  onClose: () => void;
  backgroundPhotoDataUrl: string | null;
  settings: AppSettings;
  puzzle: PuzzleType;
  currentScramble: string;
  activeSessionId: string;
  bestSingleTime: number | null;
  lastSolve: Solve | null;
  onSolveComplete: (solve: Solve) => void;
  onDeleteLastSolve?: (id: string) => void;
  onUpdateLastSolvePenalty?: (id: string, penalty: PenaltyType) => void;
  onUpdateLastSolveComment?: (id: string, comment: string) => void;
  onUpdateBackgroundSettings: (bgSettings: TimerBackgroundSettings) => void;
  onOpenPhotoModal: () => void;
}

export const FullscreenWallpaperTimer: React.FC<FullscreenWallpaperTimerProps> = ({
  isOpen,
  onClose,
  backgroundPhotoDataUrl,
  settings,
  puzzle,
  currentScramble,
  activeSessionId,
  bestSingleTime,
  lastSolve,
  onSolveComplete,
  onDeleteLastSolve,
  onUpdateLastSolvePenalty,
  onUpdateLastSolveComment,
  onUpdateBackgroundSettings,
  onOpenPhotoModal,
}) => {
  const [showScramble, setShowScramble] = useState(
    settings.appearance.backgroundPhoto.showScrambleInFullscreen ?? true
  );
  const [showTimer, setShowTimer] = useState(
    settings.appearance.backgroundPhoto.showTimerInFullscreen ?? true
  );
  const [preserveOriginal, setPreserveOriginal] = useState(
    settings.appearance.backgroundPhoto.preserveOriginalColors ?? true
  );

  // Press Escape to exit fullscreen wallpaper mode
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const bg = settings.appearance.backgroundPhoto;

  return (
    <div className="fixed inset-0 z-50 w-screen h-screen overflow-hidden flex flex-col justify-between bg-black select-none animate-in fade-in duration-200">
      {/* Edge-to-Edge Wallpaper Image */}
      {backgroundPhotoDataUrl ? (
        <>
          <img
            src={backgroundPhotoDataUrl}
            alt="Custom Wallpaper"
            className="absolute inset-0 w-full h-full object-cover pointer-events-none select-none"
            style={{
              filter: preserveOriginal
                ? 'none'
                : `blur(${bg.blur}px) brightness(${bg.brightness}%)`,
              opacity: preserveOriginal ? 1 : bg.opacity / 100,
            }}
          />
          {/* Optional dimming overlay only if NOT preserving original colors */}
          {!preserveOriginal && bg.overlayDarkness > 0 && (
            <div
              className="absolute inset-0 pointer-events-none"
              style={{ backgroundColor: `rgba(0,0,0,${bg.overlayDarkness / 100})` }}
            />
          )}
        </>
      ) : (
        <div className="absolute inset-0 bg-neutral-950" />
      )}

      {/* Top Floating Controls Bar */}
      <div className="relative z-20 w-full px-4 py-3 flex items-start justify-between gap-4">
        {/* Scramble Display (Collapsible) */}
        <div className="flex-1 max-w-2xl">
          {showScramble && (
            <div className="bg-black/60 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/10 text-center shadow-lg">
              <span className="text-[10px] uppercase font-mono text-neutral-400 block tracking-wider">
                {puzzle} Scramble
              </span>
              <p className="font-mono text-sm sm:text-base font-semibold text-white drop-shadow-md tracking-wide select-all">
                {currentScramble}
              </p>
            </div>
          )}
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5 bg-black/60 backdrop-blur-md p-1.5 rounded-2xl border border-white/10 shadow-lg shrink-0">
          {/* Scramble visibility toggle */}
          <button
            onClick={() => {
              const next = !showScramble;
              setShowScramble(next);
              onUpdateBackgroundSettings({
                ...bg,
                showScrambleInFullscreen: next,
              });
            }}
            title={showScramble ? 'Hide Scramble' : 'Show Scramble'}
            className="p-2 rounded-xl text-neutral-300 hover:text-white hover:bg-white/10 transition-colors"
          >
            {showScramble ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4 text-neutral-500" />}
          </button>

          {/* Timer visibility toggle */}
          <button
            onClick={() => {
              const next = !showTimer;
              setShowTimer(next);
              onUpdateBackgroundSettings({
                ...bg,
                showTimerInFullscreen: next,
              });
            }}
            title={showTimer ? 'Hide Timer Display' : 'Show Timer Display'}
            className={`p-2 rounded-xl transition-colors ${
              showTimer
                ? 'text-neutral-300 hover:text-white hover:bg-white/10'
                : 'text-amber-400 bg-amber-500/20 border border-amber-500/30'
            }`}
          >
            <Clock className="w-4 h-4" />
          </button>

          {/* Original Colors / Filter Toggle */}
          <button
            onClick={() => {
              const next = !preserveOriginal;
              setPreserveOriginal(next);
              onUpdateBackgroundSettings({
                ...bg,
                preserveOriginalColors: next,
              });
            }}
            title={
              preserveOriginal
                ? 'Original Photo Active (100% Clear, 0 Blur, 0 Tint)'
                : 'Custom Blur / Dimming Filter Active'
            }
            className={`px-2.5 py-1 rounded-xl text-xs font-medium transition-colors flex items-center gap-1 ${
              preserveOriginal
                ? 'bg-rose-500/30 text-rose-200 border border-rose-500/50'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">
              {preserveOriginal ? 'Original 100%' : 'Filtered'}
            </span>
          </button>

          {/* Change Photo */}
          <button
            onClick={onOpenPhotoModal}
            title="Change Background Photo"
            className="p-2 rounded-xl text-neutral-300 hover:text-white hover:bg-white/10 transition-colors"
          >
            <Camera className="w-4 h-4" />
          </button>

          {/* Exit Fullscreen Button */}
          <button
            onClick={onClose}
            title="Exit Fullscreen Wallpaper Mode (Esc)"
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <Minimize2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Center High-Precision Timer */}
      <div className={`relative z-20 flex-1 flex items-center justify-center my-auto w-full transition-opacity duration-200 ${!showTimer ? 'opacity-0 hover:opacity-80' : 'opacity-100'}`}>
        <Timer
          currentScramble={currentScramble}
          puzzle={puzzle}
          settings={settings}
          activeSessionId={activeSessionId}
          bestSingleTime={bestSingleTime}
          onSolveComplete={onSolveComplete}
          onDeleteLastSolve={onDeleteLastSolve}
          onUpdateLastSolvePenalty={onUpdateLastSolvePenalty}
          onUpdateLastSolveComment={onUpdateLastSolveComment}
          lastSolve={lastSolve}
          isZenMode={false}
          setIsZenMode={() => {}}
          backgroundPhotoDataUrl={null} // Already rendered edge-to-edge
        />
      </div>

      {/* Bottom Minimal Hint */}
      <div className="relative z-20 w-full px-4 py-2 flex items-center justify-between text-[11px] text-white/50 font-mono">
        <span>Fullscreen Mode · Press Esc or top-right button to exit</span>
        <span>Hold Space / touch screen to start</span>
      </div>
    </div>
  );
};
