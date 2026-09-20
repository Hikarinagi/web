<script setup lang="ts">
  import { useUserCard } from './composables/useUserCard'

  const props = defineProps<{
    userId: number | null | undefined
    showOnClick?: boolean
  }>()

  const { requestShow, showNow, requestHide, hideForAnchor } = useUserCard()
  const rootRef = useTemplateRef<HTMLElement>('rootRef')

  function onEnter() {
    if (!props.userId || !rootRef.value) return
    requestShow(props.userId, rootRef.value)
  }
  function onLeave() {
    requestHide()
  }
  function onClick(event: Event) {
    if (!props.showOnClick || !props.userId || !rootRef.value) return
    event.preventDefault()
    event.stopPropagation()
    showNow(props.userId, rootRef.value)
  }
  function hideSelf() {
    if (rootRef.value) hideForAnchor(rootRef.value)
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
  <span
    v-if="userId"
    ref="rootRef"
    class="inline-flex"
    @mouseenter="onEnter"
    @mouseleave="onLeave"
    @focusin="onEnter"
    @focusout="onLeave"
    @click="onClick"
  >
    <slot />
  </span>
  <slot v-else />
</template>
