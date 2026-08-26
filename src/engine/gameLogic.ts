import { Board, Piece, PieceColor, GameState } from '../types/game';

export function createInitialBoard(): Board {
  const board: Board = Array(8).fill(null).map(() => Array(8).fill(null));

  // Black pieces - row 0
  board[0][0] = { type: 'rook', color: 'black' };
  board[0][1] = { type: 'knight', color: 'black' };
  board[0][2] = { type: 'bishop', color: 'black' };
  board[0][3] = { type: 'queen', color: 'black' };
  board[0][4] = { type: 'king', color: 'black' };
  board[0][5] = { type: 'bishop', color: 'black' };
  board[0][6] = { type: 'knight', color: 'black' };
  board[0][7] = { type: 'rook', color: 'black' };

  // Black pawns - row 1
  for (let col = 0; col < 8; col++) {
    board[1][col] = { type: 'pawn', color: 'black' };
  }

  // White pawns - row 6
  for (let col = 0; col < 8; col++) {
    board[6][col] = { type: 'pawn', color: 'white' };
  }

  // White pieces - row 7
  board[7][0] = { type: 'rook', color: 'white' };
  board[7][1] = { type: 'knight', color: 'white' };
  board[7][2] = { type: 'bishop', color: 'white' };
  board[7][3] = { type: 'queen', color: 'white' };
  board[7][4] = { type: 'king', color: 'white' };
  board[7][5] = { type: 'bishop', color: 'white' };
  board[7][6] = { type: 'knight', color: 'white' };
  board[7][7] = { type: 'rook', color: 'white' };

  return board;
}

export function createInitialGameState(): GameState {
  return {
    board: createInitialBoard(),
    currentTurn: 'white',
    selectedSquare: null,
    possibleMoves: [],
    capturedByWhite: [],
    capturedByBlack: [],
    isCheck: false,
    isCheckmate: false,
    isStalemate: false,
    moveHistory: [],
    whiteTime: 600,
    blackTime: 600,
    gameStatus: 'playing',
    winner: null,
    promotionPending: null,
    enPassantTarget: null,
    castlingRights: {
      whiteKingSide: true,
      whiteQueenSide: true,
      blackKingSide: true,
      blackQueenSide: true,
    },
  };
}

export function isInBounds(row: number, col: number): boolean {
  return row >= 0 && row < 8 && col >= 0 && col < 8;
}

export function cloneBoard(board: Board): Board {
  return board.map(row => row.map(cell => (cell ? { ...cell } : null)));
}

export function findKing(board: Board, color: PieceColor): [number, number] | null {
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const piece = board[r][c];
      if (piece && piece.type === 'king' && piece.color === color) {
        return [r, c];
      }
    }
  }
  return null;
}

export function isSquareAttacked(
  board: Board,
  row: number,
  col: number,
  byColor: PieceColor
): boolean {
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const piece = board[r][c];
      if (!piece || piece.color !== byColor) continue;
      const moves = getRawMoves(board, r, c, null);
      if (moves.some(([mr, mc]) => mr === row && mc === col)) return true;
    }
  }
  return false;
}

export function isKingInCheck(board: Board, color: PieceColor): boolean {
  const kingPos = findKing(board, color);
  if (!kingPos) return false;
  const opponent: PieceColor = color === 'white' ? 'black' : 'white';
  return isSquareAttacked(board, kingPos[0], kingPos[1], opponent);
}

function getRawMoves(
  board: Board,
  row: number,
  col: number,
  enPassantTarget: [number, number] | null
): [number, number][] {
  const piece = board[row][col];
  if (!piece) return [];

  const moves: [number, number][] = [];
  const { type, color } = piece;
  const opponent: PieceColor = color === 'white' ? 'black' : 'white';

  const addIfValid = (r: number, c: number, canCapture = true, mustCapture = false) => {
    if (!isInBounds(r, c)) return false;
    const target = board[r][c];
    if (target) {
      if (canCapture && target.color === opponent) {
        moves.push([r, c]);
      }
      return false; // blocked
    }
    if (!mustCapture) moves.push([r, c]);
    return true; // empty square, continue sliding
  };

  const slide = (drs: number[], dcs: number[]) => {
    for (let i = 0; i < drs.length; i++) {
      let r = row + drs[i];
      let c = col + dcs[i];
      while (isInBounds(r, c)) {
        const target = board[r][c];
        if (target) {
          if (target.color === opponent) moves.push([r, c]);
          break;
        }
        moves.push([r, c]);
        r += drs[i];
        c += dcs[i];
      }
    }
  };

  switch (type) {
    case 'pawn': {
      const dir = color === 'white' ? -1 : 1;
      const startRow = color === 'white' ? 6 : 1;
      // Forward move
      if (isInBounds(row + dir, col) && !board[row + dir][col]) {
        moves.push([row + dir, col]);
        // Double push from start
        if (row === startRow && !board[row + 2 * dir][col]) {
          moves.push([row + 2 * dir, col]);
        }
      }
      // Captures
      for (const dc of [-1, 1]) {
        const nr = row + dir;
        const nc = col + dc;
        if (isInBounds(nr, nc)) {
          if (board[nr][nc] && board[nr][nc]!.color === opponent) {
            moves.push([nr, nc]);
          }
          // En passant
          if (enPassantTarget && enPassantTarget[0] === nr && enPassantTarget[1] === nc) {
            moves.push([nr, nc]);
          }
        }
      }
      break;
    }
    case 'knight': {
      const knightMoves = [
        [-2, -1], [-2, 1], [-1, -2], [-1, 2],
        [1, -2], [1, 2], [2, -1], [2, 1],
      ];
      for (const [dr, dc] of knightMoves) {
        addIfValid(row + dr, col + dc);
      }
      break;
    }
    case 'bishop':
      slide([-1, -1, 1, 1], [-1, 1, -1, 1]);
      break;
    case 'rook':
      slide([-1, 1, 0, 0], [0, 0, -1, 1]);
      break;
    case 'queen':
      slide([-1, -1, 1, 1, -1, 1, 0, 0], [-1, 1, -1, 1, 0, 0, -1, 1]);
      break;
    case 'king': {
      for (const dr of [-1, 0, 1]) {
        for (const dc of [-1, 0, 1]) {
          if (dr === 0 && dc === 0) continue;
          addIfValid(row + dr, col + dc);
        }
      }
      break;
    }
  }

  return moves;
}

