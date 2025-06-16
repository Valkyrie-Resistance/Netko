'use client'

import {
  Calendar,
  Clock,
  History,
  type LucideIcon,
  MessageSquare,
  MoreHorizontal,
  Share,
  Trash2,
} from 'lucide-react'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@chad-chat/ui/components/shadcn/dropdown-menu'
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@chad-chat/ui/components/shadcn/sidebar'

type Conversation = {
  id: string
  title: string
  timestamp: Date
  preview: string
}

type ConversationGroup = {
  label: string
  icon: LucideIcon
  conversations: Conversation[]
}

export function NavConversations({
  conversationGroups,
}: {
  conversationGroups: ConversationGroup[]
}) {
  const { isMobile } = useSidebar()

  return (
    <>
      {conversationGroups.map(
        (group) =>
          group.conversations.length > 0 && (
            <SidebarGroup key={group.label} className="group-data-[collapsible=icon]:hidden">
              <SidebarGroupLabel className="flex items-center gap-2 text-sidebar-foreground/70">
                <group.icon className="size-4" />
                {group.label}
              </SidebarGroupLabel>
              <SidebarMenu>
                {group.conversations.map((conversation) => (
                  <SidebarMenuItem key={conversation.id}>
                    <SidebarMenuButton asChild className="h-auto py-2">
                      <a
                        href={`/chat/${conversation.id}`}
                        className="flex flex-col items-start gap-1 w-full"
                      >
                        <span className="font-medium text-sm text-sidebar-foreground line-clamp-2 text-left">
                          {conversation.title}
                        </span>
                        <span className="text-xs text-sidebar-foreground/60 line-clamp-1 text-left">
                          {conversation.preview}
                        </span>
                      </a>
                    </SidebarMenuButton>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <SidebarMenuAction showOnHover>
                          <MoreHorizontal />
                          <span className="sr-only">More</span>
                        </SidebarMenuAction>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        className="w-48"
                        side={isMobile ? 'bottom' : 'right'}
                        align={isMobile ? 'end' : 'start'}
                      >
                        <DropdownMenuItem>
                          <MessageSquare className="text-muted-foreground" />
                          <span>Open Chat</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Share className="text-muted-foreground" />
                          <span>Share Chat</span>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>
                          <Trash2 className="text-muted-foreground" />
                          <span>Delete Chat</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroup>
          ),
      )}
    </>
  )
}

// Helper function to group conversations by time periods
export function groupConversationsByTime(conversations: Conversation[]): ConversationGroup[] {
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000)
  const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
  const lastMonth = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)

  return [
    {
      label: 'Today',
      icon: Clock,
      conversations: conversations.filter((conv) => conv.timestamp >= today),
    },
    {
      label: 'Yesterday',
      icon: History,
      conversations: conversations.filter(
        (conv) => conv.timestamp >= yesterday && conv.timestamp < today,
      ),
    },
    {
      label: 'Last Week',
      icon: Calendar,
      conversations: conversations.filter(
        (conv) => conv.timestamp >= lastWeek && conv.timestamp < yesterday,
      ),
    },
    {
      label: 'Last Month',
      icon: MessageSquare,
      conversations: conversations.filter(
        (conv) => conv.timestamp >= lastMonth && conv.timestamp < lastWeek,
      ),
    },
  ]
}
