import { EASE } from '~/lib/motion'

export type PaginatorScrollTarget =
  | boolean
  | 'auto'
  | 'window'
  | 'parent'
  | string
  | HTMLElement
  | null
  | undefined

export function scrollPageTop(
  root: HTMLElement | null,
  target: PaginatorScrollTarget,
  offset: number | null | undefined,
  behavior: ScrollBehavior,
) {
  if (!import.meta.client || target === false || target === null) return Promise.resolve()

  const resolved = resolveTarget(root, target)
  if (isWindow(resolved)) {
    return scrollToTop(window, 0, behavior)
  }
  if (!resolved) {
    return Promise.resolve()
  }

  const scrollable = findScrollable(resolved)
  if (scrollable && scrollable !== document.documentElement) {
    return scrollToTop(scrollable, 0, behavior)
  }

  const top = Math.max(0, resolved.getBoundingClientRect().top + window.scrollY - offsetOf(offset))
  return scrollToTop(window, top, behavior)
}

function resolveTarget(root: HTMLElement | null, target: PaginatorScrollTarget) {
  if (target === 'window') return window
  if (target instanceof HTMLElement) return target
  if (typeof target === 'string' && target !== 'auto' && target !== 'parent') {
    return document.querySelector<HTMLElement>(target)
  }
  if (!root) return window
  if (target === 'parent') return root.parentElement
  return (
    root.closest<HTMLElement>('[data-paginator-scroll-root]') ??
    root.closest<HTMLElement>('[data-list-wrapper]') ??
    root.parentElement ??
    window
  )
}

function isWindow(value: HTMLElement | Window | null): value is Window {
  return value === window
}

function findScrollable(element: HTMLElement) {
  let current: HTMLElement | null = element
  while (current && current !== document.body) {
    const style = window.getComputedStyle(current)
    if (/(auto|scroll)/.test(style.overflowY) && current.scrollHeight > current.clientHeight) {
      return current
    }
    current = current.parentElement
  }
  return document.documentElement
}

function offsetOf(offset: number | null | undefined) {
  if (offset !== undefined && offset !== null) return offset

  const raw = window
    .getComputedStyle(document.documentElement)
    .getPropertyValue('--app-header-height')
  const header = cssLengthPx(raw)
  return Number.isFinite(header) ? header + 16 : 24
}

function cssLengthPx(raw: string) {
  const value = raw.trim()
  const amount = Number.parseFloat(value)
  if (!value || !Number.isFinite(amount)) return Number.NaN
  if (value.endsWith('rem')) {
    const rootFontSize = Number.parseFloat(
      window.getComputedStyle(document.documentElement).fontSize,
    )
    return Number.isFinite(rootFontSize) ? amount * rootFontSize : Number.NaN
  }

  return amount
}

function scrollToTop(target: Window | HTMLElement, rawTop: number, behavior: ScrollBehavior) {
  const top = clampTop(target, rawTop)
  const current = isWindow(target) ? window.scrollY : target.scrollTop
  if (Math.abs(current - top) < 1) return nextFrame()

  if (behavior !== 'smooth' || prefersReducedMotion()) {
    setTop(target, top)
    return nextFrame()
  }

  return new Promise<void>(resolve => {
    const start = getTop(target)
    const distance = top - start
    const duration = Math.min(520, Math.max(180, Math.abs(distance) * 0.32))
    const startAt = window.performance.now()
    const tick = (now: number) => {
      const progress = Math.min(1, (now - startAt) / duration)
      setTop(target, start + distance * ease(progress))
      if (progress < 1) {
        window.requestAnimationFrame(tick)
        return
      }
      setTop(target, top)
      resolve()
    }
    window.requestAnimationFrame(tick)
  })
}

function nextFrame() {
  return new Promise<void>(resolve => {
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => resolve())
    })
  })
}

function getTop(target: Window | HTMLElement) {
  return isWindow(target) ? window.scrollY : target.scrollTop
}

function setTop(target: Window | HTMLElement, top: number) {
  if (isWindow(target)) {
    window.scrollTo(0, top)
    return
  }
  target.scrollTop = top
}

function clampTop(target: Window | HTMLElement, top: number) {
  const max = isWindow(target)
    ? Math.max(
        0,
        (document.scrollingElement ?? document.documentElement).scrollHeight - window.innerHeight,
      )
    : Math.max(0, target.scrollHeight - target.clientHeight)
  return Math.min(Math.max(0, top), max)
}

function ease(progress: number) {
  const t = Math.min(Math.max(progress, 0), 1)
  const inverse = 1 - t
  return 3 * inverse * inverse * t * EASE[1] + 3 * inverse * t * t * EASE[3] + t * t * t
}

function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}
