import type { RouterConfig } from 'nuxt/schema'
import { START_LOCATION } from 'vue-router'

type Position = { left: number; top: number }
type Route = Parameters<NonNullable<RouterConfig['scrollBehavior']>>[0]

function hashTarget(hash: string) {
  try {
    const el = document.querySelector(hash)
    const margin = el
      ? (Number.parseFloat(getComputedStyle(el).scrollMarginTop) || 0) +
        (Number.parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 0)
      : 0
    return { el: hash, top: margin }
  } catch {
    return { el: hash, top: 0 }
  }
}

function restore(position: Position) {
  return new Promise<Position | false>(resolve => {
    const root = document.documentElement
    const fits = () => root.scrollHeight - window.innerHeight >= position.top
    if (fits()) return resolve(position)
    const settle = (result: Position | false) => {
      observer.stop()
      off()
      clearTimeout(timer)
      resolve(result)
    }
    const observer = useResizeObserver(document.body, () => {
      if (fits()) settle(position)
    })
    const off = useEventListener(window, ['wheel', 'touchstart', 'keydown'], () => settle(false), {
      passive: true,
    })
    const timer = setTimeout(() => settle(position), 3000)
  })
}

function target(to: Route, saved: Position | null) {
  if (saved) return restore(saved)
  if (to.hash) return hashTarget(to.hash)
  return { left: 0, top: 0 }
}

export default {
  scrollBehavior(to, from, savedPosition) {
    if (to.path.replace(/\/$/, '') === from.path.replace(/\/$/, '')) {
      if (from.hash && !to.hash) return savedPosition ?? { left: 0, top: 0 }
      if (to.hash) return hashTarget(to.hash)
      return false
    }
    const toTop =
      typeof to.meta.scrollToTop === 'function'
        ? to.meta.scrollToTop(to, from)
        : to.meta.scrollToTop
    if (!savedPosition && toTop === false) return false
    if (from === START_LOCATION) return target(to, savedPosition)

    const nuxtApp = useNuxtApp()
    const router = useRouter()
    return new Promise(resolve => {
      nuxtApp.hooks.hookOnce('page:loading:end', async () => {
        await nuxtApp['~transitionPromise']
        requestAnimationFrame(() => {
          if (router.currentRoute.value.fullPath !== to.fullPath) return resolve(false)
          resolve(target(to, savedPosition))
        })
      })
    })
  },
} satisfies RouterConfig
