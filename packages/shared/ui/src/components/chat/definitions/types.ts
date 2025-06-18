import type { VariantProps } from 'class-variance-authority'
import type React from 'react'
import type { ReactElement } from 'react'

// =============================================================================
// ANIMATION & UI STATE TYPES
// =============================================================================

export type Animation = 'none' | 'slide' | 'scale' | 'fade'

// =============================================================================
// CORE MESSAGE & ATTACHMENT TYPES
// =============================================================================

export interface Attachment {
  name?: string
  contentType?: string
  url: string
}

export interface Message {
  id: string
  role: 'user' | 'assistant' | (string & {})
  content: string
  createdAt?: Date
  experimental_attachments?: Attachment[]
  toolInvocations?: ToolInvocation[]
  parts?: MessagePart[]
}

// =============================================================================
// TOOL INVOCATION TYPES
// =============================================================================

export interface PartialToolCall {
  state: 'partial-call'
  toolName: string
}

export interface ToolCall {
  state: 'call'
  toolName: string
}

export interface ToolResult {
  state: 'result'
  toolName: string
  result: {
    __cancelled?: boolean
    [key: string]: any
  }
}

export type ToolInvocation = PartialToolCall | ToolCall | ToolResult

// =============================================================================
// MESSAGE PART TYPES
// =============================================================================

export interface ReasoningPart {
  type: 'reasoning'
  reasoning: string
}

export interface ToolInvocationPart {
  type: 'tool-invocation'
  toolInvocation: ToolInvocation
}

export interface TextPart {
  type: 'text'
  text: string
}

// For compatibility with AI SDK types, not used
export interface SourcePart {
  type: 'source'
}

export type MessagePart = TextPart | ReasoningPart | ToolInvocationPart | SourcePart

// =============================================================================
// CHAT COMPONENT PROPS
// =============================================================================

export interface ChatPropsBase {
  userName: string
  handleSubmit: (
    event?: { preventDefault?: () => void },
    options?: { experimental_attachments?: FileList },
  ) => void
  messages: Array<Message>
  input: string
  className?: string
  handleInputChange: React.ChangeEventHandler<HTMLTextAreaElement>
  isGenerating: boolean
  stop?: () => void
  onRateResponse?: (messageId: string, rating: 'thumbs-up' | 'thumbs-down') => void
  setMessages?: (messages: any[]) => void
}

export interface ChatPropsWithoutSuggestions extends ChatPropsBase {
  append?: never
  suggestions?: never
}

export interface ChatPropsWithSuggestions extends ChatPropsBase {
  append: (message: { role: 'user'; content: string }) => void
  suggestions: string[]
}

export type ChatProps = ChatPropsWithoutSuggestions | ChatPropsWithSuggestions

export interface ChatFormProps {
  className?: string
  isPending: boolean
  handleSubmit: (
    event?: { preventDefault?: () => void },
    options?: { experimental_attachments?: FileList },
  ) => void
  children: (props: {
    files: File[] | null
    setFiles: React.Dispatch<React.SetStateAction<File[] | null>>
  }) => ReactElement
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
  transcribeAudio?: (blob: Blob) => Promise<string>
  enableWebSearch?: boolean
  onWebSearchToggle?: (enabled: boolean) => void
  selectedModel?: string
  onModelChange?: (modelId: string) => void
}

export interface MessageInputWithoutAttachmentProps extends MessageInputBaseProps {
  allowAttachments?: false
}

export interface MessageInputWithAttachmentsProps extends MessageInputBaseProps {
  allowAttachments: true
  files: File[] | null
  setFiles: React.Dispatch<React.SetStateAction<File[] | null>>
}

export type MessageInputProps =
  | MessageInputWithoutAttachmentProps
  | MessageInputWithAttachmentsProps

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
