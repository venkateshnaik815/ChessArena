import { Board, PieceColor, PieceType } from '../types/game';
import { cloneBoard, getLegalMoves, isKingInCheck, hasAnyLegalMoves } from './gameLogic';

// Piece values in centipawns
const PIECE_VALUES: Record<PieceType, number> = {
  pawn: 100,
  knight: 320,
  bishop: 330,
  rook: 500,
  queen: 900,
  king: 20000,
};

// Piece-square tables (from white's perspective, row 0 = rank 8)
// These guide the AI to prefer good positional squares

const PAWN_TABLE = [
  [ 0,  0,  0,  0,  0,  0,  0,  0],
  [50, 50, 50, 50, 50, 50, 50, 50],
  [10, 10, 20, 30, 30, 20, 10, 10],
  [ 5,  5, 10, 25, 25, 10,  5,  5],
  [ 0,  0,  0, 20, 20,  0,  0,  0],
  [ 5, -5,-10,  0,  0,-10, -5,  5],
  [ 5, 10, 10,-20,-20, 10, 10,  5],
  [ 0,  0,  0,  0,  0,  0,  0,  0],
];

const KNIGHT_TABLE = [
  [-50,-40,-30,-30,-30,-30,-40,-50],
  [-40,-20,  0,  0,  0,  0,-20,-40],
  [-30,  0, 10, 15, 15, 10,  0,-30],
  [-30,  5, 15, 20, 20, 15,  5,-30],
  [-30,  0, 15, 20, 20, 15,  0,-30],
  [-30,  5, 10, 15, 15, 10,  5,-30],
  [-40,-20,  0,  5,  5,  0,-20,-40],
  [-50,-40,-30,-30,-30,-30,-40,-50],
];

const BISHOP_TABLE = [
  [-20,-10,-10,-10,-10,-10,-10,-20],
  [-10,  0,  0,  0,  0,  0,  0,-10],
  [-10,  0,  5, 10, 10,  5,  0,-10],
  [-10,  5,  5, 10, 10,  5,  5,-10],
  [-10,  0, 10, 10, 10, 10,  0,-10],
  [-10, 10, 10, 10, 10, 10, 10,-10],
  [-10,  5,  0,  0,  0,  0,  5,-10],
  [-20,-10,-10,-10,-10,-10,-10,-20],
];

const ROOK_TABLE = [
  [ 0,  0,  0,  0,  0,  0,  0,  0],
  [ 5, 10, 10, 10, 10, 10, 10,  5],
  [-5,  0,  0,  0,  0,  0,  0, -5],
  [-5,  0,  0,  0,  0,  0,  0, -5],
  [-5,  0,  0,  0,  0,  0,  0, -5],
  [-5,  0,  0,  0,  0,  0,  0, -5],
  [-5,  0,  0,  0,  0,  0,  0, -5],
  [ 0,  0,  0,  5,  5,  0,  0,  0],
];

const QUEEN_TABLE = [
  [-20,-10,-10, -5, -5,-10,-10,-20],
  [-10,  0,  0,  0,  0,  0,  0,-10],
  [-10,  0,  5,  5,  5,  5,  0,-10],
  [ -5,  0,  5,  5,  5,  5,  0, -5],
  [  0,  0,  5,  5,  5,  5,  0, -5],
  [-10,  5,  5,  5,  5,  5,  0,-10],
  [-10,  0,  5,  0,  0,  0,  0,-10],
  [-20,-10,-10, -5, -5,-10,-10,-20],
];

const KING_MIDDLE_TABLE = [
  [-30,-40,-40,-50,-50,-40,-40,-30],
  [-30,-40,-40,-50,-50,-40,-40,-30],
  [-30,-40,-40,-50,-50,-40,-40,-30],
  [-30,-40,-40,-50,-50,-40,-40,-30],
  [-20,-30,-30,-40,-40,-30,-30,-20],
  [-10,-20,-20,-20,-20,-20,-20,-10],
  [ 20, 20,  0,  0,  0,  0, 20, 20],
  [ 20, 30, 10,  0,  0, 10, 30, 20],
];

const PIECE_TABLES: Record<PieceType, number[][]> = {
  pawn: PAWN_TABLE,
  knight: KNIGHT_TABLE,
  bishop: BISHOP_TABLE,
  rook: ROOK_TABLE,
  queen: QUEEN_TABLE,
  king: KING_MIDDLE_TABLE,
};

