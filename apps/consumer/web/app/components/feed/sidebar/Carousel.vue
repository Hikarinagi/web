<script setup lang="ts">
  import { ChevronLeft, ChevronRight } from '@lucide/vue'
  import emblaCarouselVue from 'embla-carousel-vue'
  import type { FeedSidebarData } from '~~/server/utils/feed-sidebar'

  const props = defineProps<{ carousel: NonNullable<FeedSidebarData['carousel']> }>()

  const items = computed(() => props.carousel.items)
  const multi = computed(() => items.value.length > 1)
  const dotsShown = computed(() => props.carousel.show_dots && multi.value)

  const [emblaRef, emblaApi] = emblaCarouselVue({ loop: true, align: 'center' })
  const selected = ref(0)

  function sync() {
    const api = emblaApi.value
    if (!api) return
    selected.value = api.selectedScrollSnap()
  }
  watch(emblaApi, api => {
    if (!api) return
    sync()
    api.on('select', sync).on('reInit', sync)
  })

  const root = ref<HTMLElement>()
  const hovered = useElementHover(root)
  const reduced = usePreferredReducedMotion()
  const { pause, resume } = useIntervalFn(
    () => emblaApi.value?.scrollNext(),
    () => props.carousel.interval,
    { immediate: false },
  )
  watchEffect(() => {
    if (props.carousel.autoplay && multi.value && !hovered.value && reduced.value !== 'reduce') {
      resume()
    } else {
      pause()
    }
  })

  const navBtn =
    'pointer-events-auto grid size-7 place-items-center rounded-full bg-white/85 text-surface-700 shadow-md transition hover:bg-white dark:bg-surface-800/85 dark:text-surface-100 dark:hover:bg-surface-700'
</script>

<template>
  <div ref="root" class="relative">
    <div ref="emblaRef" class="aspect-[16/9] overflow-hidden rounded-2xl border border-surface">
      <div class="flex h-full">
        <NuxtLink
          v-for="item in items"
          :key="item.id"
          :to="item.link"
          :target="item.open_in_new ? '_blank' : undefined"
          class="relative block h-full min-w-0 flex-[0_0_100%]"
        >
          <HikariImage
            :src="item.image"
            :alt="item.title"
            class="size-full"
            image-class="size-full object-cover"
            :processing="{ w: 720, q: 85 }"
            :skeleton="false"
          />
          <div
            class="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/35 to-transparent pt-10 pb-2.5 pl-3"
            :class="dotsShown ? 'pr-12' : 'pr-3'"
          >
            <p class="line-clamp-1 text-sm font-semibold text-white">{{ item.title }}</p>
            <p v-if="item.description" class="line-clamp-1 text-xs text-white/85">
              {{ item.description }}
            </p>
          </div>
        </NuxtLink>
      </div>
    </div>

    <template v-if="carousel.show_arrows && multi">
      <div
        class="pointer-events-none absolute inset-y-0 left-2 grid place-items-center transition-opacity duration-200"
        :class="hovered ? 'opacity-100' : 'opacity-0'"
      >
        <Button unstyled aria-label="上一张" :class="navBtn" @click="emblaApi?.scrollPrev()">
          <ChevronLeft :size="16" />
        </Button>
      </div>
      <div
        class="pointer-events-none absolute inset-y-0 right-2 grid place-items-center transition-opacity duration-200"
        :class="hovered ? 'opacity-100' : 'opacity-0'"
      >
        <Button unstyled aria-label="下一张" :class="navBtn" @click="emblaApi?.scrollNext()">
          <ChevronRight :size="16" />
        </Button>
      </div>
    </template>

    <div
      v-if="dotsShown"
      class="pointer-events-none absolute right-3 bottom-3 flex items-center gap-1.5"
    >
      <Button
        v-for="(item, i) in items"
        :key="item.id"
        unstyled
        :aria-label="`第 ${i + 1} 张`"
        class="pointer-events-auto size-1.5 cursor-pointer rounded-full shadow transition-colors"
        :class="selected === i ? 'bg-white' : 'bg-white/50'"
        @click="emblaApi?.scrollTo(i)"
      />
    </div>
  </div>
</template>
