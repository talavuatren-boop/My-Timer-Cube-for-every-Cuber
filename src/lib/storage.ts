import { AppSettings, Session, Solve, PuzzleType } from '../types/cube';

export const DEFAULT_SETTINGS: AppSettings = {
  timer: {
    wcaInspection: false,
    inspectionTimeSeconds: 15,
    holdToStart: true,
    holdDelayMs: 300,
    timerFont: 'JetBrains Mono',
    timerSize: 'large',
    autoScramble: true,
    confirmDelete: false,
    zenModeOnRun: true,
  },
  appearance: {
    theme: 'dark',
    accentColor: 'emerald',
    idleColor: '#ffffff',
    readyColor: '#10b981', // green
    holdingColor: '#f59e0b', // amber
    runningColor: '#06b6d4', // cyan
    pbColor: '#fbbf24', // gold
    animationIntensity: 'full',
    show2DScramble: true,
    show3DCube: false,
    backgroundPhoto: {
      enabled: false,
      hasPhoto: false,
      blur: 4,
      brightness: 65,
      opacity: 45,
      overlayDarkness: 50,
      fit: 'cover',
      fullscreenMode: false,
      preserveOriginalColors: false,
      showScrambleInFullscreen: true,
      showTimerInFullscreen: true,
    },
  },
  sound: {
    soundEnabled: true,
    inspectionWarnings: true,
    pbSound: true,
    volume: 0.6,
    vibration: true,
  },
  stats: {
    defaultAverage: 'ao5',
    showTps: true,
    showInspection: true,
    showCharts: true,
    confettiOnPb: true,
  },
  defaultPuzzle: '3x3',
};

export const INITIAL_SESSIONS: Session[] = [
  { id: 'session_main_3x3', name: 'Main 3x3', puzzle: '3x3', createdAt: Date.now() },
  { id: 'session_warmup', name: 'Warmup', puzzle: '3x3', createdAt: Date.now() },
  { id: 'session_2x2', name: '2x2 Speed', puzzle: '2x2', createdAt: Date.now() },
  { id: 'session_4x4', name: '4x4 Practice', puzzle: '4x4', createdAt: Date.now() },
];

const STORAGE_KEYS = {
  SETTINGS: 'hungcube_settings_v1',
  SESSIONS: 'hungcube_sessions_v1',
  ACTIVE_SESSION: 'hungcube_active_session_v1',
  SOLVES: 'hungcube_solves_v1',
  FAVORITES: 'hungcube_favorite_algos_v1',
  LEARNING: 'hungcube_algo_learning_v1',
};

export function loadSettings(): AppSettings {
  if (typeof window === 'undefined') return DEFAULT_SETTINGS;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (!raw) return DEFAULT_SETTINGS;
    const parsed = JSON.parse(raw);
    return {
      ...DEFAULT_SETTINGS,
      ...parsed,
      appearance: {
        ...DEFAULT_SETTINGS.appearance,
        ...(parsed.appearance || {}),
        backgroundPhoto: {
          ...DEFAULT_SETTINGS.appearance.backgroundPhoto,
          ...(parsed.appearance?.backgroundPhoto || {}),
        },
      },
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: AppSettings): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  } catch (e) {
    console.error('Failed to save settings', e);
  }
}

export function loadSessions(): Session[] {
  if (typeof window === 'undefined') return INITIAL_SESSIONS;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SESSIONS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(INITIAL_SESSIONS));
      return INITIAL_SESSIONS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_SESSIONS;
  }
}

export function saveSessions(sessions: Session[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(sessions));
  } catch (e) {
    console.error('Failed to save sessions', e);
  }
}

export function loadActiveSessionId(): string {
  if (typeof window === 'undefined') return INITIAL_SESSIONS[0].id;
  try {
    const id = localStorage.getItem(STORAGE_KEYS.ACTIVE_SESSION);
    return id || INITIAL_SESSIONS[0].id;
  } catch {
    return INITIAL_SESSIONS[0].id;
  }
}

export function saveActiveSessionId(id: string): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_SESSION, id);
  } catch (e) {
    console.error(e);
  }
}

