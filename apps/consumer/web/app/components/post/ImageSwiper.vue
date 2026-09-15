<script setup lang="ts">
  import { Button, Center, IconButton, Inline, Stack, Tag, Text } from '@hina-ui/vue'
  import emblaCarouselVue from 'embla-carousel-vue'
  import { ChevronLeft, ChevronRight } from '@lucide/vue'
  import type { ComponentPublicInstance } from 'vue'
  import { cn } from '~/utils/cn'
  import type { PostPageData } from '~~/server/api/pages/posts/[id].get'

  const props = defineProps<{ covers: PostPageData['post']['covers'] }>()

  const [emblaRef, emblaApi] = emblaCarouselVue({ align: 'center', containScroll: 'trimSnaps' })
  function setViewport(el: Element | ComponentPublicInstance | null) {
    emblaRef.value = unrefElement(el as ComponentPublicInstance | null) as HTMLElement | undefined
  }
  const selected = ref(0)
  const canPrev = ref(false)
  const canNext = ref(props.covers.length > 1)
  const underfilled = computed(() => !canPrev.value && !canNext.value)

  function sync() {
    const api = emblaApi.value
    if (!api) return
    selected.value = api.selectedScrollSnap()
    canPrev.value = api.canScrollPrev()
    canNext.value = api.canScrollNext()
  }
  watch(emblaApi, api => {
    if (!api) return
    sync()
    api.on('select', sync).on('reInit', sync)
  })

  // slide 高固定 320(内联，绕开任何 class),宽 = 320 × 真实比例；缺尺寸兜底窄竖图。
  const slideStyle = (c: { media: { width: number | null; height: number | null } }) => ({
    height: '320px',
    width: `${c.media.width && c.media.height ? (320 * c.media.width) / c.media.height : 240}px`,
  })

  // 定位交给外层 div 壳；Button 带 ripple 会内联 position:relative,不能直接绝对定位它
  const navBtn = 'pointer-events-auto size-8 bg-surface/90 shadow-md'
</script>

<template>
  <Stack gap="none">
    <Stack gap="none" class="relative">
      <Stack :ref="setViewport" gap="none" class="overflow-hidden rounded-xl">
        <Inline gap="sm" :justify="underfilled ? 'center' : 'start'" :wrap="false">
          <HikariImage
            v-for="(c, i) in covers"
            :key="i"
            :src="c.media"
            :alt="`帖子配图 ${i + 1}`"
            class="shrink-0 rounded-xl"
            image-class="size-full object-cover"
            :style="slideStyle(c)"
            :processing="{ h: 320, q: 88 }"
            preview
          />
        </Inline>
      </Stack>

      <Tag
        variant="solid"
        tone="neutral"
        size="sm"
        pill
        class="pointer-events-none absolute top-3 right-3 z-1"
      >
        {{ selected + 1 }}/{{ covers.length }}
      </Tag>

      <Center
        :class="
          cn('pointer-events-none absolute inset-y-0 left-2 z-1 transition-opacity', {
            'opacity-0': !canPrev,
          })
        "
      >
        <IconButton
          label="上一张"
          :tooltip="false"
          pill
          :class="navBtn"
          @click="emblaApi?.scrollPrev()"
        >
          <ChevronLeft />
        </IconButton>
      </Center>
      <Center
        :class="
          cn('pointer-events-none absolute inset-y-0 right-2 z-1 transition-opacity', {
            'opacity-0': !canNext,
          })
        "
      >
        <IconButton
          label="下一张"
          :tooltip="false"
          pill
          :class="navBtn"
          @click="emblaApi?.scrollNext()"
        >
          <ChevronRight />
        </IconButton>
      </Center>
    </Stack>

    <Inline gap="xs" justify="center" class="mt-2 h-7">
      <Button
        v-for="(c, i) in covers.slice(0, 8)"
        :key="i"
        variant="ghost"
        tone="neutral"
        :aria-label="`第 ${i + 1} 张`"
        :class="cn('size-1.5 rounded-full p-0', selected === i ? 'bg-accent' : 'bg-line-strong')"
        @click="emblaApi?.scrollTo(i)"
      />
      <Text v-if="covers.length > 8" as="span" size="xs" tone="muted" class="ml-1">
        +{{ covers.length - 8 }}
      </Text>
    </Inline>
  </Stack>
</template>
