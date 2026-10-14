import {
  CubeState,
  FaceName,
  createCfopSolvedCube,
  applyAlgorithm,
  isCubeSolved,
  tokenizeAlgorithm,
} from './cubeModel';
import { ZBLL_DATABASE } from './zbllData';

// @ts-expect-error - rubiks-cube-solver has no TypeScript types
import * as rubiksCubeSolverModule from 'rubiks-cube-solver';

function getSolverFn(): (state: string, options?: { partitioned?: boolean }) => any {
  const mod = rubiksCubeSolverModule as any;
  if (typeof mod === 'function') return mod;
  if (typeof mod?.default === 'function') return mod.default;
  if (typeof mod?.rubiksCubeSolver === 'function') return mod.rubiksCubeSolver;
  if (typeof mod?.default?.default === 'function') return mod.default.default;
  return mod;
}

export type SolveStageType =
  | 'cross'
  | 'cross_f2l'
  | 'cross_f2l_oll'
  | 'full_cfop'
  | 'cross_f2l_zbll';

export interface StageSolutionStep {
  id: string;
  name: string;
  moves: string[];
  movesString: string;
}

export interface StageSolution {
  stageType: SolveStageType;
  title: string;
  description: string;
  moves: string[];
  movesString: string;
  steps: StageSolutionStep[];
  finalCubeState: CubeState;
  isFullySolved: boolean;
  moveCount: number;
}

