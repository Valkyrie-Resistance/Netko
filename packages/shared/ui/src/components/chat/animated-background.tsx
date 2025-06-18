import { cn } from "@chad-chat/ui/lib/utils"
import * as React from "react"

/**
 * AnimatedBackground renders the floating particles, shapes and sparkles that were previously
 * embedded in the <PromptSuggestions /> component.  Place it inside a relatively-positioned
 * parent and it will fill the screen.
 */
export function AnimatedBackground({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "absolute inset-0 pointer-events-none overflow-hidden",
        className,
      )}
    >
      {/* Floating particles */}
      {[...Array(10)].map((_, i) => (
        <div
          key={i}
          className="absolute w-2 h-2 bg-gradient-to-r from-primary/40 to-purple-500/40 dark:from-primary/20 dark:to-purple-500/20 rounded-full animate-pulse shadow-lg"
          style={{
            left: `${10 + i * 8}%`,
            top: `${20 + (i % 5) * 15}%`,
            animationDelay: `${i * 0.4}s`,
            animationDuration: `${3 + i * 0.3}s`,
          }}
        />
      ))}

      {/* Geometric shapes */}
      {[...Array(6)].map((_, i) => (
        <div
          key={`shape-${i}`}
          className="absolute w-3 h-3 border border-primary/30 dark:border-primary/20 rotate-45 animate-bounce"
          style={{
            right: `${10 + i * 12}%`,
            top: `${25 + (i % 3) * 25}%`,
            animationDelay: `${i * 0.6}s`,
            animationDuration: `${3.5 + i * 0.2}s`,
          }}
        />
      ))}

      {/* Sparkles */}
      {[...Array(6)].map((_, i) => (
        <div
          key={`sparkle-${i}`}
          className="absolute text-yellow-400/60 dark:text-yellow-400/40 animate-bounce text-xl"
          style={{
            right: `${5 + i * 15}%`,
            top: `${30 + (i % 4) * 12}%`,
            animationDelay: `${i * 0.5}s`,
            animationDuration: `${2 + i * 0.3}s`,
          }}
        >
          ✨
        </div>
      ))}
    </div>
  )
} 