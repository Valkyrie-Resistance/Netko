import { ChatMessage } from '@netko/ui/components/chat/chat-message.js'
import type { MessageListProps } from '@netko/ui/components/chat/definitions/types'
import { TypingIndicator } from '@netko/ui/components/chat/typing-indicator.js'

export function MessageList({
  messages,
  showTimeStamps = true,
  isTyping = false,
  messageOptions,
}: MessageListProps) {
  return (
    <div className="space-y-4 overflow-visible">
      {messages.map((message, index) => {
        const additionalOptions =
          typeof messageOptions === 'function' ? messageOptions(message) : messageOptions

        return (
          <ChatMessage
            key={index}
            showTimeStamp={showTimeStamps}
            {...message}
            {...additionalOptions}
          />
        )
      })}
      {isTyping && <TypingIndicator />}
    </div>
  )
}
