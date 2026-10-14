import { Solve, Achievement } from '../types/cube';

export function calculateAchievements(
  solves: Solve[],
  learningStatus: Record<string, 'unlearned' | 'learning' | 'mastered'> = {}
): Achievement[] {
  const validSolves = solves.filter((s) => s.penalty !== 'dnf');
  const validTimes = validSolves.map((s) =>
    s.penalty === '+2' ? s.rawTime + 2000 : s.rawTime
  );
  const bestSingle = validTimes.length > 0 ? Math.min(...validTimes) : null;
  const totalCount = solves.length;

  // Distinct puzzles solved
  const puzzlesSet = new Set(solves.map((s) => s.puzzle));
  const distinctPuzzlesCount = puzzlesSet.size;

  // Mastered algorithms count
  const masteredCount = Object.values(learningStatus).filter((s) => s === 'mastered').length;

  // Longest streak without +2 or DNF
  let currentCleanStreak = 0;
  let maxCleanStreak = 0;
  // Chronological order for streak
  const chronological = [...solves].reverse();
  for (const solve of chronological) {
    if (solve.penalty === 'none') {
      currentCleanStreak++;
      if (currentCleanStreak > maxCleanStreak) {
        maxCleanStreak = currentCleanStreak;
      }
    } else {
      currentCleanStreak = 0;
    }
  }

  const list: Achievement[] = [
    {
      id: 'first_solve',
      title: 'First Step',
      description: 'Complete and record your first solve.',
      icon: 'zap',
      category: 'volume',
      unlocked: totalCount >= 1,
      progress: { current: Math.min(totalCount, 1), total: 1 },
    },
    {
      id: 'ten_solves',
      title: 'Double Digits',
      description: 'Log 10 solves in HungCube.',
      icon: 'award',
      category: 'volume',
      unlocked: totalCount >= 10,
      progress: { current: Math.min(totalCount, 10), total: 10 },
    },
    {
      id: 'fifty_solves',
      title: 'Speed Addict',
      description: 'Reach 50 recorded solves.',
      icon: 'target',
      category: 'volume',
      unlocked: totalCount >= 50,
      progress: { current: Math.min(totalCount, 50), total: 50 },
    },
    {
      id: 'hundred_solves',
      title: 'Centurion',
      description: 'Log 100 solves in HungCube.',
      icon: 'shield',
      category: 'volume',
      unlocked: totalCount >= 100,
      progress: { current: Math.min(totalCount, 100), total: 100 },
    },
    {
      id: 'sub_60',
      title: 'Sub-60 Club',
      description: 'Record an official solve under 1 minute (60.00s).',
      icon: 'clock',
      category: 'speed',
      unlocked: bestSingle !== null && bestSingle < 60000,
      progress: {
        current: bestSingle !== null && bestSingle < 60000 ? 1 : 0,
        total: 1,
      },
    },
    {
      id: 'sub_30',
      title: 'Sub-30 Milestone',
      description: 'Achieve a personal best single under 30.00 seconds.',
      icon: 'trending-up',
      category: 'speed',
      unlocked: bestSingle !== null && bestSingle < 30000,
      progress: {
        current: bestSingle !== null && bestSingle < 30000 ? 1 : 0,
        total: 1,
      },
    },
    {
      id: 'sub_20',
      title: 'Sub-20 Speedcuber',
      description: 'Break the 20-second barrier on any puzzle.',
      icon: 'sparkles',
      category: 'speed',
      unlocked: bestSingle !== null && bestSingle < 20000,
      progress: {
        current: bestSingle !== null && bestSingle < 20000 ? 1 : 0,
        total: 1,
      },
    },
    {
      id: 'sub_15',
      title: 'Sub-15 Pro',
      description: 'Execute a blazing solve under 15.00 seconds.',
      icon: 'flame',
      category: 'speed',
      unlocked: bestSingle !== null && bestSingle < 15000,
      progress: {
        current: bestSingle !== null && bestSingle < 15000 ? 1 : 0,
        total: 1,
      },
    },
    {
      id: 'sub_10',
      title: 'Sub-10 World Class',
      description: 'Record an extraordinary single under 10.00 seconds.',
      icon: 'trophy',
      category: 'speed',
      unlocked: bestSingle !== null && bestSingle < 10000,
      progress: {
        current: bestSingle !== null && bestSingle < 10000 ? 1 : 0,
        total: 1,
      },
    },
    {
      id: 'flawless_streak',
      title: 'Clean Execution',
      description: 'Achieve 10 consecutive clean solves with zero +2 or DNF penalties.',
      icon: 'check-circle',
      category: 'streak',
      unlocked: maxCleanStreak >= 10,
      progress: { current: Math.min(maxCleanStreak, 10), total: 10 },
    },
    {
      id: 'polymath',
      title: 'Puzzle Polymath',
      description: 'Complete solves across 3 or more different WCA puzzles.',
      icon: 'box',
      category: 'learning',
      unlocked: distinctPuzzlesCount >= 3,
      progress: { current: Math.min(distinctPuzzlesCount, 3), total: 3 },
    },
    {
      id: 'algo_scholar',
      title: 'CFOP Scholar',
      description: 'Mark at least 5 CFOP algorithms as Mastered in the library.',
      icon: 'book-open',
      category: 'learning',
      unlocked: masteredCount >= 5,
      progress: { current: Math.min(masteredCount, 5), total: 5 },
    },
  ];

  return list;
}
