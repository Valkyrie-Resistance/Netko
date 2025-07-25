import { useEffect, useState } from 'react'
import { PromptSuggestionsProps } from './definitions/types'

export function PromptSuggestions({ suggestions, append }: PromptSuggestionsProps) {
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [showGlowingLine, setShowGlowingLine] = useState(true)

  // Show suggestions after a delay to coordinate with the greeting
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSuggestions(true)
    }, 1000) // Delay to match the greeting animation timing

    return () => clearTimeout(timer)
  }, [])

  // Stop the glowing line animation after 5 seconds to save GPU
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowGlowingLine(false)
    }, 5000)

    return () => clearTimeout(timer)
  }, [])

  return (
    <div
      className={`transition-all duration-1000 delay-700 ${
        showSuggestions ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
      }`}
    >
      {/* Enhanced section header */}
      <div className="text-center pb-6 relative">
        <div className="relative inline-block">
          <h2 className="text-xl font-bold relative px-6 py-2">
            <span className="relative bg-gradient-to-r from-primary/90 via-purple-600 to-primary/90 dark:from-primary dark:via-purple-500 dark:to-primary bg-clip-text text-transparent flex items-center justify-center gap-2">
              <span className="text-primary">🚀</span>
              Try these prompts to get started
              <span className="text-primary">💫</span>
            </span>
          </h2>
          {/* Enhanced decorative underline - stops animating after 5 seconds */}
          <div className={`absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-32 h-0.5 bg-gradient-to-r from-transparent via-primary/60 to-transparent dark:via-primary/40 ${showGlowingLine ? 'motion-safe:animate-pulse' : ''}`} />
        </div>
      </div>

      {/* Static suggestions grid */}
      <div className="mx-auto w-full px-2 py-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {suggestions.map((suggestion, index) => (
          <button
            key={suggestion}
            onClick={() => append({ role: 'user', content: suggestion })}
            className="group relative w-full h-auto rounded-2xl border border-border/60 bg-card/60 backdrop-blur-sm p-5 text-left shadow-sm transition-all duration-200 hover:shadow-lg hover:shadow-primary/10 hover:border-primary/40 hover:bg-card/90 hover:-translate-y-1 hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50"
            style={{ animationDelay: `${800 + index * 100}ms` }}
          >
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/15 dark:bg-primary/10 flex items-center justify-center group-hover:bg-primary/25 dark:group-hover:bg-primary/20 transition-colors">
                <span className="text-primary font-semibold text-sm">{index + 1}</span>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground leading-relaxed">
                  {suggestion}
                </p>
              </div>
            </div>

            {/* Enhanced hover effect */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-primary/10 dark:from-primary/6 via-purple-500/5 dark:via-purple-500/3 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
          </button>
        ))}
      </div>
    </div>
  )
} 