<script setup lang="ts">
  import { IconButton, Stack } from '@hina-ui/vue'
  import { ChevronLeft, ChevronRight } from '@lucide/vue'
  import { useMediaQuery } from '@vueuse/core'
  import type { LightNovelVolumeReaderPageData } from '~~/server/api/pages/light-novel-volumes/[id]/reader.get'
  import { useReader } from '~/features/light-novel-reader/context'
  import { cn } from '~/utils/cn'

  defineOptions({ name: 'LightNovelReaderStage' })

  defineProps<{ data: LightNovelVolumeReaderPageData }>()

  const { host, engine, settings, end, turn } = useReader()
  const { phase } = engine
  const pointer = useMediaQuery('(hover: hover) and (pointer: fine)')
  const hover = ref<'prev' | 'next' | null>(null)
  const arrows = computed(
    () =>
      pointer.value && settings.device.value.tapTurn && phase.value === 'ready' && !end.open.value,
  )

  function bind(element: unknown) {
    host.value = element instanceof HTMLElement ? element : null
  }

  function track(event: PointerEvent) {
    const element = host.value
    if (event.pointerType !== 'mouse' || !event.isTrusted || !element) return
    const rect = element.getBoundingClientRect()
    const ratio = (event.clientX - rect.left) / rect.width
    hover.value = ratio < 1 / 3 ? 'prev' : ratio > 2 / 3 ? 'next' : null
  }

  const edge = (side: 'prev' | 'next') =>
    cn(
      'absolute top-1/2 -translate-y-1/2 hn-transition focus-visible:opacity-100',
      side === 'prev' ? 'left-3' : 'right-3',
      hover.value === side ? 'opacity-100' : 'pointer-events-none opacity-0',
    )
</script>

<template>
  <Stack
    gap="none"
    class="relative min-h-0 flex-1 overflow-hidden"
    @pointermove="track"
    @pointerleave="hover = null"
  >
    <template v-if="data.reader">
      <div :ref="bind" class="absolute inset-0 touch-none" />
      <Transition
        enter-active-class="hn-transition"
        leave-active-class="hn-transition"
        enter-from-class="opacity-0"
        leave-to-class="opacity-0"
      >
        <LightNovelReaderStageOpening
          v-if="phase === 'prepare' || phase === 'download' || phase === 'layout'"
        />
        <LightNovelReaderStageFailure v-else-if="phase === 'failed'" :data="data" />
      </Transition>
      <LightNovelReaderEnd :data="data" />
      <LightNovelReaderStageResume />
      <LightNovelReaderStageReturn />
      <LightNovelReaderSearchBar />
      <LightNovelReaderStageFootnote />
      <LightNovelReaderStagePicture />
      <template v-if="arrows">
        <IconButton
          label="上一页"
          variant="soft"
          pill
          size="lg"
          :class="edge('prev')"
          @click="turn(false)"
        >
          <ChevronLeft aria-hidden="true" />
        </IconButton>
        <IconButton
          label="下一页"
          variant="soft"
          pill
          size="lg"
          :class="edge('next')"
          @click="turn(true)"
        >
          <ChevronRight aria-hidden="true" />
        </IconButton>
      </template>
    </template>
    <LightNovelReaderStageGuest v-else />
  </Stack>
</template>
