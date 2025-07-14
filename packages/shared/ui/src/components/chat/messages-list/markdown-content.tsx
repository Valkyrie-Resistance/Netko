import * as React from 'react'
import { cn } from '@netko/ui/lib/utils'
import { MarkdownHooks } from 'react-markdown'
import rehypeStarryNight from 'rehype-starry-night'
import remarkGfm from 'remark-gfm'
import rehypeRaw from 'rehype-raw'

export interface MarkdownContentProps {
  content: string
  className?: string
}

export const MarkdownContent: React.FC<MarkdownContentProps> = ({ content, className }) => {
  return (
    <div className={cn('text-sm prose dark:prose-invert max-w-none rounded-md p-2', className)}>
      <MarkdownHooks components={
        {
          pre: ({ children }) => <pre className="bg-[var(--color-prettylights-syntax-bg)]">{children}</pre>
        }
      } remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw, rehypeStarryNight]}>
        {content}
      </MarkdownHooks>
    </div>
  )
} 