export interface ChatGreetingProps {
  userName: string
}

export interface PromptSuggestionsProps {
  suggestions: string[]
  append: (message: { role: 'user'; content: string }) => void
}

export interface ChatViewProps {
  userName: string
  suggestions: string[]
  append: (message: { role: 'user'; content: string }) => void
} 