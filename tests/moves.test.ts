import { Board } from '../src/engine/board';
import { Color, PieceType } from '../src/engine/types';
import {
  createInitialBoard,
  cloneBoard,
  isKingInCheck,
  getLegalMoves,
  hasAnyLegalMoves,
} from '../src/engine/gameLogic';

describe('Move Generation', () => {
  test('knight on e4 should have 8 possible moves in open position', () => {
    const board = createInitialBoard();
    // Clear pawns to expose the center
    for (let c = 0; c < 8; c++) {
      board[1][c] = null;
      board[6][c] = null;
    }
    // Place white knight on e4 (row 4, col 4)
    board[4][4] = { type: 'knight', color: 'white' };

    const castlingRights = {
      whiteKingSide: true, whiteQueenSide: true,
      blackKingSide: true, blackQueenSide: true,
    };

    const moves = getLegalMoves(board, 4, 4, null, castlingRights);
    expect(moves.length).toBe(8);
  });

  test('rook should be blocked by own pieces', () => {
    const board = createInitialBoard();
    const castlingRights = {
      whiteKingSide: true, whiteQueenSide: true,
      blackKingSide: true, blackQueenSide: true,
    };
    // White rook on a1 (row 7, col 0) is blocked by a2 pawn
    const moves = getLegalMoves(board, 7, 0, null, castlingRights);
    expect(moves.length).toBe(0);
  });

  test('bishop on open diagonal should have multiple moves', () => {
    const board = createInitialBoard();
    // Clear pawn in front of bishop
    board[6][3] = null;
    board[6][5] = null;
    const castlingRights = {
      whiteKingSide: true, whiteQueenSide: true,
      blackKingSide: true, blackQueenSide: true,
    };
    // White bishop at f1 (row 7, col 5)
    const moves = getLegalMoves(board, 7, 5, null, castlingRights);
    expect(moves.length).toBeGreaterThan(0);
  });

  test('king cannot move into check', () => {
    // Set up a position where king moving right would be into check
    const board: (null | { type: string; color: string })[][] =
      Array(8).fill(null).map(() => Array(8).fill(null));

    board[7][4] = { type: 'king', color: 'white' };
    board[0][5] = { type: 'rook', color: 'black' }; // controls f-file

    const castlingRights = {
      whiteKingSide: false, whiteQueenSide: false,
      blackKingSide: false, blackQueenSide: false,
    };

    const moves = getLegalMoves(board as any, 7, 4, null, castlingRights);
    // King should not be able to move to f1 (row 7, col 5) since rook on f8 controls that file
    const canMoveToF1 = moves.some(([r, c]) => r === 7 && c === 5);
    expect(canMoveToF1).toBe(false);
  });

  test('pawn en passant capture should be available', () => {
    const board: (null | { type: string; color: string })[][] =
      Array(8).fill(null).map(() => Array(8).fill(null));

    // White pawn on e5, black pawn just moved d7-d5
    board[3][4] = { type: 'pawn', color: 'white' }; // e5
    board[3][3] = { type: 'pawn', color: 'black' }; // d5
    board[7][4] = { type: 'king', color: 'white' };
    board[0][4] = { type: 'king', color: 'black' };

    const enPassantTarget: [number, number] = [2, 3]; // d6

    const castlingRights = {
      whiteKingSide: false, whiteQueenSide: false,
      blackKingSide: false, blackQueenSide: false,
    };

    const moves = getLegalMoves(board as any, 3, 4, enPassantTarget, castlingRights);
    const canEnPassant = moves.some(([r, c]) => r === 2 && c === 3);
    expect(canEnPassant).toBe(true);
  });
});

describe('Check Detection', () => {
  test('detects king in check from rook', () => {
    const board: (null | { type: string; color: string })[][] =
      Array(8).fill(null).map(() => Array(8).fill(null));

    board[7][4] = { type: 'king', color: 'white' };
    board[0][4] = { type: 'rook', color: 'black' }; // Same file

    expect(isKingInCheck(board as any, 'white')).toBe(true);
  });

  test('detects king NOT in check when blocked', () => {
    const board: (null | { type: string; color: string })[][] =
      Array(8).fill(null).map(() => Array(8).fill(null));

    board[7][4] = { type: 'king', color: 'white' };
    board[3][4] = { type: 'pawn', color: 'white' }; // Blocker
    board[0][4] = { type: 'rook', color: 'black' };

    expect(isKingInCheck(board as any, 'white')).toBe(false);
  });

  test('detects checkmate (no legal moves + in check)', () => {
    // Fool's mate position
    const board: (null | { type: string; color: string })[][] =
      Array(8).fill(null).map(() => Array(8).fill(null));

    // Minimal fool's mate setup
    board[0][4] = { type: 'king', color: 'black' };
    board[1][5] = { type: 'pawn', color: 'black' }; // f7 moved to f6? no...
    // Let's do a simpler forced checkmate
    board[0][7] = { type: 'king', color: 'black' };
    board[1][5] = { type: 'queen', color: 'white' }; // Queen on f7
    board[2][7] = { type: 'rook', color: 'white' }; // Rook on h6

    const castlingRights = {
      whiteKingSide: false, whiteQueenSide: false,
      blackKingSide: false, blackQueenSide: false,
    };

    const inCheck = isKingInCheck(board as any, 'black');
    const hasMoves = hasAnyLegalMoves(board as any, 'black', null, castlingRights);

    expect(inCheck).toBe(true);
    expect(hasMoves).toBe(false);
  });
});
