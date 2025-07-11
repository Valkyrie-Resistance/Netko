import { Button } from '@netko/ui/components/shadcn/button'
import { motion } from 'framer-motion'
import { ArrowUp } from 'lucide-react'
import { cn } from '@netko/ui/lib/utils'
import type { SendButtonProps } from './definitions/types'

export function SendButton({ onClick, disabled = false, className }: SendButtonProps) {
  return (
    <motion.div whileTap={{ scale: 0.92 }} className={className}>
      <Button
        size="icon"
        disabled={disabled}
        onClick={onClick}
        className={cn(
          'rounded-xl size-11 backdrop-blur-md bg-gradient-to-tr from-pink-500/60 to-rose-500/60 dark:from-pink-400/60 dark:to-rose-400/60 border border-white/30 dark:border-white/20 text-white shadow-lg hover:from-pink-600/70 hover:to-rose-600/70 dark:hover:from-pink-300/70 dark:hover:to-rose-300/70 flex items-center justify-center transition-all duration-200',
          className
        )}
      >
        <ArrowUp className="size-5" />
        <span className="sr-only">Send message</span>
      </Button>
    </motion.div>
  )
} 