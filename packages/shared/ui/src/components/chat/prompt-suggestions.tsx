import { type PromptSuggestionsProps } from "@chad-chat/ui/components/chat/definitions/types"
import { useEffect, useRef, useState } from "react"

export function PromptSuggestions({
  userName,
  append,
  suggestions,
}: PromptSuggestionsProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [isHovered, setIsHovered] = useState(false)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)
  const [greetingVisible, setGreetingVisible] = useState(false)
  const [typewriterText, setTypewriterText] = useState("")
  const [showSubtext, setShowSubtext] = useState(false)
  const [showEmoji, setShowEmoji] = useState(false)

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return "Good morning"
    if (hour < 17) return "Good afternoon"
    return "Good evening"
  }

  const fullGreeting = `${getGreeting()}, ${userName}!`

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
        // Show emoji after typewriter completes
        setTimeout(() => setShowEmoji(true), 200)
        // Show subtext after emoji appears
        setTimeout(() => setShowSubtext(true), 600)
      }
    }, 50)

    return () => clearInterval(typewriterInterval)
  }, [fullGreeting])

  // Auto-scroll functionality
  useEffect(() => {
    if (!scrollRef.current || isHovered) return

    const container = scrollRef.current
    const scrollStep = 5 // pixels per step (increased for visibility)
    const scrollDelay = 100 // milliseconds between steps (faster)
    const pauseTime = 2000 // pause at each suggestion (shorter)

    let isPaused = false
    let pauseTimeout: NodeJS.Timeout

    const autoScroll = () => {
      if (isPaused || isHovered) return

      const maxScroll = container.scrollWidth - container.clientWidth
      
      if (container.scrollLeft >= maxScroll) {
        // Reset to beginning when reaching the end
        container.scrollLeft = 0
        isPaused = true
        pauseTimeout = setTimeout(() => {
          isPaused = false
        }, pauseTime)
      } else {
        container.scrollLeft += scrollStep
      }
    }

    const interval = setInterval(autoScroll, scrollDelay)

    return () => {
      clearInterval(interval)
      if (pauseTimeout) clearTimeout(pauseTimeout)
    }
  }, [isHovered])

  // Update scroll button states and active dot
  const updateScrollState = () => {
    if (!scrollRef.current) return
    const container = scrollRef.current
    setCanScrollLeft(container.scrollLeft > 0)
    setCanScrollRight(container.scrollLeft < container.scrollWidth - container.clientWidth)
    
  }

  useEffect(() => {
    const container = scrollRef.current
    if (!container) return

    const handleScroll = () => updateScrollState()
    container.addEventListener('scroll', handleScroll)
    updateScrollState()

    return () => container.removeEventListener('scroll', handleScroll)
  }, [suggestions.length])

  return (
    <div className="flex flex-col h-full pt-16 pb-8 overflow-hidden relative">
      {/* Enhanced animated background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Floating particles */}
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-gradient-to-r from-primary/60 to-purple-500/60 dark:from-primary/40 dark:to-purple-500/40 rounded-full animate-pulse shadow-lg"
            style={{
              left: `${15 + i * 12}%`,
              top: `${25 + i * 10}%`,
              animationDelay: `${i * 0.4}s`,
              animationDuration: `${2.5 + i * 0.3}s`,
            }}
          />
        ))}
        
        {/* Floating geometric shapes */}
        {[...Array(5)].map((_, i) => (
          <div
            key={`shape-${i}`}
            className="absolute w-3 h-3 border border-primary/50 dark:border-primary/30 rotate-45 animate-bounce"
            style={{
              right: `${20 + i * 15}%`,
              top: `${20 + i * 15}%`,
              animationDelay: `${i * 0.6}s`,
              animationDuration: `${3 + i * 0.2}s`,
            }}
          />
        ))}
        
        {/* Enhanced sparkles */}
        {[...Array(6)].map((_, i) => (
          <div
            key={`sparkle-${i}`}
            className="absolute text-yellow-400/80 dark:text-yellow-400/60 animate-bounce drop-shadow-md text-xl"
            style={{
              right: `${8 + i * 18}%`,
              top: `${30 + i * 8}%`,
              animationDelay: `${i * 0.8}s`,
              animationDuration: `${1.8 + i * 0.3}s`,
            }}
          >
            ✨
          </div>
        ))}
        
        {/* Large floating circles */}
        {[...Array(3)].map((_, i) => (
          <div
            key={`circle-${i}`}
            className="absolute w-4 h-4 bg-gradient-to-br from-blue-400/30 to-purple-400/30 dark:from-blue-400/20 dark:to-purple-400/20 rounded-full animate-pulse"
            style={{
              left: `${30 + i * 25}%`,
              top: `${40 + i * 5}%`,
              animationDelay: `${i * 1.2}s`,
              animationDuration: `${4 + i * 0.5}s`,
            }}
          />
        ))}
      </div>

      {/* Greeting Section */}
      <div className="text-center space-y-2 relative z-10">
        <div 
          className={`transition-all duration-1000 ${
            greetingVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
          }`}
        >
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary via-purple-500 to-primary/80 bg-clip-text text-transparent relative inline-block py-4" >
            <span className="relative">
              {typewriterText}
              <span className="absolute -right-1 top-0 w-0.5 h-full bg-primary animate-pulse" />
            </span>
            {showEmoji && (
              <span 
                className="ml-3 inline-block animate-bounce drop-shadow-sm"
                style={{ animationDuration: '1s' }}
              >
                👋
              </span>
            )}
          </h1>
        </div>
        
        <div 
          className={`transition-all duration-700 delay-300 ${
            showSubtext ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
          }`}
        >
          <p className="text-lg text-muted-foreground relative">
            <span className="relative z-10">How can I help you today?</span>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/15 dark:via-primary/8 to-transparent animate-pulse" />
          </p>
        </div>

        {/* Enhanced floating code symbols */}
        <div 
          className="absolute -top-4 -left-8 text-primary/70 dark:text-primary/50 text-2xl animate-bounce drop-shadow-md"
          style={{ 
            animationDelay: '0s',
            animationDuration: '3s',
            transform: 'translateY(0px) rotate(0deg)',
          }}
        >
          &lt;/&gt;
        </div>
        <div 
          className="absolute -top-2 -right-12 text-orange-500/80 dark:text-orange-400/60 text-xl animate-bounce drop-shadow-md" 
          style={{ 
            animationDelay: '1s',
            animationDuration: '3s',
            transform: 'translateY(0px) rotate(0deg)',
          }}
        >
          🐱
        </div>
        <div 
          className="absolute top-8 left-4 text-yellow-500/80 dark:text-yellow-400/60 text-lg animate-bounce drop-shadow-md" 
          style={{ 
            animationDelay: '0.5s',
            animationDuration: '3s',
            transform: 'translateY(0px) rotate(0deg)',
          }}
        >
          ⚡
        </div>
      </div>

      {/* Spacer to push suggestions to bottom */}
      <div className="flex-1" />

      {/* Enhanced Suggestions Section */}
      <div 
        className={`transition-all duration-1000 delay-700 ${
          showSubtext ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
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
            {/* Enhanced decorative underline */}
            <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-32 h-0.5 bg-gradient-to-r from-transparent via-primary/60 to-transparent dark:via-primary/40 animate-pulse" />
          </div>
          
          {/* Enhanced floating decorative elements around the title */}
          <div className="absolute -top-2 -left-4 text-blue-600/70 dark:text-blue-400/40 text-sm animate-bounce">
            ✦
          </div>
          <div className="absolute -top-2 -right-4 text-purple-600/70 dark:text-purple-400/40 text-sm animate-bounce" style={{ animationDelay: '0.5s' }}>
            ✦
          </div>
          <div className="absolute -bottom-2 left-8 text-green-600/70 dark:text-green-400/40 text-sm animate-bounce" style={{ animationDelay: '1s' }}>
            ✦
          </div>
          <div className="absolute -bottom-2 right-8 text-pink-600/70 dark:text-pink-400/40 text-sm animate-bounce" style={{ animationDelay: '1.5s' }}>
            ✦
          </div>
        </div>
        
        {/* Carousel container with extra space for hover effects */}
          <div 
            className="relative mx-auto overflow-hidden w-full"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            {/* Enhanced fade overlays */}
            <div 
              className={`absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-background via-background/95 to-transparent z-10 pointer-events-none transition-opacity duration-300 ${
                canScrollLeft ? 'opacity-100' : 'opacity-0'
              }`}
            />
            
            <div 
              className={`absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-background via-background/95 to-transparent z-10 pointer-events-none transition-opacity duration-300 ${
                canScrollRight ? 'opacity-100' : 'opacity-0'
              }`}
            />

            {/* Scrollable container */}
            <div
              ref={scrollRef}
              className="flex gap-3 overflow-x-auto scroll-smooth [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] px-2 py-4"
            >
              {suggestions.map((suggestion, index) => (
                <button
                  key={suggestion}
                  onClick={() => append({ role: "user", content: suggestion })}
                  className="group relative flex-shrink-0 w-80 h-auto rounded-2xl border border-border/60 bg-card/60 backdrop-blur-sm p-5 text-left shadow-sm transition-all duration-200 hover:shadow-lg hover:shadow-primary/10 hover:border-primary/40 hover:bg-card/90 hover:-translate-y-1 hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50"
                  style={{
                    animationDelay: `${800 + index * 100}ms`,
                  }}
                >
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/15 dark:bg-primary/10 flex items-center justify-center group-hover:bg-primary/25 dark:group-hover:bg-primary/20 transition-colors">
                      <span className="text-primary font-semibold text-sm">
                        {index + 1}
                      </span>
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
        </div>
    </div>
  )
}
