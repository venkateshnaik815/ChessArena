# ChessArena ♟

A full-featured chess application built with React and TypeScript. Play against a friend locally or challenge the built-in AI engine.

## Features

- 🎮 Local 2-player mode
- 🤖 AI opponent with adjustable difficulty (Easy / Medium / Hard)
- ⏱ Chess clock with multiple time controls
- 📋 Full move history in algebraic notation
- ✅ Complete chess rules — castling, en passant, pawn promotion
- ♟ Check, checkmate, and stalemate detection
- 🎵 Sound effects for moves and captures
- 🎨 Multiple board themes
- 📱 Responsive layout

## Getting Started

### Prerequisites

- Node.js 18+
- npm 9+

### Installation

```bash
git clone https://github.com/your-username/ChessArena.git
cd ChessArena
npm install
```

### Running the app

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Running tests

```bash
npm test
```

## Tech Stack

- **Frontend:** React 19, TypeScript, Vite
- **Testing:** Jest, ts-jest
- **Engine:** Custom chess engine (bitboard-inspired move generation)

## Project Structure

```
src/
  components/     # React UI components
  engine/         # Chess logic and AI
  types/          # TypeScript type definitions
  hooks/          # Custom React hooks
  utils/          # Utility functions
tests/            # Unit tests
```

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## License

MIT
