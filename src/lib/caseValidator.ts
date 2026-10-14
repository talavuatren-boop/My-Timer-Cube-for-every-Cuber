import { AlgorithmCase } from '../types/cube';
import {
  createSolvedCube,
  applyAlgorithm,
  invertAlgorithm,
  isCubeSolved,
  tokenizeAlgorithm,
  CubeState,
} from './cubeModel';

export interface ValidationResult {
  isValid: boolean;
  error?: string;
  normalizedAlg: string;
  moveCount: number;
  setupRestored?: boolean;
  resultingCube?: CubeState;
}

/**
 * Validates any algorithm notation, ensuring each token is a standard WCA / speedcubing move.
 */
export function validateAlgorithmNotation(alg: string): { isValid: boolean; error?: string; tokens: string[] } {
  if (!alg || !alg.trim()) {
    return { isValid: false, error: 'Algorithm sequence cannot be empty', tokens: [] };
  }

  const tokens = tokenizeAlgorithm(alg);
  if (tokens.length === 0) {
    return { isValid: false, error: 'No recognizable Rubik moves found in notation', tokens: [] };
  }

  const validMovePattern = /^([UDFBLRMESxyzrufldb]|Uw|Dw|Fw|Bw|Lw|Rw)['2]?$/;
  for (const token of tokens) {
    if (!validMovePattern.test(token)) {
      return { isValid: false, error: `Invalid cube notation token: "${token}"`, tokens: [] };
    }
  }

  return { isValid: true, tokens };
}

/**
 * Validates a case setup + solving algorithm pair.
 * Verifies that:
 * 1. Setup can be applied to a solved cube.
 * 2. Solving algorithm applied to setup state solves the puzzle (or target solved condition).
 */
export function validateCaseAlgorithm(
  setupScramble: string,
  solvingAlgorithm: string
): ValidationResult {
  const normSetup = validateAlgorithmNotation(setupScramble);
  if (!normSetup.isValid) {
    return {
      isValid: false,
      error: `Setup error: ${normSetup.error}`,
      normalizedAlg: '',
      moveCount: 0,
    };
  }

  const normAlg = validateAlgorithmNotation(solvingAlgorithm);
  if (!normAlg.isValid) {
    return {
      isValid: false,
      error: `Algorithm error: ${normAlg.error}`,
      normalizedAlg: '',
      moveCount: 0,
    };
  }

  const solved = createSolvedCube();
  const caseState = applyAlgorithm(solved, normSetup.tokens);
  const finalState = applyAlgorithm(caseState, normAlg.tokens);
  const isSolved = isCubeSolved(finalState);

  return {
    isValid: true,
    normalizedAlg: normAlg.tokens.join(' '),
    moveCount: normAlg.tokens.length,
    setupRestored: isSolved,
    resultingCube: caseState,
  };
}

/**
 * Derives a canonical setup scramble for any solving algorithm.
 * Since applying the inverse of an algorithm to a solved cube produces the exact case state that the algorithm solves!
 */
export function deriveSetupScramble(solvingAlgorithm: string): string {
  return invertAlgorithm(solvingAlgorithm);
}
