import { cn } from '@netko/ui/lib/utils'
import { motion, useReducedMotion } from 'framer-motion'
import * as React from 'react'
import { useAutosizeTextArea } from '@netko/ui/hooks/use-autosize-textarea'

import { LLMModelSelector } from './llm-model-selector'
import { SendButton } from './send-button'
import { Badge } from '@netko/ui/components/shadcn/badge'
import { Globe, Paperclip } from 'lucide-react'
import { useIsMobile } from '@netko/ui/hooks/use-mobile'
import type { ChatInputProps } from './definitions/types'

/**
 * ChatInput – sparkly, animated, transparent chat box ✨
 */
export const ChatInput = React.memo(React.forwardRef<HTMLTextAreaElement, ChatInputProps>(
  (
    {
      value,
      onChange,
      onSend,
      isGenerating = false,
      submitOnEnter = true,
      containerClassName,
      textareaProps,
      llmModels,
      selectedModel,
      handleLLMModelChange,
      isWebSearchEnabled = false,
      onWebSearchToggle,
      onFilesSelected,
    },
    _ref,
  ) => {
    const shouldReduceMotion = useReducedMotion()
    const internalRef = React.useRef<HTMLTextAreaElement>(null)
    const fileInputRef = React.useRef<HTMLInputElement>(null)
    const isMobile = useIsMobile()
    useAutosizeTextArea({
      ref: internalRef as React.RefObject<HTMLTextAreaElement>,
      // Limit the auto-growing textarea so the whole chat input doesn't push
      // past the bottom of the viewport. 200px ≈ ~10 lines on most UIs – tweak
      // if needed.
      maxHeight: 200,
      dependencies: [value],
    })

    // Combine forwarded ref & internal ref if needed
    React.useImperativeHandle(_ref, () => internalRef.current as HTMLTextAreaElement)

    const handleKeyDown: React.KeyboardEventHandler<HTMLTextAreaElement> = (e) => {
      textareaProps?.onKeyDown?.(e)
      if (
        e.key === 'Enter' &&
        !e.shiftKey &&
        submitOnEnter &&
        !isGenerating &&
        typeof onSend === 'function'
      ) {
        e.preventDefault()
        onSend()
      }
    }

    return (
      <motion.div
        initial={shouldReduceMotion ? false : { y: 30, opacity: 0 }}
        animate={shouldReduceMotion ? false : { y: 0, opacity: 1 }}
        transition={{ duration: shouldReduceMotion ? 0 : 0.25 }}
        style={{ willChange: 'transform, opacity' }}
        className={cn(
          'relative w-full overflow-hidden rounded-3xl border border-white/20 bg-white/30 dark:bg-zinc-900/40 backdrop-blur-xl flex-shrink-0',
          containerClassName,
        )}
      >

        {/* Textarea */}
        <div className="px-4 py-3">
          <textarea
            ref={internalRef}
            value={value}
            onChange={onChange}
            onKeyDown={handleKeyDown}
            placeholder="Type your message…"
            className="w-full resize-none bg-transparent text-sm leading-6 placeholder:text-muted-foreground outline-none"
            rows={1}
            spellCheck={false}
            autoFocus
            {...textareaProps}
          />
        </div>

        {/* Bottom bar */}
        <div className="flex items-center gap-3 px-4 py-2">
          {/* Model selector on the left */}
          <LLMModelSelector
            models={llmModels ?? []}
            selectedModel={
              selectedModel && llmModels
                ? llmModels.find((m) => m.id === selectedModel) ?? null
                : null
            }
            onChange={handleLLMModelChange ?? (() => {})}
          />

          {/* Badges next to model selector */}
          {isMobile ? (
            <>
              <button
                type="button"
                disabled={isGenerating}
                onClick={() => fileInputRef.current?.click()}
                className="ml-2 p-2 rounded-full hover:bg-primary/10 transition-colors"
              >
                <Paperclip className="size-5" />
              </button>
              <button
                type="button"
                onClick={() => onWebSearchToggle?.(!isWebSearchEnabled)}
                className={cn(
                  'ml-1 p-2 rounded-full transition-colors',
                  isWebSearchEnabled ? 'bg-primary text-primary-foreground' : 'hover:bg-primary/10'
                )}
              >
                <Globe className="size-5" />
              </button>
            </>
          ) : (
            <>
              <Badge
                variant={isWebSearchEnabled ? 'default' : 'outline'}
                className="cursor-pointer px-3 py-1 text-sm gap-1 font-normal ml-2"
                onClick={() => onWebSearchToggle?.(!isWebSearchEnabled)}
              >
                <Globe className="size-4" />
                <span className="font-normal">Search</span>
              </Badge>
              <Badge
                variant="outline"
                asChild
                className="cursor-pointer px-3 py-1 text-sm gap-1 font-normal"
              >
                <button
                  type="button"
                  disabled={isGenerating}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Paperclip className="size-4" />
                  <span className="font-normal">Attach</span>
                </button>
              </Badge>
            </>
          )}
          <input
            ref={fileInputRef}
            type="file"
            multiple
            className="hidden"
            onChange={(e) => {
              if (e.target.files) {
                onFilesSelected?.(e.target.files)
                e.target.value = ''
              }
            }}
          />

          {/* Spacer */}
          <div className="flex-1" />

          {/* Send */}
          <SendButton
            disabled={isGenerating || value.trim().length === 0}
            onClick={() => onSend?.()}
          />
        </div>
      </motion.div>
    )
  },
))
ChatInput.displayName = 'ChatInput'

export default ChatInput
