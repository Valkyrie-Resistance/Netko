import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@netko/ui/lib/utils'
import * as React from 'react'
import type { EmojiPickerProps } from './definitions/types'

const REACTION_EMOJIS = [
  '👍', '👎', '❤️', '😂', '😮', '😢', '😡', '🎉', '🤔', '👏', '🔥', '💯'
]

export function EmojiPicker({ onEmojiSelect, isOpen, onClose, className }: EmojiPickerProps) {
  const ref = React.useRef<HTMLDivElement>(null)

  // Close on outside click
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen, onClose])

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={ref}
          initial={{ opacity: 0, scale: 0.8, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 10 }}
          transition={{ duration: 0.2 }}
          className={cn(
            'absolute bottom-full mb-2 left-0 z-50',
            'bg-white dark:bg-zinc-900 border border-border rounded-lg shadow-lg p-2',
            'grid grid-cols-6 gap-1 min-w-[200px]',
            className
          )}
        >
          {REACTION_EMOJIS.map((emoji, index) => (
            <motion.button
              key={emoji}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.02, duration: 0.15 }}
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => {
                onEmojiSelect(emoji)
                onClose()
              }}
              className="p-2 rounded-md hover:bg-primary/10 transition-colors text-lg"
            >
              {emoji}
            </motion.button>
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  )
} 