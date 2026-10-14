import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  AppSettings,
  Session,
  Solve,
  PuzzleType,
  PenaltyType,
  TimerBackgroundSettings,
  ScrambleHistoryItem,
} from './types/cube';
import {
  loadSettings,
  saveSettings,
  loadSessions,
  saveSessions,
  loadActiveSessionId,
  saveActiveSessionId,
  loadSolves,
  saveSolves,
  loadFavoriteAlgos,
  saveFavoriteAlgos,
  loadAlgoLearningStatus,
  saveAlgoLearningStatus,
  loadScrambleHistory,
  saveScrambleHistory,
  DEFAULT_SETTINGS,
} from './lib/storage';
import { getBackgroundPhoto, deleteBackgroundPhoto } from './lib/imageStorage';
import { generateScramble } from './lib/scrambler';
import { Navbar, NavTab } from './components/Navbar';
import { Timer } from './components/Timer';
import { ScrambleDisplay } from './components/ScrambleDisplay';
import { SessionManager } from './components/SessionManager';
import { SolveList } from './components/SolveList';
import { QuickSettings } from './components/QuickSettings';
import { StatisticsView } from './components/StatisticsView';
import { LearnView } from './components/LearnView';
import { AlgorithmsView } from './components/AlgorithmsView';
import { TrainingView } from './components/TrainingView';
import { CubeView } from './components/CubeView';
import { SettingsView } from './components/SettingsView';
import { PhotoUploadModal } from './components/PhotoUploadModal';
import { ManageHistoryModal } from './components/ManageHistoryModal';
import { FullscreenWallpaperTimer } from './components/FullscreenWallpaperTimer';
import { UserGuideModal } from './components/UserGuideModal';
import { ScrambleHistoryModal } from './components/ScrambleHistoryModal';

