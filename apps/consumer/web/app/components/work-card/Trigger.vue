<script setup lang="ts">
  import type { WorkType } from '#shared/utils/work'
  import { useWorkCard } from './composables/useWorkCard'

  const props = defineProps<{
    workType: WorkType
    workId: number | null | undefined
    showOnClick?: boolean
  }>()

  const { requestShow, showNow, requestHide, hideForAnchor } = useWorkCard()
  const rootRef = useTemplateRef<HTMLElement>('rootRef')
  const noHover = useNoHover()

  const LONG_PRESS_MS = 500
  const LONG_PRESS_MOVE_PX = 8
  let longPressTimer: number | null = null
  let longPressFired = false
  let pressX = 0
  let pressY = 0

  function clearLongPress() {
    if (longPressTimer === null) return
    window.clearTimeout(longPressTimer)
    longPressTimer = null
  }

  function onPointerDown(event: PointerEvent) {
    if (!noHover.value || event.pointerType === 'mouse' || !props.workId || !rootRef.value) return
    longPressFired = false
    pressX = event.clientX
    pressY = event.clientY
    const anchor = rootRef.value
    const { workType, workId } = props
    longPressTimer = window.setTimeout(() => {
      longPressTimer = null
      longPressFired = true
      showNow(workType, workId, anchor)
    }, LONG_PRESS_MS)
  }

  function onPointerMove(event: PointerEvent) {
    if (longPressTimer === null) return
    if (
      Math.abs(event.clientX - pressX) > LONG_PRESS_MOVE_PX ||
      Math.abs(event.clientY - pressY) > LONG_PRESS_MOVE_PX
    ) {
      clearLongPress()
    }
  }

  function onEnter() {
    if (!props.workId || !rootRef.value) return
    requestShow(props.workType, props.workId, rootRef.value)
  }
  function onLeave() {
    requestHide()
  }
  function onClick(event: Event) {
    if (longPressFired) {
      longPressFired = false
      event.preventDefault()
      event.stopPropagation()
      return
    }
    if (!(props.showOnClick || noHover.value) || !props.workId || !rootRef.value) return
    event.preventDefault()
    event.stopPropagation()
    showNow(props.workType, props.workId, rootRef.value)
  }
  function hideSelf() {
    if (rootRef.value) hideForAnchor(rootRef.value)
  }

  watch(
    () => props.workId,
    workId => {
      if (!workId) hideSelf()
    },
  )
  onBeforeUnmount(() => {
    clearLongPress()
    hideSelf()
  })
</script>

<template>
  <span
    ref="rootRef"
    @mouseenter="onEnter"
    @mouseleave="onLeave"
    @focusin="onEnter"
    @focusout="onLeave"
    @click.capture="onClick"
    @pointerdown="onPointerDown"
    @pointermove="onPointerMove"
    @pointerup="clearLongPress"
    @pointercancel="clearLongPress"
  >
    <slot />
  </span>
</template>
