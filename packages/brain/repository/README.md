# @chad-chat/brain-repository

This package contains the repository layer for the Chad Chat Brain service. It provides data access, caching, and persistence logic for the domain and service layers, primarily using Prisma as the ORM.

## Structure

- `src/prisma/` — Contains Prisma schema and related files
- `src/cache/` — Caching logic and implementations
- `src/prisma/mutations/` — Prisma mutation queries
- `src/prisma/queries/` — Prisma read queries

## Usage

This package is intended to be used as part of the Chad Chat monorepo. It is not meant to be consumed directly, but rather imported by the Brain service and other internal packages.

### Generating the Prisma Schema

To generate the Prisma schema according to your authentication configuration, use the [Better Auth CLI](https://www.npmjs.com/package/@better-auth/cli) via Bun. Run the following command from the root of the monorepo:

```sh
bunx --bun @better-auth/cli@latest generate \
  --output ./packages/brain/repository/src/prisma/schema.prisma \
  --config ./packages/brain/service/src/auth/config.ts
```

- `--output` specifies where the generated Prisma schema will be saved.
- `--config` points to your authentication configuration file.

This ensures your Prisma schema is always in sync with your authentication logic.

## Development

- Make sure to keep the schema and generated files up to date.
- Run tests and linting before submitting changes.

## License

MIT
