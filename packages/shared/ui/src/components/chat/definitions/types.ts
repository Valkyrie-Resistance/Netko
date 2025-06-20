import type { VariantProps } from 'class-variance-authority'
import type React from 'react'
import type { LLMModel, Message } from '@netko/brain-domain'

// =============================================================================
// ANIMATION & UI STATE TYPES
// =============================================================================

export type Animation = 'none' | 'slide' | 'scale' | 'fade'

// =============================================================================
// MESSAGE PART TYPES
// =============================================================================

export interface ReasoningPart {
  type: 'reasoning'
  reasoning: string
}

export interface TextPart {
  type: 'text'
  text: string
}

export interface SourcePart {
  type: 'source'
}

export type MessagePart = TextPart | ReasoningPart  | SourcePart


export type MessageOptionsProps = {
  actions: React.ReactNode
}

// =============================================================================
// MESSAGE COMPONENT PROPS
// =============================================================================

export interface ChatMessageProps extends Message {
  showTimeStamp?: boolean
  animation?: Animation
  actions?: React.ReactNode
}

export type AdditionalMessageOptions = Omit<ChatMessageProps, keyof Message>

export interface MessageListProps {
  messages: Message[]
  showTimeStamps?: boolean
  isTyping?: boolean
  messageOptions?: AdditionalMessageOptions | ((message: Message) => AdditionalMessageOptions)
}

// =============================================================================
// INPUT COMPONENT PROPS
// =============================================================================

export interface MessageInputBaseProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  value: string
  submitOnEnter?: boolean
  stop?: () => void
  isGenerating: boolean
  enableInterrupt?: boolean
  selectedModel?: string
  onModelChange?: (modelId: string) => void
  llmModels: LLMModel[]
  handleLLMModelChange: (llmModel: LLMModel) => void
  isWebSearchEnabled: boolean
  onWebSearchToggle: (enabled: boolean) => void
}

export interface MessageInputWithoutAttachmentProps extends MessageInputBaseProps {
  allowAttachments?: false
}

export interface MessageInputWithAttachmentsProps extends MessageInputBaseProps {
  allowAttachments: true
  files: File[] | null
  setFiles: React.Dispatch<React.SetStateAction<File[] | null>>
}

export type MessageInputProps = MessageInputBaseProps

// =============================================================================
// UI UTILITY COMPONENT PROPS
// =============================================================================

export type CopyButtonProps = {
  content: string
  copyMessage?: string
}

export interface FilePreviewProps {
  file: File
  onRemove?: () => void
}

export interface FileUploadOverlayProps {
  isDragging: boolean
}

export interface InterruptPromptProps {
  isOpen: boolean
  close: () => void
}

export interface PromptSuggestionsProps {
  userName: string
  append: (message: { role: 'user'; content: string }) => void
  suggestions: string[]
}

// =============================================================================
// AUDIO/RECORDING COMPONENT PROPS
// =============================================================================

export interface RecordingPromptProps {
  isVisible: boolean
  onStopRecording: () => void
}

export interface RecordingControlsProps {
  isRecording: boolean
  isTranscribing: boolean
  audioStream: MediaStream | null
  textAreaHeight: number
  onStopRecording: () => void
}

// =============================================================================
// MARKDOWN COMPONENT PROPS
// =============================================================================

export interface MarkdownRendererProps {
  children: string
}

export interface HighlightedPre extends React.HTMLAttributes<HTMLPreElement> {
  children: string
  language: string
}

export interface CodeBlockProps extends React.HTMLAttributes<HTMLPreElement> {
  children: React.ReactNode
  className?: string
  language: string
}
