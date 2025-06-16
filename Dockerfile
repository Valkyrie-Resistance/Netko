FROM oven/bun:slim

WORKDIR /app

COPY . .

RUN bun install turbo --global
RUN bun install --frozen-lockfile

RUN turbo build

CMD ["bun", "run", "--filter", "./apps/brain", "prod:release"]
