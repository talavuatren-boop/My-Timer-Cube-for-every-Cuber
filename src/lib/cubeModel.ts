// Mathematical 3x3x3 Rubik's Cube state model
// Represents each of the 6 faces as a 3x3 grid of colors/stickers
// Faces: U (Up/White), D (Down/Yellow), F (Front/Green), B (Back/Blue), L (Left/Orange), R (Right/Red)

export type FaceName = 'U' | 'D' | 'F' | 'B' | 'L' | 'R';
export type ColorCode = 'W' | 'Y' | 'G' | 'B' | 'O' | 'R' | 'N';

export const FACE_COLORS: Record<FaceName, ColorCode> = {
  U: 'W', // White
  D: 'Y', // Yellow
  F: 'G', // Green
  B: 'B', // Blue
  L: 'O', // Orange
  R: 'R', // Red
};

export const COLOR_HEX: Record<ColorCode, string> = {
  W: '#ffffff', // White
  Y: '#ffd500', // Yellow
  G: '#009b48', // Green
  B: '#0046ad', // Blue
  O: '#ff5800', // Orange
  R: '#b71234', // Red
  N: '#262626', // Neutral / Unoriented mask
};

export interface CubeState {
  U: ColorCode[][]; // 3x3 [row][col]
  D: ColorCode[][];
  F: ColorCode[][];
  B: ColorCode[][];
  L: ColorCode[][];
  R: ColorCode[][];
}

// Create a pristine solved cube
export function createSolvedCube(): CubeState {
  return {
    U: [
      ['W', 'W', 'W'],
      ['W', 'W', 'W'],
      ['W', 'W', 'W'],
    ],
    D: [
      ['Y', 'Y', 'Y'],
      ['Y', 'Y', 'Y'],
      ['Y', 'Y', 'Y'],
    ],
    F: [
      ['G', 'G', 'G'],
      ['G', 'G', 'G'],
      ['G', 'G', 'G'],
    ],
    B: [
      ['B', 'B', 'B'],
      ['B', 'B', 'B'],
      ['B', 'B', 'B'],
    ],
    L: [
      ['O', 'O', 'O'],
      ['O', 'O', 'O'],
      ['O', 'O', 'O'],
    ],
    R: [
      ['R', 'R', 'R'],
      ['R', 'R', 'R'],
      ['R', 'R', 'R'],
    ],
  };
}

// Deep clone a cube state
export function cloneCube(cube: CubeState): CubeState {
  return {
    U: cube.U.map((row) => [...row]),
    D: cube.D.map((row) => [...row]),
    F: cube.F.map((row) => [...row]),
    B: cube.B.map((row) => [...row]),
    L: cube.L.map((row) => [...row]),
    R: cube.R.map((row) => [...row]),
  };
}

// Rotate a 3x3 face clockwise
function rotateFaceCW(face: ColorCode[][]): ColorCode[][] {
  const result: ColorCode[][] = [
    ['N', 'N', 'N'],
    ['N', 'N', 'N'],
    ['N', 'N', 'N'],
  ];
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) {
      result[c][2 - r] = face[r][c];
    }
  }
  return result;
}

// Rotate a 3x3 face counter-clockwise
function rotateFaceCCW(face: ColorCode[][]): ColorCode[][] {
  const result: ColorCode[][] = [
    ['N', 'N', 'N'],
    ['N', 'N', 'N'],
    ['N', 'N', 'N'],
  ];
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) {
      result[2 - c][r] = face[r][c];
    }
  }
  return result;
}

// Rotate face 180 degrees
function rotateFace180(face: ColorCode[][]): ColorCode[][] {
  return rotateFaceCW(rotateFaceCW(face));
}

