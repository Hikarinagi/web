<script setup lang="ts" generic="TData">
  import { autoUpdate, flip, offset, shift, useFloating } from '@floating-ui/vue'
  import { AnimatePresence, motion } from 'motion-v'
  import type { VNodeChild } from 'vue'
  import type { HoverCardController, HoverCardOpenState } from './composables/useHoverCard'

  type OpenState = HoverCardOpenState<TData>

  const props = defineProps<{ controller: HoverCardController<TData> }>()
  defineSlots<{ default(props: { data: TData | null; loading: boolean }): VNodeChild }>()

  const { state, getCached, fetchData, cancelHide, requestHide, hideNow } = props.controller

  const hostRef = useTemplateRef<HTMLElement>('hostRef')
  const activeState = ref<OpenState | null>(null)
  const floatingState = ref<OpenState | null>(null)
  const pendingState = ref<OpenState | null>(null)
  const data = shallowRef<TData | null>(null)
  const loading = ref(false)

  const route = useRoute()
  watch(
    () => route.fullPath,
    () => {
      hideNow()
      activeState.value = null
      floatingState.value = null
      pendingState.value = null
    },
  )

  const anchor = computed(() => floatingState.value?.anchor ?? null)
  const { floatingStyles } = useFloating(anchor, hostRef, {
    placement: 'bottom-start',
    middleware: [offset(8), flip(), shift({ padding: 8 })],
    whileElementsMounted: autoUpdate,
  })

  const followEnabled = ref(false)
  const targetKey = computed(() => floatingState.value?.key ?? null)
  watch(targetKey, key => {
    followEnabled.value = false
    if (!key) return
    requestAnimationFrame(() =>
      requestAnimationFrame(() => {
        followEnabled.value = true
      }),
    )
  })

  const hostStyle = computed(() => ({
    ...floatingStyles.value,
    transition: followEnabled.value ? 'transform 150ms ease-out' : 'none',
  }))

  watch(state, newState => {
    if (newState === null) {
      pendingState.value = null
      activeState.value = null
      return
    }

    if (activeState.value === null) {
      if (floatingState.value) {
        pendingState.value = newState
        return
      }
      floatingState.value = newState
      activeState.value = newState
      return
    }

    if (activeState.value.key === newState.key) {
      floatingState.value = newState
      activeState.value = newState
      return
    }

    pendingState.value = newState
    activeState.value = null
  })

  watch(activeState, async newState => {
    if (newState === null) return
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

  function handleExitComplete() {
    if (pendingState.value) {
      const nextState = pendingState.value
      pendingState.value = null
      floatingState.value = nextState
      activeState.value = nextState
      return
    }

    if (state.value) {
      floatingState.value = state.value
      activeState.value = state.value
      return
    }

    floatingState.value = null
  }
</script>

<template>
  <Teleport to="body">
    <div v-if="floatingState" ref="hostRef" class="pointer-events-none z-1000" :style="hostStyle">
      <AnimatePresence mode="wait" :on-exit-complete="handleExitComplete">
        <motion.div
          v-if="activeState"
          :key="activeState.key"
          :initial="{ opacity: 0, scale: 0.97, y: 4 }"
          :animate="{ opacity: 1, scale: 1, y: 0 }"
          :exit="{ opacity: 0, scale: 0.97, y: 4 }"
          class="pointer-events-auto origin-top-left"
          @mouseenter="cancelHide"
          @mouseleave="requestHide"
        >
          <slot :data="data" :loading="loading" />
        </motion.div>
      </AnimatePresence>
    </div>
  </Teleport>
</template>
