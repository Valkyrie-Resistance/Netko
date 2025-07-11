import { motion } from 'framer-motion'
import { User, Bot, AlertCircle } from 'lucide-react'
import { cn } from '@netko/ui/lib/utils'
import * as React from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@netko/ui/components/shadcn/avatar'
import { CodeBlock } from './code-block'
import { ReasoningBlock } from './reasoning-block'
import { MessageActions } from './message-actions'
import type { MessageBubbleProps } from './definitions/types'

export const MessageBubble = React.memo(({
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
  defaultUserAvatar
}: MessageBubbleProps) => {
  const [isHovered, setIsHovered] = React.useState(false)
  const isUser = message.role === 'user'
  const isAssistant = message.role === 'assistant'
  const isSystem = message.role === 'system'
  
  const messageReactions = reactions?.[message.id] || []
  
  // Default avatar fallback
  const defaultAvatar = defaultUserAvatar || '/default-avatar.png'
  const actualUserAvatar = userAvatar || defaultAvatar

  // Parse content for code blocks (simple regex approach)
  const parseContentWithCodeBlocks = (content: string) => {
    const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g
    const parts: Array<{ type: 'text' | 'code'; content: string; language?: string }> = []
    let lastIndex = 0
    let match

    while ((match = codeBlockRegex.exec(content)) !== null) {
      // Add text before code block
      if (match.index > lastIndex) {
        parts.push({
          type: 'text',
          content: content.slice(lastIndex, match.index)
        })
      }
      
      // Add code block
      parts.push({
        type: 'code',
        content: match[2]?.trim() || '',
        language: match[1]?.trim() || 'text'
      })
      
      lastIndex = match.index + match[0].length
    }
    
    // Add remaining text
    if (lastIndex < content.length) {
      parts.push({
        type: 'text',
        content: content.slice(lastIndex)
      })
    }
    
    return parts.length > 0 ? parts : [{ type: 'text', content }]
  }

  const contentParts = parseContentWithCodeBlocks(message.content)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={cn(
        'group relative mb-6 flex gap-4',
        isUser && 'flex-row-reverse ml-auto max-w-[85%]', // User messages on the right
        isAssistant && 'flex-row mr-auto max-w-[85%]', // Assistant messages on the left
        isSystem && 'flex-row mr-auto max-w-[85%]', // System messages on the left
        isLast && 'mb-0',
        className
      )}
    >
      {/* Avatar */}
      <div className="flex-shrink-0">
        <Avatar className={cn(
          'h-8 w-8 border-2 flex items-center justify-center',
          isUser && 'border-blue-500/50 bg-blue-500/10',
          isAssistant && 'border-primary/50 bg-primary/10',
          isSystem && 'border-orange-500/50 bg-orange-500/10'
        )}>
          {isUser && (
            <>
              <AvatarImage src={actualUserAvatar} alt="User" />
              <AvatarFallback className="flex items-center justify-center">
                <User className="h-4 w-4 text-blue-500" />
              </AvatarFallback>
            </>
          )}
          {isAssistant && (
            <AvatarFallback className="flex items-center justify-center">
              <Bot className="h-4 w-4 text-primary" />
            </AvatarFallback>
          )}
          {isSystem && (
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
          isUser ? 'flex-row-reverse' : 'flex-row'
        )}>
          <span className={cn(
            'text-sm font-medium',
            isUser && 'text-blue-500',
            isAssistant && 'text-primary',
            isSystem && 'text-orange-500'
          )}>
            {isUser ? 'You' : isAssistant ? 'Assistant' : 'System'}
          </span>
          
          {/* Model info next to Assistant */}
          {(isAssistant || isSystem) && message.metadata?.model && (
            <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">
              {message.metadata.model}
            </span>
          )}
        </div>

        {/* Reasoning block (for assistant messages) */}
        {message.reasoning && isAssistant && (
          <ReasoningBlock 
            reasoning={message.reasoning}
            className="mb-3"
          />
        )}

        {/* Message content */}
        <div className={cn(
          'relative rounded-2xl px-4 py-3 max-w-none',
          isUser && 'bg-blue-500/10 border border-blue-500/20',
          isAssistant && 'bg-muted/50 border border-border',
          isSystem && 'bg-orange-500/10 border border-orange-500/20'
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
            {contentParts.map((part, index) => (
              <div key={index}>
                {part.type === 'text' ? (
                  <div className="text-sm leading-relaxed whitespace-pre-wrap">
                    {part.content}
                  </div>
                ) : (
                  <CodeBlock
                    block={{
                      id: `${message.id}-code-${index}`,
                      language: part.language || 'text',
                      code: part.content
                    }}
                  />
                )}
              </div>
            ))}
          </div>

          {/* Subtle glow effect for assistant messages */}
          {isAssistant && (
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
          isUser && 'justify-end'
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
})

MessageBubble.displayName = 'MessageBubble' 