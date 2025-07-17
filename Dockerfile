FROM oven/bun:slim

ARG SENTRY_ORG
ARG SENTRY_PROJECT
ARG SENTRY_AUTH_TOKEN

WORKDIR /app

# openssl
RUN apt-get update
RUN apt-get install -y openssl

COPY . .

RUN bun install turbo --global
RUN bun install --frozen-lockfile

RUN turbo db:generate
RUN turbo build

# Upload Sentry sourcemaps if SENTRY_DSN is set
RUN sh -c 'if [ ! -z "$SENTRY_AUTH_TOKEN" ]; then cd apps/brain && bun run sentry:sourcemaps; fi'

RUN mv apps/hub/dist/* apps/brain/public/

CMD ["bun", "run", "--filter", "./apps/brain", "prod:release"]
