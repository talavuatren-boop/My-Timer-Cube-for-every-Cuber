import React, { useState } from 'react';
import { AlgorithmCase } from '../types/cube';
import { Cube3D } from './Cube3D';
import { CubeDiagram } from './CubeDiagram';
import {
  X,
  Copy,
  Check,
  Star,
  Maximize2,
  Minimize2,
  RotateCcw,
  BookOpen,
  User,
  Heart,
  Share2,
  Tag,
  CheckCircle2,
  Clock,
  Sparkles,
  Info,
} from 'lucide-react';

interface CaseDetailModalProps {
  caseData: AlgorithmCase | null;
  onClose: () => void;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
  learningStatus: 'unlearned' | 'learning' | 'mastered';
  onUpdateLearningStatus: (id: string, status: 'unlearned' | 'learning' | 'mastered') => void;
  onCopyCaseToMyCases?: (caseData: AlgorithmCase) => void;
  onEditCase?: (caseData: AlgorithmCase) => void;
}

export const CaseDetailModal: React.FC<CaseDetailModalProps> = ({
  caseData,
  onClose,
  isFavorite,
  onToggleFavorite,
  learningStatus,
  onUpdateLearningStatus,
  onCopyCaseToMyCases,
  onEditCase,
}) => {
  const [copiedAlg, setCopiedAlg] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'3d' | '2d'>('3d');
  const [copiedNotice, setCopiedNotice] = useState(false);
  const [selectedAlg, setSelectedAlg] = useState<string>(caseData?.algorithm || '');

  if (!caseData) return null;

  const currentAlg = selectedAlg || caseData.algorithm;
  const allAlgs = [caseData.algorithm, ...(caseData.alternativeAlgorithms || [])];

  const handleCopy = (alg: string) => {
    navigator.clipboard.writeText(alg);
    setCopiedAlg(alg);
    setTimeout(() => setCopiedAlg(null), 1800);
  };

  const handleCopyToMyCases = () => {
    if (onCopyCaseToMyCases) {
      onCopyCaseToMyCases(caseData);
      setCopiedNotice(true);
      setTimeout(() => setCopiedNotice(false), 2500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-3xl bg-neutral-900 border border-neutral-800 rounded-3xl p-5 sm:p-6 shadow-2xl flex flex-col gap-4 text-neutral-100 max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
          <div className="flex items-center gap-2.5">
            <span className="px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-teal-500/15 border border-teal-500/30 text-teal-300 uppercase">
              {caseData.category}
            </span>
            <div>
              <h3 className="font-bold text-base sm:text-lg text-white">
                {caseData.name}
              </h3>
              {caseData.group && (
                <span className="text-[11px] text-neutral-400 font-mono">
                  {caseData.group}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => onToggleFavorite(caseData.id)}
              className={`p-2 rounded-xl border transition-colors ${
                isFavorite
                  ? 'bg-amber-500/20 border-amber-500/40 text-amber-400'
                  : 'bg-neutral-800/80 border-neutral-700/80 text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <Star className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-neutral-200"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Learning Status Pill Selector */}
        <div className="flex items-center justify-between p-2.5 bg-neutral-950 rounded-2xl border border-neutral-800">
          <span className="text-xs text-neutral-400 font-medium">Training Mastery Status:</span>
          <div className="flex items-center gap-1">
            {(['unlearned', 'learning', 'mastered'] as const).map((st) => (
              <button
                key={st}
                onClick={() => onUpdateLearningStatus(caseData.id, st)}
                className={`px-3 py-1 rounded-xl text-xs font-semibold capitalize transition-all ${
                  learningStatus === st
                    ? st === 'mastered'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : st === 'learning'
                      ? 'bg-amber-600 text-white shadow-xs'
                      : 'bg-neutral-700 text-neutral-200'
                    : 'text-neutral-500 hover:text-neutral-300'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {/* Interactive Cube & Vector Diagram Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-neutral-950/70 p-4 rounded-2xl border border-neutral-800/80">
          {/* 3D Interactive Model */}
          <div className="flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-neutral-800/80 pb-4 md:pb-0 md:pr-4">
            <div className="w-full flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-neutral-300">
                3D Interactive Player
              </span>
              <span className="text-[10px] text-teal-400 font-mono">
                Drag to orbit · Play moves
              </span>
            </div>
            <Cube3D
              algorithm={currentAlg}
              scramble={caseData.setupScramble}
              category={caseData.category}
              height={260}
              className="w-full"
            />
          </div>

          {/* 2D Vector Recognition View */}
          <div className="flex flex-col items-center justify-center p-2">
            <span className="text-xs font-semibold text-neutral-300 mb-2">
              {caseData.category === 'f2l'
                ? 'F2L Front-Right Slot Recognition'
                : caseData.category === 'cross'
                ? 'White Cross (D-Face) Solution'
                : caseData.category === 'zbll'
                ? 'ZBLL Recognition (OLL Shape + PLL Permutation)'
                : caseData.category === 'pll' || caseData.category === '2look-pll'
                ? 'PLL Permutation Vector Diagram'
                : 'OLL Orientation Vector Diagram'}
            </span>
            <div className="my-auto py-2">
              <CubeDiagram caseData={caseData} size={160} />
            </div>
            <p className="text-[11px] text-neutral-500 text-center mt-2 font-mono">
              {caseData.category === 'f2l'
                ? 'Front-Right Slot & Active Pair highlighted (WCA Colors)'
                : caseData.category === 'cross'
                ? 'White D-face with center references and edge insertion vectors'
                : caseData.category === 'zbll'
                ? 'OLL corner orientation with 12-sticker PLL permutation recognition'
                : caseData.category === 'pll' || caseData.category === '2look-pll'
                ? '12 side recognition stickers with cycle arrows'
                : 'Authentic top & side yellow orientation indicators'}
            </p>
          </div>
        </div>

        {/* Algorithm Selection & Copying */}
        <div className="flex flex-col gap-2.5">
          <span className="text-xs font-semibold text-neutral-300">
            Recommended Speedcubing Algorithms:
          </span>

          <div className="flex flex-col gap-2">
            {allAlgs.map((alg, idx) => {
              const isPrimary = idx === 0;
              const isSelected = currentAlg === alg;

              return (
                <div
                  key={idx}
                  onClick={() => setSelectedAlg(alg)}
                  className={`p-3 rounded-xl border flex items-center justify-between gap-3 cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-teal-500/10 border-teal-500/40 text-teal-200'
                      : 'bg-neutral-950 border-neutral-800 text-neutral-300 hover:border-neutral-700'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-neutral-900 text-neutral-400">
                      {isPrimary ? 'Primary' : `Alt ${idx}`}
                    </span>
                    <span className="font-mono text-xs sm:text-sm font-semibold tracking-wide truncate">
                      {alg}
                    </span>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCopy(alg);
                    }}
                    className="p-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-300 transition-colors shrink-0"
                    title="Copy algorithm"
                  >
                    {copiedAlg === alg ? (
                      <Check className="w-3.5 h-3.5 text-teal-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Notes & Community Attribution if applicable */}
        {(caseData.notes || caseData.author) && (
          <div className="p-3 bg-neutral-950 rounded-xl border border-neutral-800 text-xs text-neutral-400 flex flex-col gap-1">
            {caseData.author && (
              <div className="flex items-center gap-1.5 text-neutral-300 font-medium">
                <User className="w-3.5 h-3.5 text-teal-400" />
                <span>Created by: {caseData.author}</span>
              </div>
            )}
            {caseData.notes && <p className="italic">{caseData.notes}</p>}
          </div>
        )}

        {/* Copied Notice Banner */}
        {copiedNotice && (
          <div className="p-2.5 rounded-xl bg-teal-500/15 border border-teal-500/30 text-teal-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>Saved as a copy to your "My Cases" library!</span>
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-neutral-800">
          <div className="flex items-center gap-2">
            {onCopyCaseToMyCases && (
              <button
                onClick={handleCopyToMyCases}
                className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-medium rounded-xl transition-colors flex items-center gap-1.5"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Copy to My Cases</span>
              </button>
            )}

            {caseData.isCustom && onEditCase && (
              <button
                onClick={() => {
                  onClose();
                  onEditCase(caseData);
                }}
                className="px-3 py-1.5 bg-teal-600/20 text-teal-300 hover:bg-teal-600/30 text-xs font-medium rounded-xl transition-colors"
              >
                Edit Case
              </button>
            )}
          </div>

          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold rounded-xl transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
