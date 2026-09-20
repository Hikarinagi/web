import type { Placement } from '@floating-ui/dom'
import type { DirectiveBinding } from 'vue'
import { clearTooltip, setTooltip } from '~/composables/useTooltip'

const SHOW_DELAY = 60

interface Bound {
  content: string
  placement: Placement
  timer?: ReturnType<typeof setTimeout>
  enter: () => void
  focus: () => void
  leave: () => void
}

function resolveContent(value: unknown): string {
  if (value == null) return ''
  if (typeof value === 'object') return resolveContent((value as { value?: unknown }).value)
  return String(value).trim()
}

function resolveDisabled(value: unknown): boolean {
  return (
    typeof value === 'object' &&
    value != null &&
    Boolean((value as { disabled?: unknown }).disabled)
  )
}

function resolvePlacement(modifiers: DirectiveBinding['modifiers']): Placement {
  if (modifiers.bottom) return 'bottom'
  if (modifiers.left) return 'left'
  if (modifiers.right) return 'right'
  return 'top'
}

function isFocusVisible(el: HTMLElement): boolean {
  try {
    return el.matches(':focus-visible')
  } catch {
    return true
  }
}

export default defineNuxtPlugin(nuxtApp => {
  const bounds = new WeakMap<HTMLElement, Bound>()

  function sync(el: HTMLElement, binding: DirectiveBinding, bound: Bound) {
    bound.content = resolveDisabled(binding.value) ? '' : resolveContent(binding.value)
    bound.placement = resolvePlacement(binding.modifiers)
    if (!bound.content) clearTooltip(el)
  }

  nuxtApp.vueApp.directive('tooltip', {
    mounted(el: HTMLElement, binding) {
      if (window.matchMedia?.('(hover: none)').matches) return
      const bound: Bound = {
        content: '',
        placement: 'top',
        enter() {
          if (!bound.content) return
          clearTimeout(bound.timer)
          bound.timer = setTimeout(() => setTooltip(el, bound.content, bound.placement), SHOW_DELAY)
        },
        focus() {
          if (isFocusVisible(el)) bound.enter()
        },
        leave() {
          clearTimeout(bound.timer)
          clearTooltip(el)
        },
      }
      sync(el, binding, bound)
      bounds.set(el, bound)
      el.addEventListener('mouseenter', bound.enter)
      el.addEventListener('mouseleave', bound.leave)
      el.addEventListener('focus', bound.focus)
      el.addEventListener('blur', bound.leave)
      el.addEventListener('click', bound.leave)
    },
    updated(el: HTMLElement, binding) {
      const bound = bounds.get(el)
      if (bound) sync(el, binding, bound)
    },
    beforeUnmount(el: HTMLElement) {
      const bound = bounds.get(el)
      if (!bound) return
      clearTimeout(bound.timer)
      clearTooltip(el)
      el.removeEventListener('mouseenter', bound.enter)
      el.removeEventListener('mouseleave', bound.leave)
      el.removeEventListener('focus', bound.focus)
      el.removeEventListener('blur', bound.leave)
      el.removeEventListener('click', bound.leave)
      bounds.delete(el)
    },
  })
})
