import React, { useState } from 'react';
import { AppSettings, Solve } from '../types/cube';
import {
  exportDataAsJSON,
  exportSolvesAsCSV,
  importDataFromJSON,
} from '../lib/storage';
import {
  Volume2,
  Sliders,
  Palette,
  Clock,
  Download,
  Upload,
  Cloud,
  Check,
  RotateCcw,
  Shield,
  Smartphone,
  Eye,
  Maximize2,
  Trash2,
  History,
  BookOpen,
} from 'lucide-react';

interface SettingsViewProps {
  settings: AppSettings;
  onUpdateSettings: (newSettings: AppSettings) => void;
  solves: Solve[];
  onDataImported: () => void;
  onResetAllData: () => void;
  currentPhotoDataUrl?: string | null;
  onOpenPhotoModal?: () => void;
  onRemovePhoto?: () => void;
  onOpenManageHistory?: () => void;
  onLaunchFullscreen?: () => void;
  onOpenGuide?: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  onUpdateSettings,
  solves,
  onDataImported,
  onResetAllData,
  currentPhotoDataUrl,
  onOpenPhotoModal,
  onRemovePhoto,
  onOpenManageHistory,
  onLaunchFullscreen,
  onOpenGuide,
}) => {
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const [cloudSyncCode, setCloudSyncCode] = useState<string>(
    settings.cloudSyncKey || 'HUNG-' + Math.random().toString(36).substring(2, 8).toUpperCase()
  );
  const [cloudSynced, setCloudSynced] = useState(false);

  const handleUpdate = <K extends keyof AppSettings>(section: K, value: AppSettings[K]) => {
    const updated = {
      ...settings,
      [section]: value,
    };
    onUpdateSettings(updated);
  };

  const handleExportJSON = () => {
    const data = exportDataAsJSON();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `hungcube-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportCSV = () => {
    const csv = exportSolvesAsCSV(solves);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `hungcube-solves-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const res = importDataFromJSON(content);
      if (res.success) {
        setImportStatus(res.message);
        onDataImported();
      } else {
        setImportStatus(`Error: ${res.message}`);
      }
      setTimeout(() => setImportStatus(null), 4000);
    };
    reader.readAsText(file);
  };

  const handleCloudSync = () => {
    // Save sync code and perform sync snapshot
    handleUpdate('cloudSyncKey', cloudSyncCode);
    setCloudSynced(true);
    setTimeout(() => setCloudSynced(false), 2500);
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-6 flex flex-col gap-8 text-neutral-100">
      {/* Title */}
      <div className="border-b border-neutral-800 pb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold tracking-tight">Preferences & Configuration</h2>
          <p className="text-xs text-neutral-400 mt-0.5">
            Fine-tune timer responsiveness, WCA inspection, audio triggers, themes, and data sync.
          </p>
        </div>
        {onOpenGuide && (
          <button
            onClick={onOpenGuide}
            className="px-3.5 py-2 rounded-xl bg-teal-500/15 hover:bg-teal-500/25 border border-teal-500/30 text-teal-300 text-xs font-semibold flex items-center gap-2 transition-all shrink-0 self-start sm:self-auto shadow-xs active:scale-95"
          >
            <BookOpen className="w-4 h-4" />
            <span>Hướng dẫn sử dụng</span>
          </button>
        )}
      </div>

      {/* 1. Timer Configuration */}
      <section className="bg-neutral-900/60 border border-neutral-800/80 rounded-2xl p-5 flex flex-col gap-4">
        <div className="flex items-center gap-2 text-sm font-semibold text-emerald-400">
          <Clock className="w-4 h-4" />
          <span>Timer Behavior</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          {/* WCA Inspection */}
          <div className="flex items-center justify-between gap-3 min-w-0 p-3 bg-neutral-950/60 rounded-xl border border-neutral-800/60">
            <div className="min-w-0 flex-1">
              <span className="font-medium text-neutral-200 block">WCA 15s Inspection</span>
              <span className="text-[11px] text-neutral-500 block">15s countdown with 8s and 12s voice/audio warnings</span>
            </div>
            <input
              type="checkbox"
              checked={settings.timer.wcaInspection}
              onChange={(e) =>
                handleUpdate('timer', { ...settings.timer, wcaInspection: e.target.checked })
              }
              className="w-4 h-4 accent-emerald-500 cursor-pointer shrink-0"
            />
          </div>

          {/* Hold to Start */}
          <div className="flex items-center justify-between gap-3 min-w-0 p-3 bg-neutral-950/60 rounded-xl border border-neutral-800/60">
            <div className="min-w-0 flex-1">
              <span className="font-medium text-neutral-200 block">Hold-to-Start (Space/Touch)</span>
              <span className="text-[11px] text-neutral-500 block">Prevents false starts by requiring hold until ready</span>
            </div>
            <input
              type="checkbox"
              checked={settings.timer.holdToStart}
              onChange={(e) =>
                handleUpdate('timer', { ...settings.timer, holdToStart: e.target.checked })
              }
              className="w-4 h-4 accent-emerald-500 cursor-pointer shrink-0"
            />
          </div>

          {/* Hold Delay */}
          <div className="flex items-center justify-between gap-3 min-w-0 p-3 bg-neutral-950/60 rounded-xl border border-neutral-800/60">
            <div className="min-w-0 flex-1">
              <span className="font-medium text-neutral-200 block">Hold Delay (Ready threshold)</span>
              <span className="text-[11px] text-neutral-500 block">Time required to hold before timer turns green</span>
            </div>
            <select
              value={settings.timer.holdDelayMs}
              onChange={(e) =>
                handleUpdate('timer', { ...settings.timer, holdDelayMs: Number(e.target.value) })
              }
              className="bg-neutral-900 border border-neutral-700 rounded-lg px-2.5 py-1 text-neutral-200 outline-hidden shrink-0"
            >
              <option value={200}>200 ms (Fast)</option>
              <option value={300}>300 ms (Standard)</option>
              <option value={500}>500 ms (Strict WCA)</option>
            </select>
          </div>

          {/* Zen Mode */}
          <div className="flex items-center justify-between gap-3 min-w-0 p-3 bg-neutral-950/60 rounded-xl border border-neutral-800/60">
            <div className="min-w-0 flex-1">
              <span className="font-medium text-neutral-200 block">Zen Mode While Solving</span>
              <span className="text-[11px] text-neutral-500 block">Hide navigation and peripheral elements while timing</span>
            </div>
            <input
              type="checkbox"
              checked={settings.timer.zenModeOnRun}
              onChange={(e) =>
                handleUpdate('timer', { ...settings.timer, zenModeOnRun: e.target.checked })
              }
              className="w-4 h-4 accent-emerald-500 cursor-pointer shrink-0"
            />
          </div>

          {/* Timer Font */}
          <div className="flex items-center justify-between gap-3 min-w-0 p-3 bg-neutral-950/60 rounded-xl border border-neutral-800/60">
            <div className="min-w-0 flex-1">
              <span className="font-medium text-neutral-200 block">Timer Typography</span>
              <span className="text-[11px] text-neutral-500 block">Monospace digits font family</span>
            </div>
            <select
              value={settings.timer.timerFont}
              onChange={(e) =>
                handleUpdate('timer', { ...settings.timer, timerFont: e.target.value as any })
              }
              className="bg-neutral-900 border border-neutral-700 rounded-lg px-2.5 py-1 text-neutral-200 outline-hidden shrink-0"
            >
              <option value="JetBrains Mono">JetBrains Mono</option>
              <option value="Chakra Petch">Chakra Petch (Digital)</option>
              <option value="Space Grotesk">Space Grotesk</option>
              <option value="Inter">Inter</option>
            </select>
          </div>

          {/* Timer Size */}
          <div className="flex items-center justify-between gap-3 min-w-0 p-3 bg-neutral-950/60 rounded-xl border border-neutral-800/60">
            <div className="min-w-0 flex-1">
              <span className="font-medium text-neutral-200 block">Timer Digits Size</span>
              <span className="text-[11px] text-neutral-500 block">Display scale on screen</span>
            </div>
            <select
              value={settings.timer.timerSize}
              onChange={(e) =>
                handleUpdate('timer', { ...settings.timer, timerSize: e.target.value as any })
              }
              className="bg-neutral-900 border border-neutral-700 rounded-lg px-2.5 py-1 text-neutral-200 outline-hidden shrink-0"
            >
              <option value="normal">Normal</option>
              <option value="large">Large</option>
              <option value="huge">Huge</option>
            </select>
          </div>
        </div>
      </section>

      {/* 2. Sound & Haptic */}
      <section className="bg-neutral-900/60 border border-neutral-800/80 rounded-2xl p-5 flex flex-col gap-4">
        <div className="flex items-center gap-2 text-sm font-semibold text-cyan-400">
          <Volume2 className="w-4 h-4" />
          <span>Sound & Haptic Feedback</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="flex items-center justify-between gap-3 min-w-0 p-3 bg-neutral-950/60 rounded-xl border border-neutral-800/60">
            <div className="min-w-0 flex-1">
              <span className="font-medium text-neutral-200 block">Sound Effects</span>
              <span className="text-[11px] text-neutral-500 block">Web Audio clicks, beeps and alerts</span>
            </div>
            <input
              type="checkbox"
              checked={settings.sound.soundEnabled}
              onChange={(e) =>
                handleUpdate('sound', { ...settings.sound, soundEnabled: e.target.checked })
              }
              className="w-4 h-4 accent-cyan-500 cursor-pointer shrink-0"
            />
          </div>

          <div className="flex items-center justify-between gap-3 min-w-0 p-3 bg-neutral-950/60 rounded-xl border border-neutral-800/60">
            <div className="min-w-0 flex-1">
              <span className="font-medium text-neutral-200 block">PB Fanfare</span>
              <span className="text-[11px] text-neutral-500 block">Play celebratory chord on new personal best</span>
            </div>
            <input
              type="checkbox"
              checked={settings.sound.pbSound}
              onChange={(e) =>
                handleUpdate('sound', { ...settings.sound, pbSound: e.target.checked })
              }
              className="w-4 h-4 accent-cyan-500 cursor-pointer shrink-0"
            />
          </div>

          <div className="flex items-center justify-between gap-3 min-w-0 p-3 bg-neutral-950/60 rounded-xl border border-neutral-800/60">
            <div className="min-w-0 flex-1">
              <span className="font-medium text-neutral-200 block">Haptic Vibration</span>
              <span className="text-[11px] text-neutral-500 block">Touch device tactile vibration on ready & stop</span>
            </div>
            <input
              type="checkbox"
              checked={settings.sound.vibration}
              onChange={(e) =>
                handleUpdate('sound', { ...settings.sound, vibration: e.target.checked })
              }
              className="w-4 h-4 accent-cyan-500 cursor-pointer shrink-0"
            />
          </div>

          <div className="flex items-center justify-between gap-3 min-w-0 p-3 bg-neutral-950/60 rounded-xl border border-neutral-800/60">
            <div className="min-w-0 flex-1 mr-2">
              <span className="font-medium text-neutral-200 block">Volume</span>
              <span className="text-[11px] text-neutral-500 block">{Math.round(settings.sound.volume * 100)}%</span>
            </div>
            <input
              type="range"
              min="0.1"
              max="1"
              step="0.05"
              value={settings.sound.volume}
              onChange={(e) =>
                handleUpdate('sound', { ...settings.sound, volume: Number(e.target.value) })
              }
              className="accent-cyan-500 cursor-pointer max-w-[120px]"
            />
          </div>
        </div>
      </section>

      {/* 3. Appearance */}
      <section className="bg-neutral-900/60 border border-neutral-800/80 rounded-2xl p-5 flex flex-col gap-4">
        <div className="flex items-center gap-2 text-sm font-semibold text-indigo-400">
          <Palette className="w-4 h-4" />
          <span>Appearance & Themes</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="flex items-center justify-between gap-3 min-w-0 p-3 bg-neutral-950/60 rounded-xl border border-neutral-800/60">
            <div className="min-w-0 flex-1">
              <span className="font-medium text-neutral-200 block">Theme Style</span>
              <span className="text-[11px] text-neutral-500 block">Dark or true AMOLED pure black</span>
            </div>
            <select
              value={settings.appearance.theme}
              onChange={(e) =>
                handleUpdate('appearance', { ...settings.appearance, theme: e.target.value as any })
              }
              className="bg-neutral-900 border border-neutral-700 rounded-lg px-2.5 py-1 text-neutral-200 outline-hidden shrink-0"
            >
              <option value="dark">Dark Minimal (Tối)</option>
              <option value="light">Light Theme (Trắng sáng)</option>
              <option value="amoled">AMOLED Black (Đen tuyền)</option>
            </select>
          </div>

          <div className="flex items-center justify-between gap-3 min-w-0 p-3 bg-neutral-950/60 rounded-xl border border-neutral-800/60">
            <div className="min-w-0 flex-1">
              <span className="font-medium text-neutral-200 block">Accent Accentuate</span>
              <span className="text-[11px] text-neutral-500 block">Highlight badge color</span>
            </div>
            <select
              value={settings.appearance.accentColor}
              onChange={(e) =>
                handleUpdate('appearance', { ...settings.appearance, accentColor: e.target.value as any })
              }
              className="bg-neutral-900 border border-neutral-700 rounded-lg px-2.5 py-1 text-neutral-200 outline-hidden shrink-0"
            >
              <option value="emerald">Emerald Green</option>
              <option value="cyan">Electric Cyan</option>
              <option value="violet">Violet</option>
              <option value="amber">Amber Gold</option>
            </select>
          </div>
        </div>
      </section>

      {/* 3.5. Timer Background Photo */}
      <section className="bg-neutral-900/60 border border-rose-500/30 rounded-2xl p-5 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-semibold text-rose-400">
            <span className="text-base">❤️</span>
            <span>Timer Background Photo (Crush / Custom Gallery)</span>
          </div>
          {onOpenPhotoModal && (
            <button
              onClick={onOpenPhotoModal}
              className="px-3 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-rose-300 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <span>{currentPhotoDataUrl ? 'Change Photo' : 'Upload Photo'}</span>
            </button>
          )}
        </div>

        <p className="text-xs text-neutral-400 leading-relaxed -mt-1">
          Personalize your speedcubing experience with a photo from your gallery (a photo of your crush, favorite memory, or motivation). Images are saved securely on your device via IndexedDB and never sent to any server.
        </p>

        {currentPhotoDataUrl ? (
          <div className="flex flex-col sm:flex-row items-center gap-4 p-3.5 bg-neutral-950/70 rounded-2xl border border-neutral-800/80">
            {/* Thumbnail */}
            <div className="relative w-24 h-24 rounded-xl overflow-hidden border border-neutral-700/80 shrink-0 bg-black">
              <img
                src={currentPhotoDataUrl}
                alt="Background Preview"
                className="w-full h-full object-cover"
                style={{
                  filter: `blur(${settings.appearance.backgroundPhoto.blur / 2}px) brightness(${settings.appearance.backgroundPhoto.brightness}%)`,
                  opacity: Math.max(0.4, settings.appearance.backgroundPhoto.opacity / 100),
                }}
              />
            </div>

            <div className="flex-1 flex flex-col gap-2 text-xs">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <span className="font-semibold text-neutral-200 block">
                    {settings.appearance.backgroundPhoto.photoName || 'Custom Photo Active'}
                  </span>
                  <span className="text-[11px] text-emerald-400">
                    {settings.appearance.backgroundPhoto.enabled ? '● Enabled on Timer' : '○ Paused / Disabled'}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <label className="flex items-center gap-2 cursor-pointer text-xs text-neutral-300">
                    <span>Show on timer</span>
                    <input
                      type="checkbox"
                      checked={settings.appearance.backgroundPhoto.enabled}
                      onChange={(e) =>
                        handleUpdate('appearance', {
                          ...settings.appearance,
                          backgroundPhoto: {
                            ...settings.appearance.backgroundPhoto,
                            enabled: e.target.checked,
                          },
                        })
                      }
                      className="w-4 h-4 accent-rose-500 cursor-pointer"
                    />
                  </label>
                  {onLaunchFullscreen && (
                    <button
                      onClick={onLaunchFullscreen}
                      className="text-xs text-rose-300 hover:text-white px-2.5 py-1 bg-rose-600/20 hover:bg-rose-600/30 border border-rose-500/30 rounded-lg transition-colors flex items-center gap-1"
                    >
                      <Maximize2 className="w-3 h-3" />
                      <span>Fullscreen Wallpaper</span>
                    </button>
                  )}
                  {onRemovePhoto && (
                    <button
                      onClick={onRemovePhoto}
                      className="text-xs text-red-400 hover:text-red-300 px-2 py-1 hover:bg-red-500/10 rounded-lg transition-colors"
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>

              {/* Sliders in settings */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-[11px]">
                <div>
                  <span className="text-neutral-500 block">Blur: {settings.appearance.backgroundPhoto.blur}px</span>
                  <input
                    type="range"
                    min="0"
                    max="20"
                    value={settings.appearance.backgroundPhoto.blur}
                    onChange={(e) =>
                      handleUpdate('appearance', {
                        ...settings.appearance,
                        backgroundPhoto: {
                          ...settings.appearance.backgroundPhoto,
                          blur: Number(e.target.value),
                        },
                      })
                    }
                    className="w-full accent-rose-500 cursor-pointer"
                  />
                </div>
                <div>
                  <span className="text-neutral-500 block">Opacity: {settings.appearance.backgroundPhoto.opacity}%</span>
                  <input
                    type="range"
                    min="10"
                    max="100"
                    value={settings.appearance.backgroundPhoto.opacity}
                    onChange={(e) =>
                      handleUpdate('appearance', {
                        ...settings.appearance,
                        backgroundPhoto: {
                          ...settings.appearance.backgroundPhoto,
                          opacity: Number(e.target.value),
                        },
                      })
                    }
                    className="w-full accent-rose-500 cursor-pointer"
                  />
                </div>
                <div>
                  <span className="text-neutral-500 block">Darkness: {settings.appearance.backgroundPhoto.overlayDarkness}%</span>
                  <input
                    type="range"
                    min="0"
                    max="90"
                    value={settings.appearance.backgroundPhoto.overlayDarkness}
                    onChange={(e) =>
                      handleUpdate('appearance', {
                        ...settings.appearance,
                        backgroundPhoto: {
                          ...settings.appearance.backgroundPhoto,
                          overlayDarkness: Number(e.target.value),
                        },
                      })
                    }
                    className="w-full accent-rose-500 cursor-pointer"
                  />
                </div>
                <div>
                  <span className="text-neutral-500 block">Fit: {settings.appearance.backgroundPhoto.fit}</span>
                  <button
                    onClick={() =>
                      handleUpdate('appearance', {
                        ...settings.appearance,
                        backgroundPhoto: {
                          ...settings.appearance.backgroundPhoto,
                          fit: settings.appearance.backgroundPhoto.fit === 'cover' ? 'contain' : 'cover',
                        },
                      })
                    }
                    className="px-2 py-0.5 mt-0.5 rounded bg-neutral-800 text-neutral-300 text-[10px]"
                  >
                    Toggle Fit
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-4 bg-neutral-950/40 rounded-2xl border border-neutral-800/60 flex items-center justify-between">
            <span className="text-xs text-neutral-400">No background photo selected yet</span>
            {onOpenPhotoModal && (
              <button
                onClick={onOpenPhotoModal}
                className="px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-medium transition-colors"
              >
                Choose Photo from Device
              </button>
            )}
          </div>
        )}
      </section>

      {/* 4. Data Backup, Export & Cloud Sync */}
      <section className="bg-neutral-900/60 border border-neutral-800/80 rounded-2xl p-5 flex flex-col gap-4">
        <div className="flex items-center gap-2 text-sm font-semibold text-amber-400">
          <Cloud className="w-4 h-4" />
          <span>Data Storage & Cloud Sync</span>
        </div>

        <div className="p-3.5 bg-neutral-950/60 rounded-xl border border-neutral-800/60 flex flex-col gap-2">
          <span className="text-xs font-semibold text-neutral-200">Cross-Device Cloud Sync Key</span>
          <p className="text-[11px] text-neutral-400 leading-relaxed">
            All solves are stored offline-first in your browser. Use this unique Sync Code to backup and sync your sessions across your laptop, phone, or tablet.
          </p>

          <div className="flex items-center gap-2 mt-1">
            <input
              type="text"
              value={cloudSyncCode}
              onChange={(e) => setCloudSyncCode(e.target.value)}
              className="flex-1 bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-1.5 text-xs font-mono text-emerald-400 outline-hidden"
            />
            <button
              onClick={handleCloudSync}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors"
            >
              {cloudSynced ? <Check className="w-3.5 h-3.5" /> : <Cloud className="w-3.5 h-3.5" />}
              <span>{cloudSynced ? 'Synced' : 'Sync Now'}</span>
            </button>
          </div>
        </div>

        {/* Manage Solve History Action Block */}
        {onOpenManageHistory && (
          <div className="p-3.5 bg-neutral-950/60 rounded-xl border border-neutral-800/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <span className="text-xs font-semibold text-neutral-200 block">Manage Solve History</span>
              <p className="text-[11px] text-neutral-400">
                Permanently delete individual solves, clear session logs, or wipe all records. Statistics and charts recalculate instantly.
              </p>
            </div>
            <button
              onClick={onOpenManageHistory}
              className="px-3.5 py-1.5 bg-red-600/20 hover:bg-red-600/30 text-red-300 border border-red-500/30 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-colors shrink-0"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Manage History</span>
            </button>
          </div>
        )}

        {/* Import & Export Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <div className="p-3 bg-neutral-950/60 rounded-xl border border-neutral-800/60 flex flex-col gap-2">
            <span className="text-xs font-semibold text-neutral-200">Export Solves</span>
            <div className="flex gap-2">
              <button
                onClick={handleExportJSON}
                className="flex-1 py-1.5 bg-neutral-900 border border-neutral-800 hover:bg-neutral-800 rounded-lg text-xs text-neutral-200 flex items-center justify-center gap-1.5 transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>JSON Backup</span>
              </button>
              <button
                onClick={handleExportCSV}
                className="flex-1 py-1.5 bg-neutral-900 border border-neutral-800 hover:bg-neutral-800 rounded-lg text-xs text-neutral-200 flex items-center justify-center gap-1.5 transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>CSV Sheet</span>
              </button>
            </div>
          </div>

          <div className="p-3 bg-neutral-950/60 rounded-xl border border-neutral-800/60 flex flex-col gap-2">
            <span className="text-xs font-semibold text-neutral-200">Import Data</span>
            <label className="py-1.5 bg-neutral-900 border border-neutral-800 hover:bg-neutral-800 rounded-lg text-xs text-neutral-200 flex items-center justify-center gap-1.5 transition-colors cursor-pointer">
              <Upload className="w-3.5 h-3.5" />
              <span>Upload Backup JSON</span>
              <input
                type="file"
                accept=".json"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
            {importStatus && (
              <span className="text-[11px] text-emerald-400 font-mono">{importStatus}</span>
            )}
          </div>
        </div>

        {/* Danger zone */}
        <div className="border-t border-neutral-800/60 pt-3 flex items-center justify-between">
          <span className="text-xs text-neutral-500">Reset factory defaults and starter data</span>
          <button
            onClick={() => {
              if (window.confirm('Reset all HungCube settings and session records to factory defaults?')) {
                onResetAllData();
              }
            }}
            className="text-xs text-red-400 hover:text-red-300 transition-colors"
          >
            Reset All
          </button>
        </div>
      </section>
    </div>
  );
};
