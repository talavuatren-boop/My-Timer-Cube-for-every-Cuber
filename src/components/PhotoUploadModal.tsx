import React, { useState, useRef } from 'react';
import { TimerBackgroundSettings } from '../types/cube';
import { saveBackgroundPhoto, deleteBackgroundPhoto } from '../lib/imageStorage';
import {
  Image,
  Upload,
  X,
  Trash2,
  Check,
  Eye,
  Sliders,
  Sparkles,
  AlertCircle,
  RefreshCw,
  Heart,
  Maximize2,
} from 'lucide-react';

interface PhotoUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  backgroundSettings: TimerBackgroundSettings;
  currentPhotoDataUrl: string | null;
  onPhotoSaved: (dataUrl: string, name: string) => void;
  onPhotoRemoved: () => void;
  onSettingsChanged: (settings: TimerBackgroundSettings) => void;
  onLaunchFullscreen?: () => void;
}

const MAX_FILE_SIZE = 15 * 1024 * 1024; // 15MB
const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export const PhotoUploadModal: React.FC<PhotoUploadModalProps> = ({
  isOpen,
  onClose,
  backgroundSettings,
  currentPhotoDataUrl,
  onPhotoSaved,
  onPhotoRemoved,
  onSettingsChanged,
  onLaunchFullscreen,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentPhotoDataUrl);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Live adjustments
  const [preserveOriginal, setPreserveOriginal] = useState<boolean>(
    backgroundSettings.preserveOriginalColors ?? false
  );
  const [blur, setBlur] = useState<number>(backgroundSettings.blur);
  const [brightness, setBrightness] = useState<number>(backgroundSettings.brightness);
  const [opacity, setOpacity] = useState<number>(backgroundSettings.opacity);
  const [overlayDarkness, setOverlayDarkness] = useState<number>(backgroundSettings.overlayDarkness);
  const [fit, setFit] = useState<'cover' | 'contain'>(backgroundSettings.fit);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMsg(null);
    const file = e.target.files?.[0];
    if (!file) return;

    if (!ACCEPTED_TYPES.includes(file.type)) {
      setErrorMsg('Unsupported format. Please upload a JPG, PNG, or WebP image.');
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setErrorMsg(`File is too large (${(file.size / (1024 * 1024)).toFixed(1)}MB). Maximum allowed size is 15MB.`);
      return;
    }

    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setPreviewUrl(result);
    };
    reader.onerror = () => {
      setErrorMsg('Failed to read the selected image file. Please try another image.');
    };
    reader.readAsDataURL(file);
  };

  const handleApply = async () => {
    setIsSaving(true);
    setErrorMsg(null);

    try {
      let finalDataUrl = previewUrl;

      if (selectedFile && previewUrl) {
        // Save to IndexedDB
        const success = await saveBackgroundPhoto(previewUrl, {
          name: selectedFile.name,
          type: selectedFile.type,
          size: selectedFile.size,
        });

        if (!success) {
          setErrorMsg('Failed to store image in browser storage. Please try again or choose a smaller image.');
          setIsSaving(false);
          return;
        }

        onPhotoSaved(previewUrl, selectedFile.name);
      }

      // Update appearance background settings
      onSettingsChanged({
        ...backgroundSettings,
        enabled: true,
        hasPhoto: true,
        blur,
        brightness,
        opacity,
        overlayDarkness,
        fit,
        preserveOriginalColors: preserveOriginal,
      });

      setIsSaving(false);
      onClose();
    } catch (err: unknown) {
      const e = err as Error;
      setErrorMsg(`Save failed: ${e.message || 'Unknown error'}`);
      setIsSaving(false);
    }
  };

  const handleRemovePhoto = async () => {
    if (window.confirm('Remove timer background photo and restore default dark background?')) {
      await deleteBackgroundPhoto();
      setSelectedFile(null);
      setPreviewUrl(null);
      onPhotoRemoved();
      onSettingsChanged({
        ...backgroundSettings,
        enabled: false,
        hasPhoto: false,
      });
      onClose();
    }
  };

  const handleRestoreDefaults = () => {
    setBlur(4);
    setBrightness(65);
    setOpacity(45);
    setOverlayDarkness(50);
    setFit('cover');
    setPreserveOriginal(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-xl bg-neutral-900 border border-neutral-800 rounded-3xl p-5 sm:p-6 shadow-2xl flex flex-col gap-5 text-neutral-100 max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400">
              <Heart className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base flex items-center gap-1.5">
                Timer Background Photo
                <span className="text-[11px] text-rose-400 font-mono font-normal hidden sm:inline">
                  (Crush / Custom Gallery)
                </span>
              </h3>
              <p className="text-[11px] text-neutral-400">
                Stored privately in your browser storage. Never uploaded to external servers.
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

        {/* Error message alert */}
        {errorMsg && (
          <div className="p-3 bg-red-500/15 border border-red-500/30 rounded-xl flex items-center gap-2 text-xs text-red-300">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Upload Trigger / Dropzone */}
        <div className="flex flex-col gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleFileChange}
            className="hidden"
          />

          {!previewUrl ? (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-neutral-700 hover:border-emerald-500/60 rounded-2xl p-6 sm:p-8 flex flex-col items-center justify-center gap-3 cursor-pointer transition-all bg-neutral-950/40 hover:bg-neutral-950/80 group"
            >
              <div className="w-12 h-12 rounded-2xl bg-neutral-800 group-hover:bg-emerald-500/20 text-neutral-400 group-hover:text-emerald-400 flex items-center justify-center transition-colors">
                <Upload className="w-6 h-6" />
              </div>
              <div className="text-center">
                <span className="text-xs sm:text-sm font-semibold text-neutral-200 block">
                  Select Photo from Device
                </span>
                <span className="text-[11px] text-neutral-400 mt-0.5 block">
                  Supports JPG, PNG, WebP up to 15MB
                </span>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between p-2.5 bg-neutral-950 rounded-xl border border-neutral-800">
              <span className="text-xs text-neutral-300 truncate max-w-xs font-mono">
                {selectedFile ? selectedFile.name : backgroundSettings.photoName || 'Current Photo Active'}
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-2.5 py-1 text-xs bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded-lg transition-colors flex items-center gap-1"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Change</span>
                </button>
                <button
                  type="button"
                  onClick={handleRemovePhoto}
                  className="px-2 py-1 text-xs text-red-400 hover:bg-red-500/10 rounded-lg transition-colors flex items-center gap-1"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Live Simulation Preview */}
        {previewUrl && (
          <div className="flex flex-col gap-3">
            <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider flex items-center gap-1">
              <Eye className="w-3.5 h-3.5" />
              <span>Timer Readability Preview</span>
            </span>

            {/* Simulated Timer Frame */}
            <div className="relative w-full h-44 sm:h-52 rounded-2xl overflow-hidden border border-neutral-800 flex items-center justify-center bg-neutral-950">
              {/* Photo layer */}
              <div
                className="absolute inset-0 w-full h-full"
                style={{
                  backgroundImage: `url(${previewUrl})`,
                  backgroundSize: fit,
                  backgroundPosition: 'center',
                  backgroundRepeat: 'no-repeat',
                  filter: `blur(${blur}px) brightness(${brightness}%)`,
                  opacity: opacity / 100,
                }}
              />

              {/* Dark Overlay Dimming */}
              <div
                className="absolute inset-0 pointer-events-none"
                style={{ backgroundColor: `rgba(0, 0, 0, ${overlayDarkness / 100})` }}
              />

              {/* Simulated Timer Digits */}
              <div className="relative z-10 flex flex-col items-center drop-shadow-[0_2px_12px_rgba(0,0,0,0.9)]">
                <span className="text-[11px] font-mono text-neutral-400 mb-1">
                  R U R' U' R' F R2 U' R'
                </span>
                <span className="font-mono-timer text-4xl sm:text-5xl font-bold text-white tracking-tight">
                  12.45
                </span>
                <span className="text-[10px] text-emerald-400 font-semibold mt-1 bg-neutral-900/80 px-2 py-0.5 rounded-full border border-neutral-700/60">
                  READY
                </span>
              </div>
            </div>

            {/* Fine-Tuning Sliders */}
            <div className="bg-neutral-950/60 p-3.5 rounded-2xl border border-neutral-800/80 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {/* Blur */}
              <div className="flex flex-col gap-1">
                <div className="flex justify-between text-neutral-400 text-[11px]">
                  <span>Background Blur</span>
                  <span className="font-mono text-neutral-200">{blur}px</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="20"
                  step="1"
                  value={blur}
                  onChange={(e) => setBlur(Number(e.target.value))}
                  className="accent-emerald-500 cursor-pointer"
                />
              </div>

              {/* Opacity */}
              <div className="flex flex-col gap-1">
                <div className="flex justify-between text-neutral-400 text-[11px]">
                  <span>Photo Opacity</span>
                  <span className="font-mono text-neutral-200">{opacity}%</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="100"
                  step="5"
                  value={opacity}
                  onChange={(e) => setOpacity(Number(e.target.value))}
                  className="accent-emerald-500 cursor-pointer"
                />
              </div>

              {/* Brightness */}
              <div className="flex flex-col gap-1">
                <div className="flex justify-between text-neutral-400 text-[11px]">
                  <span>Brightness</span>
                  <span className="font-mono text-neutral-200">{brightness}%</span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="130"
                  step="5"
                  value={brightness}
                  onChange={(e) => setBrightness(Number(e.target.value))}
                  className="accent-emerald-500 cursor-pointer"
                />
              </div>

              {/* Overlay Darkness */}
              <div className="flex flex-col gap-1">
                <div className="flex justify-between text-neutral-400 text-[11px]">
                  <span>Dark Dimming Overlay</span>
                  <span className="font-mono text-neutral-200">{overlayDarkness}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="90"
                  step="5"
                  value={overlayDarkness}
                  onChange={(e) => setOverlayDarkness(Number(e.target.value))}
                  className="accent-emerald-500 cursor-pointer"
                />
              </div>
            </div>

            {/* Quick Presets / Restore Default sliders */}
            <div className="flex flex-wrap items-center justify-between text-xs pt-1 gap-2">
              <label className="flex items-center gap-1.5 cursor-pointer text-xs font-medium text-rose-300 bg-rose-500/10 px-2.5 py-1 rounded-xl border border-rose-500/30">
                <input
                  type="checkbox"
                  checked={preserveOriginal}
                  onChange={(e) => {
                    setPreserveOriginal(e.target.checked);
                    if (e.target.checked) {
                      setBlur(0);
                      setBrightness(100);
                      setOpacity(100);
                      setOverlayDarkness(0);
                    }
                  }}
                  className="w-3.5 h-3.5 accent-rose-500 cursor-pointer"
                />
                <span>Original Photo (0 Blur, 100% Clarity)</span>
              </label>

              <button
                type="button"
                onClick={handleRestoreDefaults}
                className="text-neutral-500 hover:text-neutral-300 transition-colors text-[11px]"
              >
                Reset Slider Defaults
              </button>

              <div className="flex items-center gap-1.5">
                <span className="text-neutral-500 text-[11px]">Fitting:</span>
                <button
                  type="button"
                  onClick={() => setFit(fit === 'cover' ? 'contain' : 'cover')}
                  className="px-2 py-0.5 rounded bg-neutral-800 text-neutral-300 text-[11px]"
                >
                  {fit === 'cover' ? 'Cover Screen' : 'Contain (Aspect)'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Footer Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-neutral-800 pt-3">
          {previewUrl && onLaunchFullscreen ? (
            <button
              type="button"
              onClick={() => {
                handleApply();
                onLaunchFullscreen();
              }}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-rose-600 hover:bg-rose-500 text-white flex items-center gap-1.5 transition-colors shadow-sm"
            >
              <Maximize2 className="w-3.5 h-3.5" />
              <span>Fullscreen Wallpaper Mode</span>
            </button>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs text-neutral-400 hover:text-neutral-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={!previewUrl || isSaving}
              onClick={handleApply}
              className="px-5 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white flex items-center gap-1.5 transition-colors shadow-lg shadow-emerald-900/30"
            >
              {isSaving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
              <span>Apply to Timer</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
