import { PuzzleType } from '../types/cube';

// Helper to pick random item
const randChoice = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
const randInt = (min: number, max: number): number => Math.floor(Math.random() * (max - min + 1)) + min;

// Generate 3x3 WCA scramble
export function generate3x3Scramble(length: number = 21): string {
  const faces = ['U', 'D', 'L', 'R', 'F', 'B'] as const;
  const modifiers = ['', "'", '2'];
  const oppositeFaces: Record<string, string> = {
    U: 'D', D: 'U',
    L: 'R', R: 'L',
    F: 'B', B: 'F'
  };

  const moves: string[] = [];
  let lastFace = '';
  let secondLastFace = '';

  for (let i = 0; i < length; i++) {
    const validFaces = faces.filter(f => {
      if (f === lastFace) return false;
      // Prevent opposite face redundancy e.g. R L R
      if (f === secondLastFace && oppositeFaces[f] === lastFace) return false;
      return true;
    });

    const face = randChoice(validFaces);
    const mod = randChoice(modifiers);
    moves.push(`${face}${mod}`);

    secondLastFace = lastFace;
    lastFace = face;
  }

  return moves.join(' ');
}

// Generate 2x2 scramble (9-11 moves, R, U, F faces only)
export function generate2x2Scramble(length: number = 10): string {
  const faces = ['U', 'R', 'F'] as const;
  const modifiers = ['', "'", '2'];
  const moves: string[] = [];
  let lastFace = '';

  for (let i = 0; i < length; i++) {
    const validFaces = faces.filter(f => f !== lastFace);
    const face = randChoice(validFaces);
    const mod = randChoice(modifiers);
    moves.push(`${face}${mod}`);
    lastFace = face;
  }

  return moves.join(' ');
}

// Generate 4x4 scramble (40-44 moves, wide turns Rw, Uw, Fw)
export function generate4x4Scramble(length: number = 42): string {
  const faces = ['U', 'D', 'L', 'R', 'F', 'B', 'Uw', 'Dw', 'Lw', 'Rw', 'Fw', 'Bw'] as const;
  const modifiers = ['', "'", '2'];
  const moves: string[] = [];
  let lastBase = '';

  for (let i = 0; i < length; i++) {
    const validFaces = faces.filter(f => {
      const base = f.charAt(0);
      return base !== lastBase;
    });

    const face = randChoice(validFaces);
    const mod = randChoice(modifiers);
    moves.push(`${face}${mod}`);
    lastBase = face.charAt(0);
  }

  return moves.join(' ');
}

// Generate 5x5 scramble (60 moves)
export function generate5x5Scramble(length: number = 60): string {
  const faces = ['U', 'D', 'L', 'R', 'F', 'B', 'Uw', 'Dw', 'Lw', 'Rw', 'Fw', 'Bw'] as const;
  const modifiers = ['', "'", '2'];
  const moves: string[] = [];
  let lastBase = '';

  for (let i = 0; i < length; i++) {
    const validFaces = faces.filter(f => f.charAt(0) !== lastBase);
    const face = randChoice(validFaces);
    const mod = randChoice(modifiers);
    moves.push(`${face}${mod}`);
    lastBase = face.charAt(0);
  }

  return moves.join(' ');
}

// Generate 6x6 scramble (80 moves)
export function generate6x6Scramble(length: number = 80): string {
  const faces = ['U', 'D', 'L', 'R', 'F', 'B', '2U', '2D', '2L', '2R', '2F', '2B', '3U', '3D', '3L', '3R', '3F', '3B'];
  const modifiers = ['', "'", '2'];
  const moves: string[] = [];
  let lastBase = '';

  for (let i = 0; i < length; i++) {
    const validFaces = faces.filter(f => f.slice(-1) !== lastBase);
    const face = randChoice(validFaces);
    const mod = randChoice(modifiers);
    moves.push(`${face}${mod}`);
    lastBase = face.slice(-1);
  }

  return moves.join(' ');
}

// Generate 7x7 scramble (100 moves)
export function generate7x7Scramble(length: number = 100): string {
  const faces = ['U', 'D', 'L', 'R', 'F', 'B', '2U', '2D', '2L', '2R', '2F', '2B', '3U', '3D', '3L', '3R', '3F', '3B'];
  const modifiers = ['', "'", '2'];
  const moves: string[] = [];
  let lastBase = '';

  for (let i = 0; i < length; i++) {
    const validFaces = faces.filter(f => f.slice(-1) !== lastBase);
    const face = randChoice(validFaces);
    const mod = randChoice(modifiers);
    moves.push(`${face}${mod}`);
    lastBase = face.slice(-1);
  }

  return moves.join(' ');
}

