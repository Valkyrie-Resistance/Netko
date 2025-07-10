import { Button } from '@netko/ui/components/shadcn/button'
import { motion } from 'framer-motion'
import { SendHorizonal } from 'lucide-react'
import { cn } from '@netko/ui/lib/utils'

export interface SendButtonProps {
  onClick: () => void
  disabled?: boolean
  className?: string
}

export function SendButton({ onClick, disabled = false, className }: SendButtonProps) {
  return (
    <motion.div whileTap={{ scale: 0.92 }} className={className}>
      <Button
        size="icon"
        disabled={disabled}
        onClick={onClick}
        className={cn(
          'rounded-full size-11 bg-gradient-to-tr from-purple-600 to-primary text-primary-foreground shadow-lg hover:brightness-110 flex items-center justify-center',
          className
        )}
      >
        <SendHorizonal className="size-5" />
        <span className="sr-only">Send message</span>
      </Button>
    </motion.div>
  )
} 