import type {
  FileUploadOverlayProps,
  MessageInputProps,
} from '@chad-chat/ui/components/chat/definitions/types'
import { FilePreview } from '@chad-chat/ui/components/chat/file-preview.js'
import { InterruptPrompt } from '@chad-chat/ui/components/chat/interrupt-prompt.js'
import { Button } from '@chad-chat/ui/components/shadcn/button'
import { Popover, PopoverContent, PopoverTrigger } from '@chad-chat/ui/components/shadcn/popover'
import { useAutosizeTextArea } from '@chad-chat/ui/hooks/use-autosize-textarea'
import { usePrefersReducedMotion } from '@chad-chat/ui/hooks/use-prefers-reduced-motion'
import { cn } from '@chad-chat/ui/lib/utils'
import { AnimatePresence, motion } from 'framer-motion'
import {
  ArrowUp,
  ChevronDown,
  Info,
  Loader2,
  Mic,
  Paperclip,
  Search,
  Sparkles,
  Square,
  X,
} from 'lucide-react'
import type React from 'react'
import { useEffect, useRef, useState } from 'react'
import { omit } from 'remeda'

const modelOptions = [
  { id: 'gpt-4', name: 'GPT-4', icon: '✨' },
  { id: 'gpt-3.5-turbo', name: 'GPT-3.5', icon: '🚀' },
  { id: 'claude-3', name: 'Claude 3', icon: '🧠' },
]

