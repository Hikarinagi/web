<script setup lang="ts">
  import { cn } from '~/utils/cn'
  import type { PageLoadStatus } from './composables/usePageLoader'
  import type { ReaderSpread } from './composables/useMangaReader'
  import type { MangaReaderFit } from './lib/settings'
  import { useStageGestures } from './composables/useStageGestures'
  import { useStageZoom } from './composables/useStageZoom'

  defineOptions({ name: 'MangaReaderStage' })

  const props = defineProps<{
    spreads: ReaderSpread[]
    current: number
    fit: MangaReaderFit
    canGoNext: boolean
    canGoPrevious: boolean
    animate: boolean
    statusOf: (page: number) => PageLoadStatus
    imageOf: (page: number) => HTMLImageElement | null
  }>()

  const emit = defineEmits<{
    next: []
    previous: []
    tap: [event: PointerEvent]
    retryPage: [page: number]
    pointerMove: [event: PointerEvent]
  }>()

  const viewport = ref<HTMLElement | null>(null)
  const scrollers = new Map<number, HTMLElement>()
  const contents = new Map<number, HTMLElement>()

  function setScroller(index: number, el: Element | null) {
    if (el instanceof HTMLElement) scrollers.set(index, el)
    else scrollers.delete(index)
  }

  function setContent(index: number, el: Element | null) {
    if (el instanceof HTMLElement) contents.set(index, el)
    else contents.delete(index)
  }

  /** Only the whole-page layout can be panned; the rest scroll natively. */
  const zoomable = computed(() => props.fit === 'screen')

  const zoom = useStageZoom({
    viewport,
    content: () => contents.get(props.current) ?? null,
    enabled: () => zoomable.value,
  })

  const gestures = useStageGestures({
    viewport,
    canGoNext: () => props.canGoNext,
    canGoPrevious: () => props.canGoPrevious,
    animate: () => props.animate,
    zoomable: () => zoomable.value,
    zoom,
    next: () => emit('next'),
    previous: () => emit('previous'),
    onTap: event => emit('tap', event),
  })

  const windowSpreads = computed(() =>
    props.spreads.filter(spread => Math.abs(spread.index - props.current) <= 1),
  )

  const scrollerClass = computed(() => {
    switch (props.fit) {
      case 'width':
        return 'overflow-y-auto overflow-x-hidden overscroll-contain'
      case 'original':
        return 'overflow-auto overscroll-contain'
      default:
        return 'overflow-hidden'
    }
  })

  const outerClass = computed(() => {
    switch (props.fit) {
      case 'width':
        return 'flex min-h-full w-full'
      case 'original':
        return 'flex min-h-full min-w-full'
      default:
        return 'flex h-full w-full'
    }
  })

  const innerClass = computed(() => {
    switch (props.fit) {
      case 'width':
        return 'm-auto flex w-full flex-row-reverse items-center'
      case 'original':
        return 'm-auto flex flex-row-reverse items-center'
      default:
        return 'm-auto flex max-w-full flex-row-reverse items-center justify-center'
    }
  })

  watch(
    () => props.current,
    () => {
      const scroller = scrollers.get(props.current)
      if (scroller) scroller.scrollTop = 0
      zoom.reset()
    },
    { flush: 'post' },
  )

  watch(zoomable, () => zoom.reset())

  function slotStyle(index: number) {
    return { transform: `translateX(${(props.current - index) * 100}%)` }
  }
</script>

<template>
  <div
    ref="viewport"
    class="absolute inset-0 overflow-hidden"
    :style="{ touchAction: zoomable ? 'none' : 'pan-y' }"
    @pointerdown="gestures.onPointerDown"
    @pointermove="
      (event: PointerEvent) => {
        gestures.onPointerMove(event)
        emit('pointerMove', event)
      }
    "
    @pointerup="gestures.onPointerUp"
    @pointercancel="gestures.onPointerCancel"
  >
    <div class="absolute inset-0" :style="gestures.trackStyle.value">
      <div
        v-for="spread in windowSpreads"
        :key="spread.index"
        class="absolute inset-0"
        :style="slotStyle(spread.index)"
      >
        <div v-if="!spread.pages.length" class="h-full w-full">
          <slot name="interlude" />
        </div>
        <div
          v-else
          :ref="el => setScroller(spread.index, el as Element | null)"
          :class="cn('h-full w-full', scrollerClass)"
          :style="spread.index === current ? zoom.style.value : undefined"
        >
          <div :class="outerClass">
            <div :ref="el => setContent(spread.index, el as Element | null)" :class="innerClass">
              <MangaReaderPageCanvas
                v-for="page in spread.pages"
                :key="page.page_number"
                :page="page"
                :status="statusOf(page.page_number)"
                :image="imageOf(page.page_number)"
                :fit="fit"
                :double="spread.pages.length > 1"
                @retry="pageNumber => emit('retryPage', pageNumber)"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
