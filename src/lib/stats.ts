import { Solve, StatResult } from '../types/cube';

// Format time in ms to MM:SS.cc or SS.cc
export function formatTime(ms: number | null | undefined, penalty: 'none' | '+2' | 'dnf' = 'none', decimalPlaces: number = 2): string {
  if (ms === null || ms === undefined || ms < 0 || ms === Infinity) {
    return 'DNF';
  }

  if (penalty === 'dnf') {
    return 'DNF';
  }

  const effectiveMs = penalty === '+2' ? ms + 2000 : ms;
  const totalSeconds = effectiveMs / 1000;
  const minutes = Math.floor(totalSeconds / 60);
  const remainingSeconds = totalSeconds % 60;

  let secString = remainingSeconds.toFixed(decimalPlaces);
  if (minutes > 0 && remainingSeconds < 10) {
    secString = '0' + secString;
  }

  const formatted = minutes > 0 ? `${minutes}:${secString}` : secString;
  return penalty === '+2' ? `${formatted}+` : formatted;
}

// Get effective numeric time for a solve (DNF = Infinity)
export function getSolveTime(solve: Solve): number {
  if (solve.penalty === 'dnf') return Infinity;
  return solve.penalty === '+2' ? solve.rawTime + 2000 : solve.rawTime;
}

// Calculate WCA Average of N
// For 5: drop 1 best, 1 worst, avg 3
// For 12: drop 1 best, 1 worst, avg 10
export function calculateAoN(solves: Solve[], n: number): number | null {
  if (solves.length < n) return null;
  const windowSolves = solves.slice(0, n); // most recent N solves
  const times = windowSolves.map(getSolveTime);

  // Count DNFs
  const dnfCount = times.filter(t => t === Infinity).length;
  // WCA rule: for Ao5 or Ao12, more than 1 DNF means the average is DNF
  const trimCount = Math.max(1, Math.ceil(n * 0.05));
  if (dnfCount > trimCount) {
    return Infinity;
  }

  // Sort times ascending
  const sorted = [...times].sort((a, b) => a - b);
  // Trim lowest `trimCount` and highest `trimCount`
  const trimmed = sorted.slice(trimCount, sorted.length - trimCount);
  
  if (trimmed.some(t => t === Infinity)) {
    return Infinity;
  }

  const sum = trimmed.reduce((acc, curr) => acc + curr, 0);
  return Math.round(sum / trimmed.length);
}

// Calculate Best and Current AoN across all solves (solves ordered from newest to oldest)
export function getStatSummaryForN(solves: Solve[], n: number): StatResult {
  if (solves.length < n) {
    return { current: null, best: null, count: solves.length };
  }

  const current = calculateAoN(solves, n);
  let best: number | null = null;

  // Scan through all sliding windows of size n
  // Note: solves[0] is newest, solves[solves.length-1] is oldest
  for (let i = 0; i <= solves.length - n; i++) {
    const subSolves = solves.slice(i, i + n);
    const avg = calculateAoN(subSolves, n);
    if (avg !== null && avg !== Infinity) {
      if (best === null || avg < best) {
        best = avg;
      }
    }
  }

  return { current, best, count: solves.length };
}

// Session Statistics Summary
export interface SessionStats {
  totalCount: number;
  validCount: number;
  bestSingle: number | null;
  worstSingle: number | null;
  mean: number | null;
  stdDev: number | null;
  ao5: StatResult;
  ao12: StatResult;
  ao25: StatResult;
  ao50: StatResult;
  ao100: StatResult;
  ao1000: StatResult;
  totalTimeMs: number;
}

export function computeSessionStats(solves: Solve[]): SessionStats {
  const totalCount = solves.length;
  const validSolves = solves.filter(s => s.penalty !== 'dnf');
  const validTimes = validSolves.map(getSolveTime);
  const totalTimeMs = validTimes.reduce((acc, t) => acc + t, 0);

  let bestSingle: number | null = null;
  let worstSingle: number | null = null;
  let mean: number | null = null;
  let stdDev: number | null = null;

  if (validTimes.length > 0) {
    bestSingle = Math.min(...validTimes);
    worstSingle = Math.max(...validTimes);
    mean = Math.round(totalTimeMs / validTimes.length);

    // Standard deviation
    if (validTimes.length > 1 && mean !== null) {
      const variance = validTimes.reduce((acc, t) => acc + Math.pow(t - mean!, 2), 0) / (validTimes.length - 1);
      stdDev = Math.round(Math.sqrt(variance));
    }
  }

  return {
    totalCount,
    validCount: validSolves.length,
    bestSingle,
    worstSingle,
    mean,
    stdDev,
    ao5: getStatSummaryForN(solves, 5),
    ao12: getStatSummaryForN(solves, 12),
    ao25: getStatSummaryForN(solves, 25),
    ao50: getStatSummaryForN(solves, 50),
    ao100: getStatSummaryForN(solves, 100),
    ao1000: getStatSummaryForN(solves, 1000),
    totalTimeMs
  };
}

// Time distribution data for histograms
export interface TimeBin {
  range: string;
  count: number;
}

export function computeTimeDistribution(solves: Solve[]): TimeBin[] {
  const validTimes = solves.filter(s => s.penalty !== 'dnf').map(getSolveTime);
  if (validTimes.length === 0) return [];

  const minSec = Math.floor(Math.min(...validTimes) / 1000);
  const maxSec = Math.ceil(Math.max(...validTimes) / 1000);

  // Choose sensible bucket step: 1s or 2s or 5s
  const spread = maxSec - minSec;
  const step = spread <= 10 ? 1 : spread <= 30 ? 2 : 5;

  const bins: Record<string, number> = {};
  const startBucket = Math.floor(minSec / step) * step;
  const endBucket = Math.ceil(maxSec / step) * step;

  for (let b = startBucket; b < endBucket; b += step) {
    bins[`${b}-${b + step}s`] = 0;
  }

  validTimes.forEach(t => {
    const sec = t / 1000;
    const bucket = Math.floor((sec - startBucket) / step) * step + startBucket;
    const key = `${bucket}-${bucket + step}s`;
    if (bins[key] !== undefined) {
      bins[key]++;
    }
  });

  return Object.entries(bins).map(([range, count]) => ({ range, count }));
}

// Chart progression history (chronological order)
export function computeProgressionData(solves: Solve[]) {
  // Chronological order: oldest to newest
  const chrono = [...solves].reverse();
  let runningBest: number | null = null;

  return chrono.map((s, idx) => {
    const timeSec = s.penalty === 'dnf' ? null : Number((getSolveTime(s) / 1000).toFixed(2));
    
    if (timeSec !== null) {
      if (runningBest === null || timeSec < runningBest) {
        runningBest = timeSec;
      }
    }

    // Ao5 up to this index
    const windowSlice = chrono.slice(0, idx + 1).reverse(); // newest first
    const ao5 = calculateAoN(windowSlice, 5);
    const ao12 = calculateAoN(windowSlice, 12);

    return {
      index: idx + 1,
      time: timeSec,
      ao5: ao5 && ao5 !== Infinity ? Number((ao5 / 1000).toFixed(2)) : null,
      ao12: ao12 && ao12 !== Infinity ? Number((ao12 / 1000).toFixed(2)) : null,
      pb: runningBest,
      date: new Date(s.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
  });
}
