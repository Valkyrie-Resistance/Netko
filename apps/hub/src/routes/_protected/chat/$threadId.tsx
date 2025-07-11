import type { LLMModel } from '@netko/brain-domain'
import { ChatInput } from '@netko/ui/components/chat/chat-input'
import { MessagesList } from '@netko/ui/components/chat/messages-list'
import type { Message } from '@netko/ui/components/chat/messages-list/definitions/types'
import { SidebarTrigger } from '@netko/ui/components/shadcn/sidebar'
import { useQuery } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { ThemeToggle } from '@/components/core/theme/theme-switcher'
import { trpcHttp } from '@/lib/trpc'
import { useAuth } from '@/providers/auth-provider'

export const Route = createFileRoute({
  component: RouteComponent,
})

function RouteComponent() {
  const { user } = useAuth()
  const { isLoading: _isLoadingLLMModels } = useQuery(trpcHttp.threads.getLLMModels.queryOptions())

  // Mock messages for demonstration
  const [messages] = useState<Message[]>([
    {
      id: '1',
      content:
        'Hey there! I need help with a React component that keeps re-rendering. Any ideas? 🤔',
      role: 'user',
      timestamp: new Date('2024-01-15T10:00:00Z'),
      metadata: {
        tokensUsed: 25,
      },
    },
    {
      id: '2',
      content:
        'Ah, the classic "why is my component having an identity crisis" problem! 😸\n\nThe most common culprits are:\n\n1. **Creating objects/functions inline** - React thinks they\'re new every time\n2. **Missing dependencies in useEffect** - causing infinite loops\n3. **State updates triggering more state updates** - the render cycle of doom\n\nCan you show me the component? I promise I won\'t judge your variable names... much. 🐱',
      role: 'assistant',
      timestamp: new Date('2024-01-15T10:01:00Z'),
      parentId: '1',
      reasoning:
        'Let me analyze this React re-rendering issue step by step:\n\n1. The user mentions "keeps re-rendering" which is a classic performance problem\n2. Most common causes are:\n   - Inline object/function creation (new references each render)\n   - useEffect dependency issues (missing or incorrect deps)\n   - State update cycles (updates triggering more updates)\n3. I should ask to see the code to provide specific help\n4. Adding some humor will make the response more engaging and less intimidating\n\nI\'ll provide the most common solutions while keeping it light and fun with cat metaphors.',
      metadata: {
        tokensUsed: 220,
        model: 'gpt-4',
      },
    },
    {
      id: '3',
      content:
        "LOL you got me! 😹 Here's my component:\n\n```jsx\nconst MyComponent = () => {\n  const [count, setCount] = useState(0)\n  \n  useEffect(() => {\n    setCount(count + 1)\n  }, [count])\n  \n  return <div>{count}</div>\n}\n```\n\nI have a feeling this might be the problem... 🙈",
      role: 'user',
      timestamp: new Date('2024-01-15T10:02:00Z'),
      parentId: '2',
      codeBlocks: [
        {
          id: 'code-1',
          language: 'jsx',
          code: `const MyComponent = () => {
  const [count, setCount] = useState(0)
  
  useEffect(() => {
    setCount(count + 1)
  }, [count])
  
  return <div>{count}</div>
}`,
        },
      ],
      metadata: {
        tokensUsed: 45,
      },
    },
    {
      id: '4',
      content:
        'OH NO! 🚨 We found the infinite loop of doom! Your component is basically saying:\n\n"Hey, count changed, let me update count!"\n"Oh look, count changed again, let me update count!"\n"Wait, count changed AGAIN?!"\n\nThis is like a cat chasing its own tail, but with more CPU usage! 😹\n\n**The fix:** Remove `count` from the dependency array since you\'re updating it inside the effect:\n\n```jsx\nconst MyComponent = () => {\n  const [count, setCount] = useState(0)\n  \n  useEffect(() => {\n    setCount(count + 1)\n  }, []) // Empty dependency array - runs once\n  \n  return <div>{count}</div>\n}\n```\n\nOr better yet, use the functional update pattern:\n\n```jsx\nuseEffect(() => {\n  setCount(prev => prev + 1)\n}, [])\n```\n\nYour CPU will thank you! 💻✨',
      role: 'assistant',
      timestamp: new Date('2024-01-15T10:03:00Z'),
      parentId: '3',
      reasoning:
        "Oh wow, this is a perfect example of an infinite loop! Let me break down what's happening:\n\n1. The component renders with count = 0\n2. useEffect runs because count is in the dependency array\n3. setCount(count + 1) updates count to 1\n4. Component re-renders because state changed\n5. useEffect runs again because count changed (0 → 1)\n6. setCount(count + 1) updates count to 2\n7. This cycle continues infinitely!\n\nThe key issue is that the effect is both:\n- Depending on count (in the dependency array)\n- Updating count (in the effect body)\n\nThis creates a feedback loop. I need to:\n1. Explain this clearly with a fun analogy\n2. Provide the immediate fix (remove count from deps)\n3. Show the better functional update pattern\n4. Keep it engaging with humor\n\nThe cat chasing tail metaphor is perfect here!",
      codeBlocks: [
        {
          id: 'code-2',
          language: 'jsx',
          code: `const MyComponent = () => {
  const [count, setCount] = useState(0)
  
  useEffect(() => {
    setCount(count + 1)
  }, []) // Empty dependency array - runs once
  
  return <div>{count}</div>
}`,
        },
        {
          id: 'code-3',
          language: 'jsx',
          code: `useEffect(() => {
  setCount(prev => prev + 1)
}, [])`,
        },
      ],
      metadata: {
        tokensUsed: 380,
        model: 'gpt-4',
      },
    },
  ])

  const [chatInputValue, setChatInputValue] = useState('')
  const llmModels: LLMModel[] = []

  useEffect(() => {
    console.log('messages', messages)
  }, [messages])

  return (
    <>
      <header className="flex h-16 shrink-0 items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <SidebarTrigger className="-ml-1" />
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
        </div>
      </header>
      <div className="relative flex flex-col w-full h-full min-h-0 p-4 pb-32">
        <MessagesList
          messages={messages}
          isGenerating={false}
          userAvatar={user?.image ?? undefined}
          defaultUserAvatar={user?.image ?? undefined}
        />
        <div className="pointer-events-none absolute left-0 right-0 bottom-0 flex justify-center w-full z-20 p-4">
          <div className="pointer-events-auto w-full max-w-4xl mx-auto">
            <ChatInput
              value={chatInputValue}
              onChange={(e) => setChatInputValue(e.target.value)}
              onSend={() => {}}
              isGenerating={false}
              llmModels={llmModels ?? []}
              handleLLMModelChange={() => {}}
              isWebSearchEnabled={false}
              onWebSearchToggle={() => {}}
            />
          </div>
        </div>
      </div>
    </>
  )
}
