import { ChatMessage } from '@chad-chat/ui/components/chat/chat-message.js'
import type { MessageListProps } from '@chad-chat/ui/components/chat/definitions/types'
import { TypingIndicator } from '@chad-chat/ui/components/chat/typing-indicator.js'

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
