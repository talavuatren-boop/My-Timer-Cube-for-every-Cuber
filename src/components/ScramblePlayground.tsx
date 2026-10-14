import React, { useState } from 'react';
import { Cube3D } from './Cube3D';
import { SavedScramble } from '../types/cube';
import { generate3x3Scramble } from '../lib/scrambler';
import {
  loadSavedScrambles,
  saveSavedScrambles,
} from '../lib/storage';
import { validateAlgorithmNotation } from '../lib/caseValidator';
import {
  Shuffle,
  Play,
  RotateCcw,
  Sparkles,
  Bookmark,
  Plus,
  Trash2,
  Copy,
  Check,
  Upload,
  AlertTriangle,
  FolderOpen,
  Star,
  FileText,
} from 'lucide-react';

export const ScramblePlayground: React.FC = () => {
  // Current active scramble in playground
  const [currentScramble, setCurrentScramble] = useState<string>(
    "R U R' U' R' F R2 U' R' U' R U R' F'"
  );
  const [inputScramble, setInputScramble] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [savedScrambles, setSavedScrambles] = useState<SavedScramble[]>(loadSavedScrambles);
  const [activeTab, setActiveTab] = useState<'presets' | 'saved' | 'import'>('presets');

  // Input validation
  const [validationError, setValidationError] = useState<string | null>(null);

  // Multi-line import modal state
  const [multiLineText, setMultiLineText] = useState('');
  const [importNotice, setImportNotice] = useState<string | null>(null);

  // New Save title
  const [saveTitle, setSaveTitle] = useState('');
  const [showSavePrompt, setShowSavePrompt] = useState(false);

  // Generate a standard WCA random 3x3 scramble
  const handleGenerateRandom = () => {
    const scr = generate3x3Scramble(21);
    setCurrentScramble(scr);
    setInputScramble(scr);
    setValidationError(null);
  };

  // Apply custom scramble input
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

  // Quick Preset Scrambles
  const presets = [
    { label: 'Double Moves (R2 L2 D2 B2 M2 S2)', alg: 'R2 L2 D2 B2 M2 S2' },
    { label: 'Checkerboard (M2 E2 S2)', alg: 'M2 E2 S2' },
    { label: 'All 6 Faces Double (R2 L2 U2 D2 F2 B2)', alg: 'R2 L2 U2 D2 F2 B2' },
    { label: 'H-Perm (M2 U M2 U2 M2 U M2)', alg: 'M2 U M2 U2 M2 U M2' },
    { label: 'Z-Perm', alg: "M2 U M2 U M' U2 M2 U2 M'" },
    { label: 'T-Perm', alg: "R U R' U' R' F R2 U' R' U' R U R' F'" },
    { label: 'J-Perm (Jb)', alg: "R U R' F' R U R' U' R' F R2 U' R'" },
    { label: 'U-Perm (Ua)', alg: "R U' R U R U R U' R' U' R2" },
    { label: 'U-Perm (Ub)', alg: "R2 U R' U R' U' R U R U2 R'" },
    { label: 'Cube in a Cube', alg: "F L F U' R U F2 L2 U' L' B D' B' L2 U" },
    { label: 'Six Spots / Centers', alg: "U D' R L' F B' U D'" },
    { label: 'Sune', alg: "R U R' U R U2 R'" },
    { label: 'Anti-Sune', alg: "R U2 R' U' R U' R'" },
    { label: 'Sexy Move', alg: "R U R' U'" },
    { label: 'Superflip', alg: "U R2 F B R B2 R U2 L B2 R U' D' R2 F R' L B2 U2 F2" },
  ];

  const handleSelectPreset = (alg: string) => {
    setCurrentScramble(alg);
    setInputScramble(alg);
    setValidationError(null);
  };

  // Copy scramble
  const handleCopy = () => {
    navigator.clipboard.writeText(currentScramble);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  // Save Scramble
  const handleSaveCurrent = () => {
    if (!saveTitle.trim()) return;
    const val = validateAlgorithmNotation(currentScramble);
    if (!val.isValid) return;

    const newScramble: SavedScramble = {
      id: `scramble_${Date.now()}`,
      title: saveTitle.trim(),
      scramble: currentScramble,
      movesCount: val.tokens.length,
      category: 'Saved Scramble',
      createdAt: Date.now(),
      isFavorite: false,
    };

    const updated = [newScramble, ...savedScrambles];
    setSavedScrambles(updated);
    saveSavedScrambles(updated);
    setSaveTitle('');
    setShowSavePrompt(false);
  };

  // Toggle favorite saved scramble
  const handleToggleFavorite = (id: string) => {
    const updated = savedScrambles.map((s) =>
      s.id === id ? { ...s, isFavorite: !s.isFavorite } : s
    );
    setSavedScrambles(updated);
    saveSavedScrambles(updated);
  };

  // Delete saved scramble
  const handleDeleteSaved = (id: string) => {
    const updated = savedScrambles.filter((s) => s.id !== id);
    setSavedScrambles(updated);
    saveSavedScrambles(updated);
  };

  // Multiline Import Handler (one scramble per line)
  const handleImportMultiline = () => {
    setImportNotice(null);
    const lines = multiLineText
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l.length > 0 && !l.startsWith('//'));

    if (lines.length === 0) {
      setImportNotice('Please paste at least one valid scramble line.');
      return;
    }

    const imported: SavedScramble[] = [];
    let failedCount = 0;

    lines.forEach((line, idx) => {
      const val = validateAlgorithmNotation(line);
      if (val.isValid) {
        imported.push({
          id: `imported_${Date.now()}_${idx}`,
          title: `Imported #${idx + 1} (${val.tokens.length} moves)`,
          scramble: val.tokens.join(' '),
          movesCount: val.tokens.length,
          category: 'Imported',
          createdAt: Date.now(),
        });
      } else {
        failedCount++;
      }
    });

    if (imported.length > 0) {
      const updated = [...imported, ...savedScrambles];
      setSavedScrambles(updated);
      saveSavedScrambles(updated);
      setMultiLineText('');
      setImportNotice(
        `Successfully imported ${imported.length} scramble(s)! ${
          failedCount > 0 ? `(${failedCount} lines had invalid notation and were skipped)` : ''
        }`
      );
      setActiveTab('saved');
    } else {
      setImportNotice('No valid scrambles could be parsed from the provided input.');
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 py-4 sm:py-6 flex flex-col gap-6 text-neutral-100">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-800 pb-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight">3D Scramble Playground</h2>
          <p className="text-xs text-neutral-400 mt-0.5">
            Interactive virtual 3D cube with WCA scramble generator, presets, and move-by-move inspection.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleGenerateRandom}
            className="px-3.5 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
          >
            <Shuffle className="w-3.5 h-3.5" />
            <span>New Random Scramble</span>
          </button>
        </div>
      </div>

      {/* 3D Model & Active Controls Row (Side-by-Side on PC/Laptop/iPad, Stacked on Mobile) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Main 3D Canvas Box */}
        <div className="lg:col-span-7 bg-neutral-900/60 border border-neutral-800 rounded-3xl p-3 sm:p-6 shadow-2xl flex flex-col items-center justify-center">
          <Cube3D algorithm={currentScramble} height={400} className="w-full" />
        </div>

        {/* Active Scramble Notation Display & Actions */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <div className="w-full bg-neutral-900/80 border border-neutral-800 rounded-2xl p-4 flex flex-col gap-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="text-[11px] uppercase tracking-wider font-semibold text-neutral-400">
                  Active Scramble
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-neutral-800 text-teal-400 font-mono">
                  {currentScramble.split(/\s+/).filter(Boolean).length} moves
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={handleCopy}
                  className="text-xs text-neutral-400 hover:text-neutral-200 flex items-center gap-1 transition-colors px-2 py-1 rounded-lg hover:bg-neutral-800"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-teal-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>

                <button
                  onClick={() => setShowSavePrompt(!showSavePrompt)}
                  className="text-xs text-teal-400 hover:text-teal-300 flex items-center gap-1 transition-colors px-2 py-1 rounded-lg hover:bg-teal-500/10"
                >
                  <Bookmark className="w-3.5 h-3.5" />
                  <span>Save Scramble</span>
                </button>
              </div>
            </div>

            {/* Big Monospace Scramble Line */}
            <div className="font-mono text-sm sm:text-base text-neutral-200 bg-neutral-950 p-3 rounded-xl border border-neutral-800/80 select-all leading-relaxed break-words">
              {currentScramble}
            </div>

            {/* Save Title Prompt Input */}
            {showSavePrompt && (
              <div className="flex items-center gap-2 p-2 bg-neutral-950 rounded-xl border border-teal-500/30 animate-in fade-in duration-150">
                <input
                  type="text"
                  placeholder="Enter title for this scramble (e.g. Tough F2L Slot, 12-Move PB)..."
                  value={saveTitle}
                  onChange={(e) => setSaveTitle(e.target.value)}
                  className="flex-1 bg-transparent px-2 text-xs text-neutral-100 placeholder-neutral-500 outline-hidden"
                  autoFocus
                />
                <button
                  onClick={handleSaveCurrent}
                  disabled={!saveTitle.trim()}
                  className="px-3 py-1 bg-teal-600 hover:bg-teal-500 text-white rounded-lg text-xs font-medium disabled:opacity-40 transition-colors"
                >
                  Save
                </button>
              </div>
            )}

            {/* Custom Scramble Entry Bar */}
            <form onSubmit={handleApplyCustom} className="flex flex-col sm:flex-row gap-2 pt-1">
              <input
                type="text"
                placeholder="Enter custom scramble notation (e.g. R2 L2 D2 B2 M2 S2, B2 R F2 U' L2 B D2)..."
                value={inputScramble}
                onChange={(e) => setInputScramble(e.target.value)}
                className="flex-1 min-w-0 bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2 text-xs font-mono text-neutral-100 placeholder-neutral-500 outline-hidden focus:border-teal-500"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-xs font-semibold transition-colors shadow-xs shrink-0 whitespace-nowrap"
              >
                Apply to Cube
              </button>
            </form>

            {/* Quick Move Clicker Chips */}
            <div className="flex flex-col gap-2 pt-0.5">
              <div className="flex items-center gap-1 overflow-x-auto scrollbar-none pb-0.5 max-w-full text-[11px]">
                <span className="text-[10px] text-teal-400 font-mono font-semibold shrink-0 mr-1">Double (2x):</span>
                {['R2', 'L2', 'D2', 'B2', 'M2', 'S2', 'U2', 'F2', 'E2'].map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setInputScramble((prev) => (prev ? `${prev.trim()} ${m}` : m))}
                    className="px-2 py-0.5 rounded-md bg-teal-950/70 border border-teal-500/30 hover:bg-teal-900/80 text-teal-300 font-mono text-[11px] font-semibold active:scale-95 transition-all shrink-0"
                  >
                    +{m}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-1 overflow-x-auto scrollbar-none pb-0.5 max-w-full text-[11px]">
                <span className="text-[10px] text-neutral-400 font-mono shrink-0 mr-1">1x / Prime:</span>
                {['R', 'L', 'U', 'D', 'F', 'B', 'M', "R'", "L'", "U'", "D'", "F'", "B'", "M'"].map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setInputScramble((prev) => (prev ? `${prev.trim()} ${m}` : m))}
                    className="px-1.5 py-0.5 rounded-md bg-neutral-800/80 hover:bg-neutral-700 text-neutral-300 font-mono text-[11px] active:scale-95 transition-all shrink-0"
                  >
                    +{m}
                  </button>
                ))}
                {inputScramble && (
                  <button
                    type="button"
                    onClick={() => setInputScramble('')}
                    className="text-[10px] text-neutral-500 hover:text-red-400 ml-auto shrink-0 transition-colors pl-2"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>

            {validationError && (
              <p className="text-xs text-red-400 flex items-center gap-1.5 mt-0.5">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>{validationError}</span>
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Tabs: Presets vs Saved Scrambles vs Multiline Import */}
      <div className="w-full flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-2 border-b border-neutral-800 pb-2">
          <button
            onClick={() => setActiveTab('presets')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
              activeTab === 'presets'
                ? 'bg-neutral-800 text-teal-300'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            Quick Presets
          </button>
          <button
            onClick={() => setActiveTab('saved')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 ${
              activeTab === 'saved'
                ? 'bg-neutral-800 text-teal-300'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <span>Saved Scrambles</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-neutral-900 text-neutral-400">
              {savedScrambles.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('import')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 ${
              activeTab === 'import'
                ? 'bg-neutral-800 text-teal-300'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Upload className="w-3 h-3" />
            <span>Bulk Import</span>
          </button>
        </div>

        {/* Quick Presets Tab */}
        {activeTab === 'presets' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2.5">
            {presets.map((p) => (
              <button
                key={p.label}
                onClick={() => handleSelectPreset(p.alg)}
                className="p-3 bg-neutral-900/60 border border-neutral-800 hover:border-neutral-700 rounded-xl flex flex-col text-left transition-all hover:bg-neutral-850 group"
              >
                <span className="text-xs font-bold text-neutral-200 group-hover:text-teal-400 transition-colors">
                  {p.label}
                </span>
                <span className="text-[10px] text-neutral-500 font-mono truncate mt-1">
                  {p.alg}
                </span>
              </button>
            ))}
          </div>
        )}

        {/* Saved Scrambles Tab */}
        {activeTab === 'saved' && (
          <div className="flex flex-col gap-2">
            {savedScrambles.length === 0 ? (
              <div className="p-8 text-center text-xs text-neutral-500 bg-neutral-900/30 rounded-2xl border border-neutral-800/60">
                No saved scrambles yet. Enter or generate a scramble above and click "Save Scramble"!
              </div>
            ) : (
              savedScrambles.map((s) => (
                <div
                  key={s.id}
                  onClick={() => handleSelectPreset(s.scramble)}
                  className="p-3 bg-neutral-900/70 border border-neutral-800/80 hover:border-neutral-700 rounded-xl flex items-center justify-between gap-3 cursor-pointer group transition-all"
                >
                  <div className="flex flex-col gap-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-neutral-200 group-hover:text-teal-400 transition-colors">
                        {s.title}
                      </span>
                      <span className="text-[10px] font-mono text-neutral-500 px-1.5 py-0.5 rounded bg-neutral-950">
                        {s.movesCount} moves
                      </span>
                    </div>
                    <span className="text-xs text-neutral-400 font-mono truncate">
                      {s.scramble}
                    </span>
                  </div>

                  <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => handleToggleFavorite(s.id)}
                      className="p-1.5 text-neutral-500 hover:text-amber-400 transition-colors rounded-lg hover:bg-neutral-800"
                    >
                      <Star
                        className={`w-3.5 h-3.5 ${s.isFavorite ? 'text-amber-400 fill-current' : ''}`}
                      />
                    </button>
                    <button
                      onClick={() => handleDeleteSaved(s.id)}
                      className="p-1.5 text-neutral-500 hover:text-red-400 transition-colors rounded-lg hover:bg-red-500/10"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Bulk Multiline Import Tab */}
        {activeTab === 'import' && (
          <div className="flex flex-col gap-3 p-4 bg-neutral-900/60 border border-neutral-800 rounded-2xl">
            <div>
              <h4 className="text-xs font-semibold text-neutral-200">
                Import Scrambles (One Per Line)
              </h4>
              <p className="text-[11px] text-neutral-400 mt-0.5">
                Paste scrambles from cstimer, WCA competition sheets or training files.
              </p>
            </div>

            <textarea
              rows={4}
              value={multiLineText}
              onChange={(e) => setMultiLineText(e.target.value)}
              placeholder="R2 U' F2 D B2 R2 D' L2 U R2 D F' L B2 R' D' U2 F' U' L2
D2 F2 L2 U2 F2 D' B2 R2 D' B2 U L D' R2 F D B2 U' R B
F' R2 U2 B2 D2 F' U2 F' L2 B' D2 R' F' D B2 D2 L' F2"
              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-xs font-mono text-neutral-100 placeholder-neutral-500 outline-hidden focus:border-teal-500"
            />

            {importNotice && (
              <p className="text-xs text-teal-400">{importNotice}</p>
            )}

            <div className="flex justify-end">
              <button
                onClick={handleImportMultiline}
                className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-xs font-semibold transition-colors shadow-xs"
              >
                Import All Valid Scrambles
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
