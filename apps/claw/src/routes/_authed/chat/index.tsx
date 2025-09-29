import { createFileRoute } from '@tanstack/react-router'
import { ChatView } from '@/components/chat/chat-view'

export const Route = createFileRoute('/_authed/chat/')({
  component: Index,
})

function Index() {
  return <ChatView />
}
