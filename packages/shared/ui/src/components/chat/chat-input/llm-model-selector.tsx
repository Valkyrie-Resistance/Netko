import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@netko/ui/components/shadcn/dropdown-menu'
import { Button } from '@netko/ui/components/shadcn/button'
import { cn } from '@netko/ui/lib/utils'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronDown, Sparkles } from 'lucide-react'
import * as React from 'react'
import type { LLMModelSelectorProps } from './definitions/types'

/**
 * Fancy drop-down selector for choosing the active LLM model.
 * Includes sparkly animation goodness ✨
 */
export function LLMModelSelector({
  models,
  selectedModel,
  onChange,
  className,
}: LLMModelSelectorProps) {
  const [isHovered, setIsHovered] = React.useState(false)
  const [isOpen, setIsOpen] = React.useState(false)
  const active = selectedModel ?? models[0]

  return (
    <DropdownMenu onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            'relative overflow-hidden px-2.5 py-1.5',
            'rounded-lg font-medium backdrop-blur-md',
            className,
          )}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* Shiny background - only animate on hover or when open */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-primary/20 via-purple-500/20 to-transparent"
            initial={{ opacity: 0 }}
            animate={{ opacity: isHovered || isOpen ? 1 : 0 }}
            transition={{ duration: 0.3 }}
          />

          <Sparkles className="relative z-10 size-4 text-primary" />
          <span className="relative z-10 truncate max-w-[6rem]">
            {active?.displayName ?? active?.name ?? 'Select model'}
          </span>
          <ChevronDown className="relative z-10 size-4 opacity-70" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="min-w-48">
        <AnimatePresence>
          {models.map((model, i) => (
            <motion.div
              key={model.id}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.15, delay: i * 0.04 }}
            >
              <DropdownMenuItem
                onSelect={() => onChange(model)}
                className={cn(
                  'cursor-pointer gap-2',
                  model.id === active?.id && 'bg-primary/10',
                )}
              >
                {model.displayName ?? model.name}
              </DropdownMenuItem>
            </motion.div>
          ))}
        </AnimatePresence>
      </DropdownMenuContent>
    </DropdownMenu>
  )
} 