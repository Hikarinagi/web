<script setup lang="ts">
  import { Skeleton } from '@hina-ui/vue'
  import type { ReaderPage } from './composables/useMangaReader'
  import type { PageLoadStatus } from './composables/usePageLoader'

  defineOptions({ name: 'MangaReaderThumb' })

  const props = defineProps<{
    page: ReaderPage
    status: PageLoadStatus
    image: HTMLImageElement | null
  }>()

  const canvas = ref<HTMLCanvasElement | null>(null)
  const ratio = computed(() =>
    props.page.width && props.page.height ? `${props.page.width} / ${props.page.height}` : '7 / 10',
  )

  watch(
    [() => props.image, canvas],
    () => {
      const el = canvas.value
      const image = props.image
      if (!el || !image) return
      const scale = Math.min(1, 240 / image.naturalHeight)
      el.width = Math.round(image.naturalWidth * scale)
      el.height = Math.round(image.naturalHeight * scale)
      el.getContext('2d')?.drawImage(image, 0, 0, el.width, el.height)
    },
    { immediate: true, flush: 'post' },
  )
</script>

<template>
  <canvas
    v-if="status === 'ready'"
    ref="canvas"
    class="h-30 w-auto rounded-sm"
    :style="{ aspectRatio: ratio }"
  />
  <Skeleton v-else class="h-30 rounded-sm" :style="{ aspectRatio: ratio }" />
</template>
