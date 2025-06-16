import { AppSidebar } from '@/components/core/nav/app-sidebar'
import { Chat } from '@chad-chat/ui/components/chat/chat'
import type { Message } from '@chad-chat/ui/components/chat/chat-message'
import { SidebarInset, SidebarProvider } from '@chad-chat/ui/components/shadcn/sidebar'
import { useState } from 'react'

export const Route = createFileRoute({
  component: Index,
})

function Index() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [stop, setStop] = useState<() => void>(() => {})
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  const [append, setAppend] = useState<any>({})
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  const [transcribeAudio, setTranscribeAudio] = useState<any>({})

  const handleSubmit = (
    event?: { preventDefault?: () => void },
    // biome-ignore lint/style/useNamingConvention: <explanation>
    options?: { experimental_attachments?: FileList },
  ) => {
    console.log('handleSubmit', event, options)
  }

  const handleInputChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(event.target.value)
  }

  return (
    <div className="flex h-screen w-screen items-center justify-center">
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <div className="flex flex-col w-full h-full p-4 justify-center items-center">
            <Chat
              className="grow w-full max-w-4xl"
              messages={messages}
              handleSubmit={handleSubmit}
              input={input}
              handleInputChange={handleInputChange}
              isGenerating={isLoading}
              stop={stop}
              append={append}
              setMessages={setMessages}
              transcribeAudio={transcribeAudio}
              suggestions={[
                'What is the weather in San Francisco?',
                'Explain step-by-step how to solve this math problem: If x² + 6x + 9 = 25, what is x?',
                'Design a simple algorithm to find the longest palindrome in a string.',
              ]}
            />
          </div>
        </SidebarInset>
      </SidebarProvider>
    </div>
  )
}