/**
 * Returns the positional bonus for a piece at a given square.
 * Black pieces mirror the table vertically.
 */
function getPieceSquareBonus(
  type: PieceType,
  color: PieceColor,
  row: number,
  col: number
): number {
  const table = PIECE_TABLES[type];
  // For black, flip the table vertically
  const r = color === 'white' ? row : 7 - row;
  return table[r]?.[col] ?? 0;
}

/**
 * Evaluates the board from White's perspective.
 * Positive = good for White, Negative = good for Black.
 */
export function evaluateBoard(board: Board): number {
  let score = 0;

  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const piece = board[r][c];
      if (!piece) continue;

      const value = PIECE_VALUES[piece.type] + getPieceSquareBonus(piece.type, piece.color, r, c);
      score += piece.color === 'white' ? value : -value;
    }
  }

  return score;
}

export interface AIMove {
  fromRow: number;
  fromCol: number;
  toRow: number;
  toCol: number;
  score: number;
}

interface CastlingRights {
  whiteKingSide: boolean;
  whiteQueenSide: boolean;
  blackKingSide: boolean;
  blackQueenSide: boolean;
}

/**
 * Generates all moves for a given color as [fromRow, fromCol, toRow, toCol] tuples.
 */
function getAllMoves(
  board: Board,
  color: PieceColor,
  enPassantTarget: [number, number] | null,
  castlingRights: CastlingRights
): [number, number, number, number][] {
  const moves: [number, number, number, number][] = [];

  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const piece = board[r][c];
      if (!piece || piece.color !== color) continue;

      const legalMoves = getLegalMoves(board, r, c, enPassantTarget, castlingRights);
      for (const [toR, toC] of legalMoves) {
        moves.push([r, c, toR, toC]);
      }
    }
  }

  return moves;
}

/**
 * Applies a move to a board and returns the new board.
 */
function applyMove(
  board: Board,
  fromRow: number,
  fromCol: number,
  toRow: number,
  toCol: number,
  enPassantTarget: [number, number] | null
): Board {
  const newBoard = cloneBoard(board);
  const piece = newBoard[fromRow][fromCol]!;

  newBoard[toRow][toCol] = piece;
  newBoard[fromRow][fromCol] = null;

  // Handle castling
  if (piece.type === 'king') {
    const backRank = piece.color === 'white' ? 7 : 0;
    if (fromCol === 4 && toCol === 6) {
      newBoard[backRank][5] = newBoard[backRank][7];
      newBoard[backRank][7] = null;
    } else if (fromCol === 4 && toCol === 2) {
      newBoard[backRank][3] = newBoard[backRank][0];
      newBoard[backRank][0] = null;
    }
  }

  // Handle en passant
  if (
    piece.type === 'pawn' &&
    enPassantTarget &&
    toRow === enPassantTarget[0] &&
    toCol === enPassantTarget[1] &&
    !board[toRow][toCol]
  ) {
    const capturedPawnRow = piece.color === 'white' ? toRow + 1 : toRow - 1;
    newBoard[capturedPawnRow][toCol] = null;
  }

  // Auto-promote pawns to queen for simplicity
  if (piece.type === 'pawn' && (toRow === 0 || toRow === 7)) {
    newBoard[toRow][toCol] = { type: 'queen', color: piece.color };
  }

  return newBoard;
}

/**
 * Minimax algorithm with Alpha-Beta pruning.
 * @param board  Current board state
 * @param depth  Search depth remaining
 * @param alpha  Best score maximizer can guarantee
 * @param beta   Best score minimizer can guarantee
 * @param isMaximizing  True = white's turn
 */