// Apply single quarter turn clockwise for primitive faces
export function applyBaseMove(cube: CubeState, move: string): CubeState {
  const c = cloneCube(cube);

  switch (move) {
    case 'U': {
      c.U = rotateFaceCW(c.U);
      const temp = [...c.F[0]];
      c.F[0] = [...c.R[0]];
      c.R[0] = [...c.B[0]];
      c.B[0] = [...c.L[0]];
      c.L[0] = temp;
      break;
    }
    case "U'": {
      c.U = rotateFaceCCW(c.U);
      const temp = [...c.F[0]];
      c.F[0] = [...c.L[0]];
      c.L[0] = [...c.B[0]];
      c.B[0] = [...c.R[0]];
      c.R[0] = temp;
      break;
    }
    case 'U2': {
      return applyBaseMove(applyBaseMove(cube, 'U'), 'U');
    }

    case 'D': {
      c.D = rotateFaceCW(c.D);
      const temp = [...c.F[2]];
      c.F[2] = [...c.L[2]];
      c.L[2] = [...c.B[2]];
      c.B[2] = [...c.R[2]];
      c.R[2] = temp;
      break;
    }
    case "D'": {
      c.D = rotateFaceCCW(c.D);
      const temp = [...c.F[2]];
      c.F[2] = [...c.R[2]];
      c.R[2] = [...c.B[2]];
      c.B[2] = [...c.L[2]];
      c.L[2] = temp;
      break;
    }
    case 'D2': {
      return applyBaseMove(applyBaseMove(cube, 'D'), 'D');
    }

    case 'R': {
      c.R = rotateFaceCW(c.R);
      const temp = [c.U[0][2], c.U[1][2], c.U[2][2]];
      for (let i = 0; i < 3; i++) {
        c.U[i][2] = c.F[i][2];
        c.F[i][2] = c.D[i][2];
        c.D[i][2] = c.B[2 - i][0];
        c.B[2 - i][0] = temp[i];
      }
      break;
    }
    case "R'": {
      c.R = rotateFaceCCW(c.R);
      const temp = [c.U[0][2], c.U[1][2], c.U[2][2]];
      for (let i = 0; i < 3; i++) {
        c.U[i][2] = c.B[2 - i][0];
        c.B[2 - i][0] = c.D[i][2];
        c.D[i][2] = c.F[i][2];
        c.F[i][2] = temp[i];
      }
      break;
    }
    case 'R2': {
      return applyBaseMove(applyBaseMove(cube, 'R'), 'R');
    }

    case 'L': {
      c.L = rotateFaceCW(c.L);
      const temp = [c.U[0][0], c.U[1][0], c.U[2][0]];
      for (let i = 0; i < 3; i++) {
        c.U[i][0] = c.B[2 - i][2];
        c.B[2 - i][2] = c.D[i][0];
        c.D[i][0] = c.F[i][0];
        c.F[i][0] = temp[i];
      }
      break;
    }
    case "L'": {
      c.L = rotateFaceCCW(c.L);
      const temp = [c.U[0][0], c.U[1][0], c.U[2][0]];
      for (let i = 0; i < 3; i++) {
        c.U[i][0] = c.F[i][0];
        c.F[i][0] = c.D[i][0];
        c.D[i][0] = c.B[2 - i][2];
        c.B[2 - i][2] = temp[i];
      }
      break;
    }
    case 'L2': {
      return applyBaseMove(applyBaseMove(cube, 'L'), 'L');
    }

    case 'F': {
      c.F = rotateFaceCW(c.F);
      const temp = [...c.U[2]];
      for (let i = 0; i < 3; i++) {
        c.U[2][i] = c.L[2 - i][2];
        c.L[2 - i][2] = c.D[0][2 - i];
        c.D[0][2 - i] = c.R[i][0];
        c.R[i][0] = temp[i];
      }
      break;
    }
    case "F'": {
      c.F = rotateFaceCCW(c.F);
      const temp = [...c.U[2]];
      for (let i = 0; i < 3; i++) {
        c.U[2][i] = c.R[i][0];
        c.R[i][0] = c.D[0][2 - i];
        c.D[0][2 - i] = c.L[2 - i][2];
        c.L[2 - i][2] = temp[i];
      }
      break;
    }
    case 'F2': {
      return applyBaseMove(applyBaseMove(cube, 'F'), 'F');
    }

    case 'B': {
      c.B = rotateFaceCW(c.B);
      const temp = [...c.U[0]];
      for (let i = 0; i < 3; i++) {
        c.U[0][i] = c.R[i][2];
        c.R[i][2] = c.D[2][2 - i];
        c.D[2][2 - i] = c.L[2 - i][0];
        c.L[2 - i][0] = temp[i];
      }
      break;
    }
    case "B'": {
      c.B = rotateFaceCCW(c.B);
      const temp = [...c.U[0]];
      for (let i = 0; i < 3; i++) {
        c.U[0][i] = c.L[2 - i][0];
        c.L[2 - i][0] = c.D[2][2 - i];
        c.D[2][2 - i] = c.R[i][2];
        c.R[i][2] = temp[i];
      }
      break;
    }
    case 'B2': {
      return applyBaseMove(applyBaseMove(cube, 'B'), 'B');
    }

    // Slice Moves: M, E, S
    // M follows L direction (between L and R, downwards on Front)
    case 'M': {
      const temp = [c.U[0][1], c.U[1][1], c.U[2][1]];
      for (let i = 0; i < 3; i++) {
        c.U[i][1] = c.B[2 - i][1];
        c.B[2 - i][1] = c.D[i][1];
        c.D[i][1] = c.F[i][1];
        c.F[i][1] = temp[i];
      }
      break;
    }
    case "M'": {
      const temp = [c.U[0][1], c.U[1][1], c.U[2][1]];
      for (let i = 0; i < 3; i++) {
        c.U[i][1] = c.F[i][1];
        c.F[i][1] = c.D[i][1];
        c.D[i][1] = c.B[2 - i][1];
        c.B[2 - i][1] = temp[i];
      }
      break;
    }
    case 'M2': {
      return applyBaseMove(applyBaseMove(cube, 'M'), 'M');
    }

    // E follows D direction (between U and D, rightwards on Front)
    case 'E': {
      const temp = [...c.F[1]];
      c.F[1] = [...c.L[1]];
      c.L[1] = [...c.B[1]];
      c.B[1] = [...c.R[1]];
      c.R[1] = temp;
      break;
    }
    case "E'": {
      const temp = [...c.F[1]];
      c.F[1] = [...c.R[1]];
      c.R[1] = [...c.B[1]];
      c.B[1] = [...c.L[1]];
      c.L[1] = temp;
      break;
    }
    case 'E2': {
      return applyBaseMove(applyBaseMove(cube, 'E'), 'E');
    }

    // S follows F direction (between F and B, clockwise from Front)
    case 'S': {
      const temp = [...c.U[1]];
      for (let i = 0; i < 3; i++) {
        c.U[1][i] = c.L[2 - i][1];
        c.L[2 - i][1] = c.D[1][2 - i];
        c.D[1][2 - i] = c.R[i][1];
        c.R[i][1] = temp[i];
      }
      break;
    }
    case "S'": {
      const temp = [...c.U[1]];
      for (let i = 0; i < 3; i++) {
        c.U[1][i] = c.R[i][1];
        c.R[i][1] = c.D[1][2 - i];
        c.D[1][2 - i] = c.L[2 - i][1];
        c.L[2 - i][1] = temp[i];
      }
      break;
    }
    case 'S2': {
      return applyBaseMove(applyBaseMove(cube, 'S'), 'S');
    }

    // Wide moves: r, l, u, d, f, b or Rw, Lw, Uw, Dw, Fw, Bw
    case 'Rw':
    case 'r':
      return applyAlgorithm(cube, "R M'");
    case "Rw'":
    case "r'":
      return applyAlgorithm(cube, 'R\' M');
    case 'Rw2':
    case 'r2':
      return applyAlgorithm(cube, "R2 M2");

    case 'Lw':
    case 'l':
      return applyAlgorithm(cube, 'L M');
    case "Lw'":
    case "l'":
      return applyAlgorithm(cube, "L' M'");
    case 'Lw2':
    case 'l2':
      return applyAlgorithm(cube, 'L2 M2');

    case 'Uw':
    case 'u':
      return applyAlgorithm(cube, "U E'");
    case "Uw'":
    case "u'":
      return applyAlgorithm(cube, "U' E");
    case 'Uw2':
    case 'u2':
      return applyAlgorithm(cube, "U2 E2");

    case 'Dw':
    case 'd':
      return applyAlgorithm(cube, 'D E');
    case "Dw'":
    case "d'":
      return applyAlgorithm(cube, "D' E'");
    case 'Dw2':
    case 'd2':
      return applyAlgorithm(cube, 'D2 E2');

    case 'Fw':
    case 'f':
      return applyAlgorithm(cube, 'F S');
    case "Fw'":
    case "f'":
      return applyAlgorithm(cube, "F' S'");
    case 'Fw2':
    case 'f2':
      return applyAlgorithm(cube, 'F2 S2');

    case 'Bw':
    case 'b':
      return applyAlgorithm(cube, "B S'");
    case "Bw'":
    case "b'":
      return applyAlgorithm(cube, "B' S");
    case 'Bw2':
    case 'b2':
      return applyAlgorithm(cube, 'B2 S2');

    // Cube rotations: x, y, z
    case 'x':
      // x rotates whole cube on R: R M' L'
      return applyAlgorithm(cube, "R M' L'");
    case "x'":
      return applyAlgorithm(cube, "R' M L");
    case 'x2':
      return applyAlgorithm(cube, 'x x');

    case 'y':
      // y rotates whole cube on U: U E' D'
      return applyAlgorithm(cube, "U E' D'");
    case "y'":
      return applyAlgorithm(cube, "U' E D");
    case 'y2':
      return applyAlgorithm(cube, 'y y');

    case 'z':
      // z rotates whole cube on F: F S B'
      return applyAlgorithm(cube, "F S B'");
    case "z'":
      return applyAlgorithm(cube, "F' S' B");
    case 'z2':
      return applyAlgorithm(cube, 'z z');

    default:
      return cube;
  }

  return c;
}

