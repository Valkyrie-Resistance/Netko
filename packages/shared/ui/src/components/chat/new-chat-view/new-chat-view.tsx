import { ChatGreeting } from './chat-greeting'
import { PromptSuggestions } from './prompt-suggestions'
import { ChatViewProps } from './definitions/types'

export function NewChatView({ userName, suggestions, append }: ChatViewProps) {
  return (
    <div className="flex flex-col h-full pt-16 pb-8 overflow-hidden relative">
      {/* Greeting Section */}
      <ChatGreeting userName={userName} />

      {/* Spacer to push suggestions to bottom */}
      <div className="flex-1" />

      {/* Suggestions Section */}
      <PromptSuggestions suggestions={suggestions} append={append} />
    </div>
  )
} 