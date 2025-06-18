import { CopyButton } from '@chad-chat/ui/components/chat/copy-button.js'
import type {
  ChatFormProps,
  ChatProps,
  Message,
} from '@chad-chat/ui/components/chat/definitions/types'
import { MessageInput } from '@chad-chat/ui/components/chat/message-input.js'
import { MessageList } from '@chad-chat/ui/components/chat/message-list.js'
import { PromptSuggestions } from '@chad-chat/ui/components/chat/prompt-suggestions.js'
import { Button } from '@chad-chat/ui/components/shadcn/button'
import { useAutoScroll } from '@chad-chat/ui/hooks/use-auto-scroll'
import { cn } from '@chad-chat/ui/lib/utils'
import { ArrowDown, ThumbsDown, ThumbsUp } from 'lucide-react'
import { forwardRef, useCallback, useRef, useState } from 'react'

export function Chat({
  userName,
  messages,
  handleSubmit,
  input,
  handleInputChange,
  stop,
  isGenerating,
  append,
  suggestions,
  className,
  onRateResponse,
  setMessages,
}: ChatProps) {
  const lastMessage = messages.at(-1)
  const isEmpty = messages.length === 0
  const isTyping = lastMessage?.role === 'user'

  const messagesRef = useRef(messages)
  messagesRef.current = messages

  // Enhanced stop function that marks pending tool calls as cancelled
  const handleStop = useCallback(() => {
    stop?.()

    if (!setMessages) return

    const latestMessages = [...messagesRef.current]
    const lastAssistantMessage = latestMessages.findLast(
      (m: { role: string }) => m.role === 'assistant',
    )

    if (!lastAssistantMessage) return

    let needsUpdate = false
    let updatedMessage = { ...lastAssistantMessage }

    if (lastAssistantMessage.toolInvocations) {
      const updatedToolInvocations = lastAssistantMessage.toolInvocations.map(
        (toolInvocation: any) => {
          if (toolInvocation.state === 'call') {
            needsUpdate = true
            return {
              ...toolInvocation,
              state: 'result',
              result: {
                content: 'Tool execution was cancelled',
                __cancelled: true, // Special marker to indicate cancellation
              },
            } as const
          }
          return toolInvocation
        },
      )

      if (needsUpdate) {
        updatedMessage = {
          ...updatedMessage,
          toolInvocations: updatedToolInvocations,
        }
      }
    }

    if (lastAssistantMessage.parts && lastAssistantMessage.parts.length > 0) {
      const updatedParts = lastAssistantMessage.parts.map((part: any) => {
        if (
          part.type === 'tool-invocation' &&
          part.toolInvocation &&
          part.toolInvocation.state === 'call'
        ) {
          needsUpdate = true
          return {
            ...part,
            toolInvocation: {
              ...part.toolInvocation,
              state: 'result',
              result: {
                content: 'Tool execution was cancelled',
                __cancelled: true,
              },
            },
          }
        }
        return part
      })

      if (needsUpdate) {
        updatedMessage = {
          ...updatedMessage,
          parts: updatedParts,
        }
      }
    }

    if (needsUpdate) {
      const messageIndex = latestMessages.findIndex((m) => m.id === lastAssistantMessage.id)
      if (messageIndex !== -1) {
        latestMessages[messageIndex] = updatedMessage
        setMessages(latestMessages)
      }
    }
  }, [stop, setMessages, messagesRef])

  const messageOptions = useCallback(
    (message: Message) => ({
      actions: onRateResponse ? (
        <>
          <div className="border-r pr-1">
            <CopyButton content={message.content} copyMessage="Copied response to clipboard!" />
          </div>
          <Button
            size="icon"
            variant="ghost"
            className="h-6 w-6"
            onClick={() => onRateResponse(message.id, 'thumbs-up')}
          >
            <ThumbsUp className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="h-6 w-6"
            onClick={() => onRateResponse(message.id, 'thumbs-down')}
          >
            <ThumbsDown className="h-4 w-4" />
          </Button>
        </>
      ) : (
        <CopyButton content={message.content} copyMessage="Copied response to clipboard!" />
      ),
    }),
    [onRateResponse],
  )

  return (
    <ChatContainer className={className}>
      {messages.length > 0 ? (
        <ChatMessages messages={messages}>
          <MessageList messages={messages} isTyping={isTyping} messageOptions={messageOptions} />
        </ChatMessages>
      ) : null}

      {isEmpty && append && suggestions ? (
        <div className="flex-1 flex items-center justify-center">
          <PromptSuggestions userName={userName} append={append} suggestions={suggestions} />
        </div>
      ) : null}

      <div className="flex-shrink-0">
        <ChatForm isPending={isGenerating || isTyping} handleSubmit={handleSubmit}>
          {({ files, setFiles }) => (
            <MessageInput
              value={input}
              onChange={handleInputChange}
              allowAttachments
              files={files}
              setFiles={setFiles}
              stop={handleStop}
              isGenerating={isGenerating}
            />
          )}
        </ChatForm>
      </div>
    </ChatContainer>
  )
}
Chat.displayName = 'Chat'

export function ChatMessages({
  messages,
  children,
}: React.PropsWithChildren<{
  messages: Message[]
}>) {
  const { containerRef, scrollToBottom, handleScroll, shouldAutoScroll, handleTouchStart } =
    useAutoScroll([messages])

  return (
    <div
      className="flex-1 overflow-y-auto pb-4 min-h-0"
      ref={containerRef}
      onScroll={handleScroll}
      onTouchStart={handleTouchStart}
    >
      <div className="relative">
        {children}

        {!shouldAutoScroll && (
          <div className="absolute bottom-0 right-0 flex justify-end">
            <Button
              onClick={scrollToBottom}
              className="h-8 w-8 rounded-full ease-in-out animate-in fade-in-0 slide-in-from-bottom-1"
              size="icon"
              variant="ghost"
            >
              <ArrowDown className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

export const ChatContainer = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    return <div ref={ref} className={cn('flex flex-col h-full w-full', className)} {...props} />
  },
)
ChatContainer.displayName = 'ChatContainer'

export const ChatForm = forwardRef<HTMLFormElement, ChatFormProps>(
  ({ children, handleSubmit, isPending, className }, ref) => {
    const [files, setFiles] = useState<File[] | null>(null)

    const onSubmit = (event: React.FormEvent) => {
      if (!files) {
        handleSubmit(event)
        return
      }

      const fileList = createFileList(files)
      handleSubmit(event, { experimental_attachments: fileList })
      setFiles(null)
    }

    return (
      <form ref={ref} onSubmit={onSubmit} className={className}>
        {children({ files, setFiles })}
      </form>
    )
  },
)
ChatForm.displayName = 'ChatForm'

function createFileList(files: File[] | FileList): FileList {
  const dataTransfer = new DataTransfer()
  for (const file of Array.from(files)) {
    dataTransfer.items.add(file)
  }
  return dataTransfer.files
}
