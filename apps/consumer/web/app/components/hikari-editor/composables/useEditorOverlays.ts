import { shallowRef, type ShallowRef } from 'vue'

interface ActiveOverlay {
  id: string
  anchor: HTMLElement
  props: Record<string, unknown>
  ownerId?: symbol
}

// shallowRef:props 里嵌套的 Ref 不能被 reactive 自动解包,否则下游组件拿到 unwrap 后的值。
const active: ShallowRef<ActiveOverlay | null> = shallowRef(null)

export function useEditorOverlays() {
  function openOverlay(
    id: string,
    anchor: HTMLElement,
    props: Record<string, unknown> = {},
    ownerId?: symbol,
  ) {
    active.value = { id, anchor, props, ownerId }
  }
  function closeOverlay(id?: string) {
    if (id && active.value?.id !== id) return
    active.value = null
  }
  return { active, openOverlay, closeOverlay }
}
