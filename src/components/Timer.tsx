import React from 'react';
import { formatTime } from '../engine/gameLogic';
import { PieceColor } from '../types/game';

interface TimerProps {
  time: number;
  isActive: boolean;
  color: PieceColor;
}

const Timer: React.FC<TimerProps> = ({ time, isActive, color }) => {
  const isLow = time < 30;

  return (
    <div
      style={{
        padding: '12px 20px',
        borderRadius: '8px',
        background: isActive ? (color === 'white' ? '#f0d9b5' : '#333') : '#1a1a2e',
        border: isActive ? '2px solid #e94560' : '2px solid #333',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        transition: 'all 0.3s',
        boxShadow: isActive ? '0 0 12px rgba(233, 69, 96, 0.3)' : 'none',
      }}
    >
      <div
        style={{
          width: '14px',
          height: '14px',
          borderRadius: '50%',
          background: color === 'white' ? '#f0d9b5' : '#333',
          border: '2px solid ' + (color === 'white' ? '#333' : '#f0d9b5'),
        }}
      />
      <span
        style={{
          fontSize: '28px',
          fontWeight: 700,
          fontFamily: 'monospace',
          color: isLow && isActive ? '#e94560' : isActive
            ? (color === 'white' ? '#1a1a2e' : '#eaeaea')
            : '#555',
          animation: isLow && isActive ? 'pulse 1s infinite' : 'none',
        }}
      >
        {formatTime(time)}
      </span>
      <span style={{ fontSize: '12px', color: '#888' }}>
        {color === 'white' ? 'White' : 'Black'}
      </span>
    </div>
  );
};

export default Timer;
