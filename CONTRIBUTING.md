# Contributing

Thanks for your interest in contributing to ink-timer!

## Getting Started

1. Fork and clone the repo
2. Install dependencies: `npm install`
3. Build the package: `npm run build`
4. Run tests: `npm test`

## Development

```bash
npm run dev       # watch mode (rebuilds on changes)
npm run test:watch # run tests in watch mode
npm run typecheck  # check types without emitting
```

Try out your changes with the demo:

```bash
npx tsx examples/demo-recording.tsx
```

## Pull Requests

- Open an issue first to discuss significant changes
- Keep PRs focused on a single change
- Add tests for new features or bug fixes
- Make sure `npm test` and `npm run typecheck` pass before submitting

## Code Style

- TypeScript, strict mode
- Functional React components and hooks
- Named exports only (no default exports)

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
