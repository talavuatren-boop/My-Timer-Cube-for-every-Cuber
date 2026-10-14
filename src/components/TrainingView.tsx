import React, { useState, useEffect } from 'react';
import { AlgorithmCase, AppSettings, Solve } from '../types/cube';
import { ALGORITHM_DATABASE } from '../lib/algorithmsData';
import { loadCustomCases, loadCommunityCases } from '../lib/storage';
import { Cube3D } from './Cube3D';
import { CubeDiagram } from './CubeDiagram';
import { Timer } from './Timer';
import {
  Shuffle,
  ArrowRight,
  ArrowLeft,
  Eye,
  EyeOff,
  CheckCircle,
  Zap,
  RotateCcw,
  BookOpen,
  Filter,
  Check,
  X,
  Target,
  Trophy,
} from 'lucide-react';

interface TrainingViewProps {
  settings: AppSettings;
  activeSessionId: string;
}

export const TrainingView: React.FC<TrainingViewProps> = ({ settings, activeSessionId }) => {
  const [trainingMode, setTrainingMode] = useState<
    'all' | 'pll' | 'oll' | 'f2l' | '2look-pll' | '2look-oll' | 'custom'
  >('pll');
  const [currentCase, setCurrentCase] = useState<AlgorithmCase | null>(null);
  const [showAlgorithm, setShowAlgorithm] = useState(false);
  const [caseIndex, setCaseIndex] = useState(0);

  // Drill statistics tracked independently from primary solve session
  const [drillSolves, setDrillSolves] = useState<Record<string, number[]>>({});
  const [streakCount, setStreakCount] = useState(0);

  // Pool of cases based on mode
  const currentPool = React.useMemo(() => {
    const custom = loadCustomCases();
    const all = [...ALGORITHM_DATABASE, ...custom];
    if (trainingMode === 'all') return all;
    if (trainingMode === 'custom') return custom.length > 0 ? custom : ALGORITHM_DATABASE;
    return all.filter((a) => a.category === trainingMode);
  }, [trainingMode]);

  // Pick random case from active category
  const pickRandomCase = () => {
    if (currentPool.length > 0) {
      const idx = Math.floor(Math.random() * currentPool.length);
      setCaseIndex(idx);
      setCurrentCase(currentPool[idx]);
      setShowAlgorithm(false);
    }
  };

  const nextCase = () => {
    if (currentPool.length > 0) {
      const nextIdx = (caseIndex + 1) % currentPool.length;
      setCaseIndex(nextIdx);
      setCurrentCase(currentPool[nextIdx]);
      setShowAlgorithm(false);
    }
  };

  const prevCase = () => {
    if (currentPool.length > 0) {
      const prevIdx = (caseIndex - 1 + currentPool.length) % currentPool.length;
      setCaseIndex(prevIdx);
      setCurrentCase(currentPool[prevIdx]);
      setShowAlgorithm(false);
    }
  };

  useEffect(() => {
    pickRandomCase();
  }, [trainingMode]);

  const handleSolveComplete = (solve: Solve) => {
    if (!currentCase) return;
    setDrillSolves((prev) => {
      const times = prev[currentCase.id] || [];
      return {
        ...prev,
        [currentCase.id]: [solve.time, ...times],
      };
    });
    setStreakCount((prev) => prev + 1);
  };

  const currentCaseTimes = currentCase ? drillSolves[currentCase.id] || [] : [];
  const currentBest = currentCaseTimes.length > 0 ? Math.min(...currentCaseTimes) : null;

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-6 flex flex-col items-center gap-6 text-neutral-100">
      {/* Training Navigation & Mode Selection */}
      <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-3 border-b border-neutral-800 pb-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight">CFOP Algorithm Trainer</h2>
          <p className="text-xs text-neutral-400 mt-0.5">
            Test instant pattern recognition and muscle memory. Recognition diagram shown first; reveal algorithm on demand.
          </p>
        </div>

        {/* Categories selector */}
        <div className="flex items-center gap-1.5 p-1 bg-neutral-900 rounded-2xl border border-neutral-800 text-xs overflow-x-auto scrollbar-none max-w-full">
          {[
            { id: 'pll', label: 'PLL (21)' },
            { id: 'oll', label: 'OLL (57)' },
            { id: 'f2l', label: 'F2L (41)' },
            { id: '2look-pll', label: '2-Look PLL' },
            { id: '2look-oll', label: '2-Look OLL' },
            { id: 'custom', label: 'My Cases' },
            { id: 'all', label: 'Mixed' },
          ].map((m) => (
            <button
              key={m.id}
              onClick={() => setTrainingMode(m.id as any)}
              className={`px-3 py-1.5 rounded-xl font-medium transition-colors whitespace-nowrap shrink-0 ${
                trainingMode === m.id
                  ? 'bg-neutral-800 text-teal-300 font-bold border border-teal-500/30'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Flashcard Card */}
      {currentCase && (
        <div className="w-full max-w-2xl bg-neutral-900/70 border border-neutral-800 rounded-3xl p-5 sm:p-6 shadow-2xl flex flex-col items-center gap-5">
          {/* Card Top Information */}
          <div className="w-full flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-teal-500/15 border border-teal-500/30 text-teal-300 uppercase">
                {currentCase.category}
              </span>
              <span className="font-bold text-sm sm:text-base text-neutral-100">
                {currentCase.name}
              </span>
            </div>

            {/* Streak Counter */}
            <div className="flex items-center gap-1.5 text-xs text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-xl border border-amber-500/30">
              <Trophy className="w-3.5 h-3.5" />
              <span>Streak: {streakCount}</span>
            </div>
          </div>

          {/* Visual Recognition Diagram */}
          <div className="flex flex-col items-center gap-2 my-2">
            <CubeDiagram caseData={currentCase} size={150} />
            <span className="text-[11px] text-neutral-400 font-mono">
              Recognize case & execute algorithm
            </span>
          </div>

          {/* Hidden / Revealed Algorithm Bar */}
          <div className="w-full">
            {showAlgorithm ? (
              <div className="p-4 bg-neutral-950 rounded-2xl border border-teal-500/30 flex flex-col items-center gap-1.5 animate-in fade-in duration-150">
                <span className="text-[11px] text-teal-400 font-semibold uppercase tracking-wider">
                  Solving Algorithm
                </span>
                <p className="font-mono text-sm sm:text-base font-bold text-neutral-100 text-center select-all">
                  {currentCase.algorithm}
                </p>
                {currentCase.alternativeAlgorithms && currentCase.alternativeAlgorithms.length > 0 && (
                  <span className="text-[11px] text-neutral-500 font-mono">
                    Alt: {currentCase.alternativeAlgorithms[0]}
                  </span>
                )}
              </div>
            ) : (
              <button
                onClick={() => setShowAlgorithm(true)}
                className="w-full py-3.5 bg-neutral-950/80 hover:bg-neutral-950 border border-neutral-800 rounded-2xl text-xs font-semibold text-neutral-300 hover:text-teal-300 flex items-center justify-center gap-2 transition-all group"
              >
                <Eye className="w-4 h-4 text-neutral-500 group-hover:text-teal-400" />
                <span>Tap to Reveal Algorithm</span>
              </button>
            )}
          </div>

          {/* Navigation & Controls */}
          <div className="w-full flex items-center justify-between pt-2 border-t border-neutral-800 text-xs">
            <button
              onClick={prevCase}
              className="px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 flex items-center gap-1.5 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Prev</span>
            </button>

            <button
              onClick={pickRandomCase}
              className="px-4 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <Shuffle className="w-3.5 h-3.5" />
              <span>Random</span>
            </button>

            <button
              onClick={nextCase}
              className="px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 flex items-center gap-1.5 transition-colors"
            >
              <span>Next</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Drill Solve Timer Section */}
      {currentCase && (
        <div className="w-full max-w-xl flex flex-col items-center gap-3">
          <div className="flex items-center gap-2 text-xs text-neutral-400">
            <Zap className="w-3.5 h-3.5 text-teal-400" />
            <span>Time your execution of this case:</span>
            {currentBest !== null && (
              <span className="font-mono text-teal-400 font-bold ml-1">
                PB: {(currentBest / 1000).toFixed(2)}s
              </span>
            )}
          </div>

          <div className="w-full p-4 bg-neutral-900/40 border border-neutral-800 rounded-3xl flex justify-center">
            <Timer
              currentScramble={currentCase.setupScramble || currentCase.algorithm}
              puzzle="3x3"
              settings={settings}
              activeSessionId={`drill_${activeSessionId}`}
              bestSingleTime={currentBest}
              onSolveComplete={handleSolveComplete}
              lastSolve={null}
              isZenMode={false}
              setIsZenMode={() => {}}
            />
          </div>
        </div>
      )}
    </div>
  );
};
