import { Toaster } from '@netko/ui/components/shadcn/sonner'
import { createRootRouteWithContext, Outlet } from '@tanstack/react-router'
import type { AuthRouterContext } from '@/components/auth/definitions/types'
import { ThemeProvider } from '@/components/core/theme/theme-provider'

const rootLayout = () => {
  return (
    <ThemeProvider>
      <Outlet />
      <Toaster />
    </ThemeProvider>
  )
}

export const Route = createRootRouteWithContext<AuthRouterContext>()({
  component: rootLayout,
})
