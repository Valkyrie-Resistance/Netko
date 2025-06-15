import { trpc } from '@/lib/trpc'
import { useQuery } from '@tanstack/react-query'

export const Route = createFileRoute({
  component: Index,
})

function Index() {
  const threadsQuery = useQuery(trpc.threads.getThreads.queryOptions())
  console.log(threadsQuery.data)

  return (
    <div className="p-2">
      <h1>Hello</h1>
    </div>
  )
}
