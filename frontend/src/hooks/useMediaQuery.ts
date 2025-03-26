import { useState, useEffect } from 'react'

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false)

  useEffect(() => {
    const media = window.matchMedia(query)
    
    // Update the state initially
    setMatches(media.matches)

    // Create a listener function
    const listener = (event: MediaQueryListEvent) => {
      setMatches(event.matches)
    }

    // Add the listener to begin watching for changes
    media.addEventListener('change', listener)

    // Clean up function
    return () => {
      media.removeEventListener('change', listener)
    }
  }, [query]) // Only re-run effect if query changes

  return matches
}

// Predefined media queries
export const useIsMobile = () => useMediaQuery('(max-width: 767px)')
export const useIsTablet = () => useMediaQuery('(min-width: 768px) and (max-width: 1023px)')
export const useIsDesktop = () => useMediaQuery('(min-width: 1024px)')
export const useIsLargeScreen = () => useMediaQuery('(min-width: 1280px)')
export const useIsDarkMode = () => useMediaQuery('(prefers-color-scheme: dark)')
export const useReducedMotion = () => useMediaQuery('(prefers-reduced-motion: reduce)') 