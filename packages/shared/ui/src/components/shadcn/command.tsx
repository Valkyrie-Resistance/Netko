'use client'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@netko/ui/components/shadcn/dialog'
import { cn } from '@netko/ui/lib/utils'
import { Command as CommandPrimitive } from 'cmdk'
import { AnimatePresence, motion } from 'framer-motion'
import { SearchIcon } from 'lucide-react'
import * as React from 'react'

function Command({ className, ...props }: React.ComponentProps<typeof CommandPrimitive>) {
  return (
    <CommandPrimitive
      data-slot="command"
      className={cn(
        'bg-popover/95 text-popover-foreground backdrop-blur-sm flex h-full w-full flex-col overflow-hidden rounded-xl border border-border/50 shadow-2xl',
        className,
      )}
      {...props}
    />
  )
}

function CommandDialog({
  title = 'Command Palette',
  description = 'Search for a command to run...',
  children,
  className,
  showCloseButton = true,
  ...props
}: React.ComponentProps<typeof Dialog> & {
  title?: string
  description?: string
  className?: string
  showCloseButton?: boolean
}) {
  return (
    <Dialog {...props}>
      <DialogHeader className="sr-only">
        <DialogTitle>{title}</DialogTitle>
        <DialogDescription>{description}</DialogDescription>
      </DialogHeader>
      <DialogContent
        className={cn(
          'overflow-hidden p-0 shadow-2xl',
          'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
          className,
        )}
        showCloseButton={showCloseButton}
      >
        <Command className="[&_[cmdk-group-heading]]:text-muted-foreground [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group]]:px-2 [&_[cmdk-group]:not([hidden])_~[cmdk-group]]:pt-0 [&_[cmdk-input-wrapper]_svg]:h-5 [&_[cmdk-input-wrapper]_svg]:w-5 [&_[cmdk-input]]:h-12 [&_[cmdk-item]]:px-2 [&_[cmdk-item]]:py-3 [&_[cmdk-item]_svg]:h-5 [&_[cmdk-item]_svg]:w-5">
          {children}
        </Command>
      </DialogContent>
    </Dialog>
  )
}

function CommandInput({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Input>) {
  const [isFocused, setIsFocused] = React.useState(false)

  return (
    <div
      data-slot="command-input-wrapper"
      className="relative flex h-12 items-center gap-2 border-b border-border/50 px-3"
    >
      <motion.div
        animate={{
          scale: isFocused ? 1.2 : 1,
          rotate: isFocused ? 90 : 0,
        }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      >
        <SearchIcon className="size-4 shrink-0 text-muted-foreground/50" />
      </motion.div>
      <CommandPrimitive.Input
        data-slot="command-input"
        className={cn(
          'placeholder:text-muted-foreground/50 flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-hidden disabled:cursor-not-allowed disabled:opacity-50',
          'transition-all duration-300',
          className,
        )}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        {...props}
      />
      <motion.div
        className="absolute bottom-0 left-0 h-[2px] bg-gradient-to-r from-primary/50 via-primary to-primary/50"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: isFocused ? 1 : 0 }}
        transition={{ duration: 0.2 }}
        style={{ width: '100%' }}
      />
    </div>
  )
}

function CommandList({ className, ...props }: React.ComponentProps<typeof CommandPrimitive.List>) {
  return (
    <CommandPrimitive.List
      data-slot="command-list"
      className={cn(
        'max-h-[300px] scroll-py-1 overflow-x-hidden overflow-y-auto',
        'scrollbar-thin scrollbar-track-transparent scrollbar-thumb-border/50 hover:scrollbar-thumb-border',
        className,
      )}
      {...props}
    />
  )
}

function CommandEmpty({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Empty>) {
  return (
    <CommandPrimitive.Empty
      data-slot="command-empty"
      className={cn(
        'py-6 text-center text-sm text-muted-foreground/70',
        'animate-in fade-in-50 duration-300',
        className,
      )}
      {...props}
    />
  )
}

function CommandGroup({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Group>) {
  return (
    <CommandPrimitive.Group
      data-slot="command-group"
      className={cn(
        'text-foreground [&_[cmdk-group-heading]]:text-muted-foreground overflow-hidden p-1 [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium',
        'animate-in fade-in-50 duration-200',
        className,
      )}
      {...props}
    />
  )
}

function CommandSeparator({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Separator>) {
  return (
    <CommandPrimitive.Separator
      data-slot="command-separator"
      className={cn('bg-border/50 -mx-1 h-px', className)}
      {...props}
    />
  )
}

function CommandItem({ className, ...props }: React.ComponentProps<typeof CommandPrimitive.Item>) {
  return (
    <CommandPrimitive.Item
      data-slot="command-item"
      className={cn(
        'relative flex cursor-default select-none items-center gap-2 rounded-lg px-2 py-1.5 text-sm outline-hidden',
        'transition-all duration-200 ease-out',
        'data-[selected=true]:bg-accent/50 data-[selected=true]:text-accent-foreground',
        'data-[selected=true]:backdrop-blur-sm',
        'data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50',
        "[&_svg:not([class*='text-'])]:text-muted-foreground",
        "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        'hover:bg-accent/30',
        className,
      )}
      {...props}
    />
  )
}

function CommandShortcut({ className, ...props }: React.ComponentProps<'span'>) {
  return (
    <span
      data-slot="command-shortcut"
      className={cn('text-muted-foreground/50 ml-auto text-xs tracking-widest', className)}
      {...props}
    />
  )
}

export {
  Command,
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandShortcut,
  CommandSeparator,
}
