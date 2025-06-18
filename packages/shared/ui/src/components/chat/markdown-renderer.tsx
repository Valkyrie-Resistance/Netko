import { CopyButton } from '@chad-chat/ui/components/chat/copy-button.js'
import type {
  CodeBlockProps,
  HighlightedPre,
  MarkdownRendererProps,
} from '@chad-chat/ui/components/chat/definitions/types'
import { cn } from '@chad-chat/ui/lib/utils'
import React, { type JSX, Suspense } from 'react'
import Markdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

export function MarkdownRenderer({ children }: MarkdownRendererProps) {
  return (
    <div className="space-y-3">
      <Markdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ node, ...props }) => <h1 {...props} className="text-2xl font-bold" />,
          h2: ({ node, ...props }) => <h2 {...props} className="text-xl font-bold" />,
          h3: ({ node, ...props }) => <h3 {...props} className="text-lg font-bold" />,
          h4: ({ node, ...props }) => <h4 {...props} className="text-base font-bold" />,
          h5: ({ node, ...props }) => <h5 {...props} className="text-sm font-bold" />,
          h6: ({ node, ...props }) => <h6 {...props} className="text-xs font-bold" />,
          p: ({ node, ...props }) => <p {...props} className="text-base" />,
          a: ({ node, ...props }) => <a {...props} className="text-blue-500 hover:underline" />,
          ul: ({ node, ...props }) => <ul {...props} className="list-disc pl-6" />,
          ol: ({ node, ...props }) => <ol {...props} className="list-decimal pl-6" />,
          li: ({ node, ...props }) => <li {...props} className="my-1" />,
          blockquote: ({ node, ...props }) => (
            <blockquote {...props} className="border-l-4 border-gray-300 pl-4 italic" />
          ),
          code: ({ node, ...props }) => (
            <code {...props} className="rounded bg-gray-100 px-1 py-0.5 text-sm dark:bg-gray-800" />
          ),
          pre: ({ node, ...props }) => (
            <pre {...props} className="overflow-auto rounded-lg bg-gray-100 p-4 dark:bg-gray-800" />
          ),
          hr: ({ node, ...props }) => <hr {...props} className="my-4 border-gray-200" />,
          table: ({ node, ...props }) => <table {...props} className="w-full border-collapse" />,
          th: ({ node, ...props }) => (
            <th {...props} className="border border-gray-300 px-4 py-2" />
          ),
          td: ({ node, ...props }) => (
            <td {...props} className="border border-gray-300 px-4 py-2" />
          ),
        }}
      >
        {children}
      </Markdown>
    </div>
  )
}

const HighlightedPre = React.memo(async ({ children, language, ...props }: HighlightedPre) => {
  const { codeToTokens, bundledLanguages } = await import('shiki')

  if (!(language in bundledLanguages)) {
    return <pre {...props}>{children}</pre>
  }

  const { tokens } = await codeToTokens(children, {
    lang: language as keyof typeof bundledLanguages,
    defaultColor: false,
    themes: {
      light: 'github-light',
      dark: 'github-dark',
    },
  })

  return (
    <pre {...props}>
      <code>
        {tokens.map((line, lineIndex) => (
          <>
            <span key={lineIndex}>
              {line.map((token, tokenIndex) => {
                const style = typeof token.htmlStyle === 'string' ? undefined : token.htmlStyle

                return (
                  <span
                    key={tokenIndex}
                    className="text-shiki-light bg-shiki-light-bg dark:text-shiki-dark dark:bg-shiki-dark-bg"
                    style={style}
                  >
                    {token.content}
                  </span>
                )
              })}
            </span>
            {lineIndex !== tokens.length - 1 && '\n'}
          </>
        ))}
      </code>
    </pre>
  )
})
HighlightedPre.displayName = 'HighlightedCode'

const CodeBlock = ({ children, className, language, ...restProps }: CodeBlockProps) => {
  const code = typeof children === 'string' ? children : childrenTakeAllStringContents(children)

  const preClass = cn(
    'overflow-x-scroll rounded-md border bg-background/50 p-4 font-mono text-sm [scrollbar-width:none]',
    className,
  )

  return (
    <div className="group/code relative mb-4">
      <Suspense
        fallback={
          <pre className={preClass} {...restProps}>
            {children}
          </pre>
        }
      >
        <HighlightedPre language={language} className={preClass}>
          {code}
        </HighlightedPre>
      </Suspense>

      <div className="invisible absolute right-2 top-2 flex space-x-1 rounded-lg p-1 opacity-0 transition-all duration-200 group-hover/code:visible group-hover/code:opacity-100">
        <CopyButton content={code} copyMessage="Copied code to clipboard" />
      </div>
    </div>
  )
}

function childrenTakeAllStringContents(element: any): string {
  if (typeof element === 'string') {
    return element
  }

  if (element?.props?.children) {
    const children = element.props.children

    if (Array.isArray(children)) {
      return children.map((child) => childrenTakeAllStringContents(child)).join('')
    }
    return childrenTakeAllStringContents(children)
  }

  return ''
}

const COMPONENTS = {
  h1: withClass('h1', 'text-2xl font-semibold'),
  h2: withClass('h2', 'font-semibold text-xl'),
  h3: withClass('h3', 'font-semibold text-lg'),
  h4: withClass('h4', 'font-semibold text-base'),
  h5: withClass('h5', 'font-medium'),
  strong: withClass('strong', 'font-semibold'),
  a: withClass('a', 'text-primary underline underline-offset-2'),
  blockquote: withClass('blockquote', 'border-l-2 border-primary pl-4'),
  code: ({ children, className, node, ...rest }: any) => {
    const match = /language-(\w+)/.exec(className || '')
    return match ? (
      <CodeBlock className={className} language={match[1]} {...rest}>
        {children}
      </CodeBlock>
    ) : (
      <code
        className={cn(
          'font-mono [:not(pre)>&]:rounded-md [:not(pre)>&]:bg-background/50 [:not(pre)>&]:px-1 [:not(pre)>&]:py-0.5',
        )}
        {...rest}
      >
        {children}
      </code>
    )
  },
  pre: ({ children }: any) => children,
  ol: withClass('ol', 'list-decimal space-y-2 pl-6'),
  ul: withClass('ul', 'list-disc space-y-2 pl-6'),
  li: withClass('li', 'my-1.5'),
  table: withClass(
    'table',
    'w-full border-collapse overflow-y-auto rounded-md border border-foreground/20',
  ),
  th: withClass(
    'th',
    'border border-foreground/20 px-4 py-2 text-left font-bold [&[align=center]]:text-center [&[align=right]]:text-right',
  ),
  td: withClass(
    'td',
    'border border-foreground/20 px-4 py-2 text-left [&[align=center]]:text-center [&[align=right]]:text-right',
  ),
  tr: withClass('tr', 'm-0 border-t p-0 even:bg-muted'),
  p: withClass('p', 'whitespace-pre-wrap'),
  hr: withClass('hr', 'border-foreground/20'),
}

function withClass(Tag: keyof JSX.IntrinsicElements, classes: string) {
  const Component = ({ node, ...props }: any) => <Tag className={classes} {...props} />
  Component.displayName = Tag
  return Component
}

export default MarkdownRenderer
