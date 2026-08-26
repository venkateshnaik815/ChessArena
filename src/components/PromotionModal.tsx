import React from 'react';
import { PieceType } from '../types/game';

interface PromotionModalProps {
  color: 'white' | 'black';
  onSelect: (piece: PieceType) => void;
}

const SYMBOLS: Record<string, Record<string, string>> = {
  white: { queen: '♕', rook: '♖', bishop: '♗', knight: '♘' },
  black: { queen: '♛', rook: '♜', bishop: '♝', knight: '♞' },
};

const choices: PieceType[] = ['queen', 'rook', 'bishop', 'knight'];

const PromotionModal: React.FC<PromotionModalProps> = ({ color, onSelect }) => {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}
    >
      <div
        style={{
          background: '#16213e',
          borderRadius: '16px',
          padding: '32px',
          border: '2px solid #e94560',
          boxShadow: '0 20px 60px rgba(0,0,0,0.8)',
          textAlign: 'center',
        }}
      >
        <h2 style={{ color: '#eaeaea', marginBottom: '8px', fontSize: '22px' }}>Pawn Promotion!</h2>
        <p style={{ color: '#888', marginBottom: '24px', fontSize: '14px' }}>Choose a piece to promote to:</p>
        <div style={{ display: 'flex', gap: '16px' }}>
          {choices.map(piece => (
            <button
              key={piece}
              onClick={() => onSelect(piece)}
              style={{
                width: '80px',
                height: '80px',
                borderRadius: '12px',
                border: '2px solid #333',
                background: '#0f3460',
                cursor: 'pointer',
                fontSize: '48px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s',
                gap: '4px',
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLButtonElement).style.border = '2px solid #e94560';
                (e.currentTarget as HTMLButtonElement).style.background = '#1a1a4e';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLButtonElement).style.border = '2px solid #333';
                (e.currentTarget as HTMLButtonElement).style.background = '#0f3460';
              }}
            >
              <span>{SYMBOLS[color][piece]}</span>
              <span style={{ fontSize: '11px', color: '#aaa', textTransform: 'capitalize' }}>{piece}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PromotionModal;
