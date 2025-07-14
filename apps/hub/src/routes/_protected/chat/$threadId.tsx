import { useQuery } from '@tanstack/react-query'
import { Navigate } from '@tanstack/react-router'
import { ChatView } from '@/components/chat/chat-view'
import { trpcHttp } from '@/lib/trpc'

export const Route = createFileRoute({
  component: RouteComponent,
})

function RouteComponent() {
  const { threadId } = Route.useParams()
  const {
    data: thread,
    isLoading,
    isError,
  } = useQuery(trpcHttp.threads.getThread.queryOptions({ threadId }))

  if (isError || (!isLoading && !thread)) {
    return <Navigate to="/chat" replace />
  }

  return <ChatView threadId={threadId} thread={thread} />
}
