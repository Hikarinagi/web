import type { Component, Ref } from 'vue'
import { breakpointsTailwind } from '@vueuse/core'
import type Popover from 'primevue/popover'
import { EDITOR_PLUGIN_CONTEXT_KEY, type EditorPlugin } from '../plugins/types'
import { useEditorOverlays } from './useEditorOverlays'

const NESTED_OVERLAY_SELECTOR = '[data-pc-section="overlay"], [data-pc-section="panel"]'

export function useOverlayHost(
  plugins: () => EditorPlugin[],
  popoverRef: Readonly<Ref<InstanceType<typeof Popover> | null>>,
) {
  const { active, closeOverlay } = useEditorOverlays()

  // 本 host 所属编辑器实例的归属标识(由所在编辑器 provide)。host 只认属于自己实例(或未归属)的
  // 弹层;别的编辑器打开的弹层一律视而不见 —— 同页多编辑器各管各的,无需上层 gate。
  const ownerId = inject(EDITOR_PLUGIN_CONTEXT_KEY, null)?.ownerId
  const mineActive = computed(() => {
    const cur = active.value
    if (!cur) return null
    return !cur.ownerId || cur.ownerId === ownerId ? cur : null
  })

  const breakpoints = useBreakpoints(breakpointsTailwind)
  const isMobile = breakpoints.smaller('md')

  // keepalive 下被缓存的 host(如首页内联编辑器)deactivate 后不再响应共享的 active 单例,
  // 否则会与当前活跃页的编辑器抢 overlay 并残留 document 监听。
  const activated = ref(true)
  onActivated(() => {
    activated.value = true
  })
  onDeactivated(() => {
    activated.value = false
    document.removeEventListener('mousedown', onDocumentMouseDown, true)
  })

  const overlayMap = computed(() => {
    const m = new Map<string, Component>()
    for (const p of plugins()) {
      if (!p.overlays) continue
      for (const [id, comp] of Object.entries(p.overlays)) m.set(id, comp)
    }
    return m
  })

  const renderedComp = shallowRef<Component | null>(null)
  const renderedProps = shallowRef<Record<string, unknown>>({})
  const overlayKey = ref(0)

  watch(mineActive, cur => {
    if (!activated.value) return
    if (cur) {
      const comp = overlayMap.value.get(cur.id)
      if (!comp) return
      renderedComp.value = comp
      renderedProps.value = cur.props
      overlayKey.value += 1
      if (isMobile.value) return
      nextTick(() => {
        const ev = { currentTarget: cur.anchor, target: cur.anchor } as unknown as Event
        popoverRef.value?.show(ev)
      })
    } else if (!isMobile.value) {
      popoverRef.value?.hide()
    }
  })

  function isOutsideClick(event: MouseEvent): boolean {
    const cur = mineActive.value
    if (!cur) return false
    const target = event.target as HTMLElement | null
    if (!target) return false
    const container = (popoverRef.value as unknown as { container?: HTMLElement } | null)?.container
    if (container && container.contains(target)) return false
    if (cur.anchor.contains(target)) return false
    if (target.closest(NESTED_OVERLAY_SELECTOR)) return false
    return true
  }

  function onDocumentMouseDown(event: MouseEvent) {
    if (isOutsideClick(event)) closeOverlay()
  }

  watch(
    () => !!mineActive.value && !isMobile.value && activated.value,
    on => {
      if (on) document.addEventListener('mousedown', onDocumentMouseDown, true)
      else document.removeEventListener('mousedown', onDocumentMouseDown, true)
    },
  )
  onBeforeUnmount(() => {
    document.removeEventListener('mousedown', onDocumentMouseDown, true)
  })

  function onPopoverHide() {
    if (mineActive.value) closeOverlay()
  }
  function onDrawerVisible(visible: boolean) {
    if (!visible && mineActive.value) closeOverlay()
  }

  return {
    // 对外暴露的 active 即「属于本 host 的 active」—— OverlayHost.vue 的 Drawer :visible 等据此自动归属。
    active: mineActive,
    isMobile,
    renderedComp,
    renderedProps,
    overlayKey,
    onPopoverHide,
    onDrawerVisible,
  }
}
