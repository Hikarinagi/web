<script setup lang="ts">
  import { Button, Center, Skeleton, Stack, Text } from '@hina-ui/vue'
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
          ? 'h-auto max-h-dvh w-auto max-w-1/2'
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
  <Center v-else :class="cn(placeholderClass)" :style="ratioStyle">
    <Skeleton v-if="status !== 'error'" class="size-full rounded-none bg-neutral-0/5" />
    <Stack v-else align="center" gap="sm" class="px-6 text-center">
      <Text size="sm" class="text-neutral-400">这一页加载失败了</Text>
      <Button
        variant="outline"
        tone="neutral"
        size="sm"
        @click.stop="emit('retry', page.page_number)"
      >
        <template #icon><RotateCw /></template>
        重试
      </Button>
    </Stack>
  </Center>
</template>
