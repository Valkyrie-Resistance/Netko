FROM oven/bun:slim

WORKDIR /app

# openssl and ca-certificates
RUN apt-get update
RUN apt-get install -y openssl ca-certificates

COPY . .

RUN bun install turbo --global
RUN bun install --frozen-lockfile

RUN turbo db:generate
RUN turbo build --filter=./apps/claw

CMD ["bun", "run", "--filter", "./apps/claw", "prod:release"]
