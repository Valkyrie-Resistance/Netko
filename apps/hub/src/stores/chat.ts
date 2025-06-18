import type { Assistant } from '@chad-chat/brain-domain'
import type { LLMModel } from '@chad-chat/brain-domain'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface ChatState {
  // Current selections - the holy trinity of chat configuration 🏆
  currentAssistant: Assistant | null
  currentLLMModel: LLMModel | null
  isWebSearchEnabled: boolean

  // Actions - because mutations are where the magic happens ✨
  setCurrentAssistant: (assistant: Assistant | null) => void
  setCurrentLLMModel: (model: LLMModel | null) => void
  toggleWebSearch: () => void
  setWebSearchEnabled: (enabled: boolean) => void

  // Utility functions - the cherry on top 🍒
  resetChatConfig: () => void
  hasChatConfig: () => boolean
}

/**
 * Chat store - Where all your chatting dreams come true! 🦸‍♀️
 *
 * This bad boy keeps track of:
 * - Which AI assistant you're vibing with
 * - What LLM model is powering your conversations
 * - Whether you want the internet's infinite wisdom (web search)
 *
 * Persisted to localStorage because nobody likes starting from scratch! 💾
 */
export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      // Initial state - clean slate, infinite possibilities ✨
      currentAssistant: null,
      currentLLMModel: null,
      isWebSearchEnabled: false,

      // Assistant management - choose your digital companion wisely 🤖
      setCurrentAssistant: (assistant) => set({ currentAssistant: assistant }),

      // LLM model management - the brain behind the operation 🧠
      setCurrentLLMModel: (model) => set({ currentLLMModel: model }),

      // Web search toggle - when you need the power of the internet 🌐
      toggleWebSearch: () => set((state) => ({ isWebSearchEnabled: !state.isWebSearchEnabled })),

      setWebSearchEnabled: (enabled) => set({ isWebSearchEnabled: enabled }),

      // Nuclear option - reset everything to defaults 💥
      resetChatConfig: () =>
        set({
          currentAssistant: null,
          currentLLMModel: null,
          isWebSearchEnabled: false,
        }),

      // Check if we have a complete chat configuration 🎯
      hasChatConfig: () => {
        const state = get()
        return !!(state.currentAssistant && state.currentLLMModel)
      },
    }),
    {
      name: 'chad-chat-store', // localStorage key - keeping it branded! 😎
      partialize: (state) => ({
        // Only persist the essentials - no need to bloat localStorage
        currentAssistant: state.currentAssistant,
        currentLLMModel: state.currentLLMModel,
        isWebSearchEnabled: state.isWebSearchEnabled,
      }),
    },
  ),
)

// Export individual selectors for those who like their hooks granular 🔍
export const useCurrentAssistant = () => useChatStore((state) => state.currentAssistant)
export const useCurrentLLMModel = () => useChatStore((state) => state.currentLLMModel)
export const useWebSearchEnabled = () => useChatStore((state) => state.isWebSearchEnabled)

// Pro tip: Use these selectors to avoid unnecessary re-renders! 🚀
