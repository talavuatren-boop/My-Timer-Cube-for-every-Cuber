import React, { useState } from 'react';
import { AlgorithmCase } from '../types/cube';
import { Cube3D } from './Cube3D';
import { CubeDiagram } from './CubeDiagram';
import {
  validateAlgorithmNotation,
  validateCaseAlgorithm,
  deriveSetupScramble,
} from '../lib/caseValidator';
import {
  createCfopSolvedCube,
  applyAlgorithm,
  getTopLayerSideColors,
  getSideYellowFromCube,
  derivePllArrowsFromState,
  getTopColorsMatrix,
} from '../lib/cubeModel';
import {
  X,
  Check,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Save,
  Eye,
  FileCode,
} from 'lucide-react';

interface CaseEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveCase: (newCase: AlgorithmCase) => void;
  initialCase?: AlgorithmCase | null;
}

export const CaseEditorModal: React.FC<CaseEditorModalProps> = ({
  isOpen,
  onClose,
  onSaveCase,
  initialCase,
}) => {
  const [name, setName] = useState(initialCase?.name || '');
  const [category, setCategory] = useState<'oll' | 'pll' | 'f2l' | 'coll' | 'cross' | 'zbll' | 'custom'>(
    (initialCase?.category as any) || 'custom'
  );
  const [group, setGroup] = useState(initialCase?.group || 'Custom Collection');
  const [algorithm, setAlgorithm] = useState(initialCase?.algorithm || "R U R' U'");
  const [setupScramble, setSetupScramble] = useState(
    initialCase?.setupScramble || deriveSetupScramble(initialCase?.algorithm || "R U R' U'")
  );
  const [notes, setNotes] = useState(initialCase?.notes || '');
  const [isPublic, setIsPublic] = useState(initialCase?.isPublic ?? false);
  const [tagsInput, setTagsInput] = useState(initialCase?.tags?.join(', ') || 'speedcubing');
  const [validationError, setValidationError] = useState<string | null>(null);
  const [previewTab, setPreviewTab] = useState<'3d' | '2d'>('3d');
  const [autoSyncSetup, setAutoSyncSetup] = useState(true);

  if (!isOpen) return null;

  // Auto derive setup scramble from solving algorithm
  const handleAutoDeriveSetup = (customAlg?: string) => {
    const target = customAlg || algorithm;
    if (!target.trim()) return;
    try {
      const derived = deriveSetupScramble(target);
      setSetupScramble(derived);
    } catch {}
  };

  const handleValidateAndSave = () => {
    setValidationError(null);

    if (!name.trim()) {
      setValidationError('Please enter a case name.');
      return;
    }

    const algVal = validateAlgorithmNotation(algorithm);
    if (!algVal.isValid) {
      setValidationError(`Algorithm error: ${algVal.error}`);
      return;
    }

    const setupVal = validateAlgorithmNotation(setupScramble);
    if (!setupVal.isValid) {
      setValidationError(`Setup scramble error: ${setupVal.error}`);
      return;
    }

    // Verify mathematical relation
    const caseVal = validateCaseAlgorithm(setupScramble, algorithm);
    if (!caseVal.isValid) {
      setValidationError(caseVal.error || 'Invalid algorithm combination.');
      return;
    }

    // Calculate exact mathematical unsolved vector state (colors, side indicators, arrows)
    const finalSetup = setupVal.tokens.join(' ');
    let precomputedTopColors: string[][] | undefined = undefined;
    let precomputedSideColors: any = undefined;
    let precomputedSideYellow: any = undefined;
    let precomputedPllArrows: any = undefined;

    try {
      const unsolved = applyAlgorithm(createCfopSolvedCube(), finalSetup);
      const isTopAllYellow = unsolved.U.every((row) => row.every((c) => c === 'Y'));

      if (category === 'zbll') {
        precomputedTopColors = unsolved.U.map((row) => row.map((c) => (c === 'Y' ? 'Y' : 'N')));
        precomputedSideColors = getTopLayerSideColors(unsolved);
        precomputedSideYellow = getSideYellowFromCube(unsolved);
        precomputedPllArrows = derivePllArrowsFromState(unsolved);
      } else if (category === 'pll' || isTopAllYellow) {
        precomputedTopColors = [
          ['Y', 'Y', 'Y'],
          ['Y', 'Y', 'Y'],
          ['Y', 'Y', 'Y'],
        ];
        precomputedSideColors = getTopLayerSideColors(unsolved);
        precomputedPllArrows = derivePllArrowsFromState(unsolved);
      } else if (category === 'oll') {
        precomputedTopColors = unsolved.U.map((row) => row.map((c) => (c === 'Y' ? 'Y' : 'N')));
        precomputedSideYellow = getSideYellowFromCube(unsolved);
      } else {
        precomputedTopColors = getTopColorsMatrix(unsolved);
      }
    } catch {
      // fallback
    }

    const newCase: AlgorithmCase = {
      id: initialCase?.id || `custom_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      name: name.trim(),
      category: category,
      subCategory: category,
      caseNumber: initialCase?.caseNumber || 'CUST',
      group: group.trim() || 'Custom',
      algorithm: algVal.tokens.join(' '),
      alternativeAlgorithms: initialCase?.alternativeAlgorithms || [],
      setupScramble: finalSetup,
      topColors: precomputedTopColors,
      sideColors: precomputedSideColors,
      sideYellow: precomputedSideYellow,
      pllArrows: precomputedPllArrows,
      notes: notes.trim(),
      tags: tagsInput.split(',').map((t) => t.trim()).filter(Boolean),
      isCustom: true,
      author: 'You (Local)',
      authorId: 'local_user',
      isPublic,
      likesCount: initialCase?.likesCount || 0,
      createdAt: initialCase?.createdAt || Date.now(),
      updatedAt: Date.now(),
    };

    onSaveCase(newCase);
    onClose();
  };

  // Mock temp case for 2D diagram preview (always reflecting current unsolved state)
  const previewCase: AlgorithmCase = {
    id: 'preview',
    name: name || 'Preview',
    category,
    subCategory: category,
    caseNumber: '0',
    algorithm: algorithm || "R U R' U'",
    setupScramble: setupScramble || "U R U' R'",
    alternativeAlgorithms: [],
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-3xl bg-neutral-900 border border-neutral-800 rounded-3xl p-5 sm:p-6 shadow-2xl flex flex-col gap-4 text-neutral-100 max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-teal-500/15 border border-teal-500/30 flex items-center justify-center text-teal-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base sm:text-lg">
                {initialCase ? 'Edit Case' : 'Create Custom Case'}
              </h3>
              <p className="text-[11px] text-neutral-400">
                Design custom speedcubing cases with mathematically validated algorithms.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-neutral-800 text-neutral-400 hover:text-neutral-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Validation Alert */}
        {validationError && (
          <div className="p-3 bg-red-500/15 border border-red-500/40 rounded-xl flex items-center gap-2 text-xs text-red-300">
            <AlertTriangle className="w-4 h-4 shrink-0 text-red-400" />
            <span>{validationError}</span>
          </div>
        )}

        {/* Content Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Left: Input Form */}
          <div className="flex flex-col gap-3">
            <div>
              <label className="text-xs font-medium text-neutral-300 block mb-1">
                Case Name *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. My Fast PLL Diagonal, T-Perm Mirror"
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-neutral-100 placeholder-neutral-500 outline-hidden focus:border-teal-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs font-medium text-neutral-300 block mb-1">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-neutral-100 outline-hidden focus:border-teal-500"
                >
                  <option value="custom">Custom</option>
                  <option value="pll">PLL</option>
                  <option value="oll">OLL</option>
                  <option value="f2l">F2L</option>
                  <option value="coll">COLL</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-medium text-neutral-300 block mb-1">
                  Group / Tag
                </label>
                <input
                  type="text"
                  value={group}
                  onChange={(e) => setGroup(e.target.value)}
                  placeholder="e.g. G-Perms, Dot OLL"
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-neutral-100 placeholder-neutral-500 outline-hidden focus:border-teal-500"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-medium text-neutral-300">
                  Solving Algorithm *
                </label>
                <span className="text-[10px] text-neutral-500">WCA Notation</span>
              </div>
              <input
                type="text"
                value={algorithm}
                onChange={(e) => {
                  const val = e.target.value;
                  setAlgorithm(val);
                  if (autoSyncSetup && val.trim()) {
                    handleAutoDeriveSetup(val);
                  }
                }}
                placeholder="e.g. R U R' U' R' F R2 U' R' U' R U R' F'"
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs font-mono text-teal-300 placeholder-neutral-500 outline-hidden focus:border-teal-500"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-medium text-neutral-300">
                  Setup Scramble *
                </label>
                <div className="flex items-center gap-2">
                  <label className="text-[10px] text-neutral-400 flex items-center gap-1 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={autoSyncSetup}
                      onChange={(e) => setAutoSyncSetup(e.target.checked)}
                      className="w-3 h-3 accent-teal-500 rounded"
                    />
                    <span>Auto-sync</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => handleAutoDeriveSetup()}
                    className="text-[11px] text-teal-400 hover:underline flex items-center gap-1"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Invert</span>
                  </button>
                </div>
              </div>
              <input
                type="text"
                value={setupScramble}
                onChange={(e) => {
                  setSetupScramble(e.target.value);
                  setAutoSyncSetup(false);
                }}
                placeholder="Moves that set up this case state from solved..."
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs font-mono text-amber-300 placeholder-neutral-500 outline-hidden focus:border-teal-500"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-neutral-300 block mb-1">
                Personal Notes / Fingertricks
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                placeholder="Add execution cues, push/flick notes, or grip hints..."
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-neutral-100 placeholder-neutral-500 outline-hidden focus:border-teal-500 resize-none"
              />
            </div>

            <div className="flex items-center justify-between p-2.5 bg-neutral-950 rounded-xl border border-neutral-800">
              <div>
                <span className="text-xs font-medium text-neutral-200 block">
                  Publish to Community
                </span>
                <span className="text-[10px] text-neutral-500">
                  Allow other cubers to browse and save your custom case.
                </span>
              </div>
              <input
                type="checkbox"
                checked={isPublic}
                onChange={(e) => setIsPublic(e.target.checked)}
                className="w-4 h-4 accent-teal-500 cursor-pointer"
              />
            </div>
          </div>

          {/* Right: Live Interactive Preview */}
          <div className="flex flex-col gap-2.5 bg-neutral-950/60 p-4 rounded-2xl border border-neutral-800/80 items-center justify-between">
            <div className="w-full flex items-center justify-between">
              <span className="text-xs font-semibold text-neutral-300">
                Case State Preview
              </span>
              <div className="flex items-center gap-1 bg-neutral-900 p-0.5 rounded-lg border border-neutral-800 text-xs">
                <button
                  type="button"
                  onClick={() => setPreviewTab('3d')}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors ${
                    previewTab === '3d'
                      ? 'bg-neutral-800 text-teal-300 font-semibold'
                      : 'text-neutral-400'
                  }`}
                >
                  3D View
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewTab('2d')}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors ${
                    previewTab === '2d'
                      ? 'bg-neutral-800 text-teal-300 font-semibold'
                      : 'text-neutral-400'
                  }`}
                >
                  2D Vector
                </button>
              </div>
            </div>

            {/* Display */}
            <div className="w-full flex items-center justify-center my-auto py-2">
              {previewTab === '3d' ? (
                <Cube3D
                  scramble={setupScramble}
                  category={category}
                  height={240}
                  className="w-full"
                  interactiveControls={false}
                />
              ) : (
                <div className="flex flex-col items-center gap-2 py-4">
                  <CubeDiagram caseData={previewCase} size={150} />
                  <span className="text-[11px] text-neutral-400 font-mono">
                    Vector Top View
                  </span>
                </div>
              )}
            </div>

            <p className="text-[11px] text-neutral-500 text-center leading-relaxed">
              Applying Setup: <span className="text-neutral-300 font-mono">{setupScramble || '(none)'}</span>
            </p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-neutral-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs bg-neutral-800 hover:bg-neutral-700 text-neutral-300 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleValidateAndSave}
            className="px-5 py-2 rounded-xl text-xs bg-teal-600 hover:bg-teal-500 text-white font-semibold transition-colors flex items-center gap-1.5 shadow-sm"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save Case</span>
          </button>
        </div>
      </div>
    </div>
  );
};
