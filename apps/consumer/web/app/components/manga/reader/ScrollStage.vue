<script setup lang="ts">
  import { Stack } from '@hina-ui/vue'
  import { useScroll } from '@vueuse/core'
  import type { ReaderPage } from './composables/useMangaReader'
  import type { PageLoadStatus } from './composables/usePageLoader'

  defineOptions({ name: 'MangaReaderScrollStage' })

  const props = defineProps<{
    pages: ReaderPage[]
    startPage: number
    statusOf: (page: number) => PageLoadStatus
    imageOf: (page: number) => HTMLImageElement | null
  }>()
  const emit = defineEmits<{
    page: [page: number]
    end: [reached: boolean]
    tap: [event: MouseEvent]
    retryPage: [page: number]
  }>()

  const viewport = ref<HTMLElement | null>(null)
  const ending = ref<HTMLElement | null>(null)
  const { y } = useScroll(viewport, { throttle: 100 })

  function measure() {
    const root = viewport.value
    if (!root) return
    const middle = root.getBoundingClientRect().top + root.clientHeight / 2
    let current = props.pages[0]?.page_number ?? 1
    for (const element of root.querySelectorAll<HTMLElement>('[data-page]')) {
      if (element.getBoundingClientRect().top > middle) break
      current = Number(element.dataset.page)
    }
    emit('page', current)
    const end = ending.value?.getBoundingClientRect().top ?? Number.POSITIVE_INFINITY
    emit('end', end < root.getBoundingClientRect().bottom - root.clientHeight / 3)
  }

  function goToPage(page: number) {
    viewport.value
      ?.querySelector<HTMLElement>(`[data-page="${page}"]`)
      ?.scrollIntoView({ block: 'start' })
  }

  watch(y, measure)
  onMounted(() => {
    if (props.startPage > 1) goToPage(props.startPage)
    measure()
  })

  defineExpose({ goToPage })
</script>

<template>
  <div
    ref="viewport"
    class="absolute inset-0 overflow-y-auto overscroll-contain"
    @click="emit('tap', $event)"
  >
    <Stack gap="none" align="center" class="mx-auto w-full max-w-3xl">
      <MangaReaderPageCanvas
        v-for="page in pages"
        :key="page.page_number"
        :data-page="page.page_number"
        :page="page"
        :status="statusOf(page.page_number)"
        :image="imageOf(page.page_number)"
        fit="width"
        :double="false"
        @retry="number => emit('retryPage', number)"
      />
    </Stack>
    <div ref="ending" class="min-h-dvh">
      <slot name="interlude" />
    </div>
  </div>
</template>
