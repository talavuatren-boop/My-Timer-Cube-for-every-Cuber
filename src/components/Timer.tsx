import React, { useState, useEffect, useRef, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { TimerStatus, Solve, PenaltyType, AppSettings, PuzzleType } from '../types/cube';
import { formatTime } from '../lib/stats';
import {
  playReadyBeep,
  playStartSound,
  playStopSound,
  playInspection8s,
  playInspection12s,
  playPbFanfare,
  triggerHaptic,
} from '../lib/audio';
import {
  Sparkles,
  Trash2,
  Plus,
  MessageSquare,
  Check,
  X,
  Camera,
  Heart,
} from 'lucide-react';

interface TimerProps {
  currentScramble: string;
  puzzle: PuzzleType;
  settings: AppSettings;
  activeSessionId: string;
  bestSingleTime: number | null;
  onSolveComplete: (solve: Solve) => void;
  onDeleteLastSolve?: (id: string) => void;
  onUpdateLastSolvePenalty?: (id: string, penalty: PenaltyType) => void;
  onUpdateLastSolveComment?: (id: string, comment: string) => void;
  lastSolve?: Solve | null;
  isZenMode: boolean;
  setIsZenMode: (zen: boolean) => void;
  backgroundPhotoDataUrl?: string | null;
  onOpenPhotoModal?: () => void;
  onLaunchFullscreenWallpaper?: () => void;
}

export const Timer: React.FC<TimerProps> = ({
  currentScramble,
  puzzle,
  settings,
  activeSessionId,
  bestSingleTime,
  onSolveComplete,
  onDeleteLastSolve,
  onUpdateLastSolvePenalty,
  onUpdateLastSolveComment,
  lastSolve,
  isZenMode,
  setIsZenMode,
  backgroundPhotoDataUrl,
  onOpenPhotoModal,
  onLaunchFullscreenWallpaper,
}) => {
  const [timerStatus, setTimerStatus] = useState<TimerStatus>('idle');
  const [displayTime, setDisplayTime] = useState<number>(0);
  const [inspectionCountdown, setInspectionCountdown] = useState<number>(15);
  const [isPb, setIsPb] = useState(false);
  const [showCommentInput, setShowCommentInput] = useState(false);
  const [commentText, setCommentText] = useState('');

  // High precision time tracking using refs
  const startTimeRef = useRef<number>(0);
  const animFrameIdRef = useRef<number | null>(null);
  const holdTimeoutRef = useRef<number | null>(null);
  const inspectionIntervalRef = useRef<number | null>(null);
  const inspectionStartRef = useRef<number>(0);
  const inspectionDurationRef = useRef<number>(0);
  const inspectionPenaltyRef = useRef<PenaltyType>('none');

  // Sound warning flags during inspection
  const played8sRef = useRef(false);
  const played12sRef = useRef(false);

  // Status ref for synchronous event handling
  const statusRef = useRef<TimerStatus>('idle');
  statusRef.current = timerStatus;

  // Touch & Key hold tracking
  const isPointerDownRef = useRef(false);
  const isKeyDownRef = useRef(false);

  // Keep display time in sync when idle
  useEffect(() => {
    if (timerStatus === 'idle') {
      setDisplayTime(lastSolve ? lastSolve.rawTime : 0);
    }
  }, [lastSolve, timerStatus]);

  // Clean up RAF and timeouts on unmount
  useEffect(() => {
    return () => {
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
      if (holdTimeoutRef.current) clearTimeout(holdTimeoutRef.current);
      if (inspectionIntervalRef.current) clearInterval(inspectionIntervalRef.current);
    };
  }, []);

  // Timer loop using requestAnimationFrame + performance.now()
  const startSolveTimer = useCallback(() => {
    if (settings.sound.soundEnabled) {
      playStartSound(settings.sound.volume);
    }
    if (settings.sound.vibration) {
      triggerHaptic(20);
    }

    // Calculate inspection penalty if inspection was active
    let penalty: PenaltyType = 'none';
    if (inspectionStartRef.current > 0) {
      const inspectionDuration = performance.now() - inspectionStartRef.current;
      inspectionDurationRef.current = inspectionDuration;
      const elapsedSec = inspectionDuration / 1000;
      if (elapsedSec > 17) {
        penalty = 'dnf';
      } else if (elapsedSec > 15) {
        penalty = '+2';
      }
    } else {
      inspectionDurationRef.current = 0;
    }
    inspectionPenaltyRef.current = penalty;

    // Reset inspection timer
    inspectionStartRef.current = 0;
    if (inspectionIntervalRef.current) {
      clearInterval(inspectionIntervalRef.current);
      inspectionIntervalRef.current = null;
    }

    startTimeRef.current = performance.now();
    statusRef.current = 'running';
    setTimerStatus('running');
    setIsPb(false);

    if (settings.timer.zenModeOnRun) {
      setIsZenMode(true);
    }

    const updateTimer = () => {
      const now = performance.now();
      const elapsed = Math.round(now - startTimeRef.current);
      setDisplayTime(elapsed);
      animFrameIdRef.current = requestAnimationFrame(updateTimer);
    };

    animFrameIdRef.current = requestAnimationFrame(updateTimer);
  }, [settings, setIsZenMode]);

  // Stop solve timer
  const stopSolveTimer = useCallback(() => {
    if (animFrameIdRef.current) {
      cancelAnimationFrame(animFrameIdRef.current);
      animFrameIdRef.current = null;
    }

    const endTime = performance.now();
    const finalRawTime = Math.round(endTime - startTimeRef.current);
    setDisplayTime(finalRawTime);

    statusRef.current = 'stopped';
    setTimerStatus('stopped');
    setIsZenMode(false);

    if (settings.sound.soundEnabled) {
      playStopSound(settings.sound.volume);
    }
    if (settings.sound.vibration) {
      triggerHaptic([30, 40, 30]);
    }

    const assignedPenalty = inspectionPenaltyRef.current;
    const effectiveTime = assignedPenalty === '+2' ? finalRawTime + 2000 : finalRawTime;

    // Check personal best
    const isNewPb =
      assignedPenalty !== 'dnf' &&
      (bestSingleTime === null || effectiveTime < bestSingleTime);
    setIsPb(isNewPb);

    if (isNewPb && settings.sound.pbSound && settings.sound.soundEnabled) {
      playPbFanfare(settings.sound.volume);
    }

    if (isNewPb && settings.stats.confettiOnPb) {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#10b981', '#fbbf24', '#06b6d4', '#8b5cf6'],
        });
      } catch {
        // Ignore confetti error
      }
    }

    // Save solve exactly once
    const newSolve: Solve = {
      id: 'solve_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      time: effectiveTime,
      rawTime: finalRawTime,
      penalty: assignedPenalty,
      scramble: currentScramble,
      timestamp: Date.now(),
      sessionId: activeSessionId,
      puzzle,
      inspectionTimeMs:
        inspectionDurationRef.current > 0
          ? Math.round(inspectionDurationRef.current)
          : undefined,
    };

    onSolveComplete(newSolve);
  }, [
    activeSessionId,
    bestSingleTime,
    currentScramble,
    onSolveComplete,
    puzzle,
    settings,
    setIsZenMode,
  ]);

  // Start WCA Inspection Countdown
  const startInspection = useCallback(() => {
    statusRef.current = 'inspecting';
    setTimerStatus('inspecting');
    setInspectionCountdown(15);
    inspectionStartRef.current = performance.now();
    played8sRef.current = false;
    played12sRef.current = false;

    if (inspectionIntervalRef.current) clearInterval(inspectionIntervalRef.current);

    inspectionIntervalRef.current = window.setInterval(() => {
      const elapsedSec = (performance.now() - inspectionStartRef.current) / 1000;
      const remainingSec = Math.max(0, Math.ceil(15 - elapsedSec));
      setInspectionCountdown(remainingSec);

      // 8-second alert
      if (elapsedSec >= 8 && !played8sRef.current) {
        played8sRef.current = true;
        if (settings.sound.soundEnabled && settings.sound.inspectionWarnings) {
          playInspection8s(settings.sound.volume);
        }
        if (settings.sound.vibration) triggerHaptic(40);
      }

      // 12-second alert
      if (elapsedSec >= 12 && !played12sRef.current) {
        played12sRef.current = true;
        if (settings.sound.soundEnabled && settings.sound.inspectionWarnings) {
          playInspection12s(settings.sound.volume);
        }
        if (settings.sound.vibration) triggerHaptic([50, 40, 50]);
      }
    }, 100);
  }, [settings]);

  // Handle Press Down (Keyboard Space or Mouse / Touch)
  const handlePressDown = useCallback(() => {
    const current = statusRef.current;

    // 1. If currently RUNNING:
    if (current === 'running') {
      const elapsed = performance.now() - startTimeRef.current;
      // Guard against accidental release artifacts: require at least 200ms
      if (elapsed < 200) {
        return;
      }
      stopSolveTimer();
      return;
    }

    // 2. If STOPPED -> reset to idle
    if (current === 'stopped') {
      statusRef.current = 'idle';
      setTimerStatus('idle');
      return;
    }

    // 3. WCA Inspection enabled and currently IDLE -> start inspection countdown
    if (settings.timer.wcaInspection && current === 'idle') {
      startInspection();
      return;
    }

    // 4. In inspection mode -> prepare to start solve
    if (current === 'inspecting') {
      if (settings.timer.holdToStart) {
        statusRef.current = 'inspecting_holding';
        setTimerStatus('inspecting_holding');

        if (holdTimeoutRef.current) clearTimeout(holdTimeoutRef.current);
        holdTimeoutRef.current = window.setTimeout(() => {
          if (statusRef.current === 'inspecting_holding') {
            statusRef.current = 'inspecting_ready';
            setTimerStatus('inspecting_ready');
            if (settings.sound.soundEnabled) playReadyBeep(settings.sound.volume);
            if (settings.sound.vibration) triggerHaptic(20);
          }
        }, settings.timer.holdDelayMs);
      } else {
        statusRef.current = 'inspecting_ready';
        setTimerStatus('inspecting_ready');
      }
      return;
    }

    // 5. Normal timer start from IDLE
    if (current === 'idle') {
      if (settings.timer.holdToStart) {
        statusRef.current = 'holding';
        setTimerStatus('holding');

        if (holdTimeoutRef.current) clearTimeout(holdTimeoutRef.current);
        holdTimeoutRef.current = window.setTimeout(() => {
          if (statusRef.current === 'holding') {
            statusRef.current = 'ready';
            setTimerStatus('ready');
            if (settings.sound.soundEnabled) playReadyBeep(settings.sound.volume);
            if (settings.sound.vibration) triggerHaptic(20);
          }
        }, settings.timer.holdDelayMs);
      } else {
        statusRef.current = 'ready';
        setTimerStatus('ready');
      }
    }
  }, [settings, startInspection, stopSolveTimer]);

  // Handle Release (Spaceup or Touchend)
  // CRITICAL RULE: Releasing the screen MUST NEVER stop a running solve!
  const handlePressUp = useCallback(() => {
    const current = statusRef.current;

    // If running, do absolutely nothing on release
    if (current === 'running') {
      return;
    }

    if (holdTimeoutRef.current) {
      clearTimeout(holdTimeoutRef.current);
      holdTimeoutRef.current = null;
    }

    // Released while in READY state -> START SOLVE!
    if (current === 'ready' || current === 'inspecting_ready') {
      startSolveTimer();
      return;
    }

    // Released too early while HOLDING -> return to idle / inspecting
    if (current === 'holding') {
      statusRef.current = 'idle';
      setTimerStatus('idle');
      return;
    }

    if (current === 'inspecting_holding') {
      statusRef.current = 'inspecting';
      setTimerStatus('inspecting');
      return;
    }
  }, [startSolveTimer]);

  // Keyboard events listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in an input, textarea, or select
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLSelectElement
      ) {
        return;
      }

      if (e.code === 'Space' && !e.repeat) {
        e.preventDefault();
        if (!isKeyDownRef.current) {
          isKeyDownRef.current = true;
          handlePressDown();
        }
      }

      // Escape to cancel inspection or running solve
      if (e.code === 'Escape') {
        if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
        if (inspectionIntervalRef.current) clearInterval(inspectionIntervalRef.current);
        statusRef.current = 'idle';
        setTimerStatus('idle');
        setIsZenMode(false);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        isKeyDownRef.current = false;
        handlePressUp();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [handlePressDown, handlePressUp, setIsZenMode]);

  // Get color styles for current timer state
  const getTimerColorClass = () => {
    switch (timerStatus) {
      case 'holding':
      case 'inspecting_holding':
        return 'text-amber-500 scale-[0.98] transition-transform duration-100';
      case 'ready':
      case 'inspecting_ready':
        return 'text-emerald-400 scale-[1.02] drop-shadow-[0_0_25px_rgba(16,185,129,0.45)] transition-all duration-150';
      case 'running':
        return 'text-cyan-400';
      case 'stopped':
        return isPb
          ? 'text-amber-400 drop-shadow-[0_0_25px_rgba(251,191,36,0.35)]'
          : settings.appearance.theme === 'light'
          ? 'text-slate-900'
          : 'text-neutral-100';
      case 'inspecting':
        return inspectionCountdown <= 3
          ? 'text-red-500 font-bold animate-pulse'
          : inspectionCountdown <= 7
          ? 'text-amber-400'
          : 'text-amber-300';
      default:
        return settings.appearance.theme === 'light' ? 'text-slate-900' : 'text-neutral-100';
    }
  };

  // Font family class
  const getFontFamilyClass = () => {
    switch (settings.timer.timerFont) {
      case 'Chakra Petch':
        return 'font-display';
      case 'Space Grotesk':
        return 'font-sans font-bold';
      case 'Inter':
        return 'font-sans font-semibold';
      case 'JetBrains Mono':
      default:
        return 'font-mono-timer';
    }
  };

  // Font size class with landscape, iPad, PC & laptop responsiveness
  const getFontSizeClass = () => {
    switch (settings.timer.timerSize) {
      case 'normal':
        return 'text-5xl sm:text-6xl md:text-7xl landscape:text-5xl sm:landscape:text-6xl md:landscape:text-7xl lg:landscape:text-8xl';
      case 'huge':
        return 'text-7xl sm:text-8xl md:text-9xl lg:text-[11rem] landscape:text-6xl sm:landscape:text-8xl md:landscape:text-9xl lg:landscape:text-[10rem]';
      case 'large':
      default:
        return 'text-6xl sm:text-7xl md:text-8xl lg:text-9xl landscape:text-5xl sm:landscape:text-7xl md:landscape:text-8xl lg:landscape:text-9xl';
    }
  };

  const hasCustomBackground =
    settings.appearance.backgroundPhoto.enabled &&
    Boolean(backgroundPhotoDataUrl);

  return (
    <div className="w-full flex-1 flex flex-col items-center justify-center select-none relative px-4 overflow-hidden rounded-3xl">
      {/* Custom Background Photo Layer (if enabled) */}
      {hasCustomBackground && backgroundPhotoDataUrl && (
        <>
          <div
            className="absolute inset-0 pointer-events-none transition-all duration-300"
            style={{
              backgroundImage: `url(${backgroundPhotoDataUrl})`,
              backgroundSize: settings.appearance.backgroundPhoto.fit || 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
              filter: settings.appearance.backgroundPhoto.preserveOriginalColors
                ? 'none'
                : `blur(${settings.appearance.backgroundPhoto.blur}px) brightness(${settings.appearance.backgroundPhoto.brightness}%)`,
              opacity: settings.appearance.backgroundPhoto.preserveOriginalColors
                ? 1
                : settings.appearance.backgroundPhoto.opacity / 100,
            }}
          />
          {/* Dimming overlay so timer digits remain readable (only when NOT preserving original colors) */}
          {!settings.appearance.backgroundPhoto.preserveOriginalColors &&
            settings.appearance.backgroundPhoto.overlayDarkness > 0 && (
              <div
                className="absolute inset-0 pointer-events-none transition-all duration-300"
                style={{
                  backgroundColor: `rgba(0, 0, 0, ${settings.appearance.backgroundPhoto.overlayDarkness / 100})`,
                }}
              />
            )}

          {/* Quick wallpaper action buttons floating in timer corner */}
          {!isZenMode && timerStatus === 'idle' && (
            <div className="absolute top-3 right-3 z-20 flex items-center gap-1.5 bg-black/50 backdrop-blur-md px-2.5 py-1 rounded-xl border border-white/10 text-xs">
              {onLaunchFullscreenWallpaper && (
                <button
                  onClick={onLaunchFullscreenWallpaper}
                  title="Launch Dedicated Fullscreen Wallpaper Mode"
                  className="flex items-center gap-1 text-white/80 hover:text-white transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5 text-rose-400" />
                  <span className="hidden sm:inline font-medium">Fullscreen Wallpaper</span>
                </button>
              )}
              {onOpenPhotoModal && (
                <button
                  onClick={onOpenPhotoModal}
                  title="Customize background photo settings"
                  className="p-1 text-white/60 hover:text-white transition-colors ml-1"
                >
                  <Camera className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          )}
        </>
      )}

      {/* Timer Touch Surface (encompasses center of screen for mobile & mouse) */}
      <div
        className="w-full max-w-2xl py-6 sm:py-14 landscape:py-2 sm:landscape:py-6 flex flex-col items-center justify-center cursor-pointer touch-timer-surface relative z-10"
        onMouseDown={(e) => {
          if (e.button === 0 && !isPointerDownRef.current) {
            isPointerDownRef.current = true;
            handlePressDown();
          }
        }}
        onMouseUp={(e) => {
          if (e.button === 0 && isPointerDownRef.current) {
            isPointerDownRef.current = false;
            handlePressUp();
          }
        }}
        onTouchStart={(e) => {
          // Prevent synthetic mousedown from firing on mobile browsers
          e.preventDefault();
          if (!isPointerDownRef.current) {
            isPointerDownRef.current = true;
            handlePressDown();
          }
        }}
        onTouchEnd={(e) => {
          e.preventDefault();
          if (isPointerDownRef.current) {
            isPointerDownRef.current = false;
            handlePressUp();
          }
        }}
      >
        {/* Inspection countdown indicator */}
        {(timerStatus === 'inspecting' ||
          timerStatus === 'inspecting_holding' ||
          timerStatus === 'inspecting_ready') && (
          <div className="flex flex-col items-center mb-3 animate-in fade-in duration-100">
            <span className="text-xs uppercase tracking-widest text-amber-500 font-semibold mb-1">
              Inspection
            </span>
            <span className="text-5xl sm:text-6xl font-bold font-mono text-amber-400">
              {inspectionCountdown}
            </span>
            <span className="text-xs text-neutral-400 mt-1">
              {timerStatus === 'inspecting_ready'
                ? 'READY! Release to start solve'
                : 'Hold Space / touch to ready'}
            </span>
          </div>
        )}

        {/* Status Hint Badge */}
        {timerStatus === 'holding' && (
          <span className="text-xs uppercase tracking-widest text-amber-500 font-semibold mb-2 animate-pulse">
            Hold...
          </span>
        )}
        {timerStatus === 'ready' && (
          <span className="text-xs uppercase tracking-widest text-emerald-400 font-semibold mb-2 animate-bounce">
            READY! Release to start
          </span>
        )}
        {isPb && timerStatus === 'stopped' && (
          <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-500/15 border border-amber-500/40 rounded-full text-amber-400 text-xs font-semibold mb-2 animate-bounce">
            <Sparkles className="w-3.5 h-3.5" />
            <span>NEW PERSONAL BEST!</span>
          </div>
        )}

        {/* Primary Timer Digits Display */}
        {!(
          timerStatus === 'inspecting' ||
          timerStatus === 'inspecting_holding' ||
          timerStatus === 'inspecting_ready'
        ) && (
          <div
            className={`tracking-tighter transition-colors select-none tabular-nums ${
              settings.appearance.theme === 'light'
                ? 'drop-shadow-xs'
                : 'drop-shadow-[0_4px_16px_rgba(0,0,0,0.8)]'
            } ${getFontFamilyClass()} ${getFontSizeClass()} ${getTimerColorClass()}`}
          >
            {formatTime(
              displayTime,
              lastSolve?.penalty && timerStatus === 'stopped'
                ? lastSolve.penalty
                : 'none'
            )}
          </div>
        )}

        {/* Minimal interaction prompt for first-time users */}
        {timerStatus === 'idle' && displayTime === 0 && (
          <p className="mt-4 text-xs sm:text-sm text-neutral-400 tracking-wide bg-neutral-900/60 px-3 py-1 rounded-full border border-neutral-800/80 backdrop-blur-xs">
            Hold{' '}
            <kbd className="px-1.5 py-0.5 rounded bg-neutral-800 border border-neutral-700 text-neutral-200 font-mono text-[11px]">
              Space
            </kbd>{' '}
            or touch surface to ready
          </p>
        )}
      </div>

      {/* Quick solve actions bar immediately following a solve */}
      {timerStatus === 'stopped' && lastSolve && !isZenMode && (
        <div className="mt-2 relative z-10 flex flex-wrap items-center justify-center gap-2 animate-in fade-in zoom-in-95 duration-150">
          {/* +2 Penalty Toggle */}
          <button
            onClick={() => {
              if (onUpdateLastSolvePenalty) {
                const nextPenalty: PenaltyType =
                  lastSolve.penalty === '+2' ? 'none' : '+2';
                onUpdateLastSolvePenalty(lastSolve.id, nextPenalty);
              }
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors flex items-center gap-1.5 ${
              lastSolve.penalty === '+2'
                ? 'bg-amber-500/20 border-amber-500/40 text-amber-400'
                : 'bg-neutral-900/90 border-neutral-800 text-neutral-400 hover:text-neutral-200 hover:border-neutral-700'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+2</span>
          </button>

          {/* DNF Penalty Toggle */}
          <button
            onClick={() => {
              if (onUpdateLastSolvePenalty) {
                const nextPenalty: PenaltyType =
                  lastSolve.penalty === 'dnf' ? 'none' : 'dnf';
                onUpdateLastSolvePenalty(lastSolve.id, nextPenalty);
              }
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors flex items-center gap-1.5 ${
              lastSolve.penalty === 'dnf'
                ? 'bg-red-500/20 border-red-500/40 text-red-400'
                : 'bg-neutral-900/90 border-neutral-800 text-neutral-400 hover:text-neutral-200 hover:border-neutral-700'
            }`}
          >
            <span>DNF</span>
          </button>

          {/* Add / Edit Comment */}
          <button
            onClick={() => {
              setCommentText(lastSolve.comment || '');
              setShowCommentInput(!showCommentInput);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors flex items-center gap-1.5 ${
              lastSolve.comment
                ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
                : 'bg-neutral-900/90 border-neutral-800 text-neutral-400 hover:text-neutral-200 hover:border-neutral-700'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>
              {lastSolve.comment ? 'Note: ' + lastSolve.comment : 'Note'}
            </span>
          </button>

          {/* Delete Solve */}
          <button
            onClick={() => {
              if (onDeleteLastSolve) {
                onDeleteLastSolve(lastSolve.id);
                setTimerStatus('idle');
                setDisplayTime(0);
              }
            }}
            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-neutral-900/90 border border-neutral-800 text-red-400 hover:bg-red-500/10 hover:border-red-500/30 transition-colors flex items-center gap-1.5"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete</span>
          </button>
        </div>
      )}

      {/* Comment Input Popover */}
      {showCommentInput && lastSolve && (
        <div className="mt-2 relative z-10 w-full max-w-sm flex items-center gap-2 p-1.5 bg-neutral-900 border border-neutral-800 rounded-xl shadow-lg animate-in fade-in duration-100">
          <input
            type="text"
            placeholder="Add note (e.g. PLL skip, lockup)..."
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                if (onUpdateLastSolveComment)
                  onUpdateLastSolveComment(lastSolve.id, commentText);
                setShowCommentInput(false);
              }
            }}
            className="flex-1 bg-transparent px-2.5 py-1 text-xs text-neutral-200 placeholder-neutral-500 outline-hidden"
            autoFocus
          />
          <button
            onClick={() => {
              if (onUpdateLastSolveComment)
                onUpdateLastSolveComment(lastSolve.id, commentText);
              setShowCommentInput(false);
            }}
            className="p-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white"
          >
            <Check className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setShowCommentInput(false)}
            className="p-1.5 rounded-lg hover:bg-neutral-800 text-neutral-400"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Optional Photo customization quick trigger */}
      {!isZenMode && onOpenPhotoModal && (
        <button
          onClick={onOpenPhotoModal}
          title={
            hasCustomBackground
              ? 'Customize background photo'
              : 'Add custom background photo (crush / gallery ❤️)'
          }
          className={`absolute bottom-2 right-2 p-2 rounded-xl border text-xs flex items-center gap-1.5 transition-all z-20 ${
            hasCustomBackground
              ? 'bg-rose-500/20 border-rose-500/40 text-rose-300 hover:bg-rose-500/30'
              : 'bg-neutral-900/60 border-neutral-800/80 text-neutral-500 hover:text-neutral-300 hover:bg-neutral-800'
          }`}
        >
          {hasCustomBackground ? (
            <Heart className="w-3.5 h-3.5 fill-current text-rose-400" />
          ) : (
            <Camera className="w-3.5 h-3.5" />
          )}
          <span className="hidden sm:inline text-[11px]">
            {hasCustomBackground ? 'Photo' : 'Bg Photo'}
          </span>
        </button>
      )}
    </div>
  );
};
