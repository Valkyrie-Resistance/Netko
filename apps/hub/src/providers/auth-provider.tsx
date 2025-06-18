import React, { createContext, useContext } from 'react'
import type { AuthContextValue } from '@/components/auth/definitions/types'
import { useSession } from '@/lib/auth'

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { data, refetch, error, isPending } = useSession()

  const user = data?.user ?? null
  const session = data?.session ?? null

  const auth = React.useMemo(
    () => ({ user, session, refetch, error, isPending }),
    [user, session, refetch, error, isPending],
  )

  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider')
  return ctx
}
