import { Button } from '@netko/ui/components/shadcn/button'
import { motion } from 'framer-motion'
import { GitBranch } from 'lucide-react'
import { cn } from '@netko/ui/lib/utils'
import * as React from 'react'
import type { BranchButtonProps } from './definitions/types'

export function BranchButton({ onBranch, disabled = false, className }: BranchButtonProps) {
  const [isBranching, setIsBranching] = React.useState(false)

  const handleBranch = () => {
    setIsBranching(true)
    onBranch()
    // Reset after animation
    setTimeout(() => setIsBranching(false), 800)
  }

  return (
    <motion.div whileTap={{ scale: 0.95 }}>
      <Button
        variant="ghost"
        size="sm"
        onClick={handleBranch}
        disabled={disabled || isBranching}
        className={cn(
          'h-8 w-8 p-0 rounded-full hover:bg-primary/10 transition-colors',
          className
        )}
      >
        <motion.div
          animate={{ 
            scale: isBranching ? [1, 1.2, 1] : 1,
            rotate: isBranching ? [0, 15, -15, 0] : 0
          }}
          transition={{ duration: 0.6, ease: 'easeInOut' }}
        >
          <GitBranch className="h-4 w-4" />
        </motion.div>
        <span className="sr-only">Branch conversation</span>
      </Button>
    </motion.div>
  )
} 