import type { AuthRouterContext } from '@/components/auth/definitions/types'
import { ThemeProvider } from '@/components/core/theme/theme-provider'
import { Outlet, createRootRouteWithContext } from '@tanstack/react-router'

const rootLayout = () => {
  return (
    <ThemeProvider>
      <Outlet />
    </ThemeProvider>
  )
}

export const Route = createRootRouteWithContext<AuthRouterContext>()({
  component: rootLayout,
})
