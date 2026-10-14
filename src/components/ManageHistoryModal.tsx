import React, { useState } from 'react';
import { Solve, Session } from '../types/cube';
import { formatTime } from '../lib/stats';
import {
  Trash2,
  X,
  AlertTriangle,
  CheckCircle,
  Filter,
  CheckSquare,
  Square,
  History,
} from 'lucide-react';

interface ManageHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  solves: Solve[];
  currentSession: Session;
  onDeleteMultipleSolves: (ids: string[]) => { success: boolean; message: string };
  onClearSessionHistory: (sessionId: string) => { success: boolean; message: string };
  onClearAllHistory: () => { success: boolean; message: string };
}

export const ManageHistoryModal: React.FC<ManageHistoryModalProps> = ({
  isOpen,
  onClose,
  solves,
  currentSession,
  onDeleteMultipleSolves,
  onClearSessionHistory,
  onClearAllHistory,
}) => {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [viewScope, setViewScope] = useState<'session' | 'all'>('session');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [pendingConfirm, setPendingConfirm] = useState<{
    type: 'selected' | 'session' | 'all' | 'single';
    targetId?: string;
    title: string;
    description: string;
  } | null>(null);

  if (!isOpen) return null;

  const displayedSolves =
    viewScope === 'session'
      ? solves.filter((s) => s.sessionId === currentSession.id)
      : solves;

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedIds.length === displayedSolves.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(displayedSolves.map((s) => s.id));
    }
  };

  const showFeedback = (type: 'success' | 'error', message: string) => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 3500);
  };

  const executeConfirmedAction = () => {
    if (!pendingConfirm) return;

    if (pendingConfirm.type === 'selected') {
      const res = onDeleteMultipleSolves(selectedIds);
      if (res.success) {
        setSelectedIds([]);
        showFeedback('success', res.message);
      } else {
        showFeedback('error', res.message);
      }
    } else if (pendingConfirm.type === 'single' && pendingConfirm.targetId) {
      const res = onDeleteMultipleSolves([pendingConfirm.targetId]);
      if (res.success) {
        setSelectedIds((prev) => prev.filter((id) => id !== pendingConfirm.targetId));
        showFeedback('success', res.message);
      } else {
        showFeedback('error', res.message);
      }
    } else if (pendingConfirm.type === 'session') {
      const res = onClearSessionHistory(currentSession.id);
      if (res.success) {
        setSelectedIds([]);
        showFeedback('success', res.message);
      } else {
        showFeedback('error', res.message);
      }
    } else if (pendingConfirm.type === 'all') {
      const res = onClearAllHistory();
      if (res.success) {
        setSelectedIds([]);
        showFeedback('success', res.message);
      } else {
        showFeedback('error', res.message);
      }
    }

    setPendingConfirm(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-2xl bg-neutral-900 border border-neutral-800 rounded-3xl p-5 sm:p-6 shadow-2xl flex flex-col gap-4 text-neutral-100 max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-red-500/15 border border-red-500/30 flex items-center justify-center text-red-400">
              <History className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base">Manage Solve History</h3>
              <p className="text-[11px] text-neutral-400">
                Permanently delete individual records or wipe session logs.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-neutral-800 text-neutral-400 hover:text-neutral-200 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Feedback Alert */}
        {feedback && (
          <div
            className={`p-3 rounded-xl flex items-center gap-2 text-xs animate-in fade-in ${
              feedback.type === 'success'
                ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-300'
                : 'bg-red-500/15 border border-red-500/30 text-red-300'
            }`}
          >
            {feedback.type === 'success' ? (
              <CheckCircle className="w-4 h-4 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 shrink-0" />
            )}
            <span>{feedback.message}</span>
          </div>
        )}

        {/* Scope Selector & Bulk Actions Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-2 bg-neutral-950 p-2.5 rounded-2xl border border-neutral-800">
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => {
                setViewScope('session');
                setSelectedIds([]);
              }}
              className={`px-3 py-1 rounded-xl text-xs font-medium transition-colors ${
                viewScope === 'session'
                  ? 'bg-neutral-800 text-white font-semibold'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              Current Session ({currentSession.name})
            </button>
            <button
              onClick={() => {
                setViewScope('all');
                setSelectedIds([]);
              }}
              className={`px-3 py-1 rounded-xl text-xs font-medium transition-colors ${
                viewScope === 'all'
                  ? 'bg-neutral-800 text-white font-semibold'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              All Sessions ({solves.length})
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSelectAll}
              disabled={displayedSolves.length === 0}
              className="px-2.5 py-1 text-xs bg-neutral-900 border border-neutral-800 hover:bg-neutral-850 rounded-lg text-neutral-300 flex items-center gap-1.5 disabled:opacity-40"
            >
              {selectedIds.length === displayedSolves.length && displayedSolves.length > 0 ? (
                <CheckSquare className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <Square className="w-3.5 h-3.5" />
              )}
              <span>Select All</span>
            </button>

            {selectedIds.length > 0 && (
              <button
                type="button"
                onClick={() =>
                  setPendingConfirm({
                    type: 'selected',
                    title: `Delete ${selectedIds.length} Selected Solves`,
                    description: `Permanently erase ${selectedIds.length} solve record(s) from local storage? This will immediately recalculate all averages, personal bests, and statistics.`,
                  })
                }
                className="px-3 py-1 text-xs bg-red-600 hover:bg-red-500 text-white font-semibold rounded-lg flex items-center gap-1.5 transition-colors shadow-sm"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Selected ({selectedIds.length})</span>
              </button>
            )}
          </div>
        </div>

        {/* Pending Confirmation Overlay Card */}
        {pendingConfirm && (
          <div className="bg-red-500/10 border border-red-500/40 rounded-2xl p-4 flex flex-col gap-2.5 animate-in fade-in duration-150">
            <div className="flex items-center gap-2 text-red-300 font-semibold text-xs sm:text-sm">
              <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{pendingConfirm.title}</span>
            </div>
            <p className="text-xs text-neutral-300 leading-relaxed">
              {pendingConfirm.description}
            </p>
            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setPendingConfirm(null)}
                className="px-3 py-1 text-xs bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-xl transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={executeConfirmedAction}
                className="px-3.5 py-1 text-xs bg-red-600 hover:bg-red-500 text-white rounded-xl transition-colors font-semibold shadow-xs"
              >
                Yes, Permanently Delete
              </button>
            </div>
          </div>
        )}

        {/* Solve Items Scrollable List */}
        <div className="flex-1 overflow-y-auto max-h-72 divide-y divide-neutral-800/50 bg-neutral-950/40 rounded-2xl border border-neutral-800/60 p-1">
          {displayedSolves.length === 0 ? (
            <div className="py-12 text-center text-xs text-neutral-500">
              No solve records found. History is clean.
            </div>
          ) : (
            displayedSolves.map((solve, idx) => {
              const isSelected = selectedIds.includes(solve.id);
              return (
                <div
                  key={solve.id}
                  onClick={() => handleToggleSelect(solve.id)}
                  className={`flex items-center justify-between p-2.5 rounded-xl cursor-pointer transition-colors ${
                    isSelected
                      ? 'bg-emerald-500/10 border border-emerald-500/30'
                      : 'hover:bg-neutral-850/60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleToggleSelect(solve.id)}
                      className="w-4 h-4 accent-emerald-500 cursor-pointer"
                    />
                    <span className="font-mono text-xs text-neutral-500 w-7">
                      #{displayedSolves.length - idx}
                    </span>
                    <span className="font-mono-timer font-bold text-sm text-neutral-100">
                      {formatTime(solve.time, solve.penalty)}
                    </span>
                    <span className="text-[11px] font-mono text-neutral-500 hidden sm:inline max-w-[200px] truncate">
                      {solve.scramble}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-xs text-neutral-500 font-mono">
                    <span className="hidden sm:inline">
                      {new Date(solve.timestamp).toLocaleDateString()}{' '}
                      {new Date(solve.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setPendingConfirm({
                          type: 'single',
                          targetId: solve.id,
                          title: `Delete Solve #${displayedSolves.length - idx}`,
                          description: `Permanently delete this ${formatTime(solve.time, solve.penalty)} solve record?`,
                        });
                      }}
                      title="Delete this record"
                      className="p-1 text-neutral-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Danger Zone Bottom Action Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-neutral-800 pt-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() =>
                setPendingConfirm({
                  type: 'session',
                  title: `Clear Session: ${currentSession.name}`,
                  description: `Permanently delete ALL ${displayedSolves.length} solve(s) in session "${currentSession.name}"? This cannot be undone.`,
                })
              }
              disabled={displayedSolves.length === 0}
              className="px-3 py-1.5 text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition-colors disabled:opacity-40"
            >
              Clear Current Session ({currentSession.name})
            </button>
            <button
              type="button"
              onClick={() =>
                setPendingConfirm({
                  type: 'all',
                  title: 'Wipe All History Permanently',
                  description: `CRITICAL: Permanently erase ALL ${solves.length} solve(s) across ALL sessions? Your solve history, personal bests, and statistics will be completely reset.`,
                })
              }
              disabled={solves.length === 0}
              className="px-3 py-1.5 text-xs text-red-500 hover:text-red-400 hover:bg-red-500/15 rounded-xl transition-colors font-semibold disabled:opacity-40"
            >
              Wipe All History Permanently
            </button>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-medium rounded-xl transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
