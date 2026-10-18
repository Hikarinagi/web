<script setup lang="ts">
  import { Button, Flex, Inline, ScrollArea, Stack } from '@hina-ui/vue'
  import { ChevronLeft, MessageSquare } from '@lucide/vue'
  import confetti from 'canvas-confetti'
  import type { LightNovelVolumeReaderPageData } from '~~/server/api/pages/light-novel-volumes/[id]/reader.get'
  import { usePostComposerDialog } from '~/components/feed/composer/composables/usePostComposerDialog'
  import { useReader } from '~/features/light-novel-reader/context'
  import { HIGHLIGHT_COLORS } from '~/features/light-novel-reader/highlights'
  import { getLightNovelTitle } from '~/utils/media/light-novel'

  defineOptions({ name: 'LightNovelReaderEnd' })

  const props = defineProps<{ data: LightNovelVolumeReaderPageData }>()

  const { end } = useReader()
  const { open } = end
  const composer = usePostComposerDialog()
  const root = useTemplateRef('root')
  const canvas = useTemplateRef('canvas')
  let fire: confetti.CreateTypes | null = null
  let celebrated = false

  useSwipe(() => root.value?.$el as HTMLElement | undefined, {
    onSwipeEnd: (_, direction) => {
      if (direction === 'right') end.close()
    },
  })

  watch(
    () => props.data.volume.id,
    () => (celebrated = false),
  )
  watch(open, shown => {
    if (shown) return
    fire?.reset()
    fire = null
  })

  function entered(element: Element) {
    if (element instanceof HTMLElement) element.focus({ preventScroll: true })
    if (celebrated || !canvas.value) return
    celebrated = true
    fire = confetti.create(canvas.value, { resize: true, disableForReducedMotion: true })
    const colors = HIGHLIGHT_COLORS.map(color => color.swatch)
    for (const [x, angle] of [
      [0, 60],
      [1, 120],
    ] as const)
      void fire({
        particleCount: 70,
        angle,
        spread: 60,
        startVelocity: 55,
        origin: { x, y: 1 },
        colors,
      })
  }

  function discuss() {
    const { id } = props.data.light_novel
    composer.discuss({
      work_type: 'LIGHT_NOVEL',
      id,
      title: getLightNovelTitle(props.data.light_novel),
    })
  }
</script>

<template>
  <Transition
    enter-active-class="hn-transition-base"
    leave-active-class="hn-transition-base"
    enter-from-class="translate-x-full"
    leave-to-class="translate-x-full"
    @after-enter="entered"
  >
    <Flex
      v-if="open"
      ref="root"
      as="section"
      aria-label="本卷读完"
      tabindex="-1"
      class="@container absolute inset-0 z-20 bg-surface outline-none"
    >
      <ScrollArea class="min-w-0 flex-1 basis-0">
        <Stack
          gap="lg"
          class="@container mx-auto w-full max-w-2xl px-6 pt-8 pb-[max(--spacing(8),env(safe-area-inset-bottom))] @3xl:px-12 @3xl:py-11"
        >
          <LightNovelReaderEndSummary :data="data" />
          <LightNovelReaderEndNext :data="data" />
          <Inline gap="sm">
            <Button variant="outline" tone="neutral" @click="discuss">
              <template #icon><MessageSquare aria-hidden="true" /></template>
              发布讨论帖
            </Button>
            <Button variant="outline" tone="neutral" @click="end.close()">
              <template #icon><ChevronLeft aria-hidden="true" /></template>
              返回最后一页
            </Button>
          </Inline>
        </Stack>
      </ScrollArea>
      <LightNovelReaderEndNotes />
      <canvas
        ref="canvas"
        aria-hidden="true"
        class="pointer-events-none absolute inset-0 size-full"
      />
    </Flex>
  </Transition>
</template>
