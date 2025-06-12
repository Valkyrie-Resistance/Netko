import { ThemeProvider } from '@/components/core/theme/theme-provider'
import { authClient } from '@/lib/auth-client'
import { Navigate, Outlet, createRootRoute } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'

const rootLayout = () => {
  const { data: session, isPending } = authClient.useSession()

  if (isPending) {
    return <div>Loading...</div>
  }

  if (!session) {
    return <Navigate to="/about" />
  }

  return (
    <>
      <ThemeProvider>
        <Outlet />
        <TanStackRouterDevtools />
      </ThemeProvider>
    </>
  )
}

export const Route = createRootRoute({
  component: rootLayout,
})
