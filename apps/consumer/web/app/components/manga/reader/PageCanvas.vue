<script setup lang="ts">
  import { RotateCw } from '@lucide/vue'
  import { cn } from '~/utils/cn'
  import type { PageLoadStatus } from './composables/usePageLoader'
  import type { ReaderPage } from './composables/useMangaReader'
  import type { MangaReaderFit } from './lib/settings'

  defineOptions({ name: 'MangaReaderPageCanvas' })

  const props = defineProps<{
    page: ReaderPage
    status: PageLoadStatus
    image: HTMLImageElement | null
    fit: MangaReaderFit
    double: boolean
  }>()

  const emit = defineEmits<{ retry: [page: number] }>()

  const canvas = ref<HTMLCanvasElement | null>(null)

  const sizeClass = computed(() => {
    switch (props.fit) {
      case 'screen':
        return props.double
          ? 'h-auto max-h-dvh w-auto max-w-[50%]'
          : 'h-auto max-h-dvh w-auto max-w-full'
      case 'width':
        return props.double ? 'h-auto w-1/2' : 'h-auto w-full'
      case 'height':
        return 'h-dvh w-auto'
      default:
        return ''
    }
  })

  const ratioStyle = computed(() => ({
    aspectRatio:
      props.page.width && props.page.height
        ? `${props.page.width} / ${props.page.height}`
        : '7 / 10',
  }))

  const placeholderClass = computed(() =>
    props.fit === 'width' || props.fit === 'original'
      ? props.double
        ? 'w-1/2'
        : 'w-full'
      : 'h-dvh max-w-full',
  )

  function draw() {
    const el = canvas.value
    const image = props.image
    if (!el || !image) return
    el.width = image.naturalWidth
    el.height = image.naturalHeight
    el.getContext('2d')?.drawImage(image, 0, 0)
  }

  watch([() => props.image, canvas], draw, { immediate: true, flush: 'post' })
</script>

<template>
  <canvas v-if="status === 'ready'" ref="canvas" :class="sizeClass" />
  <div v-else :class="cn('flex items-center justify-center', placeholderClass)" :style="ratioStyle">
    <Skeleton v-if="status !== 'error'" class="size-full! rounded-none! bg-white/5!" />
    <div v-else class="flex flex-col items-center gap-3 px-6 text-center">
      <p class="text-sm text-[#8b95a6]">这一页加载失败了</p>
      <Button
        size="small"
        severity="secondary"
        outlined
        label="重试"
        @click.stop="emit('retry', page.page_number)"
      >
        <template #icon><RotateCw :size="14" /></template>
      </Button>
    </div>
  </div>
</template>
