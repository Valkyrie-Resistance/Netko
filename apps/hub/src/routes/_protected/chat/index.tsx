import { AppSidebar } from '@/components/core/nav/app-sidebar'
import { ThemeToggle } from '@/components/core/theme/theme-switcher'
import { trpcWs } from '@/lib/trpc'
import { useAuth } from '@/providers/auth-provider'
import { Chat } from '@chad-chat/ui/components/chat/chat'
import type { Message } from '@chad-chat/ui/components/chat/definitions/types'
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@chad-chat/ui/components/shadcn/sidebar'
import { useSubscription } from '@trpc/tanstack-react-query'
import { useState } from 'react'

export const Route = createFileRoute({
  component: Index,
})

function Index() {
  const { user } = useAuth()
  const sub = useSubscription(
    trpcWs.threads.onThreadUpdate.subscriptionOptions(
      {
        threadId: '1',
      },
      {
        onData: (data) => {
          console.log('new thread update', data)
        },
      },
    ),
  )

  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [stop, setStop] = useState<() => void>(() => {})
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  const [append, setAppend] = useState<any>({})

  const handleSubmit = (
    event?: { preventDefault?: () => void },
    // biome-ignore lint/style/useNamingConvention: <explanation>
    options?: { experimental_attachments?: FileList },
  ) => {
    event?.preventDefault?.()
    setMessages([
      ...messages,
      {
        id: '1',
        content: input,
        role: 'user',
      },
    ])
    console.log('handleSubmit', event, options)
  }

  const handleInputChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(event.target.value)
  }

  return (
    <div className="flex h-screen w-screen">
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset className="flex flex-1">
          <header className="flex h-16 shrink-0 items-center justify-between px-4">
            <div className="flex items-center gap-2">
              <SidebarTrigger className="-ml-1" />
            </div>
            <div className="flex items-center gap-2">
              <ThemeToggle />
            </div>
          </header>

          <div className="flex flex-col w-full h-full min-h-0 p-4">
            <Chat
              userName={user?.name ?? ''}
              className="flex-1 w-full max-w-4xl mx-auto min-h-0"
              messages={messages}
              handleSubmit={handleSubmit}
              input={input}
              handleInputChange={handleInputChange}
              isGenerating={isLoading}
              stop={stop}
              append={append}
              setMessages={setMessages}
              suggestions={[
                "Explain quantum computing like I'm 5 years old 🧠",
                'Write a Python script to analyze CSV data',
                'Help me brainstorm ideas for a weekend project',
                'Create a workout plan for someone who works from home',
                'What are the pros and cons of TypeScript vs JavaScript?',
                'Write a haiku about debugging code at 3 AM',
                'Explain the latest trends in web development',
                'Help me draft a professional email to a client',
                'Create a recipe using only ingredients I have at home',
                "What's the difference between REST and GraphQL?",
                'Generate creative names for my new startup',
                'Explain blockchain technology in simple terms',
                'Help me optimize this SQL query for better performance',
                'Write a short story about a cat who learns to code',
                'What are some good practices for React component design?',
              ]}
            />
          </div>
        </SidebarInset>
      </SidebarProvider>
    </div>
  )
}