export function getLegalMoves(
  board: Board,
  row: number,
  col: number,
  enPassantTarget: [number, number] | null,
  castlingRights: GameState['castlingRights']
): [number, number][] {
  const piece = board[row][col];
  if (!piece) return [];

  const rawMoves = getRawMoves(board, row, col, enPassantTarget);
  const legal: [number, number][] = [];

  for (const [toRow, toCol] of rawMoves) {
    const newBoard = cloneBoard(board);
    newBoard[toRow][toCol] = newBoard[row][col];
    newBoard[row][col] = null;

    // Handle en passant capture removal
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

    if (!isKingInCheck(newBoard, piece.color)) {
      legal.push([toRow, toCol]);
    }
  }

  // Castling
  if (piece.type === 'king' && !isKingInCheck(board, piece.color)) {
    const backRank = piece.color === 'white' ? 7 : 0;
    const opponent: PieceColor = piece.color === 'white' ? 'black' : 'white';

    // King side
    const kingSide = piece.color === 'white'
      ? castlingRights.whiteKingSide
      : castlingRights.blackKingSide;

    if (
      kingSide &&
      board[backRank][5] === null &&
      board[backRank][6] === null &&
      board[backRank][7]?.type === 'rook' &&
      board[backRank][7]?.color === piece.color &&
      !isSquareAttacked(board, backRank, 5, opponent) &&
      !isSquareAttacked(board, backRank, 6, opponent)
    ) {
      legal.push([backRank, 6]);
    }

    // Queen side
    const queenSide = piece.color === 'white'
      ? castlingRights.whiteQueenSide
      : castlingRights.blackQueenSide;

    if (
      queenSide &&
      board[backRank][3] === null &&
      board[backRank][2] === null &&
      board[backRank][1] === null &&
      board[backRank][0]?.type === 'rook' &&
      board[backRank][0]?.color === piece.color &&
      !isSquareAttacked(board, backRank, 3, opponent) &&
      !isSquareAttacked(board, backRank, 2, opponent)
    ) {
      legal.push([backRank, 2]);
    }
  }

  return legal;
}

export function hasAnyLegalMoves(
  board: Board,
  color: PieceColor,
  enPassantTarget: [number, number] | null,
  castlingRights: GameState['castlingRights']
): boolean {
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const piece = board[r][c];
      if (piece && piece.color === color) {
        const moves = getLegalMoves(board, r, c, enPassantTarget, castlingRights);
        if (moves.length > 0) return true;
      }
    }
  }
  return false;
}

export function getMoveNotation(
  piece: Piece,
  fromRow: number,
  fromCol: number,
  toRow: number,
  toCol: number,
  isCapture: boolean,
  isCheck: boolean,
  isCheckmate: boolean
): string {
  const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
  const ranks = ['8', '7', '6', '5', '4', '3', '2', '1'];
  const pieceSymbols: Record<string, string> = {
    pawn: '',
    knight: 'N',
    bishop: 'B',
    rook: 'R',
    queen: 'Q',
    king: 'K',
  };

  const symbol = pieceSymbols[piece.type];
  const fromFile = files[fromCol];
  const toFile = files[toCol];
  const toRank = ranks[toRow];
  const capture = isCapture ? 'x' : '';
  const check = isCheckmate ? '#' : isCheck ? '+' : '';

  if (piece.type === 'pawn') {
    if (isCapture) return `${fromFile}x${toFile}${toRank}${check}`;
    return `${toFile}${toRank}${check}`;
  }

  return `${symbol}${capture}${toFile}${toRank}${check}`;
}

export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}
