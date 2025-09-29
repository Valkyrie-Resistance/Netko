import { SidebarInset, SidebarProvider, SidebarTrigger } from '@netko/ui/components/shadcn/sidebar'
import { createFileRoute, Outlet } from '@tanstack/react-router'
import { AppSidebar } from '@/components/core/nav/app-sidebar'
import { ThemeToggle } from '@/components/core/theme/theme-switcher'

export const Route = createFileRoute('/_authed/chat')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div className="relative flex h-[100dvh] w-screen">
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset className="flex flex-1">
          <div className="flex items-center justify-between border-b px-3 py-2 pt-[env(safe-area-inset-top)] sticky top-0 z-10 bg-background">
            <SidebarTrigger />
            <ThemeToggle />
          </div>
          <Outlet />
        </SidebarInset>
      </SidebarProvider>
    </div>
  )
}
