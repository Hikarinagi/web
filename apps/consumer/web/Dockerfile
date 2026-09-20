# syntax=docker/dockerfile:1.7

FROM node:24-bookworm-slim AS base

ENV PNPM_HOME=/pnpm
ENV PATH="${PNPM_HOME}:${PATH}"

WORKDIR /workspace

RUN corepack enable

FROM base AS build

ARG APP_VERSION=dev
ENV DATABASE_URL=postgresql://hikarinagi:hikarinagi@127.0.0.1:5432/hikarinagi?schema=public
ENV NODE_OPTIONS=--max-old-space-size=6144
ENV APP_VERSION=$APP_VERSION

RUN apt-get update \
  && apt-get install -y --no-install-recommends ca-certificates openssl \
  && rm -rf /var/lib/apt/lists/*

COPY . .

RUN --mount=type=cache,id=pnpm-store,target=/pnpm/store \
  pnpm install --frozen-lockfile \
  && pnpm build:frontend-deps \
  && BUILD_TIME="$(date -u +%Y-%m-%dT%H:%M:%SZ)" pnpm build:frontend \
  && pnpm --filter @hikarinagi/consumer-web deploy --prod /prod/frontend \
  && cp -R apps/consumer/web/.output /prod/frontend/.output \
  && rm -rf \
    /prod/frontend/app \
    /prod/frontend/public \
    /prod/frontend/server \
    /prod/frontend/shared \
    /prod/frontend/tests \
    /prod/frontend/.env \
    /prod/frontend/.env.* \
    /prod/frontend/.nuxt \
    /prod/frontend/Dockerfile \
    /prod/frontend/README.md \
    /prod/frontend/eslint.config.mjs \
    /prod/frontend/vitest.config.ts \
    /prod/frontend/tsconfig.json

FROM node:24-bookworm-slim AS runner

ENV NODE_ENV=production
ENV NITRO_HOST=0.0.0.0
ENV NITRO_PORT=3000

WORKDIR /app

RUN apt-get update \
  && apt-get install -y --no-install-recommends ca-certificates openssl tini \
  && rm -rf /var/lib/apt/lists/*

COPY --from=build --chown=node:node /prod/frontend ./

USER node

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=10s --start-period=20s --retries=5 \
  CMD node -e "fetch('http://127.0.0.1:' + (process.env.NITRO_PORT || '3000') + '/health').then(r => process.exit(r.ok ? 0 : 1)).catch(() => process.exit(1))"

ENTRYPOINT ["tini", "--"]
CMD ["node", ".output/server/index.mjs"]
