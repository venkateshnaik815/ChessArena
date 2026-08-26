import React, { useState, useEffect, useCallback } from 'react';
import ChessBoard from './components/ChessBoard';
import CapturedPieces from './components/CapturedPieces';
import MoveHistory from './components/MoveHistory';
import Timer from './components/Timer';
import PromotionModal from './components/PromotionModal';
import {
  createInitialGameState,
  cloneBoard,
  getLegalMoves,
  isKingInCheck,
  hasAnyLegalMoves,
  getMoveNotation,
} from './engine/gameLogic';
import { GameState, Piece, PieceColor, PieceType } from './types/game';

function App() {
  const [gameState, setGameState] = useState<GameState>(createInitialGameState());
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  // Chess clock countdown
  useEffect(() => {
    if (!isTimerRunning || gameState.gameStatus !== 'playing') return;
    const interval = setInterval(() => {
      setGameState(prev => {
        if (prev.gameStatus !== 'playing') return prev;
        const isWhiteTurn = prev.currentTurn === 'white';
        const newWhiteTime = isWhiteTurn ? prev.whiteTime - 1 : prev.whiteTime;
        const newBlackTime = !isWhiteTurn ? prev.blackTime - 1 : prev.blackTime;
        if (newWhiteTime <= 0 || newBlackTime <= 0) {
          return {
            ...prev,
            whiteTime: Math.max(0, newWhiteTime),
            blackTime: Math.max(0, newBlackTime),
            gameStatus: 'checkmate',
            winner: isWhiteTurn ? 'black' : 'white',
          };
        }
        return { ...prev, whiteTime: newWhiteTime, blackTime: newBlackTime };
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isTimerRunning, gameState.gameStatus, gameState.currentTurn]);

  const handleSquareClick = useCallback((row: number, col: number) => {
    setGameState(prev => {
      if (prev.gameStatus !== 'playing') return prev;

      const { board, selectedSquare, possibleMoves, currentTurn, enPassantTarget, castlingRights } = prev;
      const clickedPiece = board[row][col];

      // --- Move execution ---
      if (selectedSquare && possibleMoves.some(([r, c]) => r === row && c === col)) {
        const [fromRow, fromCol] = selectedSquare;
        const movingPiece = board[fromRow][fromCol]!;
        const newBoard = cloneBoard(board);
        const capturedPiece = newBoard[row][col];

        // Move piece
        newBoard[row][col] = movingPiece;
        newBoard[fromRow][fromCol] = null;

        // Castling: move rook
        if (movingPiece.type === 'king') {
          const backRank = currentTurn === 'white' ? 7 : 0;
          if (fromCol === 4 && col === 6) {
            // King-side
            newBoard[backRank][5] = newBoard[backRank][7];
            newBoard[backRank][7] = null;
          } else if (fromCol === 4 && col === 2) {
            // Queen-side
            newBoard[backRank][3] = newBoard[backRank][0];
            newBoard[backRank][0] = null;
          }
        }

        // En passant: remove captured pawn
        let enPassantCapture: Piece | null = null;
        if (
          movingPiece.type === 'pawn' &&
          enPassantTarget &&
          row === enPassantTarget[0] &&
          col === enPassantTarget[1] &&
          !board[row][col]
        ) {
          const capturedRow = currentTurn === 'white' ? row + 1 : row - 1;
          enPassantCapture = newBoard[capturedRow][col];
          newBoard[capturedRow][col] = null;
        }

        // Pawn promotion check
        const isPromotion =
          movingPiece.type === 'pawn' &&
          ((currentTurn === 'white' && row === 0) || (currentTurn === 'black' && row === 7));

        // New en passant target
        let newEnPassantTarget: [number, number] | null = null;
        if (movingPiece.type === 'pawn' && Math.abs(row - fromRow) === 2) {
          newEnPassantTarget = [(row + fromRow) / 2, col];
        }

        // Update castling rights
        const newCastlingRights = { ...castlingRights };
        if (movingPiece.type === 'king') {
          if (currentTurn === 'white') { newCastlingRights.whiteKingSide = false; newCastlingRights.whiteQueenSide = false; }
          else { newCastlingRights.blackKingSide = false; newCastlingRights.blackQueenSide = false; }
        }
        if (movingPiece.type === 'rook') {
          if (fromRow === 7 && fromCol === 0) newCastlingRights.whiteQueenSide = false;
          if (fromRow === 7 && fromCol === 7) newCastlingRights.whiteKingSide = false;
          if (fromRow === 0 && fromCol === 0) newCastlingRights.blackQueenSide = false;
          if (fromRow === 0 && fromCol === 7) newCastlingRights.blackKingSide = false;
        }

        // Promotion pending — pause before changing turn
        if (isPromotion) {
          const allCaptured = capturedPiece
            ? [...prev[currentTurn === 'white' ? 'capturedByWhite' : 'capturedByBlack'], capturedPiece]
            : prev[currentTurn === 'white' ? 'capturedByWhite' : 'capturedByBlack'];
          return {
            ...prev,
            board: newBoard,
            selectedSquare: null,
            possibleMoves: [],
            capturedByWhite: currentTurn === 'white' ? allCaptured : prev.capturedByWhite,
            capturedByBlack: currentTurn === 'black' ? allCaptured : prev.capturedByBlack,
            promotionPending: [row, col],
            enPassantTarget: newEnPassantTarget,
            castlingRights: newCastlingRights,
          };
        }

        const opponent: PieceColor = currentTurn === 'white' ? 'black' : 'white';
        const opponentInCheck = isKingInCheck(newBoard, opponent);
        const opponentHasMoves = hasAnyLegalMoves(newBoard, opponent, newEnPassantTarget, newCastlingRights);

        let newGameStatus: GameState['gameStatus'] = 'playing';
        let winner: PieceColor | null = null;
        if (!opponentHasMoves) {
          newGameStatus = opponentInCheck ? 'checkmate' : 'stalemate';
          if (opponentInCheck) winner = currentTurn;
        }

        const notation = getMoveNotation(
          movingPiece, fromRow, fromCol, row, col,
          capturedPiece !== null || enPassantCapture !== null,
          opponentInCheck,
          newGameStatus === 'checkmate'
        );

        const capturedKey = currentTurn === 'white' ? 'capturedByWhite' : 'capturedByBlack';
        const allCaptured = capturedPiece
          ? [...prev[capturedKey], capturedPiece]
          : enPassantCapture
          ? [...prev[capturedKey], enPassantCapture]
          : prev[capturedKey];

        return {
          ...prev,
          board: newBoard,
          currentTurn: opponent,
          selectedSquare: null,
          possibleMoves: [],
          capturedByWhite: currentTurn === 'white' ? allCaptured : prev.capturedByWhite,
          capturedByBlack: currentTurn === 'black' ? allCaptured : prev.capturedByBlack,
          isCheck: opponentInCheck,
          isCheckmate: newGameStatus === 'checkmate',
          isStalemate: newGameStatus === 'stalemate',
          moveHistory: [...prev.moveHistory, notation],
          gameStatus: newGameStatus,
          winner,
          enPassantTarget: newEnPassantTarget,
          castlingRights: newCastlingRights,
          promotionPending: null,
        };
      }

      // --- Select own piece ---
      if (clickedPiece && clickedPiece.color === currentTurn) {
        const moves = getLegalMoves(board, row, col, enPassantTarget, castlingRights);
        return { ...prev, selectedSquare: [row, col], possibleMoves: moves };
      }

      // --- Deselect ---
      return { ...prev, selectedSquare: null, possibleMoves: [] };
    });

    // Start timer on first click (outside the updater to avoid side-effect issue)
    setIsTimerRunning(true);
  }, []);

  const handlePromotion = (pieceType: PieceType) => {
    setGameState(prev => {
      if (!prev.promotionPending) return prev;
      const [row, col] = prev.promotionPending;
      const newBoard = cloneBoard(prev.board);
      newBoard[row][col] = { type: pieceType, color: prev.currentTurn };

      const opponent: PieceColor = prev.currentTurn === 'white' ? 'black' : 'white';
      const opponentInCheck = isKingInCheck(newBoard, opponent);
      const opponentHasMoves = hasAnyLegalMoves(newBoard, opponent, prev.enPassantTarget, prev.castlingRights);

      let newGameStatus: GameState['gameStatus'] = 'playing';
      let winner: PieceColor | null = null;
      if (!opponentHasMoves) {
        newGameStatus = opponentInCheck ? 'checkmate' : 'stalemate';
        if (opponentInCheck) winner = prev.currentTurn;
      }

      const pieceSymbol: Record<PieceType, string> = {
        queen: 'Q', rook: 'R', bishop: 'B', knight: 'N', pawn: 'P', king: 'K',
      };

      return {
        ...prev,
        board: newBoard,
        currentTurn: opponent,
        promotionPending: null,
        isCheck: opponentInCheck,
        isCheckmate: newGameStatus === 'checkmate',
        isStalemate: newGameStatus === 'stalemate',
        gameStatus: newGameStatus,
        winner,
        moveHistory: [...prev.moveHistory, `=${pieceSymbol[pieceType]}${opponentInCheck ? '+' : ''}`],
      };
    });
  };

  const handleNewGame = () => {
    setGameState(createInitialGameState());
    setIsTimerRunning(false);
  };

  const { gameStatus, winner, currentTurn, isCheck } = gameState;

  const statusMessage = () => {
    if (gameStatus === 'checkmate') return `☠ Checkmate! ${winner === 'white' ? 'White' : 'Black'} wins!`;
    if (gameStatus === 'stalemate') return "🤝 Stalemate — Draw!";
    if (isCheck) return `⚠ ${currentTurn === 'white' ? 'White' : 'Black'} is in Check!`;
    return `${currentTurn === 'white' ? '⬜ White' : '⬛ Black'}'s Turn`;
  };

  const statusColor = () => {
    if (gameStatus !== 'playing') return '#e94560';
    if (isCheck) return '#ffa500';
    return '#aaa';
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '20px',
      fontFamily: "'Segoe UI', system-ui, sans-serif",
    }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <h1 style={{
          fontSize: '36px',
          fontWeight: 800,
          background: 'linear-gradient(135deg, #e94560, #f0d9b5)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          letterSpacing: '-1px',
          marginBottom: '2px',
        }}>
          ♟ ChessArena
        </h1>
        <p style={{ color: '#556', fontSize: '13px' }}>Play. Learn. Dominate.</p>
      </div>

      {/* Layout */}
      <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>

        {/* Left panel */}
        <div style={{
          width: '220px',
          background: 'rgba(255,255,255,0.04)',
          borderRadius: '14px',
          padding: '16px',
          border: '1px solid rgba(255,255,255,0.08)',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
        }}>
          <Timer time={gameState.blackTime} isActive={currentTurn === 'black' && gameStatus === 'playing'} color="black" />

          <CapturedPieces pieces={gameState.capturedByBlack} color="black" label="Captured by Black" />

          {/* Status box */}
          <div style={{
            padding: '10px',
            borderRadius: '8px',
            background: gameStatus !== 'playing' ? 'rgba(233,69,96,0.12)' : isCheck ? 'rgba(255,165,0,0.12)' : 'rgba(255,255,255,0.05)',
            border: `1px solid ${statusColor()}`,
            color: statusColor(),
            fontSize: '13px',
            textAlign: 'center',
            fontWeight: 600,
          }}>
            {statusMessage()}
          </div>

          <CapturedPieces pieces={gameState.capturedByWhite} color="white" label="Captured by White" />

          <Timer time={gameState.whiteTime} isActive={currentTurn === 'white' && gameStatus === 'playing'} color="white" />

          <button
            onClick={handleNewGame}
            style={{
              padding: '11px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #e94560, #c73652)',
              color: 'white',
              border: 'none',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 700,
              boxShadow: '0 4px 15px rgba(233,69,96,0.35)',
              transition: 'transform 0.1s',
            }}
            onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-2px)')}
            onMouseLeave={e => (e.currentTarget.style.transform = 'translateY(0)')}
          >
            🔄 New Game
          </button>
        </div>

        {/* Chessboard */}
        <ChessBoard gameState={gameState} onSquareClick={handleSquareClick} />

        {/* Right panel — Move history */}
        <div style={{
          width: '210px',
          background: 'rgba(255,255,255,0.04)',
          borderRadius: '14px',
          padding: '16px',
          border: '1px solid rgba(255,255,255,0.08)',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          minHeight: '400px',
        }}>
          <MoveHistory moves={gameState.moveHistory} />
          <div style={{ padding: '10px', borderRadius: '8px', background: '#0a0a1a', fontSize: '12px', color: '#444' }}>
            <div style={{ color: '#333', textTransform: 'uppercase', letterSpacing: '1px', fontSize: '10px', marginBottom: '5px' }}>Game Info</div>
            <div>Moves: {Math.ceil(gameState.moveHistory.length / 2)}</div>
            <div>Mode: Local 2-Player</div>
            <div>Time Control: 10+0</div>
          </div>
        </div>
      </div>

      {/* Promotion modal */}
      {gameState.promotionPending && (
        <PromotionModal color={gameState.currentTurn} onSelect={handlePromotion} />
      )}
    </div>
  );
}

export default App;
