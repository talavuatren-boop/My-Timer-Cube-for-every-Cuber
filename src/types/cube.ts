export type PuzzleType = 
  | '3x3' 
  | '2x2' 
  | '4x4' 
  | '5x5' 
  | '6x6' 
  | '7x7' 
  | 'pyraminx' 
  | 'megaminx' 
  | 'skewb' 
  | 'sq1' 
  | 'clock';

export type PenaltyType = 'none' | '+2' | 'dnf';

export interface Solve {
  id: string;
  time: number; // in milliseconds (penalty added if +2)
  rawTime: number; // raw milliseconds
  penalty: PenaltyType;
  scramble: string;
  timestamp: number; // Date.now()
  sessionId: string;
  puzzle: PuzzleType;
  comment?: string;
  inspectionTimeMs?: number;
  tags?: string[];
}

export interface Session {
  id: string;
  name: string;
  puzzle: PuzzleType;
  createdAt: number;
}

export interface ScrambleHistoryItem {
  id: string;
  scramble: string;
  puzzle: PuzzleType;
  timestamp: number;
}

export type TimerStatus = 
  | 'idle' 
  | 'holding' 
  | 'ready' 
  | 'inspecting' 
  | 'inspecting_holding' 
  | 'inspecting_ready' 
  | 'running' 
  | 'stopped';

export interface TimerSettings {
  wcaInspection: boolean;
  inspectionTimeSeconds: number;
  holdToStart: boolean;
  holdDelayMs: number;
  timerFont: 'JetBrains Mono' | 'Chakra Petch' | 'Space Grotesk' | 'Inter';
  timerSize: 'normal' | 'large' | 'huge';
  autoScramble: boolean;
  confirmDelete: boolean;
  zenModeOnRun: boolean; // hide other UI elements while timer is running
}

export interface TimerBackgroundSettings {
  enabled: boolean;
  hasPhoto: boolean;
  photoName?: string;
  blur: number; // 0 to 25 px
  brightness: number; // 20 to 150 %
  opacity: number; // 10 to 100 %
  overlayDarkness: number; // 0 to 90 %
  fit: 'cover' | 'contain';
  fullscreenMode: boolean; // edge-to-edge dedicated wallpaper mode
  preserveOriginalColors: boolean; // 100% opacity, 0 blur, 0 darkness
  showScrambleInFullscreen: boolean;
  showTimerInFullscreen: boolean;
}

export interface AppearanceSettings {
  theme: 'dark' | 'light' | 'amoled';
  accentColor: 'emerald' | 'cyan' | 'violet' | 'amber' | 'rose' | 'blue';
  idleColor: string;
  readyColor: string;
  holdingColor: string;
  runningColor: string;
  pbColor: string;
  animationIntensity: 'full' | 'subtle' | 'off';
  show2DScramble: boolean;
  show3DCube: boolean;
  backgroundPhoto: TimerBackgroundSettings;
}

export interface SoundSettings {
  soundEnabled: boolean;
  inspectionWarnings: boolean;
  pbSound: boolean;
  volume: number; // 0 to 1
  vibration: boolean;
}

export interface StatisticsSettings {
  defaultAverage: 'ao5' | 'ao12' | 'ao100';
  showTps: boolean;
  showInspection: boolean;
  showCharts: boolean;
  confettiOnPb: boolean;
}

export interface AppSettings {
  timer: TimerSettings;
  appearance: AppearanceSettings;
  sound: SoundSettings;
  stats: StatisticsSettings;
  defaultPuzzle: PuzzleType;
  cloudSyncUrl?: string;
  cloudSyncKey?: string;
}

export interface PllArrow {
  from: [number, number]; // [col 0..2, row 0..2]
  to: [number, number];
  bidirectional?: boolean;
}

export interface SideYellowHighlight {
  top?: boolean[]; // [col 0..2]
  right?: boolean[]; // [row 0..2]
  bottom?: boolean[]; // [col 0..2]
  left?: boolean[]; // [row 0..2]
}

export interface AlgorithmCase {
  id: string;
  category: 'cross' | 'f2l' | 'oll' | 'pll' | '2look-oll' | '2look-pll' | 'coll' | 'zbll' | 'custom' | 'community';
  subCategory?: 'cross' | 'f2l' | 'oll' | 'pll' | '2look-oll' | '2look-pll' | 'coll' | 'zbll' | 'custom';
  name: string;
  caseNumber: number | string;
  group?: string;
  algorithm: string;
  alternativeAlgorithms: string[];
  setupScramble?: string;
  topColors?: string[][]; // 3x3 face color grid for top face preview
  sideColors?: {
    up?: string[];
    front?: string[];
    right?: string[];
    back?: string[];
    left?: string[];
    top?: string[];
    bottom?: string[];
  };
  sideYellow?: SideYellowHighlight;
  pllArrows?: PllArrow[];
  imageUrl?: string;
  notes?: string;
  learningStatus?: 'unlearned' | 'learning' | 'mastered';
  tags?: string[];
  isCustom?: boolean;
  author?: string;
  authorId?: string;
  isPublic?: boolean;
  likesCount?: number;
  createdAt?: number;
  updatedAt?: number;
}

export interface SavedScramble {
  id: string;
  title: string;
  scramble: string;
  movesCount: number;
  category: string;
  isFavorite?: boolean;
  createdAt: number;
  notes?: string;
}

export interface PracticeSessionRecord {
  id: string;
  caseId: string;
  caseName: string;
  category: string;
  timeMs: number;
  timestamp: number;
  success: boolean;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: number;
  category: 'speed' | 'volume' | 'streak' | 'learning';
  progress?: { current: number; total: number };
}

export interface StatResult {
  current: number | null;
  best: number | null;
  count: number;
}
