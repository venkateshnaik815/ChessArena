import { Board } from '../src/engine/board';
import { Color, PieceType } from '../src/engine/types';

describe('Chess Board', () => {
    let board: Board;

    beforeEach(() => {
        board = new Board();
    });

    test('should initialize with correct active color', () => {
        expect(board.getActiveColor()).toBe(Color.White);
    });

    test('should place black pawns correctly on rank 7', () => {
        for (let i = 8; i < 16; i++) {
            const piece = board.getPiece(i);
            expect(piece).toBeDefined();
            expect(piece?.type).toBe(PieceType.Pawn);
            expect(piece?.color).toBe(Color.Black);
        }
    });

    test('should place white pawns correctly on rank 2', () => {
        for (let i = 48; i < 56; i++) {
            const piece = board.getPiece(i);
            expect(piece).toBeDefined();
            expect(piece?.type).toBe(PieceType.Pawn);
            expect(piece?.color).toBe(Color.White);
        }
    });

    test('should place kings correctly', () => {
        const blackKing = board.getPiece(4);
        expect(blackKing?.type).toBe(PieceType.King);
        expect(blackKing?.color).toBe(Color.Black);

        const whiteKing = board.getPiece(60);
        expect(whiteKing?.type).toBe(PieceType.King);
        expect(whiteKing?.color).toBe(Color.White);
    });

    test('should clear the board correctly', () => {
        board.clearBoard();
        for (let i = 0; i < 64; i++) {
            expect(board.getPiece(i)).toBeNull();
        }
    });
});
