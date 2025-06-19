// Chat and messaging types for the frontend
export interface BackendMessage {
  id: string
  content: string
  role: 'USER' | 'ASSISTANT' | 'SYSTEM'
  createdAt: string
}

export interface ThreadWithMessages {
  thread: {
    id: string
    title?: string | null
    createdAt: string
    updatedAt: string
  }
  messages: BackendMessage[]
}

// SSE streaming response types
export interface SSEToken {
  type: 'token'
  content: string
  messageId?: string
}

export interface SSEDone {
  type: 'done'
  content: string
  messageId?: string
}

export interface SSEError {
  type: 'error'
  content: string
}

export type SSEResponse = SSEToken | SSEDone | SSEError

// tRPC response wrapper for SSE
export interface TRPCSSEResponse {
  result?: {
    data: SSEResponse
  }
}

// Chat store types
export interface AssistantSelection {
  id: string
  name: string
  description?: string | null
  systemPrompt: string
}

export interface LLMModelSelection {
  id: string
  name: string
  displayName: string
  provider: string
} 