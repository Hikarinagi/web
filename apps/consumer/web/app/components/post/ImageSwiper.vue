<script setup lang="ts">
  import emblaCarouselVue from 'embla-carousel-vue'
  import { ChevronLeft, ChevronRight } from '@lucide/vue'
  import type { PostPageData } from '~~/server/api/pages/posts/[id].get'

  const props = defineProps<{ covers: PostPageData['post']['covers'] }>()

  const [emblaRef, emblaApi] = emblaCarouselVue({ align: 'center', containScroll: 'trimSnaps' })
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

  // slide 高固定 320(内联,绕开任何 class),宽 = 320 × 真实比例;缺尺寸兜底窄竖图。
  const slideStyle = (c: { media: { width: number | null; height: number | null } }) => ({
    height: '320px',
    width: `${c.media.width && c.media.height ? (320 * c.media.width) / c.media.height : 240}px`,
  })

  // chevron 的可见圆形按钮样式(定位交给外层 div 壳;Button 带 ripple 会内联 position:relative,不能直接绝对定位它)
  const navBtn =
    'pointer-events-auto grid size-8 place-items-center rounded-full bg-white/90 text-surface-700 shadow-md transition hover:bg-white dark:bg-surface-800/90 dark:text-surface-200 dark:hover:bg-surface-700'
</script>

<template>
  <div>
    <div class="relative">
      <div ref="emblaRef" class="overflow-hidden rounded-xl">
        <div class="flex gap-2" :class="{ 'justify-center': underfilled }">
          <div
            v-for="(c, i) in covers"
            :key="i"
            class="shrink-0 overflow-hidden rounded-xl"
            :style="slideStyle(c)"
          >
            <HikariImage
              :src="c.media.src"
              alt=""
              class="size-full"
              image-class="size-full object-cover"
              :processing="{ h: 320, q: 88 }"
              preview
            />
          </div>
        </div>
      </div>

      <span
        class="pointer-events-none absolute top-3 right-3 z-1 rounded-full bg-black/55 px-2 py-0.5 text-xs font-medium text-white"
      >
        {{ selected + 1 }}/{{ covers.length }}
      </span>

      <div
        class="pointer-events-none absolute inset-y-0 left-2 z-1 grid place-items-center transition-opacity"
        :class="{ 'opacity-0': !canPrev }"
      >
        <Button unstyled aria-label="上一张" :class="navBtn" @click="emblaApi?.scrollPrev()">
          <ChevronLeft :size="18" />
        </Button>
      </div>
      <div
        class="pointer-events-none absolute inset-y-0 right-2 z-1 grid place-items-center transition-opacity"
        :class="{ 'opacity-0': !canNext }"
      >
        <Button unstyled aria-label="下一张" :class="navBtn" @click="emblaApi?.scrollNext()">
          <ChevronRight :size="18" />
        </Button>
      </div>
    </div>

    <div class="mt-2 flex h-7 items-center justify-center gap-1.5">
      <Button
        v-for="(c, i) in covers.slice(0, 8)"
        :key="i"
        unstyled
        :aria-label="`第 ${i + 1} 张`"
        class="size-1.5 cursor-pointer rounded-full transition-colors"
        :class="selected === i ? 'bg-primary' : 'bg-surface-300 dark:bg-surface-700'"
        @click="emblaApi?.scrollTo(i)"
      />
      <span v-if="covers.length > 8" class="ml-1 text-[11px] text-muted-color">
        +{{ covers.length - 8 }}
      </span>
    </div>
  </div>
</template>