function minimax(
  board: Board,
  depth: number,
  alpha: number,
  beta: number,
  isMaximizing: boolean,
  enPassantTarget: [number, number] | null,
  castlingRights: CastlingRights
): number {
  const currentColor: PieceColor = isMaximizing ? 'white' : 'black';

  // Base case: depth 0 or game over
  if (depth === 0) {
    return evaluateBoard(board);
  }

  const moves = getAllMoves(board, currentColor, enPassantTarget, castlingRights);

  if (moves.length === 0) {
    if (isKingInCheck(board, currentColor)) {
      // Checkmate — bad for the side that has no moves
      return isMaximizing ? -99999 : 99999;
    }
    return 0; // Stalemate
  }

  if (isMaximizing) {
    let maxEval = -Infinity;

    for (const [fr, fc, tr, tc] of moves) {
      const newBoard = applyMove(board, fr, fc, tr, tc, enPassantTarget);
      const newEP = getNewEnPassantTarget(board, fr, fc, tr, tc);
      const newCR = getNewCastlingRights(board, castlingRights, fr, fc);

      const evalScore = minimax(newBoard, depth - 1, alpha, beta, false, newEP, newCR);
      maxEval = Math.max(maxEval, evalScore);
      alpha = Math.max(alpha, evalScore);

      if (beta <= alpha) break; // Beta cut-off
    }

    return maxEval;
  } else {
    let minEval = Infinity;

    for (const [fr, fc, tr, tc] of moves) {
      const newBoard = applyMove(board, fr, fc, tr, tc, enPassantTarget);
      const newEP = getNewEnPassantTarget(board, fr, fc, tr, tc);
      const newCR = getNewCastlingRights(board, castlingRights, fr, fc);

      const evalScore = minimax(newBoard, depth - 1, alpha, beta, true, newEP, newCR);
      minEval = Math.min(minEval, evalScore);
      beta = Math.min(beta, evalScore);

      if (beta <= alpha) break; // Alpha cut-off
    }

    return minEval;
  }
}

function getNewEnPassantTarget(
  board: Board,
  fromRow: number,
  fromCol: number,
  toRow: number,
  toCol: number
): [number, number] | null {
  const piece = board[fromRow][fromCol];
  if (piece?.type === 'pawn' && Math.abs(toRow - fromRow) === 2) {
    return [(fromRow + toRow) / 2, toCol];
  }
  return null;
}

function getNewCastlingRights(
  board: Board,
  rights: CastlingRights,
  fromRow: number,
  fromCol: number
): CastlingRights {
  const piece = board[fromRow][fromCol];
  const newRights = { ...rights };

  if (piece?.type === 'king') {
    if (piece.color === 'white') {
      newRights.whiteKingSide = false;
      newRights.whiteQueenSide = false;
    } else {
      newRights.blackKingSide = false;
      newRights.blackQueenSide = false;
    }
  }

  if (piece?.type === 'rook') {
    if (fromRow === 7 && fromCol === 0) newRights.whiteQueenSide = false;
    if (fromRow === 7 && fromCol === 7) newRights.whiteKingSide = false;
    if (fromRow === 0 && fromCol === 0) newRights.blackQueenSide = false;
    if (fromRow === 0 && fromCol === 7) newRights.blackKingSide = false;
  }

  return newRights;
}

export type AIDifficulty = 'easy' | 'medium' | 'hard';

const DIFFICULTY_DEPTH: Record<AIDifficulty, number> = {
  easy: 1,
  medium: 2,
  hard: 3,
};

/**
 * Returns the best move for the given color using minimax.
 */
export function getBestMove(
  board: Board,
  color: PieceColor,
  enPassantTarget: [number, number] | null,
  castlingRights: CastlingRights,
  difficulty: AIDifficulty = 'medium'
): AIMove | null {
  const depth = DIFFICULTY_DEPTH[difficulty];
  const isMaximizing = color === 'white';
  const moves = getAllMoves(board, color, enPassantTarget, castlingRights);

  if (moves.length === 0) return null;

  let bestMove: AIMove | null = null;
  let bestScore = isMaximizing ? -Infinity : Infinity;

  // Shuffle moves slightly for variety at easy difficulty
  const shuffledMoves = difficulty === 'easy'
    ? [...moves].sort(() => Math.random() - 0.5)
    : moves;

  for (const [fr, fc, tr, tc] of shuffledMoves) {
    const newBoard = applyMove(board, fr, fc, tr, tc, enPassantTarget);
    const newEP = getNewEnPassantTarget(board, fr, fc, tr, tc);
    const newCR = getNewCastlingRights(board, castlingRights, fr, fc);

    const score = minimax(
      newBoard,
      depth - 1,
      -Infinity,
      Infinity,
      !isMaximizing,
      newEP,
      newCR
    );

    if (isMaximizing ? score > bestScore : score < bestScore) {
      bestScore = score;
      bestMove = { fromRow: fr, fromCol: fc, toRow: tr, toCol: tc, score };
    }
  }

  return bestMove;
}
