import { Button } from '@netko/ui/components/shadcn/button'
import { motion } from 'framer-motion'
import { Globe } from 'lucide-react'
import { cn } from '@netko/ui/lib/utils'

export interface WebSearchToggleProps {
  enabled: boolean
  onToggle: (enabled: boolean) => void
  className?: string
}

export function WebSearchToggle({ enabled, onToggle, className }: WebSearchToggleProps) {
  return (
    <motion.div initial={false} animate={{ scale: enabled ? 1.05 : 1 }}>
      <Button
        variant={enabled ? 'default' : 'ghost'}
        size="sm"
        className={cn(
          'relative overflow-hidden backdrop-blur-md',
          enabled && 'bg-gradient-to-r from-purple-600 to-primary text-primary-foreground',
          className,
        )}
        onClick={() => onToggle(!enabled)}
      >
        <Globe className="size-4" />
        <span className="sr-only">Toggle web search</span>
        {/* Animated glow */}
        {enabled && (
          <motion.div
            className="absolute inset-0 bg-primary/20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, repeat: Infinity, repeatType: 'reverse' }}
          />
        )}
      </Button>
    </motion.div>
  )
} 