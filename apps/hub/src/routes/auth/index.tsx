import { LoginForm } from '@/components/auth/login-form'
import { useAuth } from '@/providers/auth-provider'
import { Navigate } from '@tanstack/react-router'

export const Route = createFileRoute({
  component: Index,
})

function Index() {
  const { session, isPending } = useAuth()

  if (!isPending && session) {
    return <Navigate to="/chat" />
  }

  return (
    <div className="p-2">
      <LoginForm />
    </div>
  )
}
