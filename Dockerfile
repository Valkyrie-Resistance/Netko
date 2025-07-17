FROM oven/bun:slim

ARG VITE_SENTRY_DSN

WORKDIR /app

# openssl
RUN apt-get update
RUN apt-get install -y openssl

COPY . .

RUN bun install turbo --global
RUN bun install --frozen-lockfile

RUN turbo db:generate
RUN turbo build

CMD ["bun", "run", "--filter", "./apps/brain", "prod:release"]
