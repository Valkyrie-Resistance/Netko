import { useSession } from '@/lib/auth-client'
import React, { createContext, useContext } from 'react'
import type { AuthContextValue } from './definitions/types'

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { data, refetch, error } = useSession()

  const user = data?.user ?? null
  const session = data?.session ?? null

  const auth = React.useMemo(
    () => ({ user, session, refetch, error }),
    [user, session, refetch, error],
  )

  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider')
  return ctx
}
