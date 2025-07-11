import type * as React from 'react'

export interface Message {
  id: string
  content: string
  role: 'user' | 'assistant' | 'system'
  timestamp: Date
  isGenerating?: boolean
  reasoning?: string
  codeBlocks?: CodeBlock[]
  branches?: Message[]
  parentId?: string
  metadata?: MessageMetadata
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
  message: Message
  onRetry?: (messageId: string) => void
  onBranch?: (messageId: string) => void
  onCopy?: (content: string) => void
  onEmojiReact?: (messageId: string, emoji: string) => void
  onEdit?: (messageId: string) => void
  reactions?: EmojiReaction[]
  className?: string
}

export interface MessageBubbleProps {
  message: Message
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
  messages: Message[]
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