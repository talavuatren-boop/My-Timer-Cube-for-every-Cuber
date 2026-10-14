import React, { useState } from 'react';
import { Solve, PenaltyType } from '../types/cube';
import { formatTime } from '../lib/stats';
import { X, Copy, Check, Trash2, Calendar, Hash, MessageSquare, Zap } from 'lucide-react';

interface SolveDetailModalProps {
  solve: Solve | null;
  solveIndex?: number;
  onClose: () => void;
  onDelete: (id: string) => void;
  onUpdatePenalty: (id: string, penalty: PenaltyType) => void;
  onUpdateComment: (id: string, comment: string) => void;
}

export const SolveDetailModal: React.FC<SolveDetailModalProps> = ({
  solve,
  solveIndex,
  onClose,
  onDelete,
  onUpdatePenalty,
  onUpdateComment,
}) => {
  const [copied, setCopied] = useState(false);
  const [commentText, setCommentText] = useState(solve?.comment || '');
  const [isEditingComment, setIsEditingComment] = useState(false);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

  if (!solve) return null;

  const handleCopySolve = () => {
    const text = `Solve #${solveIndex ?? ''}: ${formatTime(solve.time, solve.penalty)}\nScramble: ${solve.scramble}\nDate: ${new Date(solve.timestamp).toLocaleString()}${solve.comment ? '\nComment: ' + solve.comment : ''}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const saveComment = () => {
    onUpdateComment(solve.id, commentText);
    setIsEditingComment(false);
  };

  const handleConfirmDelete = () => {
    onDelete(solve.id);
    setIsConfirmingDelete(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-2xl p-5 shadow-2xl flex flex-col gap-4 text-neutral-100">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase tracking-wider text-neutral-400 font-mono">
              Solve {solveIndex !== undefined ? `#${solveIndex}` : ''}
            </span>
            <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-neutral-800 text-neutral-300">
              {solve.puzzle}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-neutral-800 text-neutral-400 hover:text-neutral-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Big Time Display */}
        <div className="text-center py-2">
          <div className="font-mono-timer text-5xl font-bold tracking-tight text-emerald-400">
            {formatTime(solve.time, solve.penalty)}
          </div>
          {solve.penalty === '+2' && (
            <p className="text-xs text-amber-400 mt-1">Raw: {(solve.rawTime / 1000).toFixed(2)}s (+2.00 penalty)</p>
          )}
        </div>

        {/* Penalty Switcher */}
        <div className="flex items-center justify-center gap-2 bg-neutral-950 p-1.5 rounded-xl border border-neutral-800">
          <button
            onClick={() => onUpdatePenalty(solve.id, 'none')}
            className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              solve.penalty === 'none'
                ? 'bg-neutral-800 text-white font-semibold'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            OK
          </button>
          <button
            onClick={() => onUpdatePenalty(solve.id, '+2')}
            className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              solve.penalty === '+2'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 font-semibold'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            +2
          </button>
          <button
            onClick={() => onUpdatePenalty(solve.id, 'dnf')}
            className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              solve.penalty === 'dnf'
                ? 'bg-red-500/20 text-red-300 border border-red-500/30 font-semibold'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            DNF
          </button>
        </div>

        {/* Scramble */}
        <div className="bg-neutral-950/60 p-3 rounded-xl border border-neutral-800/80">
          <div className="text-[11px] text-neutral-400 mb-1 flex items-center gap-1 font-mono">
            <Zap className="w-3 h-3 text-neutral-500" />
            <span>Scramble</span>
          </div>
          <p className="font-mono text-xs text-neutral-300 select-all leading-relaxed">
            {solve.scramble}
          </p>
        </div>

        {/* Date & Details */}
        <div className="flex items-center justify-between text-xs text-neutral-400 px-1">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-neutral-500" />
            <span>{new Date(solve.timestamp).toLocaleString()}</span>
          </div>
          {solve.inspectionTimeMs && (
            <span>Insp: {(solve.inspectionTimeMs / 1000).toFixed(1)}s</span>
          )}
        </div>

        {/* Comment Section */}
        <div className="bg-neutral-950/60 p-3 rounded-xl border border-neutral-800/80">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] text-neutral-400 flex items-center gap-1">
              <MessageSquare className="w-3 h-3 text-neutral-500" />
              <span>Comment / Notes</span>
            </span>
            {!isEditingComment && (
              <button
                onClick={() => setIsEditingComment(true)}
                className="text-[11px] text-emerald-400 hover:underline"
              >
                {solve.comment ? 'Edit' : 'Add'}
              </button>
            )}
          </div>

          {isEditingComment ? (
            <div className="flex flex-col gap-2">
              <input
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="e.g. OLL skip, slow cross..."
                className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-2.5 py-1.5 text-xs text-neutral-200 outline-hidden focus:border-emerald-500"
                autoFocus
              />
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setIsEditingComment(false)}
                  className="px-2.5 py-1 text-xs text-neutral-400 hover:text-neutral-200"
                >
                  Cancel
                </button>
                <button
                  onClick={saveComment}
                  className="px-2.5 py-1 text-xs bg-emerald-600 hover:bg-emerald-500 text-white rounded-md"
                >
                  Save
                </button>
              </div>
            </div>
          ) : (
            <p className="text-xs text-neutral-300 italic">
              {solve.comment || 'No notes added'}
            </p>
          )}
        </div>

        {/* Action Buttons & In-Modal Confirmation */}
        {isConfirmingDelete ? (
          <div className="pt-2 border-t border-red-500/30 flex items-center justify-between gap-2 bg-red-500/10 p-3 rounded-xl animate-in fade-in duration-150">
            <div className="text-xs text-red-300 font-medium flex items-center gap-1.5">
              <Trash2 className="w-3.5 h-3.5 shrink-0 text-red-400" />
              <span>Permanently delete this solve?</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsConfirmingDelete(false)}
                className="px-2.5 py-1 text-xs bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-lg transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-2.5 py-1 text-xs bg-red-600 hover:bg-red-500 text-white rounded-lg transition-colors font-semibold shadow-xs"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between pt-2 border-t border-neutral-800">
            <button
              type="button"
              onClick={() => setIsConfirmingDelete(true)}
              className="flex items-center gap-1.5 text-xs text-red-400 hover:text-red-300 px-3 py-1.5 rounded-lg hover:bg-red-500/10 transition-colors font-medium"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete Solve</span>
            </button>

            <button
              type="button"
              onClick={handleCopySolve}
              className="flex items-center gap-1.5 text-xs bg-neutral-800 hover:bg-neutral-750 text-neutral-200 px-3 py-1.5 rounded-lg transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