// Generate Pyraminx scramble
export function generatePyraminxScramble(): string {
  const mainFaces = ['U', 'L', 'R', 'B'];
  const modifiers = ['', "'"];
  const moves: string[] = [];
  let lastFace = '';

  for (let i = 0; i < 11; i++) {
    const validFaces = mainFaces.filter(f => f !== lastFace);
    const face = randChoice(validFaces);
    const mod = randChoice(modifiers);
    moves.push(`${face}${mod}`);
    lastFace = face;
  }

  // Optional tip turns
  const tips = ['u', 'l', 'r', 'b'];
  tips.forEach(tip => {
    if (Math.random() > 0.3) {
      moves.push(`${tip}${randChoice(modifiers)}`);
    }
  });

  return moves.join(' ');
}

// Generate Megaminx scramble (WCA Pochmann format)
export function generateMegaminxScramble(): string {
  const lines: string[] = [];
  for (let line = 0; line < 7; line++) {
    const lineMoves: string[] = [];
    for (let pair = 0; pair < 5; pair++) {
      const rMod = Math.random() > 0.5 ? '++' : '--';
      const dMod = Math.random() > 0.5 ? '++' : '--';
      lineMoves.push(`R${rMod}`, `D${dMod}`);
    }
    const uMod = Math.random() > 0.5 ? "U'" : 'U';
    lineMoves.push(uMod);
    lines.push(lineMoves.join(' '));
  }
  return lines.join('\n');
}

// Generate Skewb scramble
export function generateSkewbScramble(length: number = 11): string {
  const faces = ['U', 'R', 'L', 'B'];
  const modifiers = ['', "'"];
  const moves: string[] = [];
  let lastFace = '';

  for (let i = 0; i < length; i++) {
    const validFaces = faces.filter(f => f !== lastFace);
    const face = randChoice(validFaces);
    const mod = randChoice(modifiers);
    moves.push(`${face}${mod}`);
    lastFace = face;
  }

  return moves.join(' ');
}

// Generate Square-1 scramble
export function generateSquare1Scramble(length: number = 14): string {
  const moves: string[] = [];
  for (let i = 0; i < length; i++) {
    const u = randInt(-5, 6);
    const d = randInt(-5, 6);
    moves.push(`(${u},${d})`);
    if (i < length - 1) {
      moves.push('/');
    }
  }
  return moves.join(' ');
}

// Generate Clock scramble
export function generateClockScramble(): string {
  const pins = ['UR', 'DR', 'DL', 'UL', 'U', 'R', 'D', 'L', 'ALL'];
  const moves: string[] = [];
  
  pins.forEach(pin => {
    const amount = randInt(-5, 6);
    if (amount !== 0) {
      moves.push(`${pin}${amount > 0 ? '+' + amount : amount}`);
    }
  });

  moves.push('y2');

  const backPins = ['U', 'R', 'D', 'L', 'ALL'];
  backPins.forEach(pin => {
    const amount = randInt(-5, 6);
    if (amount !== 0) {
      moves.push(`${pin}${amount > 0 ? '+' + amount : amount}`);
    }
  });

  // Pin state setup
  const states = ['UR', 'DR', 'DL', 'UL'];
  states.forEach(pin => {
    if (Math.random() > 0.5) moves.push(pin);
  });

  return moves.join(' ');
}

// Master Scramble Dispatcher
export function generateScramble(puzzle: PuzzleType): string {
  switch (puzzle) {
    case '3x3': return generate3x3Scramble();
    case '2x2': return generate2x2Scramble();
    case '4x4': return generate4x4Scramble();
    case '5x5': return generate5x5Scramble();
    case '6x6': return generate6x6Scramble();
    case '7x7': return generate7x7Scramble();
    case 'pyraminx': return generatePyraminxScramble();
    case 'megaminx': return generateMegaminxScramble();
    case 'skewb': return generateSkewbScramble();
    case 'sq1': return generateSquare1Scramble();
    case 'clock': return generateClockScramble();
    default: return generate3x3Scramble();
  }
}

