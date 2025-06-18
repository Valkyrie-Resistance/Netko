import { Navigate, Outlet } from '@tanstack/react-router'
import { BarsSpinner } from '@/components/core/spinner/bars-spinner'
import { useAuth } from '@/providers/auth-provider'

export const Route = createFileRoute({
  component: ProtectedRouteLayout,
})

function ProtectedRouteLayout() {
  const { session, isPending } = useAuth()

  if (isPending) {
    return (
      <div className="flex h-screen w-screen items-center justify-center">
        <BarsSpinner />
      </div>
    )
  }

  if (!session) {
    return <Navigate to="/auth" />
  }

  return <Outlet />
}
