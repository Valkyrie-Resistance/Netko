import { AnimatePresence, motion } from 'framer-motion'
import {
  Bot,
  ChevronRight,
  History,
  MessageSquare,
  Plus,
  Search,
  Settings,
  Sparkles,
} from 'lucide-react'
import { useState } from 'react'

import { AssistantSwitcher } from '@/components/core/nav/assistant-switcher'
import { NavConversations, groupConversationsByTime } from '@/components/core/nav/nav-conversations'
import { NavUser } from '@/components/core/nav/nav-user'

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
} from '@chad-chat/ui/components/shadcn/sidebar'

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@chad-chat/ui/components/shadcn/command'

import { Button } from '@chad-chat/ui/components/shadcn/button'

import { useAuth } from '@/providers/auth-provider'

// Mock conversation data with timestamps
const mockConversations = [
  // Today
  {
    id: '1',
    title: 'How to implement TanStack Router with TypeScript?',
    timestamp: new Date(),
  },
  {
    id: '2',
    title: 'Debugging React state management issues',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
  },
  {
    id: '3',
    title: 'CSS Grid layout not working as expected',
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
  },
  {
    id: '4',
    title: 'Help with Tailwind CSS custom utilities',
    timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
  },
  {
    id: '5',
    title: 'Next.js App Router vs Pages Router differences',
    timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000),
  },
  {
    id: '6',
    title: 'ESLint configuration for React TypeScript project',
    timestamp: new Date(Date.now() - 10 * 60 * 60 * 1000),
  },

  // Yesterday
  {
    id: '7',
    title: 'API rate limiting best practices',
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
  },
  {
    id: '8',
    title: 'Prisma migration failing with foreign key constraints',
    timestamp: new Date(Date.now() - 26 * 60 * 60 * 1000),
  },
  {
    id: '9',
    title: 'Optimizing bundle size with Webpack',
    timestamp: new Date(Date.now() - 28 * 60 * 60 * 1000),
  },
  {
    id: '10',
    title: 'Understanding React 18 concurrent features',
    timestamp: new Date(Date.now() - 30 * 60 * 60 * 1000),
  },
  {
    id: '11',
    title: 'Setting up Storybook for component library',
    timestamp: new Date(Date.now() - 32 * 60 * 60 * 1000),
  },

  // Last Week
  {
    id: '12',
    title: 'JWT authentication with refresh tokens',
    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
  },
  {
    id: '13',
    title: 'React performance optimization techniques',
    timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
  },
  {
    id: '14',
    title: 'Docker development environment setup',
    timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
  },
  {
    id: '15',
    title: 'Implementing WebSocket real-time chat',
    timestamp: new Date(Date.now() - 3.5 * 24 * 60 * 60 * 1000),
  },
  {
    id: '16',
    title: 'Node.js serverless functions with Vercel',
    timestamp: new Date(Date.now() - 4.5 * 24 * 60 * 60 * 1000),
  },
  {
    id: '17',
    title: 'MongoDB aggregation pipeline optimization',
    timestamp: new Date(Date.now() - 5.5 * 24 * 60 * 60 * 1000),
  },
  {
    id: '18',
    title: 'TypeScript generic constraints explained',
    timestamp: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
  },
  {
    id: '19',
    title: 'React Hook Form with Zod validation',
    timestamp: new Date(Date.now() - 6.5 * 24 * 60 * 60 * 1000),
  },

  // Last Month
  {
    id: '20',
    title: 'Microservices vs monolith architecture decision',
    timestamp: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
  },
  {
    id: '21',
    title: 'Testing strategy: unit vs integration vs e2e',
    timestamp: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
  },
  {
    id: '22',
    title: 'GraphQL vs REST API comparison',
    timestamp: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000),
  },
  {
    id: '23',
    title: 'Implementing OAuth2 with multiple providers',
    timestamp: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000),
  },
  {
    id: '24',
    title: 'Redis caching strategies for high traffic apps',
    timestamp: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000),
  },
  {
    id: '25',
    title: 'Kubernetes deployment for Node.js applications',
    timestamp: new Date(Date.now() - 22 * 24 * 60 * 60 * 1000),
  },
  {
    id: '26',
    title: 'Advanced TypeScript mapped types tutorial',
    timestamp: new Date(Date.now() - 27 * 24 * 60 * 60 * 1000),
  },

  // Older (more than a month)
  {
    id: '27',
    title: 'Setting up CI/CD pipeline with GitHub Actions',
    timestamp: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000),
  },
  {
    id: '28',
    title: 'Database design for multi-tenant application',
    timestamp: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
  },
  {
    id: '29',
    title: 'Understanding async/await vs promises in JavaScript',
    timestamp: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
  },
  {
    id: '30',
    title: 'Redux vs Zustand state management comparison',
    timestamp: new Date(Date.now() - 75 * 24 * 60 * 60 * 1000),
  },
  {
    id: '31',
    title: 'Building scalable React component architecture',
    timestamp: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000),
  },
  {
    id: '32',
    title: 'PostgreSQL query optimization techniques',
    timestamp: new Date(Date.now() - 50 * 24 * 60 * 60 * 1000),
  },
  {
    id: '33',
    title: 'AWS Lambda cold start optimization strategies',
    timestamp: new Date(Date.now() - 65 * 24 * 60 * 60 * 1000),
  },
  {
    id: '34',
    title: 'Implementing event sourcing with TypeScript',
    timestamp: new Date(Date.now() - 80 * 24 * 60 * 60 * 1000),
  },
  {
    id: '35',
    title: 'Web accessibility best practices checklist',
    timestamp: new Date(Date.now() - 55 * 24 * 60 * 60 * 1000),
  },
  {
    id: '36',
    title: 'Migrating from JavaScript to TypeScript gradually',
    timestamp: new Date(Date.now() - 70 * 24 * 60 * 60 * 1000),
  },
  {
    id: '37',
    title: 'Optimizing React Native app performance',
    timestamp: new Date(Date.now() - 85 * 24 * 60 * 60 * 1000),
  },
  {
    id: '38',
    title: 'Building custom Webpack plugins from scratch',
    timestamp: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
  },
]

