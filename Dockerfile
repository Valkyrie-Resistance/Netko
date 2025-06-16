FROM oven/bun:alpine

WORKDIR /app

COPY . .

RUN bun install turbo --global

RUN bun install --production

RUN turbo db:generate

RUN turbo build

CMD ["bun", "run", "--filter", "./apps/brain", "prod:release"]
