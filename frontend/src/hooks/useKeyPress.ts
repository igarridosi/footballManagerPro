import { useState, useEffect } from 'react'

type KeyHandler = (event: KeyboardEvent) => void

export function useKeyPress(
  targetKey: string,
  onKeyDown?: KeyHandler,
  onKeyUp?: KeyHandler
): boolean {
  // State for keeping track of whether key is pressed
  const [keyPressed, setKeyPressed] = useState(false)

  useEffect(() => {
    // If pressed key is our target key then set to true
    const downHandler = (event: KeyboardEvent) => {
      if (event.key === targetKey) {
        setKeyPressed(true)
        onKeyDown?.(event)
      }
    }

    // If released key is our target key then set to false
    const upHandler = (event: KeyboardEvent) => {
      if (event.key === targetKey) {
        setKeyPressed(false)
        onKeyUp?.(event)
      }
    }

    window.addEventListener('keydown', downHandler)
    window.addEventListener('keyup', upHandler)

    // Remove event listeners on cleanup
    return () => {
      window.removeEventListener('keydown', downHandler)
      window.removeEventListener('keyup', upHandler)
    }
  }, [targetKey, onKeyDown, onKeyUp]) // Only re-run effect if key or handlers change

  return keyPressed
}

// Predefined key combinations
export const useEscapeKey = (handler: KeyHandler) => {
  useKeyPress('Escape', handler)
}

export const useEnterKey = (handler: KeyHandler) => {
  useKeyPress('Enter', handler)
}

export const useArrowKeys = (
  onUp?: KeyHandler,
  onDown?: KeyHandler,
  onLeft?: KeyHandler,
  onRight?: KeyHandler
) => {
  useKeyPress('ArrowUp', onUp)
  useKeyPress('ArrowDown', onDown)
  useKeyPress('ArrowLeft', onLeft)
  useKeyPress('ArrowRight', onRight)
}

export const useDeleteKey = (handler: KeyHandler) => {
  useKeyPress('Delete', handler)
}

export const useModifierCombo = (
  key: string,
  handler: KeyHandler,
  modifier: 'ctrlKey' | 'altKey' | 'shiftKey' | 'metaKey' = 'ctrlKey'
) => {
  useEffect(() => {
    const downHandler = (event: KeyboardEvent) => {
      if (event.key === key && event[modifier]) {
        event.preventDefault()
        handler(event)
      }
    }

    window.addEventListener('keydown', downHandler)
    return () => {
      window.removeEventListener('keydown', downHandler)
    }
  }, [key, handler, modifier])
} 