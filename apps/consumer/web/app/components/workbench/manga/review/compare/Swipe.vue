<script setup lang="ts">
  import { Empty, IconButton, Inline, Stack, Tag, Text } from '@hina-ui/vue'
  import { ChevronsLeftRight } from '@lucide/vue'
  import { useMangaReview } from '~/features/workbench/manga/review/context'
  import { pageFacts, pageSrc } from '~/features/workbench/manga/review/pages'
  import { useViewport } from '~/features/workbench/manga/review/useViewport'

  const { state, baseline } = useMangaReview()
  const row = computed(() => state.current.value)
  const base = computed(() => state.baselinePage.value)
  const container = useTemplateRef<HTMLDivElement>('container')
  const frame = useTemplateRef<HTMLDivElement>('frame')
  const split = ref(0.5)
  const { box, onPointerDown, onPointerMove, onPointerUp } = useViewport({
    container,
    frame,
    size: () => ({ width: row.value?.page.width ?? 0, height: row.value?.page.height ?? 0 }),
    zoom: () => state.zoom.value,
    center: state.center,
    drawing: () => false,
    onDraw: () => {},
  })

  let dragging = false
  function onKnobDown(event: PointerEvent) {
    dragging = true
    ;(event.currentTarget as Element).setPointerCapture(event.pointerId)
    event.stopPropagation()
  }
  function onKnobMove(event: PointerEvent) {
    const rect = frame.value?.getBoundingClientRect()
    if (!dragging || !rect?.width) return
    split.value = Math.min(Math.max((event.clientX - rect.left) / rect.width, 0), 1)
  }
  function onKnobKey(event: KeyboardEvent) {
    const delta = { ArrowLeft: -0.05, ArrowRight: 0.05, Home: -1, End: 1 }[event.key]
    if (delta === undefined) return
    event.preventDefault()
    split.value = Math.min(Math.max(split.value + delta, 0), 1)
  }
</script>

<template>
  <Stack gap="none" class="min-h-0">
    <Inline
      gap="md"
      align="center"
      :wrap="false"
      class="h-11 shrink-0 border-b border-line bg-surface px-4"
    >
      <Text size="sm" weight="medium">现有版本</Text>
      <Text v-if="base" size="sm" class="tabular-nums">
        第 {{ base.page_number }} / {{ baseline.length }} 页
      </Text>
      <Text v-for="fact in base ? pageFacts(base) : []" :key="fact" size="sm" tone="muted">
        {{ fact }}
      </Text>
      <Text size="sm" weight="medium" class="ml-auto">新上传</Text>
      <Text v-if="row" size="sm" class="tabular-nums">
        第 {{ row.number }} / {{ state.rows.value.length }} 页
      </Text>
      <Text v-for="fact in row ? pageFacts(row.page) : []" :key="fact" size="sm" tone="muted">
        {{ fact }}
      </Text>
    </Inline>
    <Empty
      v-if="!base || !row"
      size="sm"
      :icon="false"
      title="现有版本没有对应页"
      class="min-h-0 flex-1 bg-inset"
    />
    <div
      v-else
      ref="container"
      class="relative min-h-0 flex-1 touch-none overflow-hidden bg-inset select-none"
      @pointerdown="onPointerDown"
      @pointermove="onPointerMove"
      @pointerup="onPointerUp"
      @pointercancel="onPointerUp"
    >
      <div
        ref="frame"
        class="absolute"
        :style="{
          left: `${box.left}px`,
          top: `${box.top}px`,
          width: `${box.width}px`,
          height: `${box.height}px`,
        }"
      >
        <img
          :src="base.url"
          :alt="`现有版本，第 ${base.page_number} 页`"
          draggable="false"
          class="absolute inset-0 size-full object-contain"
        />
        <img
          :src="pageSrc(row.page)"
          :alt="`新上传，第 ${row.number} 页`"
          draggable="false"
          class="absolute inset-0 size-full object-contain"
          :style="{ clipPath: `inset(0 0 0 ${split * 100}%)` }"
        />
        <div
          class="absolute inset-y-0 w-0.5 -translate-x-1/2 bg-accent"
          :style="{ left: `${split * 100}%` }"
        >
          <IconButton
            label="拖动分隔线以对比两个版本"
            role="slider"
            aria-valuemin="0"
            aria-valuemax="100"
            :aria-valuenow="Math.round(split * 100)"
            size="sm"
            variant="solid"
            class="absolute top-1/2 left-1/2 -translate-1/2 cursor-ew-resize rounded-full shadow-md"
            @pointerdown="onKnobDown"
            @pointermove="onKnobMove"
            @pointerup="dragging = false"
            @pointercancel="dragging = false"
            @keydown="onKnobKey"
          >
            <ChevronsLeftRight />
          </IconButton>
        </div>
      </div>
      <Tag size="sm" variant="soft" tone="neutral" class="absolute top-3 left-3">现有版本</Tag>
      <Tag size="sm" variant="soft" tone="neutral" class="absolute top-3 right-3">新上传</Tag>
    </div>
  </Stack>
</template>
