import { motion } from 'framer-motion'
import { User, Bot, AlertCircle } from 'lucide-react'
import { cn } from '@netko/ui/lib/utils'
import * as React from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@netko/ui/components/shadcn/avatar'
import { ReasoningBlock } from './reasoning-block'
import { MessageActions } from './message-actions'
import type { MessageBubbleProps } from './definitions/types'
import { MessageRoleEnum } from '@netko/brain-domain'
import { MarkdownContent } from './markdown-content'

export const MessageBubble = ({
  message,
  isLast = false,
  onRetry,
  onBranch,
  onCopy,
  onEmojiReact,
  onEdit,
  reactions,
  className,
  userAvatar,
}: MessageBubbleProps) => {
  const [isHovered, setIsHovered] = React.useState(false)
  const messageReactions = reactions?.[message.id] || []
    const actualUserAvatar = userAvatar || ''
 
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={cn(
        'group relative mb-6 flex gap-4',
        message.role === MessageRoleEnum.USER && 'flex-row-reverse ml-auto max-w-[85%]', // User messages on the right
        message.role === MessageRoleEnum.ASSISTANT && 'flex-row mr-auto max-w-[85%]', // Assistant messages on the left
        message.role === MessageRoleEnum.SYSTEM && 'flex-row mr-auto max-w-[85%]', // System messages on the left
        isLast && 'mb-0',
        className
      )}
    >
      {/* Avatar */}
      <div className="flex-shrink-0">
        <Avatar className={cn(
          'h-8 w-8 border-2 flex items-center justify-center',
          message.role === MessageRoleEnum.USER && 'border-blue-500/50 bg-blue-500/10',
          message.role === MessageRoleEnum.ASSISTANT && 'border-primary/50 bg-primary/10',
          message.role === MessageRoleEnum.SYSTEM && 'border-orange-500/50 bg-orange-500/10'
        )}>
          {message.role === MessageRoleEnum.USER && (
            <>
              <AvatarImage src={actualUserAvatar} alt="User" />
              <AvatarFallback className="flex items-center justify-center">
                <User className="h-4 w-4 text-blue-500" />
              </AvatarFallback>
            </>
          )}
          {message.role === MessageRoleEnum.ASSISTANT && (
            <AvatarFallback className="flex items-center justify-center">
              <Bot className="h-4 w-4 text-primary" />
            </AvatarFallback>
          )}
          {message.role === MessageRoleEnum.SYSTEM && (
            <AvatarFallback className="flex items-center justify-center">
              <AlertCircle className="h-4 w-4 text-orange-500" />
            </AvatarFallback>
          )}
        </Avatar>
      </div>

      {/* Message content */}
      <div className="flex-1 min-w-0">
        {/* Message header */}
        <div className={cn(
          'flex items-center gap-2 mb-2',
          message.role === MessageRoleEnum.USER ? 'flex-row-reverse' : 'flex-row'
        )}>
          <span className={cn(
            'text-sm font-medium',
            message.role === MessageRoleEnum.USER && 'text-blue-500',
            message.role === MessageRoleEnum.ASSISTANT && 'text-primary',
            message.role === MessageRoleEnum.SYSTEM && 'text-orange-500'
          )}>
            {message.role === MessageRoleEnum.USER ? 'You' : message.role === MessageRoleEnum.ASSISTANT ? 'Assistant' : 'System'}
          </span>
          
          {/* Model info next to Assistant */}
          {(message.role === MessageRoleEnum.ASSISTANT || message.role === MessageRoleEnum.SYSTEM) && message.metadata?.model && (
            <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">
              {message.metadata.model}
            </span>
          )}
        </div>

        {/* Reasoning block (for assistant messages) */}
        {message.reasoning && message.role === MessageRoleEnum.ASSISTANT && (
          <ReasoningBlock 
            reasoning={message.reasoning}
            className="mb-3"
          />
        )}

        {/* Message content */}
        <div className={cn(
          'relative rounded-2xl px-4 py-3 max-w-none',
          message.role === MessageRoleEnum.USER && 'bg-blue-500/10 border border-blue-500/20',
          message.role === MessageRoleEnum.ASSISTANT && 'bg-muted/50 border border-border',
          message.role === MessageRoleEnum.SYSTEM && 'bg-orange-500/10 border border-orange-500/20'
        )}>
          {/* Generating indicator */}
          {message.isGenerating && (
            <motion.div
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="flex items-center gap-2 text-sm text-muted-foreground mb-2"
            >
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-primary rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
              </div>
              Thinking...
            </motion.div>
          )}

          {/* Content parts */}
          <div className="space-y-3">
            <MarkdownContent content={message.content} />
          </div>

          {/* Subtle glow effect for assistant messages */}
          {message.role === MessageRoleEnum.ASSISTANT && (
            <motion.div
              className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/5 via-transparent to-purple-500/5"
              initial={{ opacity: 0 }}
              animate={{ opacity: isHovered ? 0.7 : 0.3 }}
              transition={{ duration: 0.3 }}
            />
          )}
        </div>

        {/* Message actions below the bubble - always reserve space */}
        <div className={cn(
          'mt-2 h-8 flex items-center',
          message.role === MessageRoleEnum.USER && 'justify-end'
        )}>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: (isHovered || messageReactions.length > 0) && !message.isGenerating ? 1 : 0 }}
            transition={{ duration: 0.2 }}
            className="flex items-center"
          >
            <MessageActions
              message={message}
              onRetry={onRetry}
              onBranch={onBranch}
              onCopy={onCopy}
              onEmojiReact={onEmojiReact}
              onEdit={onEdit}
              reactions={messageReactions}
            />
          </motion.div>
        </div>
      </div>
    </motion.div>
  )
}

MessageBubble.displayName = 'MessageBubble' 