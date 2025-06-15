import { authGuard } from '@/lib/auth'

export const Route = createFileRoute({
  beforeLoad: authGuard,
  component: Index,
})

function Index() {
  return (
    <div className="p-2">
      <h3>Welcome Home!</h3>
    </div>
  )
}
