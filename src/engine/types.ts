export enum Color {
    White,
    Black,
}

export enum PieceType {
    Pawn,
    Knight,
    Bishop,
    Rook,
    Queen,
    King,
}

export interface Piece {
    type: PieceType;
    color: Color;
}

export type Square = number; // 0-63

export interface Move {
    from: Square;
    to: Square;
    promotion?: PieceType;
}
