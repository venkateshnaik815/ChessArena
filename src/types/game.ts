export type PieceColor = 'white' | 'black';
export type PieceType = 'pawn' | 'knight' | 'bishop' | 'rook' | 'queen' | 'king';

export interface Piece {
  type: PieceType;
  color: PieceColor;
}

export type Board = (Piece | null)[][];

export interface GameState {
  board: Board;
  currentTurn: PieceColor;
  selectedSquare: [number, number] | null;
  possibleMoves: [number, number][];
  capturedByWhite: Piece[];
  capturedByBlack: Piece[];
  isCheck: boolean;
  isCheckmate: boolean;
  isStalemate: boolean;
  moveHistory: string[];
  whiteTime: number;
  blackTime: number;
  gameStatus: 'playing' | 'checkmate' | 'stalemate' | 'draw';
  winner: PieceColor | null;
  promotionPending: [number, number] | null;
  enPassantTarget: [number, number] | null;
  castlingRights: {
    whiteKingSide: boolean;
    whiteQueenSide: boolean;
    blackKingSide: boolean;
    blackQueenSide: boolean;
  };
}
