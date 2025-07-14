import * as React from 'react'
import { cn } from '@netko/ui/lib/utils'
import { MarkdownHooks } from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeRaw from 'rehype-raw'
import rehypeHighlight from 'rehype-highlight'

export interface MarkdownContentProps {
  content: string
  className?: string
}

const MarkdownContentComponent: React.FC<MarkdownContentProps> = ({ content, className }) => {
  // Memoize the plugin array so it's stable and always returns a new plugin function
  const rehypePlugins = React.useMemo(() => [rehypeRaw, rehypeHighlight], [])

  return (
    <div className={cn('text-sm prose dark:prose-invert max-w-none rounded-md p-2', className)}>
      <MarkdownHooks
        components={{
          pre: ({ children }) => <pre className="bg-[var(--color-prettylights-syntax-bg)]">{children}</pre>
        }}
        remarkPlugins={[remarkGfm]}
        rehypePlugins={rehypePlugins}
      >
        {content}
      </MarkdownHooks>
    </div>
  )
}

export const MarkdownContent = React.memo(
  MarkdownContentComponent,
  (prev, next) => prev.content === next.content && prev.className === next.className
) 