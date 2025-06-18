import { createRootRouteWithContext, Outlet } from '@tanstack/react-router'
import type { AuthRouterContext } from '@/components/auth/definitions/types'
import { ThemeProvider } from '@/components/core/theme/theme-provider'

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
