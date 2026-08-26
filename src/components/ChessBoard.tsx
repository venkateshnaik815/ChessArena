import React from 'react';
import { GameState } from '../types/game';
import ChessPiece from './ChessPiece';
import { findKing } from '../engine/gameLogic';

interface ChessBoardProps {
  gameState: GameState;
  onSquareClick: (row: number, col: number) => void;
}

const FILES = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
const RANKS = ['8', '7', '6', '5', '4', '3', '2', '1'];

const ChessBoard: React.FC<ChessBoardProps> = ({ gameState, onSquareClick }) => {
  const { board, selectedSquare, possibleMoves, isCheck, currentTurn } = gameState;

  const kingPos = isCheck ? findKing(board, currentTurn) : null;

  const isSelected = (r: number, c: number) =>
    selectedSquare?.[0] === r && selectedSquare?.[1] === c;

  const isPossibleMove = (r: number, c: number) =>
    possibleMoves.some(([mr, mc]) => mr === r && mc === c);

  const isKingInCheckSquare = (r: number, c: number) =>
    kingPos?.[0] === r && kingPos?.[1] === c;

  const isLight = (r: number, c: number) => (r + c) % 2 === 0;

  const getSquareBg = (r: number, c: number): string => {
    if (isSelected(r, c)) return '#7fc97f';
    if (isKingInCheckSquare(r, c)) return '#e05555';
    if (isPossibleMove(r, c) && board[r][c]) return '#e07070'; // capturable piece
    if (isPossibleMove(r, c)) return isLight(r, c) ? '#cde6a0' : '#9dc869';
    return isLight(r, c) ? '#f0d9b5' : '#b58863';
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
      {/* Rank labels */}
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {RANKS.map(rank => (
          <div key={rank} style={{
            width: '18px', height: '70px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#7a7a9a', fontSize: '12px', fontWeight: 600,
          }}>
            {rank}
          </div>
        ))}
      </div>

      <div>
        {/* Board */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(8, 70px)',
          gridTemplateRows: 'repeat(8, 70px)',
          border: '3px solid #2a2a3e',
          borderRadius: '4px',
          overflow: 'hidden',
          boxShadow: '0 10px 40px rgba(0,0,0,0.6)',
        }}>
          {board.map((row, rowIdx) =>
            row.map((piece, colIdx) => (
              <div
                key={`${rowIdx}-${colIdx}`}
                onClick={() => onSquareClick(rowIdx, colIdx)}
                style={{
                  width: '70px', height: '70px',
                  background: getSquareBg(rowIdx, colIdx),
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  position: 'relative',
                  transition: 'background 0.12s',
                }}
              >
                {/* Dot for possible empty-square move */}
                {isPossibleMove(rowIdx, colIdx) && !piece && (
                  <div style={{
                    width: '22px', height: '22px',
                    borderRadius: '50%',
                    background: 'rgba(0,0,0,0.25)',
                    position: 'absolute',
                    pointerEvents: 'none',
                  }} />
                )}
                {piece && <ChessPiece piece={piece} />}
              </div>
            ))
          )}
        </div>

        {/* File labels */}
        <div style={{ display: 'flex' }}>
          {FILES.map(f => (
            <div key={f} style={{
              width: '70px', height: '18px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#7a7a9a', fontSize: '12px', fontWeight: 600,
            }}>
              {f}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ChessBoard;
