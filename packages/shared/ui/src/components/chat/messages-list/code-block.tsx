import { motion } from 'framer-motion'
import { cn } from '@netko/ui/lib/utils'
import * as React from 'react'
import { CopyButton } from './copy-button'
import type { CodeBlockProps } from './definitions/types'

export function CodeBlock({ block, className }: CodeBlockProps) {
  const { language, code, filename } = block

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        'relative overflow-hidden rounded-lg border border-border bg-zinc-950 dark:bg-zinc-900',
        className
      )}
    >
      {/* Header with language and filename */}
      <div className="flex items-center justify-between px-4 py-2 bg-zinc-800 dark:bg-zinc-800 border-b border-border">
        <div className="flex items-center gap-2">
          {filename && (
            <span className="text-sm text-zinc-400 font-medium">{filename}</span>
          )}
          <span className="text-xs text-zinc-500 bg-zinc-700 px-2 py-1 rounded uppercase font-mono">
            {language || 'text'}
          </span>
        </div>
        <CopyButton content={code} className="h-6 w-6" />
      </div>

      {/* Code content */}
      <div className="relative overflow-x-auto">
        <pre className="p-4 text-sm leading-relaxed text-zinc-100">
          <code className={cn('font-mono', `language-${language}`)}>
            {code}
          </code>
        </pre>
        
        {/* Subtle gradient overlay for visual depth */}
        <motion.div
          className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-purple-500/5"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 2 }}
        />
      </div>
    </motion.div>
  )
} 