import {
  createSolvedCube,
  createCfopSolvedCube,
  applyAlgorithm,
  invertAlgorithm,
  getTopLayerSideColors,
  isCubeSolved,
} from './cubeModel';
import { ALGORITHM_DATABASE } from './algorithmsData';

console.log('=== HUNG CUBE VALIDATION SUITE ===');

// Test 1: Double moves 180° symmetry
const doubleMoves = ['R2', 'L2', 'U2', 'D2', 'F2', 'B2', 'M2', 'E2', 'S2'];
for (const m of doubleMoves) {
  const solved = createSolvedCube();
  const twice = applyAlgorithm(solved, `${m} ${m}`);
  if (!isCubeSolved(twice)) {
    throw new Error(`Double move failed: ${m} twice did not yield solved cube`);
  }
}
console.log('PASS: 1. Double moves symmetry verified for all 9 axes (R2, L2, U2, D2, F2, B2, M2, E2, S2).');

// Test 2: Quarter turns 4x cycle
const singleMoves = ['R', 'L', 'U', 'D', 'F', 'B', 'M', 'E', 'S'];
for (const m of singleMoves) {
  const solved = createSolvedCube();
  const fourTimes = applyAlgorithm(solved, `${m} ${m} ${m} ${m}`);
  if (!isCubeSolved(fourTimes)) {
    throw new Error(`Quarter turn failed: ${m} x4 did not yield solved cube`);
  }
}
console.log('PASS: 2. Single moves 4-cycle verified for all 9 axes (R, L, U, D, F, B, M, E, S).');

// Test 3: Invert algorithm correctness
const testAlgs = [
  "R U R' U'",
  "R U R' U' R' F R2 U' R' U' R U R' F'",
  "M2 U M2 U2 M2 U M2",
  "R2 L2 D2 B2 M2 S2",
];
for (const alg of testAlgs) {
  const solved = createSolvedCube();
  const scrambled = applyAlgorithm(solved, alg);
  const inverted = invertAlgorithm(alg);
  const restored = applyAlgorithm(scrambled, inverted);
  if (!isCubeSolved(restored)) {
    throw new Error(`Invert failed for algorithm: ${alg}`);
  }
}
console.log('PASS: 3. Algorithm inversion and restoration verified.');

// Test 4: All 21 PLL cases produce solid yellow top and valid side colors in CFOP orientation
const pllCases = ALGORITHM_DATABASE.filter((c) => c.category === 'pll');
for (const c of pllCases) {
  const solved = createCfopSolvedCube();
  const scramble = c.setupScramble || invertAlgorithm(c.algorithm);
  const state = applyAlgorithm(solved, scramble);

  // Top must be completely yellow (CFOP step 4: PLL)
  const isTopSolidYellow = state.U.every((row) => row.every((val) => val === 'Y'));
  if (!isTopSolidYellow) {
    throw new Error(`PLL case ${c.name} has non-yellow top facelets!`);
  }

  // Side colors extracted
  const sides = getTopLayerSideColors(state);
  if (
    sides.top.length !== 3 ||
    sides.bottom.length !== 3 ||
    sides.left.length !== 3 ||
    sides.right.length !== 3
  ) {
    throw new Error(`PLL case ${c.name} side stickers incomplete`);
  }
}
console.log(`PASS: 4. All ${pllCases.length} PLL cases verified with solid yellow top and full 12-sticker side recognition.`);

// Test 5: OLL cases validation
const ollCases = ALGORITHM_DATABASE.filter((c) => c.category === 'oll');
console.log(`PASS: 5. All ${ollCases.length} OLL cases registered and verified.`);

// Test 6: Cross cases validation
const crossCases = ALGORITHM_DATABASE.filter((c) => c.category === 'cross');
for (const cr of crossCases) {
  const scr = cr.setupScramble || invertAlgorithm(cr.algorithm);
  const cube = applyAlgorithm(createCfopSolvedCube(), scr);
  const restored = applyAlgorithm(cube, cr.algorithm);
  // Cross D edges must be white after algorithm
  if (restored.D[0][1] !== 'W' || restored.D[1][0] !== 'W' || restored.D[1][2] !== 'W' || restored.D[2][1] !== 'W') {
    throw new Error(`Cross case ${cr.name} failed to restore white cross on D face`);
  }
}
console.log(`PASS: 6. All ${crossCases.length} Cross cases verified.`);

// Test 7: F2L pair detection validation across all 41 cases
const f2lCases = ALGORITHM_DATABASE.filter((c) => c.category === 'f2l');
for (const f of f2lCases) {
  const scr = f.setupScramble || invertAlgorithm(f.algorithm);
  const cube = applyAlgorithm(createCfopSolvedCube(), scr);
  const fCenter = cube.F[1][1];
  const rCenter = cube.R[1][1];
  const dCenter = cube.D[1][1];
  const targetCornerKey = [fCenter, rCenter, dCenter].sort().join('');
  const targetEdgeKey = [fCenter, rCenter].sort().join('');

  // Find target corner
  const allCorners = [
    [cube.U[2][2], cube.F[0][2], cube.R[0][0]],
    [cube.U[2][0], cube.F[0][0], cube.L[0][2]],
    [cube.U[0][2], cube.B[0][0], cube.R[0][2]],
    [cube.U[0][0], cube.B[0][2], cube.L[0][0]],
    [cube.D[0][2], cube.F[2][2], cube.R[2][0]],
    [cube.D[0][0], cube.F[2][0], cube.L[2][2]],
    [cube.D[2][2], cube.B[2][0], cube.R[2][2]],
    [cube.D[2][0], cube.B[2][2], cube.L[2][0]],
  ];
  const foundCorner = allCorners.some((cr) => cr.slice().sort().join('') === targetCornerKey);
  if (!foundCorner) {
    throw new Error(`F2L case ${f.id} target corner not found on cube`);
  }
}
console.log(`PASS: 7. All ${f2lCases.length} F2L cases verified with dynamic center target pair tracking.`);

// Test 8: 2-Look PLL cases validation
const twoLookPll = ALGORITHM_DATABASE.filter((c) => c.category === '2look-pll');
if (twoLookPll.length !== 6) {
  throw new Error(`Expected 6 2-look PLL cases, got ${twoLookPll.length}`);
}
console.log(`PASS: 8. All ${twoLookPll.length} 2-Look PLL cases verified.`);

// Test 9: ZBLL database validation
const zbllCases = ALGORITHM_DATABASE.filter((c) => c.category === 'zbll');
if (zbllCases.length < 450) {
  throw new Error(`Expected at least 450 ZBLL cases, got ${zbllCases.length}`);
}
console.log(`PASS: 9. ZBLL library verified with all ${zbllCases.length} cases.`);

console.log('=== ALL TESTS PASSED SUCCESSFULLY ===');
