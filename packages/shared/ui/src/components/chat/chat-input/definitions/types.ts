import type { LLMModel } from '@netko/brain-domain'
import type * as React from 'react'

export interface ChatInputProps {
  value: string
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void
  onSend: () => void
  isGenerating?: boolean
  submitOnEnter?: boolean
  containerClassName?: string
  textareaProps?: React.TextareaHTMLAttributes<HTMLTextAreaElement>
  llmModels?: LLMModel[]
  selectedModel?: string
  handleLLMModelChange?: (model: LLMModel) => void
  isWebSearchEnabled?: boolean
  onWebSearchToggle?: (enabled: boolean) => void
  onFilesSelected?: (files: FileList) => void
}

export interface AttachmentsButtonProps {
  onFilesSelected: (files: FileList) => void
  disabled?: boolean
  className?: string
}

export interface LLMModelSelectorProps {
  models: LLMModel[]
  selectedModel: LLMModel | null
  onChange: (model: LLMModel) => void
  className?: string
}

export interface SendButtonProps {
  onClick: () => void
  disabled?: boolean
  className?: string
}

export interface WebSearchToggleProps {
  enabled: boolean
  onToggle: (enabled: boolean) => void
  className?: string
} 