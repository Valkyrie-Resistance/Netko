import type { AuthRouterContext } from '@/components/auth/definitions/types'
import { ThemeProvider } from '@/components/core/theme/theme-provider'
import { Outlet, createRootRouteWithContext } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'

const rootLayout = () => {
  return (
    <ThemeProvider>
      <Outlet />
      <TanStackRouterDevtools />
    </ThemeProvider>
  )
}

export const Route = createRootRouteWithContext<AuthRouterContext>()({
  component: rootLayout,
})