export function loadSolves(): Solve[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SOLVES);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    // Purge old starter dummy solves if present so users have zero fake solves
    const filtered = parsed.filter((s: Solve) => !s.id.startsWith('s_') || !['s_1','s_2','s_3','s_4','s_5','s_6','s_7'].includes(s.id));
    if (filtered.length !== parsed.length) {
      localStorage.setItem(STORAGE_KEYS.SOLVES, JSON.stringify(filtered));
    }
    return filtered;
  } catch {
    return [];
  }
}

export function saveSolves(solves: Solve[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEYS.SOLVES, JSON.stringify(solves));
  } catch (e) {
    console.error('Failed to save solves', e);
  }
}

export function loadFavoriteAlgos(): string[] {
  if (typeof window === 'undefined') return ['oll_21', 'pll_t', 'pll_ua'];
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.FAVORITES);
    return raw ? JSON.parse(raw) : ['oll_21', 'pll_t', 'pll_ua'];
  } catch {
    return ['oll_21', 'pll_t', 'pll_ua'];
  }
}

export function saveFavoriteAlgos(favs: string[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(favs));
  } catch (e) {
    console.error(e);
  }
}

export function loadAlgoLearningStatus(): Record<string, 'unlearned' | 'learning' | 'mastered'> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.LEARNING);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function saveAlgoLearningStatus(data: Record<string, 'unlearned' | 'learning' | 'mastered'>): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEYS.LEARNING, JSON.stringify(data));
  } catch (e) {
    console.error(e);
  }
}

// Export to JSON
export function exportDataAsJSON(): string {
  const exportPayload = {
    version: '1.0',
    app: 'HungCube',
    exportDate: new Date().toISOString(),
    sessions: loadSessions(),
    solves: loadSolves(),
    settings: loadSettings(),
    favorites: loadFavoriteAlgos(),
    learning: loadAlgoLearningStatus(),
  };
  return JSON.stringify(exportPayload, null, 2);
}

// Export Solves to CSV
export function exportSolvesAsCSV(solves: Solve[]): string {
  const header = 'ID,Timestamp,Date,Time(ms),Formatted,Penalty,RawTime(ms),Puzzle,SessionID,Scramble,Comment\n';
  const rows = solves.map(s => {
    const formatted = s.penalty === 'dnf' ? 'DNF' : (s.time / 1000).toFixed(2);
    const dateStr = new Date(s.timestamp).toISOString();
    const cleanScramble = `"${s.scramble.replace(/"/g, '""')}"`;
    const cleanComment = s.comment ? `"${s.comment.replace(/"/g, '""')}"` : '""';
    return `${s.id},${s.timestamp},${dateStr},${s.time},${formatted},${s.penalty},${s.rawTime},${s.puzzle},${s.sessionId},${cleanScramble},${cleanComment}`;
  });
  return header + rows.join('\n');
}

// Import JSON
export function importDataFromJSON(jsonString: string): { success: boolean; message: string; count?: number } {
  try {
    const data = JSON.parse(jsonString);
    if (!data.solves || !Array.isArray(data.solves)) {
      return { success: false, message: 'Invalid JSON format: Missing solves array' };
    }
    if (data.sessions && Array.isArray(data.sessions)) {
      saveSessions(data.sessions);
    }
    saveSolves(data.solves);
    if (data.settings) {
      saveSettings({ ...DEFAULT_SETTINGS, ...data.settings });
    }
    if (data.favorites) {
      saveFavoriteAlgos(data.favorites);
    }
    return { success: true, message: `Successfully imported ${data.solves.length} solves!`, count: data.solves.length };
  } catch (e: unknown) {
    const err = e as Error;
    return { success: false, message: `Failed to parse JSON: ${err.message}` };
  }
}

// --- SAVED SCRAMBLES STORAGE ---
const SAVED_SCRAMBLES_KEY = 'hungcube_saved_scrambles';

