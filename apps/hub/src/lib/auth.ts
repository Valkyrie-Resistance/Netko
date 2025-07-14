import { redirect } from '@tanstack/react-router'
import { createAuthClient } from 'better-auth/react'
import type { AuthRouterContext } from '@/components/auth/definitions/types'

export const authClient = createAuthClient({
  basePath: '/auth/api',
  fetchOptions: {
    onResponse(context) {
      const jwt = context.response.headers.get('set-auth-jwt')
      if (jwt) {
        localStorage.setItem('ws-auth-jwt', jwt)
      }
    },
  },
})

export const authGuard = ({ context }: { context: AuthRouterContext }) => {
  if (!context.auth.session) {
    throw redirect({ to: '/auth' })
  }
}
