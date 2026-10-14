import React from 'react';
import {
  Timer as TimerIcon,
  BarChart3,
  BookOpen,
  Dumbbell,
  Box,
  Settings as SettingsIcon,
  HelpCircle,
  Sun,
  Moon,
} from 'lucide-react';

export type NavTab =
  | 'timer'
  | 'cube'
  | 'learn'
  | 'statistics'
  | 'settings'
  | 'sessions'
  | 'algorithms'
  | 'training';

interface NavbarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  isZenMode: boolean;
  onOpenGuide?: () => void;
  theme?: 'dark' | 'light' | 'amoled';
  onToggleTheme?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  isZenMode,
  onOpenGuide,
  theme = 'dark',
  onToggleTheme,
}) => {
  const isLight = theme === 'light';

  const isTabActive = (tabId: NavTab) => {
    if (tabId === 'learn') {
      return currentTab === 'learn' || currentTab === 'algorithms' || currentTab === 'training';
    }
    return currentTab === tabId;
  };

  const tabs: { id: NavTab; label: string; icon: React.ReactNode }[] = [
    { id: 'timer', label: 'Timer', icon: <TimerIcon className="w-4 h-4" /> },
    { id: 'cube', label: '3D Solver', icon: <Box className="w-4 h-4" /> },
    { id: 'learn', label: 'Learn & Drills', icon: <BookOpen className="w-4 h-4" /> },
    { id: 'statistics', label: 'Stats', icon: <BarChart3 className="w-4 h-4" /> },
    { id: 'settings', label: 'Settings', icon: <SettingsIcon className="w-4 h-4" /> },
  ];

  if (isZenMode) return null;

  return (
    <>
      {/* Desktop, iPad, PC & Landscape Header */}
      <header
        className={`w-full border-b sticky top-0 z-30 px-3 sm:px-4 py-2 sm:py-2.5 transition-colors ${
          isLight
            ? 'border-slate-200/90 bg-white/95 text-slate-800 shadow-xs'
            : 'border-neutral-800/80 bg-neutral-950/80 text-white backdrop-blur-md'
        }`}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
          {/* Brand Logo */}
          <div
            onClick={() => onSelectTab('timer')}
            className="flex items-center gap-2 sm:gap-2.5 cursor-pointer select-none group shrink-0"
          >
            <div className="w-7 h-7 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 group-hover:scale-105 transition-transform">
              <Box className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span
                  className={`font-bold text-sm tracking-tight font-display ${
                    isLight ? 'text-slate-900' : 'text-white'
                  }`}
                >
                  HungCube
                </span>
                <span className="text-[10px] text-emerald-500 font-mono font-medium hidden sm:inline">
                  PRO
                </span>
              </div>
              <span
                className={`text-[10px] block -mt-0.5 hidden sm:block ${
                  isLight ? 'text-slate-400' : 'text-neutral-500'
                }`}
              >
                Solve. Track. Improve.
              </span>
            </div>
          </div>

          {/* Desktop, iPad, PC & Landscape Nav Items */}
          <nav
            className={`hidden md:flex landscape:flex items-center gap-1 p-1 rounded-xl text-xs overflow-x-auto scrollbar-none max-w-full ${
              isLight
                ? 'bg-slate-100/90 border border-slate-200'
                : 'bg-neutral-900/60 border border-neutral-800/80'
            }`}
          >
            {tabs.map((tab) => {
              const isActive = isTabActive(tab.id);
              return (
                <button
                  key={tab.id}
                  onClick={() => onSelectTab(tab.id)}
                  className={`px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg flex items-center gap-1.5 transition-colors font-medium whitespace-nowrap shrink-0 ${
                    isActive
                      ? isLight
                        ? 'bg-white text-slate-900 font-bold shadow-xs border border-slate-200'
                        : 'bg-neutral-800 text-white font-semibold shadow-xs'
                      : isLight
                      ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                      : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-850/50'
                  }`}
                >
                  {tab.icon}
                  <span className="hidden sm:inline landscape:inline text-[11px] sm:text-xs">
                    {tab.label}
                  </span>
                </button>
              );
            })}
          </nav>

          {/* Header Action Buttons: Theme Switcher & Guide */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Quick Theme Toggle Button (Light/White vs Dark) */}
            {onToggleTheme && (
              <button
                onClick={onToggleTheme}
                className={`px-2.5 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs active:scale-95 ${
                  isLight
                    ? 'bg-amber-50 hover:bg-amber-100 border-amber-300 text-amber-800'
                    : 'bg-neutral-900 hover:bg-neutral-800 border-neutral-700 text-neutral-300'
                }`}
                title={isLight ? 'Chuyển sang Theme Tối (Dark mode)' : 'Chuyển sang Theme Trắng sáng (White theme)'}
              >
                {isLight ? (
                  <>
                    <Sun className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                    <span className="text-[11px] sm:text-xs">Sáng</span>
                  </>
                ) : (
                  <>
                    <Moon className="w-3.5 h-3.5 text-indigo-400" />
                    <span className="text-[11px] sm:text-xs">Tối</span>
                  </>
                )}
              </button>
            )}

            {/* Guide Button */}
            {onOpenGuide && (
              <button
                onClick={onOpenGuide}
                className="px-2.5 py-1.5 rounded-xl bg-teal-500/10 hover:bg-teal-500/20 border border-teal-500/30 text-teal-400 text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs active:scale-95"
                title="Hướng dẫn sử dụng & Mẹo Speedcubing"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span className="text-[11px] sm:text-xs">Hướng dẫn</span>
              </button>
            )}

            <div
              className={`text-[11px] font-mono hidden lg:block ${
                isLight ? 'text-slate-400' : 'text-neutral-500'
              }`}
            >
              WCA-Speedcubing
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Portrait Bottom Navigation (hidden on landscape, iPad & PC) */}
      <nav
        className={`md:hidden landscape:hidden fixed bottom-0 left-0 right-0 z-40 border-t backdrop-blur-md px-2 py-1.5 flex items-center justify-around transition-colors ${
          isLight
            ? 'bg-white/95 border-slate-200 text-slate-700'
            : 'bg-neutral-950/95 border-neutral-800/80 text-neutral-400'
        }`}
      >
        {tabs.map((tab) => {
          const isActive = isTabActive(tab.id);
          return (
            <button
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              className={`flex flex-col items-center justify-center p-1.5 rounded-xl transition-colors ${
                isActive
                  ? isLight
                    ? 'text-emerald-600 font-bold'
                    : 'text-emerald-400 font-medium'
                  : isLight
                  ? 'text-slate-400 hover:text-slate-600'
                  : 'text-neutral-500 hover:text-neutral-300'
              }`}
            >
              {tab.icon}
              <span className="text-[10px] mt-0.5">{tab.label}</span>
            </button>
          );
        })}
      </nav>
    </>
  );
};
