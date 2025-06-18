import { Chat } from '@chad-chat/ui/components/chat/chat'
import type { Message } from '@chad-chat/ui/components/chat/definitions/types'
import { SidebarTrigger } from '@chad-chat/ui/components/shadcn/sidebar'
import { useState } from 'react'
import { ThemeToggle } from '@/components/core/theme/theme-switcher'
import { useAuth } from '@/providers/auth-provider'

export const Route = createFileRoute({
  component: RouteComponent,
})

function RouteComponent() {
  const { user } = useAuth()

  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [_isLoading, _setIsLoading] = useState(false)
  const [stop, _setStop] = useState<() => void>(() => {})
  // biome-ignore lint/suspicious/noExplicitAny: we need to use any here because the append object is not typed
  const [append, _setAppend] = useState<any>({})

  const handleSubmit = (
    event?: { preventDefault?: () => void },
    // biome-ignore lint/style/useNamingConvention: we need to use experimental_attachments here because it is a property of the options object
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
