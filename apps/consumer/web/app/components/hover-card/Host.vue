<script setup lang="ts" generic="TData">
  import { Flex, HoverCard } from '@hina-ui/vue'
  import type { VNodeChild } from 'vue'
  import type { HoverCardController } from './composables/useHoverCard'

  const props = defineProps<{ controller: HoverCardController<TData> }>()
  defineSlots<{ default(props: { data: TData | null; loading: boolean }): VNodeChild }>()

  const { state, getCached, fetchData, hideNow } = props.controller

  const data = shallowRef<TData | null>(null)
  const loading = ref(false)

  const route = useRoute()
  watch(() => route.fullPath, hideNow)

  const open = computed({
    get: () => state.value !== null,
    set: value => {
      if (!value) hideNow()
    },
  })
  const anchor = shallowRef<HTMLElement | null>(null)
  const moving = ref(false)

  watch(state, async (newState, oldState) => {
    if (newState === null) {
      moving.value = false
      return
    }
    moving.value = oldState !== null && anchor.value !== newState.anchor
    anchor.value = newState.anchor
    const cached = getCached(newState.key)
    if (cached) {
      data.value = cached
      loading.value = false
      return
    }
    data.value = null
    loading.value = true
    const result = await fetchData(newState)
    if (state.value?.key === newState.key) {
      data.value = result
      loading.value = false
    }
  })
</script>

<template>
  <HoverCard
    v-model:open="open"
    :anchor="anchor"
    side="bottom"
    align="start"
    :padded="false"
    class="w-80"
    :positioner-class="
      open && moving ? 'hn-transition-base motion-reduce:transition-none' : undefined
    "
  >
    <template #content>
      <Flex direction="col" gap="none">
        <slot :data="data" :loading="loading" />
      </Flex>
    </template>
  </HoverCard>
</template>
