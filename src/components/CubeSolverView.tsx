import React, { useState, useMemo } from 'react';
import { Cube3D } from './Cube3D';
import { solveCubeStage, SolveStageType, StageSolution } from '../lib/cubeSolver';
import { generate3x3Scramble } from '../lib/scrambler';
import { validateAlgorithmNotation } from '../lib/caseValidator';
import { ScrambleHistoryItem } from '../types/cube';
import {
  Shuffle,
  RotateCcw,
  Sparkles,
  Layers,
  Copy,
  Check,
  History,
  AlertTriangle,
  Play,
  ArrowRight,
  ChevronDown,
  Info,
  Sliders,
  CheckCircle2,
  Bookmark,
} from 'lucide-react';

interface CubeSolverViewProps {
  scrambleHistoryItems?: ScrambleHistoryItem[];
  onOpenScrambleHistory?: () => void;
  onUseScrambleInTimer?: (scramble: string) => void;
}

export const CubeSolverView: React.FC<CubeSolverViewProps> = ({
  scrambleHistoryItems = [],
  onOpenScrambleHistory,
  onUseScrambleInTimer,
}) => {
  // Scramble state
  const [currentScramble, setCurrentScramble] = useState<string>(
    "R U R' U' R' F R2 U' R' U' R U R' F'"
  );
  const [inputScramble, setInputScramble] = useState<string>(
    "R U R' U' R' F R2 U' R' U' R U R' F'"
  );
  const [validationError, setValidationError] = useState<string | null>(null);
  const [copiedSolution, setCopiedSolution] = useState(false);
  const [copiedScramble, setCopiedScramble] = useState(false);

  // Selected stage: cross | cross_f2l | cross_f2l_oll | full_cfop | cross_f2l_zbll
  const [selectedStage, setSelectedStage] = useState<SolveStageType>('cross_f2l_zbll');

  // Playback speed
  const [activeSpeed, setActiveSpeed] = useState<number>(1);

  // Quick Preset Scrambles
  const presets = [
    { label: 'T-Perm (PLL)', alg: "R U R' U' R' F R2 U' R' U' R U R' F'" },
    { label: 'Sune (OLL)', alg: "R U R' U R U2 R'" },
    { label: 'Anti-Sune', alg: "R U2 R' U' R U' R'" },
    { label: 'J-Perm (Jb)', alg: "R U R' F' R U R' U' R' F R2 U' R'" },
    { label: 'U-Perm (Ua)', alg: "R U' R U R U R U' R' U' R2" },
    { label: 'H-Perm (M2)', alg: 'M2 U M2 U2 M2 U M2' },
    { label: 'Checkerboard', alg: 'M2 E2 S2' },
    { label: 'Superflip', alg: "U R2 F B R B2 R U2 L B2 R U' D' R2 F R' L B2 U2 F2" },
  ];

  // Compute Stage Solution whenever scramble or selectedStage changes
  const solution: StageSolution = useMemo(() => {
    return solveCubeStage(currentScramble, selectedStage);
  }, [currentScramble, selectedStage]);

  // Generate a standard WCA random 3x3 scramble
  const handleGenerateRandom = () => {
    const scr = generate3x3Scramble(21);
    setCurrentScramble(scr);
    setInputScramble(scr);
    setValidationError(null);
  };

  // Apply custom scramble text input
  const handleApplyCustom = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputScramble.trim()) return;

    const val = validateAlgorithmNotation(inputScramble);
    if (!val.isValid) {
      setValidationError(val.error || 'Invalid scramble notation.');
      return;
    }

    setValidationError(null);
    setCurrentScramble(val.tokens.join(' '));
  };

  const handleSelectPreset = (alg: string) => {
    setCurrentScramble(alg);
    setInputScramble(alg);
    setValidationError(null);
  };

  const handleResetToSolved = () => {
    setCurrentScramble('');
    setInputScramble('');
    setValidationError(null);
  };

  const handleCopySolution = () => {
    if (!solution.movesString) return;
    navigator.clipboard.writeText(solution.movesString);
    setCopiedSolution(true);
    setTimeout(() => setCopiedSolution(false), 2000);
  };

  const handleCopyScramble = () => {
    if (!currentScramble) return;
    navigator.clipboard.writeText(currentScramble);
    setCopiedScramble(true);
    setTimeout(() => setCopiedScramble(false), 2000);
  };

  // Determine mask mode for 3D Cube based on selected stage
  const cubeMaskMode = useMemo<'cross' | 'f2l' | 'none'>(() => {
    if (selectedStage === 'cross') return 'cross';
    if (selectedStage === 'cross_f2l') return 'f2l';
    return 'none';
  }, [selectedStage]);

  const stagesList: {
    id: SolveStageType;
    label: string;
    badge: string;
    desc: string;
    icon: string;
  }[] = [
    {
      id: 'cross',
      label: 'Cross Only',
      badge: 'Stage 1',
      desc: 'Solves White Cross on the bottom (D) face and stops. All non-cross cubies blackened in Focus mode for maximum clarity.',
      icon: '✝',
    },
    {
      id: 'cross_f2l',
      label: 'Cross + F2L',
      badge: 'Stage 1 + 2',
      desc: 'Solves White Cross and all 4 First Two Layer corner-edge slots. Last Layer is untouched and ready for drill.',
      icon: '📐',
    },
    {
      id: 'cross_f2l_oll',
      label: 'Cross + F2L + OLL',
      badge: 'Stage 1 + 2 + 3',
      desc: 'Solves Cross, F2L, and orients all top yellow stickers (OLL), stopping right before the PLL stage.',
      icon: '☀️',
    },
    {
      id: 'full_cfop',
      label: 'Full CFOP',
      badge: '4-Stage CFOP',
      desc: 'Complete Fridrich solve: White Cross → 4 F2L Pairs → OLL Orientation → PLL Permutation.',
      icon: '🏆',
    },
    {
      id: 'cross_f2l_zbll',
      label: 'Cross + F2L + 1-Look ZBLL',
      badge: '1-Look ZBLL',
      desc: 'Direct 1-look ZBLL speedcubing algorithm from 472 verified cases. Solves the entire last layer in a single formula!',
      icon: '⚡',
    },
  ];

  return (
    <div className="w-full max-w-7xl mx-auto px-2 sm:px-4 py-3 sm:py-6 flex flex-col gap-4 sm:gap-6 pb-24 md:pb-12 text-slate-100">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-neutral-900/90 border border-neutral-800 p-3.5 sm:p-5 rounded-2xl sm:rounded-3xl shadow-xl backdrop-blur-md">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-xl bg-teal-500/20 text-teal-300 border border-teal-500/30 text-xs font-mono font-bold">
              3D SOLVER
            </span>
            <h1 className="text-lg sm:text-2xl font-bold tracking-tight text-white font-display">
              3D Rubik's Cube Solver
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-neutral-400 mt-1 max-w-2xl">
            Choose exactly which stages to solve. Watch realistic 3D animations, move notation,
            step-by-step breakdowns, and test manual cube rotations.
          </p>
        </div>

        {/* Action Buttons: Scramble History & Use in Timer */}
        <div className="flex items-center gap-2 shrink-0">
          {onOpenScrambleHistory && (
            <button
              onClick={onOpenScrambleHistory}
              className="px-3 py-1.5 rounded-xl bg-neutral-800/90 hover:bg-neutral-700/90 border border-neutral-700/80 text-xs font-semibold text-neutral-300 hover:text-white flex items-center gap-1.5 transition-colors shadow-xs"
              title="View the last 20 generated scrambles"
            >
              <History className="w-3.5 h-3.5 text-teal-400" />
              <span>Scramble History</span>
            </button>
          )}

          {onUseScrambleInTimer && currentScramble && (
            <button
              onClick={() => onUseScrambleInTimer(currentScramble)}
              className="px-3 py-1.5 rounded-xl bg-teal-600/20 hover:bg-teal-600/30 border border-teal-500/40 text-xs font-semibold text-teal-300 hover:text-teal-200 flex items-center gap-1.5 transition-colors shadow-xs"
              title="Send this scramble to the main speedcubing timer"
            >
              <ArrowRight className="w-3.5 h-3.5" />
              <span>Use in Timer</span>
            </button>
          )}
        </div>
      </div>

      {/* Stage Selector Bar: Cross, Cross+F2L, Cross+F2L+OLL, Full CFOP, Cross+F2L+ZBLL */}
      <div className="bg-neutral-900/90 border border-neutral-800 p-3 sm:p-4 rounded-2xl sm:rounded-3xl shadow-lg flex flex-col gap-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-teal-400" />
            <span className="text-xs sm:text-sm font-bold text-neutral-200 uppercase tracking-wider font-display">
              Target Solving Stage
            </span>
          </div>
          <span className="text-[11px] text-teal-400 font-medium hidden sm:inline">
            Solves only chosen stage &amp; stops accurately
          </span>
        </div>

        {/* Stage selection buttons */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
          {stagesList.map((st) => {
            const isSelected = selectedStage === st.id;
            return (
              <button
                key={st.id}
                onClick={() => setSelectedStage(st.id)}
                className={`p-2.5 sm:p-3 rounded-xl border text-left flex flex-col gap-1 transition-all active:scale-[0.98] ${
                  isSelected
                    ? 'bg-teal-500/15 border-teal-500/60 shadow-md ring-1 ring-teal-500/30 text-white'
                    : 'bg-neutral-850/60 hover:bg-neutral-800 border-neutral-750 text-neutral-300 hover:text-white'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="text-xs font-bold flex items-center gap-1.5">
                    <span>{st.icon}</span>
                    <span>{st.label}</span>
                  </span>
                  {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-teal-400 shrink-0" />}
                </div>
                <span className="text-[10px] text-neutral-400 line-clamp-1 font-mono">
                  {st.badge}
                </span>
              </button>
            );
          })}
        </div>

        {/* Selected Stage Explanation Banner */}
        {stagesList.find((s) => s.id === selectedStage) && (
          <div className="mt-1 p-2.5 rounded-xl bg-neutral-950/70 border border-neutral-800/80 text-xs text-neutral-300 flex items-start gap-2">
            <Info className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
            <div className="flex flex-col gap-0.5">
              <span className="font-semibold text-white">
                {stagesList.find((s) => s.id === selectedStage)?.label}:
              </span>
              <span className="text-neutral-400 text-[11px] leading-relaxed">
                {stagesList.find((s) => s.id === selectedStage)?.desc}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Main Solver Grid: 3D Cube Canvas on Left/Top, Controls & Moves on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 items-start">
        {/* Left Column (3D Cube Canvas & Interactive Controls) */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          {/* 3D Cube Card */}
          <div className="bg-neutral-900/90 border border-neutral-800 p-3 sm:p-4 rounded-2xl sm:rounded-3xl shadow-xl flex flex-col">
            <div className="flex items-center justify-between mb-2 px-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-neutral-300">3D Simulation</span>
                {cubeMaskMode !== 'none' && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    Focus Mode Active
                  </span>
                )}
              </div>
              <span className="text-[11px] text-neutral-400 font-mono">
                Drag to rotate view | Play to animate
              </span>
            </div>

            {/* 3D Scene */}
            <div className="w-full rounded-2xl overflow-hidden border border-neutral-800/80 bg-neutral-950">
              <Cube3D
                key={`${currentScramble}_${selectedStage}`}
                scramble={currentScramble}
                algorithm={solution.movesString}
                category={selectedStage === 'cross' ? 'cross' : selectedStage === 'cross_f2l' ? 'f2l' : ''}
                maskMode={cubeMaskMode}
                autoplay={false}
                speed={activeSpeed}
                onSpeedChange={setActiveSpeed}
                interactiveControls={true}
                height={380}
              />
            </div>
          </div>

          {/* Quick Presets Drawer */}
          <div className="bg-neutral-900/80 border border-neutral-800 p-3 sm:p-4 rounded-2xl shadow-lg flex flex-col gap-2">
            <div className="flex items-center justify-between text-xs text-neutral-300">
              <span className="font-bold uppercase tracking-wider text-[11px] text-neutral-400 font-display">
                Preset Scrambles &amp; Patterns
              </span>
              <span className="text-[11px] text-neutral-500 font-mono">One-click test</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {presets.map((p) => (
                <button
                  key={p.label}
                  onClick={() => handleSelectPreset(p.alg)}
                  className={`px-2.5 py-1 rounded-xl text-xs font-medium transition-all ${
                    currentScramble === p.alg
                      ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40 shadow-xs'
                      : 'bg-neutral-800/80 text-neutral-300 hover:text-white hover:bg-neutral-700/80 border border-neutral-700/60'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column (Scramble Editor, Solution Moves & Step-by-Step Breakdown) */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          {/* Scramble Input Card */}
          <div className="bg-neutral-900/90 border border-neutral-800 p-3.5 sm:p-4 rounded-2xl sm:rounded-3xl shadow-xl flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-neutral-300 uppercase tracking-wider font-display">
                Scramble Input
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={handleGenerateRandom}
                  className="px-2.5 py-1 rounded-xl bg-teal-600/20 hover:bg-teal-600/30 text-teal-300 border border-teal-500/30 text-xs font-semibold flex items-center gap-1 transition-colors active:scale-95 shadow-xs"
                  title="Generate standard WCA 21-move random scramble"
                >
                  <Shuffle className="w-3.5 h-3.5" />
                  <span>Random</span>
                </button>
                <button
                  onClick={handleResetToSolved}
                  className="px-2 py-1 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white border border-neutral-700 text-xs transition-colors"
                  title="Reset to Solved Cube"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Input Form */}
            <form onSubmit={handleApplyCustom} className="flex flex-col gap-2">
              <div className="relative">
                <textarea
                  value={inputScramble}
                  onChange={(e) => {
                    setInputScramble(e.target.value);
                    if (validationError) setValidationError(null);
                  }}
                  rows={2}
                  placeholder="Enter moves: R U R' U' F2 B2 L D..."
                  className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 focus:border-teal-500 rounded-xl font-mono text-xs text-neutral-100 placeholder-neutral-500 focus:outline-hidden transition-colors resize-none scrollbar-none"
                />
              </div>

              {validationError && (
                <div className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{validationError}</span>
                </div>
              )}

              <div className="flex items-center justify-between gap-2">
                <button
                  type="submit"
                  className="px-3 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-semibold text-xs flex items-center gap-1.5 transition-colors shadow-xs active:scale-95"
                >
                  <Play className="w-3 h-3 fill-current" />
                  <span>Apply Scramble</span>
                </button>

                <button
                  type="button"
                  onClick={handleCopyScramble}
                  disabled={!currentScramble}
                  className="px-2.5 py-1.5 rounded-xl bg-neutral-800/80 hover:bg-neutral-750 text-neutral-300 hover:text-white text-xs font-medium flex items-center gap-1 transition-colors"
                >
                  {copiedScramble ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedScramble ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            </form>
          </div>

          {/* Solution Summary Card */}
          <div className="bg-neutral-900/90 border border-neutral-800 p-3.5 sm:p-4 rounded-2xl sm:rounded-3xl shadow-xl flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-bold text-white uppercase tracking-wider font-display">
                  Solution Moves
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-full text-[11px] font-mono font-bold bg-teal-500/20 text-teal-300 border border-teal-500/30">
                  {solution.moveCount} moves
                </span>
                <button
                  onClick={handleCopySolution}
                  disabled={!solution.movesString}
                  className="p-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white transition-colors"
                  title="Copy Solution Algorithm"
                >
                  {copiedSolution ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {/* Algorithm text box */}
            <div className="p-3 bg-neutral-950 border border-neutral-800 rounded-xl font-mono text-xs text-neutral-200 select-all leading-relaxed max-h-32 overflow-y-auto scrollbar-thin">
              {solution.movesString ? solution.movesString : '(No moves needed - already at target state)'}
            </div>

            {/* Step-by-Step Breakdown Accordion */}
            {solution.steps.length > 0 && (
              <div className="flex flex-col gap-2 pt-2 border-t border-neutral-800/80">
                <div className="flex items-center justify-between text-xs text-neutral-400">
                  <span className="font-semibold text-neutral-300">Phase Breakdown:</span>
                  <span className="text-[11px] font-mono">{solution.steps.length} Steps</span>
                </div>

                <div className="flex flex-col gap-1.5 max-h-72 overflow-y-auto pr-1 scrollbar-thin">
                  {solution.steps.map((st, idx) => (
                    <div
                      key={st.id || idx}
                      className="p-2.5 rounded-xl bg-neutral-950/70 border border-neutral-800/80 flex flex-col gap-1 hover:border-neutral-700 transition-colors"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-teal-300 flex items-center gap-1.5">
                          <span className="w-4 h-4 rounded-full bg-teal-500/20 border border-teal-500/40 text-[10px] font-mono flex items-center justify-center text-teal-300">
                            {idx + 1}
                          </span>
                          <span>{st.name}</span>
                        </span>
                        <span className="text-[10px] font-mono text-neutral-400">
                          {st.moves.length} moves
                        </span>
                      </div>
                      <div className="font-mono text-xs text-neutral-300 select-all bg-neutral-900/60 p-1.5 rounded-lg border border-neutral-850">
                        {st.movesString}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