export function MessageInput({
  placeholder = 'Ask AI...',
  className,
  onKeyDown: onKeyDownProp,
  submitOnEnter = true,
  stop,
  isGenerating,
  enableInterrupt = true,
  transcribeAudio,
  enableWebSearch = false,
  onWebSearchToggle,
  selectedModel = 'gpt-4',
  onModelChange,
  ...props
}: MessageInputProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [showInterruptPrompt, setShowInterruptPrompt] = useState(false)
  const [isWebSearchEnabled, setIsWebSearchEnabled] = useState(enableWebSearch)
  const [selectedModelId, setSelectedModelId] = useState(selectedModel)
  const [isModelSelectorOpen, setIsModelSelectorOpen] = useState(false)
  const [animateModelIcon, setAnimateModelIcon] = useState(true)
  const prefersReducedMotion = usePrefersReducedMotion()

  useEffect(() => {
    if (!isGenerating) {
      setShowInterruptPrompt(false)
    }
  }, [isGenerating])

  // Stop the model icon animation after 6 seconds to reduce distraction
  useEffect(() => {
    const timeout = setTimeout(() => setAnimateModelIcon(false), 6000)
    return () => clearTimeout(timeout)
  }, [])

  const addFiles = (files: File[] | null) => {
    if (props.allowAttachments) {
      props.setFiles((currentFiles) => {
        if (currentFiles === null) {
          return files
        }

        if (files === null) {
          return currentFiles
        }

        return [...currentFiles, ...files]
      })
    }
  }

  const onDragOver = (event: React.DragEvent) => {
    if (props.allowAttachments !== true) return
    event.preventDefault()
    setIsDragging(true)
  }

  const onDragLeave = (event: React.DragEvent) => {
    if (props.allowAttachments !== true) return
    event.preventDefault()
    setIsDragging(false)
  }

  const onDrop = (event: React.DragEvent) => {
    setIsDragging(false)
    if (props.allowAttachments !== true) return
    event.preventDefault()
    const dataTransfer = event.dataTransfer
    if (dataTransfer.files.length) {
      addFiles(Array.from(dataTransfer.files))
    }
  }

  const onPaste = (event: React.ClipboardEvent) => {
    const items = event.clipboardData?.items
    if (!items) return

    const text = event.clipboardData.getData('text')
    if (text && text.length > 500 && props.allowAttachments) {
      event.preventDefault()
      const blob = new Blob([text], { type: 'text/plain' })
      const file = new File([blob], 'Pasted text', {
        type: 'text/plain',
        lastModified: Date.now(),
      })
      addFiles([file])
      return
    }

    const files = Array.from(items)
      .map((item) => item.getAsFile())
      .filter((file) => file !== null)

    if (props.allowAttachments && files.length > 0) {
      addFiles(files)
    }
  }

  const onKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (submitOnEnter && event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()

      if (isGenerating && stop && enableInterrupt) {
        if (showInterruptPrompt) {
          stop()
          setShowInterruptPrompt(false)
          event.currentTarget.form?.requestSubmit()
        } else if (props.value || (props.allowAttachments && props.files?.length)) {
          setShowInterruptPrompt(true)
          return
        }
      }

      event.currentTarget.form?.requestSubmit()
    }

    onKeyDownProp?.(event)
  }

  const textAreaRef = useRef<HTMLTextAreaElement | null>(null)
  const [textAreaHeight, setTextAreaHeight] = useState<number>(0)

  useEffect(() => {
    if (textAreaRef.current) {
      setTextAreaHeight(textAreaRef.current.offsetHeight)
    }
  }, [props.value])

  const showFileList = props.allowAttachments && props.files && props.files.length > 0

  useAutosizeTextArea({
    ref: textAreaRef as React.RefObject<HTMLTextAreaElement>,
    maxHeight: 240,
    borderWidth: 1,
    dependencies: [props.value, showFileList],
  })

  const handleWebSearchToggle = () => {
    setIsWebSearchEnabled(!isWebSearchEnabled)
    onWebSearchToggle?.(!isWebSearchEnabled)
  }

  const handleModelChange = (modelId: string) => {
    setSelectedModelId(modelId)
    onModelChange?.(modelId)
  }

  return (
    <div
      className="relative flex w-full flex-col gap-2"
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
    >
      {enableInterrupt && (
        <InterruptPrompt isOpen={showInterruptPrompt} close={() => setShowInterruptPrompt(false)} />
      )}

      <div className="relative flex w-full items-end space-x-2">
        <motion.div
          className="relative flex-1"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div className="relative">
            <div
              className={cn(
                'absolute inset-0 rounded-xl opacity-50',
                'bg-gradient-to-br from-primary/20 via-transparent to-primary/20',
                'dark:from-primary/10 dark:via-transparent dark:to-primary/10',
                'before:absolute before:inset-0 before:rounded-xl before:bg-gradient-to-tr before:from-blue-500/20 before:via-transparent before:to-purple-500/20 before:opacity-50',
                'dark:before:from-blue-500/10 dark:before:to-purple-500/10',
                'after:absolute after:inset-0 after:rounded-xl after:bg-gradient-to-bl after:from-rose-500/20 after:via-transparent after:to-amber-500/20 after:opacity-30',
                'dark:after:from-rose-500/10 dark:after:to-amber-500/10',
              )}
            />

            <div className="absolute left-0 right-0 top-0 z-10 flex items-center gap-2 px-3 py-2">
              <Popover onOpenChange={setIsModelSelectorOpen}>
                <PopoverTrigger asChild>
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button
                      variant="ghost"
                      size="sm"
                      className={cn(
                        'gap-1.5 text-xs font-medium relative overflow-hidden',
                        'bg-muted/90 hover:bg-muted',
                        'dark:bg-muted/40 dark:hover:bg-muted/60',
                        'backdrop-blur-sm transition-all duration-200',
                        'border border-border/10 dark:border-border/10',
                        'after:absolute after:inset-0 after:rounded-md',
                        'after:bg-gradient-to-r after:from-primary/0 after:via-primary/10 after:to-primary/0',
                        'after:translate-x-[-100%] hover:after:translate-x-[100%]',
                        'after:transition-transform after:duration-500',
                        'text-foreground/90 dark:text-foreground/80',
                      )}
                    >
                      <motion.div
                        initial={{ rotate: 0 }}
                        animate={
                          prefersReducedMotion || !animateModelIcon
                            ? { rotate: 0 }
                            : { rotate: [0, 15, -15, 0] }
                        }
                        transition={
                          prefersReducedMotion || !animateModelIcon
                            ? { duration: 0 }
                            : {
                                duration: 1.5,
                                repeat: Number.POSITIVE_INFINITY,
                                repeatType: 'reverse',
                                ease: 'easeInOut',
                              }
                        }
                      >
                        <Sparkles className="h-3 w-3 text-primary" />
                      </motion.div>
                      {modelOptions.find((m) => m.id === selectedModelId)?.name || 'Select Model'}
                      <motion.div
                        initial={false}
                        animate={{
                          rotate: isModelSelectorOpen ? 180 : 0,
                          scale: isModelSelectorOpen ? 1.1 : 1,
                        }}
                        transition={{
                          duration: 0.2,
                          ease: 'easeInOut',
                        }}
                      >
                        <ChevronDown className="h-3 w-3 text-foreground/70" />
                      </motion.div>
                    </Button>
                  </motion.div>
                </PopoverTrigger>
                <PopoverContent className="w-48 p-1" onOpenAutoFocus={(e) => e.preventDefault()}>
                  <div className="space-y-1">
                    {modelOptions.map((model) => (
                      <motion.button
                        key={model.id}
                        whileHover={{ scale: 1.02, x: 2 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {
                          handleModelChange(model.id)
                          setIsModelSelectorOpen(false)
                        }}
                        className={cn(
                          'flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-all duration-200',
                          selectedModelId === model.id
                            ? 'bg-primary/15 text-primary dark:bg-primary/25 dark:text-primary font-medium'
                            : 'hover:bg-muted dark:hover:bg-muted/50 text-foreground/90',
                        )}
                      >
                        <motion.span
                          initial={{ scale: 1 }}
                          animate={{ scale: selectedModelId === model.id ? [1, 1.2, 1] : 1 }}
                          transition={{ duration: 0.3 }}
                        >
                          {model.icon}
                        </motion.span>
                        {model.name}
                      </motion.button>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>

              <div className="h-4 w-px bg-border/50 dark:bg-border/30" />

              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    'gap-1.5 text-xs font-medium relative overflow-hidden',
                    'bg-muted/90 hover:bg-muted',
                    'dark:bg-muted/40 dark:hover:bg-muted/60',
                    'backdrop-blur-sm transition-all duration-200',
                    'border border-border/10 dark:border-border/10',
                    'after:absolute after:inset-0 after:rounded-md',
                    'after:bg-gradient-to-r after:from-primary/0 after:via-primary/10 after:to-primary/0',
                    'after:translate-x-[-100%] hover:after:translate-x-[100%]',
                    'after:transition-transform after:duration-500',
                    'text-foreground/90 dark:text-foreground/80',
                    isWebSearchEnabled &&
                      'text-primary dark:text-primary bg-primary/10 dark:bg-primary/20 border-primary/20',
                  )}
                  onClick={handleWebSearchToggle}
                >
                  <motion.div
                    animate={
                      prefersReducedMotion
                        ? {}
                        : isWebSearchEnabled
                          ? { rotate: [0, 360], scale: [1, 1.2, 1] }
                          : {}
                    }
                    transition={
                      prefersReducedMotion
                        ? { duration: 0 }
                        : {
                            duration: 0.5,
                            ease: 'easeInOut',
                          }
                    }
                    whileHover={
                      prefersReducedMotion
                        ? undefined
                        : {
                            rotate: [-10, 10],
                            transition: {
                              duration: 0.3,
                              repeat: Number.POSITIVE_INFINITY,
                              repeatType: 'reverse',
                            },
                          }
                    }
                  >
                    <Search
                      className={cn(
                        'h-3 w-3',
                        isWebSearchEnabled ? 'text-primary' : 'text-foreground/70',
                      )}
                    />
                  </motion.div>
                  Web
                </Button>
              </motion.div>
            </div>

            <textarea
              aria-label="Write your prompt here"
              placeholder={placeholder}
              ref={textAreaRef}
              onPaste={onPaste}
              onKeyDown={onKeyDown}
              className={cn(
                'w-full resize-none rounded-xl pt-12 pb-3 pl-3 pr-24 text-sm',
                'border border-border/10',
                'bg-background/30 dark:bg-background/20',
                'backdrop-blur-xl',
                'placeholder:text-muted-foreground/50',
                'focus:border-primary/30 focus:bg-background/40 dark:focus:bg-background/30',
                'focus:outline-none focus:ring-2 focus:ring-primary/20',
                'disabled:cursor-not-allowed disabled:opacity-50',
                showFileList && 'pb-16',
                className,
              )}
              style={{
                WebkitBackdropFilter: 'blur(16px)',
                backdropFilter: 'blur(16px)',
              }}
              {...(props.allowAttachments
                ? omit(props, ['allowAttachments', 'files', 'setFiles'])
                : omit(props, ['allowAttachments']))}
            />

            <div className="absolute right-3 bottom-3 z-20 flex gap-2">
              {props.allowAttachments && (
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    className={cn(
                      'h-8 w-8 rounded-lg relative overflow-hidden',
                      'bg-background/60 hover:bg-background/90',
                      'dark:bg-muted/40 dark:hover:bg-muted/60',
                      'backdrop-blur-sm transition-all duration-200',
                      'after:absolute after:inset-0',
                      'after:bg-gradient-to-r after:from-primary/0 after:via-primary/10 after:to-primary/0',
                      'after:translate-x-[-100%] hover:after:translate-x-[100%]',
                      'after:transition-transform after:duration-500',
                    )}
                    aria-label="Attach a file"
                    onClick={async () => {
                      const files = await showFileUploadDialog()
                      addFiles(files)
                    }}
                  >
                    <Paperclip className="h-4 w-4 text-foreground/70" />
                  </Button>
                </motion.div>
              )}

              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                {isGenerating && stop ? (
                  <Button
                    type="button"
                    size="icon"
                    className={cn(
                      'h-8 w-8 rounded-lg relative overflow-hidden',
                      'bg-primary/30 hover:bg-primary/40',
                      'dark:bg-primary/40 dark:hover:bg-primary/50',
                      'backdrop-blur-sm transition-all duration-200',
                      'border border-primary/20 dark:border-primary/30',
                      'after:absolute after:inset-0',
                      'after:bg-gradient-to-r after:from-white/0 after:via-white/10 after:to-white/0',
                      'after:translate-x-[-100%] hover:after:translate-x-[100%]',
                      'after:transition-transform after:duration-500',
                    )}
                    aria-label="Stop generating"
                    onClick={stop}
                  >
                    <Square className="h-3 w-3 animate-pulse" fill="currentColor" />
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    size="icon"
                    className={cn(
                      'h-8 w-8 rounded-lg relative overflow-hidden group',
                      'bg-primary hover:bg-primary/90',
                      'dark:bg-primary dark:hover:bg-primary/90',
                      'backdrop-blur-sm transition-all duration-200',
                      'disabled:opacity-50 disabled:cursor-not-allowed',
                      'disabled:hover:bg-primary disabled:dark:hover:bg-primary',
                      'after:absolute after:inset-0',
                      'after:bg-gradient-to-r after:from-white/0 after:via-white/20 after:to-white/0',
                      'after:translate-x-[-100%] group-hover:after:translate-x-[100%]',
                      'after:transition-transform after:duration-500',
                    )}
                    aria-label="Send message"
                    disabled={props.value === '' || isGenerating}
                  >
                    <motion.div
                      initial={false}
                      animate={props.value ? { scale: [1, 1.2, 1] } : {}}
                      transition={{ duration: 0.2 }}
                    >
                      <ArrowUp className="h-5 w-5 text-background dark:text-background" />
                    </motion.div>
                  </Button>
                )}
              </motion.div>
            </div>

            {props.allowAttachments && (
              <div className="absolute inset-x-3 bottom-0 z-20 overflow-x-scroll py-3">
                <div className="flex space-x-3">
                  <AnimatePresence mode="popLayout">
                    {props.files?.map((file) => (
                      <motion.div
                        key={file.name + String(file.lastModified)}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ duration: 0.2 }}
                      >
                        <FilePreview
                          file={file}
                          onRemove={() => {
                            props.setFiles((files) => {
                              if (!files) return null
                              const filtered = Array.from(files).filter((f) => f !== file)
                              if (filtered.length === 0) return null
                              return filtered
                            })
                          }}
                        />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {props.allowAttachments && <FileUploadOverlay isDragging={isDragging} />}
    </div>
  )
}
MessageInput.displayName = 'MessageInput'

function FileUploadOverlay({ isDragging }: FileUploadOverlayProps) {
  return (
    <AnimatePresence>
      {isDragging && (
        <motion.div
          className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center space-x-2 rounded-xl border border-dashed border-border bg-background text-sm text-muted-foreground"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          aria-hidden
        >
          <Paperclip className="h-4 w-4" />
          <span>Drop your files here to attach them.</span>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function showFileUploadDialog() {
  const input = document.createElement('input')

  input.type = 'file'
  input.multiple = true
  input.accept = '*/*'
  input.click()

  return new Promise<File[] | null>((resolve) => {
    input.onchange = (e) => {
      const files = (e.currentTarget as HTMLInputElement).files

      if (files) {
        resolve(Array.from(files))
        return
      }

      resolve(null)
    }
  })
}
