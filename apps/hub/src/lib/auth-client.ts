import { createAuthClient } from 'better-auth/react'
export const authClient = createAuthClient({
  // biome-ignore lint/style/useNamingConvention: library naming conventions
  baseURL: import.meta.env.VITE_AUTH_API_URL,
})
