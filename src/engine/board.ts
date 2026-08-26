import { Color, Piece, PieceType, Square } from './types';

export class Board {
    private squares: (Piece | null)[];
    private activeColor: Color;

    constructor() {
        this.squares = new Array(64).fill(null);
        this.activeColor = Color.White;
        this.setupInitialPosition();
    }

    public setupInitialPosition() {
        // Very basic initial setup for testing purposes
        for (let i = 8; i < 16; i++) {
            this.squares[i] = { type: PieceType.Pawn, color: Color.Black };
        }
        for (let i = 48; i < 56; i++) {
            this.squares[i] = { type: PieceType.Pawn, color: Color.White };
        }
        this.squares[0] = { type: PieceType.Rook, color: Color.Black };
        this.squares[7] = { type: PieceType.Rook, color: Color.Black };
        this.squares[56] = { type: PieceType.Rook, color: Color.White };
        this.squares[63] = { type: PieceType.Rook, color: Color.White };

        this.squares[4] = { type: PieceType.King, color: Color.Black };
        this.squares[60] = { type: PieceType.King, color: Color.White };
        // We will expand this fully later, this is just to get the testing started.
    }

    public getPiece(square: Square): Piece | null {
        if (square < 0 || square >= 64) return null;
        return this.squares[square];
    }

    public getActiveColor(): Color {
        return this.activeColor;
    }

    public clearBoard() {
        this.squares.fill(null);
    }
}
