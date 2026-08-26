import React from 'react';
import { Piece } from '../types/game';

interface CapturedPiecesProps {
  pieces: Piece[];
  color: 'white' | 'black';
  label: string;
}

const PIECE_SYMBOLS: Record<string, Record<string, string>> = {
  white: { king: '♔', queen: '♕', rook: '♖', bishop: '♗', knight: '♘', pawn: '♙' },
  black: { king: '♚', queen: '♛', rook: '♜', bishop: '♝', knight: '♞', pawn: '♟' },
};

const PIECE_VALUES: Record<string, number> = {
  pawn: 1, knight: 3, bishop: 3, rook: 5, queen: 9, king: 0,
};

const CapturedPieces: React.FC<CapturedPiecesProps> = ({ pieces, color, label }) => {
  const sorted = [...pieces].sort((a, b) => PIECE_VALUES[b.type] - PIECE_VALUES[a.type]);
  const total = pieces.reduce((sum, p) => sum + PIECE_VALUES[p.type], 0);

  return (
    <div style={{ padding: '8px 0' }}>
      <div style={{ fontSize: '11px', color: '#888', marginBottom: '4px' }}>{label}</div>
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '2px', minHeight: '28px' }}>
        {sorted.map((piece, i) => (
          <span key={i} style={{ fontSize: '20px', opacity: 0.9 }}>
            {PIECE_SYMBOLS[piece.color][piece.type]}
          </span>
        ))}
        {total > 0 && (
          <span style={{ fontSize: '12px', color: '#aaa', marginLeft: '4px' }}>+{total}</span>
        )}
        {pieces.length === 0 && (
          <span style={{ fontSize: '12px', color: '#555' }}>None captured</span>
        )}
      </div>
    </div>
  );
};

export default CapturedPieces;
