import { ChatView } from '@/components/chat/chat-view'

export const Route = createFileRoute({
  component: Index,
})

function Index() {
  return <ChatView />
}
