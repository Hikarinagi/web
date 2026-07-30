import type { $Transition } from 'motion-v'

export const EASE: [number, number, number, number] = [0.2, 0.8, 0.2, 1]
export const EASE_CSS = `cubic-bezier(${EASE.join(', ')})`

export const TRANSITION_FAST: $Transition = {
  duration: 0.14,
  ease: EASE,
}

export const TRANSITION: $Transition = {
  duration: 0.2,
  ease: EASE,
}
