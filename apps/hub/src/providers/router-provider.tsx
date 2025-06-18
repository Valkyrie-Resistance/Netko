import { createRouter, RouterProvider } from '@tanstack/react-router'
import { routeTree } from '../routeTree.gen.ts'
import { useAuth } from './auth-provider'

// Create a new router instance
const router = createRouter({
  routeTree,
  context: {
    auth: { user: null, session: null, refetch: () => {}, error: null, isPending: false },
  },
})

// Register the router instance for type safety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

export function RouterProviderWithContext() {
  const auth = useAuth()
  return <RouterProvider router={router} context={{ auth }} />
}
