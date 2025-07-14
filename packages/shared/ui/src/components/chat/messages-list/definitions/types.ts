import type * as React from 'react'
import type { Message } from '@netko/brain-domain'

// Use DomainMessage with minimal UI extensions
export interface UIMessage extends Message {
  // UI-specific properties
  isGenerating?: boolean
  reasoning?: string
}

export interface CodeBlock {
  id: string
  language: string
  code: string
  filename?: string
}

export interface MessageMetadata {
  model?: string
  tokensUsed?: number
  responseTime?: number
  temperature?: number
}

export interface EmojiReaction {
  emoji: string
  count: number
  userReacted: boolean
}

export interface MessageActionsProps {
  message: UIMessage
  onRetry?: (messageId: string) => void
  onBranch?: (messageId: string) => void
  onCopy?: (content: string) => void
  onEmojiReact?: (messageId: string, emoji: string) => void
  onEdit?: (messageId: string) => void
  reactions?: EmojiReaction[]
  className?: string
}

export interface MessageBubbleProps {
  message: UIMessage
  isLast?: boolean
  onRetry?: (messageId: string) => void
  onBranch?: (messageId: string) => void
  onCopy?: (content: string) => void
  onEmojiReact?: (messageId: string, emoji: string) => void
  onEdit?: (messageId: string) => void
  reactions?: Record<string, EmojiReaction[]>
  className?: string
  userAvatar?: string
  defaultUserAvatar?: string
}

export interface CodeBlockProps {
  block: CodeBlock
  className?: string
}

export interface ReasoningBlockProps {
  reasoning: string
  isExpanded?: boolean
  onToggle?: () => void
  className?: string
}

export interface MessagesListProps {
  messages: UIMessage[]
  isGenerating?: boolean
  onRetry?: (messageId: string) => void
  onBranch?: (messageId: string) => void
  onCopy?: (content: string) => void
  onEmojiReact?: (messageId: string, emoji: string) => void
  onEdit?: (messageId: string) => void
  reactions?: Record<string, EmojiReaction[]>
  className?: string
  containerRef?: React.RefObject<HTMLDivElement>
  userAvatar?: string
  defaultUserAvatar?: string
}

export interface EmojiPickerProps {
  onEmojiSelect: (emoji: string) => void
  isOpen: boolean
  onClose: () => void
  className?: string
}

export interface CopyButtonProps {
  content: string
  onCopy?: (content: string) => void
  className?: string
}

export interface RetryButtonProps {
  onRetry: () => void
  disabled?: boolean
  className?: string
}

export interface BranchButtonProps {
  onBranch: () => void
  disabled?: boolean
  className?: string
}

export interface EditButtonProps {
  onEdit: () => void
  disabled?: boolean
  className?: string
} 