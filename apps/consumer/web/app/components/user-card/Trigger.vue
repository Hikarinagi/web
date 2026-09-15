<script setup lang="ts">
  import { Inline } from '@hina-ui/vue'
  import { useUserCard } from './composables/useUserCard'

  const props = defineProps<{
    userId: number | null | undefined
    showOnClick?: boolean
  }>()

  const { requestShow, showNow, abortShow, hideForAnchor } = useUserCard()
  const rootRef = useTemplateRef('rootRef')
  const anchor = computed(() => {
    const el = unrefElement(rootRef)
    return el instanceof HTMLElement ? el : null
  })

  function onEnter() {
    if (!props.userId || !anchor.value) return
    requestShow(props.userId, anchor.value)
  }
  function onLeave() {
    abortShow()
  }
  function onClick(event: Event) {
    if (!props.showOnClick || !props.userId || !anchor.value) return
    event.preventDefault()
    event.stopPropagation()
    showNow(props.userId, anchor.value)
  }
  function hideSelf() {
    if (anchor.value) hideForAnchor(anchor.value)
  }

  watch(
    () => props.userId,
    userId => {
      if (!userId) hideSelf()
    },
  )
  onBeforeUnmount(hideSelf)
</script>

<template>
  <Inline
    v-if="userId"
    ref="rootRef"
    as="span"
    gap="none"
    :wrap="false"
    class="inline-flex"
    @mouseenter="onEnter"
    @mouseleave="onLeave"
    @focusin="onEnter"
    @focusout="onLeave"
    @click="onClick"
  >
    <slot />
  </Inline>
  <slot v-else />
</template>