// Tokenize algorithm string into standardized moves
export function tokenizeAlgorithm(alg: string): string[] {
  if (!alg) return [];
  // Remove brackets, parentheses, comments, and normalize apostrophes and 3-turns
  const cleaned = alg
    .replace(/[()[\]{}]/g, ' ')
    .replace(/\/\/.*/g, ' ')
    .replace(/[‘’′`]/g, "'")
    .replace(/prime/gi, "'")
    .replace(/([UDFBLRMESxyzrufldb]|Uw|Dw|Fw|Bw|Lw|Rw)3/gi, "$1'")
    .trim();

  const rawTokens = cleaned.split(/\s+/).filter(Boolean);
  const result: string[] = [];

  for (const token of rawTokens) {
    // Check if token has prime or double
    const m = token.match(/^([UDFBLRMESxyzrufldb]|Uw|Dw|Fw|Bw|Lw|Rw)(['2]?)$/i);
    if (m) {
      const base = m[1];
      const mod = m[2];
      result.push(`${base}${mod}`);
    } else {
      // Could be consecutive moves like RUR'U'
      const matches = token.match(/([UDFBLRMESxyzrufldb]|Uw|Dw|Fw|Bw|Lw|Rw)(['2]?)/gi);
      if (matches) {
        result.push(...matches);
      }
    }
  }

  return result;
}

// Apply full algorithm string or token array to a cube
export function applyAlgorithm(cube: CubeState, alg: string | string[]): CubeState {
  const tokens = Array.isArray(alg) ? alg : tokenizeAlgorithm(alg);
  let current = cube;
  for (const t of tokens) {
    current = applyBaseMove(current, t);
  }
  return current;
}

// Invert an algorithm move
export function invertMove(move: string): string {
  if (move.endsWith("'")) return move.slice(0, -1);
  if (move.endsWith('2')) return move;
  return `${move}'`;
}

// Invert full algorithm sequence
export function invertAlgorithm(alg: string): string {
  const tokens = tokenizeAlgorithm(alg);
  return tokens.reverse().map(invertMove).join(' ');
}

// Check if cube is solved
export function isCubeSolved(cube: CubeState): boolean {
  const faces: FaceName[] = ['U', 'D', 'F', 'B', 'L', 'R'];
  for (const f of faces) {
    const centerColor = cube[f][1][1];
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 3; c++) {
        if (cube[f][r][c] !== centerColor) {
          return false;
        }
      }
    }
  }
  return true;
}