// 2D Facelet representation for 3x3 cube preview
// Colors: U: white, D: yellow, F: green, B: blue, L: orange, R: red
export type ColorCode = 'W' | 'Y' | 'G' | 'B' | 'O' | 'R';

export interface Cube2DState {
  U: ColorCode[][];
  D: ColorCode[][];
  F: ColorCode[][];
  B: ColorCode[][];
  L: ColorCode[][];
  R: ColorCode[][];
}

export function getSolvedCube2D(): Cube2DState {
  return {
    U: [['W', 'W', 'W'], ['W', 'W', 'W'], ['W', 'W', 'W']],
    D: [['Y', 'Y', 'Y'], ['Y', 'Y', 'Y'], ['Y', 'Y', 'Y']],
    F: [['G', 'G', 'G'], ['G', 'G', 'G'], ['G', 'G', 'G']],
    B: [['B', 'B', 'B'], ['B', 'B', 'B'], ['B', 'B', 'B']],
    L: [['O', 'O', 'O'], ['O', 'O', 'O'], ['O', 'O', 'O']],
    R: [['R', 'R', 'R'], ['R', 'R', 'R'], ['R', 'R', 'R']]
  };
}

// Rotate a 3x3 matrix clockwise
function rotateFaceCW(face: ColorCode[][]): ColorCode[][] {
  const result: ColorCode[][] = [
    ['W', 'W', 'W'],
    ['W', 'W', 'W'],
    ['W', 'W', 'W']
  ];
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) {
      result[c][2 - r] = face[r][c];
    }
  }
  return result;
}

// Apply 3x3 move to 2D state
export function applyMoveToCube2D(state: Cube2DState, move: string): Cube2DState {
  const face = move.charAt(0);
  const mod = move.slice(1);
  const turns = mod === '2' ? 2 : mod === "'" ? 3 : 1;

  for (let t = 0; t < turns; t++) {
    if (face === 'U') {
      state.U = rotateFaceCW(state.U);
      const temp = [...state.F[0]];
      state.F[0] = [...state.R[0]];
      state.R[0] = [...state.B[0]];
      state.B[0] = [...state.L[0]];
      state.L[0] = temp;
    } else if (face === 'D') {
      state.D = rotateFaceCW(state.D);
      const temp = [...state.F[2]];
      state.F[2] = [...state.L[2]];
      state.L[2] = [...state.B[2]];
      state.B[2] = [...state.R[2]];
      state.R[2] = temp;
    } else if (face === 'R') {
      state.R = rotateFaceCW(state.R);
      const temp = [state.U[0][2], state.U[1][2], state.U[2][2]];
      for (let i = 0; i < 3; i++) {
        state.U[i][2] = state.F[i][2];
        state.F[i][2] = state.D[i][2];
        state.D[i][2] = state.B[2 - i][0];
        state.B[2 - i][0] = temp[i];
      }
    } else if (face === 'L') {
      state.L = rotateFaceCW(state.L);
      const temp = [state.U[0][0], state.U[1][0], state.U[2][0]];
      for (let i = 0; i < 3; i++) {
        state.U[i][0] = state.B[2 - i][2];
        state.B[2 - i][2] = state.D[i][0];
        state.D[i][0] = state.F[i][0];
        state.F[i][0] = temp[i];
      }
    } else if (face === 'F') {
      state.F = rotateFaceCW(state.F);
      const temp = [...state.U[2]];
      for (let i = 0; i < 3; i++) {
        state.U[2][i] = state.L[2 - i][2];
        state.L[2 - i][2] = state.D[0][2 - i];
        state.D[0][2 - i] = state.R[i][0];
        state.R[i][0] = temp[i];
      }
    } else if (face === 'B') {
      state.B = rotateFaceCW(state.B);
      const temp = [...state.U[0]];
      for (let i = 0; i < 3; i++) {
        state.U[0][i] = state.R[i][2];
        state.R[i][2] = state.D[2][2 - i];
        state.D[2][2 - i] = state.L[2 - i][0];
        state.L[2 - i][0] = temp[i];
      }
    }
  }

  return state;
}

// Compute 2D facelets from scramble string
export function compute2DStateFromScramble(scramble: string): Cube2DState {
  const state = getSolvedCube2D();
  const moves = scramble.trim().split(/\s+/).filter(m => m.length > 0);
  for (const move of moves) {
    applyMoveToCube2D(state, move);
  }
  return state;
}
