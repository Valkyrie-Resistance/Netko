import { motion } from 'framer-motion'
import { Edit2 } from 'lucide-react'
import { cn } from '@netko/ui/lib/utils'
import type { EditButtonProps } from './definitions/types'

export function EditButton({ onEdit, disabled = false, className }: EditButtonProps) {
  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      onClick={onEdit}
      disabled={disabled}
      className={cn(
        'h-8 w-8 p-0 rounded-full hover:bg-primary/10 transition-colors flex items-center justify-center',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        className
      )}
    >
      <Edit2 className="h-4 w-4" />
      <span className="sr-only">Edit message</span>
    </motion.button>
  )
} 