// Extract top 3x3 colors for 2D OLL/PLL/F2L diagrams
export function getTopColorsMatrix(cube: CubeState): string[][] {
  return cube.U.map((row) => [...row]);
}

// CFOP oriented solved state: U=Yellow, D=White, F=Green, B=Blue, L=Orange, R=Red
export function createCfopSolvedCube(): CubeState {
  return {
    U: [
      ['Y', 'Y', 'Y'],
      ['Y', 'Y', 'Y'],
      ['Y', 'Y', 'Y'],
    ],
    D: [
      ['W', 'W', 'W'],
      ['W', 'W', 'W'],
      ['W', 'W', 'W'],
    ],
    F: [
      ['G', 'G', 'G'],
      ['G', 'G', 'G'],
      ['G', 'G', 'G'],
    ],
    B: [
      ['B', 'B', 'B'],
      ['B', 'B', 'B'],
      ['B', 'B', 'B'],
    ],
    L: [
      ['O', 'O', 'O'],
      ['O', 'O', 'O'],
      ['O', 'O', 'O'],
    ],
    R: [
      ['R', 'R', 'R'],
      ['R', 'R', 'R'],
      ['R', 'R', 'R'],
    ],
  };
}

// Extract true 4-side sticker colors of the top layer (for PLL and full 2D recognition diagrams)
export function getTopLayerSideColors(cube: CubeState): {
  top: ColorCode[]; // Back face top row, left to right from top-down perspective
  bottom: ColorCode[]; // Front face top row, left to right from top-down perspective
  left: ColorCode[]; // Left face top row, top to bottom from top-down perspective
  right: ColorCode[]; // Right face top row, top to bottom from top-down perspective
} {
  return {
    top: [cube.B[0][2], cube.B[0][1], cube.B[0][0]],
    bottom: [cube.F[0][0], cube.F[0][1], cube.F[0][2]],
    left: [cube.L[0][0], cube.L[0][1], cube.L[0][2]],
    right: [cube.R[0][2], cube.R[0][1], cube.R[0][0]],
  };
}

