import { AppSidebar } from '@/components/core/nav/app-sidebar'
import { SidebarInset, SidebarProvider } from '@chad-chat/ui/components/shadcn/sidebar'
import { Outlet } from '@tanstack/react-router'

export const Route = createFileRoute({
  component: Index,
})

function Index() {
  return (
    <div className="flex h-screen w-screen items-center justify-center">
      <SidebarProvider>
        <AppSidebar />
        <main>
          <SidebarInset>
            <div className="flex h-screen w-screen items-center justify-center">
              <Outlet />
            </div>
          </SidebarInset>
        </main>
      </SidebarProvider>
    </div>
  )
}