// Map a move under z2 isomorphism (z2 conjugates U <-> D, R <-> L, F <-> F, B <-> B, M <-> M', E <-> E', S <-> S)
export function mapMoveUnderZ2(move: string): string {
  const m = move.replace(/prime/gi, "'").trim();
  const match = m.match(/^([UDFBLRxyzudfblrMES])(['2]?)$/);
  if (!match) return m;
  const base = match[1];
  const mod = match[2] || '';

  const map: Record<string, string> = {
    U: 'D',
    D: 'U',
    R: 'L',
    L: 'R',
    F: 'F',
    B: 'B',
    u: 'd',
    d: 'u',
    r: 'l',
    l: 'r',
    f: 'f',
    b: 'b',
    x: 'x',
    y: "y'",
    z: 'z',
    S: 'S',
  };

  // Slice move flips
  if (base === 'M') {
    if (mod === "'") return 'M';
    if (mod === '2') return 'M2';
    return "M'";
  }
  if (base === 'E') {
    if (mod === "'") return 'E';
    if (mod === '2') return 'E2';
    return "E'";
  }

  const newBase = map[base] || base;
  return `${newBase}${mod}`;
}

// Convert rubiks-cube-solver tokens
function convertSolverMoves(step: string): string[] {
  const clean = step.replace(/prime/gi, "'").trim();
  if (!clean) return [];
  const rawTokens = clean.split(/\s+/).filter(Boolean);
  return rawTokens.map(mapMoveUnderZ2);
}

// Fast lookup map for ZBLL 472 cases
let zbllBaseMap: Map<string, { id: string; name: string; alg: string }> | null = null;

function getTopLayerSignature(cube: CubeState): string {
  return [
    ...cube.U[0], ...cube.U[1], ...cube.U[2],
    ...cube.F[0], ...cube.R[0], ...cube.B[0], ...cube.L[0]
  ].join('');
}

function getOrInitZbllBaseMap() {
  if (zbllBaseMap) return zbllBaseMap;

  const map = new Map<string, { id: string; name: string; alg: string }>();
  const solved = createCfopSolvedCube();

  for (const c of ZBLL_DATABASE) {
    if (!c.setupScramble) continue;
    const caseState = applyAlgorithm(solved, c.setupScramble);
    const sig = getTopLayerSignature(caseState);
    if (!map.has(sig)) {
      map.set(sig, { id: c.id, name: c.name, alg: c.algorithm });
    }
  }

  zbllBaseMap = map;
  return map;
}

// Determine Edge Orientation (EO) on top Yellow layer
export function getTopEdgeOrientation(cube: CubeState): {
  isOriented: boolean;
  unorientedCount: number;
  eoAlg: string;
} {
  // Edges on U: UB [0,1], UL [1,0], UR [1,2], UF [2,1]
  const ub = cube.U[0][1] === 'Y';
  const ul = cube.U[1][0] === 'Y';
  const ur = cube.U[1][2] === 'Y';
  const uf = cube.U[2][1] === 'Y';

  const yellowCount = (ub ? 1 : 0) + (ul ? 1 : 0) + (ur ? 1 : 0) + (uf ? 1 : 0);

  if (yellowCount === 4) {
    return { isOriented: true, unorientedCount: 0, eoAlg: '' };
  }

  // Dot case (0 yellow edges)
  if (yellowCount === 0) {
    return {
      isOriented: false,
      unorientedCount: 4,
      eoAlg: "F R U R' U' F' U2 F U R U' R' F'",
    };
  }

  // Hook cases (adjacent 2 yellow edges)
  // Hook at Back-Left (UB and UL)
  if (ub && ul && !ur && !uf) {
    return { isOriented: false, unorientedCount: 2, eoAlg: "F U R U' R' F'" };
  }
  // Hook at Front-Left (UF and UL)
  if (uf && ul && !ur && !ub) {
    return { isOriented: false, unorientedCount: 2, eoAlg: "U F U R U' R' F'" };
  }
  // Hook at Front-Right (UF and UR)
  if (uf && ur && !ul && !ub) {
    return { isOriented: false, unorientedCount: 2, eoAlg: "U2 F U R U' R' F'" };
  }
  // Hook at Back-Right (UB and UR)
  if (ub && ur && !ul && !uf) {
    return { isOriented: false, unorientedCount: 2, eoAlg: "U' F U R U' R' F'" };
  }

  // Line cases (opposite 2 yellow edges)
  // Horizontal line (UL and UR)
  if (ul && ur && !ub && !uf) {
    return { isOriented: false, unorientedCount: 2, eoAlg: "F R U R' U' F'" };
  }
  // Vertical line (UB and UF)
  if (ub && uf && !ul && !ur) {
    return { isOriented: false, unorientedCount: 2, eoAlg: "U F R U R' U' F'" };
  }

  // Fallback
  return { isOriented: false, unorientedCount: 2, eoAlg: "F R U R' U' F'" };
}

function checkSolvedWithAuf(cube: CubeState): string | null {
  if (isCubeSolved(cube)) return '';
  for (const auf of ['U', 'U2', "U'"]) {
    if (isCubeSolved(applyAlgorithm(cube, auf))) return auf;
  }
  return null;
}

// Find 1-Look ZBLL solution with pre-rotation (y/AUF) and post-rotation
export function solveZbllFromOrientedState(cube: CubeState): {
  id: string;
  name: string;
  alg: string;
  tokens: string[];
} | null {
  const corners = [cube.U[0][0], cube.U[0][2], cube.U[2][0], cube.U[2][2]];
  const yellowCornerCount = corners.filter((c) => c === 'Y').length;

  // Filter ZBLL database by group for speed and precision
  let candidateCases = ZBLL_DATABASE;
  if (yellowCornerCount === 0) {
    candidateCases = ZBLL_DATABASE.filter((c) => (c.group || '').includes('H') || (c.group || '').includes('Pi'));
  } else if (yellowCornerCount === 1) {
    candidateCases = ZBLL_DATABASE.filter((c) => (c.group || '').includes('S'));
  } else if (yellowCornerCount === 2) {
    candidateCases = ZBLL_DATABASE.filter(
      (c) => (c.group || '').includes('T') || (c.group || '').includes('U') || (c.group || '').includes('L')
    );
  } else if (yellowCornerCount === 4) {
    // All 4 corners already oriented (OLL skip -> PLL case)
    return null;
  }

  const aufList = ['', 'U', 'U2', "U'"];
  const yList = ['', 'y', 'y2', "y'"];

  for (const c of candidateCases) {
    for (const y of yList) {
      const cubeY = y ? applyAlgorithm(cube, y) : cube;
      for (const auf of aufList) {
        const s = auf ? applyAlgorithm(cubeY, auf) : cubeY;
        const afterAlg = applyAlgorithm(s, c.algorithm);
        const postAuf = checkSolvedWithAuf(afterAlg);
        if (postAuf !== null) {
          const pre = [y, auf].filter(Boolean).join(' ');
          const fullMoves = [pre, c.algorithm, postAuf].filter(Boolean).join(' ');
          const tokens = tokenizeAlgorithm(fullMoves);
          return {
            id: c.id,
            name: c.name,
            alg: fullMoves,
            tokens,
          };
        }
      }
    }
  }

  return null;
}

/**
 * Solve a scrambled 3x3 Rubik's cube up to the selected stage.
 *
 * Supported Stages:
 * 1. 'cross': White Cross on D face only.
 * 2. 'cross_f2l': White Cross + all 4 First Two Layer slots.
 * 3. 'cross_f2l_oll': Cross + F2L + OLL (all top face stickers become yellow).
 * 4. 'full_cfop': Cross + F2L + OLL + PLL (fully solved).
 * 5. 'cross_f2l_zbll': Cross + F2L + 1-Look ZBLL (solves last layer in 1 formula).
 */
export function solveCubeStage(scramble: string, stage: SolveStageType): StageSolution {
  const initialCube = applyAlgorithm(createCfopSolvedCube(), scramble);

  // If already solved:
  if (isCubeSolved(initialCube)) {
    return {
      stageType: stage,
      title: 'Cube Already Solved',
      description: 'The cube is already in the solved state.',
      moves: [],
      movesString: '',
      steps: [],
      finalCubeState: initialCube,
      isFullySolved: true,
      moveCount: 0,
    };
  }

  // Convert cube to rubiks-cube-solver format under z2 transformation
  // This ensures White is solved as cross on bottom (D), and Yellow is top (U).
  const z2Cube = applyAlgorithm(initialCube, 'z2');
  const centerColors: Record<string, string> = {
    [z2Cube.F[1][1]]: 'f',
    [z2Cube.R[1][1]]: 'r',
    [z2Cube.U[1][1]]: 'u',
    [z2Cube.D[1][1]]: 'd',
    [z2Cube.L[1][1]]: 'l',
    [z2Cube.B[1][1]]: 'b',
  };

  const facesOrder: FaceName[] = ['F', 'R', 'U', 'D', 'L', 'B'];
  let stateStr = '';
  for (const f of facesOrder) {
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 3; c++) {
        stateStr += centerColors[z2Cube[f][r][c]] || 'u';
      }
    }
  }

  let rawSol: {
    cross: string[];
    f2l: string[];
    oll: string;
    pll: string;
  };

  try {
    const solveFn = getSolverFn();
    rawSol = solveFn(stateStr, { partitioned: true });
  } catch (err) {
    console.error('Solver failed for state:', err);
    return {
      stageType: stage,
      title: 'Solve Error',
      description: 'Could not compute solution for this cube state.',
      moves: [],
      movesString: '',
      steps: [],
      finalCubeState: initialCube,
      isFullySolved: false,
      moveCount: 0,
    };
  }

  // Extract individual steps:
  const crossSteps: StageSolutionStep[] = [];
  rawSol.cross.forEach((step, idx) => {
    const moves = convertSolverMoves(step);
    if (moves.length > 0) {
      crossSteps.push({
        id: `cross_edge_${idx + 1}`,
        name: `Cross Edge ${idx + 1}`,
        moves,
        movesString: moves.join(' '),
      });
    }
  });

  const f2lSteps: StageSolutionStep[] = [];
  rawSol.f2l.forEach((step, idx) => {
    const moves = convertSolverMoves(step);
    if (moves.length > 0) {
      f2lSteps.push({
        id: `f2l_pair_${idx + 1}`,
        name: `F2L Pair ${idx + 1}`,
        moves,
        movesString: moves.join(' '),
      });
    }
  });

  const ollMoves = convertSolverMoves(rawSol.oll);
  const ollStep: StageSolutionStep = {
    id: 'oll_stage',
    name: 'OLL (Orientation of Last Layer)',
    moves: ollMoves,
    movesString: ollMoves.join(' '),
  };

  const pllMoves = convertSolverMoves(rawSol.pll);
  const pllStep: StageSolutionStep = {
    id: 'pll_stage',
    name: 'PLL (Permutation of Last Layer)',
    moves: pllMoves,
    movesString: pllMoves.join(' '),
  };

  // Build the solution according to chosen stage
  let activeSteps: StageSolutionStep[] = [];
  let stageTitle = '';
  let stageDesc = '';

  switch (stage) {
    case 'cross': {
      activeSteps = [...crossSteps];
      stageTitle = 'White Cross (Bottom D-Face)';
      stageDesc = 'Solves the 4 White cross edges aligned with their center colors and stops.';
      break;
    }

    case 'cross_f2l': {
      activeSteps = [...crossSteps, ...f2lSteps];
      stageTitle = 'Cross + F2L (First Two Layers)';
      stageDesc = 'Solves the White cross and all 4 F2L corner-edge pairs, leaving the last layer untouched.';
      break;
    }

    case 'cross_f2l_oll': {
      activeSteps = [...crossSteps, ...f2lSteps, ollStep];
      stageTitle = 'Cross + F2L + OLL';
      stageDesc = 'Solves Cross, F2L, and orients all top yellow stickers (OLL), stopping before PLL.';
      break;
    }

    case 'full_cfop': {
      activeSteps = [...crossSteps, ...f2lSteps, ollStep, pllStep];
      stageTitle = 'Full CFOP (Fridrich Method)';
      stageDesc = 'Complete 4-stage CFOP solution: Cross → F2L → OLL → PLL.';
      break;
    }

    case 'cross_f2l_zbll': {
      // 1. First solve Cross and F2L
      const f2lAllMoves = [...crossSteps, ...f2lSteps].flatMap((s) => s.moves);
      let cubeAfterF2L = applyAlgorithm(initialCube, f2lAllMoves);

      activeSteps = [...crossSteps, ...f2lSteps];

      // 2. Check Edge Orientation on U face
      const eo = getTopEdgeOrientation(cubeAfterF2L);
      if (!eo.isOriented && eo.eoAlg) {
        const eoTokens = tokenizeAlgorithm(eo.eoAlg);
        activeSteps.push({
          id: 'zbll_eo',
          name: 'Edge Orientation (EO to form Yellow Cross)',
          moves: eoTokens,
          movesString: eo.eoAlg,
        });
        cubeAfterF2L = applyAlgorithm(cubeAfterF2L, eoTokens);
      }

      // 3. Look up authentic 1-Look ZBLL algorithm from 472 cases
      const zbllSol = solveZbllFromOrientedState(cubeAfterF2L);

      if (zbllSol) {
        activeSteps.push({
          id: zbllSol.id,
          name: `1-Look ZBLL (${zbllSol.name})`,
          moves: zbllSol.tokens,
          movesString: zbllSol.alg,
        });
      } else {
        // If not matched directly (e.g. OLL skip / pure PLL case or already solved):
        if (!isCubeSolved(cubeAfterF2L)) {
          // Check if solved with AUF
          let solvedWithAuf = false;
          for (const finishingAuf of ['', 'U', 'U2', "U'"]) {
            if (isCubeSolved(applyAlgorithm(cubeAfterF2L, finishingAuf))) {
              if (finishingAuf) {
                activeSteps.push({
                  id: 'auf_finish',
                  name: `AUF (${finishingAuf})`,
                  moves: [finishingAuf],
                  movesString: finishingAuf,
                });
              }
              solvedWithAuf = true;
              break;
            }
          }

          if (!solvedWithAuf) {
            // Solve PLL on cubeAfterF2L
            try {
              const z2Rem = applyAlgorithm(cubeAfterF2L, 'z2');
              const remColors: Record<string, string> = {
                [z2Rem.F[1][1]]: 'f',
                [z2Rem.R[1][1]]: 'r',
                [z2Rem.U[1][1]]: 'u',
                [z2Rem.D[1][1]]: 'd',
                [z2Rem.L[1][1]]: 'l',
                [z2Rem.B[1][1]]: 'b',
              };
              let remStr = '';
              for (const f of facesOrder) {
                for (let r = 0; r < 3; r++) {
                  for (let c = 0; c < 3; c++) {
                    remStr += remColors[z2Rem[f][r][c]] || 'u';
                  }
                }
              }
              const remSol = getSolverFn()(remStr, { partitioned: true });
              const remPll = convertSolverMoves(remSol.pll);
              if (remPll.length > 0) {
                activeSteps.push({
                  id: 'pll_finish',
                  name: 'PLL (Permutation of Last Layer)',
                  moves: remPll,
                  movesString: remPll.join(' '),
                });
              }
            } catch {
              if (pllMoves.length > 0) activeSteps.push(pllStep);
            }
          }
        }
      }

      stageTitle = 'Cross + F2L + 1-Look ZBLL';
      stageDesc = 'Solves Cross & F2L, then finishes the cube with a single 1-look ZBLL formula!';
      break;
    }
  }

  // Check if a final AUF completes the full solve
  if (
    (stage === 'full_cfop' || stage === 'cross_f2l_zbll') &&
    !isCubeSolved(applyAlgorithm(initialCube, activeSteps.flatMap((s) => s.moves)))
  ) {
    const curCube = applyAlgorithm(initialCube, activeSteps.flatMap((s) => s.moves));
    for (const finishAuf of ['U', 'U2', "U'"]) {
      if (isCubeSolved(applyAlgorithm(curCube, finishAuf))) {
        activeSteps.push({
          id: 'final_auf',
          name: `Final AUF (${finishAuf})`,
          moves: [finishAuf],
          movesString: finishAuf,
        });
        break;
      }
    }
  }

  // Combine moves
  const allMoves = activeSteps.flatMap((s) => s.moves);
  const movesString = allMoves.join(' ');
  const finalCubeState = applyAlgorithm(initialCube, allMoves);
  const isFullySolved = isCubeSolved(finalCubeState);

  return {
    stageType: stage,
    title: stageTitle,
    description: stageDesc,
    moves: allMoves,
    movesString,
    steps: activeSteps,
    finalCubeState,
    isFullySolved,
    moveCount: allMoves.length,
  };
}
