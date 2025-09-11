import type { Assistant, LLMModel } from '@netko/brain-domain'
import { ChatInput } from '@netko/ui/components/chat/chat-input'
import { MessagesList } from '@netko/ui/components/chat/messages-list'
import type { UIMessage } from '@netko/ui/components/chat/messages-list/definitions/types'
import { NewChatView } from '@netko/ui/components/chat/new-chat-view'
import { AnimatedBackground } from '@netko/ui/components/core/animated-background'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { useSubscription } from '@trpc/tanstack-react-query'
import { useCallback, useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
import { BarsSpinner } from '@/components/core/spinner/bars-spinner'
import { trpcHttp, trpcWs } from '@/lib/trpc'
import { useAuth } from '@/providers/auth-provider'
import type { ChatViewProps } from './definitions/types'

export function ChatView({ threadId, thread }: ChatViewProps) {
  const { user } = useAuth()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // State management
  const [chatInputValue, setChatInputValue] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [selectedModelId, setSelectedModelId] = useState<string>('')
  const [selectedAssistant, setSelectedAssistant] = useState<Assistant | null>(null)
  const [isWebSearchEnabled, setIsWebSearchEnabled] = useState(false)
  const [lastEventId, setLastEventId] = useState<string | null>(null)

  // Message state for real-time updates
  const [realtimeMessages, setRealtimeMessages] = useState<UIMessage[]>([])
  const [streamingMessageId, setStreamingMessageId] = useState<string | null>(null)

  // Real-time subscription using TRPC with useSubscription hook
  useSubscription({
    ...trpcWs.threads.onThreadMessage.subscriptionOptions({
      threadId: threadId ?? '',
      lastEventId: lastEventId || undefined,
    }),
    enabled: !!threadId,
    onData: (event) => {
      type ThreadEventBase = {
        type:
          | 'message_created'
          | 'message_streaming'
          | 'message_completed'
          | 'message_error'
          | string
        timestamp?: number | string
      }
      type ThreadEvent =
        | (ThreadEventBase & {
            messageId?: string
            content?: string
            message?: UIMessage | ({ createdAt?: string | number | Date } & Record<string, unknown>)
          })
        | { type: string; parseError: unknown }

      try {
        const data = event.data as ThreadEvent
        switch (data.type) {
          case 'message_created': {
            // Add new message to realtime state
            if ('message' in data && data.message) {
              const newMessage: UIMessage = {
                ...(data.message as UIMessage),
                createdAt: new Date(
                  (data.message as { createdAt?: string | number | Date })?.createdAt ?? Date.now(),
                ),
                isGenerating: false,
              }

              setRealtimeMessages((prev) => {
                // Check if message already exists to avoid duplicates
                const exists = prev.find((m) => m.id === newMessage.id)
                if (exists) return prev
                return [...prev, newMessage]
              })

              // If it's an assistant message, mark as streaming
              if (newMessage.role === 'ASSISTANT') {
                setStreamingMessageId(newMessage.id)
                setIsGenerating(true)
              }
            }
            break
          }

          case 'message_streaming': {
            // Update streaming message content
            if ('messageId' in data && data.messageId && 'content' in data) {
              setRealtimeMessages((prev) =>
                prev.map((msg) =>
                  msg.id === data.messageId
                    ? { ...msg, content: (data as { content?: string }).content || '' }
                    : msg,
                ),
              )
            }
            break
          }

          case 'message_completed': {
            // Update final message and stop generation
            if ('message' in data && data.message) {
              const completedMessage: UIMessage = {
                ...(data.message as UIMessage),
                createdAt: new Date(
                  (data.message as { createdAt?: string | number | Date })?.createdAt ?? Date.now(),
                ),
                isGenerating: false,
              }

              setRealtimeMessages((prev) =>
                prev.map((msg) => (msg.id === completedMessage.id ? completedMessage : msg)),
              )
            }

            setStreamingMessageId(null)
            setIsGenerating(false)
            break
          }

          default:
        }

        // Update last event ID for reconnection
        if ('timestamp' in data && data.timestamp) {
          setLastEventId(String(data.timestamp))
        }
      } catch (error) {
        console.error('❌ Error processing subscription event:', error)
      }
    },
    onError: (error) => {
      console.error('❌ Error processing subscription event:', error)
      toast.error('Connection lost - attempting to reconnect... 🔄')
    },
  })

  // Messages come from thread prop and are updated via subscription

  const { data: llmModels = [] } = useQuery(trpcHttp.threads.getLLMModels.queryOptions())
  const { data: assistants = [] } = useQuery(trpcHttp.threads.getAssistants.queryOptions())

  // Initialize realtime messages from thread messages
  useEffect(() => {
    const messagesToProcess = thread?.messages || []

    if (Array.isArray(messagesToProcess) && messagesToProcess.length > 0) {
      const initialMessages: UIMessage[] = messagesToProcess.map((msg) => ({
        ...msg,
        createdAt: new Date(msg.createdAt as unknown as string),
        isGenerating: false,
      }))
      setRealtimeMessages(initialMessages)
    }
  }, [thread?.messages])

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (realtimeMessages.length > 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [realtimeMessages.length])

  // Mutations
  const createThreadMutation = useMutation(
    trpcHttp.threads.createThread.mutationOptions({
      onSuccess: (data: { thread: { id: string } }) => {
        navigate({
          to: '/chat/$threadId',
          params: { threadId: data.thread.id },
          replace: true,
        })
        // Invalidate sidebar threads to show the new thread
        queryClient.invalidateQueries({ queryKey: [['threads', 'getSidebarThreads']] })
        setIsGenerating(false)
      },
      onError: () => {
        toast.error('Failed to start conversation 😿')
        setIsGenerating(false)
      },
    }),
  )

  const sendMessageMutation = useMutation(
    trpcHttp.threads.sendMessage.mutationOptions({
      onSuccess: () => {
        // Real-time subscription handles updates automatically
      },
      onError: () => {
        toast.error('Failed to send message 😿')
        setIsGenerating(false)
      },
    }),
  )

  // Initialize selected model and assistant - optimize by using thread data
  useEffect(() => {
    if (llmModels.length > 0 && !selectedModelId) {
      // Use first available model as default
      const defaultModelId = llmModels[0]?.id || ''
      setSelectedModelId(defaultModelId)
    }
  }, [llmModels, selectedModelId])

  useEffect(() => {
    if (assistants.length > 0 && !selectedAssistant) {
      // Use thread's assistant if available, otherwise use first public assistant
      const threadAssistant = thread?.assistant
      const defaultAssistant =
        threadAssistant || assistants.find((a) => a.isPublic) || assistants[0]
      setSelectedAssistant(defaultAssistant || null)
    }
  }, [assistants, selectedAssistant, thread?.assistant])

  // Handle message submission
  const handleSendMessage = useCallback(
    (message: string) => {
      if (!message.trim() || isGenerating) return

      if (!threadId) {
        // Create new thread with this message
        setIsGenerating(true)
        createThreadMutation.mutate({
          title: message.slice(0, 50),
          description: message,
          assistantId: selectedAssistant?.id || '',
          content: message,
          llmModel: selectedModelId,
          isWebSearchEnabled,
        })
      } else {
        // Send message to existing thread
        setIsGenerating(true)
        sendMessageMutation.mutate({
          threadId,
          content: message,
          assistantId: selectedAssistant?.id || '',
          llmModel: selectedModelId,
          isWebSearchEnabled,
        })
      }

      setChatInputValue('')
    },
    [
      threadId,
      isGenerating,
      selectedAssistant,
      selectedModelId,
      isWebSearchEnabled,
      createThreadMutation,
      sendMessageMutation,
    ],
  )

  // Handle LLM model change
  const handleLLMModelChange = useCallback((model: LLMModel) => {
    setSelectedModelId(model.id)
  }, [])

  // Handle file attachments (placeholder for now)
  const handleFilesSelected = useCallback((files: FileList) => {
    toast.info(`Selected ${files.length} file(s) - attachments coming soon! 📎`)
  }, [])

  // Handle web search toggle
  const handleWebSearchToggle = useCallback((enabled: boolean) => {
    setIsWebSearchEnabled(enabled)
  }, [])

  // Handle suggestion clicks for new chat
  const handleSuggestionClick = useCallback((message: { role: 'user'; content: string }) => {
    setChatInputValue(message.content)
  }, [])

  // Update messages with generation state
  const displayMessages = realtimeMessages.map((msg) => ({
    ...msg,
    isGenerating: isGenerating && msg.id === streamingMessageId,
  }))

  // Loading states
  if (llmModels.length === 0 || assistants.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <BarsSpinner size={48} />
      </div>
    )
  }

  // Show new chat view if no thread is selected
  if (!threadId) {
    return (
      <>
        <div className="relative flex flex-col w-full h-full min-h-0">
          <AnimatedBackground />
          <div className="relative flex flex-col w-full h-full min-h-0 mx-auto max-w-4xl p-4 pb-32">
            <NewChatView
              userName={user?.name || 'there'}
              suggestions={[
                "Explain quantum computing like I'm 5 years old 🧠",
                'Write a Python script to analyze CSV data',
                'Help me brainstorm ideas for a weekend project',
                'Create a workout plan for someone who works from home',
              ]}
              append={handleSuggestionClick}
            />
          </div>
          <div className="pointer-events-none absolute left-0 right-0 bottom-0 flex justify-center w-full z-20 p-4 pb-[calc(env(safe-area-inset-bottom)+1rem)]">
            <div className="pointer-events-auto w-full max-w-4xl mx-auto">
              <ChatInput
                value={chatInputValue}
                onChange={(e) => setChatInputValue(e.target.value)}
                onSend={() => handleSendMessage(chatInputValue)}
                isGenerating={isGenerating}
                llmModels={llmModels}
                selectedModel={selectedModelId}
                handleLLMModelChange={handleLLMModelChange}
                isWebSearchEnabled={isWebSearchEnabled}
                onWebSearchToggle={handleWebSearchToggle}
                onFilesSelected={handleFilesSelected}
              />
            </div>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <div className="relative flex flex-col w-full h-full min-h-0 p-4 pb-32">
        <MessagesList messages={displayMessages} userAvatar={user?.image || ''} />
        <div ref={messagesEndRef} />
      </div>
      <div className="pointer-events-none absolute left-0 right-0 bottom-0 flex justify-center w-full z-20 p-4 pb-[calc(env(safe-area-inset-bottom)+1rem)]">
        <div className="pointer-events-auto w-full max-w-4xl mx-auto">
          <ChatInput
            value={chatInputValue}
            onChange={(e) => setChatInputValue(e.target.value)}
            onSend={() => handleSendMessage(chatInputValue)}
            isGenerating={isGenerating}
            llmModels={llmModels}
            selectedModel={selectedModelId}
            handleLLMModelChange={handleLLMModelChange}
            isWebSearchEnabled={isWebSearchEnabled}
            onWebSearchToggle={handleWebSearchToggle}
            onFilesSelected={handleFilesSelected}
          />
        </div>
      </div>
    </>
  )
}
