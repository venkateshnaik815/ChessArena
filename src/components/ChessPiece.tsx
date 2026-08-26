import React from 'react';
import { Piece } from '../types/game';

interface ChessPieceProps {
  piece: Piece;
}

// Using filled unicode for both, but colored via CSS
const PIECE_SYMBOL: Record<string, string> = {
  king:   '♚',
  queen:  '♛',
  rook:   '♜',
  bishop: '♝',
  knight: '♞',
  pawn:   '♟',
};

const ChessPiece: React.FC<ChessPieceProps> = ({ piece }) => {
  const isWhite = piece.color === 'white';

  return (
    <span
      style={{
        fontSize: '44px',
        lineHeight: 1,
        userSelect: 'none',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: isWhite ? '#ffffff' : '#1a1a1a',
        textShadow: isWhite
          ? '0 1px 0 #333, 0 -1px 0 #333, 1px 0 0 #333, -1px 0 0 #333, 0 2px 4px rgba(0,0,0,0.5)'
          : '0 1px 0 #aaa, 0 -1px 0 #aaa, 1px 0 0 #aaa, -1px 0 0 #aaa, 0 2px 4px rgba(255,255,255,0.1)',
        transition: 'transform 0.1s',
      }}
    >
      {PIECE_SYMBOL[piece.type]}
    </span>
  );
};

export default ChessPiece;
