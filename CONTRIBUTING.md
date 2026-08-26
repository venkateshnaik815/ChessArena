# Contributing to ChessArena

Thanks for your interest in contributing! Here are some guidelines.

## Reporting Bugs

Please open an issue with:
- Steps to reproduce
- Expected vs actual behavior
- Browser and OS version

## Pull Requests

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Make your changes with clear, descriptive commits
4. Add/update tests for new functionality
5. Run `npm test` and make sure all tests pass
6. Open a PR describing your changes

## Commit Style

Use conventional commits:
- `feat: add AI difficulty selector`
- `fix: resolve en passant edge case`
- `refactor: simplify move generation`
- `test: add castling unit tests`
- `docs: update README`

## Code Style

- TypeScript strict mode is enabled
- Avoid `any` types
- Keep components small and focused
- Add JSDoc comments for complex logic
