import React, { useState } from 'react';
import { AppSettings, PuzzleType } from '../types/cube';
import {
  SlidersHorizontal,
  Volume2,
  VolumeX,
  Clock,
  Moon,
  Sun,
  X,
  Maximize2,
  Minimize2,
  Eye,
  Sparkles,
  Trash2,
  HelpCircle,
} from 'lucide-react';

interface QuickSettingsProps {
  settings: AppSettings;
  onUpdateSettings: (newSettings: AppSettings) => void;
  onOpenFullSettings: () => void;
  puzzle: PuzzleType;
  onPuzzleChange: (p: PuzzleType) => void;
  isZenMode: boolean;
  onToggleZenMode: () => void;
  onOpenPhotoModal?: () => void;
  onOpenFullscreenWallpaper?: () => void;
  onOpenManageHistory?: () => void;
  onOpenScrambleHistory?: () => void;
  onOpenGuide?: () => void;
}

export const QuickSettings: React.FC<QuickSettingsProps> = ({
  settings,
  onUpdateSettings,
  onOpenFullSettings,
  puzzle,
  onPuzzleChange,
  isZenMode,
  onToggleZenMode,
  onOpenPhotoModal,
  onOpenFullscreenWallpaper,
  onOpenManageHistory,
  onOpenScrambleHistory,
  onOpenGuide,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const toggleSound = () => {
    onUpdateSettings({
      ...settings,
      sound: {
        ...settings.sound,
        soundEnabled: !settings.sound.soundEnabled,
      },
    });
  };

  const toggleInspection = () => {
    onUpdateSettings({
      ...settings,
      timer: {
        ...settings.timer,
        wcaInspection: !settings.timer.wcaInspection,
      },
    });
  };

  const cycleTheme = () => {
    const current = settings.appearance.theme;
    const next = current === 'dark' ? 'light' : current === 'light' ? 'amoled' : 'dark';
    onUpdateSettings({
      ...settings,
      appearance: {
        ...settings.appearance,
        theme: next,
      },
    });
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  return (
    <div className="relative">
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        title="Quick Settings"
        className="p-2 rounded-xl bg-neutral-900/80 border border-neutral-800 hover:bg-neutral-800 text-neutral-400 hover:text-neutral-200 transition-colors"
      >
        <SlidersHorizontal className="w-4 h-4" />
      </button>

      {/* Popover & Backdrop */}
      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-30 bg-black/20 md:bg-transparent"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 top-12 z-40 w-72 max-w-[calc(100vw-1.5rem)] p-3 bg-neutral-900/95 border border-neutral-800 rounded-2xl shadow-2xl backdrop-blur-md flex flex-col gap-2.5 animate-in fade-in zoom-in-95 duration-150 text-xs max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
              <span className="font-semibold text-neutral-200">Quick Controls</span>
              <button
                onClick={() => setIsOpen(false)}
                className="text-neutral-500 hover:text-neutral-300 p-1"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

          {/* Inspection Toggle */}
          <div className="flex items-center justify-between py-1">
            <span className="text-neutral-300 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-neutral-400" />
              <span>WCA Inspection</span>
            </span>
            <button
              onClick={toggleInspection}
              className={`px-2 py-0.5 rounded text-[11px] font-mono transition-colors ${
                settings.timer.wcaInspection
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'bg-neutral-800 text-neutral-400'
              }`}
            >
              {settings.timer.wcaInspection ? '15s ON' : 'OFF'}
            </button>
          </div>

          {/* Sound Toggle */}
          <div className="flex items-center justify-between py-1">
            <span className="text-neutral-300 flex items-center gap-1.5">
              {settings.sound.soundEnabled ? (
                <Volume2 className="w-3.5 h-3.5 text-neutral-400" />
              ) : (
                <VolumeX className="w-3.5 h-3.5 text-neutral-400" />
              )}
              <span>Audio Beeps</span>
            </span>
            <button
              onClick={toggleSound}
              className={`px-2 py-0.5 rounded text-[11px] font-mono transition-colors ${
                settings.sound.soundEnabled
                  ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                  : 'bg-neutral-800 text-neutral-400'
              }`}
            >
              {settings.sound.soundEnabled ? 'ON' : 'OFF'}
            </button>
          </div>

          {/* Zen Mode */}
          <div className="flex items-center justify-between py-1">
            <span className="text-neutral-300 flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5 text-neutral-400" />
              <span>Zen Focus</span>
            </span>
            <button
              onClick={onToggleZenMode}
              className={`px-2 py-0.5 rounded text-[11px] font-mono transition-colors ${
                isZenMode
                  ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'
                  : 'bg-neutral-800 text-neutral-400'
              }`}
            >
              {isZenMode ? 'ACTIVE' : 'OFF'}
            </button>
          </div>

          {/* Theme Style */}
          <div className="flex items-center justify-between py-1">
            <span className="text-neutral-300 flex items-center gap-1.5">
              {settings.appearance.theme === 'light' ? (
                <Sun className="w-3.5 h-3.5 text-amber-400" />
              ) : settings.appearance.theme === 'amoled' ? (
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              ) : (
                <Moon className="w-3.5 h-3.5 text-neutral-400" />
              )}
              <span>Theme Style</span>
            </span>
            <button
              onClick={cycleTheme}
              className="px-2 py-0.5 rounded text-[11px] font-mono transition-colors bg-neutral-800 hover:bg-neutral-700 text-neutral-200 capitalize border border-neutral-700/60"
            >
              {settings.appearance.theme}
            </button>
          </div>

          {/* Background Photo */}
          {onOpenPhotoModal && (
            <div className="flex items-center justify-between py-1 border-t border-neutral-800/60 pt-1.5">
              <span className="text-neutral-300 flex items-center gap-1.5">
                <span className="text-xs">❤️</span>
                <span>Crush Photo</span>
              </span>
              <button
                onClick={() => {
                  setIsOpen(false);
                  onOpenPhotoModal();
                }}
                className="px-2 py-0.5 rounded text-[11px] bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 transition-colors font-medium border border-rose-500/30"
              >
                {settings.appearance.backgroundPhoto.enabled ? 'Customize' : 'Upload'}
              </button>
            </div>
          )}

          {/* Fullscreen Wallpaper Mode */}
          {onOpenFullscreenWallpaper && (
            <div className="flex items-center justify-between py-1">
              <span className="text-neutral-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-rose-400" />
                <span>Wallpaper Mode</span>
              </span>
              <button
                onClick={() => {
                  setIsOpen(false);
                  onOpenFullscreenWallpaper();
                }}
                className="px-2 py-0.5 rounded text-[11px] bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 font-medium"
              >
                Launch
              </button>
            </div>
          )}

          {/* Manage History */}
          {onOpenManageHistory && (
            <div className="flex items-center justify-between py-1">
              <span className="text-neutral-300 flex items-center gap-1.5">
                <Trash2 className="w-3.5 h-3.5 text-red-400" />
                <span>Manage History</span>
              </span>
              <button
                onClick={() => {
                  setIsOpen(false);
                  onOpenManageHistory();
                }}
                className="px-2 py-0.5 rounded text-[11px] bg-red-500/20 text-red-300 hover:bg-red-500/30 font-medium"
              >
                Open
              </button>
            </div>
          )}

          {/* Scramble History (Last 20) */}
          {onOpenScrambleHistory && (
            <div className="flex items-center justify-between py-1">
              <span className="text-neutral-300 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-teal-400" />
                <span>Scramble History</span>
              </span>
              <button
                onClick={() => {
                  setIsOpen(false);
                  onOpenScrambleHistory();
                }}
                className="px-2 py-0.5 rounded text-[11px] bg-teal-500/20 text-teal-300 hover:bg-teal-500/30 font-medium"
              >
                Last 20
              </button>
            </div>
          )}

          {/* Browser Fullscreen */}
          <div className="flex items-center justify-between py-1">
            <span className="text-neutral-300 flex items-center gap-1.5">
              {isFullscreen ? (
                <Minimize2 className="w-3.5 h-3.5 text-neutral-400" />
              ) : (
                <Maximize2 className="w-3.5 h-3.5 text-neutral-400" />
              )}
              <span>Browser Fullscreen</span>
            </span>
            <button
              onClick={toggleFullscreen}
              className="px-2 py-0.5 rounded text-[11px] bg-neutral-800 text-neutral-400 hover:text-neutral-200"
            >
              Toggle
            </button>
          </div>

          {/* User Guide Link */}
          {onOpenGuide && (
            <div className="flex items-center justify-between py-1">
              <span className="text-neutral-300 flex items-center gap-1.5">
                <HelpCircle className="w-3.5 h-3.5 text-teal-400" />
                <span>Hướng dẫn sử dụng</span>
              </span>
              <button
                onClick={() => {
                  setIsOpen(false);
                  onOpenGuide();
                }}
                className="px-2 py-0.5 rounded text-[11px] bg-teal-500/20 text-teal-300 hover:bg-teal-500/30 font-medium"
              >
                Mở
              </button>
            </div>
          )}

          {/* Full Settings link */}
          <button
            onClick={() => {
              setIsOpen(false);
              onOpenFullSettings();
            }}
            className="mt-1 w-full py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-750 text-neutral-200 text-center font-medium transition-colors"
          >
            All Settings...
          </button>
        </div>
        </>
      )}
    </div>
  );
};
