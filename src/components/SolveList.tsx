import React, { useState } from 'react';
import { Solve, PenaltyType } from '../types/cube';
import { formatTime, calculateAoN } from '../lib/stats';
import { Trash2, RotateCcw, MessageSquare, ChevronRight, MoreHorizontal } from 'lucide-react';
import { SolveDetailModal } from './SolveDetailModal';

interface SolveListProps {
  solves: Solve[];
  onDeleteSolve: (id: string) => void;
  onUpdatePenalty: (id: string, penalty: PenaltyType) => void;
  onUpdateComment: (id: string, comment: string) => void;
  onClearSession?: () => void;
  onUndoDelete?: () => void;
  canUndo?: boolean;
  onOpenManageHistory?: () => void;
}

export const SolveList: React.FC<SolveListProps> = ({
  solves,
  onDeleteSolve,
  onUpdatePenalty,
  onUpdateComment,
  onClearSession,
  onUndoDelete,
  canUndo = false,
  onOpenManageHistory,
}) => {
  const [selectedSolve, setSelectedSolve] = useState<Solve | null>(null);
  const [selectedSolveIndex, setSelectedSolveIndex] = useState<number | undefined>(undefined);
  const [confirmClearSession, setConfirmClearSession] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // Solves are passed with newest first (solves[0] is most recent)
  const ao5 = calculateAoN(solves, 5);
  const ao12 = calculateAoN(solves, 12);
  const validTimes = solves.filter(s => s.penalty !== 'dnf').map(s => s.penalty === '+2' ? s.rawTime + 2000 : s.rawTime);
  const bestSingle = validTimes.length > 0 ? Math.min(...validTimes) : null;

  return (
    <div className="w-full flex flex-col bg-neutral-900/50 border border-neutral-800/80 rounded-2xl overflow-hidden backdrop-blur-xs">
      {/* Top Session Stats Ribbon */}
      <div className="p-3 sm:p-4 border-b border-neutral-800/80 bg-neutral-900/80 flex items-center justify-between gap-2">
        <div className="flex items-center gap-3 sm:gap-4 overflow-x-auto text-xs font-mono">
          <div>
            <span className="text-neutral-500 mr-1.5 uppercase tracking-wider text-[10px]">Solves</span>
            <span className="text-neutral-200 font-semibold">{solves.length}</span>
          </div>
          <div>
            <span className="text-neutral-500 mr-1.5 uppercase tracking-wider text-[10px]">Best</span>
            <span className="text-emerald-400 font-semibold">
              {bestSingle !== null ? formatTime(bestSingle) : '--'}
            </span>
          </div>
          <div>
            <span className="text-neutral-500 mr-1.5 uppercase tracking-wider text-[10px]">Ao5</span>
            <span className="text-cyan-400 font-semibold">
              {ao5 !== null ? formatTime(ao5) : '--'}
            </span>
          </div>
          <div>
            <span className="text-neutral-500 mr-1.5 uppercase tracking-wider text-[10px]">Ao12</span>
            <span className="text-indigo-400 font-semibold">
              {ao12 !== null ? formatTime(ao12) : '--'}
            </span>
          </div>
        </div>

        {/* Undo / Clear / Manage History actions */}
        <div className="flex items-center gap-1.5 shrink-0">
          {onOpenManageHistory && (
            <button
              onClick={onOpenManageHistory}
              title="Manage and delete solves"
              className="px-2.5 py-1 rounded-lg text-xs bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-medium flex items-center gap-1 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5 text-neutral-400" />
              <span className="hidden sm:inline">Manage History</span>
              <span className="sm:hidden">History</span>
            </button>
          )}

          {canUndo && onUndoDelete && (
            <button
              onClick={onUndoDelete}
              title="Undo last deletion"
              className="px-2 py-1 rounded-lg text-xs bg-neutral-800 hover:bg-neutral-700 text-neutral-300 flex items-center gap-1 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Undo</span>
            </button>
          )}

          {onClearSession && solves.length > 0 && (
            confirmClearSession ? (
              <div className="flex items-center gap-1.5 bg-red-500/10 border border-red-500/30 px-2 py-0.5 rounded-lg">
                <span className="text-[11px] text-red-300 font-medium">Clear session?</span>
                <button
                  type="button"
                  onClick={() => setConfirmClearSession(false)}
                  className="px-1.5 py-0.5 text-[11px] text-neutral-400 hover:text-neutral-200"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onClearSession();
                    setConfirmClearSession(false);
                  }}
                  className="px-2 py-0.5 text-[11px] bg-red-600 hover:bg-red-500 text-white rounded font-medium"
                >
                  Confirm
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setConfirmClearSession(true)}
                title="Clear current session"
                className="p-1.5 rounded-lg text-neutral-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )
          )}
        </div>
      </div>

      {/* Solves list */}
      <div className="max-h-48 sm:max-h-64 md:max-h-72 landscape:max-h-32 sm:landscape:max-h-44 md:landscape:max-h-72 overflow-y-auto divide-y divide-neutral-800/40 px-1 py-1">
        {solves.length === 0 ? (
          <div className="py-8 text-center text-xs text-neutral-500">
            No solves recorded in this session yet. Ready to start!
          </div>
        ) : (
          solves.map((solve, idx) => {
            const solveNum = solves.length - idx;
            const isBest = bestSingle !== null && solve.penalty !== 'dnf' && (solve.penalty === '+2' ? solve.rawTime + 2000 : solve.rawTime) === bestSingle;
            const isRowConfirming = confirmDeleteId === solve.id;

            return (
              <div
                key={solve.id}
                onClick={() => {
                  if (confirmDeleteId === solve.id) return;
                  setSelectedSolve(solve);
                  setSelectedSolveIndex(solveNum);
                }}
                className="group flex items-center justify-between px-3 py-2 hover:bg-neutral-800/50 rounded-xl cursor-pointer transition-colors text-xs"
              >
                <div className="flex items-center gap-3">
                  <span className="font-mono text-[11px] text-neutral-500 w-6 text-right">
                    {solveNum}.
                  </span>
                  <span
                    className={`font-mono-timer font-semibold text-sm ${
                      solve.penalty === 'dnf'
                        ? 'text-red-400 line-through'
                        : isBest
                        ? 'text-amber-400 font-bold'
                        : 'text-neutral-200'
                    }`}
                  >
                    {formatTime(solve.time, solve.penalty)}
                  </span>
                  {solve.comment && (
                    <span className="text-[11px] text-neutral-400 italic max-w-[120px] truncate hidden sm:inline flex items-center gap-1">
                      <MessageSquare className="w-2.5 h-2.5 text-neutral-500 shrink-0" />
                      {solve.comment}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 text-neutral-500">
                  <span className="text-[11px] font-mono mr-1">
                    {new Date(solve.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>

                  {isRowConfirming ? (
                    <div
                      className="flex items-center gap-1 bg-red-500/15 border border-red-500/30 px-1.5 py-0.5 rounded-lg"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setConfirmDeleteId(null);
                        }}
                        className="px-1 text-[10px] text-neutral-400 hover:text-neutral-200"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteSolve(solve.id);
                          setConfirmDeleteId(null);
                        }}
                        className="px-1.5 py-0.5 text-[10px] bg-red-600 hover:bg-red-500 text-white rounded font-medium"
                      >
                        Delete
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      title="Delete solve"
                      onClick={(e) => {
                        e.stopPropagation();
                        setConfirmDeleteId(solve.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1 text-neutral-500 hover:text-red-400 hover:bg-red-500/10 rounded transition-all"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}

                  <ChevronRight className="w-3.5 h-3.5 group-hover:text-neutral-300 transition-colors" />
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal detail */}
      <SolveDetailModal
        solve={selectedSolve}
        solveIndex={selectedSolveIndex}
        onClose={() => setSelectedSolve(null)}
        onDelete={onDeleteSolve}
        onUpdatePenalty={onUpdatePenalty}
        onUpdateComment={onUpdateComment}
      />
    </div>
  );
};
