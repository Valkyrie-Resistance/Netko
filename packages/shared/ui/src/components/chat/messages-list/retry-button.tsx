import { Button } from '@netko/ui/components/shadcn/button'
import { motion } from 'framer-motion'
import { RotateCcw } from 'lucide-react'
import { cn } from '@netko/ui/lib/utils'
import * as React from 'react'
import type { RetryButtonProps } from './definitions/types'

export function RetryButton({ onRetry, disabled = false, className }: RetryButtonProps) {
  const [isRetrying, setIsRetrying] = React.useState(false)

  const handleRetry = () => {
    setIsRetrying(true)
    onRetry()
    // Reset after animation
    setTimeout(() => setIsRetrying(false), 1000)
  }

  return (
    <motion.div whileTap={{ scale: 0.95 }}>
      <Button
        variant="ghost"
        size="sm"
        onClick={handleRetry}
        disabled={disabled || isRetrying}
        className={cn(
          'h-8 w-8 p-0 rounded-full hover:bg-primary/10 transition-colors',
          className
        )}
      >
        <motion.div
          animate={{ rotate: isRetrying ? 360 : 0 }}
          transition={{ duration: 0.8, ease: 'easeInOut' }}
        >
          <RotateCcw className="h-4 w-4" />
        </motion.div>
        <span className="sr-only">Retry message</span>
      </Button>
    </motion.div>
  )
} 