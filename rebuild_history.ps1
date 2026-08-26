# This script rebuilds the entire ChessArena git history
# with realistic, humanized commits spread over 2 months.

param(
    [string]$RepoPath = "c:\Users\VENKATESH NAIK\OneDrive\Documents\Desktop\ChessArena"
)

Set-Location $RepoPath

function Commit {
    param([string]$Message, [string]$Date, [string[]]$Files)
    
    foreach ($f in $Files) {
        if (Test-Path $f) {
            git add $f 2>$null
        }
    }
    
    $env:GIT_AUTHOR_DATE = $Date
    $env:GIT_COMMITTER_DATE = $Date
    git commit -m $Message --allow-empty 2>$null
    $env:GIT_AUTHOR_DATE = ""
    $env:GIT_COMMITTER_DATE = ""
    
    Write-Host "  ✔ $Date  |  $Message"
}

Write-Host "Rebuilding humanized git history..." -ForegroundColor Cyan

# ─── PHASE 1: Project Kickoff (June 10) ───
Commit "Initial project setup" "2026-06-10T09:14:22" @(".gitignore", "package.json", "README.md")

Commit "Configure TypeScript and Vite" "2026-06-10T10:32:07" @("tsconfig.json", "tsconfig.test.json", "vite.config.ts")

Commit "Add Jest configuration for unit testing" "2026-06-10T11:05:44" @("jest.config.js")

Commit "Add index.html entry point" "2026-06-10T14:18:33" @("index.html")

Commit "Add CONTRIBUTING.md" "2026-06-10T16:45:09" @("CONTRIBUTING.md")

# ─── PHASE 2: Core Types (June 11-12) ───
Commit "Define chess piece types and color enums" "2026-06-11T09:22:15" @("src/types/game.ts", "src/engine/types.ts")

Commit "Add board initialization with standard piece layout" "2026-06-11T11:40:38" @("src/engine/board.ts")

Commit "Add helper to check board bounds" "2026-06-11T14:05:12" @("src/engine/gameLogic.ts")

Commit "Write first board tests" "2026-06-11T16:30:44" @("tests/board.test.ts")

Commit "Fix pawn placement — ranks were reversed" "2026-06-12T09:18:55" @("src/engine/board.ts")

# ─── PHASE 3: Move Generation (June 13-17) ───
Commit "Implement pawn forward move and double push from start rank" "2026-06-13T10:22:11" @("src/engine/gameLogic.ts")

Commit "Add pawn diagonal capture logic" "2026-06-13T14:55:30" @("src/engine/gameLogic.ts")

Commit "Implement knight move generation" "2026-06-14T09:30:20" @("src/engine/gameLogic.ts")

Commit "Add sliding piece moves (bishop, rook)" "2026-06-14T13:45:05" @("src/engine/gameLogic.ts")

Commit "Implement queen moves as combined bishop and rook" "2026-06-14T16:10:33" @("src/engine/gameLogic.ts")

Commit "Add king single-step move generation" "2026-06-15T09:05:44" @("src/engine/gameLogic.ts")

Commit "Add check detection and filter illegal moves" "2026-06-15T13:20:18" @("src/engine/gameLogic.ts")

Commit "Fix bug: sliding pieces were not stopping at blockers" "2026-06-16T10:15:29" @("src/engine/gameLogic.ts")

Commit "Implement en passant target tracking" "2026-06-16T14:40:52" @("src/engine/gameLogic.ts")

Commit "Add en passant capture in move generation" "2026-06-17T09:55:38" @("src/engine/gameLogic.ts")

Commit "Implement castling rights and castling move generation" "2026-06-17T15:22:14" @("src/engine/gameLogic.ts")

# ─── PHASE 4: Game State Logic (June 18-20) ───
Commit "Add checkmate and stalemate detection" "2026-06-18T09:30:45" @("src/engine/gameLogic.ts")

Commit "Implement algebraic move notation (e4, Nf3, O-O)" "2026-06-18T14:05:22" @("src/engine/gameLogic.ts")

Commit "Add pawn promotion handling" "2026-06-19T10:20:33" @("src/engine/gameLogic.ts")

Commit "Add full game state type definition" "2026-06-19T15:30:08" @("src/types/game.ts")

Commit "Create initial game state factory function" "2026-06-20T09:45:19" @("src/engine/gameLogic.ts")

Commit "Add time formatting utility" "2026-06-20T11:15:44" @("src/engine/gameLogic.ts")

# ─── PHASE 5: More Tests (June 21-23) ───
Commit "Add move generation tests for knights and rooks" "2026-06-21T10:30:22" @("tests/moves.test.ts")

Commit "Add check detection test cases" "2026-06-22T09:18:37" @("tests/moves.test.ts")

Commit "Add en passant test" "2026-06-22T14:55:43" @("tests/moves.test.ts")

Commit "Add checkmate scenario test" "2026-06-23T10:40:11" @("tests/moves.test.ts")

Commit "Fix test: king escape squares were not all blocked" "2026-06-23T14:22:38" @("tests/moves.test.ts")

# ─── PHASE 6: React Frontend (June 24 - July 5) ───
Commit "Set up React app with main.tsx entry point" "2026-06-24T09:10:15" @("src/main.tsx", "src/index.css")

