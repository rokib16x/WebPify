# Contributing to WebPify

Thanks for your interest in contributing. This guide covers how to set up the project and submit changes.

## Development setup

1. Fork and clone the repository
2. Install dependencies: `npm install`
3. (Optional) Copy `.env.example` to `.env` and fill in Upstash Redis values if you need the conversion counter
4. Start the app: `npm run dev`

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Vite development server |
| `npm run build` | Production build |
| `npm run preview` | Preview the production build |
| `npm run lint` | Run ESLint |

## Pull requests

1. Create a branch from `main` (`feature/…`, `fix/…`, or `docs/…`)
2. Keep changes focused — one concern per PR when possible
3. Run `npm run lint` and `npm run build` before opening the PR
4. Fill out the pull request template

For larger ideas or breaking changes, open an issue first so we can discuss direction.

## Reporting bugs

Use the bug report issue template. Include steps to reproduce, expected vs actual behavior, browser/OS, and screenshots when useful.

## Feature requests

Use the feature request template. Describe the problem, your proposed solution, and any alternatives you considered.

## Code style

- Match the existing React / Vite / Tailwind patterns in the repo
- Prefer clear, small commits with meaningful messages
- Do not commit secrets, `.env` files, or `node_modules`

## License

By contributing, you agree that your contributions will be licensed under the [MIT License](LICENSE).
