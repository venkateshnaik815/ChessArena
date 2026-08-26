import { Board, PieceColor } from '../types/game';
import { evaluateBoard } from './ai';
import { isKingInCheck } from './gameLogic';

export interface PositionAnalysis {
  score: number;            // centipawns (positive = white advantage)
  advantage: string;        // "White +1.5", "Equal", "Black +0.8"
  phase: 'opening' | 'middlegame' | 'endgame';
  whiteInCheck: boolean;
  blackInCheck: boolean;
  pieceCount: number;
}

/**
 * Counts total non-pawn material on the board to determine game phase.
 */
function countMaterial(board: Board): number {
  const VALUES: Record<string, number> = {
    queen: 9, rook: 5, bishop: 3, knight: 3,
  };
  let total = 0;
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const p = board[r][c];
      if (p && p.type !== 'pawn' && p.type !== 'king') {
        total += VALUES[p.type] ?? 0;
      }
    }
  }
  return total;
}

/**
 * Determines game phase based on remaining material.
 */
function getGamePhase(material: number): 'opening' | 'middlegame' | 'endgame' {
  if (material >= 50) return 'opening';
  if (material >= 20) return 'middlegame';
  return 'endgame';
}

/**
 * Converts a centipawn score to a human-readable string.
 */
function formatAdvantage(score: number): string {
  const abs = Math.abs(score);
  if (abs < 30) return 'Equal';
  const pawns = (abs / 100).toFixed(1);
  return score > 0 ? `White +${pawns}` : `Black +${pawns}`;
}

/**
 * Analyzes the current position and returns metadata.
 */
export function analyzePosition(board: Board): PositionAnalysis {
  const score = evaluateBoard(board);
  const material = countMaterial(board);
  const phase = getGamePhase(material);

  let pieceCount = 0;
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      if (board[r][c]) pieceCount++;
    }
  }

  return {
    score,
    advantage: formatAdvantage(score),
    phase,
    whiteInCheck: isKingInCheck(board, 'white'),
    blackInCheck: isKingInCheck(board, 'black'),
    pieceCount,
  };
}
