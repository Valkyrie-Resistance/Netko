import { cn } from '@netko/ui/lib/utils'
import * as React from 'react'

// Configuration for performance optimization
const ANIMATION_CONFIG = {
  PARTICLE_COUNT: 6,        // Reduced from 10
  SHAPE_COUNT: 4,           // Reduced from 6
  SPARKLE_COUNT: 6,         // Reduced from 8
  UPDATE_THRESHOLD: 16,     // 60fps threshold
} as const

export function AnimatedBackground({
  className,
  durationMs = 5000,
  fadeOutMs = 400,
}: {
  className?: string
  durationMs?: number
  fadeOutMs?: number
}) {
  const [isAnimating, setIsAnimating] = React.useState(true)
  const [isVisible, setIsVisible] = React.useState(true)
  const animationRef = React.useRef<number>()
  const containerRef = React.useRef<HTMLDivElement>(null)

  // Intersection Observer for performance - only animate when visible
  React.useEffect(() => {
    if (!containerRef.current) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting)
      },
      { threshold: 0.1 }
    )

    observer.observe(containerRef.current)

    return () => observer.disconnect()
  }, [])

  // Enhanced timer with cleanup
  React.useEffect(() => {
    if (!isVisible) return

    const stopTimer = window.setTimeout(() => {
      setIsAnimating(false)
    }, durationMs)

    return () => {
      window.clearTimeout(stopTimer)
    }
  }, [durationMs, isVisible])

  // Optimized particles with reduced count and better memoization
  const particles = React.useMemo(
    () => {
      if (!isVisible) return []
      
      return [...Array(ANIMATION_CONFIG.PARTICLE_COUNT)].map((_, i) => (
        <div
          key={`particle-${i}`}
          className={cn(
            'absolute w-2 h-2 bg-gradient-to-r from-primary/30 to-purple-500/30 dark:from-primary/15 dark:to-purple-500/15 rounded-full animate-pulse',
          )}
          style={{
            left: `${15 + i * 12}%`,
            top: `${25 + (i % 3) * 20}%`,
            animationDelay: `${i * 0.5}s`,
            animationDuration: `${2.5 + i * 0.2}s`,
            animationPlayState: isAnimating ? 'running' : 'paused',
            willChange: isAnimating ? 'transform, opacity' : 'auto',
          }}
        />
      ))
    },
    [isAnimating, isVisible],
  )

  // Optimized shapes with reduced count
  const shapes = React.useMemo(
    () => {
      if (!isVisible) return []
      
      return [...Array(ANIMATION_CONFIG.SHAPE_COUNT)].map((_, i) => (
        <div
          key={`shape-${i}`}
          className={cn(
            'absolute w-3 h-3 border border-primary/20 dark:border-primary/10 rotate-45 animate-bounce',
          )}
          style={{
            right: `${15 + i * 15}%`,
            top: `${30 + (i % 2) * 30}%`,
            animationDelay: `${i * 0.7}s`,
            animationDuration: `${2 + i * 0.3}s`,
            animationPlayState: isAnimating ? 'running' : 'paused',
            willChange: isAnimating ? 'transform' : 'auto',
          }}
        />
      ))
    },
    [isAnimating, isVisible],
  )

  // Optimized sparkles with reduced count and performance improvements
  const sparkles = React.useMemo(
    () => {
      if (!isVisible) return []
      
      return [...Array(ANIMATION_CONFIG.SPARKLE_COUNT)].map((_, i) => (
        <div
          key={`sparkle-${i}`}
          className={cn(
            'absolute text-primary/40 dark:text-primary/20 select-none pointer-events-none animate-pulse',
            'text-sm font-light'
          )}
          style={{
            left: `${20 + i * 10}%`,
            bottom: `${20 + (i % 3) * 20}%`,
            animationDelay: `${i * 0.4}s`,
            animationDuration: `${2.5 + i * 0.2}s`,
            animationPlayState: isAnimating ? 'running' : 'paused',
            willChange: isAnimating ? 'opacity' : 'auto',
          }}
        >
          ✨
        </div>
      ))
    },
    [isAnimating, isVisible],
  )

  // Performance monitoring (development only)
  React.useEffect(() => {
    if (process.env.NODE_ENV !== 'development' || !isAnimating) return

    let frameCount = 0
    let lastTime = performance.now()

    const checkPerformance = () => {
      frameCount++
      const currentTime = performance.now()
      
      if (currentTime - lastTime >= 1000) { // Check every second
        const fps = frameCount
        frameCount = 0
        lastTime = currentTime

        if (fps < 30) { // Warning if FPS drops below 30
          console.warn('🐌 AnimatedBackground: Low FPS detected:', fps)
        }
      }

      if (isAnimating) {
        animationRef.current = requestAnimationFrame(checkPerformance)
      }
    }

    animationRef.current = requestAnimationFrame(checkPerformance)

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [isAnimating])

  // Early return if not visible (performance optimization)
  if (!isVisible) {
    return (
      <div 
        ref={containerRef}
        className={cn('absolute inset-0 pointer-events-none', className)}
      />
    )
  }

  return (
    <div 
      ref={containerRef}
      className={cn(
        'absolute inset-0 pointer-events-none overflow-hidden',
        // Transition for smooth fade out
        isAnimating 
          ? 'opacity-100 transition-opacity duration-300' 
          : `opacity-0 transition-opacity duration-[${fadeOutMs}ms]`,
        className
      )}
      style={{
        // CSS containment for better performance
        contain: 'layout style paint',
      }}
    >
      {particles}
      {shapes}
      {sparkles}
    </div>
  )
}