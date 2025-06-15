export interface AuthUser {
  id: string
  name: string
  emailVerified: boolean
  email: string
  createdAt: Date
  updatedAt: Date
  image?: string | null
}

export interface AuthSession {
  id: string
  token: string
  userId: string
  expiresAt: Date
  createdAt: Date
  updatedAt: Date
  ipAddress?: string | null
  userAgent?: string | null
}

export interface AuthContextValue {
  user: AuthUser | null
  session: AuthSession | null
  refetch: () => void
  error: unknown
  isPending: boolean
}

export interface AuthRouterContext {
  auth: AuthContextValue
}
