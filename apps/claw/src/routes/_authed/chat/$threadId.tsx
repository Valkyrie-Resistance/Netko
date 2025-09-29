import { useQuery } from '@tanstack/react-query'
import { createFileRoute, Navigate } from '@tanstack/react-router'
import { ChatView } from '@/components/chat/chat-view'
import { useTRPC } from '@/integrations/trpc/react'

export const Route = createFileRoute('/_authed/chat/$threadId')({
  component: RouteComponent,
})

function RouteComponent() {
  const { threadId } = Route.useParams()
  const trpcHttp = useTRPC()
  const {
    data: thread,
    isLoading,
    isError,
  } = useQuery(trpcHttp.threads.getThread.queryOptions({ threadId: threadId as string }))

  if (isError || (!isLoading && !thread)) {
    return <Navigate to="/chat" replace />
  }

  return <ChatView threadId={threadId} thread={thread} />
}
