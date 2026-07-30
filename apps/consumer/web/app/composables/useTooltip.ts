import type { Placement } from '@floating-ui/dom'
import type { Ref, ShallowRef } from 'vue'

interface TooltipStore {
  target: ShallowRef<HTMLElement | null>
  content: Ref<string>
  placement: Ref<Placement>
  open: Ref<boolean>
}

let store: TooltipStore | null = null

function get(): TooltipStore {
  if (!store) {
    store = {
      target: shallowRef(null),
      content: ref(''),
      placement: ref<Placement>('top'),
      open: ref(false),
    }
  }
  return store
}

export function useTooltip(): TooltipStore {
  return get()
}

export function setTooltip(el: HTMLElement, content: string, placement: Placement) {
  const s = get()
  s.target.value = el
  s.content.value = content
  s.placement.value = placement
  s.open.value = true
}

export function clearTooltip(el: HTMLElement) {
  const s = get()
  if (s.target.value === el) s.open.value = false
}
