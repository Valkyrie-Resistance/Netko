import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, Brain } from 'lucide-react'
import { cn } from '@netko/ui/lib/utils'
import * as React from 'react'
import type { ReasoningBlockProps } from './definitions/types'

export function ReasoningBlock({ 
  reasoning, 
  isExpanded = false, 
  onToggle, 
  className 
}: ReasoningBlockProps) {
  const [internalExpanded, setInternalExpanded] = React.useState(isExpanded)
  
  const expanded = onToggle ? isExpanded : internalExpanded
  const toggle = onToggle || (() => setInternalExpanded(!internalExpanded))

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        'border border-dashed border-primary/30 rounded-lg bg-primary/5 overflow-hidden',
        className
      )}
    >
      {/* Header */}
      <button
        onClick={toggle}
        className="flex items-center justify-between w-full px-4 py-3 hover:bg-primary/10 transition-colors"
      >
        <div className="flex items-center gap-2">
          <motion.div
            animate={{ rotate: expanded ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <Brain className="h-4 w-4 text-primary" />
          </motion.div>
          <span className="text-sm font-medium text-primary">
            Reasoning
          </span>
          {!expanded && (
            <motion.div
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="flex gap-1"
            >
              <div className="w-1 h-1 bg-primary rounded-full" />
              <div className="w-1 h-1 bg-primary rounded-full" />
              <div className="w-1 h-1 bg-primary rounded-full" />
            </motion.div>
          )}
        </div>
        <motion.div
          animate={{ rotate: expanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="h-4 w-4 text-primary" />
        </motion.div>
      </button>

      {/* Content */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 pt-0">
              <div className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                {reasoning}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
} 