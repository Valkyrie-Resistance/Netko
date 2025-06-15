// define bun env types
declare namespace NodeJS {
  interface ProcessEnv {
    PORT: string
    CORS: string
    DATABASE_URL: string
    BETTER_AUTH_URL: string
    BETTER_AUTH_SECRET: string
  }
}