export function loadSavedScrambles(): import('../types/cube').SavedScramble[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(SAVED_SCRAMBLES_KEY);
    if (!raw) {
      // Default presets
      return [
        {
          id: 'preset_t_perm',
          title: 'T-Perm Scramble',
          scramble: "R U R' U' R' F R2 U' R' U' R U R' F'",
          movesCount: 14,
          category: 'PLL Pattern',
          isFavorite: true,
          createdAt: Date.now() - 100000,
        },
        {
          id: 'preset_superflip',
          title: 'Superflip (All 12 Edges Flipped)',
          scramble: "U R2 F B R B2 R U2 L B2 R U' D' R2 F R' L B2 U2 F2",
          movesCount: 20,
          category: 'Classic Patterns',
          isFavorite: true,
          createdAt: Date.now() - 200000,
        },
        {
          id: 'preset_checkerboard',
          title: 'Checkerboard Pattern',
          scramble: "M2 E2 S2",
          movesCount: 6,
          category: 'Classic Patterns',
          isFavorite: true,
          createdAt: Date.now() - 300000,
        },
      ];
    }
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveSavedScrambles(scrambles: import('../types/cube').SavedScramble[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(SAVED_SCRAMBLES_KEY, JSON.stringify(scrambles));
  } catch (e) {
    console.error(e);
  }
}

// --- CUSTOM & COMMUNITY CASES STORAGE ---
const CUSTOM_CASES_KEY = 'hungcube_custom_cases';
const COMMUNITY_CASES_KEY = 'hungcube_community_cases';

export function loadCustomCases(): import('../types/cube').AlgorithmCase[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(CUSTOM_CASES_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    const seen = new Set<string>();
    const deduplicated: import('../types/cube').AlgorithmCase[] = [];
    for (const item of parsed) {
      if (item && item.id && !seen.has(item.id)) {
        seen.add(item.id);
        deduplicated.push(item);
      }
    }
    return deduplicated;
  } catch {
    return [];
  }
}

export function saveCustomCases(cases: import('../types/cube').AlgorithmCase[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(CUSTOM_CASES_KEY, JSON.stringify(cases));
  } catch (e) {
    console.error(e);
  }
}

const INITIAL_COMMUNITY_CASES: import('../types/cube').AlgorithmCase[] = [
  {
    id: 'comm_v_perm_alt',
    category: 'community',
    subCategory: 'pll',
    name: "V-Perm (Smooth Fingertricks)",
    caseNumber: 'V-ALT',
    group: 'PLL Alternatives',
    algorithm: "R' U R' U' y R' F' R2 U' R' U R' F R F",
    alternativeAlgorithms: ["R' U R' d' R' F' R2 U' R' U R' F R F"],
    setupScramble: "F' R' F' R U' R U R2 F R y' U R U' R",
    author: 'SpeedyCuber99',
    authorId: 'user_wca_84',
    isPublic: true,
    likesCount: 54,
    createdAt: Date.now() - 86400000 * 4,
    notes: 'Diagonal corner swap (UBL <-> UFR) and edge swap (UB <-> UF). 2x2 block at back-left.',
    topColors: [
      ['Y', 'Y', 'Y'],
      ['Y', 'Y', 'Y'],
      ['Y', 'Y', 'Y'],
    ],
  },
  {
    id: 'comm_y_perm_fat',
    category: 'community',
    subCategory: 'pll',
    name: 'Y-Perm (Standard J-Perm Trigger)',
    caseNumber: 'Y-FW',
    group: 'PLL Alternatives',
    algorithm: "F R U' R' U' R U R' F' R U R' U' R' F R F'",
    alternativeAlgorithms: ["R2 U' R' U R U' x' z' R U' R' U' R U R'"],
    setupScramble: "F R' F' R U R U' R' F R U' R' U R U R' F'",
    author: 'J_Perm_Fanatic',
    authorId: 'user_jperm_12',
    isPublic: true,
    likesCount: 89,
    createdAt: Date.now() - 86400000 * 2,
    notes: 'Opposite corners (UBR <-> UFL) and adjacent edges swap.',
    topColors: [
      ['Y', 'Y', 'Y'],
      ['Y', 'Y', 'Y'],
      ['Y', 'Y', 'Y'],
    ],
  },
  {
    id: 'comm_t_perm_speed',
    category: 'community',
    subCategory: 'pll',
    name: 'T-Perm (Fingertrick Benchmark)',
    caseNumber: 'T-BENCH',
    group: 'PLL Alternatives',
    algorithm: "R U R' U' R' F R2 U' R' U' R U R' F'",
    alternativeAlgorithms: ["R2 U R2 U' R2 U' D R2 U' R2 U R2 D'"],
    setupScramble: "F R U' R' U R U R2 F' R U R U' R'",
    author: 'Feliks_Fan',
    authorId: 'user_feliks_01',
    isPublic: true,
    likesCount: 128,
    createdAt: Date.now() - 86400000 * 6,
    notes: 'Headlights on left. Swaps right two corners and front/back edges.',
    topColors: [
      ['Y', 'Y', 'Y'],
      ['Y', 'Y', 'Y'],
      ['Y', 'Y', 'Y'],
    ],
  },
  {
    id: 'comm_j_perm_speed',
    category: 'community',
    subCategory: 'pll',
    name: 'Jb-Perm (Lightning Fast)',
    caseNumber: 'JB-FAST',
    group: 'PLL Alternatives',
    algorithm: "R U R' F' R U R' U' R' F R2 U' R'",
    alternativeAlgorithms: ["R' U L' U2 R U' R' U2 R L"],
    setupScramble: "R U R2 F' R U R U' R' F R U' R'",
    author: 'SpeedyCuber99',
    authorId: 'user_wca_84',
    isPublic: true,
    likesCount: 142,
    createdAt: Date.now() - 86400000 * 3,
    notes: 'Bar on left. Swaps front-left and back-left corners and adjacent edges.',
    topColors: [
      ['Y', 'Y', 'Y'],
      ['Y', 'Y', 'Y'],
      ['Y', 'Y', 'Y'],
    ],
  },
  {
    id: 'comm_oll_21',
    category: 'community',
    subCategory: 'oll',
    name: 'OLL 21 (H-Shape Double Sune)',
    caseNumber: 'OLL 21',
    group: 'OLL Variants',
    algorithm: "R U2 R' U' R U R' U' R U' R'",
    alternativeAlgorithms: ["F R U R' U' R U R' U' R U R' U' F'"],
    setupScramble: "R U R' U R U' R' U R U2 R'",
    author: 'MaxPark_Official',
    authorId: 'user_max_77',
    isPublic: true,
    likesCount: 96,
    createdAt: Date.now() - 86400000 * 5,
    notes: 'Cross edges oriented, 4 corners unoriented (facing front and back).',
  },
  {
    id: 'comm_oll_57',
    category: 'community',
    subCategory: 'oll',
    name: 'OLL 57 (M-Slice Stealth)',
    caseNumber: 'OLL 57',
    group: 'OLL Variants',
    algorithm: "R U R' U' M' U R U' r'",
    alternativeAlgorithms: ["r' U' r R' U' R U r' U r"],
    setupScramble: "r U R' U' M U R U' R'",
    author: 'CubeHead_Vibes',
    authorId: 'user_cubehead_09',
    isPublic: true,
    likesCount: 65,
    createdAt: Date.now() - 86400000 * 3,
    notes: 'Smooth M-slice movement. 4 corners oriented on top, 2 middle edges flipped.',
  },
  {
    id: 'comm_oll_33',
    category: 'community',
    subCategory: 'oll',
    name: 'OLL 33 (T-Shape Sexy Trigger)',
    caseNumber: 'OLL 33',
    group: 'OLL Variants',
    algorithm: "R U R' U' R' F R F'",
    alternativeAlgorithms: ["F R' F' R U R U' R'"],
    setupScramble: "F R' F' R U R U' R'",
    author: 'SpeedyCuber99',
    authorId: 'user_wca_84',
    isPublic: true,
    likesCount: 47,
    createdAt: Date.now() - 86400000 * 1,
    notes: 'T-Shape: 3 yellow stickers bar, 2 headlights on side.',
  },
  {
    id: 'comm_oll_45',
    category: 'community',
    subCategory: 'oll',
    name: 'OLL 45 (T-Shape F-FRURUF)',
    caseNumber: 'OLL 45',
    group: 'OLL Variants',
    algorithm: "F R U R' U' F'",
    alternativeAlgorithms: ["f R U R' U' f'"],
    setupScramble: "F U R U' R' F'",
    author: 'Feliks_Fan',
    authorId: 'user_feliks_01',
    isPublic: true,
    likesCount: 78,
    createdAt: Date.now() - 86400000 * 2,
    notes: 'T-Shape cross with 2 unoriented corners facing opposite sides.',
  },
];

export function loadCommunityCases(): import('../types/cube').AlgorithmCase[] {
  if (typeof window === 'undefined') return INITIAL_COMMUNITY_CASES;
  try {
    const raw = localStorage.getItem(COMMUNITY_CASES_KEY);
    if (!raw) {
      localStorage.setItem(COMMUNITY_CASES_KEY, JSON.stringify(INITIAL_COMMUNITY_CASES));
      return INITIAL_COMMUNITY_CASES;
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      return INITIAL_COMMUNITY_CASES;
    }

    // Migrate any older format cases missing subCategory or with old scrambled states
    const upgraded: import('../types/cube').AlgorithmCase[] = parsed.map((c: import('../types/cube').AlgorithmCase) => {
      let subCat = c.subCategory;
      if (!subCat) {
        const text = `${c.name || ''} ${c.group || ''} ${c.caseNumber || ''} ${c.id || ''}`.toLowerCase();
        if (text.includes('pll') || text.includes('perm')) subCat = 'pll';
        else if (text.includes('oll')) subCat = 'oll';
      }

      // Ensure community copy of a custom case has unique comm_ prefix
      let caseId = c.id;
      if (caseId.startsWith('custom_')) {
        caseId = `comm_${caseId}`;
      }

      // Check if matching initial case has richer vector data (arrows / side yellow)
      const matchingInit = INITIAL_COMMUNITY_CASES.find((i) => i.id === c.id || i.id === caseId);
      if (matchingInit) {
        return {
          ...c,
          ...matchingInit,
          id: caseId,
          subCategory: (subCat || matchingInit.subCategory) as any,
          author: c.author || matchingInit.author,
          likesCount: Math.max(c.likesCount || 0, matchingInit.likesCount || 0),
        };
      }

      return {
        ...c,
        id: caseId,
        subCategory: subCat as any,
      };
    });

    // Ensure our new community cases are included if user only had the 2 older cases
    for (const initCase of INITIAL_COMMUNITY_CASES) {
      if (!upgraded.some((u) => u.id === initCase.id)) {
        upgraded.push(initCase);
      }
    }

    // Deduplicate any accidental duplicate ids
    const seenIds = new Set<string>();
    const deduplicated: import('../types/cube').AlgorithmCase[] = [];
    for (const item of upgraded) {
      if (!seenIds.has(item.id)) {
        seenIds.add(item.id);
        deduplicated.push(item);
      }
    }

    // Persist migrated and deduplicated community cases
    localStorage.setItem(COMMUNITY_CASES_KEY, JSON.stringify(deduplicated));
    return deduplicated;
  } catch {
    return INITIAL_COMMUNITY_CASES;
  }
}

export function saveCommunityCases(cases: import('../types/cube').AlgorithmCase[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(COMMUNITY_CASES_KEY, JSON.stringify(cases));
  } catch (e) {
    console.error(e);
  }
}

const SCRAMBLE_HISTORY_KEY = 'rubiks_scramble_history_v1';

export function loadScrambleHistory(): import('../types/cube').ScrambleHistoryItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(SCRAMBLE_HISTORY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed.slice(0, 20);
    }
    return [];
  } catch {
    return [];
  }
}

export function saveScrambleHistory(history: import('../types/cube').ScrambleHistoryItem[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(SCRAMBLE_HISTORY_KEY, JSON.stringify(history.slice(0, 20)));
  } catch (e) {
    console.error(e);
  }
}


