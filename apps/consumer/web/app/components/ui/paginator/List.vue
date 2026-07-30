<script setup lang="ts">
  import { motion } from 'motion-v'
  import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from '@lucide/vue'
  import { TRANSITION } from '~/lib/motion'
  import PaginatorGap from './Gap.vue'
  import PageButton from './Button.vue'
  import type { PageToken } from './pages'

  const props = defineProps<{
    busy?: boolean
    currentPage: number
    showEdges?: boolean
    tokens: PageToken[]
    totalPages: number
  }>()
  const emit = defineEmits<{ page: [value: number] }>()

  const mounted = useMounted()
  const row = useTemplateRef<HTMLElement>('row')
  const indicatorX = ref(0)
  const indicatorVisible = ref(false)

  function measure() {
    const rowEl = row.value
    if (!rowEl) return
    const active = rowEl.querySelector<HTMLElement>('[aria-current="page"]')
    if (!active) {
      indicatorVisible.value = false
      return
    }
    indicatorX.value = active.getBoundingClientRect().left - rowEl.getBoundingClientRect().left
    indicatorVisible.value = true
  }

  watch(
    () => [props.currentPage, props.tokens] as const,
    () => nextTick(measure),
  )
  onMounted(() => nextTick(measure))
  useResizeObserver(row, () => measure())

  const jumpSize = computed(() =>
    Math.max(1, props.tokens.filter((item): item is number => typeof item === 'number').length),
  )
  function gapDirection(item: Extract<PageToken, 'gap-start' | 'gap-end'>) {
    return item === 'gap-start' ? 'previous' : 'next'
  }
  function gapTarget(item: Extract<PageToken, 'gap-start' | 'gap-end'>, index: number) {
    const start = gapStart(index)
    const end = gapEnd(index)
    const raw =
      item === 'gap-start' ? props.currentPage - jumpSize.value : props.currentPage + jumpSize.value

    return Math.min(end, Math.max(start, raw))
  }
  function gapStart(index: number) {
    return Math.min(pageAfter(index) - 1, pageBefore(index) + 1)
  }
  function gapEnd(index: number) {
    return Math.max(pageBefore(index) + 1, pageAfter(index) - 1)
  }
  function pageBefore(index: number) {
    for (let i = index - 1; i >= 0; i -= 1) {
      const item = props.tokens[i]
      if (typeof item === 'number') return item
    }

    return 1
  }
  function pageAfter(index: number) {
    for (let i = index + 1; i < props.tokens.length; i += 1) {
      const item = props.tokens[i]
      if (typeof item === 'number') return item
    }

    return props.totalPages
  }
</script>

<template>
  <div ref="row" class="relative flex shrink-0 flex-nowrap items-center justify-center gap-1.5">
    <motion.div
      v-if="mounted && indicatorVisible"
      class="pointer-events-none absolute top-0 left-0 z-0 size-9 rounded-lg bg-primary shadow-sm"
      :initial="false"
      :animate="{ x: indicatorX }"
      :transition="TRANSITION"
    />
    <PageButton
      v-if="showEdges"
      hide-mobile
      :disabled="busy || currentPage <= 1"
      @click="emit('page', 1)"
    >
      <ChevronsLeft class="size-4" />
    </PageButton>
    <PageButton :disabled="busy || currentPage <= 1" @click="emit('page', currentPage - 1)">
      <ChevronLeft class="size-4" />
    </PageButton>

    <span v-for="(item, index) in tokens" :key="index" class="inline-flex size-9 shrink-0">
      <PaginatorGap
        v-if="item === 'gap-start' || item === 'gap-end'"
        :busy="busy"
        :direction="gapDirection(item)"
        :target="gapTarget(item, index)"
        @page="emit('page', $event)"
      />
      <PageButton
        v-else
        :active="item === currentPage"
        :mounted="mounted"
        :disabled="busy"
        @click="emit('page', item)"
      >
        {{ item }}
      </PageButton>
    </span>

    <PageButton
      :disabled="busy || currentPage >= totalPages"
      @click="emit('page', currentPage + 1)"
    >
      <ChevronRight class="size-4" />
    </PageButton>
    <PageButton
      v-if="showEdges"
      hide-mobile
      :disabled="busy || currentPage >= totalPages"
      @click="emit('page', totalPages)"
    >
      <ChevronsRight class="size-4" />
    </PageButton>
  </div>
</template>
