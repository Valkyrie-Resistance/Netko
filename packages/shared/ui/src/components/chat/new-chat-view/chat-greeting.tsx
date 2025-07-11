import { useEffect, useState } from 'react'
import { ChatGreetingProps } from './definitions/types'

export function ChatGreeting({ userName }: ChatGreetingProps) {
  const [greetingVisible, setGreetingVisible] = useState(false)
  const [typewriterText, setTypewriterText] = useState('')
  const [showSubtext, setShowSubtext] = useState(false)
  const [isTyping, setIsTyping] = useState(true)

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 17) return 'Good afternoon'
    return 'Good evening'
  }

  const fullGreeting = `${getGreeting()}, ${userName}! 👋`

  // Typewriter effect for greeting
  useEffect(() => {
    setGreetingVisible(true)
    let currentIndex = 0
    const typewriterInterval = setInterval(() => {
      if (currentIndex <= fullGreeting.length) {
        setTypewriterText(fullGreeting.slice(0, currentIndex))
        currentIndex++
      } else {
        clearInterval(typewriterInterval)
        // Hide the caret once typing is finished
        setIsTyping(false)
        // Show subtext shortly after typing completes
        setTimeout(() => setShowSubtext(true), 400)
      }
    }, 50)

    return () => clearInterval(typewriterInterval)
  }, [fullGreeting])

  return (
    <div className="text-center space-y-2 relative z-10">
      <div
        className={`transition-transform duration-1000 will-change-transform will-change-opacity transform-gpu ${
          greetingVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
        }`}
        style={{
          willChange: 'transform, opacity',
          isolation: 'isolate',
        }}
      >
        <h1
          className="text-4xl font-bold relative inline-block py-4 transform-gpu"
          style={{
            willChange: 'transform',
          }}
        >
          <span className="relative bg-gradient-to-r from-primary via-purple-500 to-primary/80 bg-clip-text text-transparent">
            {typewriterText}
            {isTyping && (
              <span className="absolute -right-1 top-0 w-0.5 h-full bg-primary motion-safe:animate-pulse" />
            )}
          </span>
        </h1>
      </div>

      <div
        className={`transition-all duration-700 delay-300 ${
          showSubtext ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
        }`}
      >
        <p className="text-lg text-muted-foreground relative">
          <span className="relative z-10">How can I help you today?</span>
        </p>
      </div>
    </div>
  )
} 