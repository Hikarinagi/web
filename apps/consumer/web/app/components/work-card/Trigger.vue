<script setup lang="ts">
  import { Inline } from '@hina-ui/vue'
  import type { WorkType } from '#shared/utils/work'
  import { useWorkCard } from './composables/useWorkCard'

  const props = defineProps<{
    workType: WorkType
    workId: number | null | undefined
    showOnClick?: boolean
  }>()

  const { requestShow, showNow, abortShow, hideForAnchor } = useWorkCard()
  const rootRef = useTemplateRef('rootRef')
  const noHover = useNoHover()
  const anchor = computed(() => {
    const el = unrefElement(rootRef)
    return el instanceof HTMLElement ? el : null
  })

  function onEnter() {
    if (!props.workId || !anchor.value) return
    requestShow(props.workType, props.workId, anchor.value)
  }
  function onLeave() {
    abortShow()
  }
  function onClick(event: Event) {
    if (!(props.showOnClick || noHover.value) || !props.workId || !anchor.value) return
    event.preventDefault()
    event.stopPropagation()
    showNow(props.workType, props.workId, anchor.value)
  }
  function onFocusIn(event: FocusEvent) {
    const target = event.target
    if (target instanceof Element && !target.matches(':focus-visible')) return
    onEnter()
  }
  function hideSelf() {
    if (anchor.value) hideForAnchor(anchor.value)
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
  <Inline
    ref="rootRef"
    as="span"
    gap="none"
    :wrap="false"
    class="inline"
    @mouseenter="onEnter"
    @mouseleave="onLeave"
    @focusin="onFocusIn"
    @focusout="onLeave"
    @click.capture="onClick"
  >
    <slot />
  </Inline>
</template>
