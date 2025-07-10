import type { LLMModel, Message } from '@netko/brain-domain'
import { PromptSuggestions } from '@netko/ui/components/chat/prompt-suggestions'
import { SidebarTrigger } from '@netko/ui/components/shadcn/sidebar'
import { useQuery } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { ThemeToggle } from '@/components/core/theme/theme-switcher'
import { trpcHttp } from '@/lib/trpc'
import { useAuth } from '@/providers/auth-provider'

export const Route = createFileRoute({
  component: RouteComponent,
})

function RouteComponent() {
  const { user } = useAuth()
  const { data: llmModels, isLoading: _isLoadingLLMModels } = useQuery(
    trpcHttp.threads.getLLMModels.queryOptions(),
  )
  const [currentLLMModel, setCurrentLLMModel] = useState<LLMModel | null>(null)
  const [isWebSearchEnabled, setIsWebSearchEnabled] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])

  return (
    <>
      <header className="flex h-16 shrink-0 items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <SidebarTrigger className="-ml-1" />
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
        </div>
      </header>
      <div className="flex flex-col w-full h-full min-h-0 mx-auto max-w-4xl p-4">
        {messages.length === 0 ? (
          <PromptSuggestions
            userName={user?.name ?? ''}
            append={() => {}}
            suggestions={[
              "Explain quantum computing like I'm 5 years old 🧠",
              'Write a Python script to analyze CSV data',
              'Help me brainstorm ideas for a weekend project',
              'Create a workout plan for someone who works from home',
            ]}
          />
        ) : (
          <div className="flex flex-col w-full h-full min-h-0 mx-auto max-w-4xl p-4">hi</div>
        )}
      </div>
    </>
  )
}
