import { ChatInput } from '@netko/ui/components/chat/chat-input'
import { NewChatView } from '@netko/ui/components/chat/new-chat-view'
import { AnimatedBackground } from '@netko/ui/components/core/animated-background'
import { SidebarTrigger } from '@netko/ui/components/shadcn/sidebar'
import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { ThemeToggle } from '@/components/core/theme/theme-switcher'
import { trpcHttp } from '@/lib/trpc'
import { useAuth } from '@/providers/auth-provider'

export const Route = createFileRoute({
  component: Index,
})

function Index() {
  const { user } = useAuth()
  const { data: llmModels, isLoading: _isLoadingLLMModels } = useQuery(
    trpcHttp.threads.getLLMModels.queryOptions(),
  )
  const [chatInputValue, setChatInputValue] = useState('')

  return (
    <>
      <AnimatedBackground />
      <header className="flex h-16 shrink-0 items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <SidebarTrigger className="-ml-1" />
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
        </div>
      </header>
      <div className="relative flex flex-col w-full h-full min-h-0 mx-auto max-w-4xl p-4 pb-32">
        <NewChatView
          userName={user?.name ?? ''}
          suggestions={[
            "Explain quantum computing like I'm 5 years old 🧠",
            'Write a Python script to analyze CSV data',
            'Help me brainstorm ideas for a weekend project',
            'Create a workout plan for someone who works from home',
          ]}
          append={() => {}}
        />
        <div className="pointer-events-none absolute left-0 right-0 bottom-0 flex justify-center w-full z-20 p-4">
          <div className="pointer-events-auto w-full max-w-4xl mx-auto">
            <ChatInput
              value={chatInputValue}
              onChange={(e) => setChatInputValue(e.target.value)}
              onSend={() => {}}
              isGenerating={false}
              llmModels={llmModels ?? []}
              handleLLMModelChange={() => {}}
              isWebSearchEnabled={false}
              onWebSearchToggle={() => {}}
            />
          </div>
        </div>
      </div>
    </>
  )
}
