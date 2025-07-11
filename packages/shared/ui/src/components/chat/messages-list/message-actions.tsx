import { motion } from 'framer-motion'
import { Smile } from 'lucide-react'
import { cn } from '@netko/ui/lib/utils'
import * as React from 'react'
import { CopyButton } from './copy-button'
import { RetryButton } from './retry-button'
import { BranchButton } from './branch-button'
import { EditButton } from './edit-button'
import { EmojiPicker } from './emoji-picker'
import type { MessageActionsProps } from './definitions/types'

export function MessageActions({
  message,
  onRetry,
  onBranch,
  onCopy,
  onEmojiReact,
  onEdit,
  reactions = [],
  className
}: MessageActionsProps) {
  const [showEmojiPicker, setShowEmojiPicker] = React.useState(false)
  const [isHovered, setIsHovered] = React.useState(false)
  const isUser = message.role === 'user'
  const isAssistant = message.role === 'assistant'

  const handleEmojiSelect = (emoji: string) => {
    onEmojiReact?.(message.id, emoji)
  }

  // Full date and time format
  const formatDateTime = (date: Date) => {
    return date.toLocaleString([], {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const timestampElement = (
    <span className="text-xs text-muted-foreground">
      {formatDateTime(message.timestamp)}
    </span>
  )

  return (
    <motion.div
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: isHovered ? 1 : 0.8, y: 0 }}
      transition={{ duration: 0.2 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={cn(
        'flex items-center gap-2 relative bg-background/80 backdrop-blur-sm rounded-lg px-2 py-1 shadow-sm border border-border/50',
        className
      )}
    >
      {/* For user messages: timestamp first, then buttons */}
      {isUser && timestampElement}

      {/* Emoji reactions display */}
      {reactions.length > 0 && (
        <div className="flex items-center gap-1">
          {reactions.map((reaction, index) => (
            <motion.button
              key={`${reaction.emoji}-${index}`}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => handleEmojiSelect(reaction.emoji)}
              className={cn(
                'flex items-center gap-1 px-2 py-1 rounded-full text-xs',
                'border border-border hover:bg-primary/10 transition-colors',
                reaction.userReacted && 'bg-primary/20 border-primary/50'
              )}
            >
              <span>{reaction.emoji}</span>
              {reaction.count > 1 && (
                <span className="text-xs text-muted-foreground">
                  {reaction.count}
                </span>
              )}
            </motion.button>
          ))}
        </div>
      )}

      {/* Action buttons */}
      <div className="flex items-center gap-1">
        {/* Copy button */}
        <CopyButton
          content={message.content}
          onCopy={onCopy}
        />

        {/* Emoji picker trigger */}
        <motion.div className="relative">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className="h-8 w-8 p-0 rounded-full hover:bg-primary/10 transition-colors flex items-center justify-center"
          >
            <Smile className="h-4 w-4" />
            <span className="sr-only">Add reaction</span>
          </motion.button>
          
          <EmojiPicker
            isOpen={showEmojiPicker}
            onClose={() => setShowEmojiPicker(false)}
            onEmojiSelect={handleEmojiSelect}
          />
        </motion.div>

        {/* Edit button - only for user messages */}
        {isUser && onEdit && (
          <EditButton
            onEdit={() => onEdit(message.id)}
          />
        )}

        {/* Retry button - only for assistant messages */}
        {isAssistant && onRetry && (
          <RetryButton
            onRetry={() => onRetry(message.id)}
          />
        )}

        {/* Branch button - only for assistant messages */}
        {isAssistant && onBranch && (
          <BranchButton
            onBranch={() => onBranch(message.id)}
          />
        )}
      </div>

      {/* For assistant and system messages: timestamp after buttons */}
      {(isAssistant || message.role === 'system') && timestampElement}
    </motion.div>
  )
} 