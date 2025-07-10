import { Button } from '@netko/ui/components/shadcn/button'
import { Paperclip } from 'lucide-react'
import { motion } from 'framer-motion'
import * as React from 'react'

export interface AttachmentsButtonProps {
  onFilesSelected: (files: FileList) => void
  disabled?: boolean
  className?: string
}

export function AttachmentsButton({
  onFilesSelected,
  disabled = false,
  className,
}: AttachmentsButtonProps) {
  const inputRef = React.useRef<HTMLInputElement>(null)

  const handleSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      onFilesSelected(e.target.files)
      // reset so same file can be selected twice if needed
      e.target.value = ''
    }
  }

  return (
    <>
      <motion.div whileTap={{ scale: 0.9 }} className={className}>
        <Button
          variant="ghost"
          size="icon"
          disabled={disabled}
          onClick={() => inputRef.current?.click()}
        >
          <Paperclip className="size-4 rotate-45" />
          <span className="sr-only">Add attachments</span>
        </Button>
      </motion.div>
      <input
        ref={inputRef}
        type="file"
        multiple
        className="hidden"
        onChange={handleSelect}
      />
    </>
  )
} 