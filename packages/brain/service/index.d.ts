// define bun env types
declare namespace NodeJS {
  interface ProcessEnv {
    PORT: string
    CORS: string
    DATABASE_URL: string
    BASE_URL: string
    AUTH_SECRET: string
  }
}
