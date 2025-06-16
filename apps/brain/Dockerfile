FROM oven/bun:alpine

WORKDIR /app

COPY . .

RUN bun install turbo --global

RUN bun install --frozen-lockfile

RUN turbo db:generate

RUN turbo build --filter @chad-chat/brain

CMD ["bun", "run", "--filter", "./apps/brain", "prod:release"]
