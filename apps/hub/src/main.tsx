import '@chad-chat/ui/styles/globals.css'
import { AuthProvider, useAuth } from '@/components/auth/auth-provider'
import { RouterProvider, createRouter } from '@tanstack/react-router'
import { StrictMode } from 'react'
import reactDom from 'react-dom/client'
import { routeTree } from './routeTree.gen'

// Create a new router instance
const router = createRouter({
  routeTree,
  context: { auth: { user: null, session: null, refetch: () => {}, error: null } },
})

// Register the router instance for type safety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

function AppWithRouterContext() {
  const auth = useAuth()
  return <RouterProvider router={router} context={{ auth }} />
}

const root = document.getElementById('root')
if (!root) throw new Error('Root element not found')

reactDom.createRoot(root).render(
  <StrictMode>
    <AuthProvider>
      <AppWithRouterContext />
    </AuthProvider>
  </StrictMode>,
)