// Extract side yellow highlights from U-layer stickers on F, R, B, L
export function getSideYellowFromCube(cube: CubeState): {
  top: boolean[];
  right: boolean[];
  bottom: boolean[];
  left: boolean[];
} {
  // Top in top-view corresponds to Back (B[0])
  // Bottom corresponds to Front (F[0])
  // Left corresponds to Left (L[0])
  // Right corresponds to Right (R[0])
  return {
    top: [cube.B[0][2] === 'Y', cube.B[0][1] === 'Y', cube.B[0][0] === 'Y'], // looking from top
    bottom: [cube.F[0][0] === 'Y', cube.F[0][1] === 'Y', cube.F[0][2] === 'Y'],
    left: [cube.L[0][0] === 'Y', cube.L[0][1] === 'Y', cube.L[0][2] === 'Y'],
    right: [cube.R[0][2] === 'Y', cube.R[0][1] === 'Y', cube.R[0][0] === 'Y'],
  };
}

// Automatically derive PLL permutation cycle arrows by inspecting displaced pieces on the U layer
export function derivePllArrowsFromState(state: CubeState): Array<{
  from: [number, number];
  to: [number, number];
  bidirectional?: boolean;
}> {
  // Use dynamic center face colors (allows moves with rotations or slices like y, y', d, d')
  const backCenter = state.B[1][1];
  const leftCenter = state.L[1][1];
  const rightCenter = state.R[1][1];
  const frontCenter = state.F[1][1];

  const edgePositions = [
    { pos: [0, 1] as [number, number], actualSide: state.B[0][1] }, // UB (Back)
    { pos: [1, 0] as [number, number], actualSide: state.L[0][1] }, // UL (Left)
    { pos: [1, 2] as [number, number], actualSide: state.R[0][1] }, // UR (Right)
    { pos: [2, 1] as [number, number], actualSide: state.F[0][1] }, // UF (Front)
  ];
  const edgeMap: Record<string, [number, number]> = {
    [backCenter]: [0, 1],
    [leftCenter]: [1, 0],
    [rightCenter]: [1, 2],
    [frontCenter]: [2, 1],
  };

  // Corners on top grid [row, col]
  // UBL [0,0] borders B[0][2] & L[0][0]
  // UBR [0,2] borders B[0][0] & R[0][2]
  // UFL [2,0] borders F[0][0] & L[0][2]
  // UFR [2,2] borders F[0][2] & R[0][0]
  const cornerPositions = [
    { pos: [0, 0] as [number, number], colors: [state.B[0][2], state.L[0][0]].sort().join('') },
    { pos: [0, 2] as [number, number], colors: [state.B[0][0], state.R[0][2]].sort().join('') },
    { pos: [2, 0] as [number, number], colors: [state.F[0][0], state.L[0][2]].sort().join('') },
    { pos: [2, 2] as [number, number], colors: [state.F[0][2], state.R[0][0]].sort().join('') },
  ];
  const cornerMap: Record<string, [number, number]> = {
    [[backCenter, leftCenter].sort().join('')]: [0, 0], // UBL
    [[backCenter, rightCenter].sort().join('')]: [0, 2], // UBR
    [[frontCenter, leftCenter].sort().join('')]: [2, 0], // UFL
    [[frontCenter, rightCenter].sort().join('')]: [2, 2], // UFR
  };

  const arrows: Array<{ from: [number, number]; to: [number, number]; bidirectional?: boolean }> = [];
  const handled = new Set<string>();

  // Check edges
  for (const ep of edgePositions) {
    const target = edgeMap[ep.actualSide];
    if (target && (target[0] !== ep.pos[0] || target[1] !== ep.pos[1])) {
      const key1 = `${ep.pos[0]},${ep.pos[1]}-${target[0]},${target[1]}`;
      const key2 = `${target[0]},${target[1]}-${ep.pos[0]},${ep.pos[1]}`;
      if (!handled.has(key1)) {
        const otherActual = edgePositions.find(
          (p) => p.pos[0] === target[0] && p.pos[1] === target[1]
        )?.actualSide;
        const otherTarget = otherActual ? edgeMap[otherActual] : undefined;
        const isBidi = Boolean(otherTarget && otherTarget[0] === ep.pos[0] && otherTarget[1] === ep.pos[1]);

        arrows.push({ from: ep.pos, to: target, bidirectional: isBidi });
        handled.add(key1);
        if (isBidi) handled.add(key2);
      }
    }
  }

  // Check corners
  for (const cp of cornerPositions) {
    const target = cornerMap[cp.colors];
    if (target && (target[0] !== cp.pos[0] || target[1] !== cp.pos[1])) {
      const key1 = `${cp.pos[0]},${cp.pos[1]}-${target[0]},${target[1]}`;
      const key2 = `${target[0]},${target[1]}-${cp.pos[0]},${cp.pos[1]}`;
      if (!handled.has(key1)) {
        const otherColors = cornerPositions.find(
          (p) => p.pos[0] === target[0] && p.pos[1] === target[1]
        )?.colors;
        const otherTarget = otherColors ? cornerMap[otherColors] : undefined;
        const isBidi = Boolean(otherTarget && otherTarget[0] === cp.pos[0] && otherTarget[1] === cp.pos[1]);

        arrows.push({ from: cp.pos, to: target, bidirectional: isBidi });
        handled.add(key1);
        if (isBidi) handled.add(key2);
      }
    }
  }

  return arrows;
}
