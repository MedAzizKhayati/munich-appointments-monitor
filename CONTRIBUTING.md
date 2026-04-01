# Contributing

Thanks for your interest in contributing.

## Development setup

1. Install dependencies:

```bash
pnpm install
```

2. Copy env template:

```bash
cp .env.example .env
```

3. Run checks before opening a PR:

```bash
pnpm run check
pnpm test
```

## Contribution guidelines

- Keep changes focused and small.
- Add or update tests for behavior changes.
- Avoid introducing hardcoded secrets or personal data.
- Update README when configuration or behavior changes.

## Pull request checklist

- Type check passes.
- Tests pass.
- No credentials or tokens are committed.
- Documentation updated when needed.
