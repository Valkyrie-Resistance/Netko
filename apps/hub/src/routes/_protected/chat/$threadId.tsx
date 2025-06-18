import { ThemeToggle } from '@/components/core/theme/theme-switcher'
import { useAuth } from '@/providers/auth-provider'
import { Chat } from '@chad-chat/ui/components/chat/chat'
import type { Message } from '@chad-chat/ui/components/chat/definitions/types'
import { SidebarTrigger } from '@chad-chat/ui/components/shadcn/sidebar'
import { useState } from 'react'

export const Route = createFileRoute({
  component: RouteComponent,
})

function RouteComponent() {
  const { user } = useAuth()

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
        createdAt: new Date(),
      },
    ])
    console.log('handleSubmit', event, options)
  }

  const handleInputChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(event.target.value)
  }
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
      <div className="flex flex-col w-full h-full min-h-0 p-4">
        <Chat
          userName={user?.name ?? ''}
          className="flex-1 w-full max-w-4xl mx-auto min-h-0"
          messages={messages}
          handleSubmit={handleSubmit}
          input={input}
          handleInputChange={handleInputChange}
          isGenerating={true}
          stop={stop}
          append={append}
          setMessages={setMessages}
          suggestions={[]}
        />
      </div>
    </>
  )
}
