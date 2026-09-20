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

  function onEnter() {
    if (!props.workId || !rootRef.value) return
    requestShow(props.workType, props.workId, rootRef.value)
  }
  function onLeave() {
    requestHide()
  }
  function onClick(event: Event) {
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
  onBeforeUnmount(hideSelf)
</script>

<template>
  <span
    ref="rootRef"
    @mouseenter="onEnter"
    @mouseleave="onLeave"
    @focusin="onEnter"
    @focusout="onLeave"
    @click.capture="onClick"
  >
    <slot />
  </span>
</template>
