# Guildora

Guildora is a monorepo for a Discord-centered community platform. It combines:

- a Nuxt 4 landing application (`apps/web`)
- a Nuxt 4 internal hub application for members, moderation, admin, auth, and APIs (`apps/hub`)
- a Payload CMS 3 / Next.js application for content authoring (`apps/cms`)
- a Discord bot for voice tracking, guild synchronization, and setup helpers (`apps/bot`)
- a shared TypeScript package with Drizzle schema, database client, and cross-service types (`packages/shared`)

The repository documentation now lives primarily in [`docs/README.md`](./docs/README.md).

## Quick Start

```bash
pnpm install
cp .env.example .env
pnpm db:migrate
pnpm db:seed
pnpm dev
```

Useful workspace scripts:

- `pnpm dev`
- `pnpm build`
- `pnpm lint`
- `pnpm typecheck`
- `pnpm db:generate`
- `pnpm db:migrate`
- `pnpm db:seed`
- `pnpm bot:deploy-commands`
- `pnpm --filter @guildora/cms seed` — CMS mit Community-Inhalten befüllen

## Documentation Map

- Project overview: [`docs/project-overview.md`](./docs/project-overview.md)
- Architecture: [`docs/architecture.md`](./docs/architecture.md)
- Setup and deployment: [`docs/setup-build-deploy.md`](./docs/setup-build-deploy.md)
- Routing and navigation: [`docs/routing-and-navigation.md`](./docs/routing-and-navigation.md)
- Domain model: [`docs/domain-model.md`](./docs/domain-model.md)
- API contracts: [`docs/api-contracts.md`](./docs/api-contracts.md)
- AI working context: [`ai/README.md`](./ai/README.md)

## License

[PolyForm Noncommercial 1.0.0](LICENSE) — free for non-commercial use (self-hosting, modification, and forking allowed; commercial use prohibited)
