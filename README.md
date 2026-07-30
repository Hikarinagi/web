# Hikarinagi Web

The Nuxt 4 web application for Hikarinagi.

This repository is mirrored from Hikarinagi's private development monorepo. It contains the web
application and the small set of shared packages required to build it independently. Issues and
pull requests are welcome here; maintainers import accepted changes into the upstream monorepo
before the next mirror sync.

## Requirements

- Node.js 24
- pnpm 10.10

## Develop

```bash
corepack enable
pnpm install
pnpm dev
```

## Validate

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

## License

AGPL-3.0-or-later
