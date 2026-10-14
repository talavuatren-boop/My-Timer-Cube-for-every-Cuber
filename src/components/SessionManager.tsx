import React, { useState } from 'react';
import { Session, PuzzleType } from '../types/cube';
import { Plus, Folder, Trash2, Edit2, Check, X } from 'lucide-react';

interface SessionManagerProps {
  sessions: Session[];
  activeSessionId: string;
  onSelectSession: (id: string) => void;
  onCreateSession: (name: string, puzzle: PuzzleType) => void;
  onRenameSession: (id: string, newName: string) => void;
  onDeleteSession: (id: string) => void;
  currentPuzzle: PuzzleType;
}

export const SessionManager: React.FC<SessionManagerProps> = ({
  sessions,
  activeSessionId,
  onSelectSession,
  onCreateSession,
  onRenameSession,
  onDeleteSession,
  currentPuzzle,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newSessionName, setNewSessionName] = useState('');
  const [newSessionPuzzle, setNewSessionPuzzle] = useState<PuzzleType>(currentPuzzle);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  const activeSession = sessions.find((s) => s.id === activeSessionId) || sessions[0];

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSessionName.trim()) return;
    onCreateSession(newSessionName.trim(), newSessionPuzzle);
    setNewSessionName('');
    setIsModalOpen(false);
  };

  const handleStartRename = (s: Session) => {
    setEditingId(s.id);
    setEditName(s.name);
  };

  const handleSaveRename = (id: string) => {
    if (editName.trim()) {
      onRenameSession(id, editName.trim());
    }
    setEditingId(null);
  };

  return (
    <>
      {/* Session Pill Selector for Header / Toolbar */}
      <div className="flex items-center gap-1.5">
        <select
          value={activeSessionId}
          onChange={(e) => onSelectSession(e.target.value)}
          className="bg-neutral-900 border border-neutral-800 text-neutral-200 text-xs rounded-lg px-2.5 py-1.5 outline-hidden focus:border-emerald-500 cursor-pointer font-medium hover:bg-neutral-850 transition-colors"
        >
          {sessions.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name} ({s.puzzle})
            </option>
          ))}
        </select>

        <button
          onClick={() => setIsModalOpen(true)}
          title="Manage Sessions"
          className="p-1.5 rounded-lg bg-neutral-900 border border-neutral-800 hover:bg-neutral-800 text-neutral-400 hover:text-neutral-200 transition-colors"
        >
          <Folder className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Session Management Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-2xl p-5 shadow-2xl flex flex-col gap-4 text-neutral-100">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <div className="flex items-center gap-2">
                <Folder className="w-4 h-4 text-emerald-400" />
                <h3 className="font-semibold text-sm">Manage Sessions</h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg hover:bg-neutral-800 text-neutral-400 hover:text-neutral-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Existing Sessions List */}
            <div className="flex flex-col gap-1.5 max-h-56 overflow-y-auto">
              {sessions.map((s) => {
                const isActive = s.id === activeSessionId;
                const isEditing = editingId === s.id;

                return (
                  <div
                    key={s.id}
                    className={`flex items-center justify-between p-2.5 rounded-xl border transition-colors ${
                      isActive
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                        : 'bg-neutral-950/50 border-neutral-800/80 text-neutral-300 hover:bg-neutral-800/40'
                    }`}
                  >
                    {isEditing ? (
                      <div className="flex items-center gap-2 flex-1 mr-2">
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="flex-1 bg-neutral-900 border border-neutral-700 rounded-md px-2 py-1 text-xs text-white"
                          autoFocus
                        />
                        <button
                          onClick={() => handleSaveRename(s.id)}
                          className="p-1 text-emerald-400 hover:text-emerald-300"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="p-1 text-neutral-400 hover:text-neutral-300"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <div
                        onClick={() => {
                          onSelectSession(s.id);
                          setIsModalOpen(false);
                        }}
                        className="flex-1 flex items-center gap-2 cursor-pointer"
                      >
                        <span className="font-medium text-xs">{s.name}</span>
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-neutral-800 text-neutral-400">
                          {s.puzzle}
                        </span>
                        {isActive && (
                          <span className="text-[10px] text-emerald-400 font-medium">Active</span>
                        )}
                      </div>
                    )}

                    {!isEditing && (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleStartRename(s)}
                          title="Rename"
                          className="p-1 text-neutral-400 hover:text-neutral-200"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        {sessions.length > 1 && (
                          <button
                            onClick={() => {
                              if (window.confirm(`Delete session "${s.name}"?`)) {
                                onDeleteSession(s.id);
                              }
                            }}
                            title="Delete"
                            className="p-1 text-neutral-500 hover:text-red-400"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Create New Session Form */}
            <form onSubmit={handleCreate} className="border-t border-neutral-800 pt-3 flex flex-col gap-2">
              <span className="text-xs font-medium text-neutral-400">Create New Session</span>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Session name (e.g. OH 3x3, Sub-15 grind)..."
                  value={newSessionName}
                  onChange={(e) => setNewSessionName(e.target.value)}
                  className="flex-1 bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-1.5 text-xs text-neutral-100 placeholder-neutral-500 outline-hidden focus:border-emerald-500"
                />
                <select
                  value={newSessionPuzzle}
                  onChange={(e) => setNewSessionPuzzle(e.target.value as PuzzleType)}
                  className="bg-neutral-950 border border-neutral-800 text-neutral-200 text-xs rounded-xl px-2 py-1.5 outline-hidden"
                >
                  <option value="3x3">3×3</option>
                  <option value="2x2">2×2</option>
                  <option value="4x4">4×4</option>
                  <option value="5x5">5×5</option>
                  <option value="6x6">6×6</option>
                  <option value="7x7">7×7</option>
                  <option value="pyraminx">Pyraminx</option>
                  <option value="megaminx">Megaminx</option>
                  <option value="skewb">Skewb</option>
                  <option value="sq1">Square-1</option>
                  <option value="clock">Clock</option>
                </select>
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-medium flex items-center gap-1 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
