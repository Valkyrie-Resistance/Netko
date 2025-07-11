import { AnimatedBackground } from '@netko/ui/components/core/animated-background'
import { Navigate } from '@tanstack/react-router'
import { LoginForm } from '@/components/auth/login-form'
import { useAuth } from '@/providers/auth-provider'

export const Route = createFileRoute({
  component: Index,
})

function Index() {
  const { session, isPending } = useAuth()

  if (!isPending && session) {
    return <Navigate to="/chat" />
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <LoginForm />
      <AnimatedBackground />
    </div>
  )
}
