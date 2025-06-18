import { Bot, History, MessageSquare } from 'lucide-react'

import { AssistantSwitcher } from '@/components/core/nav/assistant-switcher'
import { NavConversations, groupConversationsByTime } from '@/components/core/nav/nav-conversations'
import { NavUser } from '@/components/core/nav/nav-user'

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
} from '@chad-chat/ui/components/shadcn/sidebar'

import { useAuth } from '@/providers/auth-provider'

// Mock conversation data with timestamps
const mockConversations = [
  // Today
  {
    id: '1',
    title: 'React Router Setup Help',
    timestamp: new Date(),
    preview: 'How do I set up TanStack Router with...',
  },
  {
    id: '2',
    title: 'TypeScript Error Debugging',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    preview: 'Getting weird TS errors in my component...',
  },
  {
    id: '3',
    title: 'CSS Grid vs Flexbox',
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
    preview: 'When should I use CSS Grid over Flexbox?',
  },

  // Yesterday
  {
    id: '4',
    title: 'API Rate Limiting Strategy',
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
    preview: 'Best practices for handling rate limits...',
  },
  {
    id: '5',
    title: 'Database Migration Issues',
    timestamp: new Date(Date.now() - 26 * 60 * 60 * 1000),
    preview: 'Prisma migration failing with foreign key...',
  },

  // Last Week
  {
    id: '6',
    title: 'Authentication Flow Design',
    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    preview: 'Implementing JWT with refresh tokens...',
  },
  {
    id: '7',
    title: 'Performance Optimization',
    timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
    preview: 'My React app is getting slow, help!',
  },
  {
    id: '8',
    title: 'Docker Container Setup',
    timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    preview: 'Setting up dev environment with Docker...',
  },

  // Last Month
  {
    id: '9',
    title: 'Microservices Architecture',
    timestamp: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
    preview: 'Breaking down monolith into services...',
  },
  {
    id: '10',
    title: 'Testing Strategy Discussion',
    timestamp: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
    preview: 'Unit vs integration vs e2e testing...',
  },
  {
    id: '11',
    title: 'GraphQL vs REST API',
    timestamp: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000),
    preview: 'Which API approach should I choose?',
  },
]

// Mock assistants data for the switcher
const assistants = [
  {
    name: 'Claude Sonnet 3.5',
    logo: Bot,
    plan: 'Your coding companion 🐱‍💻',
  },
  {
    name: 'GPT-4 Turbo',
    logo: MessageSquare,
    plan: 'Alternative assistant',
  },
  {
    name: 'Gemini Pro',
    logo: History,
    plan: "Google's assistant",
  },
]

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user } = useAuth()
  const conversationGroups = groupConversationsByTime(mockConversations)

  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <AssistantSwitcher teams={assistants} />
      </SidebarHeader>

      <SidebarContent>
        <NavConversations conversationGroups={conversationGroups} />
      </SidebarContent>

      <SidebarFooter>{user ? <NavUser user={user} /> : null}</SidebarFooter>
    </Sidebar>
  )
}
