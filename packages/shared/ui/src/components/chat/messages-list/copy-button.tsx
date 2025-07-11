import { Button } from '@netko/ui/components/shadcn/button'
import { motion } from 'framer-motion'
import { Copy, Check } from 'lucide-react'
import { cn } from '@netko/ui/lib/utils'
import * as React from 'react'
import type { CopyButtonProps } from './definitions/types'

export function CopyButton({ content, onCopy, className }: CopyButtonProps) {
  const [copied, setCopied] = React.useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content)
      setCopied(true)
      onCopy?.(content)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy text:', err)
    }
  }

  return (
    <motion.div whileTap={{ scale: 0.95 }}>
      <Button
        variant="ghost"
        size="sm"
        onClick={handleCopy}
        className={cn(
          'h-8 w-8 p-0 rounded-full hover:bg-primary/10 transition-colors',
          className
        )}
      >
        <motion.div
          initial={false}
          animate={{ scale: copied ? 1.1 : 1 }}
          transition={{ duration: 0.2 }}
        >
          {copied ? (
            <Check className="h-4 w-4 text-green-500" />
          ) : (
            <Copy className="h-4 w-4" />
          )}
        </motion.div>
        <span className="sr-only">Copy to clipboard</span>
      </Button>
    </motion.div>
  )
} 