// Mock assistants data for the switcher
const assistants = [
  {
    name: 'Claude Sonnet 3.5',
    logo: Bot,
    description: 'Your coding companion 🐱‍💻',
  },
  {
    name: 'GPT-4 Turbo',
    logo: MessageSquare,
    description: 'Alternative assistant',
  },
  {
    name: 'Gemini Pro',
    logo: History,
    description: "Google's assistant",
  },
]

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user } = useAuth()
  const [isCommandOpen, setIsCommandOpen] = useState(false)
  const [isNewChatHovered, setIsNewChatHovered] = useState(false)
  const conversationGroups = groupConversationsByTime(mockConversations)

  const handleCreateChat = () => {
    // TODO: Implement create new chat logic
    console.log('Creating new chat... 🚀')
  }

  const handleCommand = (command: string) => {
    console.log('Running command:', command)
    setIsCommandOpen(false)

    // TODO: Implement command actions
    switch (command) {
      case 'new-chat':
        handleCreateChat()
        break
      case 'search-conversations':
        console.log('Searching conversations... 🔍')
        break
      case 'settings':
        console.log('Opening settings... ⚙️')
        break
      default:
        break
    }
  }

  return (
    <>
      <Sidebar variant="inset" {...props}>
        <SidebarHeader>
          <div className="flex flex-col gap-2">
            <AssistantSwitcher assistants={assistants} />

            <div className="flex gap-2">
              <motion.div
                className="flex-1"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onHoverStart={() => setIsNewChatHovered(true)}
                onHoverEnd={() => setIsNewChatHovered(false)}
              >
                <Button
                  variant="outline"
                  size="sm"
                  className="relative flex w-full justify-start gap-2 overflow-hidden transition-all duration-300"
                  onClick={handleCreateChat}
                >
                  <div className="relative z-10 flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    <span>New Chat</span>
                  </div>
                  <AnimatePresence>
                    {isNewChatHovered && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0 }}
                        className="absolute right-2 top-1/2 z-10 -translate-y-1/2"
                      >
                        <Sparkles className="h-4 w-4 text-primary" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent"
                    initial={{ x: '-100%' }}
                    animate={{ x: isNewChatHovered ? '0%' : '-100%' }}
                    transition={{ type: 'spring', stiffness: 100, damping: 20 }}
                  />
                </Button>
              </motion.div>

              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsCommandOpen(true)}
                  className="relative overflow-hidden"
                >
                  <Search className="h-4 w-4" />
                  <motion.div
                    className="absolute inset-0 rounded-md bg-primary/10"
                    initial={{ scale: 0, opacity: 0 }}
                    whileHover={{ scale: 1, opacity: 1 }}
                    transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                  />
                </Button>
              </motion.div>
            </div>
          </div>
        </SidebarHeader>

        <SidebarContent>
          <NavConversations conversationGroups={conversationGroups} />
        </SidebarContent>

        <SidebarFooter>{user ? <NavUser user={user} /> : null}</SidebarFooter>
      </Sidebar>

      <CommandDialog
        open={isCommandOpen}
        onOpenChange={setIsCommandOpen}
        title="Quick Actions"
        description="Search for actions and navigate quickly..."
      >
        <CommandInput
          placeholder="Type a command or search..."
          className="border-b-0 focus-visible:ring-0 focus-visible:ring-offset-0"
        />
        <CommandList className="thin-scrollbar">
          <CommandEmpty>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="flex flex-col items-center gap-2 py-4 text-center"
            >
              <Search className="h-8 w-8 text-muted-foreground/50" />
              <p className="text-sm text-muted-foreground">
                No results found. Try something else! 🤔
              </p>
            </motion.div>
          </CommandEmpty>

          <CommandGroup heading="Actions">
            <CommandItem
              onSelect={() => handleCommand('new-chat')}
              className="group relative flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm outline-none transition-colors duration-300 aria-selected:bg-primary/10 hover:bg-accent"
            >
              <Plus className="h-4 w-4" />
              <span>Create New Chat</span>
              <motion.div
                className="absolute right-2 opacity-0 transition-opacity group-hover:opacity-100"
                initial={false}
                animate={{ x: [-5, 0], opacity: [0, 1] }}
                transition={{ duration: 0.2 }}
              >
                <ChevronRight className="h-4 w-4" />
              </motion.div>
            </CommandItem>
            <CommandItem
              onSelect={() => handleCommand('search-conversations')}
              className="group relative flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm outline-none transition-colors duration-300 aria-selected:bg-primary/10 hover:bg-accent"
            >
              <Search className="h-4 w-4" />
              <span>Search Conversations</span>
              <motion.div
                className="absolute right-2 opacity-0 transition-opacity group-hover:opacity-100"
                initial={false}
                animate={{ x: [-5, 0], opacity: [0, 1] }}
                transition={{ duration: 0.2 }}
              >
                <ChevronRight className="h-4 w-4" />
              </motion.div>
            </CommandItem>
            <CommandItem
              onSelect={() => handleCommand('settings')}
              className="group relative flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm outline-none transition-colors duration-300 aria-selected:bg-primary/10 hover:bg-accent"
            >
              <Settings className="h-4 w-4" />
              <span>Settings</span>
              <motion.div
                className="absolute right-2 opacity-0 transition-opacity group-hover:opacity-100"
                initial={false}
                animate={{ x: [-5, 0], opacity: [0, 1] }}
                transition={{ duration: 0.2 }}
              >
                <ChevronRight className="h-4 w-4" />
              </motion.div>
            </CommandItem>
          </CommandGroup>

          <CommandGroup heading="Recent Conversations">
            {mockConversations.slice(0, 5).map((conversation) => (
              <CommandItem
                key={conversation.id}
                onSelect={() => {
                  console.log('Navigating to conversation:', conversation.title)
                  setIsCommandOpen(false)
                }}
                className="group relative flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm outline-none transition-colors duration-300 aria-selected:bg-primary/10 hover:bg-accent"
              >
                <MessageSquare className="h-4 w-4" />
                <span className="flex-1 truncate">{conversation.title}</span>
                <motion.div
                  className="absolute right-2 opacity-0 transition-opacity group-hover:opacity-100"
                  initial={false}
                  animate={{ x: [-5, 0], opacity: [0, 1] }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronRight className="h-4 w-4" />
                </motion.div>
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  )
}
