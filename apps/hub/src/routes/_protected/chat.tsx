import { AppSidebar } from '@/components/core/nav/app-sidebar'
import { SidebarInset, SidebarProvider } from '@chad-chat/ui/components/shadcn/sidebar'
import { Outlet } from '@tanstack/react-router'

export const Route = createFileRoute({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div className="relative flex h-screen w-screen">
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset className="flex flex-1">
          <Outlet />
        </SidebarInset>
      </SidebarProvider>
    </div>
  )
}