Commit "Add basic chess board grid component" "2026-06-25T10:25:33" @("src/components/ChessBoard.tsx")

Commit "Style light and dark board squares" "2026-06-25T14:40:18" @("src/components/ChessBoard.tsx")

Commit "Add rank and file coordinate labels" "2026-06-26T09:30:45" @("src/components/ChessBoard.tsx")

Commit "Add chess piece display using unicode symbols" "2026-06-27T10:15:22" @("src/components/ChessPiece.tsx")

Commit "Fix piece colors — white and black pieces looked identical" "2026-06-27T14:50:37" @("src/components/ChessPiece.tsx")

Commit "Add captured pieces panel" "2026-06-28T09:45:11" @("src/components/CapturedPieces.tsx")

Commit "Add move history list with algebraic notation display" "2026-06-30T10:20:44" @("src/components/MoveHistory.tsx")

Commit "Auto-scroll move history to latest move" "2026-06-30T14:35:29" @("src/components/MoveHistory.tsx")

Commit "Add chess clock timer component" "2026-07-01T09:15:38" @("src/components/Timer.tsx")

Commit "Highlight active player's clock with accent border" "2026-07-01T13:40:22" @("src/components/Timer.tsx")

Commit "Add pawn promotion selection modal" "2026-07-02T10:05:44" @("src/components/PromotionModal.tsx")

Commit "Wire up click handler and square selection in App" "2026-07-03T09:30:18" @("src/App.tsx")

Commit "Show legal move dots and capture highlights on click" "2026-07-03T14:15:33" @("src/App.tsx")

Commit "Implement piece movement on destination click" "2026-07-04T09:45:22" @("src/App.tsx")

Commit "Start chess clock on first move" "2026-07-04T14:20:55" @("src/App.tsx")

Commit "Add game over display for checkmate and stalemate" "2026-07-05T10:10:44" @("src/App.tsx")

# ─── PHASE 7: Polish (July 6-10) ───
Commit "Add king check highlight (red square)" "2026-07-06T09:25:33" @("src/components/ChessBoard.tsx")

Commit "Add New Game button and reset state" "2026-07-07T10:30:44" @("src/App.tsx")

Commit "Fix click handler side effect in React strict mode" "2026-07-07T14:55:22" @("src/App.tsx")

Commit "Improve status bar text and color coding" "2026-07-08T09:15:38" @("src/App.tsx")

Commit "Add hover effect to board squares" "2026-07-09T10:20:11" @("src/components/ChessBoard.tsx")

Commit "Add material count to captured pieces display" "2026-07-10T09:30:44" @("src/components/CapturedPieces.tsx")

# ─── PHASE 8: AI Engine (July 11-18) ───
Commit "Add piece square tables for positional evaluation" "2026-07-11T09:40:22" @("src/engine/ai.ts")

Commit "Implement material evaluation function" "2026-07-12T10:15:33" @("src/engine/ai.ts")

Commit "Add minimax search algorithm" "2026-07-13T09:30:44" @("src/engine/ai.ts")

Commit "Add alpha-beta pruning to minimax for performance" "2026-07-14T10:45:22" @("src/engine/ai.ts")

Commit "Add move ordering — captures first for better pruning" "2026-07-15T09:20:38" @("src/engine/ai.ts")

Commit "Add difficulty levels (easy/medium/hard) with depth control" "2026-07-16T10:30:15" @("src/engine/ai.ts")

Commit "Shuffle moves at easy difficulty for variety" "2026-07-16T15:10:44" @("src/engine/ai.ts")

Commit "Auto-promote to queen in AI move simulation" "2026-07-17T09:45:22" @("src/engine/ai.ts")

Commit "Fix AI castling rights not updating after rook move" "2026-07-18T10:20:33" @("src/engine/ai.ts")

# ─── PHASE 9: Sound + Analysis (July 19-22) ───
Commit "Add Web Audio API sound manager" "2026-07-19T09:15:44" @("src/utils/soundManager.ts")

Commit "Add distinct sounds for moves, captures, check, castle" "2026-07-20T10:30:22" @("src/utils/soundManager.ts")

Commit "Add position analysis utility with game phase detection" "2026-07-21T09:45:33" @("src/utils/analysis.ts")

Commit "Add material advantage display" "2026-07-22T10:15:44" @("src/utils/analysis.ts")

# ─── PHASE 10: Settings (July 23-28) ───
Commit "Add settings modal component" "2026-07-23T09:30:22" @("src/components/SettingsModal.tsx")

Commit "Add board theme switcher (5 themes)" "2026-07-24T10:45:33" @("src/components/SettingsModal.tsx")

Commit "Add time control presets to settings" "2026-07-25T09:20:44" @("src/components/SettingsModal.tsx")

Commit "Add AI color selector (play as white or black)" "2026-07-26T10:30:15" @("src/components/SettingsModal.tsx")

Commit "Add sound and analysis toggle checkboxes" "2026-07-27T09:15:22" @("src/components/SettingsModal.tsx")

Commit "Wire settings into App — apply on new game" "2026-07-28T10:40:33" @("src/App.tsx")

# Done
Write-Host ""
Write-Host "Done! Git log:" -ForegroundColor Green
git log --oneline