export default function App() {
  // Navigation & UI State
  const [currentTab, setCurrentTab] = useState<NavTab>('timer');
  const [isZenMode, setIsZenMode] = useState(false);

  // App Data State (fresh accounts start with 0 solves)
  const [settings, setSettings] = useState<AppSettings>(loadSettings);
  const [sessions, setSessions] = useState<Session[]>(loadSessions);
  const [activeSessionId, setActiveSessionId] = useState<string>(loadActiveSessionId);
  const [solves, setSolves] = useState<Solve[]>(loadSolves);
  const [deletedSolvesStack, setDeletedSolvesStack] = useState<Solve[]>([]);

  // Modals state
  const [isManageHistoryOpen, setIsManageHistoryOpen] = useState(false);
  const [isScrambleHistoryOpen, setIsScrambleHistoryOpen] = useState(false);
  const [isFullscreenWallpaperOpen, setIsFullscreenWallpaperOpen] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);

  // Algorithm favorites & learning status
  const [favorites, setFavorites] = useState<string[]>(loadFavoriteAlgos);
  const [learningStatus, setLearningStatus] = useState<Record<string, 'unlearned' | 'learning' | 'mastered'>>(loadAlgoLearningStatus);

  // Scramble History (Last 20 generated scrambles)
  const [scrambleHistoryItems, setScrambleHistoryItems] = useState<ScrambleHistoryItem[]>(loadScrambleHistory);

  // Custom Background Photo State (IndexedDB)
  const [backgroundPhotoDataUrl, setBackgroundPhotoDataUrl] = useState<string | null>(null);
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);

  // Load custom photo from IndexedDB on startup
  useEffect(() => {
    getBackgroundPhoto().then((photo) => {
      if (photo && photo.dataUrl) {
        setBackgroundPhotoDataUrl(photo.dataUrl);
      }
    });
  }, []);

  // Save scramble history items to LocalStorage
  useEffect(() => {
    saveScrambleHistory(scrambleHistoryItems);
  }, [scrambleHistoryItems]);

  // Active Session Resolution
  const activeSession = useMemo(() => {
    return sessions.find((s) => s.id === activeSessionId) || sessions[0] || {
      id: 'default',
      name: 'Main 3x3',
      puzzle: '3x3',
      createdAt: Date.now(),
    };
  }, [sessions, activeSessionId]);

  // Current Puzzle
  const [currentPuzzle, setCurrentPuzzle] = useState<PuzzleType>(activeSession.puzzle);

  // Update puzzle when switching session
  useEffect(() => {
    if (activeSession) {
      setCurrentPuzzle(activeSession.puzzle);
    }
  }, [activeSession]);

  // Scramble Management
  const [scrambleHistory, setScrambleHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);
  const [currentScramble, setCurrentScramble] = useState<string>('');

  // Generate initial scramble
  useEffect(() => {
    const initial = generateScramble(currentPuzzle);
    setCurrentScramble(initial);
    setScrambleHistory([initial]);
    setHistoryIndex(0);
    setScrambleHistoryItems((prev) => {
      if (prev.length > 0 && prev[0].scramble === initial) return prev;
      const newItem: ScrambleHistoryItem = {
        id: `sc_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        scramble: initial,
        puzzle: currentPuzzle,
        timestamp: Date.now(),
      };
      return [newItem, ...prev.filter((p) => p.scramble !== initial)].slice(0, 20);
    });
  }, [currentPuzzle]);

  const handleNewScramble = useCallback(() => {
    const next = generateScramble(currentPuzzle);
    setCurrentScramble(next);
    setScrambleHistory((prev) => [...prev, next]);
    setHistoryIndex((prev) => prev + 1);
    setScrambleHistoryItems((prev) => {
      const newItem: ScrambleHistoryItem = {
        id: `sc_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        scramble: next,
        puzzle: currentPuzzle,
        timestamp: Date.now(),
      };
      return [newItem, ...prev.filter((p) => p.scramble !== next)].slice(0, 20);
    });
  }, [currentPuzzle]);

  const handlePrevScramble = useCallback(() => {
    if (historyIndex > 0) {
      const prevIdx = historyIndex - 1;
      setHistoryIndex(prevIdx);
      setCurrentScramble(scrambleHistory[prevIdx]);
    }
  }, [historyIndex, scrambleHistory]);

  const handleSelectScrambleFromHistory = useCallback((scramble: string, puzzle: PuzzleType) => {
    if (puzzle !== currentPuzzle) {
      setCurrentPuzzle(puzzle);
    }
    setCurrentScramble(scramble);
    setScrambleHistory((prev) => [...prev, scramble]);
    setHistoryIndex((prev) => prev + 1);
  }, [currentPuzzle]);

  const handleClearScrambleHistory = useCallback(() => {
    setScrambleHistoryItems([]);
    saveScrambleHistory([]);
  }, []);

  // Save changes to LocalStorage
  useEffect(() => {
    saveSettings(settings);
  }, [settings]);

  useEffect(() => {
    saveSessions(sessions);
  }, [sessions]);

  useEffect(() => {
    saveActiveSessionId(activeSessionId);
  }, [activeSessionId]);

  useEffect(() => {
    saveSolves(solves);
  }, [solves]);

  useEffect(() => {
    saveFavoriteAlgos(favorites);
  }, [favorites]);

  useEffect(() => {
    saveAlgoLearningStatus(learningStatus);
  }, [learningStatus]);

  // Session-filtered solves (sorted newest to oldest)
  const currentSessionSolves = useMemo(() => {
    return solves
      .filter((s) => s.sessionId === activeSessionId)
      .sort((a, b) => b.timestamp - a.timestamp);
  }, [solves, activeSessionId]);

  // Personal Best Single for current session
  const bestSingleTime = useMemo(() => {
    const valid = currentSessionSolves
      .filter((s) => s.penalty !== 'dnf')
      .map((s) => (s.penalty === '+2' ? s.rawTime + 2000 : s.rawTime));
    return valid.length > 0 ? Math.min(...valid) : null;
  }, [currentSessionSolves]);

  // Solves Operations
  const handleSolveComplete = useCallback(
    (newSolve: Solve) => {
      setSolves((prev) => [newSolve, ...prev]);

      // Automatically advance scramble if autoScramble is enabled
      if (settings.timer.autoScramble) {
        handleNewScramble();
      }
    },
    [settings.timer.autoScramble, handleNewScramble]
  );

  const handleDeleteSolve = useCallback((id: string) => {
    const toDelete = solves.find((s) => s.id === id);
    if (toDelete) {
      setDeletedSolvesStack((prev) => [toDelete, ...prev]);
    }
    setSolves((prev) => {
      const updated = prev.filter((s) => s.id !== id);
      saveSolves(updated);
      return updated;
    });
  }, [solves]);

  const handleUndoDelete = useCallback(() => {
    if (deletedSolvesStack.length > 0) {
      const [restored, ...rest] = deletedSolvesStack;
      setDeletedSolvesStack(rest);
      setSolves((prev) => [restored, ...prev]);
    }
  }, [deletedSolvesStack]);

  const handleUpdatePenalty = useCallback((id: string, penalty: PenaltyType) => {
    setSolves((prev) =>
      prev.map((s) => {
        if (s.id !== id) return s;
        const effectiveTime = penalty === '+2' ? s.rawTime + 2000 : s.rawTime;
        return { ...s, penalty, time: effectiveTime };
      })
    );
  }, []);

  const handleUpdateComment = useCallback((id: string, comment: string) => {
    setSolves((prev) =>
      prev.map((s) => (s.id === id ? { ...s, comment } : s))
    );
  }, []);

  const handleClearSession = useCallback(() => {
    setSolves((prev) => {
      const remaining = prev.filter((s) => s.sessionId !== activeSessionId);
      saveSolves(remaining);
      return remaining;
    });
  }, [activeSessionId]);

  // Bulk & Manage History Handlers
  const handleDeleteMultipleSolves = useCallback((ids: string[]) => {
    setSolves((prev) => {
      const updated = prev.filter((s) => !ids.includes(s.id));
      saveSolves(updated);
      return updated;
    });
    return {
      success: true,
      message: `Permanently deleted ${ids.length} solve record(s). All statistics updated.`,
    };
  }, []);

  const handleClearSessionHistory = useCallback((sessionId: string) => {
    let count = 0;
    setSolves((prev) => {
      count = prev.filter((s) => s.sessionId === sessionId).length;
      const updated = prev.filter((s) => s.sessionId !== sessionId);
      saveSolves(updated);
      return updated;
    });
    return {
      success: true,
      message: `Permanently cleared all ${count} solves in session.`,
    };
  }, []);

  const handleClearAllHistory = useCallback(() => {
    const count = solves.length;
    setSolves([]);
    saveSolves([]);
    return {
      success: true,
      message: `Permanently erased all ${count} solves across all sessions.`,
    };
  }, [solves.length]);

  // Session Management
  const handleCreateSession = (name: string, puzzle: PuzzleType) => {
    const newSession: Session = {
      id: 'session_' + Date.now(),
      name,
      puzzle,
      createdAt: Date.now(),
    };
    setSessions((prev) => [...prev, newSession]);
    setActiveSessionId(newSession.id);
    setCurrentPuzzle(puzzle);
  };

  const handleRenameSession = (id: string, newName: string) => {
    setSessions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, name: newName } : s))
    );
  };

  const handleDeleteSession = (id: string) => {
    if (sessions.length <= 1) return;
    const remaining = sessions.filter((s) => s.id !== id);
    setSessions(remaining);
    if (activeSessionId === id) {
      setActiveSessionId(remaining[0].id);
      setCurrentPuzzle(remaining[0].puzzle);
    }
    // Delete solves belonging to this session
    setSolves((prev) => {
      const updated = prev.filter((s) => s.sessionId !== id);
      saveSolves(updated);
      return updated;
    });
  };

  // Algorithm Favorites & Learning status
  const handleToggleFavorite = (id: string) => {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleUpdateLearningStatus = (id: string, status: 'unlearned' | 'learning' | 'mastered') => {
    setLearningStatus((prev) => ({
      ...prev,
      [id]: status,
    }));
  };

  // Custom Photo Callbacks
  const handlePhotoSaved = (dataUrl: string, name: string) => {
    setBackgroundPhotoDataUrl(dataUrl);
    setSettings((prev) => ({
      ...prev,
      appearance: {
        ...prev.appearance,
        backgroundPhoto: {
          ...prev.appearance.backgroundPhoto,
          enabled: true,
          hasPhoto: true,
          photoName: name,
        },
      },
    }));
  };

  const handlePhotoRemoved = async () => {
    await deleteBackgroundPhoto();
    setBackgroundPhotoDataUrl(null);
    setSettings((prev) => ({
      ...prev,
      appearance: {
        ...prev.appearance,
        backgroundPhoto: {
          ...prev.appearance.backgroundPhoto,
          enabled: false,
          hasPhoto: false,
          photoName: undefined,
        },
      },
    }));
  };

  const handleBackgroundSettingsChanged = (bgSettings: TimerBackgroundSettings) => {
    setSettings((prev) => ({
      ...prev,
      appearance: {
        ...prev.appearance,
        backgroundPhoto: bgSettings,
      },
    }));
  };

  // Last recorded solve
  const lastSolve = currentSessionSolves[0] || null;

  // Background styling based on theme
  const isLight = settings.appearance.theme === 'light';
  const isAmoled = settings.appearance.theme === 'amoled';
  const bgThemeClass = isLight
    ? 'theme-light bg-slate-50 text-slate-900'
    : isAmoled
    ? 'bg-black text-neutral-100'
    : 'bg-neutral-950 text-neutral-100';

  return (
    <div className={`min-h-screen ${bgThemeClass} flex flex-col font-sans transition-colors duration-200 selection:bg-emerald-500/20 selection:text-emerald-400 relative`}>
      {/* Top Header Navigation */}
      <Navbar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        isZenMode={isZenMode}
        onOpenGuide={() => setIsGuideOpen(true)}
        theme={settings.appearance.theme}
        onToggleTheme={() => {
          const next = settings.appearance.theme === 'light' ? 'dark' : 'light';
          const updated = {
            ...settings,
            appearance: {
              ...settings.appearance,
              theme: next as any,
            },
          };
          setSettings(updated);
          saveSettings(updated);
        }}
      />

      {/* Main Content View Switcher */}
      <main className="flex-1 flex flex-col pb-16 md:pb-6 landscape:pb-3 md:landscape:pb-6">
        {currentTab === 'timer' && (
          <div className="flex-1 flex flex-col justify-between max-w-7xl w-full mx-auto px-2 sm:px-4 py-1.5 sm:py-4 landscape-compact-py">
            {/* Top Toolbar (Session, Scramble, Quick Controls) */}
            {!isZenMode && (
              <div className="w-full flex flex-col items-center gap-2">
                {/* Header bar with session & quick settings */}
                <div className="w-full flex items-center justify-between px-2 sm:px-4">
                  <SessionManager
                    sessions={sessions}
                    activeSessionId={activeSessionId}
                    onSelectSession={setActiveSessionId}
                    onCreateSession={handleCreateSession}
                    onRenameSession={handleRenameSession}
                    onDeleteSession={handleDeleteSession}
                    currentPuzzle={currentPuzzle}
                  />

                  <div className="flex items-center gap-2">
                    <QuickSettings
                      settings={settings}
                      onUpdateSettings={setSettings}
                      onOpenFullSettings={() => setCurrentTab('settings')}
                      puzzle={currentPuzzle}
                      onPuzzleChange={(p) => {
                        setCurrentPuzzle(p);
                        setSessions((prev) =>
                          prev.map((s) => (s.id === activeSessionId ? { ...s, puzzle: p } : s))
                        );
                      }}
                      isZenMode={isZenMode}
                      onToggleZenMode={() => setIsZenMode(!isZenMode)}
                      onOpenPhotoModal={() => setIsPhotoModalOpen(true)}
                      onOpenFullscreenWallpaper={() => setIsFullscreenWallpaperOpen(true)}
                      onOpenManageHistory={() => setIsManageHistoryOpen(true)}
                      onOpenScrambleHistory={() => setIsScrambleHistoryOpen(true)}
                      onOpenGuide={() => setIsGuideOpen(true)}
                    />
                  </div>
                </div>

                {/* Scramble Viewer */}
                <ScrambleDisplay
                  scramble={currentScramble}
                  puzzle={currentPuzzle}
                  onNewScramble={handleNewScramble}
                  onPrevScramble={handlePrevScramble}
                  hasPrevScramble={historyIndex > 0}
                  onPuzzleChange={(p) => {
                    setCurrentPuzzle(p);
                    setSessions((prev) =>
                      prev.map((s) => (s.id === activeSessionId ? { ...s, puzzle: p } : s))
                    );
                  }}
                  show2DPreview={settings.appearance.show2DScramble}
                  onOpenHistory={() => setIsScrambleHistoryOpen(true)}
                  historyCount={scrambleHistoryItems.length}
                />
              </div>
            )}

            {/* Central Precision Timer */}
            <div className="flex-1 flex items-center justify-center my-auto w-full">
              <Timer
                currentScramble={currentScramble}
                puzzle={currentPuzzle}
                settings={settings}
                activeSessionId={activeSessionId}
                bestSingleTime={bestSingleTime}
                onSolveComplete={handleSolveComplete}
                onDeleteLastSolve={handleDeleteSolve}
                onUpdateLastSolvePenalty={handleUpdatePenalty}
                onUpdateLastSolveComment={handleUpdateComment}
                lastSolve={lastSolve}
                isZenMode={isZenMode}
                setIsZenMode={setIsZenMode}
                backgroundPhotoDataUrl={backgroundPhotoDataUrl}
                onOpenPhotoModal={() => setIsPhotoModalOpen(true)}
                onLaunchFullscreenWallpaper={() => setIsFullscreenWallpaperOpen(true)}
              />
            </div>

            {/* Bottom Solves Drawer & Summary */}
            {!isZenMode && (
              <div className="w-full max-w-4xl mx-auto mt-4 px-2">
                <SolveList
                  solves={currentSessionSolves}
                  onDeleteSolve={handleDeleteSolve}
                  onUpdatePenalty={handleUpdatePenalty}
                  onUpdateComment={handleUpdateComment}
                  onClearSession={handleClearSession}
                  onUndoDelete={handleUndoDelete}
                  canUndo={deletedSolvesStack.length > 0}
                  onOpenManageHistory={() => setIsManageHistoryOpen(true)}
                />
              </div>
            )}
          </div>
        )}

        {currentTab === 'statistics' && (
          <StatisticsView
            solves={currentSessionSolves}
            allSessionsSolves={solves}
            currentSession={activeSession}
            learningStatus={learningStatus}
            onOpenManageHistory={() => setIsManageHistoryOpen(true)}
          />
        )}

        {(currentTab === 'learn' || currentTab === 'algorithms' || currentTab === 'training') && (
          <LearnView
            settings={settings}
            activeSessionId={activeSessionId}
            favorites={favorites}
            onToggleFavorite={handleToggleFavorite}
            learningStatus={learningStatus}
            onUpdateLearningStatus={handleUpdateLearningStatus}
            initialSubTab={currentTab === 'training' ? 'training' : 'algorithms'}
          />
        )}

        {currentTab === 'cube' && (
          <CubeView
            scrambleHistoryItems={scrambleHistoryItems}
            onOpenScrambleHistory={() => setIsScrambleHistoryOpen(true)}
            onUseScrambleInTimer={(scr) => {
              setCurrentScramble(scr);
              setCurrentTab('timer');
            }}
          />
        )}

        {currentTab === 'settings' && (
          <SettingsView
            settings={settings}
            onUpdateSettings={setSettings}
            solves={solves}
            onDataImported={() => {
              setSolves(loadSolves());
              setSessions(loadSessions());
              setSettings(loadSettings());
            }}
            onResetAllData={() => {
              localStorage.clear();
              deleteBackgroundPhoto();
              setBackgroundPhotoDataUrl(null);
              setSettings(DEFAULT_SETTINGS);
              setSessions(loadSessions());
              setSolves([]);
            }}
            currentPhotoDataUrl={backgroundPhotoDataUrl}
            onOpenPhotoModal={() => setIsPhotoModalOpen(true)}
            onRemovePhoto={handlePhotoRemoved}
            onOpenManageHistory={() => setIsManageHistoryOpen(true)}
            onLaunchFullscreen={() => setIsFullscreenWallpaperOpen(true)}
            onOpenGuide={() => setIsGuideOpen(true)}
          />
        )}
      </main>

      {/* Custom Timer Background Photo Modal */}
      <PhotoUploadModal
        isOpen={isPhotoModalOpen}
        onClose={() => setIsPhotoModalOpen(false)}
        backgroundSettings={settings.appearance.backgroundPhoto}
        currentPhotoDataUrl={backgroundPhotoDataUrl}
        onPhotoSaved={handlePhotoSaved}
        onPhotoRemoved={handlePhotoRemoved}
        onSettingsChanged={handleBackgroundSettingsChanged}
        onLaunchFullscreen={() => setIsFullscreenWallpaperOpen(true)}
      />

      {/* Manage History Modal (Delete Individual / Bulk / All with Confirmation) */}
      <ManageHistoryModal
        isOpen={isManageHistoryOpen}
        onClose={() => setIsManageHistoryOpen(false)}
        solves={solves}
        currentSession={activeSession}
        onDeleteMultipleSolves={handleDeleteMultipleSolves}
        onClearSessionHistory={handleClearSessionHistory}
        onClearAllHistory={handleClearAllHistory}
      />

      {/* Scramble History Modal (Last 20 Generated Scrambles) */}
      <ScrambleHistoryModal
        isOpen={isScrambleHistoryOpen}
        onClose={() => setIsScrambleHistoryOpen(false)}
        history={scrambleHistoryItems}
        currentScramble={currentScramble}
        onSelectScramble={handleSelectScrambleFromHistory}
        onClearHistory={handleClearScrambleHistory}
      />

      {/* Dedicated Edge-to-Edge Fullscreen Wallpaper Timer */}
      <FullscreenWallpaperTimer
        isOpen={isFullscreenWallpaperOpen}
        onClose={() => setIsFullscreenWallpaperOpen(false)}
        backgroundPhotoDataUrl={backgroundPhotoDataUrl}
        settings={settings}
        puzzle={currentPuzzle}
        currentScramble={currentScramble}
        activeSessionId={activeSessionId}
        bestSingleTime={bestSingleTime}
        lastSolve={lastSolve}
        onSolveComplete={handleSolveComplete}
        onDeleteLastSolve={handleDeleteSolve}
        onUpdateLastSolvePenalty={handleUpdatePenalty}
        onUpdateLastSolveComment={handleUpdateComment}
        onUpdateBackgroundSettings={handleBackgroundSettingsChanged}
        onOpenPhotoModal={() => setIsPhotoModalOpen(true)}
      />

      {/* Comprehensive Speedcubing User Guide Modal */}
      <UserGuideModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
      />
    </div>
  );
}
