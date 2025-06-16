import type { AuthRouterContext } from '@/components/auth/definitions/types'
import { redirect } from '@tanstack/react-router'
import { createAuthClient } from 'better-auth/react'

export const { useSession, signIn, signOut } = createAuthClient({
  basePath: '/auth/api',
})

export const authGuard = ({ context }: { context: AuthRouterContext }) => {
  if (!context.auth.session) {
    throw redirect({ to: '/auth' })
  }
}
