import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@netko/ui/lib/utils'
import * as React from 'react'
import { MessageBubble } from './message-bubble'
import type { MessagesListProps } from './definitions/types'

export const MessagesList = React.forwardRef<HTMLDivElement, MessagesListProps>(({
  messages,
  isGenerating = false,
  onRetry,
  onBranch,
  onCopy,
  onEmojiReact,
  onEdit,
  reactions,
  className,
  containerRef,
  userAvatar,
  defaultUserAvatar
}, ref) => {
  const internalRef = React.useRef<HTMLDivElement>(null)
  const scrollRef = containerRef || internalRef
  const [autoScroll, setAutoScroll] = React.useState(true) // true when anchored to latest
  const [isUserScrolling, setIsUserScrolling] = React.useState(false)

  // Ensure initial render starts at latest (bottom in visual order)
  React.useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 0
    }
  }, [])

  // Auto-scroll to latest when new messages arrive
  React.useEffect(() => {
    if (autoScroll && scrollRef.current) {
      scrollRef.current.scrollTop = 0
    }
  }, [messages, autoScroll, scrollRef])

  // Handle scroll events to detect user scrolling
  React.useEffect(() => {
    const element = scrollRef.current
    if (!element) return

    let scrollTimeout: NodeJS.Timeout

    const handleScroll = () => {
      setIsUserScrolling(true)
      clearTimeout(scrollTimeout)
      
      scrollTimeout = setTimeout(() => {
        setIsUserScrolling(false)
        // In column-reverse, scrollTop near 0 means anchored to latest (bottom)
        const { scrollTop } = element
        const isAtLatest = scrollTop <= 10
        setAutoScroll(isAtLatest)
      }, 150)
    }

    element.addEventListener('scroll', handleScroll)
    return () => {
      element.removeEventListener('scroll', handleScroll)
      clearTimeout(scrollTimeout)
    }
  }, [scrollRef])

  // Combine forwarded ref with internal ref
  React.useImperativeHandle(ref, () => scrollRef.current as HTMLDivElement)

  const handleCopy = React.useCallback((content: string) => {
    onCopy?.(content)
  }, [onCopy])

  const handleRetry = React.useCallback((messageId: string) => {
    onRetry?.(messageId)
  }, [onRetry])

  const handleBranch = React.useCallback((messageId: string) => {
    onBranch?.(messageId)
  }, [onBranch])

  const handleEmojiReact = React.useCallback((messageId: string, emoji: string) => {
    onEmojiReact?.(messageId, emoji)
  }, [onEmojiReact])

  const handleEdit = React.useCallback((messageId: string) => {
    onEdit?.(messageId)
  }, [onEdit])

  return (
    <div
      ref={scrollRef}
      className={cn(
        'relative flex-1 overflow-y-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-track]:bg-gray-100 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-gray-300 dark:[&::-webkit-scrollbar-track]:bg-neutral-700 dark:[&::-webkit-scrollbar-thumb]:bg-neutral-500',
        'px-4 py-6 space-y-1',
        className
      )}
      style={{ transform: 'scaleY(-1)' }}
    >
      <div className="mx-auto max-w-4xl">
        <AnimatePresence mode="popLayout">
          {[...messages].reverse().map((message, index) => (
            <div key={message.id} style={{ transform: 'scaleY(-1)' }}>
              <MessageBubble
                message={message}
                isLast={index === 0}
                onRetry={handleRetry}
                onBranch={handleBranch}
                onCopy={handleCopy}
                onEmojiReact={handleEmojiReact}
                onEdit={handleEdit}
                reactions={reactions}
                userAvatar={userAvatar}
                defaultUserAvatar={defaultUserAvatar}
              />
            </div>
          ))}
        </AnimatePresence>

        {/* Scroll to latest indicator */}
        {!autoScroll && !isUserScrolling && (
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            onClick={() => {
              if (scrollRef.current) {
                scrollRef.current.scrollTop = 0
                setAutoScroll(true)
              }
            }}
            className="absolute bottom-4 left-1/2 -translate-x-1/2 backdrop-blur-md bg-white/20 dark:bg-black/20 border border-white/30 dark:border-white/10 rounded-full p-2 shadow-lg hover:bg-white/30 dark:hover:bg-black/30 transition-all duration-200"
            style={{ transform: 'scaleY(-1)' }}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
            <span className="sr-only">Scroll to latest</span>
          </motion.button>
        )}

        {/* Generating indicator near bottom */}
        {isGenerating && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="flex items-center justify-center py-4"
            style={{ transform: 'scaleY(-1)' }}
          >
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="flex gap-1">
                <motion.div
                  className="w-2 h-2 bg-primary rounded-full"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 0.8, repeat: Infinity, delay: 0 }}
                />
                <motion.div
                  className="w-2 h-2 bg-primary rounded-full"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 0.8, repeat: Infinity, delay: 0.2 }}
                />
                <motion.div
                  className="w-2 h-2 bg-primary rounded-full"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 0.8, repeat: Infinity, delay: 0.4 }}
                />
              </div>
              <span>AI is thinking...</span>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
})

MessagesList.displayName = 'MessagesList'
